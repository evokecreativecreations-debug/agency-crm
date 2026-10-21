// Isolated regression checks. No production credentials, Google calls or live DB.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { webcrypto } from 'node:crypto';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PGlite } from '@electric-sql/pglite';
const nodeRequire = createRequire(import.meta.url);
const { NextRequest, NextResponse } = nodeRequire('next/server');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function load(relative, mocks = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  }}).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, URL, Buffer, Response, crypto: webcrypto,
    console: { error() {} },
    process: { env: {}, cwd: () => root },
    require(name) {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('@/')) throw new Error(`Unexpected application import: ${name}`);
      return nodeRequire(name);
    },
  }, { filename: relative });
  return exports;
}
const user = { id: '11111111-1111-4111-8111-111111111111' };
function authMocks(currentUser, extra = {}) {
  return {
    '@/lib/supabase/server': { createClient: async () => ({ auth: {
      getUser: async () => ({ data: { user: currentUser }, error: null }),
    }}) },
    '@/lib/supabase/service': { createServiceClient() { assert.fail('Privileged DB must not be called'); } },
    ...extra,
  };
}

for (const [file, method, request] of [
  ['app/api/gmail/auth/route.ts', 'GET', new Request('https://crm.example.invalid/api/gmail/auth')],
  ['app/api/gmail/callback/route.ts', 'GET', new Request('https://crm.example.invalid/api/gmail/callback?code=test')],
  ['app/api/gmail/sync/route.ts', 'POST', new Request('https://crm.example.invalid/api/gmail/sync', { method: 'POST' })],
  ['app/api/messages/send/route.ts', 'POST', new Request('https://crm.example.invalid/api/messages/send', { method: 'POST' })],
]) {
  test(`${file} rejects a missing session before side effects`, async () => {
    const route = load(file, authMocks(null, {
      '@/lib/gmail/client': {}, '@/features/messages/api': {},
    }));
    assert.equal((await route[method](request)).status, 401);
  });
}

test('Gmail OAuth state is user-bound, HttpOnly, short-lived and secure on HTTPS', async () => {
  let cookie;
  const route = load('app/api/gmail/auth/route.ts', authMocks(user, {
    'next/headers': { cookies: async () => ({ set: (...args) => { cookie = args; } }) },
    '@/lib/gmail/client': { getGmailAuthUrl: (state) => `https://accounts.google.com/o/oauth2/auth?state=${state}` },
  }));
  const result = await route.GET(new Request('https://crm.example.invalid/api/gmail/auth'));
  assert.equal(result.status, 307);
  assert.ok(cookie[1].startsWith(`${user.id}.`));
  assert.equal(cookie[2].httpOnly, true);
  assert.equal(cookie[2].secure, true);
  assert.equal(cookie[2].sameSite, 'lax');
  assert.equal(cookie[2].maxAge, 600);
});

for (const [name, supplied, stored] of [
  ['missing', '', `${user.id}.nonce`],
  ['mismatched', `${user.id}.wrong`, `${user.id}.nonce`],
  ['other user', 'other-user.nonce', 'other-user.nonce'],
  ['expired cookie', `${user.id}.nonce`, null],
]) {
  test(`Gmail callback rejects ${name} OAuth state before token exchange`, async () => {
    const route = load('app/api/gmail/callback/route.ts', authMocks(user, {
      'next/headers': { cookies: async () => ({ get: () => stored ? { value: stored } : undefined }) },
      '@/lib/gmail/client': { getGmailTokens() { assert.fail('Invalid state reached Google'); } },
    }));
    const result = await route.GET(new Request(`https://crm.example.invalid/api/gmail/callback?code=test&state=${supplied}`));
    assert.equal(result.status, 400);
  });
}

