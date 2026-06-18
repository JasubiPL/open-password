-- Phase 4 — Sync with Supabase. See ADR 0002 / 0003.
--
-- Server tables mirror the local SQLite cache: they store ONLY the encrypted
-- record blob (`data`) plus non-sensitive metadata (ids, timestamps, soft-delete
-- flag). The server never sees plaintext (zero-knowledge). Names, icons, colors,
-- usernames, etc. all live inside `data`, encrypted with the Vault Key.
--
-- Timestamps are client-generated epoch milliseconds (to match `Date.now()` in
-- the app) and drive last-writer-wins sync. Trade-off: cross-device clock skew
-- could pick the wrong winner; accepted for the MVP.

create table if not exists public.vaults (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data text not null,                  -- base64(iv || AES-256-GCM(json(vault)))
  created_at bigint not null,          -- client epoch ms
  updated_at bigint not null,          -- client epoch ms (sync cursor)
  deleted boolean not null default false
);

create table if not exists public.items (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vault_id uuid not null,              -- logical ref to vaults.id (no FK: soft-delete + offline-first)
  data text not null,                  -- base64(iv || AES-256-GCM(json(item)))
  created_at bigint not null,
  updated_at bigint not null,
  deleted boolean not null default false
);

-- Pull queries filter by user + updated_at; index accordingly.
create index if not exists idx_vaults_user_updated on public.vaults (user_id, updated_at);
create index if not exists idx_items_user_updated on public.items (user_id, updated_at);

-- Row Level Security: each user can only touch their own rows.
alter table public.vaults enable row level security;
alter table public.items enable row level security;

drop policy if exists "vaults_select_own" on public.vaults;
create policy "vaults_select_own" on public.vaults
  for select using (auth.uid() = user_id);

drop policy if exists "vaults_insert_own" on public.vaults;
create policy "vaults_insert_own" on public.vaults
  for insert with check (auth.uid() = user_id);

drop policy if exists "vaults_update_own" on public.vaults;
create policy "vaults_update_own" on public.vaults
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "vaults_delete_own" on public.vaults;
create policy "vaults_delete_own" on public.vaults
  for delete using (auth.uid() = user_id);

drop policy if exists "items_select_own" on public.items;
create policy "items_select_own" on public.items
  for select using (auth.uid() = user_id);

drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own" on public.items
  for insert with check (auth.uid() = user_id);

drop policy if exists "items_update_own" on public.items;
create policy "items_update_own" on public.items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own" on public.items
  for delete using (auth.uid() = user_id);
