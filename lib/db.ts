import {supabase} from './supabase';
// Keep the ATS validation and optimistic concurrency while using PostgreSQL.
export function database(){return {prepare(sql:string){return {bind(...args:unknown[]){return {
 async first<T>(){const client=await supabase();const {data,error}=await client.from('ats_workspaces').select('payload,revision').eq('owner',args[0]).maybeSingle();if(error)throw error;return data as T|null;},
 async run(){const client=await supabase();if(sql.startsWith('INSERT')){const {error}=await client.rpc('ats_initialize',{workspace:args[0],initial_payload:args[1]});if(error)throw error;return {meta:{changes:1}};}
 const {data,error}=await client.rpc('ats_save',{workspace:args[1],expected_revision:args[2],new_payload:args[0]});if(error)throw error;return {meta:{changes:data?1:0}};}
};}};}};}
export function bucket(){return {
 async put(key:string,bytes:ArrayBuffer,_options:unknown){const client=await supabase();const {error}=await client.storage.from('curriculos').upload(key,bytes,{contentType:'application/pdf',upsert:false});if(error)throw error;},
 async get(key:string){const client=await supabase();const {data,error}=await client.storage.from('curriculos').download(key);if(error)throw error;return data?{body:data}:null;}
};}
