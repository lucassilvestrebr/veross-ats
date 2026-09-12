import {getChatGPTUser} from '../../chatgpt-auth';
import {database,bucket} from '@/lib/db';
import {upgradeState} from '@/lib/upgrade';
export async function DELETE(req:Request){
 try{
  const user=await getChatGPTUser();if(!user)return Response.json({error:'Entre para excluir.'},{status:401});
  if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origem inválida.'},{status:403});
  const {id,name,revision}=await req.json();
  const db=database();
  const read=()=>db.prepare('SELECT payload,revision FROM ats_workspaces WHERE owner=?').bind(user.userId).first<{payload:string;revision:number}>();
  const row=await read();if(!row||row.revision!==revision)return Response.json({error:'Atualize a lista antes de excluir.'},{status:409});
  const state=upgradeState(JSON.parse(row.payload));const candidate=state.candidates.find(c=>c.id===id);
  if(!candidate?.archivedAt||candidate.name!==name)return Response.json({error:'Arquive o candidato e digite o nome completo exatamente como aparece.'},{status:400});
  const key=candidate.resume?.key;
  if(key&&(!key.startsWith(user.userId+'/')||state.candidates.some(c=>c.id!==id&&c.resume?.key===key)))return Response.json({error:'O currículo tem uma referência compartilhada ou inválida. Revise antes de excluir.'},{status:409});
  // Keep a retryable archived record until storage cleanup has succeeded.
  if(!candidate.deletionPending){
   candidate.deletionPending=true;
   const marked=await db.prepare('UPDATE ats_workspaces SET payload=?,revision=revision+1 WHERE owner=? AND revision=?').bind(JSON.stringify(state),user.userId,row.revision).run();
   if(!marked.meta.changes)return Response.json({error:'Há alterações em outra aba. Atualize e tente novamente.'},{status:409});
  }
  if(key)await bucket().remove(key);
  for(let attempt=0;attempt<5;attempt++){
   const latest=await read();if(!latest)throw Error('Workspace indisponível');
   const current=upgradeState(JSON.parse(latest.payload));
   current.candidates=current.candidates.filter(c=>c.id!==id);
   const result=await db.prepare('UPDATE ats_workspaces SET payload=?,revision=revision+1 WHERE owner=? AND revision=?').bind(JSON.stringify(current),user.userId,latest.revision).run();
   if(result.meta.changes)return Response.json({state:current,revision:latest.revision+1},{headers:{'Cache-Control':'no-store'}});
  }
  throw Error('Atualização concorrente');
 }catch(e){console.error(e);return Response.json({error:'A exclusão não foi concluída. Atualize os arquivados e tente excluir novamente para finalizar a limpeza.'},{status:503});}
}
