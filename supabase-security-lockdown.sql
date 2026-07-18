-- ============================================================
-- Little Amour Books — security hardening (least-privilege RLS)
-- Project: usswjujofmwcpdtkexbr (little-amour-books)
-- Forward migration. Rollback: rollback/20260718024034_rollback.sql
-- Non-destructive: no rows are deleted, truncated, or rewritten.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Enable RLS on the four tables flagged by Security Advisor
--    (rls_disabled_in_public, level ERROR). No client policies
--    are added: these hold private author/admin data whose
--    ownership is supplied by the browser today, so they become
--    server-only (service_role bypasses RLS).
-- ------------------------------------------------------------
alter table public.studio_data     enable row level security;
alter table public.amora_memory    enable row level security;
alter table public.email_templates enable row level security;
alter table public.book_exports    enable row level security;

-- ------------------------------------------------------------
-- 2. author_profiles: remove the public credential leak.
--    Policy "Allow public read for login" was SELECT USING (true)
--    for role public, exposing email + password (stored in clear)
--    to anyone holding the anon key. Login must move server-side.
-- ------------------------------------------------------------
drop policy "Allow public read for login" on public.author_profiles;

-- ------------------------------------------------------------
-- 3. image_generation_events: least-privilege telemetry sink.
--    - Remove broad SELECT (clients could read all rows incl.
--      author emails).
--    - Replace WITH CHECK (true) INSERT (Security Advisor WARN
--      rls_policy_always_true) with a bounded write-only policy.
-- ------------------------------------------------------------
drop policy "image_events_select" on public.image_generation_events;
drop policy "image_events_insert" on public.image_generation_events;

create policy "image_events_insert_telemetry"
  on public.image_generation_events
  for insert
  to anon, authenticated
  with check (
        status in ('success','failed','error','blocked_finished_art','blocked_unconfirmed')
    and source is not null
    and length(source) <= 100
    and (author_email is null or length(author_email) <= 255)
    and (book_id  is null or length(book_id)  <= 100)
    and (page_id  is null or length(page_id)  <= 100)
    and (error    is null or length(error)    <= 2000)
  );

-- ------------------------------------------------------------
-- 4. Defense in depth: client roles never need table-level
--    TRUNCATE / TRIGGER / REFERENCES (TRUNCATE is not gated by
--    RLS). Row access remains governed by RLS policies.
-- ------------------------------------------------------------
revoke truncate, trigger, references
  on all tables in schema public
  from anon, authenticated;

-- ------------------------------------------------------------
-- 5. Storage: page-art bucket.
--    Bucket is public, so object reads via public URLs keep
--    working WITHOUT any storage.objects policy. The existing
--    policies granted role public (i.e. anonymous) INSERT and
--    UPDATE — anyone could upload to or overwrite book art —
--    and the broad SELECT allowed full bucket listing
--    (Security Advisor WARN public_bucket_allows_listing).
--    Uploads must move behind a server endpoint (signed upload
--    URLs or service_role).
-- ------------------------------------------------------------
drop policy "page-art write"  on storage.objects;
drop policy "page-art update" on storage.objects;
drop policy "page-art read"   on storage.objects;
