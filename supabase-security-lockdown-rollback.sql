-- ============================================================
-- Rollback for 20260718024034_security_least_privilege_rls.sql
-- Restores the exact pre-migration policy/RLS/grant state
-- recorded on 2026-07-18 (see policy_state_before.md).
-- WARNING: running this re-opens the security holes.
-- ============================================================

-- 1. Disable RLS again on the four tables
alter table public.studio_data     disable row level security;
alter table public.amora_memory    disable row level security;
alter table public.email_templates disable row level security;
alter table public.book_exports    disable row level security;

-- 2. Restore author_profiles public read policy (verbatim)
create policy "Allow public read for login"
  on public.author_profiles
  for select
  to public
  using (true);

-- 3. Restore image_generation_events policies (verbatim)
drop policy if exists "image_events_insert_telemetry" on public.image_generation_events;

create policy "image_events_select"
  on public.image_generation_events
  for select
  to anon, authenticated
  using (true);

create policy "image_events_insert"
  on public.image_generation_events
  for insert
  to anon, authenticated
  with check (true);

-- 4. Restore table-level grants
grant truncate, trigger, references
  on all tables in schema public
  to anon, authenticated;

-- 5. Restore page-art storage policies (verbatim)
create policy "page-art read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'page-art'::text);

create policy "page-art write"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'page-art'::text);

create policy "page-art update"
  on storage.objects
  for update
  to public
  using (bucket_id = 'page-art'::text);
