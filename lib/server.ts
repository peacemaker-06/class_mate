import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { actorOf, applyAction, assistantContext, blankState, id, isComplete, projected, runDeadlines, type Person, type State } from './classroom';

const secrets=()=>env as unknown as Record<string,string>;
export class AppError extends Error {constructor(message:string,public status=400){super(message);}}
export const db=()=>{if(!env.DB)throw new AppError('The shared database is not ready yet. You can use the separate demo workspace.',503);return env.DB;};
export const configuration=()=>({ai:!!secrets().OPENROUTER_API_KEY,email:!!(secrets().RESEND_API_KEY&&secrets().EMAIL_FROM&&secrets().EMAIL_ALLOWED_RECIPIENTS),scheduler:!!secrets().SCHEDULER_SECRET});
export async function identity(){const u=await getChatGPTUser();if(!u)throw new AppError('Please sign in with ChatGPT to use a real classroom account.',401);return u;}
export async function stored(){const row=await db().prepare('SELECT body,version,owner_id FROM workspaces WHERE id=?').bind('main').first<{body:string;version:number;owner_id:string}>();return row?{state:JSON.parse(row.body) as State,version:row.version,ownerId:row.owner_id}:null;}
export async function limit(userId:string,kind:string,max=100){const key=`${kind}:${userId}:${new Date().toISOString().slice(0,13)}`;const row=await db().prepare('INSERT INTO usage(id,count) VALUES (?,1) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(key).first<{count:number}>();if(row&&row.count>max)throw new AppError('Please try again later. The hourly demo limit has been reached.',429);}
export function originCheck(request:Request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new AppError('Cross-origin changes are not allowed.',403);}
export async function requestBody(request:Request){originCheck(request);const text=await request.text();if(text.length>160000)throw new AppError('Request too large.',413);let body;try{body=JSON.parse(text);}catch{throw new AppError('Invalid JSON request.');}if(!body||typeof body!=='object'||Array.isArray(body))throw new AppError('Invalid request.');return body;}
export function respond(data:any,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
export function failure(error:unknown){return respond({error:error instanceof AppError?error.message:error instanceof Error?error.message:'Request failed.'},error instanceof AppError?error.status:400);}
export async function save(state:State,version:number){const r=await db().prepare('UPDATE workspaces SET body=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(state),'main',version).run();if(!r.meta.changes)throw new AppError('Another member changed the classroom. Refresh and try again.',409);}
export function personFor(state:State,userId:string){return state.people.find(p=>(p as any).authId===userId);}
export async function current(){const user=await identity(),row=await stored();if(!row)throw new AppError('Create the school workspace first.',404);const person=personFor(row.state,user.userId);if(!person)throw new AppError('Join your class with the invitation code first.',403);return {user,...row,person};}
export function responseState(state:State,person:Person,version:number){return {state:projected(state,person),personId:person.id,version,config:configuration()};}
const emailValid=(value:any)=>typeof value==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&value.length<=254;
export async function bootstrap(body:any){
 const u=await identity();await limit(u.userId,'setup',20);if(await stored())throw new AppError('A school workspace already exists. Use an invitation code.',409);
 if(typeof body.name!=='string'||!body.name.trim()||body.name.length>80)throw new AppError('Enter your name.');
 let state=blankState();const p:Person={id:id('teacher'),name:body.name.trim(),email:u.email,parentEmail:'',parentConsent:false,role:'teacher',classIds:[],owner:true,loginId:'OWNER-'+crypto.randomUUID().slice(0,8).toUpperCase()};Object.assign(p,{authId:u.userId});state.people.push(p);state=applyAction(state,p.id,{type:'createClass',name:body.className||'Class 12A'},false);
 // This initial owner claim runs only behind the newly-created owner-private Site boundary.
 const result=await db().prepare('INSERT OR IGNORE INTO workspaces(id,owner_id,body,version) VALUES (?,?,?,1)').bind('main',u.userId,JSON.stringify(state)).run();if(!result.meta.changes)throw new AppError('Workspace already created. Refresh to continue.',409);return responseState(state,actorOf(state,p.id),1);
}
export async function enroll(body:any){
 const u=await identity();await limit(u.userId,'enroll',20);const row=await stored();if(!row)throw new AppError('Ask the school owner to create the workspace first.');
 const invite=typeof body.code==='string'?body.code.trim().toUpperCase():'';const c=row.state.classes.find(c=>c.studentCode===invite||c.teacherCode===invite);if(!c)throw new AppError('Invalid invitation code. Ask your teacher for the current code.');
 const role=c.teacherCode===invite?'teacher':'student';if(typeof body.name!=='string'||!body.name.trim()||body.name.length>80)throw new AppError('Enter your name.');
 if(role==='student'&&body.parentEmail&&!emailValid(body.parentEmail))throw new AppError('Enter a valid parent email.');
 let p=personFor(row.state,u.userId)||row.state.people.find(p=>p.email.toLowerCase()===u.email.toLowerCase());
 if(p&&((p as any).authId&&(p as any).authId!==u.userId||p.role!==role))throw new AppError('This identity already has a different classroom role. Ask the owner for help.',403);
 if(!p){p={id:id(role==='teacher'?'teacher':'student'),name:body.name.trim(),email:u.email,parentEmail:role==='student'?(body.parentEmail||'').trim().toLowerCase():'',parentConsent:role==='student'&&body.parentConsent===true,role,classIds:[],loginId:(role==='teacher'?'TEACH-':'STU-')+crypto.randomUUID().slice(0,8).toUpperCase()};row.state.people.push(p);}
 Object.assign(p,{authId:u.userId});if(!p.classIds.includes(c.id))p.classIds.push(c.id);if(role==='teacher'&&!c.teacherIds.includes(p.id))c.teacherIds.push(p.id);await save(row.state,row.version);return responseState(row.state,p,row.version+1);
}
async function mailUpdate(mailId:string,update:(mail:any)=>void){for(let attempt=0;attempt<3;attempt++){const row=await stored();if(!row)return;const m=row.state.mail.find(m=>m.id===mailId);if(!m)return;update(m);try{await save(row.state,row.version);return;}catch(e){if(!(e instanceof AppError&&e.status===409))throw e;}}}
export async function deliverPending(classId?:string){
 const config=secrets();if(!configuration().email)return;const row=await stored();if(!row?.state.settings.emailsEnabled)return;
 const allow=new Set(config.EMAIL_ALLOWED_RECIPIENTS.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean));
 const candidates=row.state.mail.filter(m=>m.status==='pending'&&(!classId||m.classId===classId)).slice(0,10);
 for(const candidate of candidates){
  const fresh=await stored();if(!fresh||!fresh.state.settings.emailsEnabled)return;const m=fresh.state.mail.find(m=>m.id===candidate.id);if(!m||m.status!=='pending')continue;
  if(m.homeworkId&&!fresh.state.homework.some(h=>h.id===m.homeworkId)){await mailUpdate(m.id,x=>{x.status='cancelled';x.error='Assignment removed.';});continue;}
  if(['overdue_parent','due_soon'].includes(m.kind)&&isComplete(fresh.state,m.homeworkId,m.studentId)){await mailUpdate(m.id,x=>{x.status='cancelled';x.error='Student marked the task completed.';});continue;}
  const p=fresh.state.people.find(p=>p.id===m.studentId);
  if(!emailValid(m.recipient)||!allow.has(m.recipient.toLowerCase())||(m.requiresParentConsent&&!p?.parentConsent)){await mailUpdate(m.id,x=>{x.status='blocked';x.error='Recipient is not in the approved recipient list, or guardian consent is missing.';});continue;}
  m.status='sending';m.attemptedAt=new Date().toISOString();try{await save(fresh.state,fresh.version);}catch{continue;}
  try{
   const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':m.id},body:JSON.stringify({from:config.EMAIL_FROM,to:[m.recipient],subject:m.subject,text:m.body}),signal:AbortSignal.timeout(12000)});
   const json=await res.json() as any;if(!res.ok)throw new Error(`Email provider rejected the request (${res.status}). Check sender verification and account limits.`);
   await mailUpdate(m.id,x=>{x.status='submitted';x.providerId=json.id;x.error=null;x.submittedAt=new Date().toISOString();});
  }catch(e){await mailUpdate(m.id,x=>{x.status='failed';x.error=e instanceof Error?e.message:'Provider error.';});}
 }
}
export async function maintain(){
 for(let i=0;i<3;i++){const row=await stored();if(!row)return {processed:0};for(const c of row.state.classes)runDeadlines(row.state,c.id,Date.now(),false);try{await save(row.state,row.version);break;}catch(e){if(i===2)throw e;}}
 await deliverPending();return {processed:true,checkedAt:new Date().toISOString()};
}