test('Valid Gmail callback consumes state and preserves refresh token when Google omits it', async () => {
  const state = `${user.id}.nonce`;
  let saved, cleared;
  const route = load('app/api/gmail/callback/route.ts', authMocks(user, {
    'next/headers': { cookies: async () => ({ get: () => ({value:state}), set: (...args) => {cleared=args;} }) },
    '@/lib/gmail/client': {
      getGmailTokens: async () => ({ access_token: 'test-token' }),
      createGmailClient: () => ({users:{getProfile:async()=>({data:{emailAddress:'test@example.invalid'}})}}),
    },
    '@/lib/supabase/service': { createServiceClient: () => ({from:()=>({upsert:async(value)=>{saved=value;return {error:null};}})}) },
  }));
  const result = await route.GET(new Request(`https://crm.example.invalid/api/gmail/callback?code=test&state=${state}`));
  assert.equal(result.status, 200);
  assert.equal(cleared[2].maxAge, 0);
  assert.equal(cleared[2].path, '/api/gmail');
  assert.equal(Object.hasOwn(saved, 'refresh_token'), false);
});

test('Gmail sync is POST-only and rejects cross-origin calls', async () => {
  const route = load('app/api/gmail/sync/route.ts', authMocks(user, { '@/lib/gmail/client': {} }));
  assert.equal(route.GET, undefined);
  const result = await route.POST(new Request('https://crm.example.invalid/api/gmail/sync', {
    method:'POST', headers:{origin:'https://evil.example.invalid'},
  }));
  assert.equal(result.status,403);
});

test('All dashboard pages require login and retain refreshed cookies on redirects', async () => {
  const response = NextResponse.next();
  response.cookies.set('test-session','refreshed',{httpOnly:true});
  const { proxy } = load('proxy.ts', {
    '@/lib/supabase/middleware': {updateSession:async()=>({response,user:null})},
  });
  for (const route of ['/dashboard','/inquiries','/leads','/clients','/projects','/invoices','/payments','/messages','/files','/services','/profile','/settings','/notifications','/clients/test']) {
    const result = await proxy(new NextRequest(`https://crm.example.invalid${route}`));
    assert.equal(result.status,307,route);
    assert.equal(new URL(result.headers.get('location')).pathname,'/login');
    assert.equal(result.cookies.get('test-session').value,'refreshed');
  }
});

test('Login redirects reject external, JavaScript, data and backslash URLs', () => {
  const { getSafeRedirect } = load('features/auth/redirect.ts');
  const origin = 'https://crm.example.invalid';
  for (const value of ['https://evil.example.invalid','//evil.example.invalid','javascript:alert(1)','data:text/html,test','\\\\evil.example.invalid','https://crm.example.invalid.evil.example.invalid','http://[invalid']) {
    assert.equal(getSafeRedirect(value,origin),'/dashboard',value);
  }
  assert.equal(getSafeRedirect('/clients?q=test#details',origin),'/clients?q=test#details');
  assert.equal(getSafeRedirect(`${origin}/leads`,origin),'/leads');
});

test('Untrusted HTML is isolated in an opaque sandbox, plain email text is escaped', () => {
  const { EmailContent } = load('features/messages/components/EmailContent.tsx');
  const iframe = EmailContent({html:'<script>parent.alert(1)</script><a href=javascript:alert(1)>test</a>',text:'',subject:'Test'});
  assert.equal(iframe.type,'iframe');
  assert.equal(iframe.props.sandbox,'');
  assert.equal(iframe.props.referrerPolicy,'no-referrer');
  assert.ok(iframe.props.srcDoc.indexOf('Content-Security-Policy') < iframe.props.srcDoc.indexOf('<script>'));
  assert.ok(iframe.props.srcDoc.includes("default-src 'none'"));
  const markup = renderToStaticMarkup(React.createElement(EmailContent,{html:null,text:'<img src=x onerror=alert(1)>',subject:'Test'}));
  assert.ok(!markup.includes('<img'));
  assert.ok(markup.includes('&lt;img'));
});

function serviceWorker(options = {}) {
  const listeners = {};
  vm.runInNewContext(fs.readFileSync(path.join(root,'public/sw.js'),'utf8'), {
    self:{location:{origin:'https://crm.example.invalid'},addEventListener:(name,handler)=>{listeners[name]=handler;},clients:{claim:async()=>{}},skipWaiting:async()=>{}},
    URL, Response,
    fetch:options.fetch ?? (async()=>{throw new Error('offline');}),
    caches:options.caches ?? {match:async()=>undefined},
  });
  return listeners;
}

