/* ============================================================
   /api/stripe-session — create a Stripe Checkout Session
   Env: STRIPE_SECRET_KEY (Vercel secret)

   POST body: { items: [{ id, title, price, type, authorName }], email? }
   Returns:   { url } — redirect the browser here
   ============================================================ */

import Stripe from "stripe";

const SITE = "https://littleamour.com";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

  const { items, email } = req.body;
  if (!items?.length) return res.status(400).json({ error: "No items" });

  try {
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          description: item.authorName
            ? `by ${item.authorName} — ${item.type === "pack" ? "Book Pack" : "Digital Book"}`
            : item.type === "merch" ? `${item.label || "Merch item"} — ships in 5–10 days` : "Digital Book",
          metadata: { item_id: item.id, item_type: item.type },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: email || undefined,
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      success_url: `${SITE}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE}/cart`,
      metadata: {
        items: JSON.stringify(
          items.map((i) => ({ id: i.id, type: i.type, title: i.title, price: i.price, authorName: i.authorName || "", author: i.author || "", authors: i.authors || [] }))
        ),
      },
      payment_intent_data: {
        description: `Little Amour — ${items.map((i) => i.title).join(", ")}`,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("stripe-session error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
