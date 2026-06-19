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
 * Required Vercel env var:
 *   FAL_API_KEY — from fal.ai (free to start)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, seed, negative_prompt, referenceImageUrl, strength } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const falKey = process.env.FAL_API_KEY;
  if (!falKey) {
    return res.status(500).json({
      error: "FAL_API_KEY is not configured. Add it to your Vercel environment variables."
    });
  }

  const useImageToImage = !!referenceImageUrl;

  try {
    const falBody = useImageToImage
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

    const falUrl = useImageToImage
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
    if (!url) {
      const msg = data?.detail || data?.error || "fal.ai returned no image";
      return res.status(500).json({ error: String(msg) });
    }
    return res.status(200).json({ url, model: useImageToImage ? "flux-dev-i2i" : "flux-dev" });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Image generation proxy error" });
  }
}