test('Offline navigation returns a valid response, even if offline page is missing', async () => {
  for (const cached of [undefined,new Response('Offline page')]) {
    let response;
    const listeners = serviceWorker({caches:{match:async()=>cached}});
    listeners.fetch({request:{method:'GET',mode:'navigate',url:'https://crm.example.invalid/dashboard'},respondWith:(promise)=>{response=promise;}});
    const actual = await response;
    assert.ok(actual instanceof Response);
    assert.equal(actual.status,cached?200:503);
  }
});

test('Service worker does not intercept API calls, writes or external requests', () => {
  const listeners = serviceWorker();
  for (const request of [
    {method:'GET',mode:'cors',url:'https://crm.example.invalid/api/files'},
    {method:'POST',mode:'navigate',url:'https://crm.example.invalid/api/inquiries'},
    {method:'GET',mode:'navigate',url:'https://other.example.invalid/'},
  ]) listeners.fetch({request,respondWith:()=>assert.fail('Private data request intercepted')});
});

test('Service worker removes only old CRM caches', async () => {
  const deleted=[];
  const listeners=serviceWorker({caches:{keys:async()=>['agency-crm-shell-v1','agency-crm-shell-v2','other-app-cache'],delete:async(key)=>{deleted.push(key);}}});
  let finished;
  listeners.activate({waitUntil:(promise)=>{finished=promise;}});
  await finished;
  assert.deepEqual(deleted,['agency-crm-shell-v1']);
});

let db;
before(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function auth.role() returns text language sql stable as
      $$ select current_setting('request.jwt.claim.role',true) $$;
    grant usage on schema public,auth to authenticated,anon;
    grant execute on all functions in schema auth to authenticated,anon;
    alter default privileges in schema public grant select,insert,update,delete on tables to authenticated;
  `);
  const folder=path.join(root,'supabase/migrations');
  for (const filename of fs.readdirSync(folder).filter(f=>f.endsWith('.sql')).sort()) {
    try { await db.exec(fs.readFileSync(path.join(folder,filename),'utf8')); }
    catch(error) { throw new Error(`Migration failed: ${filename}: ${error.message}`); }
  }
});
after(async()=>{await db?.close();});

test('All migrations run in order on a fresh PostgreSQL database',async()=>{
  const {rows}=await db.query("select to_regclass('public.clients') as clients, to_regclass('public.leads') as leads");
  assert.equal(rows[0].clients,'clients'); assert.equal(rows[0].leads,'leads');
});

test('Prerequisite/client migrations also tolerate a previously initialized database',async()=>{
  for (const file of ['20260814090000_create_leads_prerequisite.sql','20260815090000_create_clients_table.sql']) {
    await db.exec(fs.readFileSync(path.join(root,'supabase/migrations',file),'utf8'));
  }
});

async function inquiry() {
  const {rows}=await db.query("insert into public.inquiries(full_name,email,message) values ('Test','test@example.invalid','Test') returning id");
  return rows[0].id;
}
async function convert(id) {
  return db.query("select * from public.convert_inquiry_to_lead($1,'Test','test@example.invalid',null,null)",[id]);
}
async function signedIn(fn) {
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${user.id}'; set request.jwt.claim.role = 'authenticated';`);
  try { return await fn(); }
  finally { await db.exec("reset role; reset request.jwt.claim.sub; reset request.jwt.claim.role;"); }
}

test('Conversion retries return one lead and mark the inquiry converted',async()=>{
  await db.query('insert into auth.users(id) values ($1) on conflict do nothing',[user.id]);
  const id=await inquiry();
  await signedIn(async()=>{
    const first=await convert(id), retry=await convert(id);
    assert.equal(first.rows[0].id,retry.rows[0].id);
  });
  const {rows}=await db.query('select count(*)::int as count from public.leads where inquiry_id=$1',[id]);
  assert.equal(rows[0].count,1);
  const state=await db.query('select status from public.inquiries where id=$1',[id]);
  assert.equal(state.rows[0].status,'converted_to_lead');
});

test('Failed inquiry update rolls back the newly created lead',async()=>{
  const id=await inquiry();
  await db.exec(`create function public.reject_test_conversion() returns trigger language plpgsql as $$ begin raise exception 'Simulated update failure'; end $$;
    create trigger reject_test_conversion before update on public.inquiries for each row execute function public.reject_test_conversion();`);
  try {
    await signedIn(async()=>{await assert.rejects(()=>convert(id),/Simulated update failure/);});
    const {rows}=await db.query('select count(*)::int as count from public.leads where inquiry_id=$1',[id]);
    assert.equal(rows[0].count,0);
    const state=await db.query('select status from public.inquiries where id=$1',[id]);
    assert.equal(state.rows[0].status,'new');
  } finally { await db.exec('drop trigger reject_test_conversion on public.inquiries; drop function public.reject_test_conversion();'); }
});

