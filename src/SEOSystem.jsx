import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   LITTLE AMOUR BOOKS — SEO System
   - SEOHead: updates document.head (meta, og, twitter, schema)
   - SchemaMarkup: injects JSON-LD
   - Theme landing pages (11 SEO content pages)
   - 404 Page
   - SEO Admin Dashboard
   ============================================================ */

const SITE = "https://littleamour.com";
const SITE_NAME = "Little Amour Books";
const DEFAULT_OG = `${SITE}/og-image.png`;

/* ============================================================
   SEO HEAD — updates document.head on route change
   ============================================================ */
export function SEOHead({ title, description, canonical, ogImage, ogType = "website", schema, noindex = false }) {
  useEffect(() => {
    // Title
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Gentle Children's Books for Hard Family Moments`;
    document.title = fullTitle;

    const set = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    const setMeta = (name, content) => set(`meta[name="${name}"]`, "content", content);
    const setOG   = (prop, content) => set(`meta[property="${prop}"]`, "content", content);
    const setLink = (rel, href) => { let el = document.querySelector(`link[rel="${rel}"]`); if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); } el.setAttribute("href", href); };

    if (description) setMeta("description", description);
    setMeta("robots", noindex ? "noindex, follow" : "index, follow");

    // OG
    setOG("og:title", fullTitle);
    if (description) setOG("og:description", description);
    setOG("og:type", ogType);
    setOG("og:image", ogImage || DEFAULT_OG);
    if (canonical) setOG("og:url", canonical);

    // Twitter
    set('meta[name="twitter:title"]', "content", fullTitle);
    if (description) set('meta[name="twitter:description"]', "content", description);
    set('meta[name="twitter:image"]', "content", ogImage || DEFAULT_OG);

    // Canonical
    if (canonical) setLink("canonical", canonical);

    // Schema JSON-LD
    if (schema) {
      let el = document.getElementById("page-schema");
      if (!el) { el = document.createElement("script"); el.id = "page-schema"; el.type = "application/ld+json"; document.head.appendChild(el); }
      el.textContent = JSON.stringify(schema);
    }

    return () => {
      const el = document.getElementById("page-schema");
      if (el) el.remove();
    };
  }, [title, description, canonical, ogImage, schema, noindex]);

  return null;
}

/* ============================================================
   BOOK SCHEMA — for book product pages
   ============================================================ */
