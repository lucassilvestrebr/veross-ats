-- Adds readable member profiles without changing membership or permissions.
begin;
alter table public.ats_members add column if not exists name text;
alter table public.ats_members add column if not exists email text;

create or replace function public.ats_member_profile_from_auth() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 select u.email,coalesce(nullif(btrim(u.raw_user_meta_data->>'full_name'),''),nullif(btrim(u.raw_user_meta_data->>'name'),''),new.name)
 into new.email,new.name from auth.users u where u.id=new.user_id;
 return new;
end;$$;
revoke all on function public.ats_member_profile_from_auth() from public,anon,authenticated;
create trigger ats_member_profile_from_auth before insert or update of user_id
on public.ats_members for each row execute function public.ats_member_profile_from_auth();

create or replace function public.ats_sync_member_profile() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 update public.ats_members set email=new.email,
 name=coalesce(nullif(btrim(new.raw_user_meta_data->>'full_name'),''),nullif(btrim(new.raw_user_meta_data->>'name'),''),name)
 where user_id=new.id;
 return new;
end;$$;
revoke all on function public.ats_sync_member_profile() from public,anon,authenticated;
create trigger ats_sync_member_profile after update of email,raw_user_meta_data
on auth.users for each row execute function public.ats_sync_member_profile();

update public.ats_members m set email=u.email,
name=coalesce(nullif(btrim(u.raw_user_meta_data->>'full_name'),''),nullif(btrim(u.raw_user_meta_data->>'name'),''),m.name)
from auth.users u where u.id=m.user_id;
commit;