test('Existing lead is reused after a legacy partial conversion',async()=>{
  const id=await inquiry();
  const {rows}=await db.query("insert into public.leads(inquiry_id,full_name,email) values ($1,'Legacy','test@example.invalid') returning id",[id]);
  await signedIn(async()=>{const result=await convert(id);assert.equal(result.rows[0].id,rows[0].id);});
});

test('Conversion refuses anonymous execution and missing inquiries',async()=>{
  await db.exec('set role anon');
  try { await assert.rejects(()=>convert('22222222-2222-4222-8222-222222222222'),/permission denied/); }
  finally {await db.exec('reset role');}
  await signedIn(async()=>{await assert.rejects(()=>convert('22222222-2222-4222-8222-222222222222'),/Inquiry not found/);});
});

test('Conversion respects RLS rather than escalating to a privileged owner',async()=>{
  const id=await inquiry();
  await db.exec(`drop policy "Authenticated users can view inquiries" on public.inquiries;`);
  try { await signedIn(async()=>{await assert.rejects(()=>convert(id),/Inquiry not found/);}); }
  finally {await db.exec(`create policy "Authenticated users can view inquiries" on public.inquiries for select using (auth.role()='authenticated');`);}
});

const billing = load('features/invoices/billing.ts');
test('Billing uses rounded line totals, discount before tax and does not subtract requested advance', () => {
  const fields = { line_items: [{ description: 'Design', quantity: 2.5, unit_price: 49.99 }, { description: 'Print', quantity: 3, unit_price: 10 }], discount_amount: 10, tax_rate: 7.5, deposit_amount: 50, notes: '', payment_terms: '' };
  assert.equal(billing.validateBilling(fields), 155.85);
  assert.equal(billing.billingTotals([{ description:'Tiny', quantity:1.5, unit_price:.07 }]).total,.11);
  for (const patch of [{ deposit_amount: 1000 }, { tax_rate: 101 }, { discount_amount: -1 }, { line_items: [] }, { line_items: [{ description:'',quantity:1,unit_price:10 }] }, { line_items: [{ description:'x',quantity:.001,unit_price:10 }] }]) assert.throws(() => billing.validateBilling({ ...fields,...patch }));
});

test('Today handles agency dates, DST, overdue work, drafts and actual recorded balances', () => {
  const { buildToday, dayKey } = load('features/dashboard/today.ts');
  assert.equal(dayKey(new Date('2026-10-20T20:00:00Z'),'Asia/Karachi'),'2026-10-21');
  assert.equal(dayKey(new Date('2026-11-01T05:30:00Z'),'America/New_York'),'2026-11-01');
  assert.equal(dayKey(new Date('2026-11-01T06:30:00Z'),'America/New_York'),'2026-11-01');
  const data = buildToday({ followups:[{id:'1',status:'pending',due_at:'2026-10-21T05:00:00Z'},{id:'2',status:'done',due_at:'2026-10-20T05:00:00Z'},{id:'3',status:'pending',due_at:'2026-10-22T05:00:00Z'}],tasks:[{id:'1',status:'todo',due_date:'2026-10-20'},{id:'2',status:'done',due_date:'2026-10-20'}],projects:[{id:'1',status:'on_hold',due_date:'2026-10-20'},{id:'2',status:'planning',due_date:'2026-10-21'}],invoices:[{id:'1',status:'draft',amount:100,payments:[]},{id:'2',status:'sent',amount:100,payments:[{amount:40}]},{id:'3',status:'paid',amount:100,payments:[{amount:100}]}] },new Date('2026-10-21T06:00:00Z'),'Asia/Karachi');
  assert.equal(data.dueFollowups.length,1); assert.equal(data.upcomingFollowups.length,1); assert.equal(data.tasks.length,1); assert.equal(data.projects.length,1); assert.equal(data.outstanding,60);
});