export function bookSchema(book) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        "name": book.title,
        "description": book.tagline || book.adult,
        "author": { "@type": "Person", "name": book.authorName },
        "publisher": { "@type": "Organization", "name": SITE_NAME, "url": SITE },
        "genre": ["Children's Literature", "Picture Book", "Emotional Health"],
        "audience": { "@type": "Audience", "audienceType": book.age || "Children" },
        "inLanguage": "en",
        "url": `${SITE}/book/${book.id}`,
        "image": `${SITE}/og-image.png`,
        "isPartOf": { "@type": "BookSeries", "name": "Little Amour Books Collection" },
      },
      {
        "@type": "Product",
        "name": book.title,
        "description": book.tagline || book.adult,
        "brand": { "@type": "Brand", "name": SITE_NAME },
        "url": `${SITE}/book/${book.id}`,
        "image": `${SITE}/og-image.png`,
        "offers": {
          "@type": "Offer",
          "price": book.price?.toFixed(2) || "14.99",
          "priceCurrency": "USD",
          "availability": book.status === "available" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          "seller": { "@type": "Organization", "name": SITE_NAME },
          "url": `${SITE}/book/${book.id}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Shop", "item": `${SITE}/store` },
          { "@type": "ListItem", "position": 2, "name": "All Books", "item": `${SITE}/books` },
          { "@type": "ListItem", "position": 3, "name": book.title, "item": `${SITE}/book/${book.id}` },
        ],
      },
    ],
  };
}

/* ============================================================
   THEME LANDING PAGES — SEO content for hard-moment topics
   ============================================================ */

const P = {
  night: "#131A30", dusk: "#33304F", mauve: "#6E5572",
  rose: "#E5AC9F", gold: "#E2A857", paper: "#FAF4EB",
  paperWarm: "#F4EADC", ink: "#2B2433", inkSoft: "#5E5468",
  cream: "#FFF9F0",
};

const THEMES = {
  "divorce": {
    title: "Children's Books About Divorce & Family Change",
    subtitle: "Gentle illustrated books that help children understand when families look different.",
    intro: "Divorce is one of the most disorienting experiences a child can go through — not because of what changes, but because of what they can't yet name. These books give children language for the transition, without asking them to choose sides or carry adult grief.",
    books: ["papers", "bluebag", "twohomes"],
    faq: [
      { q: "At what age can children read books about divorce?", a: "Books about family change can be introduced as young as age 2–3 with simple picture books. The books in this collection are designed for ages 3–7, with adult guidance." },
      { q: "How do children's books about divorce help?", a: "Reading gives children a safe container for feelings. When a story names what they're experiencing, children feel less alone and more able to talk about it." },
      { q: "Do these books take sides?", a: "No. Little Amour Books are written to be emotionally honest without blame. They center the child's experience, not the adults' conflict." },
    ],
    meta: { title: "Children's Books About Divorce & Family Change", description: "Gentle illustrated picture books about divorce, family change, and two homes. Written by survivor mothers for children aged 3–7. Emotionally honest, never scary." },
  },
  "court": {
    title: "Children's Books About Court Days & Legal Stress",
    subtitle: "Books that help when grown-up papers are on the kitchen table.",
    intro: "Family court. Custody hearings. Papers that cover the table and a parent who goes quiet. Children sense the stress even when adults try to hide it — and without language, they often think it's their fault. These books tell children gently: big papers are grown-up work, not theirs to carry.",
    books: ["papers"],
    faq: [
      { q: "How do I talk to my child about court dates?", a: "Keep it simple and age-appropriate. Books like 'Mama Has Papers Today' open the door for gentle conversation without requiring you to explain legal details." },
      { q: "Is it okay to read these books before a court day?", a: "Yes. Reading before a stressful event helps children build a mental model so the experience feels less unknown." },
      { q: "Will this book make my child more anxious?", a: "These books are designed to reduce anxiety, not create it. They validate feelings and end with reassurance." },
    ],
    meta: { title: "Children's Books About Court Days & Legal Stress", description: "Gentle children's books for families navigating court days, custody papers, and legal stress. Help your child understand without fear." },
  },
  "big-feelings": {
    title: "Children's Books About Big Feelings & Anxiety",
    subtitle: "For children who feel everything — and need words for it.",
    intro: "Some children are wired to feel deeply. Some go through seasons of anxiety, clinginess, or big emotional reactions after a hard family event. These books don't tell children to calm down. They say: your feelings are real, they have names, and you're not wrong for having them.",
    books: ["brave", "backpack", "worrycloud"],
    faq: [
      { q: "What age are these books for?", a: "The books in this collection are designed for ages 3–7, but children up to age 9 often connect with the emotional themes." },
      { q: "How can books help an anxious child?", a: "When a child sees their experience reflected in a story character, it normalizes the feeling. These books also model gentle coping responses." },
      { q: "Are these trauma-informed?", a: "Yes. All Little Amour Books are reviewed for emotional safety and written to be gentle, non-threatening, and child-centered." },
    ],
    meta: { title: "Children's Books About Big Feelings & Anxiety", description: "Gentle illustrated books about big feelings, worry, and anxiety for children ages 3–7. Emotionally honest, trauma-informed, written by survivor mothers." },
  },
  "survivor-families": {
    title: "Books for Survivor Families & Domestic Violence Recovery",
    subtitle: "Gentle books for families on the other side of hard things.",
    intro: "Life after abuse looks different for every family. There are new routines, new questions, and children who need the adults in their life to have words for what's changed. Little Amour Books are written by survivor mothers — women who lived it and wrote the books they wish they'd had.",
    books: ["papers", "bluebag", "brave"],
    faq: [
      { q: "Are these books appropriate for children who have witnessed domestic violence?", a: "Yes. Little Amour Books are designed to be safe for children in recovery. They do not contain violence, blame, or scary imagery." },
      { q: "Who writes these books?", a: "Every book in the Little Amour collection is written by a survivor mother with lived experience. Pen names protect author privacy." },
      { q: "Do these books mention abuse directly?", a: "No. The books acknowledge hard situations gently, without graphic detail. They center the child's feelings and the path forward." },
    ],
    meta: { title: "Children's Books for Survivor Families", description: "Illustrated children's books written by survivor mothers for families rebuilding after domestic violence. Gentle, safe, emotionally honest." },
  },
  "anxiety": {
    title: "Trauma-Informed Children's Books for Anxious Children",
    subtitle: "Written for children whose nervous systems have been through a lot.",
    intro: "Children who have experienced upheaval often show anxiety in ways that look like defiance, clinginess, or big reactions to small things. These books were written with that child in mind — the one who needs to be told, in the gentlest possible way, that they are safe now, that they are loved, and that brave is not the same as unafraid.",
    books: ["brave", "backpack", "worrycloud"],
    faq: [
      { q: "What is a trauma-informed children's book?", a: "A trauma-informed book avoids re-traumatizing content, centers the child's experience, and ends with safety and connection. Little Amour Books are reviewed before publication for these qualities." },
      { q: "Can these books be used in therapy?", a: "Many therapists use picture books as therapeutic tools. These books are not therapy, but they are designed to support therapeutic conversations." },
    ],
    meta: { title: "Trauma-Informed Children's Books for Anxious Kids", description: "Gentle picture books for children who have been through hard things. Written by survivor mothers. Designed for anxious, sensitive, and big-feeling kids." },
  },
  "separation": {
    title: "Children's Books About Separation & Missing a Parent",
    subtitle: "For the children who count the days between visits.",
    intro: "Separation from a parent — whether through custody arrangements, deployment, incarceration, or distance — is one of the most confusing experiences for a young child. These books don't pretend absence is easy. They give children a place to put the feeling of missing someone, and remind them that love doesn't require closeness to be real.",
    books: ["papers", "twohomes"],
    faq: [
      { q: "How do you explain parental absence to a young child?", a: "Keep explanations short, age-appropriate, and free from blame. Books like these give children a framework without requiring a difficult conversation in the moment." },
      { q: "My child misses the other parent. What can I do?", a: "Acknowledge the feeling fully. These books help by naming the experience and affirming that love is constant even when people can't be together." },
    ],
    meta: { title: "Children's Books About Separation & Missing a Parent", description: "Gentle books for children navigating parental separation, custody transitions, and the feeling of missing someone. Ages 3–7." },
  },
  "moving": {
    title: "Children's Books About Moving & Finding a New Home",
    subtitle: "For children who left something behind and need help arriving somewhere new.",
    intro: "Moving — especially when it's sudden, necessary, or to a shelter or temporary home — is disorienting for children. They've left their room, their school, sometimes their toys. These books don't gloss over that loss. They hold it gently, and then show children that home is something you carry, not just a place you go.",
    books: ["bluebag"],
    faq: [
      { q: "How do I help my child adjust to a new home?", a: "Give them agency where you can — choosing which stuffed animal comes, which shelf is theirs. These books show children that small choices return a sense of control." },
      { q: "What age are these books for?", a: "Ages 4–7 primarily, though the emotional themes resonate across a wide range." },
    ],
    meta: { title: "Children's Books About Moving to a New Home", description: "Gentle picture books for children who have moved, left suddenly, or are adjusting to shelter or transitional housing. Written by survivor mothers." },
  },
  "two-homes": {
    title: "Children's Books About Two Homes & Co-Parenting",
    subtitle: "For children learning to love two places at once.",
    intro: "Growing up between two homes is its own kind of life — with its own rhythm, its own losses, its own small joys. Children navigating this often feel the need to manage their parents' feelings as much as their own. These books give children permission to love both, miss both, and belong fully in both.",
    books: ["twohomes", "papers"],
    faq: [
      { q: "How do I help my child feel at home in two places?", a: "Consistency helps: same bedtime routines, familiar items in both homes. These books also help by normalizing the arrangement without making it sound easy." },
      { q: "Do these books take one parent's side?", a: "Never. Little Amour Books are written to center the child, not the conflict." },
    ],
    meta: { title: "Children's Books About Two Homes & Co-Parenting", description: "Picture books for children living between two homes. Gentle, non-judgmental, and written for the child's experience. Ages 4–8." },
  },
  "trauma-informed": {
    title: "Trauma-Informed Children's Books — A Guide",
    subtitle: "What makes a children's book truly safe for children who have been through hard things.",
    intro: "Not all children's books about hard topics are created equal. Some inadvertently re-traumatize. Some flatten complex feelings. Little Amour Books are written, reviewed, and designed with trauma-informed principles at every step — because the children who need these books most deserve books that don't accidentally make things harder.",
    books: ["papers", "brave", "bluebag"],
    faq: [
      { q: "What makes a book trauma-informed?", a: "It avoids graphic content, doesn't require the child to relive trauma, centers safety and connection, and models emotional regulation. It ends with hope — not false positivity, but genuine reassurance." },
      { q: "Are Little Amour Books suitable for children in therapy?", a: "Many therapists use picture books as session tools. Our books are not therapy, but they are designed to support the therapeutic process." },
      { q: "Who reviews Little Amour Books before publication?", a: "Each book goes through an internal emotional safety review before publication. Authors write from lived experience." },
    ],
    meta: { title: "Trauma-Informed Children's Books — A Complete Guide", description: "What makes a children's book truly safe for sensitive, anxious, or trauma-affected children. Plus gentle book recommendations from Little Amour Books." },
  },
  "rebuilding": {
    title: "Books for Mothers Rebuilding After Abuse",
    subtitle: "Tools, stories, and gentle resources for survivor mothers.",
    intro: "Rebuilding after abuse is not a single event. It's a hundred quiet mornings — some harder than others — and the slow work of building a life that belongs to you again. Little Amour Books exists for the mothers doing that work, and for the children watching them do it.",
    books: ["papers", "bluebag", "brave"],
    faq: [
      { q: "Can I publish my own story with Little Amour Books?", a: "Yes. Little Amour Books is a publishing platform for survivor mothers. We guide authors through creating their book using our AI studio, then publish and sell it. 75% of every sale goes to the author." },
      { q: "Do I need writing experience?", a: "No. Amora — our AI studio — guides you through the whole process. Your story and your voice are the only requirements." },
    ],
    meta: { title: "Books for Mothers Rebuilding After Abuse", description: "Resources, gentle stories, and a publishing platform for survivor mothers. Write and publish your own children's book with Little Amour Books." },
  },
  "brave-days": {
    title: "Children's Books for Hard Days & Brave Little Moments",
    subtitle: "For the days when getting through it is the bravest thing.",
    intro: "Some days are just hard. Not in any dramatic way — just heavy. These books are for those days: the ordinary-hard ones, the post-court ones, the 'Mama cried in the car' ones. They don't promise tomorrow will be easier. They say: today was real, you were brave, and I see you.",
    books: ["brave", "papers", "backpack"],
    faq: [
      { q: "Can books help children on bad days?", a: "Yes. Reading together creates connection and co-regulation. Even reading without talking can help — the book becomes a shared object between parent and child." },
      { q: "What age are these books for?", a: "Ages 3–7, though the emotional themes are universal." },
    ],
    meta: { title: "Children's Books for Hard Days & Brave Little Moments", description: "Gentle illustrated books for ordinary hard days. Written for families who know what it means to get through something together." },
  },
};

function ThemeLandingPage({ topicSlug, books, go }) {
  const theme = THEMES[topicSlug];
  if (!theme) return <NotFoundPage go={go} />;

  const relatedBooks = (theme.books || []).map(id => books.find(b => b.id === id)).filter(Boolean);

  return (
    <>
      <SEOHead
        title={theme.meta.title}
        description={theme.meta.description}
        canonical={`${SITE}/topic/${topicSlug}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": theme.title,
          "description": theme.meta.description,
          "url": `${SITE}/topic/${topicSlug}`,
          "publisher": { "@type": "Organization", "name": SITE_NAME, "url": SITE },
        }}
      />
      <section style={{ background: P.paper, minHeight: "100vh" }}>
        <style>{THEME_CSS}</style>
        {/* Hero */}
        <div className="th-hero">
          <div className="th-hero-inner">
            <p className="th-eyebrow">Little Amour Books</p>
            <h1 className="th-h1">{theme.title}</h1>
            <p className="th-subtitle">{theme.subtitle}</p>
          </div>
        </div>

        <div className="th-wrap">
          {/* Intro */}
          <section className="th-section">
            <p className="th-intro">{theme.intro}</p>
          </section>

          {/* Books */}
          {relatedBooks.length > 0 && (
            <section className="th-section">
              <h2 className="th-h2">Books for this moment</h2>
              <div className="th-books-grid">
                {relatedBooks.map(book => (
                  <button key={book.id} className="th-book-card" onClick={() => go("book", book.id)}>
                    <div className="th-book-cover" style={{ background: `linear-gradient(160deg,${book.grad[0]},${book.grad[1]})` }}>
                      <span className="th-book-age">{book.age}</span>
                    </div>
                    <div className="th-book-info">
                      <h3 className="th-book-title">{book.title}</h3>
                      <p className="th-book-by">by {book.authorName}</p>
                      <p className="th-book-tagline">{book.tagline}</p>
                      <div className="th-book-helps">
                        {(book.helps || []).slice(0, 3).map(h => <span key={h} className="th-chip">{h}</span>)}
                      </div>
                      <p className="th-book-cta">Read more → ${book.price?.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* FAQ with schema */}
          {theme.faq?.length > 0 && (
            <section className="th-section">
              <h2 className="th-h2">Frequently asked questions</h2>
              <div className="th-faq">
                {theme.faq.map((item, i) => (
                  <details key={i} className="th-faq-item">
                    <summary className="th-faq-q">{item.q}</summary>
                    <p className="th-faq-a">{item.a}</p>
                  </details>
                ))}
              </div>
              {/* FAQ Schema */}
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": theme.faq.map(f => ({
                  "@type": "Question",
                  "name": f.q,
                  "acceptedAnswer": { "@type": "Answer", "text": f.a },
                })),
              }) }} />
            </section>
          )}

          {/* CTA */}
          <section className="th-section th-cta-section">
            <h2 className="th-h2">Browse all books</h2>
            <p>Little Amour Books publishes gentle illustrated children's books for families navigating hard moments — written by survivor mothers with lived experience.</p>
            <div className="th-cta-row">
              <button className="th-btn-gold" onClick={() => go("books")}>Browse all books</button>
              <button className="th-btn-line" onClick={() => go("write")}>Publish your story</button>
            </div>
          </section>

          {/* Breadcrumb */}
          <nav className="th-breadcrumb" aria-label="Breadcrumb">
            <button onClick={() => go("home")}>Home</button>
            <span aria-hidden="true"> › </span>
            <button onClick={() => go("books")}>Books</button>
            <span aria-hidden="true"> › </span>
            <span>{theme.title}</span>
          </nav>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   404 PAGE
   ============================================================ */
