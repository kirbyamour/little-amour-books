/* ============================================================
   /api/notify — send transactional email via Resend
   Env: RESEND_API_KEY (Vercel secret)
   ============================================================ */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { to, subject, html } = req.body || {};
  if (!to || !subject || !html) return res.status(400).json({ error: "Missing to/subject/html" });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "RESEND_API_KEY not configured" });

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Little Amour Books <hello@littleamour.com>",
        to: [to],
        subject,
        html,
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
