/* ============================================================
   /api/publish-upload — mint a signed upload URL for a book's
   customer-facing digital PDF, called directly from the Publishing
   export flow in the browser (no secret required from the client —
   same trust model as image.js/train-style.js: the real credential,
   the Supabase service role key, never leaves the server).

   Storage path convention (matches api/deliver.js): "<book_id>.pdf"
   in the private "digital-pdfs" bucket.

   Env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

   POST body: { bookId }
   Returns:   { signedUrl, token, path } — PUT the raw PDF bytes to signedUrl
   ============================================================ */

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { bookId } = req.body || {};
  if (!bookId) return res.status(400).json({ error: "Missing bookId" });

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const path = `${bookId}.pdf`;
  try {
    const { data, error } = await supabase
      .storage
      .from("digital-pdfs")
      .createSignedUploadUrl(path, { upsert: true });

    if (error) throw error;
    return res.status(200).json({ signedUrl: data.signedUrl, token: data.token, path: data.path });
  } catch (err) {
    console.error("publish-upload error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
