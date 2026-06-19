/**
 * LoRA style training proxy — fal.ai flux-lora-fast-training.
 *
 * This is the structural fix for "exact same style, brand-new content." Two approaches
 * were tried before this and both hit a real ceiling:
 *   1. Re-describing the style in English every paint call (drifts page to page — there's
 *      no model-level guarantee, just a prompt that's re-interpreted fresh each time).
 *   2. Anchoring to one reference image via image-to-image (image.js's referenceImageUrl
 *      path) — the `strength` dial conflates content-fidelity and style-fidelity, so there
 *      is no setting that gives "this exact look" + "a brand-new scene." Confirmed on
 *      Mama Has Papers Today page 22: even at a conservative strength the art style itself
 *      still drifted from the reference.
 * A trained LoRA decouples style into actual model weights, separate from whatever the
 * prompt describes as content. Inference then uses plain text-to-image against
 * fal-ai/flux-lora with those weights applied (see image.js's loraUrl branch) — no
 * reference image needed, no strength trade-off, every page including page 1.
 *
 * Two actions, called by the collection-setup flow in App.jsx:
 *   action: "start"  — body: { images: [url-or-dataUri, ...], triggerWord }
 *     Fetches/decodes each image, zips them in memory (no separate file-hosting step),
 *     sends the zip to fal as a base64 data URI, kicks off training, returns requestId.
 *   action: "status" — body: { requestId }
 *     Polls fal's queue. Returns { status: "training" | "ready" | "failed", loraUrl? }.
 *
 * Training costs ~$2 per run at default steps (fal.ai pricing, confirmed via their docs).
 * Required Vercel env var: FAL_API_KEY (same key as image.js).
 */
import JSZip from "jszip";

const TRAIN_ENDPOINT = "fal-ai/flux-lora-fast-training";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const falKey = process.env.FAL_API_KEY;
  if (!falKey) {
    return res.status(500).json({
      error: "FAL_API_KEY is not configured. Add it to your Vercel environment variables.",
    });
  }

  const { action } = req.body || {};

  try {
    if (action === "start") {
      const { images, triggerWord } = req.body;
      if (!Array.isArray(images) || images.length < 4) {
        return res.status(400).json({ error: "Need at least 4 style sample images to train on." });
      }
      if (!triggerWord) return res.status(400).json({ error: "triggerWord is required" });

      const zip = new JSZip();
      for (let i = 0; i < images.length; i++) {
        const src = images[i];
        let bytes;
        if (typeof src === "string" && src.startsWith("data:")) {
          const b64 = src.split(",")[1] || "";
          bytes = Buffer.from(b64, "base64");
        } else {
          const imgRes = await fetch(src);
          if (!imgRes.ok) {
            return res.status(500).json({ error: `Couldn't fetch sample image ${i + 1} for training.` });
          }
          bytes = Buffer.from(await imgRes.arrayBuffer());
        }
        zip.file(`sample_${i + 1}.jpg`, bytes);
      }
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const zipDataUri = `data:application/zip;base64,${zipBuffer.toString("base64")}`;

      const r = await fetch(`https://queue.fal.run/${TRAIN_ENDPOINT}`, {
        method: "POST",
        headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          images_data_url: zipDataUri,
          trigger_word: triggerWord,
          is_style: true,
          create_masks: false,
          steps: 1000,
        }),
      });
      const data = await r.json();
      if (!data?.request_id) {
        return res.status(500).json({ error: data?.detail || data?.error || "fal.ai did not accept the training job." });
      }
      return res.status(200).json({ requestId: data.request_id });
    }

    if (action === "status") {
      const { requestId } = req.body;
      if (!requestId) return res.status(400).json({ error: "requestId is required" });

      const statusR = await fetch(`https://queue.fal.run/${TRAIN_ENDPOINT}/requests/${requestId}/status`, {
        headers: { Authorization: `Key ${falKey}` },
      });
      const statusData = await statusR.json();

      if (statusData.status === "COMPLETED") {
        const resultR = await fetch(`https://queue.fal.run/${TRAIN_ENDPOINT}/requests/${requestId}`, {
          headers: { Authorization: `Key ${falKey}` },
        });
        const resultData = await resultR.json();
        const loraUrl = resultData?.diffusers_lora_file?.url;
        if (!loraUrl) {
          return res.status(200).json({ status: "failed", error: "Training finished but returned no LoRA file." });
        }
        return res.status(200).json({ status: "ready", loraUrl });
      }
      if (statusData.status === "IN_PROGRESS" || statusData.status === "IN_QUEUE") {
        return res.status(200).json({ status: "training" });
      }
      return res.status(200).json({ status: "failed", error: statusData?.error || `Unexpected status: ${statusData.status}` });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Style training proxy error" });
  }
}
