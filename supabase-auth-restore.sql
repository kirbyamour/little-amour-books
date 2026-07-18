-- ============================================================
-- LITTLE AMOUR — restore functionality after security lockdown
-- Project: usswjujofmwcpdtkexbr (little-amour-books)
-- Additive only. Preserves the security lockdown migration.
-- Rollback: supabase-auth-restore-rollback.sql
-- ============================================================

-- ---------- 1. Private helper schema ----------
create schema if not exists private;
grant usage on schema private to authenticated, anon;

-- ---------- 2. Additive columns ----------
alter table public.author_profiles
  add column if not exists auth_user_id uuid unique references auth.users(id);

alter table public.studio_data
  add column if not exists owner_auth_user_id uuid references auth.users(id) default auth.uid();

alter table public.amora_memory
  add column if not exists owner_auth_user_id uuid references auth.users(id) default auth.uid();

-- Columns the apply form already sends but the table never had
alter table public.author_applications
  add column if not exists consent_initials text,
  add column if not exists agreement_accepted boolean default false,
  add column if not exists agreement_accepted_at timestamptz;

create index if not exists studio_data_owner_idx on public.studio_data (owner_auth_user_id);

-- ---------- 3. Seed the owner auth identity (idempotent) ----------
-- Creates a confirmed Supabase Auth user for hi@kirbyamour.com with an
-- unknown random password (magic-link sign-in only), then links the
-- admin profile, all three house-persona studio rows, and amora memory.
do $$
declare v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'hi@kirbyamour.com';
  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token,
      is_sso_user
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      'hi@kirbyamour.com',
      extensions.crypt(encode(extensions.gen_random_bytes(32), 'hex'), extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
      '', '', '', '', '', '', '', '', false
    );
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', 'hi@kirbyamour.com', 'email_verified', true),
      'email', v_uid::text, now(), now(), now()
    );
  end if;
  update public.author_profiles set auth_user_id = v_uid where email = 'hi@kirbyamour.com';
  update public.studio_data set owner_auth_user_id = v_uid where id in ('kirby','june','mara');
  update public.amora_memory set owner_auth_user_id = v_uid where author_email = 'hi@kirbyamour.com';
end $$;

-- ---------- 4. Drop plaintext password storage ----------
-- All values were the placeholder word; secure auth replaces this.
alter table public.author_profiles drop column if exists password;

-- ---------- 5. Helper functions ----------
create or replace function private.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.author_profiles p
    where p.auth_user_id = auth.uid() and p.is_admin and p.active
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create or replace function private.coupon_valid(p_code text)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select p_code is not null and length(p_code) <= 64 and exists (
    select 1 from public.launch_coupons c
    where c.code = p_code and c.used_at is null
  );
$$;
revoke all on function private.coupon_valid(text) from public;
grant execute on function private.coupon_valid(text) to anon, authenticated;

-- ---------- 6. Narrow public RPCs ----------
-- Coupon check: returns only a status word, never the coupon list.
create or replace function public.check_coupon(p_code text)
returns text
language sql stable security definer
set search_path = ''
as $$
  select case
    when p_code is null or length(p_code) > 64 then 'invalid'
    when exists (select 1 from public.launch_coupons c where c.code = p_code and c.used_at is null) then 'valid'
    when exists (select 1 from public.launch_coupons c where c.code = p_code) then 'used'
    else 'invalid'
  end;
$$;
revoke all on function public.check_coupon(text) from public;
grant execute on function public.check_coupon(text) to anon, authenticated;

-- Coupon redeem: marks a still-unused code used; reveals nothing else.
create or replace function public.redeem_coupon(p_code text, p_email text)
returns boolean
language sql volatile security definer
set search_path = ''
as $$
  with upd as (
    update public.launch_coupons
    set used_by_email = left(coalesce(p_email,''), 255), used_at = now()
    where code = p_code and used_at is null
      and p_code is not null and length(p_code) <= 64
    returning 1
  )
  select exists (select 1 from upd);
$$;
revoke all on function public.redeem_coupon(text, text) from public;
grant execute on function public.redeem_coupon(text, text) to anon, authenticated;

-- Public storefront covers: whitelisted cover + sell-format fields for the
-- three house personas' books only — never drafts' text, prompts, or chat.
create or replace function public.get_published_covers()
returns table (book_id text, cover jsonb, sell jsonb)
language sql stable security definer
set search_path = ''
as $$
  select
    b->>'id' as book_id,
    case when b->'publishing'->'cover'->>'coverImageUrl' is not null then
      jsonb_build_object(
        'url',         b->'publishing'->'cover'->>'coverImageUrl',
        'title',       b->'publishing'->'cover'->'title',
        'subtitle',    b->'publishing'->'cover'->'subtitle',
        'authorName',  b->'publishing'->'cover'->'authorName',
        'series',      b->'publishing'->'cover'->'series',
        'ageRange',    b->'publishing'->'cover'->'ageRange',
        'showAgeBadge',b->'publishing'->'cover'->'showAgeBadge',
        'showLogo',    b->'publishing'->'cover'->'showLogo',
        'finishedArt', b->'publishing'->'cover'->'finishedArt'
      )
    end as cover,
    jsonb_build_object(
      'sellAs',    b->'publishing'->'sellAs',
      'amazonUrl', b->'publishing'->>'amazonUrl'
    ) as sell
  from public.studio_data sd
  cross join lateral jsonb_array_elements(coalesce(sd.data->'books','[]'::jsonb)) b
  where sd.id in ('kirby','june','mara') and b->>'id' is not null;
