ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS stripe_account_id text;
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS stripe_onboarded boolean DEFAULT false;
