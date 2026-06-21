/* ============================================================
   /api/inbound-email — receive mail sent to @littleamour.com
   and forward it to Kirby's real inbox.

   Why this exists: Resend can only SEND mail, it can't hold a real
   mailbox. This file is the bridge — Resend receives anything sent
   to hello@littleamour.com (via the MX record on the domain), fires
   this webhook, and we re-send the message on to hi@kirbyamour.com
   so it actually lands somewhere a human reads it.

   Env: RESEND_API_KEY            (Vercel secret, already in use)
        RESEND_WEBHOOK_SECRET     (Vercel secret — from the Resend
                                    webhook's "Signing Secret", NOT
                                    the API key)
        FORWARD_TO  (optional, defaults to hi@kirbyamour.com below)

   Setup (done once, in Resend's dashboard + GoDaddy DNS):
     1. Resend > Domains > littleamour.com > enable "Receiving",
        add the MX record it gives you to GoDaddy DNS.
     2. Resend > Webhooks > Add Webhook
          URL:   https://littleamour.com/api/inbound-email
          Event: email.received
        Copy the "Signing Secret" shown there into Vercel as
        RESEND_WEBHOOK_SECRET.
   ============================================================ */

import { Webhook } from "svix";
import { simpleParser } from "mailparser";

const FORWARD_TO = process.env.FORWARD_TO || "hi@kirbyamour.com";
const FROM = "Little Amour <hello@littleamour.com>";

// Raw body needed for Resend/svix signature verification
export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await buffer(req);

  // 1. Verify this really came from Resend, not a forged request.
  let event;
  try {
    const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET);
    event = wh.verify(rawBody, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
  } catch (err) {
    console.error("inbound-email: signature verification failed:", err.message);
    return res.status(400).send("Invalid signature");
  }

  if (event.type !== "email.received") return res.status(200).json({});

  try {
    // 2. Webhooks only carry metadata — fetch the real body + attachments.
    const emailId = event.data.email_id;
    const metaResp = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    if (!metaResp.ok) throw new Error(`Resend receiving lookup failed: ${metaResp.status}`);
    const email = await metaResp.json();

    let html = email.html || undefined;
    let text = email.text || undefined;
    let attachments;

    // Prefer the raw original (handles inline images/attachments correctly).
    if (email.raw?.download_url) {
      const rawResp = await fetch(email.raw.download_url);
      const rawEmailContent = await rawResp.text();
      const parsed = await simpleParser(rawEmailContent, { skipImageLinks: true });
      html = parsed.html || html;
      text = parsed.text || text;
      if (parsed.attachments?.length) {
        attachments = parsed.attachments.map((a) => ({
          filename: a.filename || "attachment",
          content: a.content.toString("base64"),
          content_type: a.contentType,
        }));
      }
    }

    const fromAddr = email.from || event.data.from || "unknown sender";
    const subject = email.subject || event.data.subject || "(no subject)";

    // 3. Re-send it to the real inbox, with Reply-To set to the original
    //    sender so Kirby can hit reply and it goes straight back to them.
    const sendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [FORWARD_TO],
        reply_to: [fromAddr],
        subject: `[littleamour.com] ${subject}`,
        html: html || `<p>${(text || "(empty message)").replace(/\n/g, "<br/>")}</p>`,
        text: text || undefined,
        attachments,
      }),
    });

    if (!sendResp.ok) {
      const errBody = await sendResp.text();
      throw new Error(`Resend send failed: ${sendResp.status} ${errBody}`);
    }

    return res.status(200).json({ forwarded: true });
  } catch (err) {
    console.error("inbound-email error:", err.message);
    // Still 200 — Resend retries on non-2xx, and we don't want it hammering
    // retries for something like a malformed one-off email.
    return res.status(200).json({ forwarded: false, error: err.message });
  }
}
