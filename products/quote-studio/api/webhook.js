import {respond,rawBody,stripeClient,db,settings,error,handled} from './_lib/server.js';
export const config={api:{bodyParser:false}};
const lifecycle=new Set(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','invoice.paid','invoice.payment_failed','checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed']);
const riskTypes=new Set(['charge.dispute.created','charge.refunded','radar.early_fraud_warning.created']);
export default async function handler(req,res){return handled(res,async()=>{
 if(req.method!=='POST')throw error('Method not allowed',405);
 // Webhook can be exercised before PAYMENTS_ENABLED is switched on.
 if(!process.env.STRIPE_SECRET_KEY||!process.env.STRIPE_WEBHOOK_SECRET||!settings().authReady)throw error('Webhook storage and signing are not configured',503);
 const stripe=await stripeClient();let event;
 try{event=stripe.webhooks.constructEvent(await rawBody(req),req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET);}catch{throw error('Invalid webhook signature',400);}
 if(event.livemode!==(settings().expectedMode==='live'))throw error('Webhook environment mismatch',400);
 if(event.account&&event.account!==process.env.STRIPE_ACCOUNT_ID)throw error('Webhook account mismatch',400);
 if(!lifecycle.has(event.type)&&!riskTypes.has(event.type))return respond(res,200,{received:true,ignored:true});
 const seen=await db('qs_events?event_id=eq.'+encodeURIComponent(event.id)+'&select=event_id');if(seen.length)return respond(res,200,{received:true,duplicate:true});
 const obj=event.data.object;let customer=typeof obj.customer==='string'?obj.customer:obj.customer?.id;
 if(riskTypes.has(event.type)){
  const charge=event.type==='charge.refunded'?obj:await stripe.charges.retrieve(typeof obj.charge==='string'?obj.charge:obj.charge?.id);
  customer=typeof charge.customer==='string'?charge.customer:charge.customer?.id;
 }
 if(!customer)return respond(res,200,{received:true,ignored:true});
 const owners=await db('qs_customers?stripe_customer_id=eq.'+encodeURIComponent(customer)+'&select=user_id');
 if(!owners.length)return respond(res,200,{received:true,ignored:true});const owner=owners[0].user_id;
 if(riskTypes.has(event.type)){
  await db('rpc/qs_record_risk',{method:'POST',body:{p_event:event.id,p_user:owner,p_reason:event.type}});
 }else{
  let subId=event.type.startsWith('customer.subscription.')?obj.id:obj.subscription;
  if(event.type.startsWith('invoice.'))subId=obj.parent?.subscription_details?.subscription||obj.subscription;
  if(typeof subId==='object')subId=subId?.id;
  if(!subId)return respond(res,200,{received:true,ignored:true});
  const sub=await stripe.subscriptions.retrieve(subId,{expand:['latest_invoice']});
  if((typeof sub.customer==='string'?sub.customer:sub.customer?.id)!==customer)throw error('Subscription ownership mismatch',400);
  // Read canonical Stripe state instead of trusting an out-of-order snapshot.
  const invoice=sub.latest_invoice,paid=typeof invoice==='object'&&invoice?.status==='paid';
  const end=sub.items.data.reduce((n,i)=>Math.max(n,i.current_period_end||0),0)||sub.current_period_end||0;
  const status=sub.status==='active'&&paid?'active':sub.status==='active'?'pending_payment':sub.status;
  await db('rpc/qs_record_subscription',{method:'POST',body:{p_event:event.id,p_created:event.created,p_user:owner,p_subscription:sub.id,p_status:status,p_paid_through:new Date(end*1000).toISOString()}});
 }
 respond(res,200,{received:true});
});}
