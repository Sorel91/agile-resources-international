import { createHandler } from "./handler.ts";
const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
const secret = keys.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const url = Deno.env.get("SUPABASE_URL") ?? "";
if (!secret || !url) throw new Error("Supabase runtime credentials missing");
Deno.serve(createHandler({ url, secret }));
