/* ============================================================
   /api/stripe-webhook — handle Stripe payment events
   Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (Vercel secrets)
        VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
        RESEND_API_KEY

   Events handled:
     checkout.session.completed — record purchase, send email
   ============================================================ */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://littleamour.com";
const SUPPORT = "hello@littleamour.com";

// Raw body needed for Stripe signature verification
export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // service role so we can write from server
  );

  const sig = req.headers["stripe-signature"];
  const rawBody = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email || session.customer_details?.email;
    const items = JSON.parse(session.metadata?.items || "[]");
    const total = session.amount_total / 100;

    // 1. Record purchase in Supabase
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        email,
        total,
        items,
        status: "paid",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderErr) console.error("Order insert error:", orderErr.message);

    // 2. Record per-item purchases for digital access
    const accessTokens = {}; // item.id -> access_token, used to build the delivery link below
    for (const item of items) {
      if (item.type !== "merch") {
        const accessToken = crypto.randomUUID();
        accessTokens[item.id] = accessToken;
        await supabase.from("purchases").insert({
          order_id: order?.id,
          email,
          book_id: item.id,
          book_title: item.title,
          book_type: item.type,
          access_token: accessToken,
          created_at: new Date().toISOString(),
        });
      }
    }

    // 2.5 Pay authors their 75% split via Stripe Connect transfers
    try {
      const { data: authorRows } = await supabase
        .from("author_profiles")
        .select("slug, stripe_account_id, stripe_onboarded, is_house_account");
      const bySlug = {};
      (authorRows || []).forEach((a) => { if (a.slug) bySlug[a.slug] = a; });

      for (const item of items) {
        if (item.type === "merch") continue;
        const slugs = item.type === "pack" && Array.isArray(item.authors) && item.authors.length
          ? item.authors
          : (item.author ? [item.author] : []);
        if (!slugs.length) continue;

        const sharePrice = item.price / slugs.length;
        for (const slug of slugs) {
          const author = bySlug[slug];
          if (!author) continue;
          if (author.is_house_account) continue; // house pen name — money stays in the company account
          if (!author.stripe_account_id || !author.stripe_onboarded) {
            console.warn(`Skipping author payout for "${slug}" — not connected/onboarded yet (order ${session.id})`);
            continue;
          }
          const amount = Math.round(sharePrice * 0.75 * 100);
          if (amount <= 0) continue;
          try {
            await stripe.transfers.create({
              amount,
              currency: "usd",
              destination: author.stripe_account_id,
              transfer_group: session.id,
              metadata: {
                order_id: order?.id || "",
                session_id: session.id,
                item_id: item.id,
                author_slug: slug,
              },
            });
          } catch (transferErr) {
            console.error(`Transfer failed for "${slug}" on order ${session.id}:`, transferErr.message);
          }
        }
      }
    } catch (splitErr) {
      console.error("Author payout split error:", splitErr.message);
    }

    // 3. Send confirmation email
    if (email && process.env.RESEND_API_KEY) {
      const digitalItems = items.filter((i) => i.type !== "merch");
      const physicalItems = items.filter((i) => i.type === "merch");

      const bookLinks = digitalItems.map((i) => {
        const deliverUrl = accessTokens[i.id] ? `${SITE}/deliver/${accessTokens[i.id]}` : `${SITE}/book/${i.id}`;
        return `<li><a href="${deliverUrl}" style="color:#7C3AED;font-weight:600;">${i.title}</a>${i.authorName ? ` <span style="color:#888;">by ${i.authorName}</span>` : ""}</li>`;
      }).join("");

      const merchNotice = physicalItems.length
        ? `<p style="margin-top:16px;font-size:14px;color:#555;">Your merch item(s) will ship within 5–10 business days. You'll receive a separate shipping confirmation.</p>`
        : "";

      const bookListHtml = digitalItems.length ? `
              <div style="background:#fff;border-radius:12px;padding:20px 24px;margin:20px 0;border:1px solid #ECD9C5;">
                <p style="font-weight:700;color:#4A3B6E;margin-top:0;">Your books:</p>
                <ul style="padding-left:20px;line-height:2;">${bookLinks}</ul>
                <p style="font-size:13px;color:#888;margin-bottom:0;">Click any title to download your book. This link is just for you — please don't share it.</p>
              </div>` : "";

      // Default template — used if the admin-editable template is missing or the table doesn't exist yet
      const DEFAULT_SUBJECT = "Your Little Amour books are ready 💜";
      const DEFAULT_BODY = `
            <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;background:#faf4eb;padding:32px;border-radius:16px;">
              <h1 style="color:#4A3B6E;font-size:24px;margin-bottom:4px;">Thank you for your purchase 💜</h1>
              <p style="color:#6E5572;margin-top:0;">Your order of \${{total}} is confirmed.</p>
              {{bookListHtml}}
              {{merchNotice}}
              <p style="font-size:13px;color:#888;margin-top:24px;">Questions? Reply to this email or visit <a href="${SITE}/contact" style="color:#7C3AED;">${SUPPORT}</a></p>
              <p style="font-size:12px;color:#bbb;margin-top:16px;">Little Amour · Books written with love, read with feeling.</p>
            </div>
          `;

      let emailSubject = DEFAULT_SUBJECT;
      let emailBody = DEFAULT_BODY;
      try {
        const { data: tpl } = await supabase
          .from("email_templates")
          .select("subject, body_html")
          .eq("key", "order_confirmation")
          .single();
        if (tpl?.subject) emailSubject = tpl.subject;
        if (tpl?.body_html) emailBody = tpl.body_html;
      } catch (tplErr) {
        console.error("email_templates lookup failed, using default:", tplErr.message);
      }

      const fill = (str) => str
        .replaceAll("{{total}}", total.toFixed(2))
        .replaceAll("{{bookListHtml}}", bookListHtml)
        .replaceAll("{{merchNotice}}", merchNotice);

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `Little Amour <${SUPPORT}>`,
          to: email,
          subject: fill(emailSubject),
          html: fill(emailBody),
        }),
      });
    }
  }

  res.status(200).json({ received: true });
}
