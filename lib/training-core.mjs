import catalog from '../data/catalog.json' with { type: 'json' };
import offerings from '../data/offerings.json' with { type: 'json' };
import certificationStandards from '../data/certification-standards.json' with { type: 'json' };
import courseMedia from '../data/course-media.json' with { type: 'json' };

export const courseCatalog = catalog.filter(c => c.referencePathway === 'APJ');
export function publicCatalog(config = offerings) {
  return courseCatalog.map(c => ({ ...c, ...courseMedia[c.id], ...(config.courses[c.id] || {}), id: c.id, currency: config.currency, timezone: config.timezone }));
}
export class ApiError extends Error { constructor(message, status=400) { super(message); this.status=status; } }
export const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const text=(v,label,max=200,optional=false)=>{if(optional&&(v===undefined||v===''))return '';if(typeof v!=='string'||!v.trim()||v.length>max)throw new ApiError(`Please enter a valid ${label}.`);return v.trim();};
const email=v=>{v=text(v,'email',254);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))throw new ApiError('Please enter a valid email.');return v;};
export function validateCertification(input) {
 if(!Array.isArray(input.standards)||!input.standards.length||input.standards.length>10)throw new ApiError('Select at least one certification standard.');
 const selected=[...new Set(input.standards)];
 if(selected.some(id=>!certificationStandards.some(s=>s.id===id)))throw new ApiError('Please choose a listed certification standard.');
 if(!['initial','renewal','transfer','not-sure'].includes(input.applicationType))throw new ApiError('Choose a certification application type.');
 if(input.consent!==true)throw new ApiError('Confirm permission to process the application details.');
 return {kind:'certification',items:[],standards:selected.map(id=>certificationStandards.find(s=>s.id===id)),applicationType:input.applicationType,organisation:{name:text(input.organisation?.name,'organisation name'),registrationNumber:text(input.organisation?.registrationNumber,'business registration number',100,true),industry:text(input.organisation?.industry,'industry',150),address:text(input.organisation?.address,'business address',500),employeeCount:text(input.organisation?.employeeCount,'employee count',50)},scope:text(input.scope,'certification scope',3000),contact:{name:text(input.contact?.name,'contact name',100),email:email(input.contact?.email),phone:text(input.contact?.phone,'contact phone',30),role:text(input.contact?.role,'job title',100,true)},consentVersion:'2026-10-23'};
}
export function validateRegistration(input, config=offerings) {
  if(!['self','company'].includes(input.sponsor))throw new ApiError('Choose a registration type.');
  if(!Array.isArray(input.items)||!input.items.length||input.items.length>15)throw new ApiError('Select between 1 and 15 courses.');
  const courses=publicCatalog(config), seen=new Set();let total=0, priced=true;
  const items=input.items.map(item=>{
    const c=courses.find(c=>c.id===item.courseId);if(!c||seen.has(c.id))throw new ApiError('Invalid or duplicate course.');seen.add(c.id);
    if(!Array.isArray(item.participants)||!item.participants.length||item.participants.length>20)throw new ApiError('Add between 1 and 20 participants per course.');
    const participants=item.participants.map(p=>({name:text(p.name,'participant name',100),email:email(p.email),phone:text(p.phone,'phone number',30,true)}));
    const session=c.sessions.find(s=>s.id===item.sessionId);
    if(item.sessionId&&!session)throw new ApiError('This session is no longer available. Please choose again.');
    if(session&&(session.closed||Date.parse(session.start)<=Date.now()))throw new ApiError('This session is closed. Please select a future session.');
    const price=c.priceMinor;
    if(!Number.isSafeInteger(price)||price<=0||!session){priced=false;}
    else total+=price*participants.length;
    return {courseId:c.id,title:c.title,session:session||null,priceMinor:Number.isSafeInteger(price)?price:null,participants};
  });
  if(!Number.isSafeInteger(total)||total>100000000)throw new ApiError('Registration total exceeds the supported limit.');
  if(input.consent!==true)throw new ApiError('Confirm permission to process participant details.');
  return {items,sponsor:input.sponsor,contact:{name:text(input.contact?.name,'contact name',100),email:email(input.contact?.email),phone:text(input.contact?.phone,'contact phone',30)},company:input.sponsor==='company'?{name:text(input.company?.name,'company name'),billingEmail:email(input.company?.billingEmail),address:text(input.company?.address,'billing address',500),reference:text(input.company?.reference,'company reference',100,true)}:null,currency:config.currency,totalMinor:priced?total:null,consentVersion:'2026-10-19',status:priced?'registered':'awaiting_quote'};
}
export async function hmac(secret,message){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(message))),n=>n.toString(16).padStart(2,'0')).join('');}
export function constantEqual(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
const hash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),n=>n.toString(16).padStart(2,'0')).join('');
const random=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
function sessionToken(req){return req.headers.get('cookie')?.match(/(?:^|;\s*)apj_registration=([a-f0-9]{64})(?:;|$)/)?.[1];}
async function body(req){const raw=await req.text();if(raw.length>100000)throw new ApiError('Registration is too large.',413);try{return JSON.parse(raw);}catch{throw new ApiError('Invalid request.');}}
function ready(env,config){return config.paymentsEnabled===true&&!!env.RAZORPAY_KEY_ID&&!!env.RAZORPAY_KEY_SECRET;}
function publicRecord(row){return {id:row.id,reference:row.reference,status:row.status,currency:row.currency,totalMinor:row.total_minor,createdAt:row.created_at,paymentId:row.payment_id||null,orderId:row.order_id||null,...JSON.parse(row.details)};}