export function NotFoundPage({ go }) {
  return (
    <>
      <SEOHead title="Page Not Found" noindex={true} />
      <section style={{ background: P.paper, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <p style={{ fontSize: 64, marginBottom: 16 }}>🌙</p>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 32, color: P.night, marginBottom: 12 }}>Page not found</h1>
          <p style={{ fontSize: 17, color: P.inkSoft, maxWidth: "42ch", margin: "0 auto 28px", lineHeight: 1.65 }}>
            This page has moved or doesn't exist. Let's find what you're looking for.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => go("home")} style={{ background: P.gold, color: "#fff", border: "none", borderRadius: 999, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Go home</button>
            <button onClick={() => go("books")} style={{ background: "none", border: `1.5px solid ${P.ink}`, borderRadius: 999, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Browse books</button>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   THEME LANDING PAGE ROUTER (export for App.jsx)
   ============================================================ */
export function TopicPage({ slug, books, go }) {
  return <ThemeLandingPage topicSlug={slug} books={books} go={go} />;
}

/* ============================================================
   SEO ADMIN DASHBOARD
   ============================================================ */
const SEO_CHECKS = [
  { id: "gsc_verified",   label: "Site verified in Google Search Console",      category: "Technical" },
  { id: "sitemap_sub",    label: "Sitemap submitted to Google Search Console",   category: "Technical" },
  { id: "robots_live",    label: "robots.txt live at /robots.txt",               category: "Technical" },
  { id: "home_indexed",   label: "Homepage indexed by Google",                   category: "Indexing"  },
  { id: "apply_indexed",  label: "Author application page indexed",              category: "Indexing"  },
  { id: "books_indexed",  label: "Book product pages indexed",                   category: "Indexing"  },
  { id: "topics_indexed", label: "Theme landing pages indexed",                  category: "Indexing"  },
  { id: "legal_noindex",  label: "Legal/policy pages set to noindex",            category: "Indexing"  },
  { id: "og_tags",        label: "Open Graph tags present on all key pages",     category: "Social"    },
  { id: "schema_books",   label: "Book schema (Product + Book) on product pages","category": "Schema" },
  { id: "schema_org",     label: "Organization schema in site head",             category: "Schema"    },
  { id: "schema_faq",     label: "FAQ schema on theme landing pages",            category: "Schema"    },
  { id: "alt_text",       label: "All images have descriptive alt text",         category: "Images"    },
  { id: "canonical",      label: "Canonical URLs set on all key pages",          category: "Technical" },
  { id: "mobile",         label: "Site passes mobile-friendly test",             category: "Technical" },
  { id: "https",          label: "Site served over HTTPS",                       category: "Technical" },
  { id: "sitemap_books",  label: "All published books in sitemap",               category: "Sitemap"   },
  { id: "sitemap_topics", label: "All theme pages in sitemap",                   category: "Sitemap"   },
];

const BOOK_SEO_FIELDS = [
  { id: "papers",    title: "Mama Has Papers Today" },
  { id: "bluebag",   title: "The Night We Packed the Blue Bag" },
  { id: "brave",     title: "Brave Is a Quiet Thing" },
];

export function SEODashboard() {
  const [checks, setChecks] = useState(() => {
    const saved = localStorage.getItem("lab_seo_checks");
    return saved ? JSON.parse(saved) : {};
  });
  const [tab, setTab] = useState("checklist");
  const [bookSEO, setBookSEO] = useState(() => {
    const saved = localStorage.getItem("lab_book_seo");
    return saved ? JSON.parse(saved) : {};
  });
  const [generating, setGenerating] = useState({});

  const toggle = (id) => {
    const next = { ...checks, [id]: !checks[id] };
    setChecks(next);
    localStorage.setItem("lab_seo_checks", JSON.stringify(next));
  };

  const setBookField = (bookId, field, val) => {
    const next = { ...bookSEO, [bookId]: { ...(bookSEO[bookId] || {}), [field]: val } };
    setBookSEO(next);
    localStorage.setItem("lab_book_seo", JSON.stringify(next));
  };

  const generateSEO = async (bookId, bookTitle, field) => {
    setGenerating(g => ({ ...g, [`${bookId}_${field}`]: true }));
    try {
      const prompts = {
        seoTitle: `Write a concise SEO title (under 60 chars) for this children's book: "${bookTitle}" by Little Amour Books. Focus on the emotional theme and age range. Return only the title.`,
        metaDesc: `Write a compelling meta description (under 155 chars) for "${bookTitle}" — a gentle illustrated children's book by Little Amour Books. Include emotional theme and age range. Return only the description.`,
        keywords: `List 8 SEO keywords for a children's book titled "${bookTitle}" by Little Amour Books. Focus on emotional themes, age range, and parent search intent. Return as comma-separated list only.`,
        altText: `Write descriptive alt text for the cover image of "${bookTitle}" — a gentle illustrated children's picture book by Little Amour Books. Under 125 chars. Return only the alt text.`,
        pinterestDesc: `Write a Pinterest description (under 500 chars) for "${bookTitle}" by Little Amour Books. Warm, emotional, focused on the child's experience and what parents will find inside. Return only the description.`,
      };
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompts[field] }] }),
      });
      const data = await r.json();
      const text = data.content?.[0]?.text || data.text || "";
      if (text) setBookField(bookId, field, text.trim());
    } catch (e) { /* silent */ }
    setGenerating(g => ({ ...g, [`${bookId}_${field}`]: false }));
  };

  const done = SEO_CHECKS.filter(c => checks[c.id]).length;
  const categories = [...new Set(SEO_CHECKS.map(c => c.category))];

  return (
    <div>
      <div className="seo-tabs">
        {["checklist", "books", "sitemap", "gsc-guide"].map(t => (
          <button key={t} className={"seo-tab" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>
            {t === "checklist" ? "SEO Checklist" : t === "books" ? "Book SEO Fields" : t === "sitemap" ? "Sitemap" : "Google Search Console"}
          </button>
        ))}
      </div>

      {tab === "checklist" && (
        <div>
          <div className="seo-progress">
            <div className="seo-progress-bar" style={{ width: `${(done / SEO_CHECKS.length) * 100}%` }} />
          </div>
          <p className="seo-progress-label">{done} / {SEO_CHECKS.length} complete</p>

          {categories.map(cat => (
            <div key={cat} className="seo-category">
              <h3 className="seo-cat-h">{cat}</h3>
              {SEO_CHECKS.filter(c => c.category === cat).map(c => (
                <label key={c.id} className={"seo-check" + (checks[c.id] ? " done" : "")}>
                  <input type="checkbox" checked={!!checks[c.id]} onChange={() => toggle(c.id)} />
                  <span className="seo-check-label">{c.label}</span>
                  <span className={"seo-status " + (checks[c.id] ? "good" : "missing")}>{checks[c.id] ? "Good" : "Needs action"}</span>
                </label>
              ))}
            </div>
          ))}

          <div className="seo-gsc-reminder">
            <h3>⚠️ Attorney + Technical Review Reminder</h3>
            <p>SEO for a mission-driven site with sensitive content (domestic violence, trauma) requires care. Avoid sensationalizing topics in titles or descriptions. These settings should be reviewed by an SEO professional familiar with content sensitivity guidelines.</p>
          </div>
        </div>
      )}

      {tab === "books" && (
        <div>
          <p className="seo-hint">Fill SEO fields for each book. Use the AI buttons to generate copy — then review and edit before saving.</p>
          {BOOK_SEO_FIELDS.map(book => {
            const bSEO = bookSEO[book.id] || {};
            const fields = [
              { id: "seoTitle",      label: "SEO Title",          ph: "Under 60 characters" },
              { id: "metaDesc",      label: "Meta Description",   ph: "Under 155 characters" },
              { id: "keywords",      label: "Keywords",           ph: "comma-separated" },
              { id: "altText",       label: "Cover Image Alt Text", ph: "Descriptive alt text for cover" },
              { id: "pinterestDesc", label: "Pinterest Description", ph: "Under 500 characters" },
            ];
            return (
              <div key={book.id} className="seo-book-card">
                <h3 className="seo-book-title">{book.title}</h3>
                {fields.map(f => (
                  <div key={f.id} className="seo-field">
                    <div className="seo-field-header">
                      <label className="seo-field-label">{f.label}</label>
                      <button
                        className="seo-ai-btn"
                        disabled={!!generating[`${book.id}_${f.id}`]}
                        onClick={() => generateSEO(book.id, book.title, f.id)}
                      >
                        {generating[`${book.id}_${f.id}`] ? "Generating…" : "✨ Generate"}
                      </button>
                    </div>
                    <textarea
                      className="seo-textarea"
                      rows={f.id === "metaDesc" || f.id === "pinterestDesc" ? 3 : 2}
                      placeholder={f.ph}
                      value={bSEO[f.id] || ""}
                      onChange={e => setBookField(book.id, f.id, e.target.value)}
                    />
                    {f.id === "seoTitle" && bSEO[f.id] && (
                      <p className="seo-char-count" style={{ color: bSEO[f.id].length > 60 ? "#c0392b" : "#27ae60" }}>
                        {bSEO[f.id].length}/60 characters
                      </p>
                    )}
                    {f.id === "metaDesc" && bSEO[f.id] && (
                      <p className="seo-char-count" style={{ color: bSEO[f.id].length > 155 ? "#c0392b" : "#27ae60" }}>
                        {bSEO[f.id].length}/155 characters
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {tab === "sitemap" && (
        <div>
          <div className="seo-sitemap-card">
            <h3 className="seo-book-title">Sitemap Status</h3>
            <p>Your sitemap is auto-generated at <code>/api/sitemap</code> and served at <code>/sitemap.xml</code> via Vercel rewrites.</p>
            <div className="seo-sitemap-urls">
              {[
                ["Homepage", "/"],
                ["Shop", "/store"],
                ["All Books", "/books"],
                ["Book Packs", "/packs"],
                ["Become an Author", "/write"],
                ["Theme: Court", "/topic/court"],
                ["Theme: Big Feelings", "/topic/big-feelings"],
                ["Theme: Divorce", "/topic/divorce"],
                ["Book — Mama Has Papers", "/book/papers"],
                ["Book — Blue Bag", "/book/bluebag"],
                ["Book — Brave", "/book/brave"],
              ].map(([label, url]) => (
                <div key={url} className="seo-sitemap-row">
                  <span>{label}</span>
                  <code>{url}</code>
                  <span className="seo-status good">Included</span>
                </div>
              ))}
            </div>
            <p className="seo-hint" style={{ marginTop: 16 }}>Sitemap auto-updates when books are published. Submit to Google Search Console after any major content change.</p>
          </div>
        </div>
      )}

      {tab === "gsc-guide" && (
        <div className="seo-gsc-guide">
          <h3 className="seo-book-title">Google Search Console Setup</h3>
          <ol className="seo-gsc-steps">
            {[
              { title: "Go to Google Search Console", body: "Visit search.google.com/search-console and sign in with your Google account." },
              { title: "Add your property", body: "Choose 'URL prefix' and enter https://littleamour.com — this is the easiest method for a Vercel site." },
              { title: "Verify ownership", body: "Google will give you an HTML tag to add to your site head, or a file to upload to /public/. The HTML tag method works best — add it to index.html in the <head> section." },
              { title: "Submit your sitemap", body: "In GSC, go to Sitemaps → Add a new sitemap → enter sitemap.xml → Submit. Google will begin crawling." },
              { title: "Request indexing for key pages", body: "In the URL Inspection tool, enter each key URL (homepage, /books, /write, /apply) → click 'Request indexing'. Do this for your most important pages." },
              { title: "Monitor coverage", body: "Under Coverage → check for any Excluded or Error pages. Fix any 'noindex' tags accidentally applied to important pages." },
              { title: "Track search queries", body: "Performance → Search results shows which queries bring people to your site. Use this to refine your SEO copy over time." },
              { title: "Set up email alerts", body: "In Settings → enable email notifications for coverage issues, security issues, and manual actions." },
            ].map((step, i) => (
              <li key={i} className="seo-gsc-step">
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      <style>{SEO_ADMIN_CSS}</style>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */
const THEME_CSS = `
.th-hero { background: linear-gradient(160deg,#131A30,#33304F); padding: 72px 0 60px; }
.th-hero-inner { max-width: 780px; margin: 0 auto; padding: 0 26px; }
.th-eyebrow { font-size: 11.5px; letter-spacing:.22em; text-transform:uppercase; color:#E2A857; font-weight:700; margin-bottom:12px; }
.th-h1 { font-family:'Fraunces',Georgia,serif; font-size:clamp(26px,4vw,42px); font-weight:560; color:#FFF9F0; line-height:1.1; margin-bottom:14px; }
.th-subtitle { font-size:18px; color:rgba(242,207,197,.85); line-height:1.6; max-width:54ch; }
.th-wrap { max-width:900px; margin:0 auto; padding:0 26px; }
.th-section { padding:52px 0; border-bottom:1px solid #ECD9C5; }
.th-section:last-child { border-bottom:none; }
.th-intro { font-size:17.5px; line-height:1.75; color:#2B2433; max-width:68ch; }
.th-h2 { font-family:'Fraunces',Georgia,serif; font-size:28px; font-weight:560; color:#131A30; margin-bottom:24px; }
.th-books-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
.th-book-card { background:#fff; border:1px solid #ECD9C5; border-radius:16px; overflow:hidden; text-align:left; cursor:pointer; transition:box-shadow .15s; }
.th-book-card:hover { box-shadow:0 6px 24px rgba(0,0,0,.09); }
.th-book-cover { height:120px; display:flex; align-items:flex-end; padding:14px; position:relative; }
.th-book-age { background:rgba(255,255,255,.2); color:#fff; font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:3px 10px; border-radius:999px; }
.th-book-info { padding:16px 18px 18px; }
.th-book-title { font-family:'Fraunces',Georgia,serif; font-size:17px; font-weight:560; color:#131A30; margin-bottom:4px; }
.th-book-by { font-size:13px; color:#6E5572; margin-bottom:8px; }
.th-book-tagline { font-size:14px; color:#5E5468; line-height:1.55; margin-bottom:10px; }
.th-book-helps { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px; }
.th-chip { font-size:11.5px; background:#F4EADC; color:#6E5572; border-radius:999px; padding:2px 10px; font-weight:600; }
.th-book-cta { font-size:13px; font-weight:700; color:#E2A857; }
.th-faq { display:flex; flex-direction:column; gap:10px; }
.th-faq-item { border:1px solid #ECD9C5; border-radius:12px; overflow:hidden; }
.th-faq-q { padding:15px 18px; font-weight:700; font-size:15px; cursor:pointer; list-style:none; background:#FAF4EB; }
.th-faq-q::-webkit-details-marker { display:none; }
.th-faq-a { padding:14px 18px; font-size:14.5px; line-height:1.65; color:#5E5468; border-top:1px solid #ECD9C5; margin:0; }
.th-cta-section { background:#F4EADC; border-radius:20px; padding:36px !important; border:none !important; }
.th-cta-row { display:flex; gap:12px; flex-wrap:wrap; margin-top:20px; }
.th-btn-gold { background:#E2A857; color:#fff; border:none; border-radius:999px; padding:13px 28px; font-size:15px; font-weight:700; cursor:pointer; }
.th-btn-line { background:none; border:1.5px solid #2B2433; border-radius:999px; padding:12px 26px; font-size:15px; font-weight:700; cursor:pointer; }
.th-breadcrumb { padding:24px 0; font-size:13.5px; color:#888; display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
.th-breadcrumb button { background:none; border:none; color:#6E5572; font-weight:600; cursor:pointer; padding:0; }
.th-breadcrumb button:hover { text-decoration:underline; }
`;

const SEO_ADMIN_CSS = `
.seo-tabs { display:flex; gap:0; border-bottom:2px solid #E3D3BC; margin-bottom:24px; }
.seo-tab { background:none; border:none; border-bottom:3px solid transparent; padding:10px 18px; font-size:14px; font-weight:600; color:#888; cursor:pointer; margin-bottom:-2px; }
.seo-tab.on { color:#131A30; border-bottom-color:#E2A857; }
.seo-progress { height:8px; background:#ECD9C5; border-radius:999px; overflow:hidden; margin-bottom:8px; }
.seo-progress-bar { height:100%; background:#27ae60; border-radius:999px; transition:width .3s; }
.seo-progress-label { font-size:13px; color:#888; margin-bottom:20px; }
.seo-category { margin-bottom:24px; }
.seo-cat-h { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#6E5572; margin-bottom:10px; }
.seo-check { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:9px; cursor:pointer; transition:background .12s; }
.seo-check:hover { background:#FAF4EB; }
.seo-check.done { opacity:.65; }
.seo-check input { flex-shrink:0; width:16px; height:16px; accent-color:#E2A857; }
.seo-check-label { flex:1; font-size:14px; }
.seo-status { font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; flex-shrink:0; }
.seo-status.good { color:#27ae60; }
.seo-status.missing { color:#e67e22; }
.seo-status.error { color:#c0392b; }
.seo-hint { font-size:13px; color:#888; line-height:1.6; margin-bottom:16px; }
.seo-book-card { background:#FAF4EB; border:1px solid #ECD9C5; border-radius:16px; padding:24px; margin-bottom:20px; }
.seo-book-title { font-size:17px; font-weight:700; color:#131A30; margin-bottom:16px; }
.seo-field { margin-bottom:14px; }
.seo-field-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.seo-field-label { font-size:13px; font-weight:700; color:#33304F; }
.seo-ai-btn { background:#E2A857; color:#fff; border:none; border-radius:999px; padding:4px 14px; font-size:12px; font-weight:700; cursor:pointer; }
.seo-ai-btn:disabled { opacity:.5; cursor:default; }
.seo-textarea { width:100%; border:1.5px solid #DDD0C8; border-radius:9px; padding:10px 13px; font-size:14px; font-family:inherit; resize:vertical; background:#fff; }
.seo-char-count { font-size:12px; margin-top:3px; }
.seo-sitemap-card { background:#FAF4EB; border:1px solid #ECD9C5; border-radius:16px; padding:24px; }
.seo-sitemap-urls { display:flex; flex-direction:column; gap:6px; margin:16px 0; }
.seo-sitemap-row { display:flex; align-items:center; gap:12px; font-size:13px; padding:6px 0; border-bottom:1px solid #ECD9C5; }
.seo-sitemap-row code { font-size:12px; color:#6E5572; flex:1; }
.seo-gsc-guide { }
.seo-gsc-steps { padding-left:24px; display:flex; flex-direction:column; gap:18px; }
.seo-gsc-step { font-size:15px; line-height:1.65; }
.seo-gsc-step strong { display:block; margin-bottom:4px; color:#131A30; }
.seo-gsc-step p { margin:0; color:#5E5468; }
.seo-gsc-reminder { background:#FFF6E8; border:1px solid #F0D09A; border-radius:12px; padding:18px 20px; margin-top:24px; }
.seo-gsc-reminder h3 { font-size:15px; font-weight:700; color:#131A30; margin-bottom:8px; }
.seo-gsc-reminder p { font-size:13.5px; color:#5E5468; line-height:1.6; margin:0; }
`;

export { THEMES, ThemeLandingPage };
