/* ============================================================
   /api/stripe-connect-onboard — create/reuse an Express connected
   account for an author and return Stripe's hosted onboarding link.

   Env: STRIPE_SECRET_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

   POST body: { slug } — author slug, e.g. "june" / "mara" / "kirby"
   Returns: { url }  (redirect the browser/admin here to onboard)
   ============================================================ */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://littleamour.com";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { slug } = req.body || {};
  if (!slug) return res.status(400).json({ error: "Missing author slug" });

  try {
    const { data: author, error: findErr } = await supabase
      .from("author_profiles")
      .select("id, pen_name, email, stripe_account_id")
      .eq("slug", slug)
      .single();

    if (findErr || !author) return res.status(404).json({ error: "Author not found" });

    let accountId = author.stripe_account_id;

    // Create a new Express account if this author doesn't have one yet
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: author.email,
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        metadata: { author_slug: slug, pen_name: author.pen_name },
      });
      accountId = account.id;
      await supabase
        .from("author_profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", author.id);
    }

    // Create a fresh onboarding link (these expire quickly, generate on demand)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${SITE}/dashboard?connect_refresh=1`,
      return_url: `${SITE}/dashboard?connect_done=1`,
      type: "account_onboarding",
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error("stripe-connect-onboard error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
