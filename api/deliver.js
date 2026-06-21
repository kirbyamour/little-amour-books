/* ============================================================
   /api/deliver — token-verified digital book download
   Env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

   GET ?token=<access_token>
   Verifies the token against purchases.access_token, then returns a
   short-lived signed URL to that book's PDF in the private
   "digital-pdfs" Storage bucket (path convention: "<book_id>.pdf").
   ============================================================ */

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Missing token" });

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: purchase, error: findErr } = await supabase
      .from("purchases")
      .select("book_id, book_title, email")
      .eq("access_token", token)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!purchase) return res.status(404).json({ error: "Invalid or expired link" });

    const path = `${purchase.book_id}.pdf`;
    const { data: signed, error: signErr } = await supabase
      .storage
      .from("digital-pdfs")
      .createSignedUrl(path, 60 * 10); // 10 minutes

    if (signErr || !signed?.signedUrl) {
      console.error("Sign error:", signErr?.message);
      return res.status(404).json({ error: "This book's file isn't available yet. Contact hello@littleamour.com and we'll get it to you." });
    }

    return res.status(200).json({ url: signed.signedUrl, title: purchase.book_title });
  } catch (err) {
    console.error("Deliver error:", err.message);
    return res.status(500).json({ error: "Something went wrong. Contact hello@littleamour.com." });
  }
}
