-- ============================================================
-- Rollback for supabase-auth-restore.sql
-- Returns the database to the post-lockdown, pre-restore state
-- (deny-by-default everywhere; login/studio/admin non-functional).
-- Does NOT roll back the security lockdown itself.
-- NOTE: the dropped password column is restored EMPTY (plaintext
-- passwords are gone for good; values were the placeholder word).
-- ============================================================

-- Policies
drop policy if exists studio_owner_all on public.studio_data;
drop policy if exists amora_owner_all on public.amora_memory;
drop policy if exists profiles_select_own on public.author_profiles;
drop policy if exists profiles_admin_all on public.author_profiles;
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
  end loop;
end $$;
drop policy if exists applications_public_insert on public.author_applications;
drop policy if exists categories_public_insert on public.proposed_categories;
drop policy if exists refunds_public_insert on public.refund_requests;
drop policy if exists subscribers_public_insert on public.email_subscribers;
drop policy if exists "page-art admin select" on storage.objects;
drop policy if exists "page-art admin insert" on storage.objects;
drop policy if exists "page-art admin update" on storage.objects;

-- Functions
drop function if exists public.check_coupon(text);
drop function if exists public.redeem_coupon(text, text);
drop function if exists public.get_published_covers();
drop function if exists private.coupon_valid(text);
drop function if exists private.is_admin();
drop schema if exists private;

-- Columns
alter table public.author_profiles add column if not exists password text;
alter table public.author_profiles drop column if exists auth_user_id;
alter table public.studio_data drop column if exists owner_auth_user_id;
alter table public.amora_memory drop column if exists owner_auth_user_id;
alter table public.author_applications
  drop column if exists consent_initials,
  drop column if exists agreement_accepted,
  drop column if exists agreement_accepted_at;

-- Seeded auth identity (only the seeded owner user)
delete from auth.identities where user_id in (select id from auth.users where email = 'hi@kirbyamour.com');
delete from auth.users where email = 'hi@kirbyamour.com';
