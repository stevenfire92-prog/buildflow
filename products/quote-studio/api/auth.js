import {respond,settings,requireOrigin,jsonBody,error,handled} from './_lib/server.js';
export default async function handler(req,res){return handled(res,async()=>{
 if(req.method!=='POST')throw error('Method not allowed',405);requireOrigin(req);
 const s=settings();if(!s.authReady)throw error('Account sign-in is not open yet',503);
 const {email}=await jsonBody(req);if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw error('Enter a valid email address');
 // Supabase enforces email OTP rate limits. Tokens return in the URL fragment and
 // are removed immediately by app.js; no refresh tokens are retained.
 const r=await fetch(process.env.SUPABASE_URL+'/auth/v1/otp?redirect_to='+encodeURIComponent(s.origin),{method:'POST',headers:{apikey:process.env.SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,create_user:true}),signal:AbortSignal.timeout(10000)});
 if(r.status===429)throw error('Please wait before requesting another sign-in email',429);
 if(!r.ok)throw error('Sign-in email service is unavailable',503);respond(res,200,{ok:true});
});}
