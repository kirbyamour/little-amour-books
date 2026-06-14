-- ============================================================
-- LITTLE AMOUR BOOKS — Pricing & Royalty Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Pricing defaults (admin-editable)
create table if not exists pricing_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_type text not null,
  default_price numeric(10,2) not null,
  min_price numeric(10,2),
  max_price numeric(10,2),
  is_pay_what_you_can boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cost assumptions per format
create table if not exists cost_assumptions (
  id uuid primary key default gen_random_uuid(),
  format_type text not null unique,
  print_cost numeric(10,2) default 0,
  payment_processing_pct numeric(6,5) default 0.029,
  payment_processing_fixed numeric(10,2) default 0.30,
  fulfillment_cost numeric(10,2) default 0,
  platform_fee_pct numeric(6,5) default 0,
  digital_delivery_cost numeric(10,2) default 0,
  ai_token_reserve numeric(10,2) default 0,
  notes text,
  created_at timestamptz default now()
);

-- Royalty rules
create table if not exists royalty_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ownership_type text not null check (ownership_type in ('house', 'author')),
  author_pct numeric(6,5) default 0.70,
  platform_pct numeric(6,5) default 0.30,
  flat_author_amount numeric(10,2),
  applies_to_format text,
  deduct_production_costs boolean default true,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Authors
create table if not exists authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  pen_name text,
  ownership_type text default 'author' check (ownership_type in ('house', 'author')),
  royalty_rule_id uuid references royalty_rules(id),
  notes text,
  created_at timestamptz default now()
);

-- Books (links to existing BOOKS array by key)
create table if not exists books_pricing (
  id uuid primary key default gen_random_uuid(),
  book_key text not null unique,
  title text not null,
  author_id uuid references authors(id),
  ownership_type text default 'house' check (ownership_type in ('house', 'author')),
  royalty_rule_id uuid references royalty_rules(id),
  created_at timestamptz default now()
);

-- Product formats per book
create table if not exists product_formats (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books_pricing(id),
  format_type text not null,
  price numeric(10,2) not null,
  cost_assumption_id uuid references cost_assumptions(id),
  royalty_rule_id uuid references royalty_rules(id),
  purchase_type text default 'internal' check (purchase_type in ('internal', 'external')),
  external_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Production cost ledger per book
create table if not exists production_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books_pricing(id),
  author_id uuid references authors(id),
  cost_type text not null,
  amount numeric(10,2) not null default 0,
  status text not null check (status in ('paid_upfront','deduct_from_royalties','sponsored','waived','absorbed')),
  notes text,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text,
  total_amount numeric(10,2) not null,
  status text default 'completed',
  created_at timestamptz default now()
);

