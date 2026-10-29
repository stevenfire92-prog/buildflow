import {randomBytes,createHash} from 'node:crypto';
import {respond,settings,requireOrigin,jsonBody,user,requireMembership,db,error,handled} from './_lib/server.js';
import {publicQuote} from '../lib/cleaning.js';
export const hashToken=token=>createHash('sha256').update(token).digest('hex');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export default async function handler(req,res){return handled(res,async()=>{
 if(!['GET','POST'].includes(req.method))throw error('Method not allowed',405);
 if(!settings().authReady)throw error('Customer approvals require connected cloud storage',503);
 if(req.method==='POST')requireOrigin(req);
 const input=req.method==='POST'?await jsonBody(req):Object.fromEntries(new URL(req.url,'https://request.local').searchParams);
 if(req.method==='POST'&&['create','revoke'].includes(input.action)){
  const u=await user(req);await requireMembership(u);if(!uuid.test(input.quoteId||''))throw error('Invalid estimate ID');
  const qs=await db('qs_quotes?user_id=eq.'+encodeURIComponent(u.id)+'&id=eq.'+input.quoteId+'&limit=1');if(!qs.length)throw error('Estimate not found',404);
  if(input.action==='revoke'){await db('qs_approvals?quote_id=eq.'+input.quoteId+'&user_id=eq.'+encodeURIComponent(u.id),{method:'PATCH',body:{revoked:true}});return respond(res,200,{ok:true});}
  const token=randomBytes(32).toString('hex'),expiresAt=new Date(Date.now()+14*86400000).toISOString();
  const created=await db('rpc/qs_create_approval',{method:'POST',body:{p_token_hash:hashToken(token),p_quote:input.quoteId,p_user:u.id,p_expected:qs[0].document,p_snapshot:publicQuote(qs[0].document),p_expires:expiresAt}});
  if(!created)throw error('The estimate changed. Please create a new review link.',409);
  return respond(res,200,{url:settings().origin+'/approve.html#'+token,expiresAt});
 }
 const token=String(input.token||'');if(!/^[a-f0-9]{64}$/.test(token))throw error('Invalid review link',404);
 const tokenHash=hashToken(token),rows=await db('qs_approvals?token_hash=eq.'+tokenHash+'&select=snapshot,revoked,expires_at,accepted_at,accepted_name&limit=1'),row=rows[0];
 if(!row||row.revoked||new Date(row.expires_at).getTime()<=Date.now())throw error('This review link has expired or was revoked',410);
 if(req.method==='GET'||input.action==='view')return respond(res,200,{quote:publicQuote(row.snapshot),expiresAt:row.expires_at,acceptedAt:row.accepted_at,acceptedName:row.accepted_name});
 if(input.action!=='accept'||input.consent!==true||typeof input.name!=='string'||input.name.trim().length<2||input.name.length>100)throw error('Enter your name and confirm that you approve this estimate');
 const result=await db('rpc/qs_accept_quote',{method:'POST',body:{p_token_hash:tokenHash,p_name:input.name.trim()}});
 if(!result?.accepted_at)throw error('The estimate changed or the link expired. Ask for a new link.',409);
 respond(res,200,{acceptedAt:result.accepted_at,acceptedName:result.accepted_name});
});}
