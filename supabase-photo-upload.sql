-- Add photo_url column to author_profiles
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS photo_url text;

-- Storage bucket is created via Supabase Dashboard:
-- Storage → New bucket → name: "author-photos" → toggle Public ON → Create
-- Then add this RLS policy so authors can upload their own file:
-- (run after creating the bucket in the dashboard)

-- Allow authenticated authors to upload/update their own photo
-- (Since you use custom auth, not Supabase Auth, the anon key is used.
--  Set the bucket to public and rely on the filename = author ID pattern.)