-- Per-order financial breakdown
create table if not exists order_financials (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  book_id uuid references books_pricing(id),
  format_type text not null,
  price_tier text,
  gross_price numeric(10,2) not null,
  direct_costs numeric(10,2) default 0,
  net_royalty_pool numeric(10,2),
  author_payout numeric(10,2) default 0,
  little_amour_contribution numeric(10,2),
  production_cost_deducted numeric(10,2) default 0,
  sponsor_credit_used numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- Sponsor funds
create table if not exists sponsor_funds (
  id uuid primary key default gen_random_uuid(),
  sponsor_name text,
  amount_received numeric(10,2) not null,
  sponsor_type text,
  recipient_type text check (recipient_type in ('general_fund','specific_family','specific_author','specific_book')),
  linked_author_id uuid references authors(id),
  linked_book_id uuid references books_pricing(id),
  amount_used numeric(10,2) default 0,
  notes text,
  created_at timestamptz default now()
);

-- Bundles
create table if not exists bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null,
  allocation_method text default 'equal' check (allocation_method in ('equal','weighted','manual')),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Bundle book allocations
create table if not exists bundle_allocations (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid references bundles(id) on delete cascade,
  book_id uuid references books_pricing(id),
  manual_pct numeric(6,5),
  royalty_rule_id uuid references royalty_rules(id),
  created_at timestamptz default now()
);

-- Author setup packages
create table if not exists author_packages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references authors(id),
  package_name text not null,
  amount_charged numeric(10,2),
  amount_paid numeric(10,2) default 0,
  amount_waived numeric(10,2) default 0,
  amount_sponsored numeric(10,2) default 0,
  sponsor_fund_id uuid references sponsor_funds(id),
  production_costs_covered boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- DEFAULT SEED DATA
-- ============================================================

insert into pricing_settings (name, product_type, default_price, min_price, max_price, is_pay_what_you_can) values
  ('Kindle / Amazon ebook',          'kindle_ebook',          4.99,  4.99,  4.99,  false),
  ('Website digital — community',    'website_digital',       3.00,  3.00,  3.00,  true),
  ('Website digital — standard',     'website_digital',       7.00,  3.00,  15.00, true),
  ('Website digital — supporter',    'website_digital',       11.00, 11.00, 11.00, true),
  ('Website digital — sponsor',      'website_digital',       15.00, 15.00, null,  true),
  ('Website paperback',              'website_paperback',     15.00, 15.00, 15.00, false),
  ('Amazon / KDP paperback',         'amazon_paperback',      16.99, 16.99, 16.99, false),
  ('Paperback + digital bundle',     'direct_bundle',         19.00, 19.00, 19.00, false),
  ('3-book healing bundle',          'bundle_3',              39.00, 39.00, 39.00, false),
  ('5-book starter library',         'bundle_5',              64.00, 59.00, 69.00, false),
  ('Therapist / advocate bundle',    'bundle_therapist',      99.00, 79.00, 149.00,false),
  ('Sponsor-a-family gift',          'sponsor_gift',          20.00, 15.00, 25.00, false),
  ('Author community starter',       'author_setup',          25.00, 15.00, 35.00, true),
  ('Supported book build',           'author_setup_supported',149.00,99.00, 199.00,false),
  ('Premium done-with-you build',    'author_setup_premium',  299.00,299.00,null,  false)
on conflict do nothing;

insert into cost_assumptions (format_type, print_cost, payment_processing_pct, payment_processing_fixed, fulfillment_cost, platform_fee_pct, digital_delivery_cost, ai_token_reserve, notes) values
  ('website_digital',   0,    0.029, 0.30, 0,    0,    0, 0.50, 'Stripe standard + AI token reserve'),
  ('website_paperback', 3.50, 0.029, 0.30, 0,    0,    0, 0,    'Print-on-demand estimate'),
  ('kindle_ebook',      0,    0,     0,    0,    0.35, 0, 0,    'Amazon 65% royalty rate ($2.99–$9.99)'),
  ('amazon_paperback',  3.85, 0,     0,    0,    0.40, 0, 0,    'KDP print cost + 60% royalty rate'),
  ('direct_bundle',     3.50, 0.029, 0.30, 0,    0,    0, 0.50, 'Paperback + digital bundle')
on conflict (format_type) do nothing;

insert into royalty_rules (name, ownership_type, author_pct, platform_pct, is_default, deduct_production_costs) values
  ('House book — 100% Little Amour', 'house',  0,    1.0,  false, true),
  ('Author book — 70/30 (default)',   'author', 0.70, 0.30, true,  true),
  ('Author book — 60/40',             'author', 0.60, 0.40, false, true),
  ('Author book — 80/20 promoted',    'author', 0.80, 0.20, false, true),
  ('Donated project — no royalty',    'author', 0,    0,    false, false)
on conflict do nothing;

-- ============================================================
-- Proposed Categories (from author applications)
-- ============================================================
create table if not exists proposed_categories (
  id uuid primary key default gen_random_uuid(),
  proposed_by text,
  name text not null,
  slug text,
  description text,
  example_book_idea text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- ADMIN DASHBOARD — Extended Tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- Author applications (from "Become an Author" form)
create table if not exists author_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  pen_name text,
  stage text,
  theme text,
  suggested_theme_name text,
  book_title text,
  book_idea text,
  status text default 'new' check (status in ('new','reviewing','approved','rejected','waitlisted')),
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- Email subscribers (from store email capture)
create table if not exists email_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'store',
  created_at timestamptz default now()
);

-- Amora chat logs
create table if not exists chat_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  book_id text,
  messages jsonb,
  message_count int default 0,
  created_at timestamptz default now()
);

-- Sponsor CRM (relationship tracking)
create table if not exists sponsor_crm (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  contact_email text,
  package text,
  amount numeric(10,2),
  status text default 'prospect' check (status in ('prospect','contacted','negotiating','active','renewal','closed')),
  renewal_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Page / book view analytics
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  book_id text,
  pack_id text,
  referrer text,
  created_at timestamptz default now()
);
