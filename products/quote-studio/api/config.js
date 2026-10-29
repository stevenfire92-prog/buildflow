import {respond,settings} from './_lib/server.js';
export default function handler(req,res){if(req.method!=='GET')return respond(res,405,{error:'Method not allowed'});const s=settings();respond(res,200,{app:'quote-studio',authReady:s.authReady,billingReady:s.billingReady,priceLabel:s.billingReady?(process.env.PRICE_LABEL||'See price at Stripe Checkout'):null});}
