import type {Candidate,State} from './ats';
import {exitReasons,templateTasks,type Task} from './process';
export type Movement={candidate:Candidate;stage:string;tasks:Task[];reason:string;notes:string;justification:string};
export function makeMovement(candidate:Candidate,stage:string,state:State):Movement {
 const template=state.templates.find(t=>t.id===candidate.templateId);
 return {candidate:structuredClone(candidate),stage,tasks:templateTasks(template,stage,candidate.owner,state.holidays),reason:'',notes:'',justification:''};
}
export function pendingRequired(candidate:Candidate){return(candidate.tasks||[]).filter(t=>t.required&&!t.done);}
export function moveCandidate(m:Movement,state:State,by:string,at=new Date().toISOString()):Candidate {
 const c=m.candidate;
 if(c.stage===m.stage||!state.stages.includes(m.stage))throw Error('Escolha uma etapa diferente e válida.');
 const advances=state.stages.indexOf(m.stage)>state.stages.indexOf(c.stage)&&m.stage!=='Não contratado';
 if(advances&&pendingRequired(c).length&&!m.justification.trim())throw Error('Justifique o avanço com tarefas obrigatórias pendentes.');
 if(m.stage==='Não contratado'&&!exitReasons.includes(m.reason as typeof exitReasons[number]))throw Error('Selecione o motivo do encerramento.');
 if(m.stage==='Não contratado'&&m.reason==='Outro motivo'&&!m.notes.trim())throw Error('Descreva o motivo do encerramento.');
 if(m.tasks.some(t=>!t.title.trim()))throw Error('Preencha o título de cada tarefa.');
 const additions=m.tasks.map(t=>({...t,title:t.title.trim(),stage:m.stage,createdAt:at}));
 return {...c,stage:m.stage,stageEnteredAt:at,updated:at,tasks:[...(c.tasks||[]),...additions],transitionJustification:m.justification.trim(),
  closure:m.stage==='Não contratado'?{reason:m.reason as typeof exitReasons[number],fromStage:c.stage,at,by,notes:m.notes}:null,
  ...(additions.length?{nextAction:additions[0].title,due:additions[0].due,owner:additions[0].owner||c.owner}:{}),
  history:[{at,text:`${c.stage} → ${m.stage} • ${by}${m.reason?' • '+m.reason:''}${m.notes?' • '+m.notes:''}${m.justification?' • Exceção: '+m.justification:''} • ${additions.length} tarefa(s) adicionada(s)`},...c.history]};
}