test('New routes require login; PDF API refuses anonymous access before loading data', async () => {
  const { proxy } = load('proxy.ts', { '@/lib/supabase/middleware': { updateSession: async () => ({ response:NextResponse.next(),user:null }) } });
  for (const route of ['/today','/quotations']) assert.equal((await proxy(new NextRequest(`https://crm.example.invalid${route}`))).status,307);
  const pdf = load('app/api/billing/[kind]/[id]/pdf/route.ts', authMocks(null, { '@/features/invoices/pdf': { createBillingPdf(){assert.fail('PDF must not be created');} } }));
  assert.equal((await pdf.GET(new Request('https://crm.example.invalid/api/billing/invoice/test/pdf'),{ params:Promise.resolve({kind:'invoice',id:'test'}) })).status,401);
});

test('Reminder collector rejects cross-origin requests and unauthenticated sessions',async()=>{
  const route = load('app/api/reminders/route.ts', authMocks(null));
  assert.equal((await route.POST(new Request('https://crm.example.invalid/api/reminders',{method:'POST',headers:{origin:'https://evil.invalid'}}))).status,403);
  assert.equal((await route.POST(new Request('https://crm.example.invalid/api/reminders',{method:'POST',headers:{origin:'https://crm.example.invalid'}}))).status,401);
});

const otherUser = '33333333-3333-4333-8333-333333333333';
async function fixtures() {
  await db.query('insert into auth.users(id) values($1),($2) on conflict do nothing',[user.id,otherUser]);
  const lead = (await db.query("insert into leads(full_name,email) values('José Test','jose@example.invalid') returning id")).rows[0].id;
  const client = (await db.query("insert into clients(lead_id,full_name,email) values($1,'José Test','jose@example.invalid') returning id",[lead])).rows[0].id;
  const project = (await db.query("insert into projects(client_id,title) values($1,'Sample project') returning id",[client])).rows[0].id;
  return {lead,client,project};
}
const items = JSON.stringify([{ description:'Brand design',quantity:2.5,unit_price:49.99 },{description:'Print',quantity:3,unit_price:10}]);
async function quote(client) { return (await db.query("insert into quotations(quotation_number,client_id,recipient_name,recipient_email,line_items,amount,discount_amount,tax_rate,deposit_amount) values('AUTO',$1,'Ignored','ignored@example.invalid',$2,1,10,7.5,50) returning *",[client,items])).rows[0]; }

test('Database totals override client-supplied amounts and contacts; numbering is generated uniquely',async()=>{
  const f=await fixtures();
  await signedIn(async()=>{
    const a=await quote(f.client), b=await quote(f.client);
    assert.equal(Number(a.amount),155.85); assert.equal(a.recipient_name,'José Test'); assert.notEqual(a.quotation_number,b.quotation_number);
    await assert.rejects(()=>db.query("update quotations set quotation_number='X' where id=$1",[a.id]),/cannot be changed/);
    await assert.rejects(()=>db.query("update quotations set line_items='[]' where id=$1",[a.id]),/between 1 and 100/);
    await assert.rejects(()=>db.query("update quotations set deposit_amount=1000 where id=$1",[a.id]),/advance exceeds total/);
  });
});

test('Accepted quotation converts atomically, validates project owner and retries return the same invoice',async()=>{
  const f=await fixtures(), another=await fixtures();
  await signedIn(async()=>{
    const q=await quote(f.client);
    await assert.rejects(()=>db.query('select * from convert_quotation_to_invoice($1,$2)',[q.id,f.project]),/Accept the quotation/);
    await db.query("update quotations set status='accepted' where id=$1",[q.id]);
    await assert.rejects(()=>db.query('select * from convert_quotation_to_invoice($1,$2)',[q.id,another.project]),/belonging to this quotation/);
    const result=(await db.query('select * from convert_quotation_to_invoice($1,$2,$3)',[q.id,f.project,'2026-11-01'])).rows[0];
    const retry=(await db.query('select * from convert_quotation_to_invoice($1,$2)',[q.id,f.project])).rows[0];
    assert.equal(result.id,retry.id); assert.equal(Number(result.amount),155.85); assert.equal(Number(result.deposit_amount),50); assert.equal(result.status,'draft');
    assert.equal((await db.query('select count(*)::int n from payments where invoice_id=$1',[result.id])).rows[0].n,0);
    await assert.rejects(()=>db.query("update quotations set status='draft' where id=$1",[q.id]),/cannot be changed/);
    await db.query("insert into payments(invoice_id,amount,payment_method,paid_at) values($1,100,'bank_transfer','2026-10-21')",[result.id]);
    await assert.rejects(()=>db.query("update invoices set line_items='[{\"description\":\"Lower\",\"quantity\":1,\"unit_price\":20}]',discount_amount=0,tax_rate=0,deposit_amount=0 where id=$1",[result.id]),/less than recorded payments/);
  });
});

