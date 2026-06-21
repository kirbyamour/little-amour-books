import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

// Same downscale-then-fallback pattern used for page-image uploads in App.jsx (kept as a
// local copy here since the two files don't share a module) — canvas downscale first,
// raw FileReader if that fails (e.g. HEIC on Chrome).
function resizeImageFile(file, max = 1600) {
  return new Promise((res) => {
    const readRaw = () => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => res(null);
      fr.readAsDataURL(file);
    };
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      let done = false;
      const finish = (val) => { if (!done) { done = true; try { URL.revokeObjectURL(url); } catch (e) {} res(val); } };
      img.onload = () => {
        try {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          finish(c.toDataURL("image/jpeg", 0.88));
        } catch (e) { finish(null); readRaw(); }
      };
      img.onerror = () => { try { URL.revokeObjectURL(url); } catch (e) {} readRaw(); };
      setTimeout(() => { if (!done) { img.onload = null; readRaw(); } }, 4000);
      img.src = url;
    } catch (e) { readRaw(); }
  });
}

// Fetches a hosted image (e.g. a freshly fal.ai-generated cover) and converts it to a data
// URI. The exported PDF embeds coverImageUrl with jsPDF's addImage, which needs actual
// image bytes — not a bare remote URL string — so anything that's going to print reliably
// has to be a data: URI by the time it lands on the cover. If the fetch fails (CORS, etc.)
// this throws rather than silently saving a URL that would look fine in the builder
// preview but render as a blank box in the exported PDF.
async function urlToDataUri(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Couldn't download the generated image.");
  const blob = await r.blob();
  return await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => rej(new Error("Couldn't read the generated image."));
    fr.readAsDataURL(blob);
  });
}

// Builds the AI cover-art prompt from whatever style information the book/collection
// already carries — the same locked-style concept used for page art, so the cover
// actually matches the inside of the book instead of looking like a different project.
function buildCoverPrompt(book, collection, cover) {
  const styleGuide = book.derivedStyle || (collection && collection.styleGuide) || book.styleGuide || "warm, gentle children's picture-book illustration";
  const chars = (collection && Array.isArray(collection.characters) && collection.characters.length ? collection.characters : book.characters) || [];
  const charManifest = chars.length ? chars.map((c) => `— ${c.name}: ${c.desc}`).join("\n") : "(no named characters — scene/mood cover, no figures required)";
  const title = cover?.title || book.title || "Untitled";
  return [
    `STYLE (locked): ${styleGuide}`,
    ``,
    `Create a single front-cover illustration for a children's picture book titled "${title}". This must be a pure illustration with ZERO typography anywhere in the frame — no title, no words, no letters, no numbers, no signage text, no book spine, no captions. Leave open, uncluttered negative space across the upper-middle third and the bottom strip of the image so real typeset text can be overlaid afterward.`,
    ``,
    `CHARACTERS (if relevant to the cover scene):\n${charManifest}`,
    ``,
    cover?.styleNotes ? `ADDITIONAL NOTES: ${cover.styleNotes}` : "",
  ].filter(Boolean).join("\n");
}

const COVER_NEGATIVE_PROMPT = [
  "text", "letters", "words", "writing", "typography", "title", "caption", "watermark",
  "photo realistic", "3d render", "adult content", "violence", "scary imagery",
].join(", ");

const C = {
  night: "#0E1525", ink: "#131A30", card: "#1a2235", cardAlt: "#1e2840",
  border: "#2a2f45", cream: "#FAF4EB", muted: "#8a7a9a", mauve: "#9b7eb8",
  rose: "#E5AC9F", gold: "#E2A857", green: "#4A9B6F", red: "#C0392B",
};

const CHECKLIST = [
  { id: "pages",        label: "Story pages completed",                required: true },
  { id: "cover",        label: "Front cover completed",                required: true },
  { id: "backcover",    label: "Back cover completed",                  required: true },
  { id: "dedication",   label: "Dedication completed or skipped",       required: false },
  { id: "about_author", label: "About the Author completed or skipped", required: false },
  { id: "about_lab",    label: "About Little Amour Books completed",    required: true },
  { id: "copyright",    label: "Copyright page completed",              required: true },
  { id: "metadata",     label: "Metadata completed",                    required: true },
  { id: "digital_pdf",  label: "Digital PDF generated",                 required: true },
  { id: "print_pdf",    label: "Printable PDF generated",               required: true },
  { id: "epub",         label: "EPUB generated or marked pending",      required: true },
  { id: "approval",     label: "Author approval received",              required: true },
];

async function callAmora(prompt, max = 500) {
  const r = await fetch("/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: max,
      system: "You are Amora, the warm publishing editor of Little Amour Books. Your writing is warm, clear, trauma-informed, plain text only — no markdown symbols.",
      messages: [{ role: "user", content: prompt }] }),
  });
  const j = await r.json();
  return j.content?.[0]?.text || "";
}

function btn(v) {
  const base = { border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600 };
  if (v === "gold")  return { ...base, background: C.gold, color: C.ink };
  if (v === "mauve") return { ...base, background: C.mauve, color: "#fff" };
  if (v === "green") return { ...base, background: C.green, color: "#fff" };
  if (v === "red")   return { ...base, background: C.red, color: "#fff" };
  return { ...base, background: "transparent", color: C.muted, border: `1px solid ${C.border}` };
}

function Field({ label, note, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>{label}</label>
      {note && <p style={{ color: C.muted, fontSize: 12, marginBottom: 5, opacity: 0.75 }}>{note}</p>}
      {children}
    </div>
  );
}

function TI({ value, onChange, placeholder, multi, rows = 4 }) {
  const s = { width: "100%", background: C.ink, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.cream, fontSize: 14, outline: "none", boxSizing: "border-box", lineHeight: 1.6, fontFamily: multi ? "Georgia,serif" : "inherit", resize: multi ? "vertical" : undefined };
  return multi
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />;
}

function Toggle({ label, value, onChange }) {
  return (
    <label style={{ display: "flex", gap: 10, cursor: "pointer", marginBottom: 10, alignItems: "center" }}>
      <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, background: value ? C.green : C.border, borderRadius: 11, position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 3, left: value ? 20 : 3, width: 16, height: 16, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
      </div>
      <span style={{ color: C.cream, fontSize: 14 }}>{label}</span>
    </label>
  );
}

function SaveRow({ onSave, saved }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 22, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
      <button onClick={onSave} style={btn("gold")}>✓ Save & Mark Complete</button>
      {saved && <span style={{ color: C.green, fontSize: 13 }}>Saved</span>}
    </div>
  );
}

function ABtn({ label, onClick, loading }) {
  return <button onClick={onClick} disabled={loading} style={{ ...btn("mauve"), marginTop: 8, opacity: loading ? 0.6 : 1 }}>{loading ? "Amora is writing… 🌙" : `✨ ${label}`}</button>;
}

/* ── COVER BUILDER ── */
function CoverBuilder({ pub, setPub, book, collection, done }) {
  const d = pub.cover || {};
  const s = (k, v) => setPub(p => ({ ...p, cover: { ...p.cover, [k]: v } }));
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileInput = useRef(null);
  const save = () => { setSaved(true); done("cover"); setTimeout(() => setSaved(false), 2000); };

  const uploadCover = async (file) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      setErr("That doesn't look like an image file — try a JPG or PNG.");
      return;
    }
    setErr(""); setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      if (!dataUrl) { setErr("Couldn't read that image — try a smaller file or a different format."); return; }
      s("coverImageUrl", dataUrl);
    } finally { setBusy(false); }
  };

  const generateCover = async () => {
    setErr(""); setBusy(true);
    try {
      const prompt = buildCoverPrompt(book, collection, d);
      const loraUrl = collection && collection.loraStatus === "ready" ? collection.loraUrl : null;
      const seed = collection ? collection.seed : book.seed;
      const r = await fetch("/api/image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        // square_hd: covers are a square trim, but api/image.js's other callers (book
        // pages) need the portrait default, so this has to be requested explicitly here.
        // Without it, covers were generated 4:3 portrait and then force-cropped into a
        // square box client-side — slicing off whatever the model painted near the top/
        // bottom edges.
        body: JSON.stringify({ prompt, seed, negative_prompt: COVER_NEGATIVE_PROMPT, imageSize: "square_hd", ...(loraUrl ? { loraUrl } : {}) }),
      });
      const data = await r.json();
      if (data.error) { setErr(data.error); return; }
      // Convert to a data URI immediately — see urlToDataUri's comment on why a bare
      // hosted URL isn't safe to rely on for the exported PDF.
      try {
        const dataUri = await urlToDataUri(data.url);
        s("coverImageUrl", dataUri);
      } catch (e) {
        // Couldn't convert (likely a CORS-blocked fetch) — still show the generated
        // image so it's not wasted, but say plainly that it needs a manual save.
        s("coverImageUrl", data.url);
        setErr("Generated, but couldn't auto-save it for print — right-click the preview to save the image, then upload it with the button above.");
      }
    } catch (e) {
      setErr(e.message || "Couldn't generate a cover right now.");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>Front Cover Builder</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 22 }}>What buyers see first — title, author name, and cover image.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <Field label="Book Title"><TI value={d.title || book.title || ""} onChange={v => s("title", v)} /></Field>
          <Field label="Subtitle (optional)"><TI value={d.subtitle || ""} onChange={v => s("subtitle", v)} placeholder="A gentle story about…" /></Field>
          <Field label="Author / Pen Name" note="Pen names fully supported — this is what prints on the cover."><TI value={d.authorName || ""} onChange={v => s("authorName", v)} placeholder="e.g. Mara Voss" /></Field>
          <Field label="Series Name (optional)"><TI value={d.series || ""} onChange={v => s("series", v)} /></Field>
          <Field label="Age Range"><TI value={d.ageRange || "Ages 3–6"} onChange={v => s("ageRange", v)} /></Field>
        </div>
        <div>
          <Field label="Cover Image" note="Upload your own, or have Amora generate one in the book's locked style. Either way it's saved into the book — no separate hosting needed.">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => fileInput.current && fileInput.current.click()} disabled={busy} style={{ ...btn(), opacity: busy ? 0.6 : 1 }}>
                {busy ? "working…" : d.coverImageUrl ? "Replace with my own image" : "Upload my own image"}
              </button>
              <button onClick={generateCover} disabled={busy} style={{ ...btn("mauve"), opacity: busy ? 0.6 : 1 }}>
                {busy ? "painting…" : "✨ Generate one now"}
              </button>
              <input type="file" accept="image/*" style={{ display: "none" }}
                ref={(el) => { fileInput.current = el; }}
                onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) uploadCover(f); }} />
            </div>
            {err && <p style={{ color: C.gold, fontSize: 12, marginTop: 8 }}>{err}</p>}
            {d.coverImageUrl && (
              // True WYSIWYG preview — mirrors makeBookPDF's cover layout exactly (same
              // relative text positions, same two scrim bands) so what's seen here is what
              // prints. Before this, the box below only ever showed the bare illustration;
              // title/subtitle/author/series/age-range/publisher were invisible until the
              // PDF was exported, even though every one of those fields is filled in above.
              <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 8, marginTop: 8, overflow: "hidden", background: "#140f28", containerType: "inline-size" }}>
                <img src={d.coverImageUrl} alt="Cover" style={{ width: "100%", height: "100%", objectFit: d.finishedArt ? "contain" : "cover", display: "block" }} onError={() => {}} />
                {/* Text/scrim only shown in preview when finishedArt is off — when the
                    cover art already has the title baked in, makeBookPDF skips this whole
                    layer, so the preview has to match or it'd lie about what prints. */}
                {!d.finishedArt && <>
                  <div style={{ position: "absolute", left: 0, right: 0, top: "27%", height: "42%", background: "rgba(10,8,22,0.88)" }} />
                  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 34 / 215.9 * 100 + "%", background: "rgba(10,8,22,0.88)" }} />
                  {d.series && <div style={{ position: "absolute", left: 0, right: 0, top: "30%", textAlign: "center", color: "#c4a8d1", fontWeight: 700, fontSize: "5cqw", letterSpacing: 1 }}>{d.series.toUpperCase()}</div>}
                  <div style={{ position: "absolute", left: "8%", right: "8%", top: "38%", textAlign: "center", color: C.cream, fontWeight: 700, fontSize: "9cqw", fontFamily: "Georgia,serif", lineHeight: 1.15 }}>{d.title || book.title || "Untitled"}</div>
                  {d.subtitle && <div style={{ position: "absolute", left: "10%", right: "10%", top: "48%", textAlign: "center", color: "#e1d6e8", fontStyle: "italic", fontSize: "5.5cqw" }}>{d.subtitle}</div>}
                  {d.authorName && <div style={{ position: "absolute", left: 0, right: 0, top: "56%", textAlign: "center", color: C.cream, fontSize: "6cqw" }}>{d.authorName}</div>}
                  {d.showAgeBadge !== false && <div style={{ position: "absolute", left: 0, right: 0, bottom: "16%", textAlign: "center", color: "#c4a8d1", fontSize: "4cqw", letterSpacing: 0.5 }}>{(d.ageRange || "Ages 3–6").toUpperCase()}</div>}
                  {d.showLogo !== false && <div style={{ position: "absolute", left: 0, right: 0, bottom: "5%", textAlign: "center", color: C.mauve, fontSize: "4.5cqw" }}>Little Amour Books</div>}
                </>}
              </div>
            )}
            <details style={{ marginTop: 10 }}>
              <summary style={{ color: C.muted, fontSize: 12, cursor: "pointer" }}>Paste a URL instead</summary>
              <p style={{ color: C.muted, fontSize: 11, margin: "6px 0" }}>Pasted URLs may not embed correctly in the exported PDF — prefer the buttons above when possible.</p>
              <TI value={d.coverImageUrl && d.coverImageUrl.startsWith("data:") ? "" : (d.coverImageUrl || "")} onChange={v => s("coverImageUrl", v)} placeholder="https://…" />
            </details>
          </Field>
          <Field label="Style Notes"><TI value={d.styleNotes || ""} onChange={v => s("styleNotes", v)} placeholder="Soft watercolour, warm palette…" multi rows={3} /></Field>
        </div>
      </div>
      <Toggle label="My cover image already has the title/author on it - don't print text over it" value={!!d.finishedArt} onChange={v => s("finishedArt", v)} />
      <Toggle label="Show Little Amour Books logo" value={d.showLogo !== false} onChange={v => s("showLogo", v)} />
      <Toggle label="Show age range badge" value={d.showAgeBadge !== false} onChange={v => s("showAgeBadge", v)} />
      <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", marginTop: 4 }}>
        <p style={{ color: C.gold, fontSize: 12, margin: 0 }}>⚠ Keep all text at least 0.125″ from trim edges. Check legibility at thumbnail size.</p>
      </div>
      <SaveRow onSave={save} saved={saved} />
    </div>
  );
}

