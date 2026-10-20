import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('public');
const report=JSON.parse(await fs.readFile('mirror-report.json','utf8'));
let checked=0;const missing=[];
const pages=Object.keys(JSON.parse(await fs.readFile('lib/legacy-pages.json','utf8'))).map(p=>({local:p.slice(1)+'index.html'}));
for(const page of pages){
 const text=await fs.readFile(path.join(root,page.local),'utf8');
 for(const match of text.matchAll(/(?:href|src)=["'](\/[^"']*)["']/g)){
  const u=new URL(match[1],'http://local');let file=path.join(root,decodeURIComponent(u.pathname));
  if(u.pathname.endsWith('/'))file=path.join(file,'index.html');
  try{await fs.access(file);checked++;}catch{missing.push({page:page.local,url:match[1]});}
 }
}
console.log(JSON.stringify({pages:pages.length,localReferencesChecked:checked,missing},null,2));
if(missing.length)process.exitCode=1;
