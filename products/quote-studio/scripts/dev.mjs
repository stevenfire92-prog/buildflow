import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('public'),port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
 try{
  res.status=n=>{res.statusCode=n;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')){const route=url.pathname.slice(5);if(!['config','auth','workspace','billing','webhook'].includes(route))throw Error();const {default:handler}=await import('../api/'+route+'.js');return await handler(req,res);}
  const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root+sep))throw Error();
  const data=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream');res.end(data);
 }catch{res.statusCode=404;res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log('Quote Studio preview listening on '+port));