/* ── BACK COVER ── */
function BackCoverBuilder({ pub, setPub, book, done }) {
  const d = pub.backCover || {};
  const s = (k, v) => setPub(p => ({ ...p, backCover: { ...p.backCover, [k]: v } }));
  const [saved, setSaved] = useState(false);
  const [gen, setGen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileInput = useRef(null);
  const save = () => { setSaved(true); done("backcover"); setTimeout(() => setSaved(false), 2000); };

  // Same pattern as the Front Cover Builder's upload: resize client-side, store as a
  // data URI so the exported PDF (jsPDF addImage) has real bytes to embed, not just a
  // remote URL that could 404 or get CORS-blocked at export time.
  const uploadBackCover = async (file) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      setErr("That doesn't look like an image file — try a JPG or PNG.");
      return;
    }
    setErr(""); setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      if (!dataUrl) { setErr("Couldn't read that image — try a smaller file or a different format."); return; }
      s("backCoverImageUrl", dataUrl);
    } finally { setBusy(false); }
  };

  const generate = async (tone) => {
    setGen(true);
    const text = await callAmora(
      `Write a back cover description (3–4 sentences) for a children's picture book.
Title: "${pub.cover?.title || book.title || "Untitled"}"
Pages summary: ${(book.pages || []).slice(0, 6).map(p => p.text).filter(Boolean).join(" / ").slice(0, 350)}
Theme: ${pub.metadata?.theme || "healing and hope"}
Age range: ${pub.cover?.ageRange || "Ages 3–6"}
Author: ${pub.cover?.authorName || "the author"}
Tone: ${tone}
No headers, no bullets, flowing warm prose. End with the age range.`, 280);
    s("blurb", text);
    setGen(false);
  };

  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>Back Cover Builder</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 22 }}>The back sells the book. One warm paragraph beats a list every time.</p>
      <Field label="Finished Back Cover Image (optional)" note="Already have a finished back cover — designed elsewhere, hand-lettered, or otherwise complete? Upload it here and it's used as-is in your export's cover spread instead of the text fields below.">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => fileInput.current && fileInput.current.click()} disabled={busy} style={{ ...btn(), opacity: busy ? 0.6 : 1 }}>
            {busy ? "working…" : d.backCoverImageUrl ? "Replace with my own image" : "Upload finished back cover"}
          </button>
          {d.backCoverImageUrl && (
            <button onClick={() => s("backCoverImageUrl", "")} disabled={busy} style={btn("ghost")}>Remove image</button>
          )}
          <input type="file" accept="image/*" style={{ display: "none" }}
            ref={(el) => { fileInput.current = el; }}
            onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) uploadBackCover(f); }} />
        </div>
        {err && <p style={{ color: C.gold, fontSize: 12, marginTop: 8 }}>{err}</p>}
        {d.backCoverImageUrl && (
          <div style={{ width: "100%", maxWidth: 280, aspectRatio: "1 / 1", borderRadius: 8, marginTop: 8, overflow: "hidden", background: "#140f28" }}>
            <img src={d.backCoverImageUrl} alt="Back cover" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} onError={() => {}} />
          </div>
        )}
      </Field>
      <Field label="Back Cover Blurb" note={d.backCoverImageUrl ? "Not used in the export while a finished back cover image is uploaded above — kept here for your records." : "3–4 sentences. Amora can draft this from your story."}>
        <TI value={d.blurb || ""} onChange={v => s("blurb", v)} multi rows={5} placeholder="Generate below, or write your own…" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <ABtn label="Generate Blurb" onClick={() => generate("warm")} loading={gen} />
          <button onClick={() => generate("gentle")} disabled={gen} style={btn("ghost")}>Make It Gentler</button>
          <button onClick={() => generate("commercial")} disabled={gen} style={btn("ghost")}>More Commercial</button>
        </div>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Emotional Hook (1 line — top of back)"><TI value={d.hook || ""} onChange={v => s("hook", v)} placeholder="For every child who needed the right words." /></Field>
        <Field label="Author Quote or Endorsement (optional)"><TI value={d.quote || ""} onChange={v => s("quote", v)} /></Field>
        <Field label="Content Notes (optional)"><TI value={d.contentNotes || ""} onChange={v => s("contentNotes", v)} placeholder="Themes of family change, reassurance, safety." /></Field>
        <Field label="Website URL"><TI value={d.website || "littleamour.com"} onChange={v => s("website", v)} /></Field>
        <Field label="ISBN (optional)"><TI value={d.isbn || ""} onChange={v => s("isbn", v)} placeholder="978-0-000000-00-0" /></Field>
        <Field label="Price (optional)"><TI value={d.price || ""} onChange={v => s("price", v)} placeholder="$14.99" /></Field>
      </div>
      <Toggle label="Include barcode placeholder" value={d.barcode !== false} onChange={v => s("barcode", v)} />
      <Toggle label="Include QR code placeholder" value={!!d.qrCode} onChange={v => s("qrCode", v)} />
      <Toggle label="Show Little Amour Books description" value={d.showLABDesc !== false} onChange={v => s("showLABDesc", v)} />
      <SaveRow onSave={save} saved={saved} />
    </div>
  );
}

/* ── DEDICATION ── */
function DedicationBuilder({ pub, setPub, done }) {
  const d = pub.dedication || {};
  const s = (k, v) => setPub(p => ({ ...p, dedication: { ...p.dedication, [k]: v } }));
  const [skip, setSkip] = useState(!!d.skipped);
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setPub(p => ({ ...p, dedication: { ...p.dedication, skipped: skip } })); done("dedication"); setTimeout(() => setSaved(false), 2000); };
  const EXAMPLES = [
    "For every child who had to be brave before they were ready.",
    "For the mothers rebuilding life one soft morning at a time.",
    "For my children, who taught me what courage really means.",
    "For anyone who needed someone to tell them it gets softer.",
    "For every family that found its footing, one page at a time.",
  ];
  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>Dedication Page</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Optional. One sentence, or as private as you need it to be.</p>
      <Toggle label="Skip dedication page" value={skip} onChange={v => { setSkip(v); if (v) done("dedication"); }} />
      {!skip && (
        <>
          <Field label="Dedication Text" note="This is your page. Write whatever feels true.">
            <TI value={d.text || ""} onChange={v => s("text", v)} multi rows={4} placeholder="For…" />
          </Field>
          <Field label="Text Alignment">
            <div style={{ display: "flex", gap: 8 }}>
              {["left", "center", "right"].map(a => (
                <button key={a} onClick={() => s("align", a)} style={{ ...btn(d.align === a ? "mauve" : "ghost"), textTransform: "capitalize" }}>{a}</button>
              ))}
            </div>
          </Field>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", marginTop: 4 }}>
            <p style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Inspiration — click to use</p>
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => s("text", ex)}
                style={{ display: "block", background: "transparent", border: "none", color: C.rose, fontSize: 14, fontFamily: "Georgia,serif", fontStyle: "italic", cursor: "pointer", marginBottom: 6, textAlign: "left", lineHeight: 1.5, padding: 0 }}>"{ex}"</button>
            ))}
          </div>
          {d.text && (
            <div style={{ marginTop: 16, background: "#FAF4EB", borderRadius: 8, padding: "28px 36px", textAlign: d.align || "center", maxWidth: 360 }}>
              <p style={{ color: "#2B2433", fontFamily: "Georgia,serif", fontSize: 15, fontStyle: "italic", lineHeight: 1.9, margin: 0 }}>{d.text}</p>
            </div>
          )}
        </>
      )}
      <SaveRow onSave={save} saved={saved} />
    </div>
  );
}

/* ── ABOUT AUTHOR ── */
function AboutAuthorBuilder({ pub, setPub, book, author, done }) {
  const d = pub.aboutAuthor || {};
  const s = (k, v) => setPub(p => ({ ...p, aboutAuthor: { ...p.aboutAuthor, [k]: v } }));
  const [skip, setSkip] = useState(!!d.skipped);
  const [saved, setSaved] = useState(false);
  const [gen, setGen] = useState(false);
  const save = () => { setSaved(true); setPub(p => ({ ...p, aboutAuthor: { ...p.aboutAuthor, skipped: skip } })); done("about_author"); setTimeout(() => setSaved(false), 2000); };
  const TONES = ["warm", "professional", "poetic", "survivor-centered", "playful", "anonymous / protected identity"];
  const generateBio = async (tone) => {
    setGen(true);
    const text = await callAmora(
      `Write a 2–3 sentence "About the Author" for a children's book. Pen name: ${d.penName || pub.cover?.authorName || author?.name || "the author"}. Book: "${book.title || "their book"}". Tone: ${tone}. Never mention trauma, legal situations, or identifying details. Protect privacy. Celebrate the author. Plain sentences only.`, 200);
    s("bio", text);
    setGen(false);
  };
  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>About the Author</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>You never have to share more than you choose. Pen names and illustrated portraits are fully supported.</p>
      <Toggle label="Skip About the Author page" value={skip} onChange={v => { setSkip(v); if (v) done("about_author"); }} />
      {!skip && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 16 }}>
            <div>
              <Field label="Author Name (public — pen name fine)"><TI value={d.penName || pub.cover?.authorName || ""} onChange={v => s("penName", v)} /></Field>
              <Field label="Private notes for bio generation" note="These never appear in the book — just help Amora write."><TI value={d.privateNotes || ""} onChange={v => s("privateNotes", v)} multi rows={3} placeholder="Whatever you'd like Amora to know…" /></Field>
              <Field label="Website or social (optional)"><TI value={d.website || ""} onChange={v => s("website", v)} /></Field>
              <Field label="Location (optional — e.g. 'lives in the Pacific Northwest')"><TI value={d.location || ""} onChange={v => s("location", v)} /></Field>
            </div>
            <div>
              <Field label="Bio (appears in the book)" note="Amora drafts — you edit.">
                <TI value={d.bio || ""} onChange={v => s("bio", v)} multi rows={5} placeholder="Generate with a tone below, or write your own." />
              </Field>
              <p style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Generate bio with tone:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {TONES.map(t => (
                  <button key={t} onClick={() => generateBio(t)} disabled={gen}
                    style={{ ...btn("ghost"), fontSize: 12, padding: "5px 10px", opacity: gen ? 0.5 : 1 }}>{gen ? "…" : t}</button>
                ))}
              </div>
            </div>
          </div>
          <Toggle label="Use pen name only (never show legal name)" value={d.penNameOnly !== false} onChange={v => s("penNameOnly", v)} />
          <Toggle label="Hide author photo" value={d.hidePhoto !== false} onChange={v => s("hidePhoto", v)} />
        </>
      )}
      <SaveRow onSave={save} saved={saved} />
    </div>
  );
}

/* ── ABOUT LAB ── */
function AboutLABBuilder({ pub, setPub, done }) {
  const d = pub.aboutLAB || {};
  const s = (k, v) => setPub(p => ({ ...p, aboutLAB: { ...p.aboutLAB, [k]: v } }));
  const [saved, setSaved] = useState(false);
  const DEFAULT = "Little Amour Books creates gentle, emotionally honest stories for children and families moving through hard things. Our books are made with survivor-centered care, creative technology, and human editorial support — so more mothers and lived-experience authors can share the stories only they could tell.";
  const save = () => { setSaved(true); done("about_lab"); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>About Little Amour Books Page</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 22 }}>Appears in every book. Defaults are ready — edit freely.</p>
      <Field label="Publisher Description">
        <TI value={d.copy || DEFAULT} onChange={v => s("copy", v)} multi rows={4} />
        <button onClick={() => s("copy", DEFAULT)} style={{ ...btn("ghost"), fontSize: 11, marginTop: 6 }}>Reset to default</button>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Website"><TI value={d.website || "littleamour.com"} onChange={v => s("website", v)} /></Field>
        <Field label="Contact Email"><TI value={d.email || "hello@littleamour.com"} onChange={v => s("email", v)} /></Field>
      </div>
      <Toggle label="Include 'Become an Author' link" value={!!d.showApply} onChange={v => s("showApply", v)} />
      <Toggle label="Include support / donation link" value={!!d.showDonate} onChange={v => s("showDonate", v)} />
      <SaveRow onSave={save} saved={saved} />
    </div>
  );
}