test('Failed quotation conversion rolls back its draft invoice',async()=>{
  const f=await fixtures();let q;
  await signedIn(async()=>{q=await quote(f.client);await db.query("update quotations set status='accepted' where id=$1",[q.id]);});
  await db.exec(`create function public.reject_test_quote() returns trigger language plpgsql as $$ begin raise exception 'Simulated link failure'; end $$; create trigger reject_test_quote before update on public.quotations for each row execute function public.reject_test_quote();`);
  try {
    await signedIn(async()=>{await assert.rejects(()=>db.query('select * from convert_quotation_to_invoice($1,$2)',[q.id,f.project]),/Simulated link failure/);});
    assert.equal((await db.query('select count(*)::int n from invoices where project_id=$1',[f.project])).rows[0].n,0);
  } finally { await db.exec('drop trigger reject_test_quote on public.quotations; drop function public.reject_test_quote();'); }
});

test('Follow-ups and alerts are personal, deduplicated and cleared on complete or reschedule',async()=>{
  const f=await fixtures();let id;
  await signedIn(async()=>{
    id=(await db.query("insert into lead_followups(lead_id,action,due_at) values($1,'Call back',now()-interval '1 hour') returning id",[f.lead])).rows[0].id;
    assert.equal((await db.query('select collect_due_followups() n')).rows[0].n,1);
    assert.equal((await db.query('select collect_due_followups() n')).rows[0].n,0);
    await assert.rejects(()=>db.query('update notifications set user_id=null where followup_id=$1',[id]),/cannot be changed/);
  });
  await db.exec(`set role authenticated; set request.jwt.claim.role='authenticated'; set request.jwt.claim.sub='${otherUser}';`);
  try {
    assert.equal((await db.query('select * from lead_followups where id=$1',[id])).rows.length,0);
    assert.equal((await db.query('select * from notifications where followup_id=$1',[id])).rows.length,0);
    assert.equal((await db.query("update lead_followups set status='done' where id=$1 returning id",[id])).rows.length,0);
    await assert.rejects(()=>db.query("insert into notifications(title,message,user_id,followup_id) values('Fake','Fake',$1,$2)",[otherUser,id]),/row-level security/);
  } finally {await db.exec('reset role; reset request.jwt.claim.sub; reset request.jwt.claim.role;');}
  await signedIn(async()=>{
    await db.query("update lead_followups set due_at=now()-interval '10 minutes' where id=$1",[id]);
    assert.equal((await db.query('select count(*)::int n from notifications where followup_id=$1 and not read',[id])).rows[0].n,0);
    assert.equal((await db.query('select collect_due_followups() n')).rows[0].n,1);
    await db.query("update lead_followups set status='done' where id=$1",[id]);
    assert.equal((await db.query('select count(*)::int n from notifications where followup_id=$1 and not read',[id])).rows[0].n,0);
    assert.ok((await db.query('select completed_at from lead_followups where id=$1',[id])).rows[0].completed_at);
  });
});

test('Anonymous users cannot invoke new RPCs or view new personal and billing records',async()=>{
  await db.exec('set role anon');
  try {
    await assert.rejects(()=>db.query('select collect_due_followups()'),/permission denied/);
    await assert.rejects(()=>db.query("select convert_quotation_to_invoice('11111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111')"),/permission denied/);
    for(const table of ['lead_followups','quotations']) await assert.rejects(()=>db.query(`select * from ${table}`),/permission denied/);
  } finally {await db.exec('reset role');}
});

