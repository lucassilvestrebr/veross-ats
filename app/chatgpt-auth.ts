import {redirect} from 'next/navigation';
import {supabase} from '@/lib/supabase';
export async function getChatGPTUser(){
 const client=await supabase();const {data:{user}}=await client.auth.getUser();if(!user)return null;
 const {data,error}=await client.from('ats_members').select('workspace_id').eq('user_id',user.id).maybeSingle();
 if(error)throw error;if(!data)return null;
 return {userId:data.workspace_id as string,accountId:user.id,email:user.email||'',displayName:user.user_metadata?.full_name||user.email||'Equipe Veross'};
}
export async function requireChatGPTUser(_returnTo:string){const user=await getChatGPTUser();if(!user)redirect('/login');return user;}
