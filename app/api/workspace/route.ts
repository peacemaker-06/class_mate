import { applyAction, actorOf } from '../../../lib/classroom';
import { AppError, bootstrap, configuration, current, deliverPending, enroll, failure, identity, limit, personFor, requestBody, respond, responseState, save, stored } from '../../../lib/server';
export async function GET(){try{const u=await identity(),row=await stored();if(!row)return respond({needsSetup:true,account:{email:u.email,name:u.displayName},config:configuration()});const p=personFor(row.state,u.userId);if(!p)return respond({needsEnrollment:true,account:{email:u.email,name:u.displayName},config:configuration()});return respond(responseState(row.state,p,row.version));}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const body=await requestBody(request);if(body.type==='bootstrap')return respond(await bootstrap(body));if(body.type==='enroll')return respond(await enroll(body));
 const row=await current();await limit(row.user.userId,'changes',150);
 if(body.type==='emailSetting'&&body.enabled&&!configuration().email)throw new AppError('Configure RESEND_API_KEY, EMAIL_FROM, and EMAIL_ALLOWED_RECIPIENTS before enabling real email.');
 if(body.type==='retryMail'){
  if(!row.person.owner)throw new AppError('Only the school owner may explicitly resend notifications.',403);
  const m=row.state.mail.find(m=>m.id===body.mailId);if(!m||!['preview','failed','blocked'].includes(m.status))throw new AppError('This notification cannot be retried.');
  if(!row.state.settings.emailsEnabled)throw new AppError('Enable real email first.');
  // Never automatically retry uncertain requests beyond the provider idempotency window.
  if(m.attemptedAt&&Date.now()-new Date(m.attemptedAt).getTime()>23*3600000)throw new AppError('Check provider delivery logs before sending this old notification again.');
  m.status='pending';m.error=null;await save(row.state,row.version);
 }else {const next=applyAction(row.state,row.person.id,body,false);await save(next,row.version);}
 await deliverPending(body.classId);const updated=await stored();if(!updated)throw new AppError('Workspace unavailable.',503);return respond(responseState(updated.state,actorOf(updated.state,row.person.id),updated.version));
}catch(e){return failure(e);}}