export function createTrainingApi({config=offerings,fetcher=fetch}={}){
 const razor=async(env,path,method='GET',data)=>{
   const res=await fetcher('https://api.razorpay.com/v1/'+path,{method,headers:{Authorization:'Basic '+btoa(env.RAZORPAY_KEY_ID+':'+env.RAZORPAY_KEY_SECRET),'Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{})});
   if(!res.ok)throw new ApiError('The payment provider could not complete this request. Please contact APJ with your registration reference.',502);
   return res.json();
 };
 async function owned(req,db,id){const token=sessionToken(req);if(!token)throw new ApiError('Please use the browser in which you registered.',401);const row=await db.prepare('SELECT * FROM registrations WHERE id = ? AND session_hash = ?').bind(id,await hash(token)).first();if(!row)throw new ApiError('Registration not found.',404);return row;}
 async function reconcile(env,db,row,paymentId){
  const payment=await razor(env,'payments/'+encodeURIComponent(paymentId));
  if(payment.order_id!==row.order_id||payment.amount!==row.total_minor||payment.currency!==row.currency)throw new ApiError('Payment details do not match this registration.',400);
  const status=payment.status==='captured'?'paid':payment.status==='authorized'?'payment_pending':payment.status==='refunded'?'refunded':'payment_failed';
  await db.prepare("UPDATE registrations SET status = CASE WHEN status = 'refunded' OR (status = 'paid' AND ? != 'refunded') THEN status ELSE ? END, payment_id = CASE WHEN status IN ('paid','refunded') THEN payment_id ELSE ? END, updated_at = ? WHERE id = ?").bind(status,status,paymentId,new Date().toISOString(),row.id).run();
  return status;
 }
 return async function handle(req,env){
  try{
   const url=new URL(req.url), route=url.pathname.replace(/\/$/,'');
   if(req.method==='GET'&&route==='/api/training/catalog')return json({courses:publicCatalog(config),currency:config.currency,timezone:config.timezone,paymentsAvailable:ready(env,config)});
   const webhook=route==='/api/training/webhook';
   if(req.method==='POST'&&!webhook&&req.headers.get('origin')!==url.origin)throw new ApiError('Please submit from the APJ website.',403);
   const db=env.DB;if(!db)throw new ApiError('Registration service is temporarily unavailable. Please try again.',503);
   if(req.method==='POST'&&route==='/api/training/certification-registrations'){
    const input=await body(req),details=validateCertification(input);
    const requestId=text(input.requestId,'request identifier',64);if(!/^[a-f0-9-]{36}$/.test(requestId))throw new ApiError('Invalid request identifier.');
    const token=sessionToken(req)||random(), sessionHash=await hash(token), now=new Date().toISOString();
    const previous=await db.prepare('SELECT * FROM registrations WHERE request_id = ? AND session_hash = ?').bind(requestId,sessionHash).first();
    const headers={'Set-Cookie':`apj_registration=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${url.protocol==='https:'?'; Secure':''}`};
    if(previous){if(JSON.parse(previous.details).kind!=='certification')throw new ApiError('This request identifier is already in use.',409);return json(publicRecord(previous),200,headers);}
    const recent=await db.prepare('SELECT COUNT(*) AS n FROM registrations WHERE session_hash = ? AND created_at > ?').bind(sessionHash,new Date(Date.now()-3600000).toISOString()).first();
    if(recent.n>=10)throw new ApiError('Too many requests. Please try again later.',429);
    const id=crypto.randomUUID(),reference='APJC-'+id.slice(0,8).toUpperCase();
    await db.prepare('INSERT INTO registrations (id, reference, session_hash, request_id, status, currency, total_minor, details, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id,reference,sessionHash,requestId,'awaiting_quote',config.currency,null,JSON.stringify(details),now,now).run();
    return json({id,reference,status:'awaiting_quote',currency:config.currency,totalMinor:null,createdAt:now,...details},201,headers);
   }
   const certificationMatch=route.match(/^\/api\/training\/certification-registrations\/([a-f0-9-]{36})$/);
   if(certificationMatch){if(req.method!=='GET')throw new ApiError('Method not allowed.',405);const row=await owned(req,db,certificationMatch[1]);if(JSON.parse(row.details).kind!=='certification')throw new ApiError('Application not found.',404);return json(publicRecord(row));}
   if(req.method==='POST'&&route==='/api/training/registrations'){
    const input=await body(req), data=validateRegistration(input,config);
    const requestId=text(input.requestId,'request identifier',64);if(!/^[a-f0-9-]{36}$/.test(requestId))throw new ApiError('Invalid request identifier.');
    const token=sessionToken(req)||random(), sessionHash=await hash(token), now=new Date().toISOString();
    const previous=await db.prepare('SELECT * FROM registrations WHERE request_id = ? AND session_hash = ?').bind(requestId,sessionHash).first();
    const headers={'Set-Cookie':`apj_registration=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${url.protocol==='https:'?'; Secure':''}`};
    if(previous)return json(publicRecord(previous),200,headers);
    const recent=await db.prepare('SELECT COUNT(*) AS n FROM registrations WHERE session_hash = ? AND created_at > ?').bind(sessionHash,new Date(Date.now()-3600000).toISOString()).first();
    if(recent.n>=10)throw new ApiError('Too many registrations. Please try again later.',429);
    const id=crypto.randomUUID(), reference='APJ-'+id.slice(0,8).toUpperCase();
    const {status,totalMinor,currency,...details}=data;
    await db.prepare('INSERT INTO registrations (id, reference, session_hash, request_id, status, currency, total_minor, details, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id,reference,sessionHash,requestId,status,currency,totalMinor,JSON.stringify(details),now,now).run();
    return json({id,reference,status,currency,totalMinor,createdAt:now,...details},201,headers);
   }
   const match=route.match(/^\/api\/training\/registrations\/([a-f0-9-]{36})(?:\/(order|verify|refresh))?$/);
   if(match){
    const row=await owned(req,db,match[1]);
    if(req.method==='GET'&&!match[2])return json(publicRecord(row));
    if(req.method!=='POST')throw new ApiError('Method not allowed.',405);
    if(!ready(env,config))throw new ApiError('Online payments are not yet available. Your registration remains saved; no payment has been taken.',503);
    if(match[2]==='order'){
     if(row.status==='paid'||row.status==='refunded')throw new ApiError('This registration has already been paid.',409);
     if(!row.total_minor)throw new ApiError('A course date and confirmed fee are required before payment.',409);
     if(row.order_id)return json({orderId:row.order_id,amount:row.total_minor,currency:row.currency,keyId:env.RAZORPAY_KEY_ID});
     // A single database compare-and-set prevents parallel requests creating multiple orders.
     const lock=await db.prepare("UPDATE registrations SET status = 'creating_order', updated_at = ? WHERE id = ? AND order_id IS NULL AND status = 'registered'").bind(new Date().toISOString(),row.id).run();
     if(lock.meta.changes!==1)throw new ApiError('Payment preparation is in progress or requires review. Please contact APJ before retrying.',409);
     try{
      const order=await razor(env,'orders','POST',{amount:row.total_minor,currency:row.currency,receipt:row.reference,notes:{registration_id:row.id}});
      if(typeof order.id!=='string'||order.amount!==row.total_minor||order.currency!==row.currency)throw new Error('Unexpected provider response');
      await db.prepare("UPDATE registrations SET order_id = ?, status = 'payment_due', updated_at = ? WHERE id = ?").bind(order.id,new Date().toISOString(),row.id).run();
      return json({orderId:order.id,amount:row.total_minor,currency:row.currency,keyId:env.RAZORPAY_KEY_ID});
     }catch(e){await db.prepare("UPDATE registrations SET status = 'payment_review' WHERE id = ? AND order_id IS NULL").bind(row.id).run();throw e;}
    }
    if(match[2]==='verify'){
     const input=await body(req);if(!row.order_id||input.razorpay_order_id!==row.order_id||!/^pay_[A-Za-z0-9]+$/.test(input.razorpay_payment_id||''))throw new ApiError('Invalid payment response.');
     const expected=await hmac(env.RAZORPAY_KEY_SECRET,row.order_id+'|'+input.razorpay_payment_id);
     if(!constantEqual(expected,input.razorpay_signature))throw new ApiError('Payment signature could not be verified.',400);
     await reconcile(env,db,row,input.razorpay_payment_id);
     return json(publicRecord(await owned(req,db,row.id)));
    }
    if(match[2]==='refresh'){
     if(row.payment_id)await reconcile(env,db,row,row.payment_id);
     return json(publicRecord(await owned(req,db,row.id)));
    }
   }
   if(req.method==='POST'&&webhook){
    if(!env.RAZORPAY_WEBHOOK_SECRET)throw new ApiError('Webhook is not configured.',503);
    const raw=await req.text();if(raw.length>1000000)throw new ApiError('Payload too large.',413);
    if(!constantEqual(await hmac(env.RAZORPAY_WEBHOOK_SECRET,raw),req.headers.get('x-razorpay-signature')))throw new ApiError('Invalid webhook signature.',400);
    let event;try{event=JSON.parse(raw)}catch{throw new ApiError('Invalid webhook payload.');}
    const p=event.payload?.payment?.entity;
    if(p?.order_id&&['payment.captured','payment.authorized','payment.failed','order.paid'].includes(event.event)){
     const row=await db.prepare('SELECT * FROM registrations WHERE order_id = ?').bind(p.order_id).first();
     if(row)await reconcile(env,db,row,p.id);
    }
    return json({received:true});
   }
   throw new ApiError('Not found.',404);
  }catch(e){return json({error:e instanceof ApiError?e.message:'The service could not complete your request. Please try again or contact APJ.'},e.status||500);}
 };
}
