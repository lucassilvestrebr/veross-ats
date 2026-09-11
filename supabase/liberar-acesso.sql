-- Crie a pessoa em Authentication > Users > Add user > Create new user.
-- Substitua o e-mail abaixo. Repita para cada pessoa autorizada.
insert into public.ats_members(user_id,workspace_id)
select id,'26724e70-856a-4ee0-8b61-fb294ce86c70'::uuid
from auth.users where lower(email)=lower('SUBSTITUA_PELO_EMAIL')
on conflict(user_id) do nothing returning user_id,workspace_id;
