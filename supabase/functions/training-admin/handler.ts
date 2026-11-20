type Options = { url: string; secret: string; fetch?: typeof fetch; now?: () => number };
class Failure extends Error { status: number; constructor(status: number, message: string) { super(message); this.status = status; } }
const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, "0")).join("");
const statusValues = ["pending", "confirmed", "cancelled"];
const topics = ["network", "profile", "interview"];
function text(x: unknown, max: number): string {
  if (typeof x !== "string" || x.length > max) throw new Failure(400, "Valeur invalide.");
  return x.trim();
}
function id(x: unknown): number {
  const n = Number(x);
  if (!Number.isSafeInteger(n) || n < 1) throw new Failure(400, "Identifiant invalide.");
  return n;
}
function decoded(s: string): Uint8Array {
  try { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
  catch { throw new Failure(400, "Encodage invalide."); }
}
function encoded(data: Uint8Array): string {
  let s = "";
  for (let i = 0; i < data.length; i += 8192) s += String.fromCharCode(...data.subarray(i, i + 8192));
  return btoa(s);
}
async function limitedBody(req: Request): Promise<string> {
  if (!req.body) throw new Failure(400, "Requête vide.");
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = []; let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 8 * 1024 * 1024) { await reader.cancel(); throw new Failure(413, "Requête trop volumineuse."); }
    chunks.push(value);
  }
  const all = new Uint8Array(length); let cursor = 0;
  for (const chunk of chunks) { all.set(chunk, cursor); cursor += chunk.length; }
  return new TextDecoder("utf-8", { fatal: true }).decode(all);
}
export function createHandler(options: Options): (req: Request) => Promise<Response> {
  const send = options.fetch ?? fetch;
  const now = options.now ?? (() => Math.floor(Date.now() / 1000));
  const headers: Record<string,string> = { apikey: options.secret };
  if (!options.secret.startsWith("sb_secret_")) headers.Authorization = "Bearer " + options.secret;
  async function api(path: string, method = "GET", value?: unknown, extra: Record<string,string> = {}): Promise<Response> {
    const response = await send(options.url + path, {
      method, headers: { ...headers, ...extra, ...(value === undefined ? {} : { "Content-Type": "application/json" }) },
      body: value === undefined ? undefined : JSON.stringify(value)
    });
    if (!response.ok) {
      if (response.status === 409) throw new Failure(409, "Une inscription existe déjà pour cet e-mail.");
      if (response.status === 404) throw new Failure(404, "Élément introuvable.");
      throw new Failure(502, "Le stockage des inscriptions est momentanément indisponible.");
    }
    return response;
  }
  const db = async (path: string, method = "GET", value?: unknown, extra?: Record<string,string>) =>
    (await api("/rest/v1/" + path, method, value, extra)).json();
  const filePath = (name: string) => {
    if (!/^[a-f0-9]{64}\.pdf$/.test(name)) throw new Failure(400, "CV invalide.");
    return "/storage/v1/object/ari-training-cvs/" + name;
  };
  async function removeCV(name: string): Promise<void> {
    filePath(name);
    const response = await send(options.url + "/storage/v1/object/ari-training-cvs", {
      method: "DELETE", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [name] })
    });
    if (!response.ok && response.status !== 404) throw new Failure(502, "La suppression du CV a échoué.");
  }
  async function one(registrationId: unknown): Promise<Record<string,unknown>> {
    const rows = await db("ari_training_registrations?event_id=eq.1&id=eq." + id(registrationId) + "&select=*");
    if (!rows.length) throw new Failure(404, "Inscription introuvable.");
    return rows[0];
  }
  return async (req: Request): Promise<Response> => {
    try {
      if (req.method !== "POST") throw new Failure(405, "Méthode non autorisée.");
      const keyId = req.headers.get("X-ARI-Key") ?? "";
      const timestamp = req.headers.get("X-ARI-Time") ?? "";
      const nonce = req.headers.get("X-ARI-Nonce") ?? "";
      const signature = req.headers.get("X-ARI-Signature") ?? "";
      if (!/^[a-f0-9]{64}$/.test(keyId) || !/^[0-9]{10}$/.test(timestamp)
          || Math.abs(now() - Number(timestamp)) > 90 || !/^[a-f0-9]{32}$/.test(nonce)
          || signature.length > 1024 || signature.length < 100) throw new Failure(401, "Authentification requise.");
      const raw = await limitedBody(req);
      const keys = await db("ari_training_admin_keys?key_id=eq." + keyId + "&enabled=eq.true&select=public_key");
      if (keys.length !== 1) throw new Failure(401, "Serveur non autorisé.");
      const pem = String(keys[0].public_key).replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, "");
      let valid = false;
      try {
        const key = await crypto.subtle.importKey("spki", decoded(pem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
        const digest = hex(await crypto.subtle.digest("SHA-256", encoder.encode(raw)));
        valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decoded(signature), encoder.encode(timestamp + "\n" + nonce + "\n" + digest));
      } catch { /* An invalid key or signature is always an authentication failure. */ }
      if (!valid) throw new Failure(401, "Signature invalide.");
      // A signed request can be used only once. Cleanup is restricted to expired nonces.
      await api("/rest/v1/ari_training_nonces?created_at=lt." + encodeURIComponent(new Date((now() - 300) * 1000).toISOString()), "DELETE");
      try { await api("/rest/v1/ari_training_nonces", "POST", { key_id: keyId, nonce }); }
      catch (e) { if (e instanceof Failure && e.status === 409) throw new Failure(401, "Requête déjà utilisée."); throw e; }
      let input: Record<string,unknown>;
      try { input = JSON.parse(raw); } catch { throw new Failure(400, "Requête invalide."); }
      if (!input || typeof input !== "object" || Array.isArray(input)) throw new Failure(400, "Requête invalide.");
      let data: unknown;
      switch (input.action) {
        case "health": data = { ok: true }; break;
        case "info": {
          const event = (await db("ari_training_events?id=eq.1&select=title,event_date,start_time,duration_minutes,location,format_mode"))[0];
          if (!event) throw new Failure(503, "Formation indisponible.");
          data = event; break;
        }
        case "rate": {
          const fingerprint = text(input.fingerprint, 64);
          if (!/^[a-f0-9]{64}$/.test(fingerprint)) throw new Failure(400, "Requête invalide.");
          data = { allowed: await db("rpc/ari_training_rate_limit", "POST", { p_fingerprint: fingerprint }) };
          break;
        }
        case "summary": {
          const event = (await db("ari_training_events?id=eq.1&select=*"))[0];
          if (!event) throw new Failure(503, "Formation indisponible.");
          const counts: Record<string,number> = {};
          await Promise.all(statusValues.map(async status => {
            const r = await api("/rest/v1/ari_training_registrations?event_id=eq.1&status=eq." + status + "&select=id", "HEAD", undefined, { Prefer: "count=exact" });
            const total = Number(r.headers.get("content-range")?.split("/").at(-1));
            if (!Number.isFinite(total)) throw new Failure(502, "Compteur indisponible.");
            counts[status] = total;
          }));
          data = { event, counts }; break;
        }
        case "list": {
          const q = text(input.q ?? "", 160);
          const status = text(input.status ?? "", 16);
          if (status !== "" && !statusValues.includes(status)) throw new Failure(400, "Statut invalide.");
          const offset = Number(input.offset ?? 0);
          if (!Number.isSafeInteger(offset) || offset < 0) throw new Failure(400, "Page invalide.");
          const rows = await db("rpc/ari_training_search", "POST", { p_query: q, p_status: status, p_offset: offset });
          data = rows.map((r: Record<string,unknown>) => ({ ...r, topics_json: JSON.stringify(r.topics_json) })); break;
        }
        case "event": {
          const date = text(input.event_date, 10);
          const time = text(input.start_time ?? "", 5);
          const duration = input.duration_minutes === null || input.duration_minutes === "" ? null : Number(input.duration_minutes);
          const location = text(input.location ?? "", 500);
          const mode = text(input.format_mode, 16);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))
            || new Date(date).toISOString().slice(0, 10) !== date
            || (time !== "" && !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time))
            || (duration !== null && (!Number.isInteger(duration) || duration < 15 || duration > 1440))
            || !["pending","single","workshops"].includes(mode)) throw new Failure(400, "Informations pratiques invalides.");
          await api("/rest/v1/ari_training_events?id=eq.1", "PATCH", {
            event_date: date, start_time: time, duration_minutes: duration, location, format_mode: mode
          });
          data = { ok: true }; break;
        }
        case "status": {
          const status = text(input.status, 16);
          if (!statusValues.includes(status)) throw new Failure(400, "Statut invalide.");
          const row = await one(input.id);
          await api("/rest/v1/ari_training_registrations?id=eq." + row.id + "&event_id=eq.1", "PATCH", { status });
          data = { ok: true }; break;
        }
        case "cv": {
          const row = await one(input.id);
          if (!row.cv_file) throw new Failure(404, "CV non fourni.");
          const response = await api(filePath(String(row.cv_file)));
          const bytes = new Uint8Array(await response.arrayBuffer());
          if (bytes.length > 5 * 1024 * 1024) throw new Failure(502, "CV trop volumineux.");
          data = { base64: encoded(bytes) }; break;
        }
        case "delete": {
          const row = await one(input.id);
          if (row.cv_file) await removeCV(String(row.cv_file));
          await api("/rest/v1/ari_training_registrations?id=eq." + row.id + "&event_id=eq.1", "DELETE");
          data = { ok: true }; break;
        }
        case "register": {
          const firstName = text(input.first_name, 80);
          const lastName = text(input.last_name, 80);
          const city = text(input.city, 120);
          const country = text(input.residence_country, 100);
          const education = text(input.education_domain, 180);
          if (!firstName || !lastName || !city || !country || !education) throw new Failure(400, "Veuillez compléter tous les champs obligatoires.");
          const name = firstName + " " + lastName;
          const email = text(input.email, 254).toLowerCase();
          const phone = text(input.phone ?? "", 40);
          const situation = text(input.situation ?? "", 100);
          const consent = text(input.consent_version, 64);
          if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            || (phone !== "" && !/^[+0-9(). -]{5,40}$/.test(phone)) || input.consent !== true || !consent
            || !Array.isArray(input.topics) || input.topics.length < 1 || input.topics.length > 3
            || !input.topics.every(t => typeof t === "string" && topics.includes(t))) throw new Failure(400, "Inscription invalide.");
          let cv: string | null = null;
          if (input.cv_base64 !== undefined && input.cv_base64 !== null) {
            if (typeof input.cv_base64 !== "string" || input.cv_base64.length > 7 * 1024 * 1024) throw new Failure(400, "CV invalide.");
            const bytes = decoded(input.cv_base64);
            if (bytes.length < 5 || bytes.length > 5 * 1024 * 1024 || new TextDecoder().decode(bytes.slice(0,5)) !== "%PDF-") throw new Failure(400, "CV PDF requis, 5 Mo maximum.");
            cv = hex(crypto.getRandomValues(new Uint8Array(32)).buffer) + ".pdf";
            const upload = await send(options.url + filePath(cv), {
              method: "POST", headers: { ...headers, "Content-Type": "application/pdf", "x-upsert": "false" }, body: bytes
            });
            if (!upload.ok) throw new Failure(502, "Envoi du CV impossible.");
          }
          try {
            const rows = await db("ari_training_registrations", "POST", {
              event_id: 1, full_name: name, first_name: firstName, last_name: lastName, city, residence_country: country, education_domain: education, email, phone, situation, topics_json: [...new Set(input.topics)],
              status: "pending", cv_file: cv, consent_version: consent
            }, { Prefer: "return=representation" });
            data = { id: rows[0].id };
          } catch (e) { if (cv) await removeCV(cv); throw e; }
          break;
        }
        default: throw new Failure(400, "Action inconnue.");
      }
      return Response.json(data, { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
    } catch (e) {
      const status = e instanceof Failure ? e.status : 500;
      const message = e instanceof Failure ? e.message : "Opération momentanément indisponible.";
      return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
    }
  };
}
