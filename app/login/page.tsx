'use client';
import {useState,type FormEvent} from 'react';
export default function Login(){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
 e.preventDefault();setBusy(true);setError('');const form=new FormData(e.currentTarget);
 try{const res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.get('email'),password:form.get('password')})});const body=await res.json();if(!res.ok)throw Error(body.error);window.location.assign('/');}
 catch(e){setError((e as Error).message);setBusy(false);}
 }
 return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#060923',padding:24}}><form onSubmit={submit} style={{width:'100%',maxWidth:420,background:'#FCFCFC',padding:36,borderRadius:18,display:'grid',gap:18}}>
 <p style={{color:'#AE8A56',fontWeight:700,letterSpacing:4}}>VEROSS</p><h1 style={{fontSize:26,fontWeight:700,color:'#060923'}}>Recrutamento</h1><p>Entre com o acesso da sua equipe.</p>
 <label>E-mail<input name="email" type="email" autoComplete="username" required style={input}/></label>
 <label>Senha<input name="password" type="password" autoComplete="current-password" required style={input}/></label>
 {error&&<p role="alert" style={{color:'#a12b2b'}}>{error}</p>}
 <button disabled={busy} style={{background:'#060923',color:'#FCFCFC',padding:12,borderRadius:8,cursor:'pointer'}}>{busy?'Entrando…':'Entrar'}</button>
 <p style={{fontSize:13,color:'#555'}}>Para solicitar acesso ou redefinir sua senha, fale com o responsável pelo ATS.</p>
 </form></main>;
}
const input={display:'block',width:'100%',padding:10,border:'1px solid #CDCDD0',borderRadius:8,marginTop:6};
