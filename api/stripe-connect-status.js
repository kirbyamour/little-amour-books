/* ============================================================
   /api/stripe-connect-status — check an author's Connect onboarding
   status with Stripe and sync it into author_profiles.

   Env: STRIPE_SECRET_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

   POST body: { slug }
   Returns: { connected: bool, onboarded: bool, accountId: string|null }
   ============================================================ */

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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
      .select("id, stripe_account_id")
      .eq("slug", slug)
      .single();

    if (findErr || !author) return res.status(404).json({ error: "Author not found" });

    if (!author.stripe_account_id) {
      return res.status(200).json({ connected: false, onboarded: false, accountId: null });
    }

    const account = await stripe.accounts.retrieve(author.stripe_account_id);
    const onboarded = !!(account.charges_enabled && account.details_submitted);

    await supabase
      .from("author_profiles")
      .update({ stripe_onboarded: onboarded })
      .eq("id", author.id);

    return res.status(200).json({
      connected: true,
      onboarded,
      accountId: author.stripe_account_id,
    });
  } catch (err) {
    console.error("stripe-connect-status error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
