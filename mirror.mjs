import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile), root=path.resolve('dist'), origin='http://www.apjcertification.com';
const records=new Map(), queue=[];
const ignored=/\/(?:wp-json|feed|comments\/feed|wp-admin)(?:\/|$)|xmlrpc\.php|wlwmanifest|[?&](?:replytocom|s)=/;
function add(raw,base=origin+'/',asset=false){
 raw=raw.replace(/&amp;|&#0?38;/g,'&');
 if(!raw||/^(?:data:|mailto:|tel:|javascript:|#)/i.test(raw))return;
 let u;try{u=new URL(raw,base)}catch{return}
 if(!/^https?:$/.test(u.protocol))return;
 const own=/^(?:www\.)?apjcertification\.com$/.test(u.hostname);
 if(!own&&!asset)return;
 if(ignored.test(u.pathname+u.search))return;
 u.hash='';if(own){u.protocol='http:';u.hostname='www.apjcertification.com';}
 const isPage=own&&!path.extname(u.pathname)&&!u.pathname.startsWith('/wp-');
 const local=isPage?u.pathname.replace(/\/?$/,'/')+'index.html':(own?u.pathname:'/_external/'+u.hostname+u.pathname);
 const key=own?u.origin+u.pathname:u.href;
 if(!records.has(key)){const r={url:u.href,local:local.replace(/^\//,''),page:isPage,status:'pending'};records.set(key,r);queue.push(r)}
 return '/'+local.replace(/^\//,'').replace(/index\.html$/,'');
}
function discover(text,base,css=false){
 if(!css){
  for(const m of text.matchAll(/<(a|link|script|img|source|iframe)\b[^>]*?(?:href|src)\s*=\s*["']([^"']+)["']/gi)){
   if(m[1]==='iframe')continue;
   if(m[1]==='link'&&!/stylesheet|icon/i.test(m[0]))continue;
   if(/stats\.wp\.com/.test(m[2]))continue;
   add(m[2],base,m[1]!=='a');
  }
  for(const m of text.matchAll(/srcset=["']([^"']+)["']/gi))for(const s of m[1].split(','))add(s.trim().split(/\s+/)[0],base,true);
 }
 for(const m of text.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi))add(m[1],base,true);
}
add(origin+'/');
while(queue.length){
 const batch=queue.splice(0,6);
 await Promise.all(batch.map(async r=>{
  const file=path.join(root,r.local);await fs.mkdir(path.dirname(file),{recursive:true});
  try{
   const {stdout}=await exec('curl.exe',['-sS','-L','--fail','--retry','2','--max-time','40',r.url,'-o',file],{maxBuffer:1024*1024});
   r.status='ok';
   if(r.page||/\.css$/i.test(r.local)){const t=await fs.readFile(file,'utf8');discover(t,r.url,/\.css$/i.test(r.local));}
  }catch(e){r.status='failed';r.error=e.stderr?.slice(0,250)||e.message;}
  console.log(r.status,r.local);
 }));
}
// Rewrite only successfully downloaded resources. Retain external destinations.
function localize(raw,base){
 let u;try{u=new URL(raw.replace(/&amp;|&#0?38;/g,'&'),base)}catch{return raw}
 const own=/^(www\.)?apjcertification\.com$/.test(u.hostname);
 const key=own?origin+u.pathname:new URL(u.href.split('#')[0]).href;
 const r=records.get(key);if(r?.status!=='ok')return raw;
 return '/'+r.local.replace(/index\.html$/,'')+u.hash;
}
for(const r of records.values()){
 if(r.status!=='ok'||(!r.page&&!/\.css$/i.test(r.local)))continue;
 const file=path.join(root,r.local);let t=await fs.readFile(file,'utf8');
 t=t.replace(/((?:href|src|action)\s*=\s*["'])([^"']+)(["'])/gi,(m,a,b,c)=>a+localize(b,r.url)+c);
 t=t.replace(/(srcset=["'])([^"']+)(["'])/gi,(m,a,b,c)=>a+b.split(',').map(s=>{const bits=s.trim().split(/\s+/);bits[0]=localize(bits[0],r.url);return bits.join(' ')}).join(', ')+c);
 t=t.replace(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi,(m,u)=>'url("'+localize(u,r.url)+'")');
 if(r.page){
  t=t.replace(/<script\b[^>]*src=["'][^"']*(?:stats\.wp\.com|contact-form-7)[^"']*["'][^>]*><\/script>/gi,'');
  t=t.replace(/<title>\s*<\/title>/,'<title>APJ Certification</title>');
  t=t.replace('</body>','<script src="/clone-forms.js"></script></body>');
 }
 await fs.writeFile(file,t);
}
await fs.writeFile('mirror-report.json',JSON.stringify([...records.values()],null,2));
console.log('TOTAL',records.size,'PAGES',[...records.values()].filter(r=>r.page).length,'FAILED',[...records.values()].filter(r=>r.status!=='ok').length);
