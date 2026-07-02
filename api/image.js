/**
 * Image generation proxy — fal.ai Flux only.
 *
 * Flux supports seed locking, which is essential for page-to-page visual
 * consistency in a picture book. DALL-E 3 was removed because it has no
 * seed support and would break character consistency across pages.
 *
 * Uses flux/dev, not flux/schnell. Schnell is a 1-4-step distilled model —
 * fast and cheap, but it reliably drops detail from long, multi-character,
 * instruction-heavy prompts (confirmed: it was rendering a generic single
 * animal and ignoring named human characters entirely on real book pages).
 * Dev costs more per image but actually follows the locked character/style
 * prompt this app depends on for consistency across a book's pages.
 *
 * When referenceImageUrl is provided, this calls flux/dev/image-to-image
 * instead of plain text-to-image flux/dev. The reference is an existing
 * page from the same book — this anchors the new page's background detail,
 * texture, and overall richness to what's already established, instead of
 * relying purely on a text description of "the style." strength controls
 * how much the output is allowed to diverge from the reference: lower keeps
 * more of its composition/texture, higher leans more on the prompt alone.
 * fal's own default (0.95) is tuned for "redraw this same picture" use
 * cases, not "paint a new scene that merely looks related" — so this proxy
 * uses a lower default for picture-book reference painting. Untested
 * against this codebase's actual book art prior to this change; treat the
 * first results as a real experiment, not an assumed fix.
 *
 * When loraUrl is provided (a collection with a trained style LoRA — see
 * train-style.js), this calls flux-lora instead of plain flux/dev. This is the real fix
 * for the style-vs-content trade-off below: the trained weights ARE the style, so a plain
 * text-to-image call already matches the established look with no reference image and no
 * strength dial to fight with. loraUrl takes priority over referenceImageUrl.
 *
 * When referenceImageUrl is provided (no trained LoRA yet — legacy collections), this
 * calls flux/dev/image-to-image instead of plain text-to-image flux/dev. The reference is
 * an existing page from the same book — this anchors the new page's background detail,
 * texture, and overall richness to what's already established, instead of relying purely
 * on a text description of "the style." strength controls how much the output is allowed
 * to diverge from the reference: lower keeps more of its composition/texture, higher
 * leans more on the prompt alone. fal's own default (0.95) is tuned for "redraw this same
 * picture" use cases, not "paint a new scene that merely looks related" — so this proxy
 * uses a lower default for picture-book reference painting.
 *
 * Known structural limit of the referenceImageUrl path (confirmed on real book pages,
 * not theoretical): strength conflates content-fidelity and style-fidelity into one dial.
 * Lowering it pulls both closer to the reference — including its specific scene/pose, not
 * just its art style. There is no setting on this endpoint that gives "exact style, brand
 * new content." That's why loraUrl is the path going forward; referenceImageUrl stays
 * only as a fallback for collections that haven't been trained yet.
 *
 * Required Vercel env var:
 *   FAL_API_KEY — from fal.ai (free to start)
 *
 * Render logging: every call is durably logged to Supabase table
 * public.render_log (service role, bypasses RLS — no anon policies exist
 * on this table). Logging is fail-open: it can never block, delay, or
 * fail the actual render response. Uses the same createClient(VITE_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY) pattern as api/deliver.js and api/publish-upload.js.
 * Env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

let warnedMissingSupabaseEnv = false;

async function logRender({ endpoint, prompt, negative_prompt, seed, params, reference_image_url, lora_url, output_url, error, book_id, page_num }) {
  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      if (!warnedMissingSupabaseEnv) {
        warnedMissingSupabaseEnv = true;
        console.warn("render_log skipped: VITE_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not configured.");
      }
      return;
    }
    const supabase = createClient(url, key);
    await supabase.from("render_log").insert({
      endpoint,
      prompt,
      negative_prompt,
      seed,
      params,
      reference_image_url,
      lora_url,
      output_url,
      error,
      book_id,
      page_num,
    });
  } catch (logErr) {
    console.warn("render_log insert failed (non-blocking):", logErr?.message || logErr);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, seed, negative_prompt, referenceImageUrl, strength, loraUrl, loraScale, imageSize, bookId, pageNum } = req.body;
  // Callers painting book pages rely on the existing portrait_4_3 default (matches the
  // book's page trim). Cover generation is a square trim, so Publishing.jsx passes
  // imageSize: "square_hd" explicitly — without this, covers were generated as 4:3
  // portraits and then force-cropped into a square box client-side, slicing off whatever
  // the model painted near the top/bottom edges (including any text it ignored
  // instructions and baked in).
  const size = imageSize || "portrait_4_3";
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const falKey = process.env.FAL_API_KEY;
  if (!falKey) {
    return res.status(500).json({
      error: "FAL_API_KEY is not configured. Add it to your Vercel environment variables."
    });
  }

  const useLora = !!loraUrl;
  const useImageToImage = !useLora && !!referenceImageUrl;

  try {
    const falBody = useLora
      ? {
          prompt,
          loras: [{ path: loraUrl, scale: loraScale != null ? Number(loraScale) : 1 }],
          image_size: size,
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true,
        }
      : useImageToImage
      ? {
          image_url: referenceImageUrl,
          prompt,
          // Default well below fal's own 0.95 default: that default is meant for
          // "redraw this picture," not "paint a related new scene." Lower keeps
          // more of the reference's actual background/texture/composition DNA.
          strength: strength != null ? Number(strength) : 0.55,
          num_inference_steps: 40,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true,
        }
      : {
          prompt,
          image_size: size,
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true,
        };

    // Seed locking: same seed = same visual DNA across every page in the collection
    if (seed != null) falBody.seed = Number(seed);

    // Negative prompt: block style drift, character changes, unsafe content
    if (negative_prompt) falBody.negative_prompt = negative_prompt;

    const falUrl = useLora
      ? "https://fal.run/fal-ai/flux-lora"
      : useImageToImage
      ? "https://fal.run/fal-ai/flux/dev/image-to-image"
      : "https://fal.run/fal-ai/flux/dev";

    const r = await fetch(falUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(falBody),
    });

    const data = await r.json();
    const url = data?.images?.[0]?.url;
    const falEndpoint = useLora
      ? "fal-ai/flux-lora"
      : useImageToImage
      ? "fal-ai/flux/dev/image-to-image"
      : "fal-ai/flux/dev";
    const logParams = { strength: useImageToImage ? falBody.strength : undefined, loraScale: useLora ? falBody.loras?.[0]?.scale : undefined, imageSize: size, guidance: falBody.guidance_scale, num_inference_steps: falBody.num_inference_steps };
    if (!url) {
      const msg = data?.detail || data?.error || "fal.ai returned no image";
      await logRender({
        endpoint: falEndpoint,
        prompt,
        negative_prompt,
        seed: seed != null ? Number(seed) : null,
        params: logParams,
        reference_image_url: referenceImageUrl || null,
        lora_url: loraUrl || null,
        output_url: null,
        error: String(msg),
        book_id: bookId || null,
        page_num: pageNum != null ? Number(pageNum) : null,
      });
      return res.status(500).json({ error: String(msg) });
    }
    await logRender({
      endpoint: falEndpoint,
      prompt,
      negative_prompt,
      seed: seed != null ? Number(seed) : null,
      params: logParams,
      reference_image_url: referenceImageUrl || null,
      lora_url: loraUrl || null,
      output_url: url,
      error: null,
      book_id: bookId || null,
      page_num: pageNum != null ? Number(pageNum) : null,
    });
    return res.status(200).json({ url, model: useLora ? "flux-lora" : useImageToImage ? "flux-dev-i2i" : "flux-dev" });

  } catch (err) {
    await logRender({
      endpoint: useLora ? "fal-ai/flux-lora" : useImageToImage ? "fal-ai/flux/dev/image-to-image" : "fal-ai/flux/dev",
      prompt,
      negative_prompt,
      seed: seed != null ? Number(seed) : null,
      params: { strength: useImageToImage ? strength : undefined, loraScale: useLora ? loraScale : undefined, imageSize: size },
      reference_image_url: referenceImageUrl || null,
      lora_url: loraUrl || null,
      output_url: null,
      error: err.message || "Image generation proxy error",
      book_id: bookId || null,
      page_num: pageNum != null ? Number(pageNum) : null,
    });
    return res.status(500).json({ error: err.message || "Image generation proxy error" });
  }
}
