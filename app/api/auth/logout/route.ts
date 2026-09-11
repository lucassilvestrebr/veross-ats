import {supabase} from '@/lib/supabase';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return new Response(null,{status:403});
 const client=await supabase();await client.auth.signOut();
 return new Response(null,{status:303,headers:{Location:'/login','Cache-Control':'no-store'}});
}
