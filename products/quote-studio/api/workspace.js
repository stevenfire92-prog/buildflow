import {respond,requireOrigin,jsonBody,user,requireMembership,db,error,handled} from './_lib/server.js';
import {normalizeQuote} from '../lib/quote.js';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export default async function handler(req,res){return handled(res,async()=>{
 if(!['GET','POST','DELETE'].includes(req.method))throw error('Method not allowed',405);
 if(req.method!=='GET')requireOrigin(req);const u=await user(req);await requireMembership(u);
 const owner='user_id=eq.'+encodeURIComponent(u.id);
 if(req.method==='GET'){const quotes=await db('qs_quotes?'+owner+'&order=updated_at.desc&limit=500');return respond(res,200,{quotes});}
 if(req.method==='POST'){
   const {quote}=await jsonBody(req);if(!uuid.test(quote?.id||''))throw error('Invalid estimate ID');let document;try{document=normalizeQuote(quote);}catch(err){throw error(err.message);}
   // A conflicting quote ID owned by another account is rejected by the RPC.
   await db('rpc/qs_save_quote',{method:'POST',body:{p_user:u.id,p_id:quote.id,p_document:document}});return respond(res,200,{ok:true});
 }
 const id=new URL(req.url,'https://workspace.local').searchParams.get('id');if(!uuid.test(id||''))throw error('Invalid estimate ID');await db('qs_quotes?'+owner+'&id=eq.'+id,{method:'DELETE'});respond(res,200,{ok:true});
});}
