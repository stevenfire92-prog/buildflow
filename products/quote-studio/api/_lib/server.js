import {createHash} from 'node:crypto';
export const APP='quote-studio';
export function settings(env=process.env){
 let origin='';try{const u=new URL(env.APP_URL);if(u.protocol==='https:'||(u.hostname==='localhost'&&env.NODE_ENV!=='production'))origin=u.origin;}catch{}
 const authReady=!!(origin&&/^https:\/\/[a-zA-Z0-9.-]+$/.test(env.SUPABASE_URL||'')&&env.SUPABASE_ANON_KEY&&env.SUPABASE_SERVICE_ROLE_KEY);
 const expectedMode=env.STRIPE_MODE==='live'?'live':'test';
 const keyMatches=new RegExp('^[sr]k_'+expectedMode+'_').test(env.STRIPE_SECRET_KEY||'');
 const billingReady=authReady&&env.BILLING_VERIFIED==='true'&&env.PAYMENTS_ENABLED==='true'&&!!(keyMatches&&env.STRIPE_PRICE_ID&&env.STRIPE_ACCOUNT_ID&&env.STRIPE_WEBHOOK_SECRET);
 return {origin,authReady,billingReady,expectedMode};
}
export function respond(res,status,body){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.status(status).json(body);}
export function error(message,status=400){return Object.assign(new Error(message),{status});}
export function requireOrigin(req){const {origin}=settings();if(!origin||req.headers.origin!==origin)throw error('Request origin is not allowed',403);}
export async function jsonBody(req){if(req.body&&typeof req.body==='object'&&!Buffer.isBuffer(req.body))return req.body;const raw=typeof req.body==='string'?req.body:await rawBody(req);try{return JSON.parse(raw);}catch{throw error('Invalid JSON');}}
export async function rawBody(req){let size=0;const chunks=[];for await(const chunk of req){size+=Buffer.byteLength(chunk);if(size>200000)throw error('Request too large',413);chunks.push(Buffer.from(chunk));}return Buffer.concat(chunks);}
export async function db(path,{method='GET',body,prefer}={}){
 if(!settings().authReady)throw error('Account storage is not configured',503);
 const response=await fetch(process.env.SUPABASE_URL+'/rest/v1/'+path,{method,headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw error('Account storage is unavailable',503);
 const raw=await response.text();return raw?JSON.parse(raw):null;
}
export async function user(req){
 if(!settings().authReady)throw error('Accounts are not open yet. Try the local workspace.',503);
 const header=req.headers.authorization||'';if(!header.startsWith('Bearer '))throw error('Please sign in',401);
 const response=await fetch(process.env.SUPABASE_URL+'/auth/v1/user',{headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:header},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw error('Your sign-in has expired. Please sign in again.',401);
 const u=await response.json();if(!u.id||!u.email_confirmed_at)throw error('A verified account is required',401);return u;
}
export function founder(u){return !!process.env.FOUNDER_USER_ID&&u.id===process.env.FOUNDER_USER_ID;}
export async function entitled(u){
 if(founder(u))return true;
 if(!settings().billingReady)return false;
 const risk=await db('qs_risk_flags?user_id=eq.'+encodeURIComponent(u.id)+'&select=user_id&limit=1');if(risk?.length)return false;
 const rows=await db('qs_subscriptions?user_id=eq.'+encodeURIComponent(u.id)+'&status=eq.active&select=paid_through&limit=10');
 return rows.some(r=>new Date(r.paid_through).getTime()>Date.now());
}
export async function requireMembership(u){if(!await entitled(u))throw error('An active Studio membership is required for cloud estimates',402);}
export async function stripeClient(){const {default:Stripe}=await import('stripe');return new Stripe(process.env.STRIPE_SECRET_KEY,{apiVersion:'2026-09-30.endive',maxNetworkRetries:2,timeout:12000});}
export async function verifiedStripe(){
 if(!settings().billingReady)throw error('Subscriptions are not open for purchase yet',503);
 const stripe=await stripeClient();const account=await stripe.accounts.retrieve();if(account.id!==process.env.STRIPE_ACCOUNT_ID)throw error('Billing account verification failed',503);return stripe;
}
export function integrationId(seed){return 'quote_studio_'+[...createHash('sha256').update(seed).digest().subarray(0,8)].map(x=>String.fromCharCode(97+x%26)).join('');}
export async function handled(res,fn){try{await fn();}catch(err){respond(res,err.status||503,{error:err.status?err.message:'Service temporarily unavailable. Please try again.'});}}
