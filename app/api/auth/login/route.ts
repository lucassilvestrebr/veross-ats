import {supabase} from '@/lib/supabase';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origem inválida.'},{status:403});
 try{
 const {email,password}=await req.json();
 if(typeof email!=='string'||typeof password!=='string'||email.length>254||password.length>1024)return Response.json({error:'Confira e-mail e senha.'},{status:400});
 const client=await supabase();const {data,error}=await client.auth.signInWithPassword({email,password});
 if(error)return Response.json({error:'Não foi possível entrar. Confira e-mail e senha.'},{status:401});
 const {data:member,error:memberError}=await client.from('ats_members').select('workspace_id').eq('user_id',data.user.id).maybeSingle();
 if(memberError||!member){await client.auth.signOut();return Response.json({error:'Seu acesso à equipe ainda não foi liberado. Fale com o responsável pelo ATS.'},{status:403});}
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Não foi possível conectar. Tente novamente.'},{status:503});}
}
