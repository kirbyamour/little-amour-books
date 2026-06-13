/**
 * Dual image generation proxy.
 * Routes to fal.ai Flux (painterly/illustrated/watercolour styles)
 * or OpenAI DALL-E 3 (clean/bold/graphic/pop styles).
 * Falls back to whichever key is configured if only one is present.
 *
 * Required Vercel env vars (add at least one):
 *   FAL_API_KEY   — from fal.ai
 *   OPENAI_API_KEY — from platform.openai.com
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, model, seed, negative_prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  const falKey = process.env.FAL_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Resolve which model to actually use based on hint + key availability
  const useModel =
    model === "dalle" && openaiKey ? "dalle" :
    model === "flux" && falKey ? "flux" :
    falKey ? "flux" :        // default to flux if available
    openaiKey ? "dalle" :    // fall back to dalle
    null;

  if (!useModel) {
    return res.status(500).json({
      error: "No image generation API is configured. Add FAL_API_KEY or OPENAI_API_KEY to Vercel environment variables."
    });
  }

  try {
    if (useModel === "flux") {
      const falBody = {
        prompt,
        image_size: "portrait_4_3",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      };
      // Seed locking: same seed = same visual DNA across all pages in a book/collection
      if (seed != null) falBody.seed = Number(seed);
      // Negative prompt to prevent style and character drift
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
      return res.status(200).json({ url, model: "flux" });
    }

    if (useModel === "dalle") {
      const r = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      });
      const data = await r.json();
      const url = data?.data?.[0]?.url;
      if (!url) {
        const msg = data?.error?.message || "DALL-E returned no image";
        return res.status(500).json({ error: String(msg) });
      }
      return res.status(200).json({ url, model: "dalle" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || "Image generation proxy error" });
  }
}
