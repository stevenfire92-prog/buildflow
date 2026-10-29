import { mkdir, cp } from 'node:fs/promises';
await mkdir('public/lib',{recursive:true});
await cp('src','public',{recursive:true});
await cp('lib/quote.js','public/lib/quote.js');
console.log('Built Quote Studio static assets. Server routes remain in api/.');
