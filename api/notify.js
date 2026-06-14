/* ============================================================
   /api/notify — transactional email via Resend
   Env: RESEND_API_KEY (Vercel secret)

   Supported types (req.body.type):
     "raw"           — pass to/subject/html directly
     "order_digital" — digital order confirmation
     "order_physical"— physical order confirmation
     "order_bundle"  — bundle order confirmation
     "refund_received" — refund request acknowledgement
     "shipping_delay"  — shipping delay notice
   ============================================================ */

const SITE = "https://littleamour.com";
const SUPPORT = "hello@littleamour.com";
const POLICY_VERSION = "2024-01";

/* ---- Shared email chrome ---- */
function wrap(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { margin:0; padding:0; background:#FAF4EB; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#2B2433; }
  .shell { max-width:580px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; }
  .header { background:linear-gradient(160deg,#131A30,#33304F); padding:28px 32px; text-align:center; }
  .logo { color:#E2A857; font-size:15px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; margin:0; }
  .tagline { color:rgba(242,207,197,.7); font-size:12px; margin-top:4px; }
  .body { padding:32px 32px 24px; }
  h2 { font-size:22px; font-weight:700; color:#131A30; margin:0 0 16px; line-height:1.25; }
  p { font-size:15px; line-height:1.68; color:#2B2433; margin:0 0 14px; }
  .notice { background:#EAF0EB; border-left:4px solid #6A8F7A; border-radius:8px; padding:14px 16px; font-size:13.5px; line-height:1.6; margin:18px 0; }
  .notice.warn { background:#FFF6E8; border-left-color:#E2A857; }
  .order-box { background:#FAF4EB; border:1px solid #ECD9C5; border-radius:12px; padding:18px 20px; margin:18px 0; }
  .order-row { display:flex; justify-content:space-between; font-size:14px; padding:5px 0; border-bottom:1px solid #ECD9C5; }
  .order-row:last-child { border-bottom:none; font-weight:700; }
  .btn { display:inline-block; background:#E2A857; color:#fff; text-decoration:none; border-radius:999px; padding:12px 30px; font-size:15px; font-weight:700; margin:16px 0; }
  .footer { background:#F4EADC; padding:20px 32px; text-align:center; }
  .footer p { font-size:12px; color:#888; margin:4px 0; line-height:1.6; }
  .footer a { color:#6E5572; text-decoration:none; }
  .policy-links { font-size:11.5px; color:#aaa; margin-top:14px; }
  .policy-links a { color:#aaa; text-decoration:underline; margin:0 5px; }
</style>
</head>
<body>
<div style="padding:24px 16px;">
<div class="shell">
  <div class="header">
    <p class="logo">🌙 Little Amour Books</p>
    <p class="tagline">Truth told gently. Healing made beautiful.</p>
  </div>
  <div class="body">
    ${body}
  </div>
  <div class="footer">
    <p>Questions? <a href="mailto:${SUPPORT}">${SUPPORT}</a> — we reply within 2–3 business days.</p>
    <p>Little Amour Books · <a href="${SITE}">${SITE}</a></p>
    <p class="policy-links">
      <a href="${SITE}/policy-terms">Terms of Sale</a> ·
      <a href="${SITE}/policy-refund">Refund Policy</a> ·
      <a href="${SITE}/policy-license">Digital Licence</a> ·
      <a href="${SITE}/policy-privacy">Privacy Policy</a>
    </p>
    <p style="margin-top:10px;font-size:11px;color:#ccc;">Policy version ${POLICY_VERSION} accepted at checkout.</p>
  </div>
</div>
</div>
</body>
</html>`;
}

/* ---- Template builders ---- */
function digitalOrderEmail({ customerName, orderNumber, productName, downloadUrl, licenseType = "Personal use" }) {
  return wrap(`
    <h2>Your book is ready to read 🌙</h2>
    <p>Hi ${customerName || "there"},</p>
    <p>Thank you so much for your purchase. Your download is ready — every sale goes directly to supporting a survivor mother author.</p>

    <div class="order-box">
      <div class="order-row"><span>Order</span><span>${orderNumber || "—"}</span></div>
      <div class="order-row"><span>Product</span><span>${productName || "—"}</span></div>
      <div class="order-row"><span>Licence</span><span>${licenseType}</span></div>
      <div class="order-row"><span>Format</span><span>Digital download</span></div>
    </div>

    ${downloadUrl ? `<p style="text-align:center"><a class="btn" href="${downloadUrl}">Download your book →</a></p>` : `<p>Your download link will arrive separately, or check your account.</p>`}

    <div class="notice">
      <strong>Licence reminder:</strong> This file is licensed for your personal and household use only. Please do not share, resell, redistribute, or upload it publicly. For classroom or group use, please contact us for a professional licence.
    </div>

    <div class="notice warn">
      <strong>Digital downloads are final sale</strong> once delivered. If you experience a technical issue — corrupted file, failed download, or wrong file — please contact us at <a href="mailto:${SUPPORT}">${SUPPORT}</a> and we'll sort it out quickly.
    </div>

    <p>Need help opening your file? PDF files work best in Adobe Acrobat, Apple Books, or any PDF reader app. EPUB files can be sent to your Kindle or opened in apps like Libby, Apple Books, or Kobo.</p>

    <p>With love, <br/><strong>The Little Amour Books team</strong></p>
  `);
}

function physicalOrderEmail({ customerName, orderNumber, productName, shippingAddress, estimatedShip, trackingNumber }) {
  return wrap(`
    <h2>Order confirmed 📦</h2>
    <p>Hi ${customerName || "there"},</p>
    <p>Thank you! We've received your order and will begin preparing your book${productName ? ` — <em>${productName}</em>` : ""}.</p>

    <div class="order-box">
      <div class="order-row"><span>Order</span><span>${orderNumber || "—"}</span></div>
      <div class="order-row"><span>Product</span><span>${productName || "—"}</span></div>
      <div class="order-row"><span>Shipping to</span><span>${shippingAddress || "—"}</span></div>
      <div class="order-row"><span>Estimated dispatch</span><span>${estimatedShip || "3–5 business days"}</span></div>
      ${trackingNumber ? `<div class="order-row"><span>Tracking</span><span>${trackingNumber}</span></div>` : ""}
    </div>

    <div class="notice">
      <strong>Shipping reminder:</strong> Production takes 3–5 business days before dispatch. Shipping times are estimates. If your order is delayed beyond our stated timeframe, we'll contact you with options.
    </div>

    <div class="notice warn">
      <strong>Received damaged or incorrect?</strong> Contact us within 14 days of delivery with your order number and photos. Physical books are final sale except for damaged, defective, or incorrect items. <a href="${SITE}/policy-refund">View our Refund Policy →</a>
    </div>

    <p>If you need to update your shipping address, contact us immediately at <a href="mailto:${SUPPORT}">${SUPPORT}</a> — once an order enters production we may not be able to make changes.</p>

    <p>With love, <br/><strong>The Little Amour Books team</strong></p>
  `);
}

function bundleOrderEmail({ customerName, orderNumber, productName, downloadUrl, shippingAddress, estimatedShip }) {
  return wrap(`
    <h2>Your bundle is on its way 🎁</h2>
    <p>Hi ${customerName || "there"},</p>
    <p>Thank you for your bundle purchase! Here's what's happening with each part of your order.</p>

    <div class="order-box">
      <div class="order-row"><span>Order</span><span>${orderNumber || "—"}</span></div>
      <div class="order-row"><span>Bundle</span><span>${productName || "—"}</span></div>
    </div>

    <h3 style="margin:20px 0 8px;font-size:16px;">📥 Your digital files</h3>
    ${downloadUrl ? `<p><a class="btn" style="padding:9px 22px;font-size:14px;" href="${downloadUrl}">Download digital files →</a></p>` : `<p>Your digital download link will follow in a separate email.</p>`}
    <div class="notice">Digital files are licensed for personal household use only and are final sale once delivered.</div>

    <h3 style="margin:20px 0 8px;font-size:16px;">📦 Your physical book</h3>
    <p>Shipping to: <strong>${shippingAddress || "—"}</strong><br/>Estimated dispatch: <strong>${estimatedShip || "3–5 business days"}</strong></p>
    <div class="notice warn">Physical books are final sale except for damaged, defective, or incorrect items. Contact us within 14 days of delivery if there's an issue. <a href="${SITE}/policy-refund">Refund Policy →</a></div>

    <p>With love, <br/><strong>The Little Amour Books team</strong></p>
  `);
}

function refundReceivedEmail({ customerName, orderNumber, productType }) {
  const isDigital = productType === "digital";
  return wrap(`
    <h2>We've received your request</h2>
    <p>Hi ${customerName || "there"},</p>
    <p>We've received your refund or support request for order <strong>${orderNumber || "—"}</strong> and will review it within 2–3 business days.</p>

    ${isDigital ? `
    <div class="notice">
      <strong>Digital download requests:</strong> We review requests involving duplicate purchases, corrupted files, failed download links, incorrect files, unauthorised transactions, and legally required refunds. Submitting a request does not guarantee approval.
    </div>` : `
    <div class="notice">
      <strong>Physical book requests:</strong> We review requests for items that arrived damaged, defective, or incorrect. If you haven't already, please reply to this email with clear photos of the issue — it speeds up our review.
    </div>`}

    <p>We'll reply to this email address with our decision. If you have additional information or photos to share, just reply to this email.</p>

    <p>With care, <br/><strong>The Little Amour Books team</strong></p>
  `);
}

function shippingDelayEmail({ customerName, orderNumber, productName, newEstimate, canCancel = true }) {
  return wrap(`
    <h2>Update on your order</h2>
    <p>Hi ${customerName || "there"},</p>
    <p>We're writing to let you know that your order <strong>${orderNumber || "—"}</strong>${productName ? ` — <em>${productName}</em>` : ""} is taking a little longer than expected.</p>
    <p>Updated estimated dispatch: <strong>${newEstimate || "We'll be in touch shortly"}</strong></p>
    <p>We're sorry for the delay. Here are your options:</p>
    <div class="notice">
      <strong>Keep the order</strong> — Your order will ship as soon as it's ready. No action needed.
      ${canCancel ? `<br/><br/><strong>Cancel for a full refund</strong> — If you'd prefer not to wait, reply to this email and we'll cancel your order and issue a full refund within 5–7 business days.` : ""}
    </div>
    <p>If we don't hear from you, we'll assume you're happy to wait and will ship as soon as possible.</p>
    <p>Thank you for your patience and your support of our author mamas.</p>
    <p>With love, <br/><strong>The Little Amour Books team</strong></p>
  `);
}

/* ---- Handler ---- */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "RESEND_API_KEY not configured" });

  const { type = "raw", to, subject, html, data = {} } = req.body || {};

  if (!to) return res.status(400).json({ error: "Missing to" });

  let emailSubject = subject;
  let emailHtml = html;

  if (type === "order_digital") {
    emailSubject = subject || `Your Little Amour Books download is ready — ${data.productName || "order confirmed"}`;
    emailHtml = digitalOrderEmail(data);
  } else if (type === "order_physical") {
    emailSubject = subject || `Little Amour Books — order confirmed #${data.orderNumber || ""}`;
    emailHtml = physicalOrderEmail(data);
  } else if (type === "order_bundle") {
    emailSubject = subject || `Little Amour Books — your bundle is confirmed #${data.orderNumber || ""}`;
    emailHtml = bundleOrderEmail(data);
  } else if (type === "refund_received") {
    emailSubject = subject || `Little Amour Books — we've received your request (order ${data.orderNumber || ""})`;
    emailHtml = refundReceivedEmail(data);
  } else if (type === "shipping_delay") {
    emailSubject = subject || `Little Amour Books — update on your order ${data.orderNumber || ""}`;
    emailHtml = shippingDelayEmail(data);
  }

  if (!emailSubject || !emailHtml) return res.status(400).json({ error: "Missing subject/html" });

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
        subject: emailSubject,
        html: emailHtml,
      }),
    });
    const result = await r.json();
    if (!r.ok) return res.status(r.status).json(result);
    return res.status(200).json({ ok: true, id: result.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
