import {stateSchema,type State,type Candidate} from './ats';
import {defaultTemplate,templateTasks} from './process';
export function upgradeState(raw:unknown,at=new Date().toISOString()):State {
 const s=structuredClone(raw) as State;
 if(s.schemaVersion===2)return stateSchema.parse(s);
 const template=defaultTemplate();
 s.schemaVersion=2;s.templates=[template];s.holidays=[];
 s.stages=s.stages.map(stage=>stage==='Reprovado'?'Não contratado':stage);
 if(!s.stages.includes('Apresentação da Veross')){const index=s.stages.indexOf('Entrevista gestor');s.stages.splice(index<0?s.stages.indexOf('Proposta'):index,0,'Apresentação da Veross');}
 s.jobs=s.jobs.map(j=>({...j,templateId:/pr[eé].?vendas|sdr/i.test(j.title)?template.id:''}));
 s.candidates=s.candidates.map(c=>{
  const old=c.stage;const stage=old==='Reprovado'?'Não contratado':old;
  const id=s.jobs.find(j=>j.id===c.jobId)?.templateId||'';
  const candidate:Candidate={...c,stage,templateId:id,stageEnteredAt:at,tasks:(c.tasks||[]).map(t=>({...t,stage:t.stage==='Reprovado'?'Não contratado':t.stage,required:t.required??false})),assessments:[],collective:null,collectiveHistory:[],history:[{at,text:'Versão 1.1 ativada. Prazos do roteiro atual iniciados nesta data; histórico anterior preservado.'},...c.history]};
  if(stage==='Não contratado')candidate.closure={reason:'Reprovado pela Veross',fromStage:'Não registrada na versão anterior',at:c.updated,by:c.owner||'Registro anterior',notes:c.reason};
  if(id&&!['Contratado','Não contratado'].includes(stage))candidate.tasks!.push(...templateTasks(template,stage,c.owner,[],at));
  return candidate;
 });
 return stateSchema.parse(s);
}
