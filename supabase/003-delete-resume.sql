-- Only existing team members may delete files in their own workspace folder.
create policy ats_resume_delete on storage.objects for delete to authenticated
using(bucket_id='curriculos' and exists(
 select 1 from public.ats_members
 where user_id=(select auth.uid()) and workspace_id::text=(storage.foldername(name))[1]
));
