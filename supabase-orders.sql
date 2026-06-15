-- Run this in your Supabase SQL editor
-- Orders table — one row per Stripe checkout session
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  email           TEXT,
  total           NUMERIC(10,2),
  items           JSONB,
  status          TEXT DEFAULT 'paid',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases table — one row per digital book access granted
CREATE TABLE IF NOT EXISTS purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id),
  email           TEXT,
  book_id         TEXT,
  book_title      TEXT,
  book_type       TEXT,
  access_token    UUID DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS purchases_email_idx ON purchases(email);
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders(email);

-- Also create launch_coupons if not already done:
CREATE TABLE IF NOT EXISTS launch_coupons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,
  used         BOOLEAN DEFAULT FALSE,
  used_by      TEXT,
  used_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO launch_coupons (code) VALUES
  ('LAUNCH-AK9XF'),('LAUNCH-122ZA'),('LAUNCH-WFAF4'),('LAUNCH-H9WDB'),('LAUNCH-W0PNP'),
  ('LAUNCH-MERHA'),('LAUNCH-BRKOA'),('LAUNCH-N2TOZ'),('LAUNCH-UI66C'),('LAUNCH-TTDQ3')
ON CONFLICT (code) DO NOTHING;
