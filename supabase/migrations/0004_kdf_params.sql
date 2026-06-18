-- Per-user Argon2 params. See ADR 0002.
--
-- Argon2id runs on the single JS thread (pure JS, no workers in Expo Go) and was
-- too slow on Hermes (~30s) with the original 8 MiB / 2-pass cost. We lowered the
-- default for new accounts, so each account must remember the params it was
-- created with — otherwise login/unlock would re-derive with the wrong cost and
-- fail. Params are NOT secret (same status as the salt).

alter table public.profiles add column if not exists kdf_params jsonb;

-- Prelogin must return salt AND params before authenticating (a fresh device has
-- nothing cached). Mirrors get_salt_by_email (0002): profiles first, then the
-- user_metadata fallback for accounts pending email confirmation. Returns NULL
-- salt when the account doesn't exist.
create or replace function public.get_prelogin_by_email(p_email text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'salt', coalesce(
      (
        select p.salt from public.profiles p
        join auth.users u on u.id = p.user_id
        where lower(u.email) = lower(p_email) limit 1
      ),
      (
        select u.raw_user_meta_data ->> 'salt' from auth.users u
        where lower(u.email) = lower(p_email) limit 1
      )
    ),
    'params', coalesce(
      (
        select p.kdf_params from public.profiles p
        join auth.users u on u.id = p.user_id
        where lower(u.email) = lower(p_email) limit 1
      ),
      (
        select u.raw_user_meta_data -> 'kdf_params' from auth.users u
        where lower(u.email) = lower(p_email) limit 1
      )
    )
  );
$$;

grant execute on function public.get_prelogin_by_email(text) to anon, authenticated;
