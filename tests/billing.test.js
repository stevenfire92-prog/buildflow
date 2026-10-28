import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createBillingHandlers, choosePrice, returnUrls } from '../api/_billing/service.js';
import config from '../api/_billing/config.js';
import { resolveAppConfig } from '../src/lib/app-config.js';
import StripeClient from 'stripe';

function fixture(options = {}) {
  const first = config.plans[config.defaultPlan].monthly;
  const state = { calls: [], sessions: [], subscriptions: options.subscriptions || [] };
  const user = { id: 'user_a', email: 'billing-test@example.invalid' };
  const customer = { id: 'cus_owned', metadata: { base44_app_id: config.appId, base44_user_id: user.id } };
  const env = { STRIPE_MODE: 'live', STRIPE_SECRET_KEY: 'sk_live_not_a_real_key', CHECKOUT_ENABLED: 'true', STRIPE_WEBHOOK_SECRET: 'whsec_test_only', ...options.env };
  class FakeStripe {
    constructor() {
      this.accounts = { retrieve: async () => {state.calls.push('account');return { id: options.account || config.accountId, charges_enabled: options.charges !== false };} };
      this.prices = { retrieve: async id => ({ id, active: true, livemode: true, currency: first.currency, unit_amount: first.amount, recurring: first.interval ? { interval: first.interval } : null, ...options.price }) };
      this.customers = { list: async () => ({ data: options.customers || [customer], has_more: false }), create: async () => customer };
      this.checkout = { sessions: {
        create: async params => {state.sessions.push(params);return { id:'cs_live_abc',url:'https://checkout.stripe.com/c/pay/cs_live_abc' };},
        retrieve: async () => ({id:'cs_live_abc',livemode:true,client_reference_id:user.id,metadata:{base44_app_id:config.appId},status:'complete',payment_status:'paid', ...options.session}),
      }};
      this.subscriptions = { list: async () => ({ data: state.subscriptions, has_more: false }) };
      this.billingPortal = { sessions: { create: async () => ({url:'https://billing.stripe.com/p/session/test'}) } };
      this.webhooks = new StripeClient('sk_test_fixture').webhooks;
      this.events = { retrieve: async id => ({id, livemode:true, type:'checkout.session.completed',...options.canonical}) };
    }
  }
  const createClient = () => ({ auth: { me: async () => {if(options.authError)throw options.authError;return user;} } });
  const handlers = createBillingHandlers({StripeClient:FakeStripe,createClient,config,env});
  async function call(action, body = {}, extra = {}) {
    const req = { method:'POST',headers:{ authorization:'Bearer test-user-token' },body,...extra };
    const res = {headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.statusCode=s;return this;},json(v){this.body=v;return this;} };
    await handlers[action](req,res);return res;
  }
  return {call,state,env,handlers};
}

