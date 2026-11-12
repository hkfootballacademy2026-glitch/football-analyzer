import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import worker from './worker.mjs';
import {random,digest,seconds,base64,verifyStripe,verifyIdToken} from './security.mjs';
import {validPrice,subscriptionState} from './stripe.mjs';

const schema=await readFile(new URL('./schema.sql',import.meta.url),'utf8');
const price={id:'price_fixture',active:true,livemode:false,currency:'jpy',unit_amount:500,type:'recurring',tax_behavior:'inclusive',recurring:{interval:'month',interval_count:1}};
function db(){
 const sql=new DatabaseSync(':memory:');sql.exec(schema);
 return {sql,prepare(text){return {bind(...args){return {async first(){return sql.prepare(text).get(...args)??null},async run(){return sql.prepare(text).run(...args)}}}}},async batch(statements){sql.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sql.exec('COMMIT');return results}catch(e){sql.exec('ROLLBACK');throw e}}};
}
function subscription(overrides={}){
 const now=seconds();
 return {id:'sub_fixture',customer:'cus_fixture',livemode:false,status:'active',cancel_at_period_end:false,
  items:{data:[{price,quantity:1,current_period_start:now-60,current_period_end:now+3600}]},
  latest_invoice:{id:'in_fixture',customer:'cus_fixture',status:'paid',currency:'jpy',total:500,amount_paid:500,amount_remaining:0},...overrides};
}
function fixture(){
 const database=db(),calls=[],sessions=new Map(),subscriptions=[];
 const env={BILLING_ENABLED:'true',BILLING_ENV:'test',BILLING_DB:database,APP_ORIGIN:'https://app.test',OIDC_ISSUER:'https://identity.test',OIDC_CLIENT_ID:'client',
  STRIPE_SECRET_KEY:['rk','test','fixture'].join('_'),STRIPE_WEBHOOK_SECRET:random(),STRIPE_PRICE_ID:price.id,STRIPE_PORTAL_CONFIGURATION_ID:'bpc_fixture',
  ASSETS:{fetch:async()=>new Response('asset')},
  FETCH:async(url,opts={})=>{
   calls.push({url,opts});
   const path=new URL(url).pathname,body=opts.body;
   if(path==='/v1/prices/'+price.id)return Response.json(price);
   if(path==='/v1/subscriptions')return Response.json({data:subscriptions,has_more:false});
   if(path==='/v1/customers')return Response.json({id:'cus_fixture',livemode:false});
   if(path==='/v1/checkout/sessions'){
    const key=opts.headers['Idempotency-Key'];
    if(!sessions.has(key))sessions.set(key,{id:'cs_fixture',livemode:false,status:'open',url:'https://checkout.stripe.com/c/pay/fixture',customer:'cus_fixture',currency:'jpy',amount_total:500,total_details:{amount_tax:0}});
    return Response.json(sessions.get(key));
   }
   if(path==='/v1/checkout/sessions/cs_fixture')return Response.json([...sessions.values()][0]);
   if(path==='/v1/billing_portal/sessions')return Response.json({url:'https://billing.stripe.com/p/session/fixture'});
   if(path==='/v1/charges/ch_fixture')return Response.json({id:'ch_fixture',livemode:false,customer:'cus_fixture',amount_refunded:500});
   throw Error('Unexpected network path '+path);
  }};
 return {env,database,calls,sessions,subscriptions};
}
async function login(f,customer='cus_fixture'){
 const token=random(),csrf=random(),uid=random();
 f.database.sql.prepare('INSERT INTO billing_users VALUES(?,?)').run(uid,customer);
 f.database.sql.prepare('INSERT INTO billing_sessions VALUES(?,?,?,?)').run(await digest(token),uid,csrf,seconds()+3600);
 return {token,csrf,uid};
}
function req(path,auth,body,origin='https://app.test'){
 const headers={};if(auth)headers.Cookie='__Host-fa_session='+auth.token;
 if(body!==undefined){headers.Origin=origin;headers['Content-Type']='application/json';headers['X-CSRF-Token']=auth?.csrf||'';}
 return new Request('https://app.test'+path,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body)});
}
async function signed(raw,secret,t=seconds()){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(t+'.'+raw));
 return 't='+t+',v1='+Array.from(new Uint8Array(signature),b=>b.toString(16).padStart(2,'0')).join('');
}
async function eventRequest(f,event){
 const raw=JSON.stringify(event);
 return new Request('https://app.test/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':await signed(raw,f.env.STRIPE_WEBHOOK_SECRET)},body:raw});
}
test('unconfigured/live environment never opens checkout; assets still work',async()=>{
 const f=fixture();f.env.BILLING_ENABLED='false';
 assert.equal((await (await worker.fetch(req('/api/billing/config'),f.env)).json()).available,false);
 assert.equal((await worker.fetch(req('/api/billing/checkout',null,{}),f.env)).status,503);
 assert.equal(await (await worker.fetch(req('/'),f.env)).text(),'asset');
 f.env.BILLING_ENABLED='true';f.env.BILLING_ENV='live';
 assert.equal((await (await worker.fetch(req('/api/billing/config'),f.env)).json()).available,false);
 assert.equal(f.calls.length,0);
});
test('unauthenticated and cross-origin requests cannot create sessions',async()=>{
 const f=fixture();
 assert.equal((await worker.fetch(req('/api/billing/checkout',null,{}),f.env)).status,401);
 const auth=await login(f);
 assert.equal((await worker.fetch(req('/api/billing/checkout',auth,{},'https://attacker.test'),f.env)).status,403);
 assert.equal((await worker.fetch(req('/api/billing/checkout',{...auth,csrf:'forged'},{}),f.env)).status,403);
 assert.equal(f.calls.length,0);
});
test('forged customer/price and missing consent rejected before Stripe',async()=>{
 const f=fixture(),auth=await login(f);
 for(const body of [{},{accepted:true,termsVersion:'old'},{accepted:true,termsVersion:'2026-11-08',customer:'cus_other'},{accepted:true,termsVersion:'2026-11-08',price:'free'}]){
  assert.equal((await worker.fetch(req('/api/billing/checkout',auth,body),f.env)).status,400);
 }
 assert.equal(f.calls.length,0);
});
test('repeated checkout clicks reuse one fixed 500 JPY session with no tax or trial',async()=>{
 const f=fixture(),auth=await login(f,null),body={accepted:true,termsVersion:'2026-11-08'};
 for(let i=0;i<2;i++){const r=await worker.fetch(req('/api/billing/checkout',auth,body),f.env);assert.equal(r.status,200);assert.match((await r.json()).url,/^https:\/\/checkout.stripe.com\//);}
 assert.equal(f.sessions.size,1);
 const call=f.calls.find(c=>c.url.endsWith('/checkout/sessions'));
 assert.equal(call.opts.body.get('line_items[0][price]'),price.id);
 assert.equal(call.opts.body.get('line_items[0][quantity]'),'1');
 assert.equal(call.opts.body.get('automatic_tax[enabled]'),'false');
 assert.equal(call.opts.body.has('payment_method_types[0]'),false);
 assert.equal(call.opts.body.has('subscription_data[trial_period_days]'),false);
 assert.equal(call.opts.body.get('subscription_data[billing_mode][type]'),'flexible');
 assert.ok(Number(call.opts.body.get('expires_at'))>seconds()+1800);
 assert.equal((await (await worker.fetch(req('/api/billing/status?checkout=returned',auth),f.env)).json()).pro,false);
});
test('paid subscription grants only its mapped owner and blocks duplicate contract',async()=>{
 const f=fixture(),auth=await login(f);f.subscriptions.push(subscription());
 assert.equal((await (await worker.fetch(req('/api/billing/status',auth),f.env)).json()).pro,true);
 assert.equal((await worker.fetch(req('/api/billing/checkout',auth,{accepted:true,termsVersion:'2026-11-08'}),f.env)).status,409);
 const other=await login(f,'cus_other');
 assert.equal((await (await worker.fetch(req('/api/billing/status',other),f.env)).json()).pro,false);
});
test('concurrent checkout requests share one reservation and Stripe idempotency key',async()=>{
 const f=fixture(),auth=await login(f),body={accepted:true,termsVersion:'2026-11-08'};
 const responses=await Promise.all(Array.from({length:4},()=>worker.fetch(req('/api/billing/checkout',auth,body),f.env)));
 assert.ok(responses.every(r=>r.status===200));
 assert.equal(f.sessions.size,1);
 const keys=f.calls.filter(c=>c.url.endsWith('/checkout/sessions')).map(c=>c.opts.headers['Idempotency-Key']);
 assert.equal(new Set(keys).size,1);
 assert.equal(f.database.sql.prepare('SELECT COUNT(*) AS n FROM billing_checkouts').get().n,1);
});
test('unpaid, cancelled, expired and trial subscriptions do not grant Pro; period-end cancellation retains paid access',()=>{
 const now=seconds(),list=s=>({data:[s],has_more:false});
 for(const status of ['past_due','unpaid','incomplete','canceled','trialing'])assert.equal(subscriptionState(list(subscription({status})),'cus_fixture',price.id,now).pro,false);
 const unpaid=subscription();unpaid.latest_invoice.status='open';
 assert.equal(subscriptionState(list(unpaid),'cus_fixture',price.id,now).pro,false);
 const expired=subscription();expired.items.data[0].current_period_end=now-1;
 assert.equal(subscriptionState(list(expired),'cus_fixture',price.id,now).pro,false);
 const cancelling=subscriptionState(list(subscription({cancel_at_period_end:true})),'cus_fixture',price.id,now);
 assert.equal(cancelling.pro,true);assert.equal(cancelling.cancelAtPeriodEnd,true);
 assert.equal(validPrice({...price,unit_amount:501},price.id),false);
 assert.equal(validPrice({...price,livemode:true},price.id),false);
});
test('webhook signature rejects modification, stale timestamp and live events',async()=>{
 const f=fixture(),raw='{"id":"evt_fixture"}',sig=await signed(raw,f.env.STRIPE_WEBHOOK_SECRET);
 assert.equal(await verifyStripe(raw,sig,f.env.STRIPE_WEBHOOK_SECRET),true);
 assert.equal(await verifyStripe(raw+' ',sig,f.env.STRIPE_WEBHOOK_SECRET),false);
 assert.equal(await verifyStripe(raw,await signed(raw,f.env.STRIPE_WEBHOOK_SECRET,seconds()-301),f.env.STRIPE_WEBHOOK_SECRET),false);
 const r=await worker.fetch(await eventRequest(f,{id:'evt_live',livemode:true}),f.env);assert.equal(r.status,400);
 assert.equal((await worker.fetch(new Request('https://app.test/api/stripe/webhook',{method:'POST',body:raw}),f.env)).status,400);
});
test('duplicate and out-of-order lifecycle events do not grant or overwrite entitlements',async()=>{
 const f=fixture(),auth=await login(f);
 const event={id:'evt_repeat',type:'invoice.paid',livemode:false,created:seconds()-3600,data:{object:{customer:'cus_fixture',status:'paid'}}};
 for(let i=0;i<2;i++)assert.equal((await worker.fetch(await eventRequest(f,event),f.env)).status,200);
 assert.equal(f.database.sql.prepare('SELECT COUNT(*) AS n FROM billing_events').get().n,1);
 assert.equal((await (await worker.fetch(req('/api/billing/status',auth),f.env)).json()).pro,false);
});
test('refund, dispute and fraud hold access and cannot be undone by a later paid event',async()=>{
 for(const type of ['charge.refunded','charge.dispute.created','radar.early_fraud_warning.created']){
  const f=fixture(),auth=await login(f);f.subscriptions.push(subscription());
  const risk={id:'evt_risk',type,livemode:false,created:seconds(),data:{object:{id:'ch_fixture',charge:'ch_fixture',customer:'cus_fixture'}}};
  assert.equal((await worker.fetch(await eventRequest(f,risk),f.env)).status,200);
  assert.equal((await worker.fetch(await eventRequest(f,{id:'evt_paid',type:'invoice.paid',livemode:false,created:seconds(),data:{object:{customer:'cus_fixture'}}}),f.env)).status,200);
  const state=await (await worker.fetch(req('/api/billing/status',auth),f.env)).json();
  assert.equal(state.pro,false);assert.equal(state.held,true);
 }
});
test('portal uses mapped customer; logout invalidates session without deleting user or contract',async()=>{
 const f=fixture(),auth=await login(f);
 const r=await worker.fetch(req('/api/billing/portal',auth,{}),f.env);assert.equal(r.status,200);
 const call=f.calls.find(c=>c.url.endsWith('/billing_portal/sessions'));
 assert.equal(call.opts.body.get('customer'),'cus_fixture');assert.equal(call.opts.body.get('configuration'),'bpc_fixture');
 assert.equal((await worker.fetch(req('/api/auth/logout',auth,{}),f.env)).status,200);
 assert.equal((await worker.fetch(req('/api/billing/status',auth),f.env)).status,401);
 assert.equal(f.database.sql.prepare('SELECT customer_id FROM billing_users WHERE id=?').get(auth.uid).customer_id,'cus_fixture');
});
test('OIDC callback requires browser binding, signed nonce/audience and one-time state; token is never stored',async()=>{
 const f=fixture(),pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);jwk.kid='key';jwk.alg='ES256';
 const make=async claims=>{const input=base64(new TextEncoder().encode(JSON.stringify({alg:'ES256',kid:'key'})))+'.'+base64(new TextEncoder().encode(JSON.stringify(claims)));return input+'.'+base64(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},pair.privateKey,new TextEncoder().encode(input)));};
 const transport=f.env.FETCH;
 f.env.FETCH=async(url,opts)=>{
  if(url.endsWith('/.well-known/openid-configuration'))return Response.json({issuer:f.env.OIDC_ISSUER,authorization_endpoint:'https://identity.test/authorize',token_endpoint:'https://identity.test/token',jwks_uri:'https://identity.test/keys'});
  if(url.endsWith('/keys'))return Response.json({keys:[jwk]});
  if(url.endsWith('/token')){
   assert.equal(await digest(opts.body.get('code_verifier')),authUrl.searchParams.get('code_challenge'));
   return Response.json({id_token:await make({iss:f.env.OIDC_ISSUER,aud:'client',sub:'subject',nonce:authUrl.searchParams.get('nonce'),iat:seconds(),exp:seconds()+600})});
  }return transport(url,opts);
 };
 const start=await worker.fetch(new Request('https://app.test/api/auth/start',{method:'POST',headers:{Origin:'https://app.test','cf-connecting-ip':'192.0.2.1'}}),f.env);
 assert.equal(start.status,303);
 const authUrl=new URL(start.headers.get('location')),binding=start.headers.get('set-cookie').split(';')[0];
 assert.equal(authUrl.searchParams.get('code_challenge_method'),'S256');
 const callback='https://app.test/api/auth/callback?code=fake&state='+authUrl.searchParams.get('state');
 const wrong=await worker.fetch(new Request(callback),f.env);assert.match(wrong.headers.get('location'),/login=failed/);
 const success=await worker.fetch(new Request(callback,{headers:{Cookie:binding}}),f.env);
 assert.equal(success.headers.get('location'),'https://app.test/settings');assert.match(success.headers.get('set-cookie'),/HttpOnly/);
 assert.equal(f.database.sql.prepare('SELECT COUNT(*) AS n FROM billing_login').get().n,0);
 const replay=await worker.fetch(new Request(callback,{headers:{Cookie:binding}}),f.env);assert.match(replay.headers.get('location'),/login=failed/);
 const valid={iss:f.env.OIDC_ISSUER,aud:'client',sub:'subject',nonce:'expected',iat:seconds(),exp:seconds()+600};
 for(const bad of [{...valid,aud:'another'},{...valid,nonce:'wrong'},{...valid,exp:seconds()-1},{...valid,iss:'https://attacker.test'}])await assert.rejects(verifyIdToken(await make(bad),{keys:[jwk]},{issuer:f.env.OIDC_ISSUER,audience:'client',nonce:'expected'}));
 const token=await make(valid);await assert.rejects(verifyIdToken(token.slice(0,-4)+'aaaa',{keys:[jwk]},{issuer:f.env.OIDC_ISSUER,audience:'client',nonce:'expected'}));
});
test('provider failures are redacted and cannot grant access',async()=>{
 const f=fixture(),auth=await login(f);f.env.FETCH=async()=>{throw Error('secret-data-never-return');};
 const r=await worker.fetch(req('/api/billing/status',auth),f.env);
 assert.equal(r.status,503);assert.equal((await r.text()).includes('secret-data'),false);
});
