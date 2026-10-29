import {respond,requireOrigin,jsonBody,user,db,verifiedStripe,integrationId,error,settings,handled} from './_lib/server.js';
export default async function handler(req,res){return handled(res,async()=>{
 if(req.method!=='POST')throw error('Method not allowed',405);requireOrigin(req);const u=await user(req),{action}=await jsonBody(req);
 if(!['checkout','portal'].includes(action))throw error('Invalid billing action');
 const stripe=await verifiedStripe(),{origin,expectedMode}=settings();
 let rows=await db('qs_customers?user_id=eq.'+encodeURIComponent(u.id)+'&select=stripe_customer_id');let customer=rows[0]?.stripe_customer_id;
 if(action==='portal'){
  if(!customer)throw error('No billing account exists yet',404);
  const portal=await stripe.billingPortal.sessions.create({customer,return_url:origin});return respond(res,200,{url:portal.url});
 }
 if(!customer){
  const created=await stripe.customers.create({}, {idempotencyKey:'qs-customer-'+u.id});customer=created.id;
  await db('qs_customers',{method:'POST',body:{user_id:u.id,stripe_customer_id:customer},prefer:'resolution=ignore-duplicates'});
  rows=await db('qs_customers?user_id=eq.'+encodeURIComponent(u.id)+'&select=stripe_customer_id');customer=rows[0]?.stripe_customer_id;if(!customer)throw error('Unable to prepare your billing account',503);
 }
 const existing=await stripe.subscriptions.list({customer,status:'all',limit:100});if(existing.data.some(s=>['active','trialing','past_due','unpaid','incomplete','paused'].includes(s.status)))throw error('A subscription already exists. Use Manage subscription.',409);
 const price=await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);if(!price.active||price.type!=='recurring'||price.livemode!==(expectedMode==='live'))throw error('The subscription price is not ready',503);
 // A short per-user window makes retries reuse Checkout rather than create
 // multiple subscriptions. Neither price nor customer is accepted from clients.
 const session=await stripe.checkout.sessions.create({mode:'subscription',customer,line_items:[{price:price.id,quantity:1}],success_url:origin+'/?checkout=returned',cancel_url:origin+'/?checkout=cancelled',integration_identifier:integrationId(u.id+'-'+Math.floor(Date.now()/1800000)),client_reference_id:u.id},{idempotencyKey:'qs-checkout-'+u.id+'-'+Math.floor(Date.now()/1800000)});
 respond(res,200,{url:session.url});
});}