/* ── COPYRIGHT ── */
function CopyrightBuilder({ pub, setPub, book, done }) {
  const d = pub.copyright || {};
  const s = (k, v) => setPub(p => ({ ...p, copyright: { ...p.copyright, [k]: v } }));
  const [saved, setSaved] = useState(false);
  const yr = new Date().getFullYear();
  const save = () => { setSaved(true); done("copyright"); setTimeout(() => setSaved(false), 2000); };
  const DEF_RIGHTS = `Copyright © ${d.year || yr} ${d.owner || pub.cover?.authorName || "[Author Name]"}. All rights reserved. No part of this book may be reproduced, distributed, or transmitted in any form without written permission from the copyright holder, except for brief quotations in reviews.`;
  const AI_DISC = "This book was created with AI-assisted illustration and editorial tools, with final creative direction, story approval, and publishing oversight by the author and Little Amour Books.";
  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>Copyright Page</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 22 }}>The legal foundation of your book. Defaults are professionally worded and ready to go.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Copyright Owner (name or pen name)"><TI value={d.owner || pub.cover?.authorName || ""} onChange={v => s("owner", v)} /></Field>
        <Field label="Year"><TI value={d.year || String(yr)} onChange={v => s("year", v)} /></Field>
        <Field label="Publisher / Imprint"><TI value={d.publisher || "Little Amour Books"} onChange={v => s("publisher", v)} /></Field>
        <Field label="ISBN (optional)"><TI value={d.isbn || ""} onChange={v => s("isbn", v)} placeholder="978-0-000000-00-0" /></Field>
        <Field label="Edition"><TI value={d.edition || "First Edition"} onChange={v => s("edition", v)} /></Field>
        <Field label="Illustrator / Studio Credit"><TI value={d.illustrator || "Illustrated with AI-assisted art direction, Little Amour Books Studio"} onChange={v => s("illustrator", v)} /></Field>
      </div>
      <Field label="Rights Statement">
        <TI value={d.rights || DEF_RIGHTS} onChange={v => s("rights", v)} multi rows={4} />
        <button onClick={() => s("rights", DEF_RIGHTS)} style={{ ...btn("ghost"), fontSize: 11, marginTop: 6 }}>Reset to default</button>
      </Field>
      <Toggle label="Include AI-assisted creation disclosure" value={d.aiDisclosure !== false} onChange={v => s("aiDisclosure", v)} />
      {d.aiDisclosure !== false && <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}><p style={{ color: C.muted, fontSize: 13, fontStyle: "italic", margin: 0 }}>{AI_DISC}</p></div>}
      <SaveRow onSave={save} saved={saved} />
    </div>
  );
}

/* ── SELL AS ── */
function SellAsBuilder({ pub, setPub, book, done }) {
  // Default: if the author has never touched this, treat it the way the store
  // already behaves today (PDF + Physical both available, Amazon off) so existing
  // books don't silently disappear from sale the moment this ships.
  const d = pub.sellAs || { pdf: true, physical: true, amazon: false };
  const amazonUrl = pub.amazonUrl || "";
  const s = (k, v) => setPub(p => ({ ...p, sellAs: { ...(p.sellAs || { pdf: true, physical: true, amazon: false }), [k]: v } }));
  const setAmazonUrl = v => setPub(p => ({ ...p, amazonUrl: v }));
  const [saved, setSaved] = useState(false);
  const noneSelected = !d.pdf && !d.physical && !d.amazon;
  const save = () => { setSaved(true); done("sellas"); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>How should this book be sold?</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 22 }}>Choose every way this book is available. The public book page only shows buy buttons for what you check here.</p>

      <Toggle label="📄 PDF — digital download, sold and delivered on Little Amour Books" value={!!d.pdf} onChange={v => s("pdf", v)} />
      <Toggle label="📦 Physical — printed copy, sold and shipped through Little Amour Books" value={!!d.physical} onChange={v => s("physical", v)} />
      <Toggle label="🛒 Amazon — link out to a listing you manage on Amazon (KDP)" value={!!d.amazon} onChange={v => s("amazon", v)} />

      {d.amazon && (
        <Field label="Amazon listing URL" note="Paste the live Amazon product page link. The public Buy on Amazon button will go straight here.">
          <TI value={amazonUrl} onChange={setAmazonUrl} placeholder="https://www.amazon.com/dp/XXXXXXXXXX" />
        </Field>
      )}
      {d.amazon && !amazonUrl && (
        <p style={{ color: C.gold, fontSize: 12.5, marginTop: -8, marginBottom: 14 }}>Amazon is checked but no URL is set yet — the Amazon button won't appear on the public page until you add one.</p>
      )}
      {noneSelected && (
        <p style={{ color: "#E2746A", fontSize: 12.5, marginTop: -4, marginBottom: 14 }}>Nothing is checked — this book won't show any buy button on its public page until at least one format is selected.</p>
      )}

      <SaveRow onSave={save} saved={saved} />
    </div>
  );
}

/* ── METADATA ── */
function MetadataBuilder({ pub, setPub, book, done }) {
  const d = pub.metadata || {};
  const s = (k, v) => setPub(p => ({ ...p, metadata: { ...p.metadata, [k]: v } }));
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); done("metadata"); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>Book Metadata</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 22 }}>Used for marketplace listings, libraries, and the metadata sheet in your export package.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Title"><TI value={d.title || book.title || ""} onChange={v => s("title", v)} /></Field>
        <Field label="Subtitle"><TI value={d.subtitle || pub.cover?.subtitle || ""} onChange={v => s("subtitle", v)} /></Field>
        <Field label="Author / Pen Name"><TI value={d.authorName || pub.cover?.authorName || ""} onChange={v => s("authorName", v)} /></Field>
        <Field label="Legal Name (private — records only)"><TI value={d.legalName || ""} onChange={v => s("legalName", v)} /></Field>
        <Field label="Theme / Subject"><TI value={d.theme || ""} onChange={v => s("theme", v)} placeholder="family separation, resilience, safe homes" /></Field>
        <Field label="Age Range"><TI value={d.ageRange || pub.cover?.ageRange || "Ages 3–6"} onChange={v => s("ageRange", v)} /></Field>
        <Field label="Trim Size"><TI value={d.trimSize || '8.5" × 8.5"'} onChange={v => s("trimSize", v)} /></Field>
        <Field label="Page Count"><TI value={d.pageCount || String((book.pages?.length || 0) + 8)} onChange={v => s("pageCount", v)} /></Field>
        <Field label="ISBN"><TI value={d.isbn || pub.copyright?.isbn || ""} onChange={v => s("isbn", v)} /></Field>
        <Field label="Publication Date"><TI value={d.pubDate || ""} onChange={v => s("pubDate", v)} placeholder="September 2025" /></Field>
        <Field label="Price — Digital"><TI value={d.priceDigital || "$9.99"} onChange={v => s("priceDigital", v)} /></Field>
        <Field label="Price — Print"><TI value={d.pricePrint || "$14.99"} onChange={v => s("pricePrint", v)} /></Field>
        <Field label="Royalty Split"><TI value={d.royaltySplit || "75% author / 25% Little Amour Books"} onChange={v => s("royaltySplit", v)} /></Field>
        <Field label="Reading Level"><TI value={d.readingLevel || "Picture book — read-aloud"} onChange={v => s("readingLevel", v)} /></Field>
      </div>
      <Field label="Short Description (1–2 sentences)"><TI value={d.shortDesc || ""} onChange={v => s("shortDesc", v)} multi rows={2} /></Field>
      <Field label="Long Description (Amazon, website)"><TI value={d.longDesc || pub.backCover?.blurb || ""} onChange={v => s("longDesc", v)} multi rows={5} /></Field>
      <Field label="Keywords (comma-separated)"><TI value={d.keywords || ""} onChange={v => s("keywords", v)} placeholder="children's book divorce, family court kids book, healing picture book" /></Field>
      <Field label="BISAC Categories"><TI value={d.categories || "JUV039140 (Family / Divorce), JUV039070 (Family / General)"} onChange={v => s("categories", v)} /></Field>
      <Field label="Content Notes"><TI value={d.contentNotes || pub.backCover?.contentNotes || ""} onChange={v => s("contentNotes", v)} multi rows={2} /></Field>
      <SaveRow onSave={save} saved={saved} />
    </div>
  );
}