$$;
revoke all on function public.get_published_covers() from public;
grant execute on function public.get_published_covers() to anon, authenticated;

-- ---------- 7. Owner-scoped RLS: studio + amora ----------
drop policy if exists studio_owner_all on public.studio_data;
create policy studio_owner_all on public.studio_data
  for all to authenticated
  using (owner_auth_user_id = (select auth.uid()))
  with check (owner_auth_user_id = (select auth.uid()));

drop policy if exists amora_owner_all on public.amora_memory;
create policy amora_owner_all on public.amora_memory
  for all to authenticated
  using (owner_auth_user_id = (select auth.uid()))
  with check (owner_auth_user_id = (select auth.uid()));

-- ---------- 8. author_profiles: own-row read, admin manage ----------
drop policy if exists profiles_select_own on public.author_profiles;
create policy profiles_select_own on public.author_profiles
  for select to authenticated
  using (auth_user_id = (select auth.uid()));

drop policy if exists profiles_admin_all on public.author_profiles;
create policy profiles_admin_all on public.author_profiles
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- ---------- 9. Admin-only access for dashboard tables ----------
do $$
declare t text;
begin
  foreach t in array array[
    'orders','purchases','email_subscribers','author_applications',
    'proposed_categories','page_views','chat_logs','sponsor_crm',
    'checkout_consents','refund_requests','launch_emails','launch_coupons',
    'book_submissions','email_templates','book_exports',
    'image_generation_events','render_log'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (private.is_admin()) with check (private.is_admin())',
      t || '_admin_all', t
    );
  end loop;
end $$;

-- ---------- 10. Bounded anonymous INSERTs for public forms ----------
drop policy if exists applications_public_insert on public.author_applications;
create policy applications_public_insert on public.author_applications
  for insert to anon, authenticated
  with check (
        status = 'new' and reviewed_at is null
    and length(name) between 1 and 200
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and length(email) <= 255
    and (pen_name is null or length(pen_name) <= 200)
    and (stage is null or length(stage) <= 100)
    and (theme is null or length(theme) <= 100)
    and (suggested_theme_name is null or length(suggested_theme_name) <= 200)
    and book_title is null
    and (book_idea is null or length(book_idea) <= 10000)
    and (admin_note is null or length(admin_note) <= 500)
    and (coupon_code is null or length(coupon_code) <= 64)
    and (fee_waived = false or private.coupon_valid(coupon_code))
    and (consent_initials is null or length(consent_initials) <= 1000)
  );

drop policy if exists categories_public_insert on public.proposed_categories;
create policy categories_public_insert on public.proposed_categories
  for insert to anon, authenticated
  with check (
        status = 'pending' and reviewed_at is null and admin_note is null
    and (proposed_by is null or length(proposed_by) <= 255)
    and length(name) between 1 and 200
    and (description is null or length(description) <= 2000)
    and (example_book_idea is null or length(example_book_idea) <= 10000)
  );

drop policy if exists refunds_public_insert on public.refund_requests;
create policy refunds_public_insert on public.refund_requests
  for insert to anon, authenticated
  with check (
        status = 'pending' and decision_notes is null
    and (order_number is null or length(order_number) <= 100)
    and customer_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and length(customer_email) <= 255
    and (product_name is null or length(product_name) <= 300)
    and (product_type is null or length(product_type) <= 50)
    and (reason is null or length(reason) <= 100)
    and (description is null or length(description) <= 5000)
    and photo_count between 0 and 20
  );

drop policy if exists subscribers_public_insert on public.email_subscribers;
create policy subscribers_public_insert on public.email_subscribers
  for insert to anon, authenticated
  with check (
        email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and length(email) <= 255
    and (source is null or length(source) <= 50)
  );

-- ---------- 11. Storage: admin-only page-art management ----------
drop policy if exists "page-art admin select" on storage.objects;
create policy "page-art admin select" on storage.objects
  for select to authenticated
  using (bucket_id = 'page-art' and private.is_admin());

drop policy if exists "page-art admin insert" on storage.objects;
create policy "page-art admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'page-art' and private.is_admin());

drop policy if exists "page-art admin update" on storage.objects;
create policy "page-art admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'page-art' and private.is_admin())
  with check (bucket_id = 'page-art' and private.is_admin());
