begin;
create table if not exists public.ats_workspaces(owner uuid primary key,payload text,revision integer not null default 0);
create table if not exists public.ats_members(user_id uuid primary key references auth.users(id) on delete cascade,workspace_id uuid not null references public.ats_workspaces(owner));
alter table public.ats_workspaces enable row level security;
alter table public.ats_members enable row level security;
revoke all on public.ats_workspaces,public.ats_members from anon,authenticated;
grant select on public.ats_workspaces,public.ats_members to authenticated;
drop policy if exists ats_own_membership on public.ats_members;
create policy ats_own_membership on public.ats_members for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists ats_team_read on public.ats_workspaces;
create policy ats_team_read on public.ats_workspaces for select to authenticated using(exists(select 1 from public.ats_members where user_id=(select auth.uid()) and workspace_id=owner));
create or replace function public.ats_initialize(workspace uuid,initial_payload text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.ats_members where user_id=auth.uid() and workspace_id=workspace) then raise exception 'Access denied'; end if;
 if octet_length(initial_payload)>4000000 or (initial_payload::jsonb->>'schemaVersion') is distinct from '2' then raise exception 'Invalid state'; end if;
 update public.ats_workspaces set payload=initial_payload where owner=workspace and payload is null;
end;$$;
create or replace function public.ats_save(workspace uuid,expected_revision integer,new_payload text) returns boolean
language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
 if not exists(select 1 from public.ats_members where user_id=auth.uid() and workspace_id=workspace) then raise exception 'Access denied'; end if;
 if octet_length(new_payload)>4000000 or (new_payload::jsonb->>'schemaVersion') is distinct from '2' then raise exception 'Invalid state'; end if;
 update public.ats_workspaces set payload=new_payload,revision=revision+1 where owner=workspace and revision=expected_revision;
 get diagnostics affected=row_count;
 return affected=1;
end;$$;
revoke all on function public.ats_initialize(uuid,text),public.ats_save(uuid,integer,text) from public,anon;
grant execute on function public.ats_initialize(uuid,text),public.ats_save(uuid,integer,text) to authenticated;
insert into public.ats_workspaces(owner) values('26724e70-856a-4ee0-8b61-fb294ce86c70') on conflict do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('curriculos','curriculos',false,10485760,array['application/pdf']) on conflict(id) do nothing;
drop policy if exists ats_resume_read on storage.objects;
create policy ats_resume_read on storage.objects for select to authenticated using(bucket_id='curriculos' and exists(select 1 from public.ats_members where user_id=(select auth.uid()) and workspace_id::text=(storage.foldername(name))[1]));
drop policy if exists ats_resume_upload on storage.objects;
create policy ats_resume_upload on storage.objects for insert to authenticated with check(bucket_id='curriculos' and exists(select 1 from public.ats_members where user_id=(select auth.uid()) and workspace_id::text=(storage.foldername(name))[1]));
commit;