test('PDF renderer supports long multi-page documents and embeds fonts without network access', async () => {
  // pdf-lib validates native Array/Object identity; compile this renderer in the
  // same realm as its package rather than the auth-test VM sandbox.
  const NativeModule = nodeRequire('node:module').Module;
  const native = new NativeModule(path.join(root, 'features/invoices/pdf.ts'));
  native.require = name => name === './billing' ? billing : nodeRequire(name);
  native._compile(ts.transpileModule(fs.readFileSync(native.id,'utf8'), { compilerOptions: { module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true } }).outputText, native.id);
  const pdfModule = native.exports;
  const { PDFDocument } = nodeRequire('pdf-lib');
  const fields = { kind:'invoice',number:'INV-SAMPLE',created_at:'2026-10-21',due_date:'2026-11-01',recipient_name:'José Müller',recipient_email:'test@example.invalid',status:'draft',line_items:Array.from({length:60},(_,i)=>({description:`Design deliverable ${i+1}: ${'A detailed scope with wrapping text. '.repeat(5)}`,quantity:1,unit_price:50})),discount_amount:0,tax_rate:0,deposit_amount:1500,amount:3000,notes:'Terms and notes appear after all items. '.repeat(100),payment_terms:'50% advance; balance at handover.',paid:0 };
  const bytes = await pdfModule.createBillingPdf(fields); const doc = await PDFDocument.load(bytes);
  assert.ok(doc.getPageCount()>=4); assert.equal(doc.getTitle(),'Invoice INV-SAMPLE');
  assert.ok(bytes.byteLength>10000);
});

test('Legacy invoices keep their original totals; automatic numbers continue after INV-9999',async()=>{
  const f=await fixtures();
  await db.exec('alter table invoices disable trigger prepare_invoice');
  let legacy;
  try { legacy=(await db.query("insert into invoices(project_id,invoice_number,amount) values($1,'INV-9999',125) returning id",[f.project])).rows[0].id; }
  finally {await db.exec('alter table invoices enable trigger prepare_invoice');}
  await signedIn(async()=>{
    await db.query("update invoices set status='sent' where id=$1",[legacy]);
    const row=(await db.query('select amount,line_items from invoices where id=$1',[legacy])).rows[0];
    assert.equal(Number(row.amount),125); assert.deepEqual(row.line_items,[]);
    const next=(await db.query("insert into invoices(project_id,invoice_number,amount,line_items) values($1,'AUTO',0,'[{\"description\":\"Design\",\"quantity\":1,\"unit_price\":200}]') returning invoice_number,amount",[f.project])).rows[0];
    assert.equal(next.invoice_number,'INV-10000'); assert.equal(Number(next.amount),200);
  });
});

test('PDF endpoint keeps exports private and sanitises download filenames',async()=>{
  const record={quotation_number:'QUO-1"\r\nX-Fake: value',recipient_name:'Test',recipient_email:'test@example.invalid',line_items:[{description:'Work',quantity:1,unit_price:10}],amount:10,created_at:'2026-10-21',status:'draft'};
  const dbClient={auth:{getUser:async()=>({data:{user},error:null})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:record,error:null})})})})};
  const route=load('app/api/billing/[kind]/[id]/pdf/route.ts',{'@/lib/supabase/server':{createClient:async()=>dbClient},'@/features/invoices/pdf':{createBillingPdf:async()=>Buffer.from('%PDF-test')}});
  const response=await route.GET(new Request('https://crm.example.invalid/api/billing/quotation/test/pdf'),{params:Promise.resolve({kind:'quotation',id:user.id})});
  assert.equal(response.status,200); assert.equal(response.headers.get('cache-control'),'private, no-store');
  assert.ok(!response.headers.get('content-disposition').includes('\r'));assert.ok(response.headers.get('content-disposition').endsWith('.pdf"'));
});


test('Reminder origin validation uses the actual browser host when Next normalises its URL',async()=>{
  const route=load('app/api/reminders/route.ts',authMocks(null));
  const response=await route.POST(new Request('http://localhost:3038/api/reminders',{method:'POST',headers:{host:'127.0.0.1:3038',origin:'http://127.0.0.1:3038'}}));
  assert.equal(response.status,401);
  const forged=await route.POST(new Request('http://localhost:3038/api/reminders',{method:'POST',headers:{host:'127.0.0.1:3038',origin:'https://evil.invalid','x-forwarded-host':'evil.invalid'}}));
  assert.equal(forged.status,403);
});
