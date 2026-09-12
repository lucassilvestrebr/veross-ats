import type {State} from './ats';
export type Activity={id:string;candidateId:string;candidateName:string;title:string;due:string;stage:string;done:boolean;taskId?:string};
export const normalizeOwner=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
export function myActivities(state:State,identity:{name:string;email:string;id:string}):Activity[]{
 const aliases=new Set([identity.name,identity.email,identity.id].map(normalizeOwner).filter(Boolean));
 const mine=(owner:string)=>!!owner.trim()&&aliases.has(normalizeOwner(owner));
 const result:Activity[]=[];
 for(const c of state.candidates){
  if(c.archivedAt)continue;
  for(const task of c.tasks||[])if(mine(task.owner))result.push({id:c.id+':task:'+task.id,candidateId:c.id,candidateName:c.name,title:task.title,due:task.due,stage:task.stage,done:task.done,taskId:task.id});
  if(c.nextAction.trim()&&mine(c.owner)&&!['Contratado','Não contratado'].includes(c.stage))result.push({id:c.id+':next',candidateId:c.id,candidateName:c.name,title:c.nextAction,due:c.due,stage:c.stage,done:false});
 }
 return result.sort((a,b)=>Number(a.done)-Number(b.done)||(a.due||'9999').localeCompare(b.due||'9999')||a.candidateName.localeCompare(b.candidateName,'pt-BR')||a.id.localeCompare(b.id));
}
export function activityGroup(a:Activity,today:string){return a.done?'done':!a.due?'undated':a.due<today?'overdue':a.due===today?'today':'upcoming';}

