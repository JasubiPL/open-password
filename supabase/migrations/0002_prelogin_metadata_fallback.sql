-- Phase 2 follow-up — support the email-confirmation flow.
-- When "Confirm email" is enabled, an account exists (with salt + protected
-- vault key in user_metadata) before any `profiles` row is created. The prelogin
-- step needs the salt BEFORE authenticating, so get_salt_by_email must also look
-- in auth.users.raw_user_meta_data, not only in profiles.

create or replace function public.get_salt_by_email(p_email text)
returns text
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.salt
      from public.profiles p
      join auth.users u on u.id = p.user_id
      where lower(u.email) = lower(p_email)
      limit 1
    ),
    (
      select u.raw_user_meta_data ->> 'salt'
      from auth.users u
      where lower(u.email) = lower(p_email)
      limit 1
    )
  );
$$;

grant execute on function public.get_salt_by_email(text) to anon, authenticated;
