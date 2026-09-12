'use client';
import {useEffect,useState} from 'react';
import type {Candidate,State} from '@/lib/ats';
import {myActivities,activityGroup,type Activity} from '@/lib/activities';
import {localDate} from '@/lib/process';
import {Button} from '@/components/ui/button';

export function HomeActivities({state,identity,busy,onOpen,onComplete}:{state:State;identity:{name:string;email:string;id:string};busy:boolean;onOpen:(c:Candidate)=>void;onComplete:(a:Activity)=>Promise<void>}){
 const [today,setToday]=useState(localDate);
 useEffect(()=>{const id=setInterval(()=>setToday(localDate()),30000);const update=()=>setToday(localDate());window.addEventListener('focus',update);return()=>{clearInterval(id);window.removeEventListener('focus',update);};},[]);
 const activities=myActivities(state,identity);
 const sections=[['overdue','Vencidas'],['today','Hoje'],['upcoming','Próximos dias'],['undated','Sem prazo'],['done','Concluídas']] as const;
 const pending=activities.filter(a=>!a.done).length;
 function list(items:Activity[]){return <ul className="activity-list">{items.map(a=><li key={a.id} className={'activity-row'+(a.done?' activity-done':'')}><div className="activity-copy"><strong>{a.title}</strong><p>{a.candidateName} · {a.stage}</p><span className="activity-status">{a.done?'Concluída':a.taskId?'Pendente':'Próxima ação'}</span></div><time dateTime={a.due||undefined}>{a.due?new Date(a.due+'T12:00:00').toLocaleDateString('pt-BR'):'Sem prazo'}</time><div className="activity-actions"><Button variant="outline" size="sm" disabled={busy} onClick={()=>{const c=state.candidates.find(c=>c.id===a.candidateId);if(c)onOpen(c);}}>Abrir candidato</Button>{!a.done&&a.taskId&&<Button size="sm" disabled={busy} onClick={()=>void onComplete(a)}>Concluir tarefa</Button>}</div></li>)}</ul>;}
 return <section className="activity-home" aria-label="Minhas atividades"><div className="activity-intro"><div><h2>Minhas atividades</h2><p>Olá, {identity.name}. Você tem {pending} atividade{pending===1?'':'s'} pendente{pending===1?'':'s'}.</p></div><span>Hoje · {new Date(today+'T12:00:00').toLocaleDateString('pt-BR')}</span></div><p className="footnote">Tarefas atribuídas ao seu nome ou e-mail e próximas ações dos candidatos sob sua responsabilidade. Nas próximas ações, abra a ficha para atualizar o acompanhamento.</p>
 {!activities.length?<div className="empty"><h3>Nenhuma atividade atribuída a você</h3><p>Preencha o responsável das tarefas com {identity.name} ou {identity.email}.</p></div>:sections.map(([key,label])=>{const items=activities.filter(a=>activityGroup(a,today)===key);if(key==='done')return items.length?<details className="activity-section" key={key}><summary>Concluídas <span>{items.length}</span></summary>{list(items)}</details>:null;return <section key={key} className={'activity-section activity-'+key}><h3>{label} <span>{items.length}</span></h3>{items.length?list(items):<p className="activity-empty">Nenhuma atividade {key==='overdue'?'vencida':key==='today'?'para hoje':key==='undated'?'sem prazo':'para os próximos dias'}.</p>}</section>;})}
 </section>;
}
