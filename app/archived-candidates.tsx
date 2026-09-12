'use client';
import {useState} from 'react';
import type {Candidate} from '@/lib/ats';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
export function ArchivedCandidates({open,onClose,candidates,busy,error,onRestore,onDelete}:{open:boolean;onClose:()=>void;candidates:Candidate[];busy:boolean;error:string;onRestore:(c:Candidate)=>Promise<void>;onDelete:(c:Candidate,name:string)=>Promise<boolean>}){
 const [selected,setSelected]=useState<string|null>(null),[name,setName]=useState('');
 return <Dialog open={open} onOpenChange={value=>{if(!value&&!busy){setSelected(null);setName('');onClose();}}}><DialogContent className="dialog-scroll"><DialogHeader><DialogTitle>Arquivados</DialogTitle><DialogDescription>Cadastros fora do quadro e da lista de atividades. Restaure para retomar o acompanhamento ou exclua definitivamente.</DialogDescription></DialogHeader>
 {error&&<p className="error" role="alert">{error}</p>}{!candidates.length?<p>Nenhum candidato arquivado.</p>:candidates.map(c=><section className="archived-card" key={c.id}><h3>{c.name}</h3><p>{c.stage} · Arquivado em {new Date(c.archivedAt!).toLocaleDateString('pt-BR')}</p>{c.deletionPending&&<p role="status">Exclusão incompleta. Clique em Excluir definitivamente para tentar novamente.</p>}
 {selected===c.id?<form onSubmit={async e=>{e.preventDefault();if(await onDelete(c,name)){setSelected(null);setName('');}}}><p>Esta ação remove o cadastro, as tarefas, avaliações, histórico e o currículo anexado. Não pode ser desfeita.</p><label>Digite exatamente <strong>{c.name}</strong> para confirmar<Input value={name} onChange={e=>setName(e.target.value)} autoComplete="off" disabled={busy}/></label><div className="archive-actions"><Button type="button" variant="outline" disabled={busy} onClick={()=>{setSelected(null);setName('');}}>Cancelar</Button><Button type="submit" variant="destructive" disabled={busy||name!==c.name}>Confirmar exclusão definitiva</Button></div></form>:<div className="archive-actions"><Button variant="outline" disabled={busy||c.deletionPending} onClick={()=>void onRestore(c)}>Restaurar</Button><Button variant="destructive" disabled={busy} onClick={()=>{setSelected(c.id);setName('');}}>Excluir definitivamente</Button></div>}</section>)}
 </DialogContent></Dialog>;
}

