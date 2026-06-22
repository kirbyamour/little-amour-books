/* ============================================================
   /api/publish-upload — mints signed Storage URLs for the
   Publishing export flow and the admin Fulfillment panel. Kept as
   one endpoint (instead of a new file per use) because the Vercel
   Hobby plan caps serverless functions at 12 and this project is
   already at that cap.

   Same trust model as image.js/train-style.js: the real credential,
   the Supabase service role key, never leaves the server.

   POST body: { bookId, kind }
     kind omitted, or "digital_pdf_upload" (default) — original
       behavior: signed UPLOAD url for "<bookId>.pdf" in the private
       "digital-pdfs" bucket. Matches the path api/deliver.js looks
       up for customer email-link downloads.
     kind "fulfillment_upload" — signed UPLOAD url for "<bookId>.zip"
       in the private "fulfillment-exports" bucket — the full
       print-ready/source-archive export ZIP, for admin file-grab.
     kind "fulfillment_download" — signed DOWNLOAD url (60s expiry)
       for the same path, used by the admin Fulfillment panel's
       Download button.

   Env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
   ============================================================ */

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { bookId, kind } = req.body || {};
  if (!bookId) return res.status(400).json({ error: "Missing bookId" });

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    if (kind === "fulfillment_upload") {
      const path = `${bookId}.zip`;
      const { data, error } = await supabase
        .storage
        .from("fulfillment-exports")
        .createSignedUploadUrl(path, { upsert: true });
      if (error) throw error;
      return res.status(200).json({ signedUrl: data.signedUrl, token: data.token, path: data.path });
    }

    if (kind === "fulfillment_download") {
      const path = `${bookId}.zip`;
      const { data, error } = await supabase
        .storage
        .from("fulfillment-exports")
        .createSignedUrl(path, 60);
      if (error) throw error;
      return res.status(200).json({ signedUrl: data.signedUrl });
    }

    // Default: original digital_pdf_upload behavior — unchanged from before.
    const path = `${bookId}.pdf`;
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
