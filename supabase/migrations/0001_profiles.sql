-- Phase 2 — Auth + onboarding. See ADR 0002 / 0003.
-- The `profiles` table stores only the per-user salt and the Vault Key wrapped
-- with the Master Key. The server can never decrypt anything (zero-knowledge).

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  salt text not null,                 -- base64, per-user Argon2 salt (not secret)
  protected_vault_key text not null,  -- base64(iv || AES-256-GCM(vault_key))
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Row Level Security: each user can only touch their own profile.
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Prelogin: a new device must derive the auth hash before authenticating, which
-- needs the salt. The salt is NOT secret, so we expose it by email via a
-- SECURITY DEFINER function callable anonymously. (Trade-off: this allows
-- account enumeration, accepted for the MVP — same approach as Bitwarden.)
create or replace function public.get_salt_by_email(p_email text)
returns text
language sql
security definer
set search_path = public
as $$
  select p.salt
  from public.profiles p
  join auth.users u on u.id = p.user_id
  where lower(u.email) = lower(p_email)
  limit 1;
$$;

grant execute on function public.get_salt_by_email(text) to anon, authenticated;
