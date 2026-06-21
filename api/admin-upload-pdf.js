/* ============================================================
   /api/admin-upload-pdf — mint a signed upload URL for a book's
   customer-facing digital PDF, into the private "digital-pdfs"
   Storage bucket (path convention: "<book_id>.pdf").

   Env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_UPLOAD_SECRET

   POST body: { bookId, secret }
   Returns:   { signedUrl, token, path } — PUT the PDF bytes to:
              `${VITE_SUPABASE_URL}/storage/v1/object/upload/sign/digital-pdfs/${path}?token=${token}`
   ============================================================ */

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { bookId, secret } = req.body || {};
  if (!secret || secret !== process.env.ADMIN_UPLOAD_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
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
    console.error("admin-upload-pdf error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