test('external config supplies correct app ID and hosted API',()=>{const x=resolveAppConfig({},'example.vercel.app');assert.equal(x.appId,config.appId);assert.equal(x.serverUrl,'https://base44.app');assert.equal(x.paymentsBackend,'vercel');});
test('Base44 hosting keeps same-origin API unless explicitly overridden',()=>assert.equal(resolveAppConfig({},'my.base44.app').serverUrl,''));
test('custom domains can explicitly select the Vercel payment backend',()=>assert.equal(resolveAppConfig({VITE_PAYMENTS_BACKEND:'vercel'},'example.com').paymentsBackend,'vercel'));
test('return URL merges existing query safely',()=>{const x=returnUrls(config.origin,'/apps?app=fitness');assert.equal(new URL(x.cancel_url).searchParams.get('app'),'fitness');assert.equal(new URL(x.cancel_url).searchParams.get('checkout'),'cancelled');});
for(const path of ['//evil.example','https://evil.example','/\\evil.example'])test(`reject external return ${path}`,()=>assert.throws(()=>returnUrls(config.origin,path)));
test('reject arbitrary price, plan and mode overrides',()=>{for(const body of [{priceId:'price_attacker'},{mode:'payment'},{plan:'__proto__'},{billing:'weekly'}])assert.throws(()=>choosePrice(config,body));});
test('checkout authenticates before contacting Stripe',async()=>{const f=fixture();const r=await f.call('checkout',{}, {headers:{}});assert.equal(r.statusCode,401);assert.deepEqual(f.state.calls,[]);});
test('checkout fails closed without a key',async()=>{const f=fixture({env:{STRIPE_SECRET_KEY:''}});assert.equal((await f.call('checkout')).statusCode,503);assert.equal(f.state.sessions.length,0);});
test('checkout fails closed for key mode mismatch',async()=>{const f=fixture({env:{STRIPE_SECRET_KEY:'sk_test_fixture'}});assert.equal((await f.call('checkout')).statusCode,503);});
test('checkout rejects a key for the wrong account',async()=>{const f=fixture({account:'acct_wrong'});const r=await f.call('checkout');assert.equal(r.body.error,'stripe_account_mismatch');assert.equal(f.state.sessions.length,0);});
test('disabled live charges prevent checkout',async()=>{const f=fixture({charges:false});assert.equal((await f.call('checkout')).body.error,'stripe_account_not_ready');});
for(const price of [{unit_amount:1},{currency:'zzz'},{active:false},{livemode:false}])test(`reject changed price ${JSON.stringify(price)}`,async()=>{const f=fixture({price});assert.equal((await f.call('checkout')).body.error,'price_configuration_mismatch');assert.equal(f.state.sessions.length,0);});
test('checkout uses server catalog and verified identity',async()=>{const f=fixture();const r=await f.call('checkout');assert.equal(r.statusCode,200);const s=f.state.sessions[0];assert.equal(s.customer,'cus_owned');assert.equal(s.line_items[0].price,config.plans[config.defaultPlan].monthly.id);assert.equal(s.client_reference_id,'user_a');assert.equal(s.metadata.base44_app_id,config.appId);assert.equal(s.payment_method_types,undefined);});
test('reject foreign browser origin',async()=>{const f=fixture();assert.equal((await f.call('checkout',{}, {headers:{authorization:'Bearer token',origin:'https://evil.example'}})).statusCode,403);});
test('verify refuses another user checkout session',async()=>{const f=fixture({session:{client_reference_id:'user_b'}});assert.equal((await f.call('verify',{sessionId:'cs_live_abc'})).statusCode,403);});
test('verify cannot convert unpaid status into success',async()=>{const f=fixture({session:{payment_status:'unpaid'}});assert.equal((await f.call('verify',{sessionId:'cs_live_abc'})).body.paid,false);});
test('verify confirms paid owned checkout',async()=>{const f=fixture();assert.equal((await f.call('verify',{sessionId:'cs_live_abc'})).body.paid,true);});
test('anonymous entitlement is free',async()=>{const f=fixture();assert.equal((await f.call('entitlements',{}, {headers:{}})).body.plan,'free');});
test('only owned active subscriptions grant access',async()=>{const p=config.defaultPlan;const f=fixture({subscriptions:[{status:'active',metadata:{base44_app_id:config.appId,base44_user_id:'user_a',plan:p}}]});assert.equal((await f.call('entitlements')).body.plan,p);});
test('canceled, foreign and forged subscription records do not grant access',async()=>{const p=config.defaultPlan;const f=fixture({subscriptions:[{status:'canceled',metadata:{base44_app_id:config.appId,base44_user_id:'user_a',plan:p}},{status:'active',metadata:{base44_app_id:'other_app',base44_user_id:'user_a',plan:p}},{status:'active',metadata:{base44_app_id:config.appId,base44_user_id:'user_b',plan:p}}]});assert.equal((await f.call('entitlements')).body.plan,'free');});
test('GET checkout is rejected',async()=>{const f=fixture();assert.equal((await f.call('checkout',{}, {method:'GET'})).statusCode,405);});
test('malformed JSON is rejected',async()=>{const f=fixture();assert.equal((await f.call('checkout','{')).statusCode,400);});
test('webhook rejects missing signature',async()=>{const f=fixture();assert.equal((await f.call('webhook')).body.error,'missing_signature');});
async function hook(f, event, signature) {
 const payload=JSON.stringify(event);const req=Readable.from([Buffer.from(payload)]);req.method='POST';req.headers={'stripe-signature':signature || StripeClient.webhooks.generateTestHeaderString({payload,secret:'whsec_test_only'})};
 const res={setHeader(){},status(n){this.statusCode=n;return this;},json(b){this.body=b;return this;}};await f.handlers.webhook(req,res);return res;
}
test('webhook verifies raw signature and canonical event',async()=>{const f=fixture();const e={id:'evt_ok',type:'checkout.session.completed',livemode:true,data:{object:{}}};assert.equal((await hook(f,e)).statusCode,200);});
test('webhook rejects invalid signatures',async()=>{const f=fixture();assert.equal((await hook(f,{},'t=1,v1=invalid')).body.error,'invalid_signature');});
test('webhook refuses test events on live handler',async()=>{const f=fixture();assert.equal((await hook(f,{id:'evt_test',type:'checkout.session.completed',livemode:false})).body.error,'event_mode_mismatch');});
test('replayed webhook is idempotent',async()=>{const f=fixture();const e={id:'evt_ok',type:'checkout.session.completed',livemode:true};assert.equal((await hook(f,e)).statusCode,200);assert.equal((await hook(f,e)).statusCode,200);assert.equal(f.state.sessions.length,0);});
