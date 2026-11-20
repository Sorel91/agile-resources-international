import assert from "node:assert/strict";
import { createHandler } from "../supabase/functions/training-admin/handler.ts";

const enc = new TextEncoder();
const hash = async (s: string) => Buffer.from(await crypto.subtle.digest("SHA-256", enc.encode(s))).toString("hex");
const pair = await crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",hash:"SHA-256",modulusLength:2048,publicExponent:new Uint8Array([1,0,1])},true,["sign","verify"]);
const der = Buffer.from(await crypto.subtle.exportKey("spki",pair.publicKey)).toString("base64");
const pem = "-----BEGIN PUBLIC KEY-----\n" + (der.match(/.{1,64}/g) ?? []).join("\n") + "\n-----END PUBLIC KEY-----\n";
const keyId = await hash(pem);
const clock = 1795184000;
const registrations: any[] = [];
const blobs = new Map<string, Uint8Array>();
const nonces = new Set<string>();
const event = {id:1,title:"Ateliers",event_date:"2026-11-21",start_time:"",duration_minutes:null,location:"",format_mode:"pending"};
let nextId = 1;
let enabled = true;
const mock: typeof fetch = async (input: any, options: any) => {
  const url = new URL(String(input)), path = url.pathname, query = url.searchParams;
  assert.equal(options.headers.apikey,"sb_secret_TEST");
  assert.equal(options.headers.Authorization,undefined);
  const method = options.method;
  const body = options.body && typeof options.body === "string" ? JSON.parse(options.body) : null;
  const json = (v:any,status=200) => Response.json(v,{status});
  if(path.endsWith("/ari_training_admin_keys")) return json(enabled && query.get("key_id") === "eq."+keyId ? [{public_key:pem}] : []);
  if(path.endsWith("/ari_training_nonces")) {
    if(method==="DELETE") return new Response(null,{status:204});
    if(nonces.has(body.nonce)) return json({},409);
    nonces.add(body.nonce); return new Response(null,{status:201});
  }
  if(path.endsWith("/ari_training_events")) {
    if(method==="PATCH") {Object.assign(event,body); return new Response(null,{status:204});}
    return json([event]);
  }
  if(path.endsWith("/rpc/ari_training_search")) {
    const q=body.p_query.toLowerCase();
    return json(registrations.filter(r=>(!body.p_status || r.status===body.p_status) && [r.full_name,r.email,r.phone].join(" ").toLowerCase().includes(q)).slice(body.p_offset,body.p_offset+500));
  }
  if(path.endsWith("/ari_training_registrations")) {
    if(method==="HEAD") {
      const s=query.get("status")?.slice(3);
      return new Response(null,{headers:{"Content-Range":"*/"+registrations.filter(r=>r.status===s).length}});
    }
    const wanted=Number(query.get("id")?.slice(3));
    const row=registrations.find(r=>r.id===wanted);
    if(method==="GET") return json(row?[row]:[]);
    if(method==="POST") {
      if(registrations.some(r=>r.email===body.email)) return json({},409);
      const result={...body,id:nextId++,created_at:"2026-11-20T10:00:00Z",consent_at:"2026-11-20T10:00:00Z"};
      registrations.push(result); return json([result],201);
    }
    if(method==="PATCH") {if(row) Object.assign(row,body); return new Response(null,{status:204});}
    if(method==="DELETE") {if(row) registrations.splice(registrations.indexOf(row),1); return new Response(null,{status:204});}
  }
  if(path==="/storage/v1/object/ari-training-cvs" && method==="DELETE") {
    for(const name of body.prefixes) blobs.delete(name);
    return json([]);
  }
  if(path.startsWith("/storage/v1/object/ari-training-cvs/")) {
    const name=path.split("/").at(-1)!;
    if(method==="POST"){blobs.set(name,new Uint8Array(options.body));return json({});}
    if(method==="GET") return blobs.has(name)?new Response(blobs.get(name)):json({},404);
  }
  throw new Error("Unhandled mock "+method+" "+path);
};
const handler=createHandler({url:"https://test.supabase.co",secret:"sb_secret_TEST",fetch:mock,now:()=>clock});
async function signed(payload: unknown, nonce=crypto.randomUUID().replaceAll("-",""),time=clock) {
  const body=JSON.stringify(payload);
  const canonical=time+"\n"+nonce+"\n"+await hash(body);
  const signature=Buffer.from(await crypto.subtle.sign("RSASSA-PKCS1-v1_5",pair.privateKey,enc.encode(canonical))).toString("base64");
  return {method:"POST",body,headers:{"X-ARI-Key":keyId,"X-ARI-Time":String(time),"X-ARI-Nonce":nonce,"X-ARI-Signature":signature}};
}
async function call(payload:unknown,expected=200) {
  const response=await handler(new Request("https://test/functions/v1/training-admin",await signed(payload)));
  const data=await response.json();
  assert.equal(response.status,expected,JSON.stringify(data));
  return data;
}
assert.equal((await handler(new Request("https://test",{method:"POST",body:"{}"}))).status,401);
const replay=await signed({action:"health"});
assert.equal((await handler(new Request("https://test",replay))).status,200);
assert.equal((await handler(new Request("https://test",replay))).status,401);
assert.equal((await handler(new Request("https://test",await signed({action:"health"},undefined,clock-100)))).status,401);
const tampered=await signed({action:"health"}); tampered.body='{"action":"summary"}';
assert.equal((await handler(new Request("https://test",tampered))).status,401);
enabled=false; await call({action:"health"},401); enabled=true;
await call({action:"unknown"},400);
const base={action:"register",full_name:"Participant",email:"",phone:"+2250000000000",situation:"Salarié",topics:["network"],consent:true,consent_version:"test-v1"};
for(let i=0;i<31;i++){
  const r=await call({...base,email:"participant"+i+"@example.invalid"});
  await call({action:"status",id:r.id,status:"confirmed"});
}
assert.equal((await call({action:"summary"})).counts.confirmed,31);
await call({...base,email:"bad@example.invalid",consent:false},400);
await call({...base,email:"bad@example.invalid",topics:["unknown"]},400);
await call({action:"status",id:1,status:"waitlist"},400);
await call({action:"status",id:1,status:"cancelled"});
assert.equal((await call({action:"summary"})).counts.cancelled,1);
await call({action:"status",id:1,status:"confirmed"});
assert.equal((await call({action:"list",q:"participant3@",status:"confirmed",offset:0})).length,1);
assert.equal((await call({action:"list",q:"' OR 1=1 --",status:"",offset:0})).length,0);
await call({action:"list",q:"",status:"",offset:-1},400);
const pdf=Buffer.from("%PDF-1.4\nTest disposable fixture");
const record=await call({...base,email:"cv@example.invalid",cv_base64:pdf.toString("base64")});
assert.equal(blobs.size,1);
assert.equal(Buffer.from((await call({action:"cv",id:record.id})).base64,"base64").toString(),pdf.toString());
await call({...base,email:"cv@example.invalid",cv_base64:pdf.toString("base64")},409);
assert.equal(blobs.size,1,"Duplicate registration must clean up its newly uploaded CV");
await call({...base,email:"invalidcv@example.invalid",cv_base64:Buffer.from("not PDF").toString("base64")},400);
await call({action:"delete",id:record.id});
assert.equal(blobs.size,0);
await call({action:"cv",id:record.id},404);
await call({action:"event",event_date:"2026-11-21",start_time:"09:00",duration_minutes:120,location:"Abidjan",format_mode:"single"});
assert.equal(event.start_time,"09:00");
await call({action:"event",event_date:"2026-02-30",start_time:"",duration_minutes:null,location:"",format_mode:"pending"},400);
console.log("Supabase handler checks passed: signatures, replay, expiry, revocation, CRUD, >30 confirmations, CSV source search, CV isolation/cleanup, session parameters.");
