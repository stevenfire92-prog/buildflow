export default function handler(req,res) {
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="GET"){res.setHeader("Allow","GET");return res.status(405).json({error:"method_not_allowed"});}
 if(process.env.VERCEL_ENV!=="preview"||process.env.AUTH_PREVIEW_ENABLED!=="true"||!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({error:"preview_not_configured"});
 return res.status(200).json({googleClientId:process.env.GOOGLE_CLIENT_ID});
}