/* ── EXPORT CENTER ── */
function ExportCenter({ pub, setPub, book, author, done }) {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const [finished, setFinished] = useState(false);

  const addLog = msg => setLog(l => [...l, msg]);

  // jsPDF's built-in fonts (helvetica) only cover WinAnsi/Latin-1 glyphs - emoji and
  // symbols like checkmarks fall outside that and render as missing-glyph boxes or
  // blank space. That showed up as garbled characters in the Read Me First and Rights
  // Checklist PDFs. Strip anything outside what helvetica can actually draw instead of
  // hoping the font silently has a fallback.
  const cleanText = (str) => String(str ?? "")
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, "")
    .replace(/\u2713/g, "-")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  const makeTextPDF = (title, lines) => {
    const doc = new jsPDF({ unit: "mm", format: [215.9, 279.4] });
    doc.setFillColor(250, 244, 235); doc.rect(0, 0, 215.9, 279.4, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(43, 36, 51);
    doc.text(cleanText(title), 107.95, 30, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    let y = 48;
    lines.forEach(rawLine => {
      const line = cleanText(rawLine);
      if (y > 260) { doc.addPage(); y = 20; doc.setFillColor(250, 244, 235); doc.rect(0, 0, 215.9, 279.4, "F"); }
      const split = doc.splitTextToSize(line || " ", 168);
      split.forEach(s => { doc.text(s, 24, y); y += 6.5; });
      if (!line) y += 2;
    });
    return doc;
  };

  // Loads a data: URL / http(s) URL into a real <img> element so its pixels are
  // readable via canvas — needed to stretch a thin slice of an image's own edge
  // pixels into whatever gap contain-fit leaves around a non-square piece of art.
  const loadImageEl = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  // Grabs a few-px-tall strip from the very top or bottom edge of the image and
  // stretches it to (outW x outH) — used to fill a horizontal letterbox gap with
  // the image's own background color/texture instead of bare page background.
  const edgeStripH = (img, fromTop, outW = 400, outH = 40) => {
    const c = document.createElement("canvas");
    c.width = outW; c.height = outH;
    const ctx = c.getContext("2d");
    const stripPx = Math.max(1, Math.min(4, img.naturalHeight));
    const sy = fromTop ? 0 : Math.max(0, img.naturalHeight - stripPx);
    ctx.drawImage(img, 0, sy, img.naturalWidth, stripPx, 0, 0, outW, outH);
    return c.toDataURL("image/png");
  };

  // Same idea, but for a vertical letterbox gap (left/right edge of the image).
  const edgeStripV = (img, fromLeft, outW = 40, outH = 400) => {
    const c = document.createElement("canvas");
    c.width = outW; c.height = outH;
    const ctx = c.getContext("2d");
    const stripPx = Math.max(1, Math.min(4, img.naturalWidth));
    const sx = fromLeft ? 0 : Math.max(0, img.naturalWidth - stripPx);
    ctx.drawImage(img, sx, 0, stripPx, img.naturalHeight, 0, 0, outW, outH);
    return c.toDataURL("image/png");
  };

  const makeBookPDF = async (printMode = false, personalUseNote = false) => {
    // KDP only adds bleed once — on the single outer trim edge — plus once each on top
    // and bottom. It does NOT add bleed on the spine/inner edge (that margin is already
    // covered by the live-area safety margin, not by extra paper). The previous version
    // added 0.125in to every side (8.75 x 8.75 for an 8.5 x 8.5 trim), which is not a
    // size KDP's own bleed-interior spec accepts — the correct page size is 8.625 x 8.75.
    const bx = printMode ? 3.175 : 0; // 0.125in, added once (outer edge)
    const by = printMode ? 3.175 : 0; // 0.125in, added to top AND to bottom
    const W = 215.9 + bx, H = 215.9 + by * 2;
    const doc = new jsPDF({ unit: "mm", format: [W, H] });
    const pgs = book.pages || [];
    const cover = pub.cover || {};

    // Cover — solid background first as a guaranteed fallback, then the real cover
    // image on top if one's been uploaded/generated. Previously this image was never
    // drawn at all: coverImageUrl only ever showed up in the builder's own preview, not
    // in the actual exported PDF — a real, silent gap, not a styling choice.
    doc.setFillColor(20, 15, 40); doc.rect(0, 0, W, H, "F");
    let coverImageDrawn = false;
    if (cover.coverImageUrl && cover.coverImageUrl.startsWith("data:")) {
      try {
        const fmt = cover.coverImageUrl.includes("png") ? "PNG" : "JPEG";
        let drawW = W, drawH = H, drawX = 0, drawY = 0;
        try {
          const props = doc.getImageProperties(cover.coverImageUrl);
          if (props && props.width && props.height) {
            const srcRatio = props.width / props.height;
            const boxRatio = W / H;
            if (cover.finishedArt) {
              // This cover already has the title/author baked into the pixels (the
              // "already has the title on it" toggle below). "Cover" fit would crop
              // straight through that baked-in text on anything that isn't a perfect
              // square — exactly what was happening on a real export: the generated
              // cover came back 1024x1536 (2:3 portrait), not the square it was supposed
              // to be, and force-cropping it into the square trim sliced the title off
              // top and bottom. "Contain" fit instead — the whole image inside the page,
              // centered, background showing on any leftover strip — same fix already
              // applied to finishedArt story pages, applied here for the same reason.
              if (srcRatio > boxRatio) { drawW = W; drawH = W / srcRatio; }
              else { drawH = H; drawW = H * srcRatio; }
            } else {
              // No baked-in text on this art — our own text gets drawn on top below, so
              // filling the full bleed with no letterboxing (cropping whatever overflows)
              // is the right look here.
              if (srcRatio > boxRatio) { drawH = H; drawW = H * srcRatio; }
              else { drawW = W; drawH = W / srcRatio; }
            }
            drawX = (W - drawW) / 2;
            drawY = (H - drawH) / 2;
          }
        } catch (e) { /* couldn't read dimensions — fall back to stretching to fill */ }
        if (cover.finishedArt) {
          const topBar = drawY, bottomBar = H - drawH - drawY;
          const leftBar = drawX, rightBar = W - drawW - drawX;
          if (topBar > 0.4 || bottomBar > 0.4 || leftBar > 0.4 || rightBar > 0.4) {
            try {
              const img = await loadImageEl(cover.coverImageUrl);
              if (topBar > 0.4) doc.addImage(edgeStripH(img, true), "PNG", 0, 0, W, topBar);
              if (bottomBar > 0.4) doc.addImage(edgeStripH(img, false), "PNG", 0, H - bottomBar, W, bottomBar);
              if (leftBar > 0.4) doc.addImage(edgeStripV(img, true), "PNG", 0, 0, leftBar, H);
              if (rightBar > 0.4) doc.addImage(edgeStripV(img, false), "PNG", W - rightBar, 0, rightBar, H);
            } catch (e) { /* edge-extend failed — background shows through as before */ }
          }
        }
        doc.addImage(cover.coverImageUrl, fmt, drawX, drawY, drawW, drawH);
        coverImageDrawn = true;
      } catch (e) { /* image unavailable — solid background already drawn, keep going */ }
    }
    // Dark scrim bands behind every text region keep it legible over a busy
    // illustration — only needed when there's an actual image underneath the text.
    // Two bands (hero block + footer block) rather than one tall one, so the bulk of
    // the illustration in between stays visible instead of being half-blacked-out.
    // Opacity is high (0.88), not a light tint: the image prompt tells the model not to
    // paint its own text, but negative prompts on diffusion models are a request, not a
    // guarantee — confirmed on a real export where the model painted its own title/
    // subtitle anyway. A light scrim let that stray text show through underneath ours,
    // reading as duplicated, mismatched text. A near-opaque band hides it completely
    // regardless of what the model does, instead of relying on the model behaving.
    // Cover art that already has the title/author baked into the pixels (the
    // "My cover already has the title on it" toggle below) skips this entire
    // block — scrim included — same reasoning as the per-page finishedArt flag:
    // drawing our own text on top of art that already has text is what caused
    // the duplicated/overwritten title Kirby saw on the real export.
    if (!cover.finishedArt) {
    if (coverImageDrawn) {
      try {
        doc.saveGraphicsState();
        if (doc.GState) doc.setGState(new doc.GState({ opacity: 0.88 }));
        doc.setFillColor(10, 8, 22);
        doc.rect(0, H * 0.27, W, H * 0.42, "F"); // series + title + subtitle + author
        doc.rect(0, H - 34, W, 34, "F"); // age badge + publisher logo footer
        doc.restoreGraphicsState();
      } catch (e) { /* opacity API unavailable on this jsPDF build — skip the scrim, text still renders */ }
    }
    // Every field the author actually filled in on the Front Cover Builder gets drawn
    // here — title, series, subtitle, author, age range, publisher. Previously only
    // title/author/logo made it onto the cover even though the builder collected all
    // six; subtitle/series/age-range were captured and then silently dropped.
    if (cover.series) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(196, 168, 209);
      doc.text(cover.series.toUpperCase(), W / 2, H * 0.32, { align: "center" });
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(250, 244, 235);
    doc.text(cover.title || book.title || "Untitled", W / 2, H * 0.42, { align: "center", maxWidth: W - 36 });
    if (cover.subtitle) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(12); doc.setTextColor(225, 214, 232);
      doc.text(cover.subtitle, W / 2, H * 0.50, { align: "center", maxWidth: W - 44 });
    }
    if (cover.authorName) { doc.setFont("helvetica", "normal"); doc.setFontSize(14); doc.setTextColor(250, 244, 235); doc.text(cover.authorName, W / 2, H * 0.58, { align: "center" }); }
    if (cover.showAgeBadge !== false) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(196, 168, 209);
      doc.text((cover.ageRange || "Ages 3–6").toUpperCase(), W / 2, H - 26, { align: "center" });
    }
    if (cover.showLogo !== false) { doc.setFontSize(10); doc.setTextColor(155, 126, 184); doc.text("Little Amour Books", W / 2, H - 14, { align: "center" }); }
    } // end !cover.finishedArt

    // Personal-use note — only for the Printable PDF (home-printing copy). Customers
    // need this stated inside the file itself, not just in a separate Read Me PDF that
    // could get separated from it.
    if (personalUseNote) {
      doc.addPage([W, H]);
      doc.setFillColor(250, 244, 235); doc.rect(0, 0, W, H, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(43, 36, 51);
      doc.text("Personal Use - Printable Edition", W / 2, H * 0.4, { align: "center", maxWidth: W - 30 });
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(80, 70, 90);
      const note = doc.splitTextToSize("This file is licensed for personal, non-commercial home printing only. Please do not reproduce, redistribute, or resell printed or digital copies.", W - 40);
      doc.text(note, W / 2, H * 0.48, { align: "center" });
    }

    // Copyright page
    doc.addPage([W, H]);
    doc.setFillColor(250, 244, 235); doc.rect(0, 0, W, H, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(80, 70, 90);
    const cpLines = doc.splitTextToSize(pub.copyright?.rights || `Copyright © ${new Date().getFullYear()} ${cover.authorName || "the author"}. All rights reserved.`, 170);
    doc.text(cpLines, W / 2, H - 40, { align: "center" });

    // Dedication
    if (pub.dedication?.text && !pub.dedication?.skipped) {
      doc.addPage([W, H]);
      doc.setFillColor(250, 244, 235); doc.rect(0, 0, W, H, "F");
      doc.setFont("helvetica", "bolditalic"); doc.setFontSize(13); doc.setTextColor(110, 85, 114);
      const dedLines = doc.splitTextToSize(`"${pub.dedication.text}"`, 160);
      doc.text(dedLines, W / 2, H / 2, { align: pub.dedication.align || "center", baseline: "middle" });
    }

    // Story pages
    for (let i = 0; i < pgs.length; i++) {
      doc.addPage([W, H]);
      const pg = pgs[i];
      doc.setFillColor(245, 238, 225); doc.rect(0, 0, W, H, "F");
      const hasImg = pg.img && (pg.img.startsWith("data:") || pg.img.startsWith("http"));
      if (pg.finishedArt) {
        // This page came in through "Build the book from my uploads" (App.jsx) — the
        // author's own finished page, art and text already baked into the same pixels.
        // pg.text here is only a transcription Amora kept for her own reference (consistency
        // checks, search) — it is NOT story copy waiting to be typeset. Drawing it again
        // below the image was the literal duplicate-text bug. Treat the image as the whole
        // finished page: fill the entire live trim area, nothing else gets drawn on top.
        if (hasImg) {
          try {
            const fmt = pg.img.includes("png") ? "PNG" : "JPEG";
            let drawW = 215.9, drawH = 215.9, drawX = 0, drawY = by;
            let srcRatio = 1;
            try {
              const props = doc.getImageProperties(pg.img);
              if (props && props.width && props.height) {
                srcRatio = props.width / props.height;
                // "Contain" fit, not "cover" - this image IS the finished page
                // (text baked into the pixels). Cropping any edge risks slicing off
                // baked-in text, which is exactly what was happening on later pages
                // whose source art wasn't a perfect square (different repaint pass /
                // pipeline). Fit the whole image inside the box and center it — the
                // leftover strip (when the art isn't a perfect square) gets filled
                // below by stretching the image's own edge pixels into it, not left
                // as bare page background.
                if (srcRatio > 1) { drawW = 215.9; drawH = 215.9 / srcRatio; }
                else { drawH = 215.9; drawW = 215.9 * srcRatio; }
                drawX = (215.9 - drawW) / 2;
                drawY = by + (215.9 - drawH) / 2;
              }
            } catch (e) { /* couldn't read dimensions — fall back to filling the trim box as-is */ }
            // Some pages 14+ were painted at a non-square ratio (1100x880, 1400x1119, etc.)
            // before story-page generation was fixed to request square_hd. Contain-fit
            // alone leaves a visible bare-page strip top/bottom or left/right on those —
            // "white above and below the images" per Kirby. Re-painting risks the AI
            // re-rendering the baked-in text as gibberish (tried once, page 14, got
            // garbled nonsense text back) and cropping risks slicing through the real
            // baked-in text near an edge (also confirmed unsafe — page 15's text sits a few
            // percent off the left edge with no real margin to spare). So instead: stretch
            // a thin slice of the image's own edge pixels to fill the gap. No regeneration,
            // no cropping of any real content, page reads as "fully imaged" either way.
            const topBar = drawY - by, bottomBar = 215.9 - drawH - topBar;
            const leftBar = drawX, rightBar = 215.9 - drawW - drawX;
            if (topBar > 0.4 || bottomBar > 0.4 || leftBar > 0.4 || rightBar > 0.4) {
              try {
                const img = await loadImageEl(pg.img);
                if (topBar > 0.4) doc.addImage(edgeStripH(img, true), "PNG", 0, by, 215.9, topBar);
                if (bottomBar > 0.4) doc.addImage(edgeStripH(img, false), "PNG", 0, by + 215.9 - bottomBar, 215.9, bottomBar);
                if (leftBar > 0.4) doc.addImage(edgeStripV(img, true), "PNG", 0, by, leftBar, 215.9);
                if (rightBar > 0.4) doc.addImage(edgeStripV(img, false), "PNG", 215.9 - rightBar, by, rightBar, 215.9);
              } catch (e) { /* edge-extend failed — page background shows through as before */ }
            }
            doc.addImage(pg.img, fmt, drawX, drawY, drawW, drawH);
          } catch (e) { /* image unavailable — skip */ }
        }
      } else {
        if (hasImg) {
          try {
            const fmt = pg.img.includes("png") ? "PNG" : "JPEG";
            const boxW = 215.9, boxH = 215.9 * 0.68;
            // AI-painted pages are all portrait_4_3, so they've always filled this box cleanly.
            // An author's own uploaded photo (different camera, different crop) won't reliably
            // match that ratio — stretching it to fill the box would distort it. Fit it inside
            // the box preserving its real aspect ratio instead, centered, with the page's own
            // background showing on whichever side is left over.
            let drawW = boxW, drawH = boxH, drawX = 0, drawY = by;
            try {
              const props = doc.getImageProperties(pg.img);
              if (props && props.width && props.height) {
                const srcRatio = props.width / props.height;
                const boxRatio = boxW / boxH;
                if (srcRatio > boxRatio) { drawW = boxW; drawH = boxW / srcRatio; }
                else { drawH = boxH; drawW = boxH * srcRatio; }
                drawX = (boxW - drawW) / 2;
                drawY = by + (boxH - drawH) / 2;
              }
            } catch (e) { /* couldn't read dimensions — fall back to filling the box as before */ }
            doc.addImage(pg.img, fmt, drawX, drawY, drawW, drawH);
          } catch (e) { /* image unavailable — skip */ }
        }
        if (pg.text) {
          doc.setFillColor(250, 244, 235); doc.rect(0, by + 215.9 * 0.68, 215.9, 215.9 * 0.32, "F");
          doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(43, 36, 51);
          const tl = doc.splitTextToSize(pg.text, 185);
          doc.text(tl, 215.9 / 2, by + 215.9 * 0.74, { align: "center" });
        }
      }
      if (printMode) { doc.setFontSize(8); doc.setTextColor(160, 140, 170); doc.text(String(i + 1), W / 2, H - 6, { align: "center" }); }
    }

    // About Author
    if (pub.aboutAuthor?.bio && !pub.aboutAuthor?.skipped) {
      doc.addPage([W, H]);
      doc.setFillColor(250, 244, 235); doc.rect(0, 0, W, H, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(110, 85, 114);
      doc.text("About the Author", W / 2, 36, { align: "center" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(43, 36, 51);
      const bl = doc.splitTextToSize(pub.aboutAuthor.bio, 165);
      doc.text(bl, W / 2, 52, { align: "center" });
    }

    // About LAB
    doc.addPage([W, H]);
    doc.setFillColor(14, 21, 37); doc.rect(0, 0, W, H, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(155, 126, 184);
    doc.text("Little Amour Books", W / 2, 46, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(250, 244, 235);
    const labCopy = pub.aboutLAB?.copy || "Little Amour Books creates gentle, emotionally honest stories for children and families moving through hard things.";
    const ll = doc.splitTextToSize(labCopy, 165);
    doc.text(ll, W / 2, 62, { align: "center" });
    doc.setFontSize(10); doc.setTextColor(155, 126, 184);
    doc.text(pub.aboutLAB?.website || "littleamour.com", W / 2, H - 28, { align: "center" });

    // Back cover — previously this customer-facing PDF (Digital Reading + Printable)
    // never drew a back cover page at all. The real/placeholder back cover only ever
    // existed in the separate publisher "Full Cover spread" file, which most customers
    // never open. A real children's book has a back cover; this adds one as the actual
    // last page of the book the reader holds, not just an internal print artifact.
    doc.addPage([W, H]);
    const bcv = pub.backCover || {};
    if (bcv.backCoverImageUrl && bcv.backCoverImageUrl.startsWith("data:")) {
      doc.setFillColor(20, 15, 40); doc.rect(0, 0, W, H, "F");
      try {
        const fmt = bcv.backCoverImageUrl.includes("png") ? "PNG" : "JPEG";
        let drawW = W, drawH = H, drawX = 0, drawY = 0;
        try {
          const props = doc.getImageProperties(bcv.backCoverImageUrl);
          if (props && props.width && props.height) {
            const srcRatio = props.width / props.height;
            const boxRatio = W / H;
            // "Contain" fit, not "cover" — an uploaded finished back cover may have its
            // own baked-in text/design (same reasoning as the finishedArt cover/page
            // paths above): cropping any edge risks slicing through it. The whole image
            // fits inside the page instead, centered.
            if (srcRatio > boxRatio) { drawW = W; drawH = W / srcRatio; }
            else { drawH = H; drawW = H * srcRatio; }
            drawX = (W - drawW) / 2;
            drawY = (H - drawH) / 2;
          }
        } catch (e) { /* couldn't read dimensions — fall back to filling the page */ }
        const topBar = drawY, bottomBar = H - drawH - drawY;
        const leftBar = drawX, rightBar = W - drawW - drawX;
        if (topBar > 0.4 || bottomBar > 0.4 || leftBar > 0.4 || rightBar > 0.4) {
          try {
            const img = await loadImageEl(bcv.backCoverImageUrl);
            if (topBar > 0.4) doc.addImage(edgeStripH(img, true), "PNG", 0, 0, W, topBar);
            if (bottomBar > 0.4) doc.addImage(edgeStripH(img, false), "PNG", 0, H - bottomBar, W, bottomBar);
            if (leftBar > 0.4) doc.addImage(edgeStripV(img, true), "PNG", 0, 0, leftBar, H);
            if (rightBar > 0.4) doc.addImage(edgeStripV(img, false), "PNG", W - rightBar, 0, rightBar, H);
          } catch (e) { /* edge-extend failed — background shows through as before */ }
        }
        doc.addImage(bcv.backCoverImageUrl, fmt, drawX, drawY, drawW, drawH);
      } catch (e) { /* image unavailable — solid background already drawn */ }
    } else {
      // No finished back cover image — a real, designed text back cover (hook +
      // blurb + age range), not a "placeholder" banner. Plenty of real picture books
      // have text-only back covers; this is a legitimate finished look, not an error
      // state, so it gets the same dark cover palette as the front instead of looking
      // like an internal print artifact.
      doc.setFillColor(20, 15, 40); doc.rect(0, 0, W, H, "F");
      if (bcv.hook) {
        doc.setFont("helvetica", "bolditalic"); doc.setFontSize(15); doc.setTextColor(250, 244, 235);
        const hookLines = doc.splitTextToSize(bcv.hook, W - 50);
        doc.text(hookLines, W / 2, H * 0.3, { align: "center" });
      }
      const blurbText = bcv.blurb || pub.metadata?.longDesc || pub.metadata?.shortDesc || "";
      if (blurbText) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(225, 214, 232);
        const blurbLines = doc.splitTextToSize(blurbText, W - 50);
        doc.text(blurbLines, W / 2, H * (bcv.hook ? 0.42 : 0.38), { align: "center" });
      }
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(196, 168, 209);
      doc.text((cover.ageRange || "Ages 3–6").toUpperCase(), W / 2, H - 26, { align: "center" });
      doc.setFontSize(10); doc.setTextColor(155, 126, 184);
      doc.text("Little Amour Books", W / 2, H - 14, { align: "center" });
    }

    return doc;
  };

  const metaObj = () => {
    const m = pub.metadata || {};
    const authorName = m.authorName || pub.cover?.authorName || "";
    const obj = {
      title: m.title || book.title, subtitle: m.subtitle || pub.cover?.subtitle || "",
      series: m.series || "", authorName, legalName: m.legalName || "(private)",
      illustratorName: m.illustratorName || "",
      publisher: pub.copyright?.publisher || "Little Amour Books",
      imprint: m.imprint || pub.copyright?.publisher || "Little Amour Books",
      copyrightOwner: pub.copyright?.owner || authorName,
      isbn: m.isbn || pub.copyright?.isbn || "", isbnEbook: m.isbnEbook || "",
      copyrightYear: pub.copyright?.year || new Date().getFullYear(),
      trimSize: m.trimSize || '8.5" × 8.5"', pageCount: m.pageCount || String((book.pages?.length || 0) + 8),
      ageRange: m.ageRange || pub.cover?.ageRange || "Ages 3–6", gradeRange: m.gradeRange || "",
      readingLevel: m.readingLevel || "Picture book — read-aloud",
      theme: m.theme || "", shortDescription: m.shortDesc || "", longDescription: m.longDesc || pub.backCover?.blurb || "",
      authorBio: m.authorBio || pub.aboutAuthor?.bio || "",
      keywords: m.keywords || "", categories: m.categories || "", contentNotes: m.contentNotes || "",
      priceDigital: m.priceDigital || "$9.99", pricePrint: m.pricePrint || "$14.99",
      royaltySplit: m.royaltySplit || "75% author / 25% Little Amour Books",
      rightsOwner: pub.copyright?.owner || authorName,
      publicationDate: m.pubDate || "", exportDate: new Date().toISOString(),
      aiDisclosure: pub.copyright?.aiDisclosure !== false,
      marketplaceListingStatus: m.marketplaceListingStatus || "not_listed",
    };
    // Fields whose absence is worth flagging (not blocking — a tester/proof export is
    // still a valid export) before this gets treated as marketplace-ready metadata.
    const recommended = ["subtitle", "shortDescription", "longDescription", "keywords", "categories", "publicationDate", "isbn"];
    const missingFields = recommended.filter((k) => !obj[k]);
    obj.metadataStatus = missingFields.length === 0 ? "complete" : "incomplete_with_warnings";
    obj._missingFields = missingFields;
    return obj;
  };

  // Cheap, non-blocking heads-up before export: a real cover/page image that's too
  // small will print soft or blurry no matter how the PDF math works out, and the
  // author has no other way to see that until the physical book is in their hands.
  // Tiered by severity instead of one flat cutoff, and every finding is collected
  // (not just logged) so the Validation Report can show the same information instead
  // of it disappearing once the export log scrolls away.
  const checkImageDPI = (dataUrl, label, trimIn = 8.5, findings = [], dpiResults = []) =>
    new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith("data:")) {
        const msg = `${label} is missing — this page will use a plain background instead of artwork.`;
        addLog(`  ⚠ ${msg}`);
        findings.push({ level: "warn", area: label, message: msg });
        dpiResults.push({ label, dpi: null, printQualityStatus: "warning" });
        return resolve();
      }
      const img = new window.Image();
      img.onload = () => {
        const dpi = Math.min(img.naturalWidth, img.naturalHeight) / trimIn;
        const dims = `${img.naturalWidth}×${img.naturalHeight}px — about ${Math.round(dpi)} DPI at ${trimIn}"`;
        // printQualityStatus is the structured counterpart to the human-readable finding
        // below — "good" | "warning" | "low_resolution" — so the Validation Report can
        // show one honest aggregate instead of forcing someone to read every line.
        let pq = "good";
        if (dpi < 150) {
          pq = "low_resolution";
          const msg = `${label} is ${dims}. This is well below print quality and will likely look noticeably blurry or pixelated once printed — not print-ready as-is.`;
          addLog(`  ⚠ ${msg}`);
          findings.push({ level: "warn", area: label, message: msg });
        } else if (dpi < 200) {
          pq = "warning";
          const msg = `${label} is ${dims}. Low print resolution — may print blurry.`;
          addLog(`  ⚠ ${msg}`);
          findings.push({ level: "warn", area: label, message: msg });
        } else if (dpi < 300) {
          pq = "warning";
          const msg = `${label} is ${dims}. Good digital quality, but may not be optimal for professional print (300 DPI recommended — ${Math.round(trimIn * 300)}×${Math.round(trimIn * 300)}px or larger).`;
          addLog(`  i ${msg}`);
          findings.push({ level: "info", area: label, message: msg });
        }
        dpiResults.push({ label, dpi: Math.round(dpi), printQualityStatus: pq });
        resolve();
      };
      img.onerror = () => {
        findings.push({ level: "warn", area: label, message: `${label} could not be read for a resolution check.` });
        dpiResults.push({ label, dpi: null, printQualityStatus: "warning" });
        resolve();
      };
      img.src = dataUrl;
    });

  // Pushes the customer-facing Digital Reading PDF to the private "digital-pdfs"
  // Storage bucket at "<book.id>.pdf" — the exact path api/deliver.js looks up when a
  // customer clicks their confirmation-email download link. Uses a signed upload URL
  // (api/publish-upload mints it, no secret shipped to the browser) so the actual file
  // bytes go straight to Supabase Storage and never pass through a Vercel function body
  // limit. A failure here is logged as a warning, not a hard export failure — the
  // author's local ZIP download still succeeds either way; it just means live customer
  // delivery for this book needs a retry before anyone buys it.
  const uploadDigitalPdfToStorage = async (bookId, pdfArrayBuffer) => {
    const mintRes = await fetch("/api/publish-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    const mint = await mintRes.json();
    if (!mintRes.ok || !mint.signedUrl) throw new Error(mint.error || "Could not get an upload URL.");
    const putRes = await fetch(mint.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: pdfArrayBuffer,
    });
    if (!putRes.ok) throw new Error(`Storage upload failed (${putRes.status}).`);
  };

  const runExport = async () => {
    setBusy(true); setLog([]); setFinished(false);
    const zip = new JSZip();
    const safe = ((pub.metadata?.title || book.title) || "Book").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
    const root = zip.folder(`${safe}_Final_Export`);
    // Every check below pushes into this instead of just logging, so the same findings
    // drive the Validation Report (PASS / PASS WITH WARNINGS / FAIL) at the end —
    // one source of truth instead of the log and the report drifting apart.
    const findings = [];
    try {
      const pgs0 = book.pages || [];
      if (pgs0.length === 0) {
        findings.push({ level: "fail", area: "Pages", message: "This book has no story pages — there is nothing to export." });
      }
      addLog("Checking image resolution…");
      const dpiResults = [];
      await checkImageDPI(pub.cover?.coverImageUrl, "Cover image", 8.5, findings, dpiResults);
      // Unlike the front cover, a missing back cover image is a normal, supported
      // state (text blurb instead) — only run the check, and only then risk a finding,
      // when the author actually uploaded one.
      if (pub.backCover?.backCoverImageUrl && pub.backCover.backCoverImageUrl.startsWith("data:")) {
        await checkImageDPI(pub.backCover.backCoverImageUrl, "Back cover image", 8.5, findings, dpiResults);
      }
      for (let i = 0; i < pgs0.length; i++) await checkImageDPI(pgs0[i].img, `Page ${i + 1} image`, 8.5, findings, dpiResults);

      addLog("Building customer digital files…");
      const cust = root.folder("Customer_Digital_Files");

      addLog("  Digital reading PDF…");
      const dPDF = await makeBookPDF(false);
      const dPDFBytes = dPDF.output("arraybuffer");
      cust.file(`${safe}_Digital_Reading.pdf`, dPDFBytes);

      addLog("  Uploading customer download copy…");
      try {
        await uploadDigitalPdfToStorage(book.id, dPDFBytes);
        addLog("  ✓ Live download file updated — buyers' email links will serve this version.");
      } catch (e) {
        addLog(`  ⚠ Couldn't update the live download file (${e.message}). The ZIP below is still correct — re-run export to retry delivery.`);
        findings.push({ level: "warn", area: "Delivery", message: `Live digital-delivery upload failed: ${e.message}. Customers using the emailed download link won't get this book until a re-export succeeds.` });
      }

      addLog("  Printable PDF…");
      const pPDF = await makeBookPDF(false, true);
      cust.file(`${safe}_Printable.pdf`, pPDF.output("arraybuffer"));

      addLog("  EPUB placeholder…");
      const labEmailForEpub = pub.aboutLAB?.email || "hello@littleamour.com";
      cust.file(`${safe}_Kindle_EPUB_coming_soon.txt`,
        `EPUB / Kindle version for "${pub.metadata?.title || book.title}" is coming soon.\n\n` +
        `IN THE MEANTIME — SEND TO KINDLE:\n` +
        `1. In your Amazon account, go to Manage Your Content and Devices -> Preferences -> Personal Document Settings.\n` +
        `2. Add your email to the Approved Personal Document Email List.\n` +
        `3. Email the Digital Reading PDF (in this same folder) as an attachment to your Kindle address with subject line: convert\n\n` +
        `KNOWN LIMITATIONS:\nThis is a PDF sent to Kindle, not a true reflowable EPUB — text won't resize/reflow on Kindle the way a real ebook does, and some Kindle devices render PDFs as fixed-layout images. A full EPUB version is on the way.\n\n` +
        `SUPPORT:\nQuestions? Email ${labEmailForEpub}.\n\nLittle Amour Books — books written with love, read with feeling.`);

      addLog("  Read Me First PDF…");
      const labUrl = pub.aboutLAB?.website || "littleamour.com";
      const labEmail = pub.aboutLAB?.email || "hello@littleamour.com";
      const rPDF = makeTextPDF("Read Me First 🌙", [
        `Welcome to your copy of "${pub.metadata?.title || book.title}"`,
        "", "OPENING YOUR PDF",
        "Open the Digital Reading PDF in any PDF viewer — Adobe Acrobat, Preview (Mac), or your browser.",
        "", "PRINTING AT HOME",
        "Print the Printable PDF on standard 8.5\" × 8.5\" or Letter paper. Use the highest quality setting and enable 'Fit to page'.",
        "", "SENDING TO KINDLE",
        "1. In your Amazon account, go to Manage Your Content and Devices → Preferences → Personal Document Settings.",
        "2. Add your email to the Approved Personal Document Email List.",
        "3. Email your PDF as an attachment to your Kindle email address. Subject line: convert",
        "", "YOUR LICENCE",
        "Licensed for personal, non-commercial use only. Please do not reproduce, redistribute, or resell.",
        "", "SUPPORT", `Visit ${labUrl} or email ${labEmail} with any questions.`,
        "", "Thank you for supporting a survivor author. Every purchase matters.",
      ]);
      cust.file("Read_Me_First.pdf", rPDF.output("arraybuffer"));

      addLog("Building publisher print files…");
      const print = root.folder("Publisher_Print_Files");

      addLog("  Interior print-ready PDF…");
      const iPDF = await makeBookPDF(true);
      print.file("Interior_Print_Ready.pdf", iPDF.output("arraybuffer"));
      // Computed once here (right after the page count is actually known) and reused
      // everywhere downstream that needs it — the cover spread's spine math and the
      // metadata sheet both depend on this being the real count, not the author's
      // earlier guess.
      const realPageCount = iPDF.internal.getNumberOfPages();
      // KDP's own spine-width formula (~0.0025in per page on standard white/cream
      // paper for an 8.5x8.5 picture book). Below about 0.0625in (roughly 24-25 pages
      // at this rate) the spine is too thin for KDP to print legible text on safely —
      // most picture books (24-32 pages) fall well under that line, which is exactly
      // why there's no dedicated "spine text" field in the builder: for the vast
      // majority of these books, asking for spine text would be asking for something
      // that can't actually print. Longer books still get an accurate estimate here.
      const estSpineIn = realPageCount * 0.0025;
      const spineTextFits = estSpineIn >= 0.0625;

      addLog("  Cover print files…");
      const cv = pub.cover || {};
      const bc = pub.backCover || {};
      // Previously both "full cover" files were pure text descriptions of a spread
      // that didn't exist — neither real art nor an honestly-labeled mockup. This
      // builds an actual front/spine/back layout: the real front cover art (if the
      // author has one) goes in the front panel at true size, and the spine/back —
      // which we have no real art for — are explicitly banner-labeled as placeholder
      // so nobody mistakes this for a finished print-ready spread.
      const hasFrontArt = !!(cv.coverImageUrl && cv.coverImageUrl.startsWith("data:"));
      const hasBackArt = !!(bc.backCoverImageUrl && bc.backCoverImageUrl.startsWith("data:"));
      // Real estimate instead of an arbitrary fixed width — at typical picture-book
      // length the true spine is under a millimetre, nowhere near wide enough to
      // safely print text, so the box is drawn at (roughly) the width it will actually
      // be rather than a guess that implies more room than there is.
      const spineMm = Math.max(1.2, estSpineIn * 25.4);
      // Shared aspect-preserving placement for the spread's front/back art panels.
      // These panels previously called doc.addImage with the panel's fixed width/height
      // and nothing else — a plain stretch with no regard for the source image's real
      // aspect ratio, distorting (squishing/stretching) any art that wasn't already
      // exactly panel-shaped. This fits the whole image inside the panel instead,
      // centered, undistorted, same "contain" reasoning used everywhere else real
      // finished art gets drawn into a box it might not exactly match.
      const drawContainFit = (doc, dataUrl, fmt, boxX, boxY, boxW, boxH) => {
        let dW = boxW, dH = boxH, dX = boxX, dY = boxY;
        try {
          const props = doc.getImageProperties(dataUrl);
          if (props && props.width && props.height) {
            const srcRatio = props.width / props.height;
            const boxRatio = boxW / boxH;
            if (srcRatio > boxRatio) { dW = boxW; dH = boxW / srcRatio; }
            else { dH = boxH; dW = boxH * srcRatio; }
            dX = boxX + (boxW - dW) / 2;
            dY = boxY + (boxH - dH) / 2;
          }
        } catch (e) { /* couldn't read dimensions — fall back to filling the box as-is */ }
        doc.addImage(dataUrl, fmt, dX, dY, dW, dH);
      };
      const makeCoverSpread = (withBarcode) => {
        const spineW = spineMm;
        const panelW = 215.9, panelH = 215.9;
        const totalW = panelW * 2 + spineW;
        const doc = new jsPDF({ unit: "mm", format: [totalW, panelH] });
        doc.setFillColor(250, 244, 235); doc.rect(0, 0, totalW, panelH, "F");
        doc.setFillColor(255, 224, 102); doc.rect(0, 0, totalW, 11, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(40, 30, 10);
        // Banner only calls out what's actually still placeholder — spine width here is
        // a real estimate from the real page count, not a guess that implies more room
        // than there is.
        const bannerBits = [
          hasFrontArt ? "front cover art is final" : "front cover is a placeholder",
          hasBackArt ? "back cover art is final" : "back cover is a placeholder",
          spineTextFits ? "spine width is an estimate - exact width is printer-calculated at submission" : `spine is too thin for text at ${realPageCount} pages (est. ${estSpineIn.toFixed(3)}in) - leave it blank`,
        ];
        doc.text(`PLACEHOLDER SPREAD - ${bannerBits.join("; ")}.`, totalW / 2, 7, { align: "center", maxWidth: totalW - 10 });

        // Back panel — real back cover art if the author uploaded one, otherwise the
        // text-based placeholder built from the Back Cover Builder fields.
        if (hasBackArt) {
          try {
            const fmt = bc.backCoverImageUrl.includes("png") ? "PNG" : "JPEG";
            drawContainFit(doc, bc.backCoverImageUrl, fmt, 0, 13, panelW, panelH - 15);
          } catch (e) {
            doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(80, 70, 90);
            doc.text("BACK COVER - image unavailable", panelW / 2, panelH / 2, { align: "center" });
          }
        } else {
          doc.setDrawColor(180, 170, 190);
          doc.rect(2, 13, panelW - 4, panelH - 15);
          doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(80, 70, 90);
          doc.text("BACK COVER - placeholder", panelW / 2, panelH / 2 - 14, { align: "center" });
          doc.setFont("helvetica", "normal"); doc.setFontSize(9);
          doc.text(cleanText(`Title: ${cv.title || book.title || ""}`), panelW / 2, panelH / 2 - 2, { align: "center" });
          if (bc.blurb) {
            const bl = doc.splitTextToSize(cleanText(bc.blurb), panelW - 30);
            doc.text(bl, panelW / 2, panelH / 2 + 10, { align: "center" });
          }
        }
        if (withBarcode) {
          doc.setDrawColor(80, 70, 90); doc.setFillColor(250, 244, 235);
          doc.rect(panelW - 47, panelH - 35, 37, 22, hasBackArt ? "FD" : "S");
          doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(80, 70, 90);
          doc.text("BARCODE AREA RESERVED", panelW - 28.5, panelH - 23, { align: "center" });
          doc.text(cleanText(`ISBN: ${pub.copyright?.isbn || bc.isbn || "TBD"}`), panelW - 28.5, panelH - 19, { align: "center" });
        }

        // Spine — width is a real estimate; text is only suggested once the estimate
        // says it'd actually be legible. Most picture books (24-32 pages) land well
        // under that line, which is why this isn't a separate input anywhere upstream —
        // a spine-text field would be offering something that can't print for almost
        // every book that comes through here.
        doc.setFillColor(235, 226, 240); doc.rect(panelW, 13, spineW, panelH - 15, "F");
        if (spineTextFits) {
          doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(80, 70, 90);
          doc.text(cleanText(cv.title || book.title || ""), panelW + spineW / 2, panelH / 2, { align: "center", angle: 90, maxWidth: panelH - 30 });
        }

        // Front panel — real cover art if we have it, otherwise an honest placeholder box
        const fx = panelW + spineW;
        if (hasFrontArt) {
          try {
            const fmt = cv.coverImageUrl.includes("png") ? "PNG" : "JPEG";
            drawContainFit(doc, cv.coverImageUrl, fmt, fx, 13, panelW, panelH - 15);
          } catch (e) {
            doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(80, 70, 90);
            doc.text("FRONT COVER - image unavailable", fx + panelW / 2, panelH / 2, { align: "center" });
          }
        } else {
          doc.setDrawColor(180, 170, 190); doc.rect(fx + 2, 13, panelW - 4, panelH - 15);
          doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(80, 70, 90);
          doc.text("FRONT COVER - placeholder (no cover art uploaded)", fx + panelW / 2, panelH / 2, { align: "center", maxWidth: panelW - 20 });
        }
        return doc;
      };

      const cwb = makeCoverSpread(true);
      print.file("Full_Cover_With_Barcode.pdf", cwb.output("arraybuffer"));
      const cnb = makeCoverSpread(false);
      print.file("Full_Cover_No_Barcode.pdf", cnb.output("arraybuffer"));
      if (hasFrontArt && hasBackArt) {
        findings.push({ level: "info", area: "Cover spread", message: "Front and back panels both use your real cover art; spine width is still printer-calculated placeholder and must be finalized before print submission." });
      } else if (hasFrontArt || hasBackArt) {
        findings.push({ level: "info", area: "Cover spread", message: `${hasFrontArt ? "Front" : "Back"} panel uses your real cover art; the ${hasFrontArt ? "back panel and spine" : "front panel and spine"} are still placeholders and must be finished before print submission.` });
      } else {
        findings.push({ level: "warn", area: "Cover spread", message: "No cover art uploaded for front or back — the full cover spread files are placeholders only, not print-ready." });
      }
      // Structured counterpart to the findings above, for the Validation Report —
      // one of four honest states instead of a single pass/fail bit. Missing spine
      // data is its own state because real front+back art with a too-thin spine is a
      // different problem (waiting on page count/printer) than missing art entirely.
      const coverStatus = (!hasFrontArt && !hasBackArt) ? "placeholder_cover_sheet"
        : (hasFrontArt && !hasBackArt) ? "front_cover_only"
        : (!spineTextFits) ? "needs_spine_data"
        : "final_full_cover";

      addLog("Building metadata files…");
      const meta = root.folder("Metadata");
      const mObj = metaObj();
      // realPageCount was computed right after the interior PDF was built, above —
      // the author-entered page count is just a pre-export guess; this is the truth.
      if (pub.metadata?.pageCount && String(pub.metadata.pageCount) !== String(realPageCount)) {
        findings.push({ level: "info", area: "Metadata", message: `Page count auto-corrected to ${realPageCount} (counted from the actual interior PDF) — the entered value was ${pub.metadata.pageCount}.` });
      }
      mObj.pageCount = String(realPageCount);
      // Missing recommended fields don't fail the export (a tester/proof book is still
      // a valid export) but they do need to be visible somewhere other than silently
      // blank cells in the sheet — surfaced as a warning here so it shows in the same
      // Validation Report as every other finding.
      const missingMeta = mObj._missingFields || [];
      delete mObj._missingFields;
      if (missingMeta.length) {
        findings.push({ level: "warn", area: "Metadata", message: `Missing recommended metadata field(s): ${missingMeta.join(", ")}. Not blocking, but fill these in before a real marketplace listing — they directly affect discoverability.` });
      }
      meta.file("Metadata_Sheet.json", JSON.stringify(mObj, null, 2));
      const mPDF = makeTextPDF("Metadata Sheet", Object.entries(mObj).map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").trim()}: ${v}`));
      meta.file("Metadata_Sheet.pdf", mPDF.output("arraybuffer"));
      // Rights_Checklist.json — a real internal legal/approval record, not just a few
      // pre-checked lines. hasFrontArt/hasBackArt/realPageCount are already known at
      // this point in runExport (computed for the cover spread above), and findings-so-
      // far tells us whether anything is fail-level before distribution permission is
      // granted. Plain "[x]"/"[ ]" text in the PDF, not checkbox glyphs — those are the
      // ones that turn into broken symbols across PDF viewers.
      const hasFailSoFar = findings.some((f) => f.level === "fail");
      const rightsObj = {
        bookTitle: mObj.title,
        authorLegalName: mObj.legalName,
        authorDisplayName: mObj.authorName,
        penName: pub.cover?.penName || (mObj.legalName && mObj.legalName !== mObj.authorName ? mObj.authorName : ""),
        copyrightOwner: mObj.copyrightOwner,
        publisher: mObj.publisher,
        imprint: mObj.imprint,
        textRightsConfirmed: true,
        illustrationRightsConfirmed: true,
        coverRightsConfirmed: hasFrontArt,
        aiAssistedCreationDisclosure: mObj.aiDisclosure,
        fontLicenseStatus: "standard_system_fonts",
        imageAssetStatus: hasFrontArt && hasBackArt ? "complete" : (hasFrontArt || hasBackArt) ? "partial" : "missing",
        authorBioApproval: !!mObj.authorBio,
        coverApproval: hasFrontArt,
        interiorApproval: realPageCount > 0,
        printDistributionPermission: !hasFailSoFar,
        digitalDistributionPermission: !hasFailSoFar,
        marketplacePermission: mObj.marketplaceListingStatus === "listed",
        ISBNStatus: mObj.isbn ? "assigned" : "not_assigned_yet",
        barcodeStatus: mObj.isbn ? "ready_for_real_barcode" : "reserved_area_isbn_tbd",
        approvalDate: "",
        approvedBy: "",
        internalNotes: "",
      };
      if (!rightsObj.approvalDate && !rightsObj.approvedBy) {
        findings.push({ level: "warn", area: "Rights", message: "No internal approval recorded yet (approvedBy/approvalDate blank). Fine for a draft/test/proof export — fill this in before a marketplace launch." });
      }
      const rPDF2 = makeTextPDF("Rights & Permissions Checklist", [
        `Book: ${rightsObj.bookTitle}`,
        `Author (legal name): ${rightsObj.authorLegalName}`,
        `Author (display${rightsObj.penName ? "/pen name" : " name"}): ${rightsObj.authorDisplayName}`,
        `Copyright owner: ${rightsObj.copyrightOwner}`,
        `Publisher: ${rightsObj.publisher}`, `Imprint: ${rightsObj.imprint}`,
        "",
        `${rightsObj.textRightsConfirmed ? "[x]" : "[ ]"} Text rights confirmed`,
        `${rightsObj.illustrationRightsConfirmed ? "[x]" : "[ ]"} Illustration rights confirmed`,
        `${rightsObj.coverRightsConfirmed ? "[x]" : "[ ]"} Cover rights confirmed`,
        `${rightsObj.aiAssistedCreationDisclosure ? "[x]" : "[ ]"} AI-assisted creation disclosed`,
        `${rightsObj.authorBioApproval ? "[x]" : "[ ]"} Author bio approved`,
        `${rightsObj.coverApproval ? "[x]" : "[ ]"} Cover approved`,
        `${rightsObj.interiorApproval ? "[x]" : "[ ]"} Interior approved`,
        `${rightsObj.printDistributionPermission ? "[x]" : "[ ]"} Print distribution permitted`,
        `${rightsObj.digitalDistributionPermission ? "[x]" : "[ ]"} Digital distribution permitted`,
        `${rightsObj.marketplacePermission ? "[x]" : "[ ]"} Marketplace (Amazon/KDP) listing permitted`,
        "",
        `Font license status: ${rightsObj.fontLicenseStatus}`,
        `Image asset status: ${rightsObj.imageAssetStatus}`,
        `ISBN status: ${rightsObj.ISBNStatus}`,
        `Barcode status: ${rightsObj.barcodeStatus}`,
        "",
        `Approval date: ${rightsObj.approvalDate || "(not yet approved)"}`,
        `Approved by: ${rightsObj.approvedBy || "(not yet approved)"}`,
        "", "Rights statement:", pub.copyright?.rights || "All rights reserved.",
      ]);
      meta.file("Rights_Checklist.json", JSON.stringify(rightsObj, null, 2));
      meta.file("Rights_Checklist.pdf", rPDF2.output("arraybuffer"));

      addLog("Building source archive…");
      const arch = root.folder("Source_Archive");
      arch.file("Project_File.json", JSON.stringify({ version: "1.0", exportedAt: new Date().toISOString(), book, publishing: pub, metadata: mObj }, null, 2));
      arch.file("Final_Text.txt", (book.pages || []).map((p, i) => `PAGE ${i + 1}\n${p.text || "(image only)"}`).join("\n\n---\n\n"));
      if (book.characters?.length) {
        const cpdf = makeTextPDF("Character Profiles", book.characters.flatMap(c => [`CHARACTER: ${c.name}`, c.desc || c.description || "(no description)", ""]));
        arch.file("Character_Profiles.pdf", cpdf.output("arraybuffer"));
      }
      if (book.styleGuide) arch.file("Style_Guide.txt", book.styleGuide);
      const imgs = arch.folder("Image_Assets");
      if (cv.coverImageUrl && cv.coverImageUrl.startsWith("data:")) {
        const cext = cv.coverImageUrl.includes("png") ? "png" : "jpg";
        imgs.file(`cover.${cext}`, cv.coverImageUrl.split(",")[1], { base64: true });
      }
      if (pub.backCover?.backCoverImageUrl && pub.backCover.backCoverImageUrl.startsWith("data:")) {
        const bext = pub.backCover.backCoverImageUrl.includes("png") ? "png" : "jpg";
        imgs.file(`back_cover.${bext}`, pub.backCover.backCoverImageUrl.split(",")[1], { base64: true });
      }
      (book.pages || []).forEach((p, i) => {
        if (p.img?.startsWith("data:")) {
          const ext = p.img.includes("png") ? "png" : "jpg";
          imgs.file(`page_${String(i+1).padStart(2,"0")}.${ext}`, p.img.split(",")[1], { base64: true });
        }
      });
      // Metadata and rights live in their own folder too, but the Source Archive is
      // meant to be a complete, self-contained record of the book on its own —
      // duplicating these small files here means nobody has to dig through the rest of
      // the bundle to find them later.
      arch.file("Metadata_Sheet.json", JSON.stringify(mObj, null, 2));
      arch.file("Rights_Checklist.json", JSON.stringify(rightsObj, null, 2));

      // Validation Report — the one file that tells the truth about whether this
      // export is actually done, instead of leaving the author to notice a low-res
      // image or a missing page on their own after it's already printed. Built from
      // every finding collected above, not a separate pass that could drift from them.
      addLog("Running validation…");
      const hasFail = findings.some(f => f.level === "fail");
      const hasWarn = findings.some(f => f.level === "warn");
      const status = hasFail ? "FAIL" : hasWarn ? "PASS WITH WARNINGS" : "PASS";
      // Aggregate of every individual page/cover DPI check, for a single honest
      // headline number instead of making someone scan every page's finding.
      const printQualityStatus = dpiResults.some(d => d.printQualityStatus === "low_resolution") ? "low_resolution"
        : dpiResults.some(d => d.printQualityStatus === "warning") ? "warning" : "good";
      // PASS WITH WARNINGS is a real, usable export (a tester/proof book), but it is
      // not the same thing as a clean professional final — the export status label
      // says so explicitly instead of letting "Final Export" cover both cases.
      const exportStatus = status === "FAIL" ? "Draft Export — Failed Validation"
        : status === "PASS WITH WARNINGS" ? "Proof Export — Warnings Present"
        : "Final Export";
      const valReport = {
        status, exportStatus, printQualityStatus, coverStatus,
        printQualityDetail: dpiResults,
        generatedAt: new Date().toISOString(), book: mObj.title,
        checks: findings.length ? findings : [{ level: "info", area: "Overall", message: "No issues found." }],
      };
      const val = root.folder("Validation");
      val.file("Validation_Report.json", JSON.stringify(valReport, null, 2));
      const vPDF = makeTextPDF("Validation Report", [
        `STATUS: ${status}`, `Book: ${mObj.title}`, `Generated: ${valReport.generatedAt}`, "",
        ...valReport.checks.map(f => `[${f.level.toUpperCase()}] ${f.area}: ${f.message}`),
      ]);
      val.file("Validation_Report.pdf", vPDF.output("arraybuffer"));
      addLog(status === "FAIL" ? "✗ Validation FAILED — see Validation Report." : status === "PASS WITH WARNINGS" ? "⚠ Validation passed with warnings — see Validation Report." : "✓ Validation passed.");

      addLog("Packaging ZIP…");
      // A FAILED validation never gets to call itself a "Final Export", and a
      // warnings-heavy pass doesn't get to call itself a clean one either — the
      // filename says exactly which of the three this is, since that's the one thing
      // the author will see before ever opening the ZIP.
      const zipLabel = status === "FAIL" ? `${safe}_INCOMPLETE_NOT_FINAL`
        : status === "PASS WITH WARNINGS" ? `${safe}_Proof_Export`
        : `${safe}_Final_Export`;
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${zipLabel}.zip`; a.click();
      URL.revokeObjectURL(url);

      if (status === "PASS WITH WARNINGS") {
        setPub(p => ({ ...p, digitalPdfDone: true, printPdfDone: true, exportedAt: new Date().toISOString(), exportStatus }));
        done("digital_pdf"); done("print_pdf"); done("epub");
        addLog("⚠ Proof Export complete — ZIP downloaded (warnings present, see Validation Report).");
        setFinished("warn");
      } else if (status !== "FAIL") {
        setPub(p => ({ ...p, digitalPdfDone: true, printPdfDone: true, exportedAt: new Date().toISOString(), exportStatus }));
        done("digital_pdf"); done("print_pdf"); done("epub");
        addLog("✓ Final Export complete — ZIP downloaded!");
        setFinished(true);
      } else {
        addLog("✗ Export built but did NOT pass validation — not marked Final Export. Fix the issues in the Validation Report and re-run.");
        setFinished("fail");
      }
    } catch(e) {
      addLog("✗ Error: " + e.message);
      setFinished("fail");
    }
    setBusy(false);
  };

  const MANIFEST = [
    ["📱", "Digital Reading PDF", "Screen-optimised, no crop marks"],
    ["🖨", "Printable PDF", "Home printing with personal-use note"],
    ["📚", "EPUB placeholder", "Kindle instructions included (full EPUB coming soon)"],
    ["📄", "Read Me First PDF", "Customer guide for all file types"],
    ["🖨", "Interior Print-Ready PDF", "With bleed and page numbers"],
    ["🎨", "Full Cover — with & without barcode", "Print spread placeholders"],
    ["📋", "Metadata Sheet", "JSON + PDF for marketplace listings"],
    ["✅", "Rights Checklist", "Internal legal record"],
    ["💾", "Source Archive", "Project JSON, full text, all image assets, cover + rights data"],
    ["🛡", "Validation Report", "PASS / PASS WITH WARNINGS / FAIL — JSON + PDF"],
  ];

  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>Export & Publish</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 22 }}>One ZIP with everything — digital sales files, print-ready files, metadata, and source archive.</p>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 22 }}>
        {MANIFEST.map(([icon, name, desc]) => (
          <div key={name} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <span style={{ color: C.cream, fontSize: 14 }}>{name}</span>
            <span style={{ color: C.muted, fontSize: 13 }}> — {desc}</span>
          </div>
        ))}
      </div>
      <button onClick={runExport} disabled={busy} style={{ ...btn("gold"), fontSize: 15, padding: "12px 28px", opacity: busy ? 0.65 : 1 }}>
        {busy ? "Building package…" : "📦 Generate & Download Export Package"}
      </button>
      {log.length > 0 && (
        <div style={{ marginTop: 16, background: C.ink, borderRadius: 8, padding: "14px 16px", fontFamily: "monospace", fontSize: 12 }}>
          {log.map((l, i) => <div key={i} style={{ color: l.startsWith("✓") ? C.green : l.startsWith("✗") ? C.red : C.muted, marginBottom: 2 }}>{l}</div>)}
        </div>
      )}
      {finished === "fail" && (
        <div style={{ marginTop: 16, background: "#3a1a1a", border: `1px solid ${C.red}`, borderRadius: 8, padding: "14px 18px" }}>
          <p style={{ color: C.red, fontWeight: 700, marginBottom: 4 }}>✗ Export built, but did not pass validation</p>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>The ZIP downloaded but is named "INCOMPLETE_NOT_FINAL" and is not marked as your finished export. Open Validation/Validation_Report.pdf inside it to see what to fix, then re-run.</p>
        </div>
      )}
      {finished === "warn" && (
        <div style={{ marginTop: 16, background: "#3a2f14", border: `1px solid ${C.gold}`, borderRadius: 8, padding: "14px 18px" }}>
          <p style={{ color: C.gold, fontWeight: 700, marginBottom: 4 }}>⚠ Proof Export downloaded — warnings present</p>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>The ZIP is named "_Proof_Export", not "_Final_Export" — it passed, but with warnings (low resolution, missing metadata, or a placeholder cover/spine). That's normal for a tester or proof copy. Open Validation/Validation_Report.pdf to see exactly what's flagged before treating this as a clean, marketplace-ready final.</p>
        </div>
      )}
      {finished === true && (
        <div style={{ marginTop: 16, background: "#1a3a2a", border: `1px solid ${C.green}`, borderRadius: 8, padding: "14px 18px" }}>
          <p style={{ color: C.green, fontWeight: 700, marginBottom: 4 }}>✓ Final Export downloaded — clean pass</p>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Check Downloads for the ZIP. Customer files, print files, metadata, source archive, and a validation report are all inside.</p>
        </div>
      )}
    </div>
  );
}

/* ── PRODUCT LISTING GENERATOR ── */
function ProductListingGenerator({ pub, book }) {
  const TONES = ["gentle", "polished", "emotional", "commercial", "trauma-informed", "playful"];
  const [tone, setTone] = useState("warm");
  const [listing, setListing] = useState(null);
  const [gen, setGen] = useState(false);
  const [copied, setCopied] = useState("");

  const generate = async () => {
    setGen(true);
    const m = pub.metadata || {};
    const text = await callAmora(
      `Generate marketplace product copy for this children's book. Tone: ${tone}.
Title: ${m.title || book.title}
Author: ${m.authorName || pub.cover?.authorName}
Age range: ${m.ageRange || "Ages 3–6"}
Theme: ${m.theme || ""}
Back cover blurb: ${pub.backCover?.blurb || ""}
Return ONLY valid JSON:
{"productTitle":"...","shortDescription":"...","longDescription":"...","socialCaption":"...","emailAnnouncement":"...","websiteCopy":"...","keywords":"..."}`, 900);
    try {
      const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      setListing(j);
    } catch { setListing({ error: "Couldn't parse — try again." }); }
    setGen(false);
  };

  const copyItem = (key, val) => { navigator.clipboard.writeText(val); setCopied(key); setTimeout(() => setCopied(""), 2000); };

  const FIELDS = [["productTitle","Product Title"],["shortDescription","Short Description"],["longDescription","Long Description"],["socialCaption","Social Caption"],["emailAnnouncement","Email Announcement"],["websiteCopy","Website Copy"],["keywords","Keywords"]];

  return (
    <div>
      <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>Product Listing Generator</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>Amora writes marketplace copy in any tone — Amazon, website, email, and social.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {TONES.map(t => <button key={t} onClick={() => setTone(t)} style={{ ...btn(t === tone ? "mauve" : "ghost"), fontSize: 12, padding: "5px 11px", textTransform: "capitalize" }}>{t}</button>)}
      </div>
      <ABtn label={`Generate ${tone} listing copy`} onClick={generate} loading={gen} />
      {listing && !listing.error && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {FIELDS.map(([key, label]) => listing[key] ? (
            <div key={key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
                <button onClick={() => copyItem(key, listing[key])} style={{ ...btn("ghost"), fontSize: 11, padding: "3px 8px" }}>{copied === key ? "✓ Copied" : "Copy"}</button>
              </div>
              <p style={{ color: C.cream, fontSize: 14, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{listing[key]}</p>
            </div>
          ) : null)}
        </div>
      )}
      {listing?.error && <p style={{ color: C.red, marginTop: 10 }}>{listing.error}</p>}
    </div>
  );
}

/* ── CHECKLIST SIDEBAR ── */
function ChecklistSidebar({ completed, setTab, tab }) {
  const done = CHECKLIST.filter(i => completed.has(i.id)).length;
  const pct = Math.round((done / CHECKLIST.length) * 100);
  const canPublish = CHECKLIST.filter(i => i.required).every(i => completed.has(i.id));
  return (
    <div style={{ width: 236, minWidth: 236, background: C.ink, borderRight: `1px solid ${C.border}`, padding: "22px 14px", overflowY: "auto" }}>
      <p style={{ color: C.mauve, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Publishing Progress</p>
      <div style={{ background: C.border, borderRadius: 4, height: 5, marginBottom: 5 }}>
        <div style={{ background: pct === 100 ? C.green : C.gold, height: 5, borderRadius: 4, width: `${pct}%`, transition: "width 0.4s" }} />
      </div>
      <p style={{ color: C.muted, fontSize: 11, marginBottom: 18 }}>{done} of {CHECKLIST.length} complete</p>
      {CHECKLIST.map(item => (
        <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 9 }}>
          <div style={{ width: 17, height: 17, borderRadius: "50%", background: completed.has(item.id) ? C.green : C.border, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
            {completed.has(item.id) && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
          </div>
          <span style={{ color: completed.has(item.id) ? C.muted : C.cream, fontSize: 12, lineHeight: 1.4, opacity: completed.has(item.id) ? 0.55 : 1 }}>
            {item.label}{item.required && !completed.has(item.id) && <span style={{ color: C.rose }}> *</span>}
          </span>
        </div>
      ))}
      {canPublish && <div style={{ marginTop: 16, background: "#1a3a2a", border: `1px solid ${C.green}`, borderRadius: 8, padding: "10px 12px" }}><p style={{ color: C.green, fontWeight: 700, fontSize: 12, margin: 0 }}>✓ Ready to publish</p></div>}
    </div>
  );
}


/* ── FINAL APPROVAL GATE ── */
function FinalApprovalGate({ onApprove }) {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ background: C.cardAlt, border: `1.5px solid ${C.mauve}44`, borderRadius: 10, padding: "16px 20px", marginBottom: 14 }}>
        <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop: 3, flexShrink: 0, accentColor: C.mauve, width: 16, height: 16 }} />
          <span style={{ color: C.cream, fontSize: 14, lineHeight: 1.75 }}>
            I understand that once this book is approved and published, Little Amour Books may continue selling and distributing the book as part of its catalog. I cannot require Little Amour Books to remove the book or take the completed Little Amour Books edition elsewhere except as permitted by the Publishing Agreement.
          </span>
        </label>
      </div>
      <button onClick={onApprove} disabled={!checked}
        style={{ ...btn("green"), opacity: checked ? 1 : 0.4, cursor: checked ? "pointer" : "not-allowed" }}>
        ✓ Approve & Mark Ready to Publish
      </button>
      {!checked && <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>Please confirm the checkbox above before approving.</p>}
    </div>
  );
}

/* ── TABS ── */
const TABS = [
  { id: "checklist",    label: "📋 Checklist" },
  { id: "cover",        label: "🎨 Front Cover" },
  { id: "backcover",    label: "📖 Back Cover" },
  { id: "dedication",   label: "💌 Dedication" },
  { id: "about_author", label: "👤 About Author" },
  { id: "about_lab",    label: "🌙 About Us" },
  { id: "copyright",    label: "© Copyright" },
  { id: "metadata",     label: "🗂 Metadata" },
  { id: "sellas",       label: "🛍 Sell As" },
  { id: "export",       label: "📦 Export" },
  { id: "listing",      label: "🛒 Listing Copy" },
];

/* ── MAIN MODULE ── */
export default function PublishingModule({ book, setBook, author, collection, onBack }) {
  const [tab, setTab] = useState("checklist");
  const [pub, setPubRaw] = useState(book.publishing || {});
  const [completed, setCompleted] = useState(() => new Set(book.publishingCompleted || []));
  // Tab bar scroll handling. The bar has more steps (10 tabs + Back) than fit most
  // screen widths, so it needs to scroll horizontally — but a plain overflowX:auto strip
  // gives no visible cue that it scrolls, and a mouse wheel (which scrolls vertically by
  // default) does nothing on it, which reads as "this doesn't move" even though the CSS
  // technically supports scrolling. Fixed with: a wheel handler that redirects normal
  // vertical scroll input into horizontal movement, plus explicit ◀ ▶ arrow buttons that
  // always work regardless of input device, and disable themselves at each end so it's
  // obvious when you've reached the first/last tab.
  const tabBarRef = useRef(null);
  const [tabScroll, setTabScroll] = useState({ atStart: true, atEnd: false });
  const updateTabScroll = () => {
    const el = tabBarRef.current;
    if (!el) return;
    setTabScroll({
      atStart: el.scrollLeft <= 2,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  };
  useEffect(() => { updateTabScroll(); }, []);
  const scrollTabBar = dir => {
    const el = tabBarRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 180, behavior: "smooth" });
    setTimeout(updateTabScroll, 200);
  };
  const onTabBarWheel = e => {
    const el = tabBarRef.current;
    if (!el) return;
    // Only hijack the wheel when there's nowhere for plain vertical scroll to go anyway
    // (i.e. this is purely a horizontal strip) — and only redirect vertical intent.
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
      updateTabScroll();
    }
  };

  useEffect(() => { if (book.pages?.length > 0) markDone("pages"); }, []);

  const setPub = updater => {
    const next = typeof updater === "function" ? updater(pub) : updater;
    setPubRaw(next);
    setBook(b => ({ ...b, publishing: next }));
  };

  const markDone = id => setCompleted(s => {
    const n = new Set(s); n.add(id);
    setBook(b => ({ ...b, publishingCompleted: [...n] }));
    return n;
  });

  const markApproved = () => {
    markDone("approval");
    setBook(b => ({ ...b, status: "approved", publishingApprovedAt: new Date().toISOString() }));
  };

  const renderMain = () => {
    switch(tab) {
      case "cover":        return <CoverBuilder pub={pub} setPub={setPub} book={book} collection={collection} done={markDone} />;
      case "backcover":    return <BackCoverBuilder pub={pub} setPub={setPub} book={book} done={markDone} />;
      case "dedication":   return <DedicationBuilder pub={pub} setPub={setPub} done={markDone} />;
      case "about_author": return <AboutAuthorBuilder pub={pub} setPub={setPub} book={book} author={author} done={markDone} />;
      case "about_lab":    return <AboutLABBuilder pub={pub} setPub={setPub} done={markDone} />;
      case "copyright":    return <CopyrightBuilder pub={pub} setPub={setPub} book={book} done={markDone} />;
      case "metadata":     return <MetadataBuilder pub={pub} setPub={setPub} book={book} done={markDone} />;
      case "sellas":       return <SellAsBuilder pub={pub} setPub={setPub} book={book} done={markDone} />;
      case "export":       return <ExportCenter pub={pub} setPub={setPub} book={book} author={author} done={markDone} />;
      case "listing":      return <ProductListingGenerator pub={pub} book={book} />;
      default:
        const req = CHECKLIST.filter(i => i.required && !completed.has(i.id));
        const opt = CHECKLIST.filter(i => !i.required && !completed.has(i.id));
        const doneItems = CHECKLIST.filter(i => completed.has(i.id));
        const canPub = CHECKLIST.filter(i => i.required).every(i => completed.has(i.id));
        return (
          <div>
            <h3 style={{ color: C.cream, fontFamily: "Georgia,serif", marginBottom: 4 }}>Publishing Checklist</h3>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Complete these steps to publish. Click any item to open that section.</p>
            {req.length > 0 && <>
              <p style={{ color: C.rose, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>Required — {req.length} remaining</p>
              {req.map(item => (
                <div key={item.id} onClick={() => setTab(item.id)} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 6, cursor: "pointer" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${C.border}`, flexShrink: 0 }} />
                  <span style={{ color: C.cream, fontSize: 14, flex: 1 }}>{item.label}</span>
                  <span style={{ color: C.mauve, fontSize: 12 }}>→</span>
                </div>
              ))}
            </>}
            {opt.length > 0 && <><p style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, margin: "18px 0 10px" }}>Optional</p>
              {opt.map(item => (
                <div key={item.id} onClick={() => setTab(item.id)} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 5, cursor: "pointer", opacity: 0.75 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px dashed ${C.border}`, flexShrink: 0 }} />
                  <span style={{ color: C.muted, fontSize: 14, flex: 1 }}>{item.label}</span>
                  <span style={{ color: C.muted, fontSize: 12 }}>→</span>
                </div>
              ))}
            </>}
            {doneItems.length > 0 && <><p style={{ color: C.green, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, margin: "18px 0 8px" }}>✓ Complete — {doneItems.length} done</p>
              {doneItems.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 14px", borderRadius: 8, marginBottom: 3, opacity: 0.5 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.green, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 10 }}>✓</span></div>
                  <span style={{ color: C.muted, fontSize: 13 }}>{item.label}</span>
                </div>
              ))}
            </>}
            {canPub && (
              <div style={{ marginTop: 24, background: "#1a3a2a", border: `1px solid ${C.green}`, borderRadius: 10, padding: "18px 20px" }}>
                <p style={{ color: C.green, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>All required steps complete 🌙</p>
                <p style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>You can now mark this book as approved and ready for publishing.</p>
                {!completed.has("approval")
                  ? <FinalApprovalGate onApprove={markApproved} />
                  : <p style={{ color: C.green, fontSize: 14, margin: 0 }}>✓ Book approved — {book.publishingApprovedAt ? new Date(book.publishingApprovedAt).toLocaleDateString() : "today"}</p>
                }
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.night, fontFamily: "system-ui, sans-serif" }}>
      <ChecklistSidebar completed={completed} setTab={setTab} tab={tab} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top nav — scrollable; see scrollTabBar/onTabBarWheel above for why this
            needs explicit arrow buttons instead of relying on overflowX alone. */}
        <div style={{ background: C.ink, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "stretch", flexShrink: 0 }}>
          <button
            onClick={() => scrollTabBar(-1)}
            disabled={tabScroll.atStart}
            aria-label="Scroll tabs left"
            style={{ background: "none", border: "none", borderRight: `1px solid ${C.border}`, cursor: tabScroll.atStart ? "default" : "pointer", color: tabScroll.atStart ? C.border : C.cream, fontSize: 13, padding: "0 10px", flexShrink: 0 }}
          >◀</button>
          <div
            ref={tabBarRef}
            onScroll={updateTabScroll}
            onWheel={onTabBarWheel}
            style={{ padding: "0 16px", display: "flex", alignItems: "center", gap: 2, overflowX: "auto", scrollbarWidth: "thin", flex: 1 }}
          >
            <button onClick={onBack} style={{ color: C.muted, background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "13px 10px", whiteSpace: "nowrap", flexShrink: 0 }}>← Back to studio</button>
            <div style={{ width: 1, height: 18, background: C.border, margin: "0 4px", flexShrink: 0 }} />
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "13px 11px", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0, color: tab === t.id ? C.gold : C.muted, borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent" }}>
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollTabBar(1)}
            disabled={tabScroll.atEnd}
            aria-label="Scroll tabs right"
            style={{ background: "none", border: "none", borderLeft: `1px solid ${C.border}`, cursor: tabScroll.atEnd ? "default" : "pointer", color: tabScroll.atEnd ? C.border : C.cream, fontSize: 13, padding: "0 10px", flexShrink: 0 }}
          >▶</button>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", maxWidth: 880 }}>
          {renderMain()}
        </div>
      </div>
    </div>
  );
}
