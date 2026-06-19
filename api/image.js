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
 * Required Vercel env var:
 *   FAL_API_KEY — from fal.ai (free to start)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, seed, negative_prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const falKey = process.env.FAL_API_KEY;
  if (!falKey) {
    return res.status(500).json({
      error: "FAL_API_KEY is not configured. Add it to your Vercel environment variables."
    });
  }

  try {
    const falBody = {
      prompt,
      image_size: "portrait_4_3",
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true,
    };

    // Seed locking: same seed = same visual DNA across every page in the collection
    if (seed != null) falBody.seed = Number(seed);

    // Negative prompt: block style drift, character changes, unsafe content
    if (negative_prompt) falBody.negative_prompt = negative_prompt;

    const r = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Authorization": `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(falBody),
    });

    const data = await r.json();
    const url = data?.images?.[0]?.url;
    if (!url) {
      const msg = data?.detail || data?.error || "fal.ai returned no image";
      return res.status(500).json({ error: String(msg) });
    }
    return res.status(200).json({ url, model: "flux-dev" });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Image generation proxy error" });
  }
}
