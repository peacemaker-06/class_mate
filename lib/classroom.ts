export type Role = 'teacher' | 'student';
export type Person = {id:string;name:string;email:string;parentEmail:string;parentConsent:boolean;role:Role;classIds:string[];owner?:boolean;loginId:string};
export type Classroom = {id:string;name:string;studentCode:string;teacherCode:string;teacherIds:string[];rows:number;columns:number};
export type State = {classes:Classroom[];people:Person[];homework:any[];completions:any[];attendance:any[];announcements:any[];timetable:any[];marks:any[];seats:any[];seatChecks:any[];notes:any[];od:any[];messages:any[];duties:any[];mail:any[];settings:{emailsEnabled:boolean};updatedAt:string};
export type Action = {type:string;[key:string]:any};
export const DEMO_KEY='classmate-plus-demo-v1';
export const dateKey=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export const id=(prefix='r')=>`${prefix}-${crypto.randomUUID()}`;
const code=(prefix:string)=>`${prefix}-${crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase()}`;
const str=(value:any,max=200)=>{if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new Error(`Enter a value of 1–${max} characters.`);return value.trim();};
const email=(value:any,optional=false)=>{if(optional&&!value)return '';const v=str(value,254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))throw new Error('Enter a valid email address.');return v;};
const amount=(v:any,min:number,max:number)=>{const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw new Error(`Enter a number between ${min} and ${max}.`);return n;};
const timestamp=(value:any)=>{const v=str(value,60);if(!Number.isFinite(new Date(v).getTime()))throw new Error('Enter a valid date and time.');return new Date(v).toISOString();};
export function blankState():State{return {classes:[],people:[],homework:[],completions:[],attendance:[],announcements:[],timetable:[],marks:[],seats:[],seatChecks:[],notes:[],od:[],messages:[],duties:[],mail:[],settings:{emailsEnabled:false},updatedAt:new Date().toISOString()};}
export function seedDemo(now=new Date()):State{
 const s=blankState();const days=(d:number,h=17)=>{const n=new Date(now);n.setDate(n.getDate()+d);n.setHours(h,0,0,0);return n.toISOString();};
 s.classes=[{id:'12a',name:'Class 12A',studentCode:'CLASS-12A',teacherCode:'STAFF-12A',teacherIds:['t1','t2'],rows:4,columns:6},{id:'12b',name:'Class 12B',studentCode:'CLASS-12B',teacherCode:'STAFF-12B',teacherIds:['t1'],rows:4,columns:6}];
 s.people=[
 {id:'t1',name:'Priya Raman',email:'priya@school.example',parentEmail:'',parentConsent:false,role:'teacher',classIds:['12a','12b'],owner:true,loginId:'PRIYA01'},
 {id:'t2',name:'Ravi Menon',email:'ravi@school.example',parentEmail:'',parentConsent:false,role:'teacher',classIds:['12a'],loginId:'RAVI02'},
 ...['Aarav Kumar','Diya Raman','Meera Das','Rohan Thomas'].map((name,i)=>({id:`s${i+1}`,name,email:`student${i+1}@school.example`,parentEmail:`parent${i+1}@family.example`,parentConsent:true,role:'student' as Role,classIds:[i===3?'12b':'12a'],loginId:`STU00${i+1}`}))];
 s.homework=[{id:'hw1',classId:'12a',teacherId:'t1',subject:'Mathematics',title:'Applications of derivatives',description:'Complete exercise 6.2, questions 1–6. Show your working and circle the step you found most difficult.',assignedAt:days(-1,9),dueAt:days(1),createdAt:days(-1,9)},
 {id:'hw2',classId:'12a',teacherId:'t2',subject:'Physics',title:'Electric circuits: revision notes',description:'Compare series and parallel circuits. Add one worked example for each.',assignedAt:days(-1,10),dueAt:days(0,21),createdAt:days(-1,10)},
 {id:'hw3',classId:'12b',teacherId:'t1',subject:'English',title:'A response to The Last Lesson',description:'Write 150 words on the importance of language in the story.',assignedAt:days(0,9),dueAt:days(2),createdAt:days(0,9)}];
 s.completions=[{homeworkId:'hw1',studentId:'s2',completedAt:now.toISOString()}];
 s.marks=[{id:'m1',classId:'12a',studentId:'s1',subject:'Mathematics',exam:'Unit test 1',score:38,max:100,feedback:'Practise the chain rule and show each step.'},{id:'m2',classId:'12a',studentId:'s1',subject:'Physics',exam:'Unit test 1',score:54,max:100,feedback:'Revise units and circuit diagrams.'},{id:'m3',classId:'12a',studentId:'s1',subject:'English',exam:'Unit test 1',score:78,max:100,feedback:'Keep developing your written explanations.'},{id:'m4',classId:'12a',studentId:'s2',subject:'Mathematics',exam:'Unit test 1',score:82,max:100,feedback:'Good progress.'},{id:'m5',classId:'12a',studentId:'s3',subject:'Physics',exam:'Unit test 1',score:46,max:100,feedback:'Review the worked examples.'},{id:'m6',classId:'12b',studentId:'s4',subject:'English',exam:'Unit test 1',score:67,max:100,feedback:'Work on paragraph structure.'}];
 for(let day=1;day<=6;day++)s.timetable.push(...['Mathematics','Physics','English','Chemistry'].slice(0,day===6?3:4).map((subject,i)=>({id:`p${day}-${i}`,classId:'12a',day,subject,start:['09:00','10:00','11:15','12:15'][i],end:['09:45','10:45','12:00','13:00'][i],room:i===1?'Science lab':'Room 204'})));
 s.seats=[{classId:'12a',seat:'A1',studentId:'s1'},{classId:'12a',seat:'A2',studentId:'s2'},{classId:'12a',seat:'B3',studentId:'s3'},{classId:'12b',seat:'A1',studentId:'s4'}];
 s.announcements=[{id:'an1',classId:'12a',teacherId:'t1',title:'Bring your lab notebook',message:'Bring your notebook for the next Physics practical. Check the timetable before class.',createdAt:days(-1,11)}];
 s.attendance=s.people.filter(p=>p.role==='student').map(p=>({studentId:p.id,classId:p.classIds[0],date:dateKey(now),status:p.id==='s1'?'absent':'present'}));
 s.duties=[{id:'d1',classId:'12a',studentId:'s1',title:'Organise the reading shelf',description:'Return classroom books to their labelled shelves with teacher supervision.',points:5,status:'assigned',assignedBy:'t1',createdAt:now.toISOString()},{id:'d2',classId:'12a',studentId:'s2',title:'Distribute learning materials',description:'Help distribute worksheets at the start of class.',points:5,status:'approved',assignedBy:'t1',createdAt:now.toISOString()}];
 return s;
}
export function actorOf(s:State,personId:string){const p=s.people.find(p=>p.id===personId);if(!p)throw new Error('Account not found. Sign in again.');return p;}
export const classStudents=(s:State,classId:string)=>s.people.filter(p=>p.role==='student'&&p.classIds.includes(classId));
export const isComplete=(s:State,hwId:string,studentId:string)=>s.completions.some(c=>c.homeworkId===hwId&&c.studentId===studentId);
function requireClass(s:State,actor:Person,classId:string,teacher=false){const c=s.classes.find(c=>c.id===classId);if(!c||!actor.classIds.includes(classId))throw new Error('You do not have access to this class.');if(teacher&&(actor.role!=='teacher'||!c.teacherIds.includes(actor.id)))throw new Error('Only a teacher of this class can make this change.');return c;}
function requireStudent(s:State,classId:string,studentId:string){const p=s.people.find(p=>p.id===studentId&&p.role==='student'&&p.classIds.includes(classId));if(!p)throw new Error('Student is not enrolled in this class.');return p;}
export function projected(s:State,actor:Person):State{
 const copy=structuredClone(s),classes=new Set(actor.classIds),teacher=actor.role==='teacher';
 copy.classes=copy.classes.filter(c=>classes.has(c.id)).map(c=>({...c,studentCode:teacher?c.studentCode:'',teacherCode:actor.owner?c.teacherCode:''}));
 copy.people=copy.people.filter(p=>p.id===actor.id||p.classIds.some(c=>classes.has(c))).map(p=>teacher?p:{...p,email:p.id===actor.id?p.email:'',parentEmail:p.id===actor.id?p.parentEmail:'',parentConsent:p.id===actor.id?p.parentConsent:false,loginId:p.id===actor.id?p.loginId:''});
 for(const key of ['homework','attendance','announcements','timetable','marks','seats','seatChecks','notes','od','duties','mail'] as const)(copy[key] as any[])=copy[key].filter((r:any)=>classes.has(r.classId));
 if(!teacher){copy.attendance=copy.attendance.filter(r=>r.studentId===actor.id);copy.marks=copy.marks.filter(r=>r.studentId===actor.id);copy.notes=[];copy.od=copy.od.filter(r=>r.studentId===actor.id);copy.duties=copy.duties.filter(r=>r.studentId===actor.id);copy.mail=[];copy.seatChecks=copy.seatChecks.filter(r=>r.studentId===actor.id);}
 for(const p of copy.people){delete (p as any).authId;p.classIds=p.classIds.filter(c=>classes.has(c));}
 const hw=new Set(copy.homework.map(h=>h.id));copy.completions=copy.completions.filter(c=>hw.has(c.homeworkId)&&(teacher||c.studentId===actor.id));
 copy.messages=copy.messages.filter(m=>classes.has(m.classId)&&(m.channel==='staff'?teacher:(m.senderId===actor.id||m.recipientId===actor.id)));
 return copy;
}
function enqueue(s:State,entry:any,demo:boolean){if(s.mail.some(m=>m.id===entry.id))return;const status=demo?'simulated':s.settings.emailsEnabled?'pending':'preview';s.mail.push({...entry,status,createdAt:new Date().toISOString(),providerId:null,error:null});}
function parentNotice(s:State,p:Person,entry:any,demo:boolean){enqueue(s,{...entry,recipient:p.parentEmail,studentId:p.id,requiresParentConsent:true,status:undefined},demo);const mail=s.mail.find(m=>m.id===entry.id);if(mail&&(!p.parentEmail||!p.parentConsent)){mail.status='blocked';mail.error='Parent email and guardian-notification consent are required.';}}
export function runDeadlines(s:State,classId:string,now:number,demo:boolean){
 for(const h of s.homework.filter(h=>h.classId===classId))for(const p of classStudents(s,classId)){
  if(isComplete(s,h.id,p.id))continue;const hours=(new Date(h.dueAt).getTime()-now)/3600000;
  if(hours>0&&hours<=24)enqueue(s,{id:`due-${h.id}-${p.id}-${h.dueAt}`,kind:'due_soon',classId,studentId:p.id,homeworkId:h.id,recipient:p.email,subject:`Reminder: ${h.title}`,body:`Hello ${p.name}, your ${h.subject} assignment "${h.title}" is due ${new Date(h.dueAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST. Please review the task in ClassMate.`},demo);
  if(hours<=0)parentNotice(s,p,{id:`overdue-${h.id}-${p.id}-${h.dueAt}`,kind:'overdue_parent',classId,homeworkId:h.id,subject:`Homework follow-up for ${p.name}`,body:`Hello, ${p.name}'s ${h.subject} assignment "${h.title}" was due ${new Date(h.dueAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST and is not yet marked completed in ClassMate. This is a follow-up based on student-reported status, not a judgment. Please check with the student or teacher.`},demo);
 }
}
export function applyAction(original:State,personId:string,a:Action,demo=false):State{
 const s=structuredClone(original),actor=actorOf(s,personId),now=new Date().toISOString();const cid=a.classId;
 if(a.type==='createClass'){
  if(actor.role!=='teacher')throw new Error('Teacher access required.');const c={id:id('class'),name:str(a.name,40),studentCode:code('CL'),teacherCode:code('TC'),teacherIds:[actor.id],rows:4,columns:6};s.classes.push(c);actor.classIds.push(c.id);
 }else if(a.type==='addMember'){
  const c=requireClass(s,actor,cid,true);const role:Role=a.role==='teacher'?'teacher':'student';if(role==='teacher'&&!actor.owner)throw new Error('Only the school owner can add teachers.');const em=email(a.email);if(s.people.some(p=>p.email.toLowerCase()===em))throw new Error('An account with this email already exists. Use its class invitation.');
  const p:Person={id:id(role==='student'?'stu':'teacher'),name:str(a.name,80),email:em,parentEmail:role==='student'?email(a.parentEmail,true):'',parentConsent:role==='student'&&a.parentConsent===true,role,classIds:[cid],loginId:code(role==='student'?'STU':'TEACH')};s.people.push(p);if(role==='teacher')c.teacherIds.push(p.id);
 }else if(a.type==='rotateCode'){
  const c=requireClass(s,actor,cid,true);if(a.kind==='teacher'){if(!actor.owner)throw new Error('Only the school owner can issue staff invitations.');c.teacherCode=code('TC');}else c.studentCode=code('CL');
 }else if(a.type==='homework'){
  requireClass(s,actor,cid,true);const dueAt=timestamp(a.dueAt);if(new Date(dueAt).getTime()<Date.now()&&!demo)throw new Error('Choose a future deadline.');
  const h={id:id('hw'),classId:cid,teacherId:actor.id,subject:str(a.subject,60),title:str(a.title,140),description:str(a.description,3000),dueAt,assignedAt:now,createdAt:now};s.homework.push(h);
  for(const p of classStudents(s,cid))enqueue(s,{id:`assigned-${h.id}-${p.id}`,kind:'homework_assigned',classId:cid,homeworkId:h.id,studentId:p.id,recipient:p.email,subject:`New ${h.subject} homework: ${h.title}`,body:`Hello ${p.name}, ${actor.name} assigned "${h.title}".\n\n${h.description}\n\nDue: ${new Date(dueAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST. Open ClassMate to review and mark it completed.`},demo);
 }else if(a.type==='complete'){
  requireClass(s,actor,cid);if(actor.role!=='student')throw new Error('Students report their own completion.');const h=s.homework.find(h=>h.id===a.homeworkId&&h.classId===cid);if(!h)throw new Error('Assignment not found.');const exists=isComplete(s,h.id,actor.id);s.completions=s.completions.filter(c=>!(c.homeworkId===h.id&&c.studentId===actor.id));if(!exists)s.completions.push({homeworkId:h.id,studentId:actor.id,completedAt:now});
 }else if(a.type==='deleteHomework'){
  requireClass(s,actor,cid,true);const h=s.homework.find(h=>h.id===a.homeworkId&&h.classId===cid);if(!h)throw new Error('Assignment not found.');s.homework=s.homework.filter(h=>h.id!==a.homeworkId);s.completions=s.completions.filter(c=>c.homeworkId!==a.homeworkId);for(const m of s.mail)if(m.homeworkId===a.homeworkId&&['pending','preview','failed'].includes(m.status)){m.status='cancelled';m.error='Assignment removed.';}
 }else if(a.type==='attendance'){
  requireClass(s,actor,cid,true);const date=str(a.date,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Invalid attendance date.');const students=classStudents(s,cid);const rows=students.map(p=>({classId:cid,studentId:p.id,date,status:a.statuses?.[p.id]})).filter(r=>['present','absent','od'].includes(r.status));
  for(const r of rows)if(r.status==='od'&&!s.od.some(o=>o.studentId===r.studentId&&o.date===date&&o.status==='approved'))throw new Error('Approve the on-duty request before marking OD.');
  s.attendance=s.attendance.filter(r=>!(r.classId===cid&&r.date===date));s.attendance.push(...rows);
 }else if(a.type==='announcement'){
  requireClass(s,actor,cid,true);s.announcements.push({id:id('an'),classId:cid,teacherId:actor.id,title:str(a.title,120),message:str(a.message,2500),createdAt:now});
 }else if(a.type==='mark'){
  requireClass(s,actor,cid,true);requireStudent(s,cid,a.studentId);const max=amount(a.max,1,1000),score=amount(a.score,0,max),subject=str(a.subject,60),exam=str(a.exam,80);const previous=s.marks.find(m=>m.classId===cid&&m.studentId===a.studentId&&m.subject.toLowerCase()===subject.toLowerCase()&&m.exam.toLowerCase()===exam.toLowerCase());
  s.marks=s.marks.filter(m=>m.id!==previous?.id);s.marks.push({id:previous?.id||id('mark'),classId:cid,studentId:a.studentId,subject,exam,score,max,feedback:typeof a.feedback==='string'?a.feedback.slice(0,1000):'',updatedAt:now});
 }else if(a.type==='period'){
  requireClass(s,actor,cid,true);const day=amount(a.day,0,6),start=str(a.start,5),end=str(a.end,5);if(!Number.isInteger(day)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end)||start>=end)throw new Error('Enter a valid day and end time after the start time.');
  if(s.timetable.some(p=>p.classId===cid&&p.day===day&&p.start<end&&p.end>start))throw new Error('This period overlaps another class.');s.timetable.push({id:id('period'),classId:cid,day,start,end,subject:str(a.subject,60),room:str(a.room,60)});
 }else if(a.type==='deletePeriod'){
  requireClass(s,actor,cid,true);s.timetable=s.timetable.filter(p=>!(p.id===a.periodId&&p.classId===cid));
 }else if(a.type==='moveSeat'){
  const c=requireClass(s,actor,cid,true),p=requireStudent(s,cid,a.studentId);if(!/^[A-Z]\d+$/.test(a.seat)||a.seat.charCodeAt(0)-65>=c.rows||Number(a.seat.slice(1))>c.columns||Number(a.seat.slice(1))<1)throw new Error('Choose a seat on the plan.');
  const occupied=s.seats.find(r=>r.classId===cid&&r.seat===a.seat&&r.studentId!==p.id);if(occupied)throw new Error('That seat is occupied. Choose an empty seat.');const old=s.seats.find(r=>r.classId===cid&&r.studentId===p.id);if(old?.seat===a.seat)throw new Error('The student is already in that seat.');
  s.seats=s.seats.filter(r=>!(r.classId===cid&&r.studentId===p.id));s.seats.push({classId:cid,studentId:p.id,seat:a.seat});for(const check of s.seatChecks)if(check.classId===cid&&check.studentId===p.id&&check.status==='pending')check.status='superseded';const change={id:id('seat'),classId:cid,studentId:p.id,seat:a.seat,oldSeat:old?.seat||'unassigned',teacherId:actor.id,reason:typeof a.reason==='string'?a.reason.slice(0,500):'Seating adjustment',status:'pending',createdAt:now};s.seatChecks.push(change);
  parentNotice(s,p,{id:`seat-${change.id}`,kind:'seat_parent',classId:cid,subject:`Updated classroom seat for ${p.name}`,body:`Hello, ${p.name}'s seat in ${c.name} changed from ${change.oldSeat} to ${a.seat}. The teacher will check that the student is seated in the assigned place. Please contact the teacher with questions. This notice does not infer misconduct.`},demo);
 }else if(a.type==='seatCheck'){
  requireClass(s,actor,cid,true);const check=s.seatChecks.find(c=>c.id===a.checkId&&c.classId===cid);if(!check)throw new Error('Seat check not found.');check.status='checked';check.checkedBy=actor.id;check.checkedAt=now;
 }else if(a.type==='note'){
  requireClass(s,actor,cid,true);requireStudent(s,cid,a.studentId);s.notes.push({id:id('note'),classId:cid,studentId:a.studentId,teacherId:actor.id,category:['attendance','classroom','follow-up'].includes(a.category)?a.category:'follow-up',message:str(a.message,2000),createdAt:now});
 }else if(a.type==='odRequest'){
  requireClass(s,actor,cid);if(actor.role!=='student')throw new Error('Students submit their own requests.');const date=str(a.date,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Enter a valid date.');if(s.od.some(o=>o.studentId===actor.id&&o.date===date&&o.status!=='rejected'))throw new Error('An on-duty request already exists for this date.');s.od.push({id:id('od'),classId:cid,studentId:actor.id,date,reason:str(a.reason,500),status:'pending',createdAt:now});
 }else if(a.type==='odDecision'){
  requireClass(s,actor,cid,true);const o=s.od.find(o=>o.id===a.odId&&o.classId===cid);if(!o)throw new Error('Request not found.');o.status=a.approve===true?'approved':'rejected';o.decidedBy=actor.id;o.decidedAt=now;
  s.attendance=s.attendance.filter(r=>!(r.studentId===o.studentId&&r.date===o.date&&r.status==='od'));if(o.status==='approved'){s.attendance=s.attendance.filter(r=>!(r.studentId===o.studentId&&r.date===o.date));s.attendance.push({classId:cid,studentId:o.studentId,date:o.date,status:'od'});}
 }else if(a.type==='message'){
  requireClass(s,actor,cid);const message=str(a.message,2000);if(a.channel==='staff'){if(actor.role!=='teacher')throw new Error('The staff room is teacher-only.');s.messages.push({id:id('msg'),classId:cid,channel:'staff',senderId:actor.id,recipientId:null,message,createdAt:now});}
  else {const target=s.people.find(p=>p.id===a.recipientId&&p.classIds.includes(cid));if(!target||target.id===actor.id||(actor.role==='student'&&target.role!=='teacher'))throw new Error('Choose a teacher or an authorised class member.');s.messages.push({id:id('msg'),classId:cid,channel:'direct',senderId:actor.id,recipientId:target.id,message,createdAt:now});}
 }else if(a.type==='duty'){
  requireClass(s,actor,cid,true);requireStudent(s,cid,a.studentId);s.duties.push({id:id('duty'),classId:cid,studentId:a.studentId,title:str(a.title,120),description:str(a.description,800),points:amount(a.points,1,10),status:'assigned',assignedBy:actor.id,createdAt:now});
 }else if(a.type==='dutyStatus'){
  requireClass(s,actor,cid);const d=s.duties.find(d=>d.id===a.dutyId&&d.classId===cid);if(!d)throw new Error('Contribution task not found.');if(actor.role==='student'){if(d.studentId!==actor.id||d.status==='approved')throw new Error('This task cannot be changed.');d.status='submitted';}else d.status=a.approve===true?'approved':'assigned';
 }else if(a.type==='deadlines'){requireClass(s,actor,cid,true);runDeadlines(s,cid,Date.now(),demo);
 }else if(a.type==='simulateOverdue'){
  if(!demo)throw new Error('Simulation is available only in the separate demo workspace.');requireClass(s,actor,cid,true);const h=s.homework.find(h=>h.id===a.homeworkId&&h.classId===cid);if(!h)throw new Error('Choose a homework task.');h.dueAt=new Date(Date.now()-60000).toISOString();runDeadlines(s,cid,Date.now(),true);
 }else if(a.type==='emailSetting'){
  if(!actor.owner)throw new Error('Only the school owner can enable email sending.');s.settings.emailsEnabled=a.enabled===true;
 }else throw new Error('Unknown action.');
 s.updatedAt=now;return s;
}
export function improvementPlan(s:State,studentId:string){
 const marks=s.marks.filter(m=>m.studentId===studentId).sort((a,b)=>a.score/a.max-b.score/b.max);
 const low=marks.filter(m=>m.score/m.max<.6);const work=s.homework.filter(h=>actorOf(s,studentId).classIds.includes(h.classId)&&!isComplete(s,h.id,studentId)).sort((a,b)=>a.dueAt.localeCompare(b.dueAt));
 return {low,marks,work,steps:[...(low.slice(0,2).map(m=>`${m.subject}: spend 25 minutes reviewing ${m.feedback||'the concepts you missed'}, then solve 3 practice questions and check your method.`)),...(work.slice(0,2).map(h=>`Complete a 20-minute first attempt at “${h.title}” before ${new Date(h.dueAt).toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata'})}.`)),'Take a 5-minute break between study blocks. End with 10 minutes recalling the key ideas without looking at your notes.','Ask your subject teacher to review one question you still cannot explain. Adjust these suggested blocks around your home routine.']};
}
export function assistantAnswer(s:State,actor:Person,classId:string,question:string):string{
 requireClass(s,actor,classId);const q=question.toLowerCase(),teacher=actor.role==='teacher';
 if(/seat|sit|seated/.test(q)){const seats=s.seats.filter(r=>r.classId===classId&&(teacher||r.studentId===actor.id));const pending=s.seatChecks.filter(c=>c.classId===classId&&c.status==='pending'&&(teacher||c.studentId===actor.id));return seats.map(r=>`${actorOf(s,r.studentId).name}: seat ${r.seat}.`).join('\n')+(pending.length?`\n\nReminder: ${teacher?'check the updated seating and confirm it in Seating':`please use your assigned seat when you enter class`}. ${pending.length} seating check(s) remain open.`:'\nNo unconfirmed seat changes.');}
 if(/mark|improv|study|plan|schedule|pass/.test(q)){
  if(teacher){const low=s.marks.filter(m=>m.classId===classId&&m.score/m.max<.6);return low.length?'Scores needing attention (below the demo 60% review threshold):\n'+low.map(m=>`${actorOf(s,m.studentId).name} · ${m.subject}: ${m.score}/${m.max}. ${m.feedback}`).join('\n')+'\n\nSuggested follow-up: discuss one difficult concept, set a small practice task, and review progress next week. Contribution credits do not change these academic marks.':'No recorded marks are below the demo review threshold. Enter marks to build an improvement view.';}
  const plan=improvementPlan(s,actor.id);return (plan.low.length?'Subjects to prioritise: '+plan.low.map(m=>`${m.subject} (${m.score}/${m.max})`).join(', ')+'.':'No recorded subject is below the review threshold, or no marks have been entered.')+'\n\nSuggested study plan (editable guidance, not a guaranteed result):\n'+plan.steps.map((x,i)=>`${i+1}. ${x}`).join('\n');
 }
 if(/homework|due|assign|task/.test(q)){let hs=s.homework.filter(h=>h.classId===classId);if(teacher&&/i gave|my|i assign/.test(q))hs=hs.filter(h=>h.teacherId===actor.id);if(!teacher)hs=hs.filter(h=>!isComplete(s,h.id,actor.id));return hs.length?hs.sort((a,b)=>a.dueAt.localeCompare(b.dueAt)).map(h=>`${h.subject}: ${h.title}\nDue ${new Date(h.dueAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST\n${h.description}`).join('\n\n'):'There are no matching assignments in this class.';}
 if(/time|class today|period/.test(q)){const day=new Date(dateKey()+'T12:00:00Z').getUTCDay(),p=s.timetable.filter(p=>p.classId===classId&&p.day===day).sort((a,b)=>a.start.localeCompare(b.start));return p.length?p.map(p=>`${p.start}–${p.end}: ${p.subject}, ${p.room}`).join('\n'):'No periods are scheduled for today.';}
 if(/on duty|\bod\b/.test(q)){const requests=s.od.filter(o=>o.classId===classId&&(teacher||o.studentId===actor.id));return requests.length?requests.map(o=>`${actorOf(s,o.studentId).name} · ${o.date}: ${o.status} (${o.reason})`).join('\n'):'No on-duty requests are recorded.';}
 if(/derivative|chain rule/.test(q))return 'For a composite function f(g(x)), the chain rule is f′(g(x)) × g′(x). Example: if y = (3x + 2)², then dy/dx = 2(3x + 2) × 3 = 6(3x + 2). Try y = (2x + 1)³, show your steps, and ask your teacher to check them.';
 if(/circuit|parallel|series/.test(q))return 'In a series circuit, the same current flows through each component and resistances add. In a parallel circuit, each branch has the same voltage and branch currents add. Start by labelling known voltages and resistances, then apply V = IR. Check your units and compare your working with your class notes.';
 return `I can look up ${teacher?'homework you assigned, class deadlines, marks needing attention, on-duty requests, and pending seat checks':'your homework, deadlines, marks, study plan, timetable, and assigned seat'}. Try “What homework is due?”, “Help me improve my marks”, or “Where should I sit?”.\n\nThis is the local demo assistant. General subject tutoring becomes available after an AI provider is configured; it should still be checked against your teacher’s guidance.`;
}
export function assistantContext(s:State,actor:Person,classId:string){
 const filtered=projected(s,actor);return {role:actor.role,className:s.classes.find(c=>c.id===classId)?.name,
  homework:filtered.homework.filter(h=>h.classId===classId).map(h=>({subject:h.subject,title:h.title,instructions:h.description,dueAt:h.dueAt,assignedByMe:h.teacherId===actor.id,completed:actor.role==='student'?isComplete(s,h.id,actor.id):undefined})),
  marks:filtered.marks.filter(m=>m.classId===classId).map(m=>({student:actor.role==='teacher'?actorOf(s,m.studentId).name.split(' ')[0]:'me',subject:m.subject,score:m.score,max:m.max,feedback:m.feedback})),
  timetable:filtered.timetable.filter(p=>p.classId===classId),
  seats:filtered.seats.filter(r=>r.classId===classId&&(actor.role==='teacher'||r.studentId===actor.id)).map(r=>({student:r.studentId===actor.id?'me':actorOf(s,r.studentId).name.split(' ')[0],seat:r.seat})),
  pendingSeatChecks:filtered.seatChecks.filter(c=>c.classId===classId&&c.status==='pending').length};
}
