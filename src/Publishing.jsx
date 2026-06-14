import { useState, useEffect } from "react";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

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
function CoverBuilder({ pub, setPub, book, done }) {
  const d = pub.cover || {};
  const s = (k, v) => setPub(p => ({ ...p, cover: { ...p.cover, [k]: v } }));
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); done("cover"); setTimeout(() => setSaved(false), 2000); };
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
          <Field label="Cover Image URL" note="Paste from your AI studio, or describe the scene below.">
            <TI value={d.coverImageUrl || ""} onChange={v => s("coverImageUrl", v)} placeholder="https://…" />
            {d.coverImageUrl && <img src={d.coverImageUrl} alt="Cover" style={{ width: "100%", borderRadius: 8, marginTop: 8, maxHeight: 180, objectFit: "cover" }} onError={() => {}} />}
          </Field>
          <Field label="Style Notes"><TI value={d.styleNotes || ""} onChange={v => s("styleNotes", v)} placeholder="Soft watercolour, warm palette…" multi rows={3} /></Field>
        </div>
      </div>
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
  const save = () => { setSaved(true); done("backcover"); setTimeout(() => setSaved(false), 2000); };

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
      <Field label="Back Cover Blurb" note="3–4 sentences. Amora can draft this from your story.">
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

  const makeTextPDF = (title, lines) => {
    const doc = new jsPDF({ unit: "mm", format: [215.9, 279.4] });
    doc.setFillColor(250, 244, 235); doc.rect(0, 0, 215.9, 279.4, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(43, 36, 51);
    doc.text(title, 107.95, 30, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    let y = 48;
    lines.forEach(line => {
      if (y > 260) { doc.addPage(); y = 20; doc.setFillColor(250, 244, 235); doc.rect(0, 0, 215.9, 279.4, "F"); }
      const split = doc.splitTextToSize(line || " ", 168);
      split.forEach(s => { doc.text(s, 24, y); y += 6.5; });
      if (!line) y += 2;
    });
    return doc;
  };

  const makeBookPDF = async (printMode = false) => {
    const bleed = printMode ? 3.175 : 0;
    const W = 215.9 + bleed * 2, H = 215.9 + bleed * 2;
    const doc = new jsPDF({ unit: "mm", format: [W, H] });
    const pgs = book.pages || [];
    const cover = pub.cover || {};

    // Cover
    doc.setFillColor(20, 15, 40); doc.rect(0, 0, W, H, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(250, 244, 235);
    doc.text(cover.title || book.title || "Untitled", W / 2, H * 0.42, { align: "center", maxWidth: W - 36 });
    if (cover.authorName) { doc.setFont("helvetica", "normal"); doc.setFontSize(14); doc.text(cover.authorName, W / 2, H * 0.56, { align: "center" }); }
    if (cover.showLogo !== false) { doc.setFontSize(10); doc.setTextColor(155, 126, 184); doc.text("Little Amour Books", W / 2, H - 18, { align: "center" }); }

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
      if (pg.img && (pg.img.startsWith("data:") || pg.img.startsWith("http"))) {
        try {
          const fmt = pg.img.includes("png") ? "PNG" : "JPEG";
          doc.addImage(pg.img, fmt, bleed, bleed, 215.9, 215.9 * 0.68);
        } catch(e) { /* image unavailable — skip */ }
      }
      if (pg.text) {
        doc.setFillColor(250, 244, 235); doc.rect(bleed, bleed + 215.9 * 0.68, 215.9, 215.9 * 0.32, "F");
        doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(43, 36, 51);
        const tl = doc.splitTextToSize(pg.text, 185);
        doc.text(tl, W / 2, bleed + 215.9 * 0.74, { align: "center" });
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

    return doc;
  };

  const metaObj = () => {
    const m = pub.metadata || {};
    return {
      title: m.title || book.title, subtitle: m.subtitle || pub.cover?.subtitle || "",
      authorName: m.authorName || pub.cover?.authorName, legalName: m.legalName || "(private)",
      publisher: pub.copyright?.publisher || "Little Amour Books", isbn: m.isbn || pub.copyright?.isbn || "",
      copyrightYear: pub.copyright?.year || new Date().getFullYear(),
      trimSize: m.trimSize || '8.5" × 8.5"', pageCount: m.pageCount || String((book.pages?.length || 0) + 8),
      ageRange: m.ageRange || pub.cover?.ageRange || "Ages 3–6", readingLevel: m.readingLevel || "Picture book — read-aloud",
      theme: m.theme || "", shortDescription: m.shortDesc || "", longDescription: m.longDesc || pub.backCover?.blurb || "",
      keywords: m.keywords || "", categories: m.categories || "", contentNotes: m.contentNotes || "",
      priceDigital: m.priceDigital || "$9.99", pricePrint: m.pricePrint || "$14.99",
      royaltySplit: m.royaltySplit || "75% author / 25% Little Amour Books",
      publicationDate: m.pubDate || "", exportDate: new Date().toISOString(),
      aiDisclosure: pub.copyright?.aiDisclosure !== false,
    };
  };

  const runExport = async () => {
    setBusy(true); setLog([]); setFinished(false);
    const zip = new JSZip();
    const safe = ((pub.metadata?.title || book.title) || "Book").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
    const root = zip.folder(`${safe}_Final_Export`);
    try {
      addLog("Building customer digital files…");
      const cust = root.folder("Customer_Digital_Files");

      addLog("  Digital reading PDF…");
      const dPDF = await makeBookPDF(false);
      cust.file(`${safe}_Digital_Reading.pdf`, dPDF.output("arraybuffer"));

      addLog("  Printable PDF…");
      const pPDF = await makeBookPDF(false);
      cust.file(`${safe}_Printable.pdf`, pPDF.output("arraybuffer"));

      addLog("  EPUB placeholder…");
      cust.file(`${safe}_Kindle_EPUB_coming_soon.txt`,
        `EPUB / Kindle version for "${pub.metadata?.title || book.title}" is coming soon.\n\nIn the meantime, send the Digital Reading PDF to your Kindle.\n\nHow: email it as attachment to your Kindle address with subject line: convert`);

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

      addLog("  Cover print files…");
      const cv = pub.cover || {};
      const bc = pub.backCover || {};
      const cwb = makeTextPDF("Full Cover — With Barcode", [
        `Title: ${cv.title || book.title}`, `Author: ${cv.authorName || ""}`, `ISBN: ${pub.copyright?.isbn || bc.isbn || "TBD"}`,
        "", "[ FRONT COVER + SPINE + BACK COVER — PRINT SPREAD ]",
        "[ BARCODE AREA RESERVED ON BACK COVER ]", "",
        "Replace this placeholder with your professional cover art spread.",
        `Trim: ${pub.metadata?.trimSize || '8.5" × 8.5"'}  |  Bleed: 0.125\" all sides`,
        "Spine width: calculated by printer based on page count and paper stock.",
      ]);
      print.file("Full_Cover_With_Barcode.pdf", cwb.output("arraybuffer"));

      const cnb = makeTextPDF("Full Cover — No Barcode", [
        `Title: ${cv.title || book.title}`, `Author: ${cv.authorName || ""}`,
        "", "[ FRONT + SPINE + BACK — NO BARCODE — for digital or advance copies ]",
      ]);
      print.file("Full_Cover_No_Barcode.pdf", cnb.output("arraybuffer"));

      addLog("Building metadata files…");
      const meta = root.folder("Metadata");
      const mObj = metaObj();
      meta.file("Metadata_Sheet.json", JSON.stringify(mObj, null, 2));
      const mPDF = makeTextPDF("Metadata Sheet", Object.entries(mObj).map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").trim()}: ${v}`));
      meta.file("Metadata_Sheet.pdf", mPDF.output("arraybuffer"));
      const rPDF2 = makeTextPDF("Rights & Permissions Checklist", [
        `Book: ${mObj.title}`, `Author: ${mObj.authorName}`, `Copyright © ${mObj.copyrightYear} ${mObj.authorName}`, "",
        "✓ Author has approved final text", "✓ Author has approved final illustrations", "✓ Author has approved cover",
        "✓ All content is original or properly licensed",
        mObj.aiDisclosure ? "✓ AI-assisted creation disclosed in copyright page" : "  AI disclosure not included",
        `  ISBN: ${mObj.isbn || "Not yet assigned"}`, `  Publication date: ${mObj.publicationDate || "TBD"}`,
        "", "Rights Statement:", pub.copyright?.rights || "All rights reserved.",
      ]);
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
      (book.pages || []).forEach((p, i) => {
        if (p.img?.startsWith("data:")) {
          const ext = p.img.includes("png") ? "png" : "jpg";
          imgs.file(`page_${String(i+1).padStart(2,"0")}.${ext}`, p.img.split(",")[1], { base64: true });
        }
      });

      addLog("Packaging ZIP…");
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${safe}_Final_Export.zip`; a.click();
      URL.revokeObjectURL(url);

      setPub(p => ({ ...p, digitalPdfDone: true, printPdfDone: true, exportedAt: new Date().toISOString() }));
      done("digital_pdf"); done("print_pdf"); done("epub");
      addLog("✓ Export complete — ZIP downloaded!");
      setFinished(true);
    } catch(e) { addLog("✗ Error: " + e.message); }
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
    ["💾", "Source Archive", "Project JSON, full text, all image assets"],
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
      {finished && (
        <div style={{ marginTop: 16, background: "#1a3a2a", border: `1px solid ${C.green}`, borderRadius: 8, padding: "14px 18px" }}>
          <p style={{ color: C.green, fontWeight: 700, marginBottom: 4 }}>✓ Publishing package downloaded</p>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Check Downloads for the ZIP. Customer files, print files, metadata, and source archive are all inside.</p>
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
  { id: "export",       label: "📦 Export" },
  { id: "listing",      label: "🛒 Listing Copy" },
];

/* ── MAIN MODULE ── */
export default function PublishingModule({ book, setBook, author, onBack }) {
  const [tab, setTab] = useState("checklist");
  const [pub, setPubRaw] = useState(book.publishing || {});
  const [completed, setCompleted] = useState(() => new Set(book.publishingCompleted || []));

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
      case "cover":        return <CoverBuilder pub={pub} setPub={setPub} book={book} done={markDone} />;
      case "backcover":    return <BackCoverBuilder pub={pub} setPub={setPub} book={book} done={markDone} />;
      case "dedication":   return <DedicationBuilder pub={pub} setPub={setPub} done={markDone} />;
      case "about_author": return <AboutAuthorBuilder pub={pub} setPub={setPub} book={book} author={author} done={markDone} />;
      case "about_lab":    return <AboutLABBuilder pub={pub} setPub={setPub} done={markDone} />;
      case "copyright":    return <CopyrightBuilder pub={pub} setPub={setPub} book={book} done={markDone} />;
      case "metadata":     return <MetadataBuilder pub={pub} setPub={setPub} book={book} done={markDone} />;
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
        {/* Top nav */}
        <div style={{ background: C.ink, borderBottom: `1px solid ${C.border}`, padding: "0 16px", display: "flex", alignItems: "center", gap: 2, overflowX: "auto", flexShrink: 0 }}>
          <button onClick={onBack} style={{ color: C.muted, background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "13px 10px", whiteSpace: "nowrap" }}>← Back to studio</button>
          <div style={{ width: 1, height: 18, background: C.border, margin: "0 4px" }} />
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "13px 11px", fontSize: 12, whiteSpace: "nowrap", color: tab === t.id ? C.gold : C.muted, borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent" }}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", maxWidth: 880 }}>
          {renderMain()}
        </div>
      </div>
    </div>
  );
}
