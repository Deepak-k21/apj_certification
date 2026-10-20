import fs from 'node:fs';
const source=fs.readFileSync('research/tve-main.js','utf8');
function literal(name){
 const start=source.indexOf(name+'=[{');if(start<0)throw Error(name);
 const end=source.indexOf(']',start);
 const raw=source.slice(start+name.length+1,end+1);
 return JSON.parse(raw.replace(/([{,])([a-zA-Z][\w]*):/g,'$1"$2":'));
}
const groups={py:'CQI & IRCA',hy:'Exemplar Global',fy:'Health & safety',my:'Fire safety',gy:'Environment',vy:'Sustainability',yy:'Lifting & rigging',by:'Scaffolding',xy:'First aid'};
const catalog=[];
for(const [key,group] of Object.entries(groups))for(const item of literal(key)){
 const title=(item.selection||item.name).trim();
 const track=title.includes('Lead Auditor')?'Lead Auditor':title.includes('Internal Auditor')?'Internal Auditor':/Transition|Conversion|Migration/.test(title)?'Transition':title.includes('Verifier')?'Lead Verifier':'Health & Safety';
 const standard=title.match(/ISO \d+(?::\d+)?/)?.[0]||(/FSSC/.test(title)?'FSSC 22000':'Workplace safety');
 catalog.push({id:(key+'-'+title.toLowerCase().replace(/[^a-z0-9]+/g,'-')).replace(/-$/,''),title,track,standard,referencePathway:key==='py'||key==='hy'?group:'EOSH',category:group,referenceUrl:'https://www.tvecert.org/#/training',referenceBrochure:item.pdf?.trim()||null,referenceDuration:item.duration||null,priceMinor:null,sessions:[],availability:'enquiry'});
}
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync('data/catalog.json',JSON.stringify(catalog,null,2));
console.log('Extracted',catalog.length,'reference courses:',Object.fromEntries(Object.values(groups).map(g=>[g,catalog.filter(c=>c.category===g).length])));
