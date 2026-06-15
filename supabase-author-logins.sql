-- Logins for June Ellery and Mara Voss
-- Run this in Supabase SQL Editor

INSERT INTO author_profiles (pen_name, email, password, active, is_admin)
VALUES
  ('June Ellery', 'june@littleamour.com',  'june-little2024',  true, false),
  ('Mara Voss',   'mara@littleamour.com',  'mara-little2024',  true, false)
ON CONFLICT (email) DO UPDATE
  SET pen_name = EXCLUDED.pen_name,
      password = EXCLUDED.password,
      active   = true;
