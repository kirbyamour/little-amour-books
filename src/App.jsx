import React, { useState, useEffect, useRef } from "react";
import AdminDashboard from "./AdminDashboard";
import { PLACEHOLDER_BOOKS, PACKS, StoreLanding, BooksShop, PacksPage, PackPage, STORE_CSS, coverImageMap, formatMap, displayAge } from "./Bookstore";
import { supabase } from "./supabaseClient";
import {
  TermsOfSalePage, RefundPolicyPage, DigitalLicensePage, ShippingPolicyPage,
  PrivacyPolicyPage, WebsiteTermsPage, DMCAPolicyPage, AccessibilityPage,
  ReviewsPolicyPage, PreorderPolicyPage,
  PolicyFooterLinks, DigitalProductNotice, PhysicalProductNotice,
  CheckoutPolicyLinks, POLICY_VERSION,
} from "./PolicyPages";
import { RefundRequestForm } from "./RefundRequestForm";
import PublishingModule from "./Publishing";
import { PODProductSection, ShopMerchSection } from "./PODSystem";
import { SEOHead, TopicPage, NotFoundPage, bookSchema } from "./SEOSystem";

/* ============================================================
   LITTLE AMOUR BOOKS — rev 2
   Night-to-dawn design. Illustrated portraits. Support-the-
   author checkout. AI studio messaging. Author sign-in.
   ============================================================ */

const P = {
  night: "#131A30", nightDeep: "#0D1226", dusk: "#33304F", mauve: "#6E5572",
  rose: "#E5AC9F", roseSoft: "#F2CFC5", gold: "#E2A857", goldDeep: "#C68B3C",
  paper: "#FAF4EB", paperWarm: "#F4EADC", ink: "#2B2433", inkSoft: "#5E5468",
  cream: "#FFF9F0",
};

/* ---------------- Catalogue ---------------- */
const CORE_BOOKS = [
  {
    id: "papers", title: "Mama Has Papers Today", author: "kirby", authorName: "Kirby Amour",
    age: "Ages 3–6", price: 14.99, motif: "moon", grad: ["#2A2150", "#4A3B6E"], status: "available",
    theme: "court", themeBadge: "Court & Legal",
    tagline: "A true story about big changes, brave hearts, and finding safety.",
    adult: "Family court. Legal paperwork spread across the kitchen table. A mother carrying custody stress while her child quietly watches — and wonders if the worry is somehow their fault.",
    child: "Little One sees Mama's serious papers and worries they did something wrong. With help from Mama and Moon Bear, Little One learns that grown-up papers are not theirs to carry — and love is still for them.",
    helps: ["Family court & custody", "A parent under legal stress", "\u201CIs it my fault?\u201D worries", "Repair after a tense day"],
    note: "Read it together on paper days. Let your child point to Moon Bear. The book does the explaining so you don't have to find the words alone.",
  },
  {
    id: "bluebag", title: "The Night We Packed the Blue Bag", author: "mara", authorName: "Mara Voss",
    age: "Ages 4–7", price: 14.99, motif: "bag", grad: ["#1E3A52", "#3E6B7E"], status: "coming",
    theme: "safe-home", themeBadge: "Safe Home",
    tagline: "A story about leaving bravely, and arriving somewhere soft.",
    adult: "Leaving an unsafe home. Relocation, shelters, staying with family — the night a mother decides that somewhere else is safer, and a child needs the move to feel like courage, not catastrophe.",
    child: "One night, Mama says it's time for a brave adventure. They pack the blue bag with the most important things — and discover that home isn't a place you leave. It's something you carry, together.",
    helps: ["Leaving & relocation", "Shelter or transitional housing", "New rooms, new schools", "Feeling safe in a new place"],
    note: "Pack a small 'brave bag' with your child after reading. Choosing what comes along returns a feeling of control to little hands.",
  },
  {
    id: "brave", title: "Brave Is a Quiet Thing", author: "june", authorName: "June Ellery",
    age: "Ages 3–6", price: 13.99, motif: "lantern", grad: ["#4A2E3E", "#7A4E5C"], status: "coming",
    theme: "big-feelings", themeBadge: "Big Feelings",
    tagline: "A small lantern, a big feeling, and the truth about courage.",
    adult: "Anxiety after upheaval. Children who go quiet, cling harder, or startle easily after a hard season — and parents who want to honor the fear without feeding it.",
    child: "Pip thinks brave means being loud and big and never scared. But holding Mama's hand, trying again, and whispering 'I'm here' to a worried friend turn out to be the bravest things of all.",
    helps: ["Worry & big feelings", "After a hard season", "Quiet or clingy phases", "Naming feelings gently"],
    note: "Ask 'what was your quiet-brave today?' at bedtime. It builds a vocabulary for courage that fits in small pockets.",
  },
];
const BOOKS = [...CORE_BOOKS, ...PLACEHOLDER_BOOKS];

const AUTHORS = {
  kirby: {
    id: "kirby", name: "Kirby Amour", grad: ["#4A3B6E", "#8A6A8E"],
    photo: "https://images.squarespace-cdn.com/content/v1/56e68ac62fe13155d522ff00/1593855419098-1P6SQ1HEXVGR9ZFIQQGK/kirby_2.jpg?format=750w",
    look: { skin: "#C68863", hair: "#352523", top: "#5A4570", style: "waves" },
    tagline: "Survivor mama, storyteller, and founder of Little Amour Books.",
    intro: "Kirby creates gentle children's books for families navigating hard things — family court, big changes, fear, and rebuilding — with the belief that children deserve stories that tell the truth with care.",
    supportLine: "Kirby is rebuilding after years of family court while raising her children solo. Your support goes directly to her family.",
    story: [
      "After living through abuse, relocation, family court, and the long process of rebuilding safety for her children, Kirby began writing the books she wished had existed for families like hers.",
      "Her work is rooted in a simple belief: children notice more than adults think. They feel the papers on the kitchen table. They feel the quiet. They feel the fear. And they deserve language that helps them understand hard things without carrying adult burdens.",
      "Through Little Amour Books, Kirby also helps other survivor mothers turn lived wisdom into beautiful children's stories — and earn real income while they rebuild.",
    ],
  },
  mara: {
    id: "mara", name: "Mara Voss", grad: ["#2E4A5E", "#5E8A96"],
    look: { skin: "#EBBE9B", hair: "#7A4A2E", top: "#3E6B7E", style: "bun" },
    tagline: "Writer, gardener, and mother of two brave adventurers.",
    intro: "Mara writes about leaving, arriving, and the soft places in between. Her stories help children feel that a fresh start can be an act of love.",
    supportLine: "Mara's royalties are going toward her family's first stable lease in three years.",
    story: [
      "Mara left with two children, one car, and a blue duffel bag. The hardest part, she says, wasn't the leaving — it was finding words small enough for her four-year-old and true enough to keep.",
      "She wrote The Night We Packed the Blue Bag in a borrowed kitchen, one page per night, reading each one aloud to her kids before she kept it. If they leaned in, the page stayed.",
      "Today Mara's royalties go toward the family's first stable lease in three years. Her second book is on its way through the studio now.",
    ],
  },
  june: {
    id: "june", name: "June Ellery", photo: "/june-ellery.jpg", grad: ["#6E3E50", "#A4707E"],
    look: { skin: "#8C5A3C", hair: "#1F1A18", top: "#A4707E", style: "curls" },
    tagline: "Former preschool teacher. Permanent believer in quiet courage.",
    intro: "June writes for the children who go quiet when life gets loud. Her stories make small acts of bravery visible — and worthy of celebration.",
    supportLine: "June writes under a pen name while she rebuilds. Every gift reaches her directly and privately.",
    story: [
      "June spent twelve years teaching preschool before her own hard season taught her what her smallest students had always known: fear and courage live in the same little body, at the same time.",
      "Brave Is a Quiet Thing began as notes to her daughter, taped to a lunchbox. A friend told her they belonged in a book. The studio's editors helped her believe it.",
      "June writes under a pen name. Her legal name, like every author's here, stays private unless she chooses otherwise — because telling your story should never cost you your safety.",
    ],
  },
};

const GIFTS = [
  { id: "coffee", label: "Buy her a coffee", amt: 5, desc: "A small warm thing on a hard day." },
  { id: "selfcare", label: "Mommy-only self-care", amt: 25, desc: "An hour that belongs to her alone." },
  { id: "bill", label: "Help pay a bill", amt: 50, desc: "One envelope off the kitchen table." },
];

/* ---------------- Illustrated pieces ---------------- */
function Moon({ size = 26, color = P.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.8 3.2a9.5 9.5 0 1 0 4.1 13A8.2 8.2 0 0 1 16.8 3.2z" fill={color} />
    </svg>
  );
}
/* Logo mark: a crescent moon cradling an open book */
function MoonMark({ size = 30, color = P.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M30 5.5A15.5 15.5 0 1 0 36 27 12.8 12.8 0 0 1 30 5.5Z" fill={color} opacity="0.95" />
      <circle cx="31.5" cy="9" r="1.3" fill={color} opacity="0.7" />
      <circle cx="35" cy="13.5" r="0.9" fill={color} opacity="0.55" />
      <g>
        <path d="M20 30c-3.4-2.4-7.2-2.4-9.8-1.6V18.2c2.6-.8 6.4-.8 9.8 1.6 3.4-2.4 7.2-2.4 9.8-1.6v10.2c-2.6-.8-6.4-.8-9.8 1.6Z" fill="#FFF9F0" />
        <path d="M20 19.8v10.2" stroke={color} strokeWidth="1" opacity="0.6" />
      </g>
    </svg>
  );
}
function Bag({ size = 30, color = "#F2CFC5" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="16" height="11" rx="2.5" fill={color} />
      <path d="M9 9V7.5A2.5 2.5 0 0 1 11.5 5h1A2.5 2.5 0 0 1 15 7.5V9" stroke={color} strokeWidth="1.8" fill="none" />
      <rect x="7.5" y="12.5" width="9" height="1.6" rx="0.8" fill="#1E3A52" opacity="0.45" />
    </svg>
  );
}
function Lantern({ size = 30, color = P.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="6" width="8" height="12" rx="2.5" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="12" r="2.4" fill={color} />
      <path d="M10 6V4.6h4V6M10 18v1.4h4V18" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}
function Heart({ size = 30, color = "#E5AC9F" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} />
    </svg>
  );
}
function House({ size = 30, color = "#6A8F7A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z" fill={color} opacity="0.9" />
    </svg>
  );
}
function CloudIcon({ size = 30, color = "#A0B4CC" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill={color} />
    </svg>
  );
}
function Motif({ kind, size }) {
  if (kind === "bag") return <Bag size={size} />;
  if (kind === "lantern") return <Lantern size={size} />;
  if (kind === "heart") return <Heart size={size} />;
  if (kind === "house") return <House size={size} color={size > 40 ? "#6A8F7A" : "rgba(255,249,240,0.85)"} />;
  if (kind === "cloud") return <CloudIcon size={size} />;
  return <Moon size={size} color="#F2CFC5" />;
}

/* Illustrated author portrait — privacy-first, storybook style */
function Portrait({ author, size = 96 }) {
  const { look, grad, id, photo } = author;
  if (photo) return (
    <img src={photo} alt={author.name} width={size} height={size}
      style={{ borderRadius: "50%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
  );
  const uid = "pt-" + id;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={"Illustrated portrait of " + author.name}>
      <defs>
        <clipPath id={uid + "-clip"}><circle cx="60" cy="60" r="60" /></clipPath>
        <linearGradient id={uid + "-bg"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={grad[0]} /><stop offset="1" stopColor={grad[1]} />
        </linearGradient>
      </defs>
      <g clipPath={"url(#" + uid + "-clip)"}>
        <rect width="120" height="120" fill={"url(#" + uid + "-bg)"} />
        <circle cx="22" cy="22" r="1.6" fill="#F2E6D0" opacity=".7" />
        <circle cx="100" cy="30" r="1.3" fill="#F2E6D0" opacity=".6" />
        <circle cx="92" cy="14" r="1.1" fill="#F2E6D0" opacity=".5" />
        {look.style === "waves" && (
          <path d="M30,54 C26,18 94,18 90,54 C95,86 87,106 79,112 L41,112 C33,106 25,86 30,54 Z" fill={look.hair} />
        )}
        {look.style === "bun" && (
          <g>
            <circle cx="60" cy="19" r="12" fill={look.hair} />
            <ellipse cx="60" cy="48" rx="25" ry="27" fill={look.hair} />
          </g>
        )}
        {look.style === "curls" && (
          <g fill={look.hair}>
            <ellipse cx="60" cy="44" rx="27" ry="25" />
            <circle cx="40" cy="28" r="12" /><circle cx="60" cy="22" r="13" /><circle cx="80" cy="28" r="12" />
            <circle cx="32" cy="44" r="11" /><circle cx="88" cy="44" r="11" />
            <circle cx="34" cy="60" r="9" /><circle cx="86" cy="60" r="9" />
          </g>
        )}
        <path d="M52,74 h16 v16 c0,5 -16,5 -16,0 Z" fill={look.skin} />
        <path d="M16,122 C16,96 42,87 60,87 C78,87 104,96 104,122 Z" fill={look.top} />
        <ellipse cx="60" cy="54" rx="21" ry="25" fill={look.skin} />
        <path d="M37,52 C35,26 85,26 83,52 C77,38 70,33 60,33 C50,33 43,38 37,52 Z" fill={look.hair} />
        <circle cx="48" cy="62" r="3.4" fill="#D98876" opacity=".35" />
        <circle cx="72" cy="62" r="3.4" fill="#D98876" opacity=".35" />
        <path d="M54,69 C57,72 63,72 66,69" stroke="#8C5A4A" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".55" />
      </g>
    </svg>
  );
}

/* Kitchen-table vignette for the WHY section */
function KitchenScene() {
  return (
    <svg viewBox="0 0 260 220" className="kitchen" role="img" aria-label="A mother and child reading a storybook together under the moon and stars">
      <defs>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F2D9A0" stopOpacity="0.6" />
          <stop offset="1" stopColor="#F2D9A0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2150" />
          <stop offset="1" stopColor="#4A3B6E" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="248" height="208" rx="18" fill="url(#skyG)" />
      <rect x="6" y="6" width="248" height="208" rx="18" fill="none" stroke="#C59B4A" strokeWidth="2" opacity="0.55" />
      {/* moon + glow */}
      <circle cx="196" cy="52" r="46" fill="url(#moonGlow)" />
      <circle cx="196" cy="52" r="20" fill="#F4E3B0" />
      <circle cx="206" cy="46" r="20" fill="#3A2E60" />
      {/* stars */}
      <g fill="#F2E6C8">
        <circle cx="40" cy="36" r="1.6" /><circle cx="70" cy="22" r="1.1" />
        <circle cx="110" cy="40" r="1.3" /><circle cx="150" cy="26" r="1.5" />
        <circle cx="30" cy="70" r="1.1" /><circle cx="232" cy="96" r="1.3" />
        <path d="M88 60 l1.4 3 3 1.4 -3 1.4 -1.4 3 -1.4 -3 -3 -1.4 3 -1.4Z" opacity="0.9" />
        <path d="M178 110 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1Z" opacity="0.8" />
      </g>
      {/* hill */}
      <path d="M6 170 C70 140 150 150 254 168 L254 214 L6 214 Z" fill="#3A4A38" />
      <path d="M6 184 C90 162 170 168 254 182 L254 214 L6 214 Z" fill="#4A5A44" />
      {/* little wildflowers */}
      <g stroke="#9AA58E" strokeWidth="1.4">
        <path d="M40 196 v-10" /><path d="M48 198 v-8" /><path d="M214 198 v-9" />
      </g>
      <g fill="#E5AC9F"><circle cx="40" cy="185" r="2.2" /><circle cx="48" cy="189" r="2" /><circle cx="214" cy="188" r="2.2" /></g>
      {/* mother + child reading, on the hill */}
      <g>
        {/* mother body */}
        <path d="M96 196 C92 168 132 168 130 196 Z" fill="#6E5572" />
        {/* mother head */}
        <circle cx="108" cy="150" r="13" fill="#C68863" />
        <path d="M96 150 C94 132 122 132 120 150 C116 140 112 137 108 137 C104 137 100 140 96 150 Z" fill="#352523" />
        {/* child tucked against her */}
        <path d="M118 198 C116 180 140 180 138 198 Z" fill="#B97975" />
        <circle cx="128" cy="170" r="9" fill="#D89A72" />
        <path d="M120 170 C119 158 137 158 136 170 C133 163 130 161 128 161 C126 161 123 163 120 170 Z" fill="#3A2A24" />
        {/* the open storybook between them */}
        <g>
          <path d="M108 182 C116 176 128 176 134 180 C140 176 152 176 158 182 L158 192 C152 187 140 187 134 191 C128 187 116 187 108 192 Z" fill="#FFF9F0" />
          <path d="M133 180 v11" stroke="#C59B4A" strokeWidth="1" opacity="0.6" />
        </g>
        {/* a tiny moon bear in child's lap */}
        <circle cx="142" cy="190" r="6" fill="#EADFC9" />
        <circle cx="138" cy="185.5" r="3" fill="#EADFC9" />
        <circle cx="146" cy="185.5" r="3" fill="#EADFC9" />
        <path d="M140 189 a3 3 0 0 1 4 0" fill="#C59B4A" opacity="0.5" />
      </g>
    </svg>
  );
}

function Cover({ book, large }) {
  const realCover = coverImageMap[book.id];
  if (realCover) {
    // Every place this component renders (homepage grid, /books grid, author-page grid,
    // the book detail page, checkout) already shows book.title/authorName as real page
    // text right next to it — the ComposedCover scrim+title overlay (used in Publishing's
    // own preview, and in MiniCover's shop-grid thumbnails) would just duplicate that text
    // and black out most of the actual artwork for no reason here. Show the full image.
    return (
      <div className={"cover" + (large ? " cover-lg" : "")} style={{ padding: 0, background: "#EFE6D8" }} aria-label={"Cover of " + book.title}>
        {book.status === "coming" ? <span className="ribbon">Coming soon</span> : null}
        {/* object-fit: contain — never crops. Real cover images come in whatever shape
            the author uploaded or generated (square AI art, 2:3 portrait scans, etc.), and
            "cover" was slicing a third or more off the top/bottom of anything non-square
            to force it into this square frame. contain always shows the whole image,
            letterboxed if its shape doesn't match the frame, rather than cutting it. */}
        <img src={realCover.url} alt={"Cover of " + book.title} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", borderRadius: "inherit" }} />
      </div>
    );
  }
  return (
    <div
      className={"cover" + (large ? " cover-lg" : "")}
      style={{ background: `linear-gradient(165deg, ${book.grad[0]}, ${book.grad[1]})` }}
      aria-label={"Cover of " + book.title}
    >
      {book.status === "coming" ? <span className="ribbon">Coming soon</span> : null}
      <div className="cover-stars" aria-hidden="true">
        <i style={{ top: "12%", left: "18%" }} /><i style={{ top: "8%", left: "72%" }} />
        <i style={{ top: "26%", left: "85%" }} /><i style={{ top: "20%", left: "45%" }} />
      </div>
      <div className="cover-motif"><Motif kind={book.motif} size={large ? 54 : 38} /></div>
      <div className="cover-title">{book.title}</div>
      <div className="cover-rule" aria-hidden="true" />
      <div className="cover-author">{book.authorName}</div>
    </div>
  );
}

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && el.classList.add("in")),
      { threshold: 0.12 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return <div ref={ref} className="reveal" style={{ transitionDelay: delay + "ms" }}>{children}</div>;
}

/* ============================================================
   PAGES
   ============================================================ */
function HomePage({ go }) {
  return (
    <div>
      {/* NIGHT — hero */}
      <section className="hero">
        <div className="sky" aria-hidden="true">
          {Array.from({ length: 38 }).map((_, i) => (
            <span key={i} className="star" style={{
              top: (((i * 37) % 78) + 2) + "%", left: (((i * 53) % 96) + 2) + "%",
              animationDelay: (i % 7) * 0.6 + "s", opacity: 0.35 + ((i * 13) % 50) / 100,
            }} />
          ))}
          <div className="hero-moon"><MoonMark size={68} /></div>
        </div>
        <div className="hero-inner">
          <p className="eyebrow gold">Children's books by survivor mothers</p>
          <h1>Some childhoods<br />need braver books.</h1>
          <p className="hero-sub">
            We publish true stories about hard things — family court, leaving, fear,
            starting over — written by mothers who lived them. <strong>75% of every sale
            goes home with the author.</strong>
          </p>
          <div className="hero-cta">
            <button className="btn-gold" onClick={() => go("books")}>Shop the books</button>
            <button className="btn-line" onClick={() => go("write")}>Write with us</button>
          </div>
          <p className="hero-studio-line">
            Made in our own AI book studio — our authors need a story, not a skillset.
          </p>
        </div>
        <div className="horizon" aria-hidden="true" />
      </section>

      {/* DUSK — why */}
      <section className="dusk">
        <div className="wrap why-grid">
          <Reveal>
            <div>
              <p className="eyebrow rose">Why we exist</p>
              <h2 className="light">A child can feel the papers<br />on the kitchen table.</h2>
              <p className="lead light">
                When a family is surviving something hard, the children are never really
                outside of it. They feel the quiet. They notice the locked door, the packed
                bag, the serious voice on the phone. Without words for what's happening,
                little hearts write their own story — usually one where it's their fault.
              </p>
              <p className="lead light">
                The mothers protecting those children are fighting on two fronts: keeping
                their kids safe, and surviving the financial devastation protection costs.
                The people best qualified to write these stories are the ones who can least
                afford the time to write them.
              </p>
              <p className="pull">So we built a publishing house that pays survivors to tell the truth with courage.</p>
            </div>
          </Reveal>
          <Reveal delay={150}><img src="/hero-reading.png" className="hero-reading-img" alt="A mother and child reading together under the moon" /></Reveal>
        </div>
      </section>

      {/* DAWN — two stories */}
      <section className="dawn">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow plum">How our books work</p>
            <h2>Every book holds two stories.</h2>
            <p className="lead">One for the grown-up choosing it. One for the child holding it.</p>
          </Reveal>
          <Reveal delay={120}>
            <div className="two-grid">
              <div className="story-card">
                <span className="story-tag">For the grown-up</span>
                <p>The real-life issue, named plainly — custody battles, leaving an unsafe home, a parent's stress — so you know exactly what this book helps with before you bring it home.</p>
              </div>
              <div className="story-card">
                <span className="story-tag">For the child</span>
                <p>A warm, age-true story with no graphic detail and no adult weight — just honest language, a comfort friend, and an ending that lands on safety, every single time.</p>
              </div>
            </div>
            <p className="motto">Real-life issue. Child-safe story.</p>
          </Reveal>
        </div>
      </section>

      {/* AI STUDIO */}
      <section className="studio-band">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow plum">Our AI book studio</p>
            <h2>You don't need to know how to write a book.<br />You need a story only you could tell.</h2>
            <p className="lead">
              Every Little Amour book is built in our own AI-powered studio, side by side
              with the author. She brings the lived wisdom; the studio brings the craft.
              No writing degree, no design software, no savings required.
            </p>
          </Reveal>
          <div className="studio-grid">
            <Reveal delay={60}>
              <div className="studio-card">
                <span className="studio-num">It writes with her</span>
                <p>The studio turns her idea into pages — drafting in her voice, keeping her words whenever she wants them kept, and shaping every line to be safe for a child to hear.</p>
              </div>
            </Reveal>
            <Reveal delay={140}>
              <div className="studio-card">
                <span className="studio-num">It illustrates for her</span>
                <p>She chooses the style; the studio paints every page to match — consistent characters, a cohesive world, a cover that belongs on a bookstore shelf.</p>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <div className="studio-card">
                <span className="studio-num">It publishes through us</span>
                <p>Print-ready files, Kindle formatting, and publication to Amazon under our imprint — every page reviewed for emotional safety and approved by her before it ships.</p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={260}>
            <p className="studio-equation">Her lived wisdom + our studio's craft = a real published book, and real income.</p>
          </Reveal>
        </div>
      </section>

      {/* MORNING — books */}
      <section className="morning">
        <div className="wrap">
          <Reveal>
            <div className="row-between">
              <h2>The books</h2>
              <button className="btn-text" onClick={() => go("books")}>See all →</button>
            </div>
          </Reveal>
          <div className="book-grid">
            {BOOKS.map((b, i) => (
              <Reveal key={b.id} delay={i * 90}>
                <button className="book-tile" onClick={() => go("book", b.id)}>
                  <Cover book={b} />
                  <div className="tile-meta">
                    <h3>{b.title}</h3>
                    <p className="tile-by">by {b.authorName} · {displayAge(b)}</p>
                    <p className="tile-line">{b.tagline}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SPLIT */}
      <section className="split-band">
        <div className="wrap narrow center">
          <Reveal>
            <h2 className="light">Where your money goes</h2>
            <div className="split-bar" role="img" aria-label="75 percent to the author, 25 percent to the publisher">
              <div className="split-a">75% <span>to the author</span></div>
              <div className="split-b">25% <span>to the publisher</span></div>
            </div>
            <p className="lead light center-text">
              Author earnings have funded legal fees, first months' rent, and the quiet
              luxury of one less terrifying bill. The publisher's share keeps the studio,
              editing, and publishing free for every author — so a mother with no savings
              can still become a published author with an income.
            </p>
          </Reveal>
        </div>
      </section>

      {/* AUTHORS */}
      <section className="morning">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow plum">The author mamas</p>
            <h2>Written by women rebuilding.</h2>
          </Reveal>
          <div className="author-grid">
            {Object.values(AUTHORS).map((a, i) => (
              <Reveal key={a.id} delay={i * 90}>
                <button className="author-tile" onClick={() => go("author", a.id)}>
                  <Portrait author={a} size={86} />
                  <h3>{a.name}</h3>
                  <p>{a.tagline}</p>
                  <span className="btn-text">Read her story →</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* NIGHT — CTA */}
      <section className="night-cta">
        <div className="wrap narrow center">
          <Reveal>
            <Lantern size={44} />
            <h2 className="light">You don't have to be a writer.<br />You have to have lived it.</h2>
            <p className="lead light center-text">
              Bring an idea, a memory, a half-finished notebook. Our AI studio and our
              editors walk beside you from first page to published book on Amazon. You keep
              your privacy, your voice, and 75% of every sale.
            </p>
            <button className="btn-gold" onClick={() => go("apply")}>Apply to write with us</button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function BooksPage({ go }) {
  return (
    <section className="morning page-top">
      <div className="wrap">
        <p className="eyebrow plum">The bookshop</p>
        <h2>Gentle stories about hard things.</h2>
        <p className="lead">Every title names the real-life issue it helps with, and the child-safe story your little one will actually read.</p>
        <div className="book-grid">
          {BOOKS.map((b) => (
            <button key={b.id} className="book-tile" onClick={() => go("book", b.id)}>
              <Cover book={b} />
              <div className="tile-meta">
                <h3>{b.title}</h3>
                <p className="tile-by">by {b.authorName} · {displayAge(b)}</p>
                <div className="mini-two">
                  <p><strong>Grown-up:</strong> {b.adult.split(".")[0]}.</p>
                  <p><strong>Child:</strong> {b.child.split(".")[0]}.</p>
                </div>
                <span className="price">{b.status === "coming" ? "Coming soon" : "$" + b.price.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// Gated digital download page — the destination of the confirmation-email
// link (and of /deliver/:token typed directly). Verifies the token against
// the purchases table server-side (api/deliver.js) and, if valid, hands back
// a short-lived signed Storage URL for that book's PDF. Never trusts the
// token client-side; the page itself shows nothing about the book until the
// server confirms it.
function DeliverPage({ token, go }) {
  const [state, setState] = useState({ status: "loading", url: null, title: null, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/deliver?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.url) {
          setState({ status: "error", url: null, title: null, error: data.error || "This link isn't working." });
        } else {
          setState({ status: "ready", url: data.url, title: data.title, error: null });
        }
      } catch (e) {
        if (!cancelled) setState({ status: "error", url: null, title: null, error: "Something went wrong loading your book." });
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <section className="morning page-top">
      <div className="wrap narrow center">
        {state.status === "loading" ? (
          <p className="lead">Getting your book ready…</p>
        ) : state.status === "error" ? (
          <>
            <h2>We couldn't open that link</h2>
            <p className="lead">{state.error} If you just bought this book, check your email for the most recent copy of this link, or contact <a href="mailto:hello@littleamour.com" style={{ color: "#7C3AED" }}>hello@littleamour.com</a> and we'll send it again.</p>
            <button className="btn-text" onClick={() => go("home")}>← Back to Little Amour Books</button>
          </>
        ) : (
          <>
            <h2>Your book is ready{state.title ? `: ${state.title}` : ""}</h2>
            <p className="lead">This download link is just for you and expires in 10 minutes for security — if it stops working, come back to this same email link and we'll generate a fresh one.</p>
            <a className="btn-gold" href={state.url} style={{ display: "inline-block", marginTop: 8 }}>Download your PDF</a>
          </>
        )}
      </div>
    </section>
  );
}

function BookPage({ book, go, toast, addToCart }) {
  const author = AUTHORS[book.author];
  const coming = book.status === "coming";
  // Author-controlled sell formats (Publishing -> Sell As). Falls back to today's
  // default (PDF + Physical, no Amazon) for any book the author hasn't touched yet.
  const fmt = formatMap[book.id] || { sellAs: { pdf: true, physical: true, amazon: false }, amazonUrl: "" };
  const sellAs = fmt.sellAs || { pdf: true, physical: true, amazon: false };
  const showAmazon = !!sellAs.amazon && !!fmt.amazonUrl;
  const noFormats = !sellAs.pdf && !sellAs.physical && !showAmazon;
  return (
    <section className="morning page-top">
      <div className="wrap">
        <button className="btn-text" onClick={() => go("books")}>← All books</button>
        <div className="book-detail">
          <div><Cover book={book} large /></div>
          <div className="bd-right">
            <h2>{book.title}</h2>
            <p className="tile-by big">
              by <button className="link" onClick={() => go("author", author.id)}>{book.authorName}</button> · {displayAge(book)}
            </p>
            <p className="lead">{book.tagline}</p>
            <p className="motto small-motto">Real-life issue. Child-safe story.</p>
            <div className="two-grid tight">
              <div className="story-card">
                <span className="story-tag">For the grown-up</span>
                <p>{book.adult}</p>
              </div>
              <div className="story-card">
                <span className="story-tag">For the child</span>
                <p>{book.child}</p>
              </div>
            </div>
            <h3 className="bd-h">This book may help with</h3>
            <div className="chips">{book.helps.map((h) => <span key={h} className="chip">{h}</span>)}</div>
            <h3 className="bd-h">A word for caregivers</h3>
            <p className="caregiver">{book.note}</p>
            <DigitalProductNotice />
            <div className="buy-row">
              {coming ? (
                <button className="btn-gold" onClick={() => toast("This book is in the studio now. In production this joins a notify-me list — we'll let you know the moment it launches.")}>
                  Notify me when it launches
                </button>
              ) : noFormats ? (
                <p className="fine" style={{ margin: 0 }}>This book isn't currently available for purchase.</p>
              ) : (
                <>
                  {sellAs.pdf && (
                    <button className="btn-gold" onClick={() => addToCart ? addToCart({ type: "book", format: "pdf", id: book.id, title: book.title, price: book.price, author: book.author, authorName: book.authorName, grad: book.grad, motif: book.motif }) : go("checkout", book.id)}>
                      Add to bag — PDF — ${book.price.toFixed(2)}
                    </button>
                  )}
                  {sellAs.physical && (
                    <button className={sellAs.pdf ? "btn-line dark" : "btn-gold"} onClick={() => addToCart ? addToCart({ type: "book", format: "physical", id: book.id, title: book.title, price: book.price, author: book.author, authorName: book.authorName, grad: book.grad, motif: book.motif }) : go("checkout", book.id)}>
                      Add to bag — Physical — ${book.price.toFixed(2)}
                    </button>
                  )}
                  {showAmazon && (
                    <a className="btn-line dark" href={fmt.amazonUrl} target="_blank" rel="noopener noreferrer">
                      Buy on Amazon
                    </a>
                  )}
                </>
              )}
            </div>
            <p className="fine">75% of every direct sale goes to {book.authorName}. Created in our AI book studio with her story at the center, and reviewed for emotional safety before publication.</p>
          </div>
        </div>
        <PODProductSection book={book} addToCart={addToCart} />
      </div>
    </section>
  );
}

/* ---------------- Checkout: the support moment ---------------- */
function CheckoutPage({ book, go, onComplete }) {
  const author = AUTHORS[book.author];
  const [picked, setPicked] = useState({});
  const giftTotal = GIFTS.reduce((s, g) => s + (picked[g.id] ? g.amt : 0), 0);
  const total = book.price + giftTotal;
  const toggle = (id) => setPicked({ ...picked, [id]: !picked[id] });
  return (
    <section className="morning page-top">
      <div className="wrap">
        <button className="btn-text" onClick={() => go("book", book.id)}>← Back to the book</button>
        <h2>Checkout</h2>
        <div className="checkout-grid">
          <div className="co-order">
            <div className="co-book">
              <div className="co-cover"><Cover book={book} /></div>
              <div>
                <h3>{book.title}</h3>
                <p className="tile-by">by {book.authorName}</p>
                <p className="price">${book.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="co-lines">
              <p><span>Book</span><span>${book.price.toFixed(2)}</span></p>
              {GIFTS.filter((g) => picked[g.id]).map((g) => (
                <p key={g.id}><span>{g.label}</span><span>${g.amt.toFixed(2)}</span></p>
              ))}
              <p className="co-total"><span>Total</span><span>${total.toFixed(2)}</span></p>
            </div>
            <button className="btn-gold full" onClick={() => onComplete(book, picked, total)}>
              Complete purchase — ${total.toFixed(2)}
            </button>
            <p className="fine">Secure checkout connects to Stripe at deployment. 80% of the book price and 100% of gifts (minus processing) go to {author.name}.</p>
          </div>

          <div className="co-author">
            <div className="co-author-head">
              <Portrait author={author} size={84} />
              <div>
                <p className="eyebrow plum tightm">The mama you're supporting</p>
                <h3>{author.name}</h3>
              </div>
            </div>
            <p className="co-story">{author.supportLine}</p>
            <p className="co-story soft">{author.story[0]}</p>
            <h3 className="bd-h">Add a little extra love</h3>
            <div className="gift-grid">
              {GIFTS.map((g) => (
                <button key={g.id} className={"gift" + (picked[g.id] ? " on" : "")} onClick={() => toggle(g.id)} aria-pressed={!!picked[g.id]}>
                  <span className="gift-top"><strong>{g.label}</strong><em>${g.amt}</em></span>
                  <span className="gift-desc">{g.desc}</span>
                </button>
              ))}
            </div>
            <p className="fine">Gifts are optional, anonymous unless you say otherwise, and go directly to the author.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Cart Page ---- */
function CartPage({ cart, removeFromCart, go, onCheckout, checkoutLoading }) {
  const [gifts, setGifts] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const giftTotal = GIFTS.reduce((s, g) => s + (gifts[g.id] ? g.amt : 0), 0);
  const itemTotal = cart.reduce((s, c) => s + c.price, 0);
  const total = itemTotal + giftTotal;
  const toggle = (id) => setGifts(prev => ({ ...prev, [id]: !prev[id] }));
  const empty = cart.length === 0;

  if (empty) return (
    <section className="morning page-top">
      <div className="wrap narrow center" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🛍</p>
        <h2>Your bag is empty</h2>
        <p className="lead" style={{ marginBottom: 28 }}>Find a book that speaks to where your family is right now.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-gold" onClick={() => go("books")}>Browse all books</button>
          <button className="btn-line dark" onClick={() => go("packs")}>Explore book packs</button>
        </div>
      </div>
    </section>
  );

  return (
    <section className="morning page-top">
      <div className="wrap">
        <button className="btn-text" onClick={() => go("books")}>← Keep browsing</button>
        <h2 style={{ marginBottom: 28 }}>Your bag</h2>
        <div className="checkout-grid">
          <div className="co-order">
            {/* Items */}
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.cartId} className="cart-item">
                  <div className="cart-item-cover" style={{ background: `linear-gradient(160deg,${(item.grad||["#1A1530","#2A2150"])[0]},${(item.grad||["#1A1530","#2A2150"])[1]})` }}>
                    <span style={{ fontSize: 20 }}>{item.motif === "bag" ? "👜" : item.motif === "lantern" ? "🏮" : item.motif === "heart" ? "🩷" : item.motif === "house" ? "🏠" : "🌙"}</span>
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-title">{item.title}</p>
                    {item.authorName && <p className="cart-item-by">by {item.authorName}</p>}
                    <p className="cart-item-type">{item.type === "pack" ? "Book Pack" : item.format === "physical" ? "Physical Book" : item.format === "pdf" ? "Digital Book (PDF)" : "Digital Book"}</p>
                  </div>
                  <div className="cart-item-right">
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                    <button className="cart-remove" onClick={() => removeFromCart(item.cartId)} aria-label={`Remove ${item.title} from cart`}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Gifts */}
            {GIFTS.filter(g => gifts[g.id]).length > 0 && (
              <div className="co-lines" style={{ marginTop: 16 }}>
                {cart.map(item => <p key={item.cartId}><span>{item.title}</span><span>${item.price.toFixed(2)}</span></p>)}
                {GIFTS.filter(g => gifts[g.id]).map(g => <p key={g.id}><span>{g.label}</span><span>${g.amt.toFixed(2)}</span></p>)}
                <p className="co-total"><span>Total</span><span>${total.toFixed(2)}</span></p>
              </div>
            )}
            {GIFTS.filter(g => gifts[g.id]).length === 0 && (
              <div className="co-lines" style={{ marginTop: 16 }}>
                {cart.map(item => <p key={item.cartId}><span>{item.title}</span><span>${item.price.toFixed(2)}</span></p>)}
                <p className="co-total"><span>Total</span><span>${total.toFixed(2)}</span></p>
              </div>
            )}

            {/* Policy consent */}
            <label className="cart-consent">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <span>I agree to the <button className="link" onClick={() => go("policy-terms")}>Terms of Sale</button>, <button className="link" onClick={() => go("policy-refund")}>Refund Policy</button>, and <button className="link" onClick={() => go("policy-license")}>Digital Product License</button>. I understand digital downloads are final sale once delivered.</span>
            </label>

            <input
              type="email"
              placeholder="Email for your receipt"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #ECD9C5", fontSize: 15, marginTop: 12, boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <button
              className="btn-gold full"
              disabled={!agreed || checkoutLoading}
              style={{ opacity: (agreed && !checkoutLoading) ? 1 : 0.5, marginTop: 12 }}
              onClick={() => onCheckout(cart, gifts, total, email)}
            >
              {checkoutLoading ? "Redirecting to checkout…" : `Complete purchase — $${total.toFixed(2)}`}
            </button>
            <p className="fine" style={{ marginTop: 12 }}>Secure checkout via Stripe. 75% of every direct sale goes to the author.</p>
          </div>

          <div className="co-author">
            <h3 className="bd-h">Add a little extra love</h3>
            <p className="lead" style={{ fontSize: 15 }}>Optional support gifts go directly to the author (100% minus processing).</p>
            <div className="gift-grid" style={{ marginTop: 16 }}>
              {GIFTS.map(g => (
                <button key={g.id} className={"gift" + (gifts[g.id] ? " on" : "")} onClick={() => toggle(g.id)} aria-pressed={!!gifts[g.id]}>
                  <span className="gift-top"><strong>{g.label}</strong><em>${g.amt}</em></span>
                  <span className="gift-desc">{g.desc}</span>
                </button>
              ))}
            </div>
            <p className="fine" style={{ marginTop: 12 }}>Gifts are optional, anonymous unless you say otherwise, and go directly to the author.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThanksPage({ order, go }) {
  const [sessionData, setSessionData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      // Clean the URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
    }
    // Use order prop (demo) or session (Stripe)
    if (!order && !sessionId) return;
  }, []);

  const items = order?.items || [];
  const digitalItems = items.filter(i => i.type !== "merch");
  const giftAmt = Object.values(order?.gifts || {}).filter(Boolean).length * 5;

  if (!order && !window.location.search.includes("session_id")) return null;

  return (
    <section className="dusk page-top tall">
      <div className="wrap narrow center">
        <Moon size={44} />
        <h2 className="light">Thank you. 💜</h2>
        <p className="lead light" style={{ marginTop: 0 }}>A confirmation email is on its way to you.</p>

        {digitalItems.length > 0 && (
          <div className="thanks-card" style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 700, borderBottom: "1px solid rgba(226,168,87,.3)", paddingBottom: 10, marginBottom: 10 }}>
              <span>Your books are ready to read:</span>
            </p>
            {digitalItems.map(item => (
              <p key={item.cartId || item.id} style={{ alignItems: "center" }}>
                <button
                  className="btn-text"
                  style={{ color: "#E2A857", fontWeight: 700, textAlign: "left", padding: 0 }}
                  onClick={() => go("book", item.id)}
                >
                  {item.title} →
                </button>
              </p>
            ))}
          </div>
        )}

        <div className="thanks-card">
          {items.map(item => (
            <p key={item.cartId || item.id}>
              <span>{item.title} — to author (75%)</span>
              <span>${(item.price * 0.75).toFixed(2)}</span>
            </p>
          ))}
          {giftAmt > 0 && <p><span>Your support gifts (100%)</span><span>${giftAmt.toFixed(2)}</span></p>}
          <p><span>To the studio — keeps publishing free</span><span>${(items.reduce((s,i)=>s+i.price,0)*0.25).toFixed(2)}</span></p>
          <p className="t-total"><span>Children get braver words</span><span>priceless</span></p>
        </div>

        <p className="lead light center-text" style={{ marginTop: 20 }}>
          You didn't just buy a book — you helped a mother rebuild, in her own words.
        </p>
        <button className="btn-gold" onClick={() => go("books")}>Keep browsing</button>
      </div>
    </section>
  );
}

function AuthorsPage({ go }) {
  return (
    <section className="morning page-top">
      <div className="wrap">
        <p className="eyebrow plum">The author mamas</p>
        <h2>Every book here has a mother behind it.</h2>
        <p className="lead">
          Our authors write under the names that keep them safe — illustrated portraits
          protect privacy until an author chooses otherwise. What they earn is theirs to
          keep: 75% of every sale.
        </p>
        <div className="author-grid">
          {Object.values(AUTHORS).map((a) => (
            <button key={a.id} className="author-tile" onClick={() => go("author", a.id)}>
              <Portrait author={a} size={86} />
              <h3>{a.name}</h3>
              <p>{a.tagline}</p>
              <span className="btn-text">Read her story →</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthorPage({ author, go, toast }) {
  const books = BOOKS.filter((b) => b.author === author.id);
  return (
    <section className="morning page-top">
      <div className="wrap">
        <button className="btn-text" onClick={() => go("authors")}>← All authors</button>
        <div className="author-detail">
          <div className="ad-left">
            <Portrait author={author} size={150} />
            <button className="btn-line dark full" onClick={() => toast(`Author support gifts connect to Stripe when deployed — 100% goes to ${author.name}, minus processing fees.`)}>
              Send extra love to {author.name.split(" ")[0]}
            </button>
            <p className="fine center-text">Gifts go directly to the author. Pen names and illustrated portraits protect privacy; legal names are never published.</p>
          </div>
          <div>
            <h2>{author.name}</h2>
            <p className="lead">{author.tagline}</p>
            <p className="author-intro">{author.intro}</p>
            {author.story.map((p, i) => <p key={i} className="author-para">{p}</p>)}
            <h3 className="bd-h">Books by {author.name.split(" ")[0]}</h3>
            <div className="book-grid small-grid">
              {books.map((b) => (
                <button key={b.id} className="book-tile" onClick={() => go("book", b.id)}>
                  <Cover book={b} />
                  <div className="tile-meta"><h3>{b.title}</h3><p className="tile-by">{displayAge(b)} · {b.status === "coming" ? "Coming soon" : "$" + b.price.toFixed(2)}</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   WHO-FOR CARDS
   ============================================================ */
const WHO_CARDS = [
  { icon: "♥", label: "You lived through hard family moments and believe children deserve honest language for them." },
  { icon: "✶", label: "You have an idea, a feeling, or a scene — even if you have no manuscript yet." },
  { icon: "☽", label: "You want privacy. A pen name, an illustrated portrait, or full anonymity is welcome here." },
  { icon: "□", label: "You have no savings, portfolio, or publishing experience to offer. That is not a requirement." },
  { icon: "❧", label: "You want to create something meaningful while you are still rebuilding." },
  { icon: "♥", label: "You believe a child should never feel alone in a hard moment — and you want to be the one who helps." },
];

const STEPS = [
  {
    n: "01",
    title: "Apply gently",
    body: "A short application about your idea, your goals, and the kind of child your book could help. No proof of anything is required.",
  },
  {
    n: "02",
    title: "Choose your privacy",
    body: "Use your real name, a pen name, or a private illustrated or symbolic author profile. You decide what the world sees.",
  },
  {
    n: "03",
    title: "Shape the story together",
    body: "You bring the lived wisdom. We bring the tools: AI-assisted drafting, editorial care, design support, and a publishing pathway. Your voice stays at the centre of every page.",
  },
  {
    n: "04",
    title: "Review with care",
    body: "Our team reviews every book for emotional safety, clarity, and tenderness. You receive warm, specific feedback. Nothing is published without your approval and ours.",
  },
  {
    n: "05",
    title: "Publish and earn",
    body: "Your book is published through Little Amour Books. Founding authors receive 75% of net royalties after direct costs.",
  },
];

const FAQS = [
  {
    q: "Do I need to be a writer?",
    a: "No. You need a story, a feeling, or a moment that a child could understand with softer words. We help with structure, drafting, design, editing, and publishing.",
  },
  {
    q: "Do I need to be an artist?",
    a: "No. We help create the visual direction and illustrations through our AI-assisted studio and design process.",
  },
  {
    q: "Do I have to use my real name?",
    a: "No. Pen names, illustrated portraits, and symbolic author profiles are all welcome.",
  },
  {
    q: "Do I have to prove what happened to me?",
    a: "No. We do not ask for court papers, proof, or graphic details. This is a publishing process, not an investigation.",
  },
  {
    q: "What does it cost?",
    a: "For founding survivor mother authors, admin and setup costs may be waived or sponsored. The publisher is sustained through its 25% share of net royalties after direct costs.",
  },
  {
    q: "Who publishes the book?",
    a: "Little Amour Books publishes approved books through its publishing process and publisher accounts. Authors approve the final files and listing before publication.",
  },
  {
    q: "Do I keep rights to my story?",
    a: "Rights and publishing terms are explained clearly before publication so you can review them before moving forward.",
  },
  {
    q: "Is this therapy or legal support?",
    a: "No. Little Amour Books is a publisher. Our books may offer soft language for hard family moments, but we do not provide therapy, crisis services, legal advice, or case support.",
  },
  {
    q: "Can my story be declined?",
    a: "Yes. We only publish stories that can be shaped into emotionally safe, child-centred books. We may decline stories that are revenge-focused, unsafe for children, too graphic, exploitative, or outside the current mission.",
  },
];

function WriteFAQ() {
  const [open, setOpen] = React.useState(null);
  return (
    <div className="wfaq">
      {FAQS.map((item, i) => (
        <div key={i} className={"wfaq-item" + (open === i ? " wfaq-open" : "")}>
          <button className="wfaq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{item.q}</span>
            <span className="wfaq-icon">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="wfaq-a">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

function WritePage({ go }) {
  return (
    <div className="write-page">

      {/* ── 1. HERO ─────────────────────────────────────── */}
      <section className="write-hero">
        <div className="write-stars" aria-hidden="true">
          {[...Array(26)].map((_, i) => (
            <span key={i} className="write-star" style={{
              left: `${Math.floor((i * 37 + 11) % 97)}%`,
              top: `${Math.floor((i * 53 + 7) % 88)}%`,
              animationDelay: `${(i * 0.4) % 3}s`,
              width: i % 3 === 0 ? "3px" : "2px",
              height: i % 3 === 0 ? "3px" : "2px",
            }} />
          ))}
        </div>
        <div className="wrap write-hero-inner">
          <Reveal>
            <p className="eyebrow rose" style={{ marginBottom: 14 }}>Survivor mother with a story children need?</p>
            <h1 className="write-hero-h">Your story can become<br />a gentle children's book.</h1>
            <p className="write-hero-sub">
              Little Amour Books helps survivor mothers turn lived wisdom into children's books
              for hard family moments. You do not need a manuscript, a portfolio, savings, or
              publishing experience. Bring the moment, the feeling, and the truth you wish someone
              had explained softly. We help shape the book with you.
            </p>
            <div className="write-hero-ctas">
              <button className="btn-gold" onClick={() => go("apply")}>Apply to Write With Us</button>
              <a href="#how-it-works" className="write-hero-link">How it works &darr;</a>
            </div>
            <p className="write-hero-note">Pen names and illustrated author profiles are welcome. · <button onClick={() => go("legal")} style={{background:"none",border:"none",color:"#E5AC9F",textDecoration:"underline",cursor:"pointer",fontSize:"inherit",padding:0}}>Read the Author Agreement</button></p>
          </Reveal>
        </div>
      </section>

      {/* ── 2. EMOTIONAL INVITATION ─────────────────────── */}
      <section className="write-invitation">
        <div className="wrap write-inv-inner">
          <Reveal>
            <div className="write-inv-line" aria-hidden="true" />
            <h2 className="write-inv-h">Your story may be the soft place<br />another family needs.</h2>
            <p className="write-inv-p">
              Some mothers carry stories they never wanted to live — court days, leaving, fear, grief,
              safe homes, big feelings, starting over. Inside those stories may be the words another
              child needs to feel less alone.
            </p>
            <p className="write-inv-p">
              Little Amour Books exists because those stories deserve to exist in the world — not as
              testimony, not as proof, but as a book a child can hold when words are too hard
              to find.
            </p>
            <p className="write-inv-p write-inv-bold">
              You carried something heavy. You may also be carrying something a child somewhere
              quietly needs.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 3. WHO THIS IS FOR ──────────────────────────── */}
      <section className="write-who">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow plum center">This is for survivor mothers who</p>
            <div className="write-who-grid">
              {WHO_CARDS.map((c, i) => (
                <div key={i} className="write-who-card">
                  <span className="write-who-icon" aria-hidden="true">{c.icon}</span>
                  <p>{c.label}</p>
                </div>
              ))}
            </div>
            <p className="write-who-note">
              You do not have to share graphic details. You decide how much of your story you bring.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ─────────────────────────────── */}
      <section className="write-steps-section" id="how-it-works">
        <div className="wrap narrow">
          <Reveal>
            <p className="eyebrow plum center">The process</p>
            <h2 className="center" style={{ marginBottom: 40 }}>How it works</h2>
          </Reveal>
          <div className="write-steps">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="write-step">
                  <div className="write-step-num">{s.n}</div>
                  <div className="write-step-body">
                    <h3 className="write-step-title">{s.title}</h3>
                    <p className="write-step-text">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="center" style={{ paddingTop: 36 }}>
              <button className="btn-gold" onClick={() => go("apply")}>Apply to Write With Us</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5. AI STUDIO ────────────────────────────────── */}
      <section className="write-ai">
        <div className="wrap write-ai-inner">
          <Reveal>
            <div className="write-ai-tag">AI-assisted studio</div>
            <h2 className="write-ai-h">You bring the wisdom.<br />We bring the tools.</h2>
            <p className="write-ai-p">
              Our AI-assisted studio helps with structure, page drafts, visual direction, and design
              support. It drafts alongside you, not instead of you. The heart of the book is still
              yours — your lived wisdom, your approval, your final say.
            </p>
            <p className="write-ai-p">
              You do not need to know how to write, illustrate, or design. We help carry all of that.
              What only you can bring is the truth at the centre of the story.
            </p>
            <div className="write-ai-pills">
              <span className="write-ai-pill">Structure &amp; drafting</span>
              <span className="write-ai-pill">Page-by-page illustration</span>
              <span className="write-ai-pill">Design &amp; layout</span>
              <span className="write-ai-pill">Editorial care</span>
              <span className="write-ai-pill">Publishing support</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 6. EDITORIAL CARE ───────────────────────────── */}
      <section className="write-editorial">
        <div className="wrap narrow">
          <Reveal>
            <p className="eyebrow plum">What editorial care looks like</p>
            <h2 style={{ marginBottom: 28 }}>Your voice. Our care.<br />Your approval before anything moves.</h2>
            <div className="write-fb-card">
              <div className="write-fb-meta">
                <span className="write-fb-type editorial">Editorial note</span>
                <span className="write-fb-book">The Night We Packed the Blue Bag &middot; page 4</span>
              </div>
              <p className="write-fb-text">
                "This page is beautiful. One thought: the line <em>'we had to go fast'</em> may feel
                intense for a sensitive child. Could the blue bag carry the urgency instead? For
                example: <em>'The blue bag was ready before the kettle whistled.'</em> Your call —
                the heart of the page already works."
              </p>
            </div>
            <div className="write-fb-card approved">
              <div className="write-fb-meta">
                <span className="write-fb-type safety">Safety review</span>
                <span className="write-fb-book">Final pass</span>
                <span className="write-fb-approved">Approved</span>
              </div>
              <p className="write-fb-text">
                "Every page lands on reassurance. The child is never blamed, never burdened, and the
                ending is unmistakably safe. Approved for publication."
              </p>
            </div>
            <div className="write-ed-promises">
              <div className="write-ed-promise"><span className="write-ed-dot" />Feedback is warm and specific</div>
              <div className="write-ed-promise"><span className="write-ed-dot" />You retain agency over every revision</div>
              <div className="write-ed-promise"><span className="write-ed-dot" />Child safety is held as a non-negotiable</div>
              <div className="write-ed-promise"><span className="write-ed-dot" />Nothing is published without your approval and ours</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 7. ROYALTIES ────────────────────────────────── */}
      <section className="write-royalty">
        <div className="wrap narrow">
          <Reveal>
            <p className="eyebrow rose center">Author-first royalty model</p>
            <h2 className="center write-royalty-h">Built to pay survivor mothers.</h2>
            <div className="write-royalty-card">
              <div className="write-royalty-split">
                <div className="write-royalty-author">
                  <span className="write-royalty-pct">75%</span>
                  <span className="write-royalty-who">Founding author</span>
                </div>
                <div className="write-royalty-divider" />
                <div className="write-royalty-press">
                  <span className="write-royalty-pct small">25%</span>
                  <span className="write-royalty-who">Little Amour Books</span>
                </div>
              </div>
              <p className="write-royalty-desc">
                Founding authors receive <strong>75% of net royalties</strong> after direct costs.
                Little Amour Books keeps 25% to support editing, publishing, platform costs, and growth.
              </p>
              <div className="write-royalty-example">
                <span className="write-royalty-eg-label">Simple example</span>
                <p>If a sale creates $10 in net royalties after direct costs — the founding author receives $7.50 and Little Amour receives $2.50.</p>
              </div>
              <p className="write-royalty-note">
                Direct costs may include printing, Amazon or KDP fees, payment processing, delivery,
                and other direct production or sale costs. These are tracked transparently and shown
                in your author dashboard.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 8. PRIVACY ──────────────────────────────────── */}
      <section className="write-privacy">
        <div className="wrap narrow">
          <Reveal>
            <p className="eyebrow plum">Privacy &amp; safety</p>
            <h2 style={{ marginBottom: 10 }}>Your privacy matters here.</h2>
            <p className="write-priv-lead">We protect the child reader. We protect the author. We protect the dignity of the story.</p>
            <div className="write-priv-grid">
              {[
                "Pen names are welcome",
                "Illustrated or symbolic author portraits available",
                "No graphic details required",
                "No proof of trauma required",
                "No court papers required",
                "You choose how much of your story you share",
                "We do not publish revenge-focused or adult-unsafe content",
                "We do not publish content that burdens or blames children",
              ].map((item, i) => (
                <div key={i} className="write-priv-item">
                  <span className="write-priv-check" aria-hidden="true">&#10003;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 9. FAQ ──────────────────────────────────────── */}
      <section className="write-faq-section">
        <div className="wrap narrow">
          <Reveal>
            <p className="eyebrow plum center">Questions</p>
            <h2 className="center" style={{ marginBottom: 32 }}>Honest answers.</h2>
            <WriteFAQ />
          </Reveal>
        </div>
      </section>

      {/* ── 10. FINAL CTA ───────────────────────────────── */}
      <section className="write-final-cta">
        <div className="wrap narrow center">
          <Reveal>
            <Moon size={40} color="#E2A857" />
            <h2 className="write-final-h">Have a story children need?</h2>
            <p className="write-final-sub">
              If you are a survivor mother with a story that could help a child feel safer, softer, or
              less alone, we would be honoured to read your application.
            </p>
            <div className="write-final-btns">
              <button className="btn-gold" onClick={() => go("apply")}>Apply to Write With Us</button>
              <a href="mailto:hi@littleamourbooks.com" className="write-hero-link">Questions? Contact us</a>
            </div>
            <p className="write-hero-note">Applying creates no obligation on either side.</p>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

const APPLY_THEMES = [
  { value: "court",        label: "Court & Legal Days" },
  { value: "safe-home",    label: "Leaving & Safe Homes" },
  { value: "big-feelings", label: "Big Feelings & Anxiety" },
  { value: "two-homes",    label: "Two Homes / Custody" },
  { value: "quiet-courage",label: "Quiet Courage" },
  { value: "transitions",  label: "Big Changes & Transitions" },
  { value: "promises",     label: "Broken Promises" },
  { value: "suggest-new",  label: "I have a new theme idea →" },
];

/* ============================================================
   AUTHOR LEGAL PAGE — Publishing Agreement + Public Overview
   ============================================================ */
function AuthorLegalPage({ go }) {
  return (
    <section className="morning page-top">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <p className="eyebrow plum">Author Resources</p>
        <h2 style={{ marginBottom: 8 }}>Author Publishing Agreement<br />& Rights Overview</h2>
        <p className="lead" style={{ marginBottom: 32 }}>
          Plain-English first. Full legal terms below. Both matter — please read both.
        </p>

        {/* ── PLAIN ENGLISH ── */}
        <div style={{ background: "#F0EBF8", border: "1.5px solid #C4A8D8", borderRadius: 14, padding: "28px 32px", marginBottom: 36 }}>
          <p style={{ color: "#6E5572", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Plain-English Summary</p>
          <p style={{ color: "#2B2433", fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>
            <strong>Your story is always yours.</strong> Your lived experience, personal memories, and ideas belong to you and no contract changes that.
          </p>
          <p style={{ color: "#2B2433", fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>
            <strong>The completed book is a shared creation.</strong> Little Amour Books invests significantly in the illustrations, cover design, layout, formatting, publishing files, product pages, and sales infrastructure for every book. That investment means the completed Little Amour Books edition — the illustrated, designed, formatted, published book — stays in our catalog.
          </p>
          <p style={{ color: "#2B2433", fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>
            <strong>Published books remain in the catalog.</strong> Once a book is published, you cannot require Little Amour Books to remove it from the website or take the completed Little Amour Books edition elsewhere. This protects the investment we make together, and ensures readers can always find and access the book.
          </p>
          <p style={{ color: "#2B2433", fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>
            <strong>You keep earning.</strong> Your royalty share continues for as long as the book is sold. You receive 75% of every direct sale and 75% of net Amazon royalties.
          </p>
          <p style={{ color: "#2B2433", fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>
            <strong>You can write other books.</strong> You are free to write other books, tell your personal story generally, create unrelated works, and work with other publishers on entirely different projects.
          </p>
          <p style={{ color: "#2B2433", fontSize: 15, lineHeight: 1.8, marginBottom: 0 }}>
            <strong>Safety and privacy always come first.</strong> You can request a safety, privacy, correction, or legal review at any time. If something in the book puts you, your children, or another person at risk, we will act. Our team retains final discretion over any changes, but we take every concern seriously.
          </p>
        </div>

        {/* ── FULL AGREEMENT ── */}
        <div style={{ color: "#2B2433" }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: 22, marginBottom: 24 }}>Little Amour Books — Author Publishing Agreement</h3>

          <p style={{ color: "#6E5572", fontSize: 13, marginBottom: 28 }}>
            Effective upon submission of an Author Application or acceptance of a publishing offer from Little Amour Books. This Agreement governs the relationship between the Author and Little Amour Books with respect to the Work described herein.
          </p>

          {[
            {
              n: "1", title: "Definitions",
              body: `"Author" means the individual who submitted an application and whose personal story, ideas, or lived experience forms the basis of the Work.\n\n"Work" means the completed illustrated children's book, including all text, illustrations, cover design, back cover design, interior layout, formatting, publishing files, digital files, print-ready files, EPUB files, metadata, product listing copy, and all associated materials created, generated, edited, commissioned, or produced by or through Little Amour Books in connection with the Author's story.\n\n"Little Amour Books Assets" means all illustrations (AI-assisted or otherwise), cover designs, back cover designs, layout and interior files, formatted interiors, character profiles, style guides, prompts and prompt history, source files, templates, metadata, product listing copy, marketing assets, export files, print-ready files, digital PDF files, EPUB files, website product pages, and all Little Amour Books branding and imprint materials.\n\n"Underlying Story" means the Author's original lived experiences, personal memories, ideas, and any pre-existing written materials the Author owned before engaging with the Little Amour Books studio.`
            },
            {
              n: "2", title: "Author's Retained Rights",
              body: `The Author retains full ownership of their Underlying Story — their lived experiences, personal memories, and ideas — at all times. Nothing in this Agreement transfers the Author's personal story to Little Amour Books.\n\nThe Author remains free to:\n(a) tell their personal story in other contexts;\n(b) write other unrelated books;\n(c) work with other publishers on entirely different, unrelated projects;\n(d) create other original works that do not reproduce or substantially recreate the Little Amour Books edition of the Work.`
            },
            {
              n: "3", title: "Publishing License Granted to Little Amour Books",
              body: `The Author grants to Little Amour Books an exclusive, worldwide, perpetual (for the full term of copyright), royalty-bearing license to publish, sell, distribute, display, advertise, market, license, sublicense, and otherwise commercially exploit the Work and all components of the Work through any channels, formats, or platforms, including but not limited to the Little Amour Books website, Amazon, other digital and print retailers, libraries, educational institutions, and any future distribution channels.\n\nThis license is exclusive as to the Work in the form created through the Little Amour Books studio. "Exclusive" means the Author may not publish, sell, distribute, license, or authorize any third party to exploit:\n(a) the same Work;\n(b) a substantially similar version of the same Work;\n(c) any version using Little Amour Books Assets;\n(d) any version using Little Amour-created illustrations, covers, layouts, character designs, style guides, or publishing files;\n(e) any derivative or adapted version that substantially recreates the Little Amour Books published edition;\nwithout prior written permission from Little Amour Books.\n\nThe default term of this license is the full duration of copyright (including any extensions), unless terminated earlier by Little Amour Books in writing or as otherwise required by law. There is no default reversion of rights to the Author based solely on the passage of time or sales performance.`
            },
            {
              n: "4", title: "Little Amour Books Ownership of Studio Assets",
              body: `Little Amour Books owns or controls, to the fullest extent permitted by applicable law, all Little Amour Books Assets, including but not limited to:\n\n• AI-assisted and human-edited illustrations\n• Cover designs and back cover designs\n• Layout files and formatted interiors\n• Character profiles and visual character bibles\n• Style guides and prompt history\n• Source files and templates\n• Metadata and product listing copy\n• Marketing assets and social media materials\n• Export files, print-ready files, digital PDF files, and EPUB files\n• Website product pages and Little Amour Books imprint materials\n\nThese assets are created through significant investment of creative, technical, editorial, publishing, and marketing resources by Little Amour Books and do not transfer to the Author under this Agreement.`
            },
            {
              n: "5", title: "No Author-Controlled Removal After Publication",
              body: `The Author acknowledges that Little Amour Books makes substantial investments in creating the Work, and that removal of the Work after publication would cause harm to Little Amour Books and to readers who rely on the availability of the Work.\n\nAccordingly, the Author may not require Little Amour Books to remove, unpublish, disable, hide, or stop selling the Work after publication, except where:\n(a) required by a court order or applicable law; or\n(b) Little Amour Books determines, in its sole reasonable discretion, that removal or restriction is necessary for legal, privacy, safety, child-protection, platform-policy, or ethical reasons.\n\nIf the Author ceases to participate, closes their account, or no longer wishes to promote the Work:\n(i) Little Amour Books may continue selling and distributing the published Work;\n(ii) the Author remains eligible for their revenue share under this Agreement unless terminated for breach;\n(iii) the Author cannot demand removal merely because they have changed their mind or because the Work has become commercially successful;\n(iv) the Author cannot take the completed Little Amour Books edition elsewhere or license it to a third party;\n(v) the Author may request privacy changes such as pen name modification, hidden author photo, updated or removed bio, or changed location details, which Little Amour Books will implement in good faith within a reasonable time.`
            },
            {
              n: "6", title: "Safety, Privacy, and Legal Review",
              body: `The Author may request a safety, privacy, correction, or legal review at any time by contacting hello@littleamour.com.\n\nLittle Amour Books will review all such requests promptly and in good faith. Little Amour Books retains final discretion over whether to edit, update, restrict, pause, or remove the Work in response to any such request.\n\nLittle Amour Books also retains the right to pause, restrict, edit, or remove the Work at any time, without prior notice to the Author, where Little Amour Books determines in its reasonable judgment that any of the following circumstances exist:\n(a) a credible legal claim, copyright dispute, or trademark conflict;\n(b) a privacy concern involving the Author, a child, or a third party;\n(c) a defamation concern;\n(d) a child safety concern;\n(e) a court order or protective order;\n(f) a platform or distributor policy issue;\n(g) a safety risk to the Author, a child, a survivor, or any third party;\n(h) materials submitted without necessary permissions from third parties;\n(i) a payment dispute, fraud concern, or breach of this Agreement;\n(j) a reputational or ethical concern determined in Little Amour Books' reasonable judgment.\n\nWhere operationally feasible and legally permissible, Little Amour Books will notify the Author of any action taken under this section.`
            },
            {
              n: "7", title: "Royalties and Revenue Share",
              body: `In consideration of the publishing license granted herein, Little Amour Books agrees to pay the Author a royalty of:\n• 75% of net revenue from direct sales through the Little Amour Books website;\n• 75% of net royalties received from third-party platforms including Amazon KDP.\n\n"Net revenue" means gross receipts less any applicable transaction fees, platform fees, or payment processing costs.\n\nRoyalties will be paid on a schedule communicated to the Author. Little Amour Books will maintain reasonable records of sales and provide the Author access to their royalty information through the Author Studio portal.\n\n100% of reader gift contributions go directly to the Author.`
            },
            {
              n: "8", title: "Author Warranties and Representations",
              body: `The Author represents and warrants that:\n(a) they have the right to submit their Underlying Story and any pre-existing materials provided to Little Amour Books;\n(b) the Underlying Story and any pre-existing materials do not infringe the intellectual property rights, privacy rights, or any other rights of any third party;\n(c) they have not and will not submit materials containing another person's identifiable private information without appropriate consent;\n(d) they will not take any action designed to circumvent or undermine Little Amour Books' publishing rights under this Agreement.`
            },
            {
              n: "9", title: "Termination",
              body: `Little Amour Books may terminate this Agreement, in whole or in part, by written notice to the Author in the event of:\n(a) material breach of this Agreement by the Author;\n(b) the Author's fraudulent misrepresentation in their application or in materials submitted to the studio;\n(c) a court order, regulatory requirement, or legal obligation requiring termination;\n(d) circumstances requiring removal under Section 6 where continuation of the Agreement is no longer appropriate.\n\nUpon termination by Little Amour Books, the publishing license terminates and Little Amour Books will cease active sales of the Work within a commercially reasonable time, subject to fulfillment of any pre-existing orders or distributor obligations.\n\nThe Author may not unilaterally terminate this Agreement or revoke the publishing license granted herein.`
            },
            {
              n: "10", title: "Governing Law and Disputes",
              body: `This Agreement is governed by applicable law. In the event of any dispute, the parties agree to attempt good-faith resolution before pursuing formal legal proceedings. Nothing in this Agreement prevents either party from seeking injunctive or emergency relief where necessary.`
            },
            {
              n: "11", title: "No Legal or Therapeutic Services",
              body: `Little Amour Books is a publisher. Nothing in this Agreement or in the services provided by Little Amour Books constitutes legal advice, therapeutic services, crisis support, or case representation. Authors are encouraged to seek independent legal advice regarding this Agreement.`
            },
            {
              n: "12", title: "Entire Agreement",
              body: `This Agreement, together with any separate publishing offer letter or addendum issued by Little Amour Books, constitutes the entire agreement between the parties with respect to the Work and supersedes all prior representations, understandings, and agreements.`
            },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid #E8DDF0" }}>
              <h4 style={{ color: "#6E5572", fontFamily: "Georgia,serif", fontSize: 16, marginBottom: 8 }}>
                {n}. {title}
              </h4>
              {body.split("\n\n").map((para, i) => (
                <p key={i} style={{ color: "#2B2433", fontSize: 14, lineHeight: 1.85, marginBottom: 10, whiteSpace: "pre-line" }}>{para}</p>
              ))}
            </div>
          ))}

          <div style={{ background: "#F0EBF8", borderRadius: 10, padding: "20px 24px", marginTop: 8 }}>
            <p style={{ color: "#6E5572", fontSize: 13, margin: 0 }}>
              Questions about this agreement? Email <strong>hello@littleamour.com</strong>. We encourage all authors to seek independent legal advice before signing. Applying to Little Amour Books creates no immediate obligation — the formal agreement is signed during onboarding after acceptance.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
          <button className="btn-gold" onClick={() => go("apply")}>Apply to Write With Us</button>
          <button className="btn-line" onClick={() => go("write")}>← Back</button>
        </div>
      </div>
    </section>
  );
}


function ApplyPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", whatsapp: "",
    pen: "", stage: "Just an idea",
    theme: "", suggestThemeName: "", suggestThemeDesc: "",
    issue: "", feeling: "", avoid: "",
    instagram: "", tiktok: "", facebook: "",
    couponCode: "",
    consent: false,
    // Publishing agreement initials
    init1: "", init2: "", init3: "", init4: "", init5: "", init6: "",
    agreementAccepted: false,
  });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);

  const checkCoupon = async () => {
    const code = form.couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponStatus("checking");
    const { data } = await supabase.from("launch_coupons").select("*").eq("code", code).single();
    if (!data) { setCouponStatus("invalid"); return; }
    if (data.used_at) { setCouponStatus("used"); return; }
    setCouponStatus("valid");
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.issue.trim()) {
      setErr("Your legal name, email, and story idea are the only things we need to welcome you.");
      return;
    }
    if (!form.consent) { setErr("Please tick the confirmation box so we know we're on the same page."); return; }
    const initials = [form.init1, form.init2, form.init3, form.init4, form.init5, form.init6];
    if (initials.some(i => !i.trim())) {
      setErr("Please initial each clause in the Publishing Agreement section to confirm you have read and understood it.");
      return;
    }
    if (!form.agreementAccepted) {
      setErr("Please confirm your acceptance of the Publishing Agreement before submitting.");
      return;
    }
    if (form.theme === "suggest-new" && !form.suggestThemeName.trim()) {
      setErr("Give your new theme a short name so we know what you are thinking.");
      return;
    }
    setErr("");

    // Build contact note for phone/whatsapp (stored in admin_note until columns are added)
    const contactNote = [
      form.phone.trim() ? `Phone: ${form.phone.trim()}` : null,
      form.whatsapp.trim() ? `WhatsApp: ${form.whatsapp.trim()}` : null,
    ].filter(Boolean).join(" | ") || null;

    try {
      const feeWaived = couponStatus === "valid";
      const couponCode = form.couponCode.trim().toUpperCase() || null;

      await supabase.from("author_applications").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        pen_name: form.pen.trim() || null,
        stage: form.stage || null,
        theme: form.theme || null,
        suggested_theme_name: form.theme === "suggest-new" ? form.suggestThemeName.trim() || null : null,
        book_title: null,
        book_idea: form.issue.trim() || null,
        admin_note: contactNote,
        status: "new",
        coupon_code: couponCode,
        fee_waived: feeWaived,
        consent_initials: JSON.stringify({
          i1: form.init1.trim(), i2: form.init2.trim(), i3: form.init3.trim(),
          i4: form.init4.trim(), i5: form.init5.trim(), i6: form.init6.trim(),
        }),
        agreement_accepted: true,
        agreement_accepted_at: new Date().toISOString(),
      });

      // Mark coupon as used
      if (feeWaived && couponCode) {
        await supabase.from("launch_coupons").update({ used_by_email: form.email.trim(), used_at: new Date().toISOString() }).eq("code", couponCode);
      }
    } catch (e) { /* non-fatal */ }

    if (form.theme === "suggest-new" && form.suggestThemeName.trim()) {
      try {
        await supabase.from("proposed_categories").insert({
          proposed_by: form.email,
          name: form.suggestThemeName.trim(),
          description: form.suggestThemeDesc.trim() || null,
          example_book_idea: form.issue.trim() || null,
          status: "pending",
        });
      } catch (e) { /* non-fatal */ }
    }
    setSent(true);
  };

  if (sent) {
    return (
      <section className="dusk page-top tall">
        <div className="wrap narrow center">
          <Moon size={44} />
          <h2 className="light">It's with us now.</h2>
          <p className="lead light center-text">
            Thank you, {form.name.split(" ")[0]}. We read every application slowly and
            kindly — usually within two weeks. There is no wrong way to have filled this
            in, and there is no rush on our side or yours.
          </p>
          <p className="lead light center-text">Whatever happens next: your story matters, and so do you.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="morning page-top">
      <div className="wrap form-wrap">
        <p className="eyebrow plum">The application</p>
        <h2>Tell us a little.<br />Only what you want.</h2>
        <p className="lead">
          No proof. No court papers. No graphic details — please do not relive anything
          for this form. We are asking about the book you want to make, not the things you survived.
        </p>

        {/* Privacy notice */}
        <div className="apply-privacy-box">
          <div className="apply-privacy-lock" aria-hidden="true">&#128274;</div>
          <div>
            <p className="apply-privacy-title">Your legal information stays with our team only.</p>
            <p className="apply-privacy-body">
              Like any publisher, we need your legal name and contact details for our author
              agreement and royalty payments. What the world sees on your book, in your author
              bio, and on any public profile is entirely your choice.
            </p>
            <p className="apply-privacy-body">
              You may publish under a <strong>pen name</strong>, use an
              <strong> illustrated or symbolic portrait</strong>, or share no identifying
              information publicly at all. Your legal details are never shared with readers,
              other authors, or the public.
            </p>
          </div>
        </div>

        <div className="form">

          {/* Legal contact */}
          <div className="apply-section-label">Your legal contact details</div>
          <p className="apply-section-note">Used internally for your author agreement and payments only. Never shown publicly.</p>

          <label><span>Legal name *</span><input value={form.name} onChange={set("name")} autoComplete="name" placeholder="Your full legal name" /></label>
          <label><span>Email address *</span><input type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="your@email.com" /></label>

          <div className="form-row">
            <label>
              <span>Phone number <em className="apply-opt">(optional)</em></span>
              <input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+61 400 000 000" />
            </label>
            <label>
              <span>WhatsApp number <em className="apply-opt">(optional)</em></span>
              <input type="tel" value={form.whatsapp} onChange={set("whatsapp")} placeholder="+61 400 000 000" />
            </label>
          </div>

          {/* Public identity */}
          <div className="apply-section-label" style={{ marginTop: 12 }}>Your public identity — your choice</div>
          <p className="apply-section-note">This is what readers and the world will see. You are in complete control.</p>

          <label>
            <span>Pen name <em className="apply-opt">(optional — changeable anytime)</em></span>
            <input value={form.pen} onChange={set("pen")} placeholder="e.g., M. Voss, or leave blank to decide later" />
          </label>

          {/* Book */}
          <div className="apply-section-label" style={{ marginTop: 12 }}>Your book idea</div>

          <label><span>Where is your book right now?</span>
            <select value={form.stage} onChange={set("stage")}>
              <option>Just an idea</option>
              <option>Some notes or an outline</option>
              <option>A rough manuscript</option>
              <option>A finished manuscript</option>
            </select>
          </label>

          <label><span>Which theme does your book fall under? <em className="apply-opt">(optional)</em></span>
            <select value={form.theme} onChange={set("theme")}>
              <option value="">— Select a theme —</option>
              {APPLY_THEMES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>

          {form.theme === "suggest-new" && (
            <div className="suggest-theme-box">
              <p className="suggest-theme-note">
                New themes are reviewed before going live — usually within a week.
              </p>
              <label><span>Theme name *</span>
                <input value={form.suggestThemeName} onChange={set("suggestThemeName")}
                  placeholder="e.g., When a Grandparent Is in Jail" />
              </label>
              <label><span>What situations would this theme cover?</span>
                <textarea rows={2} value={form.suggestThemeDesc} onChange={set("suggestThemeDesc")}
                  placeholder="e.g., Children with incarcerated family members — shame, visiting day, explaining absence" />
              </label>
            </div>
          )}

          <label><span>What hard thing does your story gently speak to? *</span>
            <textarea rows={3} value={form.issue} onChange={set("issue")}
              placeholder="e.g., a child sensing family court stress; moving somewhere safe; big feelings after a hard season" />
          </label>

          <label><span>When a child finishes your book, what should they feel? <em className="apply-opt">(optional)</em></span>
            <textarea rows={2} value={form.feeling} onChange={set("feeling")}
              placeholder="e.g., safe, not at fault, still loved" />
          </label>

          <label><span>Anything you want us to avoid or be careful with? <em className="apply-opt">(optional)</em></span>
            <textarea rows={2} value={form.avoid} onChange={set("avoid")} />
          </label>

          {/* Social */}
          <fieldset className="social-set">
            <legend>Social media — optional, private to our team. Helps us hear your voice.</legend>
            <label><span>Instagram</span><input value={form.instagram} onChange={set("instagram")} placeholder="@yourname" /></label>
            <label><span>TikTok</span><input value={form.tiktok} onChange={set("tiktok")} placeholder="@yourname" /></label>
            <label><span>Facebook or other</span><input value={form.facebook} onChange={set("facebook")} placeholder="link or name" /></label>
          </fieldset>

          {/* ── PUBLISHING AGREEMENT INITIALS ── */}
          <div style={{ marginTop: 28, padding: "24px 28px", background: "#F0EBF8", borderRadius: 12, border: "1.5px solid #C4A8D8" }}>
            <p style={{ color: "#6E5572", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Publishing Agreement</p>
            <p style={{ color: "#5E5468", fontSize: 13, lineHeight: 1.7, marginBottom: 18 }}>
              Please initial beside each clause to confirm you have read and understood it.
              You can read the full agreement at{" "}
              <a href="#" onClick={e => { e.preventDefault(); /* go handled via button */ }} style={{ color: "#9b7eb8" }}>littleamour.com/legal</a>.
            </p>

            {[
              ["init1", "Little Amour Books invests in and controls the illustrated publishing package — including illustrations, cover, layout, formatting, files, and product pages — for every book made through the studio."],
              ["init2", "Published books remain in the Little Amour Books catalog. The license granted is for the full term of copyright and does not include a default reversion of rights based on time or sales performance."],
              ["init3", "I cannot require Little Amour Books to remove the book after publication simply because I change my mind or because the book becomes commercially successful."],
              ["init4", "I cannot take the completed Little Amour Books edition — including its illustrations, cover, layout, and publishing files — elsewhere or license it to a third party without written permission."],
              ["init5", "I keep my underlying story and lived experience, and I am free to write other unrelated books and work with other publishers on entirely different projects."],
              ["init6", "A safety, privacy, correction, or legal review is available to me at any time by contacting Little Amour Books, and will be acted on in good faith."],
            ].map(([field, text], idx) => (
              <div key={field} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: idx < 5 ? "1px solid #DDD3EA" : "none" }}>
                <div style={{ flexShrink: 0 }}>
                  <input
                    value={form[field]}
                    onChange={set(field)}
                    maxLength={4}
                    placeholder="Init."
                    style={{
                      width: 56, textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic",
                      fontSize: 16, padding: "6px 4px", borderRadius: 6,
                      border: `1.5px solid ${form[field].trim() ? "#9b7eb8" : "#C4A8D8"}`,
                      background: form[field].trim() ? "#fff" : "#F8F4FF",
                      color: "#2B2433", outline: "none",
                    }}
                  />
                </div>
                <p style={{ color: "#2B2433", fontSize: 14, lineHeight: 1.7, margin: 0 }}><strong>{idx + 1}.</strong> {text}</p>
              </div>
            ))}

            <label className="check" style={{ marginTop: 8, alignItems: "flex-start" }}>
              <input type="checkbox" checked={form.agreementAccepted} onChange={set("agreementAccepted")} style={{ marginTop: 3 }} />
              <span style={{ fontSize: 13, lineHeight: 1.65 }}>
                I have read and I accept the <strong>Little Amour Books Author Publishing Agreement</strong>. I understand that the completed Little Amour Books edition of my book will remain in the Little Amour Books catalog and cannot be removed or taken elsewhere except as provided in the Agreement.
              </span>
            </label>
          </div>

          {/* ── LAUNCH COUPON ── */}
          <div className="apply-coupon-wrap">
            <label className="apply-label">Launch invitation code <span className="apply-opt">(optional)</span></label>
            <p className="apply-coupon-hint">If Kirby sent you a personal invite code, enter it here to waive the registration fee.</p>
            <div className="apply-coupon-row">
              <input
                className={"apply-coupon-input" + (couponStatus === "valid" ? " valid" : couponStatus === "invalid" || couponStatus === "used" ? " invalid" : "")}
                type="text"
                placeholder="LAUNCH-XXXXX"
                value={form.couponCode}
                onChange={e => { set("couponCode")(e); setCouponStatus(null); }}
                onBlur={checkCoupon}
              />
              <button type="button" className="apply-coupon-btn" onClick={checkCoupon}>Apply</button>
            </div>
            {couponStatus === "valid"   && <p className="apply-coupon-ok">✓ Code accepted — registration fee waived for you.</p>}
            {couponStatus === "invalid" && <p className="apply-coupon-err">That code wasn't recognised. Try again or leave it blank.</p>}
            {couponStatus === "used"    && <p className="apply-coupon-err">This code has already been used.</p>}
            {couponStatus === "checking"&& <p className="apply-coupon-checking">Checking…</p>}
          </div>

          <label className="check" style={{ marginTop: 16 }}>
            <input type="checkbox" checked={form.consent} onChange={set("consent")} />
            <span>I understand that every book is reviewed for emotional safety before publication, and nothing is ever published without my approval and Little Amour Books' approval.</span>
          </label>

          {err ? <p className="form-err">{err}</p> : null}

          <button className="btn-gold" onClick={submit}>Send my application</button>

          <div className="apply-footer-note">
            <p>Your legal name, contact details, and social links are <strong>private to our team</strong> and will never be shared publicly.</p>
            <p>Applying creates no obligation on either side.</p>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ---- Author Persona Chooser (Kirby's admin shortcut) ---- */
function AuthorChooserPage({ account, onPickAuthor, onPickAdmin, onSignOut, go }) {
  const authors = [
    { id: "kirby", name: "Kirby Amour", tagline: "Survivor mama, storyteller, and founder.", grad: ["#4A3B6E","#8A6A8E"], photo: AUTHORS.kirby.photo },
    { id: "june",  name: "June Ellery",  tagline: "Former preschool teacher. Quiet courage.", grad: ["#6E3E50","#A4707E"], photo: null },
    { id: "mara",  name: "Mara Voss",    tagline: "Writer, gardener, mother of two.", grad: ["#2E4A5E","#5E8A96"], photo: null },
  ];
  return (
    <section className="morning page-top">
      <div className="wrap">
        <div className="row-between" style={{marginBottom:8}}>
          <div>
            <p className="eyebrow plum">Author switcher</p>
            <h2>Which author today?</h2>
            <p className="lead" style={{marginTop:4}}>Pick who you're working as.</p>
          </div>
          <button className="btn-text" onClick={onSignOut}>Sign out</button>
        </div>

        <div className="chooser-grid">
          {authors.map(a => (
            <button key={a.id} className="chooser-card" onClick={() => (a.id === "kirby" ? onPickAdmin() : onPickAuthor(a))}>
              {a.photo
                ? <img src={a.photo} alt={a.name} className="chooser-avatar-img" />
                : <div className="chooser-avatar" style={{background:`linear-gradient(135deg,${a.grad[0]},${a.grad[1]})`}}>
                    {a.name[0]}
                  </div>}
              <p className="chooser-name">{a.name}</p>
              <p className="chooser-tagline">{a.tagline}</p>
            </button>
          ))}
        </div>

        <button
          className="btn-text"
          style={{ marginTop: 28 }}
          onClick={() => go("admin")}
        >
          Open the full business admin platform (orders, pricing, SEO) →
        </button>
      </div>
    </section>
  );
}

/* ---------------- Sign in + author dashboard ---------------- */
function SignInPage({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const tryIn = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !pw) { setErr("Please enter your email and password."); return; }
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase
        .from("author_profiles")
        .select("*")
        .eq("email", e)
        .eq("password", pw)
        .eq("active", true)
        .maybeSingle();
      if (error || !data) {
        setErr("We don\'t recognize that email and password. Try again.");
      } else {
        onSignIn({ id: data.id, name: data.pen_name, email: data.email, isKirby: data.is_admin, photoUrl: data.photo_url || null });
      }
    } catch(ex) {
      setErr("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <section className="dusk page-top tall">
      <div className="wrap form-wrap">
        <p className="eyebrow rose">Author studio</p>
        <h2 className="light">Welcome back, mama.</h2>
        <p className="lead light">Your books, your feedback, your earnings — all in one quiet place.</p>
        <div className="form dark-form">
          <label><span>Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" onKeyDown={(e) => e.key === "Enter" && tryIn()} /></label>
          <label><span>Password</span><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" onKeyDown={(e) => e.key === "Enter" && tryIn()} /></label>
          {err ? <p className="form-err">{err}</p> : null}
          <button className="btn-gold" onClick={tryIn} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   KIRBY'S STUDIO — Amora-guided book creation
   Conversational build, Character Bible, drag-drop pages,
   per-page Amora chats, and a whole-book consistency check.
   ============================================================ */
const AMORA_SYS = "You are Amora, the warm, calm, trauma-informed book muse of Little Amour Books. You guide survivor mothers through making gentle children's picture books about hard things (family court, leaving, fear, rebuilding). Voice: kind, encouraging, plain, never clinical, never pressuring. Craft rules: ages 3-7, simple true language, never graphic, never blame or burden the child, every book bends toward reassurance and safety. Never rewrite the author's words unless she asks. Keep replies short and human.";

async function amora(prompt, system, maxTokens) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6", max_tokens: maxTokens || 1400,
      system: system || AMORA_SYS,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Studio tools unavailable");
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}
// Vision pass on existing book page images — extracts a precise style description
// so every new illustration truly matches the pages already in the book.
function toClaudeImageBlock(url) {
  if (!url) return null;
  const dataMatch = url.match(/^data:([^;]+);base64,(.+)$/);
  if (dataMatch) return { type: "image", source: { type: "base64", media_type: dataMatch[1], data: dataMatch[2] } };
  if (/^https?:\/\//.test(url)) return { type: "image", source: { type: "url", url } };
  return null;
}
const REFUSAL_OR_INVALID_TEXT = /\b(i can.?t|i cannot|i don.?t|i do not|no images?( were| was)? (attached|provided|included)|i.?m sorry|i am sorry|as an ai|i.?m unable|i am unable|unable to (see|view|access)|i need (an |some )?image|please (provide|attach|upload))\b/i;
function isInvalidVisionText(text) {
  if (!text || typeof text !== "string") return true;
  const t = text.trim();
  if (t.length < 30) return true;
  if (REFUSAL_OR_INVALID_TEXT.test(t)) return true;
  return false;
}

async function deriveStyleFromImages(dataUrls) {
  if (!dataUrls.length) return null;
  try {
    const content = [
      { type: "text", text: "These are pages from a children's picture book. Describe the visual art style in 4–5 sentences precise enough for an AI image generator to reproduce it on new pages. Cover: art medium, line quality, colour palette and saturation, rendering technique (flat/textured/painterly), character proportions and facial style, background treatment, mood. Be technical and specific — this description locks the style for every future page." },
        ...dataUrls.map(toClaudeImageBlock).filter(Boolean),
      ];
      if (!content.some((b) => b.type === "image")) return null;
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 350, messages: [{ role: "user", content }] }),
    });
    const data = await res.json();
const text = data.content?.[0]?.text?.trim() || null;
      if (isInvalidVisionText(text)) return null;
      return text;
  } catch (_) { return null; }
}
function parseLoose(text) {
  let t = text.replace(/```json|```/g, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a === -1 || b === -1) throw new Error("no json");
  return JSON.parse(t.slice(a, b + 1));
}
function parseLooseArray(text) {
  let t = text.replace(/```json|```/g, "").trim();
  const a = t.indexOf("["), b = t.lastIndexOf("]");
  if (a === -1 || b === -1) throw new Error("no json array");
  return JSON.parse(t.slice(a, b + 1));
}
// Vision pass on existing page art — reconciles the Character Bible with how characters
// actually look on the pages already in the book, instead of the text description drifting.
async function deriveCharactersFromImages(dataUrls, existingChars) {
  const bibleText = (existingChars || []).length
    ? existingChars.map((c) => `— ${c.name}: ${c.desc}`).join("\n")
    : "(no characters defined yet)";
  const content = [
    { type: "text", text: `These are pages from a children's picture book. The current Character Bible reads:\n${bibleText}\n\nLook closely at how each character actually appears across these pages — face, hair, skin tone, clothing, colours, recurring props. Rewrite the Character Bible so every entry matches the art exactly. Keep the same characters (don't invent new ones unless someone recurring and unnamed clearly needs a name — then pick a fitting one), but correct any detail that drifted from the text description. Return ONLY a JSON array, nothing else: [{"name":"...","desc":"full visual + emotional description, vivid enough to keep every future page consistent"}]` },
      ...dataUrls.map(toClaudeImageBlock).filter(Boolean),
    ];
    if (!content.some((b) => b.type === "image")) throw new Error("No readable page images to compare against.");
  const res = await fetch("/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, messages: [{ role: "user", content }] }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Studio tools unavailable");
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return parseLooseArray(text);
}

// Part of the Visual Kit (see buildVisualKit) — this is the "character sheet" for one
// character: a single clean reference portrait, NOT a multi-pose model sheet. Used both
// for the Characters-tab portrait and, once generated, as the literal image-to-image
// reference for that character's first page appearance.
async function genCharacterPortrait(character, styleGuide, seed) {
  const prompt = [
    `STYLE (locked): ${styleGuide || "warm, gentle children's picture-book illustration"}`,
    ``,
    SINGLE_IMAGE_FORMAT_RULE,
    ``,
    `Create a single character reference portrait — one character only, shown clearly from the chest up, on a simple plain background with no scene or props beyond what's needed to show them. This is one picture of one pose, not a sheet of multiple poses or angles.`,
    ``,
    `CHARACTER (exact, paintable detail — hair, skin tone, exact clothing items/colours, any accessory): ${character.name} — ${character.desc}`,
    ``,
    NO_TEXT_RULE,
    ``,
    `CONSISTENCY RULES: This image locks how ${character.name} looks in every future page — exact face, hair, skin tone, and clothing must be reusable as a reference.`,
  ].join("\n");
  const res = await fetch("/api/image", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, seed, negative_prompt: ILLUSTRATION_NEGATIVE_PROMPT, imageSize: "square_hd" }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.url;
}

// Part of the Visual Kit — a single character-free reference image locking the book's
// setting/location so pages set in "the same room/yard/etc." stay visually consistent
// instead of each page inventing its own version of the place from text alone.
async function genSettingReference(styleGuide, settingDesc, seed) {
  const prompt = [
    `STYLE (locked): ${styleGuide || "warm, gentle children's picture-book illustration"}`,
    ``,
    SINGLE_IMAGE_FORMAT_RULE,
    ``,
    `Create a single reference illustration of this book's setting/location only — no named characters in it. This locks what the place looks like (layout, furniture, colours, light) so every page set here matches it.`,
    ``,
    `SETTING: ${settingDesc || "a warm, cozy home"}`,
    ``,
    NO_TEXT_RULE,
  ].join("\n");
  const res = await fetch("/api/image", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, seed, negative_prompt: ILLUSTRATION_NEGATIVE_PROMPT, imageSize: "square_hd" }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.url;
}

// Generates one style-anchor sample image for a collection that hasn't been trained yet.
// Deliberately has NO named characters in it — only the locked style guide applied to a
// generic warm domestic scene. This matters: a style LoRA (see train-style.js) should
// learn "what this looks like," not "who these people are." Mixing character identity
// into the training set would bias the trained style toward one character's specific
// face/pose instead of the illustration technique itself.
async function genStyleSample(styleGuide, sceneIdea, seed) {
  const prompt = [
    `STYLE (locked): ${styleGuide || "warm, gentle children's picture-book illustration"}`,
    ``,
    SINGLE_IMAGE_FORMAT_RULE,
    ``,
    `Create a single picture-book illustration, with no named characters, in this exact style, depicting: ${sceneIdea}.`,
    ``,
    NO_TEXT_RULE,
  ].join("\n");
  const res = await fetch("/api/image", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, seed, negative_prompt: ILLUSTRATION_NEGATIVE_PROMPT }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.url;
}

// Part of the Visual Kit — unlike the character portrait (one person, blank background,
// no scene) or the setting reference (the place, no one in it), this is a real storybook
// SCENE: the protagonist actually placed inside the main setting, with real composition,
// depth, and environment. Page 1 anchors to this instead of the isolated portrait. A flat
// portrait has nothing for image-to-image to vary except the pose it's already showing, so
// anchoring page 1 to it just reproduced the portrait near-verbatim instead of painting the
// page's actual scene (confirmed live: "Sometimes things get very loud" came back as a
// blank-background character sheet, not an illustration). The Scene Anchor gives the model
// a real composition — protagonist + place + style — to build a new scene from.
async function genSceneAnchor(character, styleGuide, settingDesc, seed) {
  const who = character ? `${character.name} — ${character.desc}` : "the protagonist";
  const prompt = [
    `STYLE (locked): ${styleGuide || "warm, gentle children's picture-book illustration"}`,
    ``,
    SINGLE_IMAGE_FORMAT_RULE,
    ``,
    `Create a single full picture-book SCENE — not a character portrait and not a character reference sheet. Show the protagonist actually present and active within the book's main setting, with a real environment around them (furniture, light, depth, background) the way an actual finished page would look. This establishes how the protagonist looks IN PLACE in the story's world, so later pages can paint new scenes that build on it.`,
    ``,
    `PROTAGONIST (exact, paintable detail): ${who}`,
    ``,
    `SETTING: ${settingDesc || "a warm, cozy home"}`,
    ``,
    NO_TEXT_RULE,
    ``,
    `Do not render this as a posed reference sheet, a collage, or multiple panels — one single continuous illustrated scene only.`,
  ].join("\n");
  const res = await fetch("/api/image", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, seed, negative_prompt: ILLUSTRATION_NEGATIVE_PROMPT, imageSize: "square_hd" }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.url;
}

// Four varied, character-free domestic scenes — enough visual variety for the LoRA to
// learn "the style" rather than memorizing one composition.
const STYLE_SAMPLE_SCENES = [
  "a cozy reading nook with soft morning light through a window",
  "a quiet bedroom at night with a small nightlight glowing warmly",
  "a kitchen table set for breakfast with steam rising from a mug",
  "a garden path scattered with autumn leaves under a pale sky",
];

// Kicks off LoRA style training (fal-ai/flux-lora-fast-training via train-style.js) on a
// set of approved sample image URLs. Returns the fal.ai request id — training takes
// several minutes, so this does not block; the caller polls with checkStyleTrainingStatus.
async function startStyleTraining(images, triggerWord) {
  const res = await fetch("/api/train-style", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start", images, triggerWord }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.requestId;
}

// Polls one training job. Returns { status: "training" | "ready" | "failed", loraUrl? }.
async function checkStyleTrainingStatus(requestId) {
  const res = await fetch("/api/train-style", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "status", requestId }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// Picks a page-number rendering style that matches the book's visual aesthetic.
// Single source of truth for "this must be ONE coherent picture, not a layout of several."
// Added after a live trial produced multi-panel "concept board" pages instead of single
// illustrations, and fake lettering baked into the art (signs/speech-bubbles/posters) that
// the older text-ban list didn't cover because it only named plain typography, not text
// rendered as an in-scene object. Shared by every image-generating prompt in this file
// (page art, character portraits, style samples, setting references) so the rule can't
// drift out of sync between them.
const SINGLE_IMAGE_FORMAT_RULE = "FORMAT (locked, non-negotiable): exactly ONE single continuous illustration — one moment, one coherent scene, full bleed. NEVER a collage, grid, multi-panel layout, comic strip, storyboard, concept-art board, reference/model sheet with multiple poses or angles, or a split-screen of separate scenes stitched together.";

const NO_TEXT_RULE = "No text, letters, words, numbers, captions, titles, or lettering of any kind anywhere in the image. This includes signs, signage, speech bubbles, dialogue bubbles, posters, labels, nameplates, name tags, and any gibberish or fake writing made to look like text. The picture must read entirely through imagery — nothing is ever communicated through rendered text.";

const ILLUSTRATION_NEGATIVE_PROMPT = [
  "photo realistic", "3d render", "different clothing", "different hair", "different skin tone",
  "inconsistent character", "style change", "different art style", "cartoon", "anime",
  "changed proportions", "adult content", "violence", "scary imagery",
  "text", "letters", "words", "writing", "typography", "caption", "numbers", "watermark", "title card",
  "signature", "cursive marks", "artist signature", "AI signature", "logo",
  "multiple panels", "panel grid", "comic panels", "comic strip", "collage", "grid layout",
  "character sheet", "model sheet", "reference sheet", "concept art board", "concept board",
  "storyboard", "split screen", "multiple scenes in one image", "turnaround sheet",
  "speech bubble", "dialogue bubble", "sign", "signage", "poster", "label", "nameplate",
  "gibberish text", "fake text", "nonsense writing", "close-up portrait crop",
  "second child", "extra child", "unestablished character", "random additional person",
].join(", ");

// Builds the full locked, consistency-enforced prompt sent to /api/image for one page.
// The page's printed caption text and page number are NOT part of this prompt on purpose —
// they're rendered deterministically in code at export time (see Publishing.jsx makeBookPDF),
// in the same font/position/style on every single page, every time, with no chance of a typo
// or drift. Asking a diffusion model to paint exact words is unreliable even on good models,
// so the illustration's only job is the picture — no lettering, titles, or numerals at all.
// Pivot #5 (Jace) — Pivot #4 proved the tradeoff: a strict/locked SETTING block kept
// style/identity but cloned composition every page; de-fanging it into a flexible
// WORLD CONTINUITY block freed up composition but let the model wander on identity,
// style, and tone too (Page 2 test: fresh composition, but lost Pip, gained an
// unestablished second child, drifted into painterly/cinematic style, and left a
// watermark-like artifact). The fix is not to re-lock composition — it's to make the
// non-negotiable constraints (identity, style) explicitly hard and explicitly name
// the failure modes just observed, while keeping world/composition flexible and
// making the page-specific scene direction concrete and literal rather than abstract.
// --- Symbolic-motif prompt handling (build-time only; never edits stored author data) ---
// A symbolic motif (e.g. "The Quiet Place Inside") is an emotional, non-physical idea, not a
// person. The author's stored text may describe it as "a warm glow / gentle light that gets
// brighter" — that meaning stays in the database untouched. But fed raw into an image prompt,
// the diffusion model renders it literally as scenery: a glowing doorway/arch/opening/new
// light source (confirmed live on "My Mind Is Mine" Page 2). These helpers translate the motif
// into bounded, localized visual language at generation time, and only on pages that call for it.

// Neutralize unbounded glow/luminous style words for the IMAGE PROMPT only. The author's stored
// styleGuide is never modified. Ordinary domestic lighting words ("soft light", "lighting") are
// left alone; only scene-wide glow adjectives are softened.
function sanitizeStyleForImagePrompt(style) {
  return (style || "")
    .replace(/\bluminous\b/gi, "gentle")
    .replace(/\bluminescent\b/gi, "gentle")
    .replace(/\bglowing\b/gi, "warm")
    .replace(/\bglows?\b/gi, "warmth")
    .replace(/\baglow\b/gi, "warm")
    .replace(/\bbrighter\b/gi, "warmer");
}

// Does this page actually call for an inner-light / steadiness motif? Only include it when the
// page's own scene direction or text evokes that theme. Pages about heaviness, confusion, or a
// tangled feeling must NOT have the inner-light motif injected — it would fight the page's beat.
function pageEvokesMotif(cueText) {
  const t = (cueText || "").toLowerCase();
  const POSITIVE = ["inner light", "inner steadiness", "steadier", "steady", "quiet place inside", "the quiet place", "calmer", "growing calm", "sense of calm", "thoughts belong", "belong to them", "gets brighter", "feels brighter"];
  return POSITIVE.some((w) => t.includes(w));
}

// Bounded, localized rendering instruction for an included symbolic motif. It must read as the
// child's felt inner state — never scenery, architecture, an opening, a sky, a separate figure,
// or a new light source.
function renderSymbolicMotifNote(motifs, cueText) {
  if (!motifs || !motifs.length || !pageEvokesMotif(cueText)) return "";
  const names = motifs.map((m) => m.name).join(", ");
  return `EMOTIONAL MOTIF (${names}) — this is the child's felt inner steadiness, not a thing in the room. Show it ONLY as a very small, soft warmth close to Pip's chest, or in Pip's calmer expression and body language. It must NOT become a separate figure, object, additional character, doorway, archway, portal, opening, window, room feature, background element, sky, or any new light source.`;
}

// Pose-anchor primitives (Storyboard/Pose Anchor pipeline v1). A small library of legible,
// hand-built line-art pose/composition references used as an img2img anchor for hard emotional
// pages, so the model stages the body posture (e.g. curled, hand-at-chest) instead of defaulting
// to a generic standing child. Served from /public on the deployed domain. v1 ships one
// primitive (the Page 2 proof case).
// Hosted at a public, anonymously-fetchable URL. The image-to-image backend (fal) fetches the
// reference server-side and CANNOT reach Vercel deployment-protected asset URLs (confirmed:
// same asset 404s for fal from the Vercel origin but fetches fine from raw GitHub). Interim host
// is the repo's raw GitHub path; move to a dedicated public CDN/bucket later. The PNG also lives
// in /public for in-app display.
const POSE_PRIMITIVES = {
  curled_hand_chest_heaviness: "https://raw.githubusercontent.com/kirbyamour/little-amour-books/main/public/curled-hand-chest-heaviness.png",
};
function resolvePoseAnchorUrl(key) {
  return (key && POSE_PRIMITIVES[key]) ? POSE_PRIMITIVES[key] : null;
}

function buildLockedIllustrationPrompt({ styleGuide, charManifest, settingDesc, sceneText, pageNum, visualKitNote, motifNote, hasReferenceImage }) {
  return [
    `LOCKED ART STYLE — MUST FOLLOW, NO EXCEPTIONS, SAME ON EVERY PAGE: ${styleGuide}. Soft, warm, gentle, child-safe storybook illustration, consistent with every other page in this book. Keep the illustration grounded, intimate, domestic, and emotionally gentle. Use soft storybook lighting, simple child-safe staging, clear character expressions, and ordinary home details. The image should feel calm, warm, and readable for a young child. The rendering technique, line quality, and colour palette must look like the same artist painted every single page.`,
    ``,
    SINGLE_IMAGE_FORMAT_RULE,
    ``,
    `LOCKED CHARACTER IDENTITY — MUST FOLLOW, NO EXCEPTIONS: the character(s) below are the ONLY people who may appear in this image, with these exact appearances and zero deviation page to page (hair style/colour, skin tone, exact clothing items and colours, age, body type, and any accessory or companion object must be identical to how they are described here on every single page):`,
    charManifest,
    `Do not add any extra child, extra adult, unexplained second character, or unestablished companion/animal. If a character or companion is not named above, it must not appear in this image at all — not in the background, not partially, not implied.`,
    ``,
    settingDesc
      ? `WORLD CONTINUITY (consistent world, NOT a fixed composition or layout to repeat — this describes the kind of world this story lives in, nothing more): ${settingDesc} Do not reuse the same room layout, camera angle, window placement, furniture placement, or pose on every page — the PAGE SCENE below decides this page's actual composition.`
      : "",
    ``,
    `PAGE SCENE — THIS MUST DOMINATE AND DRIVE THIS PAGE'S COMPOSITION: ${sceneText} Invent a fresh layout, camera angle, and character pose specific to this exact moment; do not default to any other page's pose, camera angle, or room layout. Stage this literally and concretely — ground the feeling entirely in the character's pose, expression, and immediate surroundings within their real, ordinary setting.`,
    ``,
    motifNote || "",
    ``,
    visualKitNote || "",
    ``,
    `IMPORTANT: Illustration only — ${NO_TEXT_RULE}. The story text and page number are added separately afterward in a fixed, consistent style; the artwork must not attempt to render them. No signature, watermark, or artist mark of any kind anywhere in the image.`,
    ``,
    `CONSISTENCY RULES: Every character must appear exactly as described above — same face, hair, skin tone, clothing, props, and no extras, no exceptions. Same colour palette and art style as the LOCKED ART STYLE block above, every single page. This is page ${pageNum} of a series; visual consistency with all other pages${hasReferenceImage ? ", and with the reference image supplied," : ""} is enforced here through the locked style and character-identity blocks above, the non-compositional world-continuity block, and a shared seed — not a per-page reference image.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Shared image-generation core (refactor, see Amora_Architecture_Report.md §12)
//
// Every painting path in the app — the single-page button, "approve script & paint
// all," and every Amora-chat painting branch — now goes through this ONE function
// instead of each call site building its own /api/image payload by hand. Before this,
// the three chat branches duplicated paintPage's logic inline and never passed loraUrl
// or referenceImageUrl, so chat-painted pages were silently less visually-consistent
// than button-painted ones. That gap is closed by having exactly one place that decides
// the consistency payload (style guide, character manifest, seed, LoRA, reference image).
// ---------------------------------------------------------------------------

// Fix 5 — lightweight, best-effort log of every paid image-generation call (attempted or
// blocked), so "how many calls did this book actually cost, and were any unconfirmed
// batches blocked" becomes answerable after the fact. Mirrors the existing amora_memory
// upsert pattern: wrapped in try/catch, never throws, never blocks or fails a paint. The
// table (image_generation_events) is defined in supabase-schema.sql — if it hasn't been
// created in the live database yet this silently no-ops, exactly like amora_memory did
// before its own table existed.
async function logImageGenerationEvent({ book, page, source, confirmedByUser, isBatch, loraUsed, referenceImageUsed, usedOwnPageAsReference, status, error, authorEmail }) {
  try {
    await supabase.from("image_generation_events").insert({
      author_email: authorEmail || null,
      book_id: (book && book.id) || null,
      page_id: (page && page.id) || null,
      source: source || "unknown",
      confirmed_by_user: !!confirmedByUser,
      is_batch: !!isBatch,
      lora_used: !!loraUsed,
      reference_image_used: !!referenceImageUsed,
      used_own_page_as_reference: !!usedOwnPageAsReference,
      status: status || "unknown",
      error: error ? String(error).slice(0, 500) : null,
      created_at: new Date().toISOString(),
    });
  } catch (_e) { /* best-effort only — logging must never block or break painting */ }
}

// Fix 2 guardrail — hard stop for any code path that tries to paint more than one page
// without the author explicitly confirming first. Used at the top of every batch-paint
// loop (chat-confirmed batch, "approve script & paint all"). Throws rather than silently
// no-opping so a future call site that forgets to gate its batch fails loudly instead of
// quietly reintroducing unconfirmed batch painting.
function assertBatchPaintConfirmed({ pageIds, confirmedByUser, source }) {
  if (pageIds && pageIds.length > 1 && !confirmedByUser) {
    throw new Error(`Blocked unconfirmed batch paint from ${source || "unknown"}`);
  }
}

// The one shared painting function. Builds the exact same consistency payload every
// time (style guide + character manifest + seed + LoRA-or-reference-image + locked
// negative prompt) and is the only thing in the app that calls /api/image to paint a
// story page. Returns { ok, url, error } and never throws for ordinary failures — it
// only throws for the two intentional guardrails (unconfirmed batch, unconfirmed
// finished-art overwrite), which callers are expected to have already checked before
// reaching here.
//
//   book, setBook   — same shape used everywhere else in the app.
//   collection      — the book's Character Collection, or null.
//   page            — { id, text, img, finishedArt }. id may be null for a one-off
//                      image that hasn't been placed on a page yet (Amora chat's
//                      "just show me an image" case) — pass applyToBookPages: false
//                      in that case so this function doesn't try to patch book.pages.
//   pageIndex       — used only for the prompt's "page N of a series" line.
//   feedback        — optional revision note from the author. Only treated as a
//                      revision (vs. a first-time request) when page.img already exists.
//   allowOverwriteFinishedArt — must be explicitly true to repaint a page flagged
//                      finishedArt (Fix 4). Defaults to false — i.e. blocked by default.
//   applyToBookPages — when true (default) and page.id exists, writes the result
//                      straight into book.pages. Set false for not-yet-placed images.
//   source          — "book_editor" | "amora_chat" | "page_chat" — for logging only.
//   confirmedByUser — must be true for any call where isBatch is true (see
//                      assertBatchPaintConfirmed). Single-page calls default to true
//                      because clicking "generate image" or sending one chat request
//                      IS the confirmation for that one image.
//   isBatch         — true when this call is part of a multi-page loop.
// Some Character Bible entries aren't a person at all — they're a symbolic motif used
// in the story's language ("The Quiet Place Inside," a feeling, an inner light, a worry).
// The image model can't honor "no face" as an instruction; left as an ordinary Character
// Bible entry it renders a literal extra child every time it's mentioned (confirmed live).
// This heuristic flags those entries by name/description so they're treated as a visual
// motif/style note instead of a paintable character — no generated portrait, and never
// listed as a person in a page's character manifest.
// Deliberately multi-word/distinctive phrases only — single common words like "feeling"
// or "safety" show up constantly in ordinary character descriptions (e.g. Pip's own bible
// entry: "big feelings without drama") and would misclassify the protagonist as a motif.
// Confirmed live: the first version of this list did exactly that.
const SYMBOLIC_MOTIF_WORDS = /\b(inner light|inner glow|inner voice|quiet place|heavy words|emotional state|emotional states)\b/i;
function isSymbolicMotif(character) {
  if (!character) return false;
  const text = `${character.name || ""} ${character.desc || ""} ${character.role || ""}`;
  return SYMBOLIC_MOTIF_WORDS.test(text)
    || /\bnot a (separate )?character\b/i.test(text)
    || /\bno face\b/i.test(text)
    || /\bno voice of (its|her|his) own\b/i.test(text);
}

// Picks the protagonist (main child) out of a character list so page-1 painting can
// anchor to their Visual Kit identity specifically, not just "whoever is first." Falls
// back to the first non-motif character when no role is tagged, since manually-added
// characters (via the Characters tab "+ Add a character" button) have no role field at
// all. Symbolic motifs (see isSymbolicMotif) are never a candidate protagonist.
function protagonistCharacter(characters) {
  if (!Array.isArray(characters) || !characters.length) return null;
  const candidates = characters.filter((c) => !isSymbolicMotif(c));
  const pool = candidates.length ? candidates : characters;
  const byRole = pool.find((c) => /\b(main|protagonist|child)\b/i.test(c.role || ""));
  return byRole || pool[0];
}

async function paintPageWithConsistency({
  book, setBook, collection, page, pageIndex,
  feedback,
  allowOverwriteFinishedArt = false,
  applyToBookPages = true,
  source = "unknown",
  confirmedByUser = true,
  isBatch = false,
  authorEmail,
}) {
  // Fix 4 — a page flagged finishedArt is real, uploaded, final author art. Nothing may
  // overwrite it without an explicit, separate confirmation from the author.
  if (page && page.finishedArt && !allowOverwriteFinishedArt) {
    const error = "This page is marked as finished art. Explicit overwrite confirmation is required before it can be repainted.";
    await logImageGenerationEvent({ book, page, source, confirmedByUser, isBatch, status: "blocked_finished_art", error, authorEmail });
    return { ok: false, error, blocked: "finished_art" };
  }
  // Fix 2 — defense in depth: even if a caller's own batch loop forgot to check, no
  // individual call inside a batch of 2+ may proceed without confirmation.
  if (isBatch && !confirmedByUser) {
    const error = `Blocked unconfirmed batch paint from ${source}`;
    await logImageGenerationEvent({ book, page, source, confirmedByUser, isBatch, status: "blocked_unconfirmed", error, authorEmail });
    throw new Error(error);
  }
  if (!page || !page.text || !page.text.trim()) {
    return { ok: false, error: "Add this page's text first — Amora needs words to paint from." };
  }

  try {
    const activeChars = (collection && Array.isArray(collection.characters) && collection.characters.length ? collection.characters : book.characters) || [];
    const physicalChars = activeChars.filter((c) => !isSymbolicMotif(c));
    const symbolicMotifs = activeChars.filter((c) => isSymbolicMotif(c));
    // D2 (bounded, pose-anchor pages only): on a hard emotional page rendered from a pose
    // anchor, restrict the cast to the protagonist plus any character the page text/sceneDirection
    // explicitly NAMES. This keeps Page 2 ("internal body-feeling") from being reframed as an
    // external caregiver-comfort scene by the always-listed "A Trusted Grown-Up". Gated by
    // poseAnchorRequired, so no other page or book is affected. The general per-page cast-scoping
    // system remains a separate workstream.
    let castChars = physicalChars;
    if (page.poseAnchorRequired) {
      const castCue = `${page.text || ""} ${page.sceneDirection || ""}`.toLowerCase();
      const protagonist = protagonistCharacter(physicalChars);
      castChars = physicalChars.filter((c) => c === protagonist || (c.name && castCue.includes(c.name.toLowerCase())));
      if (!castChars.length && protagonist) castChars = [protagonist];
    }
    const charManifest = castChars.length
      ? castChars.map((c) => `— ${c.name}: ${c.desc}`).join("\n")
      : "(no named characters — environment/setting only)";
    const motifCueText = page.sceneDirection || page.text || "";
    const motifNote = renderSymbolicMotifNote(symbolicMotifs, motifCueText);
    let seed = collection ? collection.seed : book.seed;
    if (!seed) { seed = Math.floor(Math.random() * 900000) + 100000; setBook((b) => ({ ...b, seed: b.seed || seed })); }
let styleGuide = (book.visualKit && book.visualKit.styleDesc) || book.styleGuide || (collection && collection.styleGuide) || book.derivedStyle || "children's picture book illustration";
    const otherPageImgs = book.pages.filter((pg) => pg.img && pg.id !== page.id).map((pg) => pg.img).slice(0, 3);
    if (!book.derivedStyle && otherPageImgs.length) {
      const derived = await deriveStyleFromImages(otherPageImgs);
      if (derived) { styleGuide = derived; setBook((b) => ({ ...b, derivedStyle: derived })); }
    }

    // Only treat feedback as a revision note if there's already an image to revise —
    // otherwise it's just the first-time request and the page text speaks for itself.
    // A revision further splits into "minor edit" (fix one detail, anchor hard to the
    // current image) vs "full repaint" (new setting/scene entirely — author explicitly
    // asked to start over). Locked style/characters apply to both; only the anchor
    // strength and whether the old image is shown to the model differ.
    const isFullRepaintReq = Boolean(feedback) && /\b(change the setting|new setting|different setting|replace the (whole )?scene|completely new|brand new (image|scene|picture)|start over|whole new scene|repaint (the )?(whole|entire) page|totally different)\b/i.test(feedback);
    const isRevision = Boolean(feedback) && Boolean(page.img) && !isFullRepaintReq;
    // Pivot #5 (Jace) — optional concrete staging override. page.text is the printed
    // story caption (export-locked, never altered for prompt purposes elsewhere in this
    // file) and is often an emotional metaphor line ("...like a thundercloud sitting
    // right on your chest") rather than a literal staging description. The Page 2 test
    // showed the model needs literal blocking (pose, where the symbolic element sits in
    // frame, what NOT to substitute it with) to avoid wandering into an unrelated fantasy
    // scene. page.sceneDirection is an optional, separate field — set manually for now
    // (Page 2 isolation test), intended later to be Amora-generated per page once this
    // mechanism is proven — that supplies that literal staging without ever touching the
    // page's real printed text.
    const sceneText = (isRevision || isFullRepaintReq)
      ? `${page.text}\n\nRevision note from the author — apply this exact change: ${feedback}`
      : (page.sceneDirection || page.text);

    // A trained style LoRA takes priority over any reference image — it locks style and
    // identity at the model level instead of fighting a single image-to-image strength dial.
    const loraUrl = collection && collection.loraStatus === "ready" ? collection.loraUrl : null;

    // Fix 3 — anchor revisions to the page's OWN current image when one exists, instead
    // of a different page's image. Previously this always borrowed another already-
    // painted page and excluded the page being revised entirely, which is the literal
    // reason "fix one small detail" requests could come back as a different scene
    // altogether — the model had never been shown the picture being revised. Only
    // applies when there's no LoRA (a LoRA already anchors identity/style on its own).
    //
    // Pivot #2 (Jace QA thread, "Children's Books on Hardships," after Pivot #1 — Scene
    // Anchor + 0.85 + anti-copy prompt — was tested live on Page 2 and ALSO failed):
    // confirmed by directly opening the Visual Kit's Opening Scene Anchor image next to
    // Page 1's painted image that they are themselves near-identical compositions — the
    // Scene Anchor was never the "broader, less composition-specific" asset it was
    // assumed to be. That means every image-to-image reference tried (page1.img at
    // 0.55/0.75/0.85, then the Scene Anchor at 0.85) forced the same window/curtains/
    // dog-and-boy-pose/camera-angle composition regardless of strength or prompt wording,
    // because img2img with this backend behaves as a composition copier, not a gentle
    // consistency guide. Jace's decision: stop using image-to-image as the generation
    // strategy for NEW story pages entirely (page 1 AND pages 2+, whenever it's not a
    // revision). New pages are now pure text-to-image — no referenceImageUrl at all —
    // driven only by the locked style guide, the locked character-identity manifest, the
    // locked setting description (see settingDesc below, now passed into the prompt since
    // there's no reference image to carry it visually anymore), this page's own explicit
    // scene direction, and a fixed seed shared across the whole book/collection (already
    // established above). Image-to-image is kept ONLY for revisions — anchored to the
    // page's OWN current image, strength 0.32, unchanged — because a revision's whole
    // point is "change one thing about THIS exact existing image," which is exactly what
    // img2img is good at. If text-to-image-only lets character identity drift across
    // pages, Jace's stated next step is a trained per-book LoRA, not another reference or
    // strength tweak on this now-abandoned image-to-image-for-new-pages branch.
    let referenceImageUrl = null;
    let usedOwnPageAsReference = false;
    if (!loraUrl && isRevision && page.img) {
      referenceImageUrl = page.img;
      usedOwnPageAsReference = true;
    }

    // Pose-anchor layer (hard emotional pages): an approved storyboard/pose primitive becomes the
    // img2img composition reference for the final art, so the model stages the intended posture.
    // LoRA-agnostic and gated (only when no loraUrl, which also keeps image.js on the img2img
    // route). This is NOT the abandoned page-1 cloning — the reference is a purpose-built pose map
    // for an emotionally-specific page.
    let usedPoseAnchor = false;
    const poseAnchorUrl = page.poseAnchorUrl || resolvePoseAnchorUrl(page.poseAnchorKey);
    if (!loraUrl && !usedOwnPageAsReference && page.poseAnchorRequired && page.poseAnchorStatus === "approved" && poseAnchorUrl) {
      referenceImageUrl = poseAnchorUrl;
      usedPoseAnchor = true;
    }

    // Revisions anchor hard to the page's own current image (low strength). Pose-anchor pages use
    // the calibrated img2img strength. Plain new pages have no reference image.
    const strength = usedPoseAnchor
      ? (page.poseAnchorStrength != null ? Number(page.poseAnchorStrength) : 0.72)
      : (usedOwnPageAsReference && isRevision && !isFullRepaintReq ? 0.32 : undefined);

    // No reference image for new pages means no "don't copy the reference" note is
    // needed anymore — composition is driven purely by this page's own SCENE text in the
    // prompt above, which already varies per page.
    const visualKitNote = "";

    const settingDesc = (book.visualKit && book.visualKit.settingDesc) || "";
    const styleForPrompt = sanitizeStyleForImagePrompt(styleGuide);
    const lockedPrompt = buildLockedIllustrationPrompt({ styleGuide: styleForPrompt, charManifest, settingDesc, sceneText, pageNum: (pageIndex || 0) + 1, visualKitNote, motifNote, hasReferenceImage: !!referenceImageUrl });

    const imgRes = await fetch("/api/image", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: lockedPrompt, seed, negative_prompt: ILLUSTRATION_NEGATIVE_PROMPT, imageSize: "square_hd",
        ...(loraUrl ? { loraUrl } : referenceImageUrl ? { referenceImageUrl, ...(strength != null ? { strength } : {}) } : {}),
      }),
    });
    const imgData = await imgRes.json();
    if (imgData.error) {
      await logImageGenerationEvent({ book, page, source, confirmedByUser, isBatch, loraUsed: !!loraUrl, referenceImageUsed: !!referenceImageUrl, usedOwnPageAsReference, status: "failed", error: imgData.error, authorEmail });
      return { ok: false, error: imgData.error };
    }
    if (applyToBookPages && page.id) {
      // Painting success is also the single source of truth for this page'''s art-status
      // fields, so the page list / status panel stay accurate no matter which path
      // (button or chat) just painted it.
      setBook((b) => ({ ...b, pages: b.pages.map((pg) => (pg.id === page.id ? {
        ...pg, img: imgData.url, finalArtUrl: imgData.url, artStatus: "painted", imageDirty: false,
        lastUpdatedBy: source, lastUpdatedAt: new Date().toISOString(),
      } : pg)) }));
    }
    await logImageGenerationEvent({ book, page, source, confirmedByUser, isBatch, loraUsed: !!loraUrl, referenceImageUsed: !!referenceImageUrl, usedOwnPageAsReference, status: "success", authorEmail });
    return { ok: true, url: imgData.url, usedOwnPageAsReference, loraUsed: !!loraUrl, referenceImageUsed: !!referenceImageUrl };
  } catch (e) {
    await logImageGenerationEvent({ book, page, source, confirmedByUser, isBatch, status: "error", error: (e && e.message) || "unknown", authorEmail });
    return { ok: false, error: "Image generation failed — try again." };
  }
}

// Detects an author message that hands over literal, pre-written text for two or more
// specifically-numbered pages at once (e.g. "Page 22 ... Page 23 ... Page 24 ...").
// Returns [{num, text}] in the order they appeared, or [] if fewer than 2 are found.
function parseNamedPages(text) {
  const re = /page\s*(\d+)\s*[:\-–]?\s*\n?([\s\S]*?)(?=(?:\n\s*page\s*\d+\b)|$)/gi;
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    const num = parseInt(m[1], 10);
    const body = m[2].trim();
    if (body) out.push({ num, text: body });
  }
  return out;
}

// Pulls any "coming soon" titles already announced on the public catalogue for this author
// and turns them into empty draft-book shells she can open and build out with Amora.
function seedDraftBooksFor(authorKey) {
  return BOOKS.filter((b) => b.author === authorKey && b.status === "coming").map((b) => ({
    id: "seed_" + b.id,
    title: b.title,
    status: "draft",
    earnings: 0,
    collectionId: null,
    characters: [],
    styleGuide: "",
    bibleLocked: false,
    scriptApproved: false,
    pages: [],
    seedTagline: b.tagline,
    seedSummary: b.child,
  }));
}

// Maps a signed-in account to the studio_data row it should read/write. Kirby's persona switch
// already passes a stable id ("kirby"/"june"/"mara"); a real direct author login is matched to
// that same id by email so both paths land on the same book data, with any other real author
// account (created later in the admin panel) getting its own stable key.
function resolveStudioKey(account) {
  if (!account) return "kirby";
  if (account.isKirby) return "kirby";
  const email = (account.email || "").toLowerCase();
  if (email === "june@littleamour.com") return "june";
  if (email === "mara@littleamour.com") return "mara";
  return "author_" + account.id;
}

const KIRBY_SEED = {
  gifts: 0,
  collections: [
    {
      id: "coll_bld", name: "Big Little Days",
      styleGuide: "Soft watercolour illustration, warm beige/mauve/slate-blue palette, handwritten-style lettering, gentle ink outlines, textured paper background.",
      modelHint: "flux",
      seed: 487291,
      characters: [
        { name: "Mama", desc: "Warm, tired-but-steady mother; dark hair loosely tied back; soft mustard cardigan and a small gold locket. Always warm and steady with Little One." },
        { name: "Little One", desc: "Small child, around 4; dark curls; dusty-rose striped pajamas; carries Moon Bear everywhere. Curious and sensitive." },
        { name: "Moon Bear", desc: "A moonlight-cream plush bear with a crescent moon stitched over the heart and a worn left ear. Calm, wise, reassuring." },
      ],
    },
  ],
  books: [
    {
      id: "papers", title: "Mama Has Papers Today", status: "published", earnings: 0,
      collectionId: "coll_bld",
      characters: [
        { name: "Mama", desc: "Warm, tired-but-steady mother; dark hair loosely tied back; soft mustard cardigan and a small gold locket. Always warm and steady with Little One." },
        { name: "Little One", desc: "Small child, around 4; dark curls; dusty-rose striped pajamas; carries Moon Bear everywhere. Curious and sensitive." },
        { name: "Moon Bear", desc: "A moonlight-cream plush bear with a crescent moon stitched over the heart and a worn left ear. Calm, wise, reassuring." },
      ],
      pages: [
        { id: "p1", text: "Mama has papers today. The kitchen table is covered, corner to corner, in serious white pages.", img: "" },
        { id: "p2", text: "Mama reads with her serious face on. Little One watches from the doorway, holding Moon Bear tight.", img: "" },
        { id: "p3", text: "\u201CDid I do something wrong?\u201D Little One whispers into Moon Bear's worn left ear.", img: "" },
        { id: "p4", text: "Moon Bear seems to whisper back: \u201CBig people sometimes have big papers. Big papers are not little people's fault.\u201D", img: "" },
        { id: "p5", text: "Mama looks up. Her serious face melts into her Little One face. She opens her arms wide as the whole kitchen.", img: "" },
        { id: "p6", text: "\u201CThese papers are grown-up work,\u201D Mama says softly. \u201CThey are not yours to carry. Not even one page.\u201D", img: "" },
        { id: "p7", text: "They make warm cocoa. The lamp glows gold. The papers wait quietly, because papers can wait.", img: "" },
        { id: "p8", text: "\u201CPapers or no papers,\u201D Mama says, \u201Clove is still for you. Always, always, always.\u201D And Little One believes her.", img: "" },
      ],
    },
  ],
};

const KCHIP = {
  published: ["st st-ok", "Published"],
  in_review: ["st st-rev", "Submitted for review"],
  changes: ["st st-req", "Changes requested"],
  draft: ["st st-draft", "Draft"],
};

let _pid = 0;
const newId = () => "p" + Date.now() + "_" + (_pid++);

function KirbyStudio({ go, onSignOut, account, homeSignal, studioKey }) {
  const skey = studioKey || "kirby";
  // Kirby, Mara, and June are house pen names — real third-party authors get a 3-book
  // cap to bound AI generation spend (image/text token cost) per signup. Anyone whose
  // studioKey isn't one of the three house keys (see resolveStudioKey) is a real author.
  const isHouseAccount = skey === "kirby" || skey === "mara" || skey === "june";
  const DRAFT_CAP = 3;
  const [data, setData] = useState(KIRBY_SEED);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [view, setView] = useState("list"); // list | build | edit | publish
  const [pickingCollection, setPickingCollection] = useState(false); // collection picker modal
  const [savedFlash, setSavedFlash] = useState(false);
  const [portraitBusy, setPortraitBusy] = useState({}); // "collId:charIndex" -> true while generating
  const [editingCollId, setEditingCollId] = useState(null); // id of the collection currently open for editing
  const [styleSetupBusy, setStyleSetupBusy] = useState({}); // collId (or collId:sampleIdx) -> true while generating
  const [styleSetupErr, setStyleSetupErr] = useState({}); // collId -> error message from sample/training calls

  // Clicking "My studio" in the global nav bumps homeSignal — jump back to the dashboard list
  // no matter how deep in the editor/Amora/publish flow we currently are.
  useEffect(() => {
    setView("list");
    setOpenId(null);
    setPickingCollection(false);
    setEditingCollId(null);
  }, [homeSignal]);

  // Loads this author's real saved data from Supabase. A transient fetch error here must
  // never be mistaken for "no data exists yet" — if it were, the code below would fall back
  // to a stale local snapshot, and 700ms later the autosave effect would persist that stale
  // snapshot over the real cloud data, silently undoing anything deleted since. So a genuine
  // error retries instead of guessing; only a confirmed "zero rows" answer is treated as a
  // first-time signup eligible for the one-time legacy-localStorage migration below.
  useEffect(() => {
    let cancelled = false;
    const load = async (attempt) => {
      let row = null, fetchError = null;
      try {
        const res = await supabase.from("studio_data").select("data").eq("id", skey).maybeSingle();
        row = res.data;
        fetchError = res.error || null;
      } catch (e) {
        fetchError = e;
      }
      if (cancelled) return;
      if (fetchError) {
        if (attempt < 4) setTimeout(() => { if (!cancelled) load(attempt + 1); }, 1000 * (attempt + 1));
        return;
      }
      if (row && row.data) { setData(row.data); setLoaded(true); return; }
      // Confirmed zero rows for this author — check for a legacy pre-migration browser
      // snapshot and adopt it exactly once, then immediately write it to Supabase and
      // delete the local copy so it can never resurrect a since-deleted item again.
      if (skey === "kirby") {
        try {
          const r = await window.storage.get("lab:studio:kirby:v2");
          if (r && r.value) {
            const legacy = JSON.parse(r.value);
            setData(legacy);
            setLoaded(true);
            await supabase.from("studio_data").upsert({ id: skey, data: legacy, updated_at: new Date().toISOString() });
            await window.storage.remove("lab:studio:kirby:v2");
            return;
          }
        } catch (e) { /* first visit, no legacy data */ }
      }
      setData({ gifts: 0, collections: [], books: [], seededDraftIds: [] });
      setLoaded(true);
    };
    load(0);
    return () => { cancelled = true; };
  }, []);

  // One-time seed: pull in any "coming soon" titles already announced on the public site for
  // this author and drop them into her studio as untouched drafts she can build out with Amora.
  // Tracked via seededDraftIds so deleting a seeded draft doesn't bring it back on next load.
  useEffect(() => {
    if (!loaded) return;
    const already = data.seededDraftIds || [];
    const toSeed = seedDraftBooksFor(skey).filter((sb) => !already.includes(sb.id));
    if (toSeed.length) {
      setData((d) => ({
        ...d,
        books: [...d.books, ...toSeed],
        seededDraftIds: [...(d.seededDraftIds || []), ...toSeed.map((b) => b.id)],
      }));
    }
  }, [loaded, skey]);

  // A ref keeps the latest data/skey/loaded in sync on every render (refs survive into
  // the unmount cleanup and into chained saves below; state captured by an older effect
  // closure does not).
  const latestSaveRef = useRef({ skey, data, loaded });
  useEffect(() => { latestSaveRef.current = { skey, data, loaded }; }, [skey, data, loaded]);

  // Guards against concurrent overlapping upserts to the same row. The debounce timer
  // below only blocks a save that hasn't fired YET (clearTimeout on a pending timer) —
  // once a save's fetch is actually in flight, a later data change starts a SECOND
  // upsert to the same Supabase row before the first one has committed. For small rows
  // this is harmless; for a row with several MB of accumulated chat/art data, each
  // upsert takes long enough that bursts of edits (e.g. a streaming Amora reply) can
  // stack up many concurrent requests, all serializing on the same row-level lock —
  // and the ones queued far enough back exceed Postgres's statement_timeout and come
  // back as HTTP 500, even though any single save is fast in isolation. Forcing saves
  // to run one-at-a-time (queueing at most one "there's newer data, save again when
  // this one finishes" flag) eliminates the pile-up without changing what gets saved.
  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const flushSave = async () => {
    if (saveInFlightRef.current) { pendingSaveRef.current = true; return; }
    saveInFlightRef.current = true;
    do {
      pendingSaveRef.current = false;
      const { skey: k, data: d } = latestSaveRef.current;
      try {
        await supabase.from("studio_data").upsert({ id: k, data: d, updated_at: new Date().toISOString() });
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      } catch (e) { /* non-fatal */ }
    } while (pendingSaveRef.current);
    saveInFlightRef.current = false;
  };

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => { flushSave(); }, 700);
    return () => clearTimeout(t);
  }, [data, loaded]);

  // Flush-on-unmount safety net. The debounced autosave above schedules a save 700ms
  // after every change, and its cleanup (clearTimeout) cancels that pending save —
  // on every re-run AND on unmount. That's fine mid-edit (a newer save supersedes an
  // older one), but it's silently destructive on unmount: clicking a nav link within
  // 700ms of an edit (e.g. uploading a cover, then immediately clicking over to the
  // shop to check it) unmounts KirbyStudio, cancels the pending save, and the edit is
  // gone for good with zero warning. This is exactly what happened to a cover upload.
  // It's a fire-and-forget request — the component is gone so nothing can await it or
  // update state — but the underlying fetch keeps running after React unmounts.
  useEffect(() => {
    return () => {
      const { skey: k, data: d, loaded: l } = latestSaveRef.current;
      if (!l) return;
      supabase.from("studio_data").upsert({ id: k, data: d, updated_at: new Date().toISOString() }).catch(() => {});
    };
  }, []);

  const book = data.books.find((b) => b.id === openId);
  const setBook = (patch) =>
    setData((d) => ({ ...d, books: d.books.map((b) => (b.id === openId ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) } : b)) }));

  const collections = data.collections || [];
  const setCollections = (patch) => setData((d) => ({ ...d, collections: typeof patch === "function" ? patch(d.collections || []) : patch }));

  const setCollChar = (collId, i, patch) =>
    setCollections((cs) => cs.map((c) => (c.id === collId ? { ...c, characters: c.characters.map((ch, j) => (j === i ? { ...ch, ...patch } : ch)) } : c)));
  const addCollChar = (collId) =>
    setCollections((cs) => cs.map((c) => (c.id === collId ? { ...c, characters: [...c.characters, { name: "New character", desc: "" }] } : c)));
  const removeCollChar = (collId, i) =>
    setCollections((cs) => cs.map((c) => (c.id === collId ? { ...c, characters: c.characters.filter((_, j) => j !== i) } : c)));
  const renameColl = (collId, name) => setCollections((cs) => cs.map((c) => (c.id === collId ? { ...c, name } : c)));
  const setCollStyleGuide = (collId, styleGuide) => setCollections((cs) => cs.map((c) => (c.id === collId ? { ...c, styleGuide } : c)));
  const regenPortrait = (collId, i) => setCollChar(collId, i, { img: null }); // clearing img lets the lazy-portrait effect repaint it from the latest name/desc

  // --- Mandatory style-setup flow for NEW collections (Kirby's call: an author should
  // train a real style LoRA before writing a single page, not derive "style" reactively
  // from finished pages after the fact). loraStatus drives which panel the collection
  // card shows: "sampling" -> generate/approve anchor images, "training" -> polling,
  // "ready" -> unlocked, "failed" -> retry without being a permanent dead end.
  const startNewCollection = () => {
    const name = (prompt("Name this character collection:") || "").trim();
    if (!name) return;
    const id = "coll_" + Date.now();
    const seed = Math.floor(Math.random() * 900000) + 100000;
    // A made-up token, not a real word — keeps the trained style tied to a trigger that
    // won't collide with ordinary prompt language.
    const loraTriggerWord = "amoralora" + Math.floor(Math.random() * 9000 + 1000);
    setCollections((cs) => [...cs, {
      id, name, styleGuide: "", modelHint: "auto", seed,
      characters: [{ name: "New character", desc: "" }],
      loraStatus: "sampling", loraUrl: null, loraTriggerWord, loraRequestId: null, styleSamples: [],
    }]);
    setEditingCollId(id);
  };

  const generateStyleSamples = async (collId) => {
    const coll = collections.find((c) => c.id === collId);
    if (!coll) return;
    setStyleSetupBusy((b) => ({ ...b, [collId]: true }));
    try {
      const urls = await Promise.all(
        STYLE_SAMPLE_SCENES.map((scene, i) => genStyleSample(coll.styleGuide, scene, (coll.seed || 0) + i))
      );
      setCollections((cs) => cs.map((c) => c.id === collId
        ? { ...c, styleSamples: urls.map((url) => ({ url, approved: true })) }
        : c));
    } catch (e) {
      setStyleSetupErr((p) => ({ ...p, [collId]: e.message || "Couldn't generate style samples." }));
    } finally {
      setStyleSetupBusy((b) => { const n = { ...b }; delete n[collId]; return n; });
    }
  };

  const redoStyleSample = async (collId, idx) => {
    const coll = collections.find((c) => c.id === collId);
    if (!coll) return;
    const key = collId + ":" + idx;
    setStyleSetupBusy((b) => ({ ...b, [key]: true }));
    try {
      const url = await genStyleSample(coll.styleGuide, STYLE_SAMPLE_SCENES[idx], (coll.seed || 0) + idx + Date.now() % 1000);
      setCollections((cs) => cs.map((c) => c.id === collId
        ? { ...c, styleSamples: c.styleSamples.map((s, i) => i === idx ? { url, approved: true } : s) }
        : c));
    } catch (e) {
      setStyleSetupErr((p) => ({ ...p, [collId]: e.message || "Couldn't regenerate that sample." }));
    } finally {
      setStyleSetupBusy((b) => { const n = { ...b }; delete n[key]; return n; });
    }
  };

  const kickoffTraining = async (collId) => {
    const coll = collections.find((c) => c.id === collId);
    if (!coll || !coll.styleSamples || coll.styleSamples.length < 4) return;
    setStyleSetupErr((p) => { const n = { ...p }; delete n[collId]; return n; });
    try {
      const requestId = await startStyleTraining(coll.styleSamples.map((s) => s.url), coll.loraTriggerWord);
      setCollections((cs) => cs.map((c) => c.id === collId ? { ...c, loraStatus: "training", loraRequestId: requestId } : c));
    } catch (e) {
      setStyleSetupErr((p) => ({ ...p, [collId]: e.message || "Couldn't start training." }));
    }
  };

  // Retroactive path for collections that already have finished, painted pages (e.g. Big
  // Little Days) — complementary to the mandatory upfront flow above, not a replacement.
  // Uses real pages already on the page as the training set instead of generating samples.
  const trainStyleFromExistingPages = async (collId) => {
    const coll = collections.find((c) => c.id === collId);
    if (!coll) return;
    const sourceBook = data.books.find((b) => b.collectionId === collId && (b.pages || []).some((p) => p.img));
    const images = (sourceBook?.pages || []).map((p) => p.img).filter(Boolean).slice(0, 8);
    if (images.length < 4) {
      setStyleSetupErr((p) => ({ ...p, [collId]: "Need at least 4 painted pages in a book using this collection to train from." }));
      return;
    }
    const loraTriggerWord = coll.loraTriggerWord || ("amoralora" + Math.floor(Math.random() * 9000 + 1000));
    setStyleSetupErr((p) => { const n = { ...p }; delete n[collId]; return n; });
    try {
      const requestId = await startStyleTraining(images, loraTriggerWord);
      setCollections((cs) => cs.map((c) => c.id === collId
        ? { ...c, loraStatus: "training", loraRequestId: requestId, loraTriggerWord }
        : c));
    } catch (e) {
      setStyleSetupErr((p) => ({ ...p, [collId]: e.message || "Couldn't start training." }));
    }
  };

  // Lazily fill in missing character reference portraits, one at a time, and save once generated.
  useEffect(() => {
    if (!loaded) return;
    for (const c of collections) {
      for (let i = 0; i < (c.characters || []).length; i++) {
        const ch = c.characters[i];
        const key = c.id + ":" + i;
        if (!ch.img && !portraitBusy[key]) {
          setPortraitBusy((b) => ({ ...b, [key]: true }));
          genCharacterPortrait(ch, c.styleGuide, c.seed)
            .then((url) => {
              setCollections((cs) => cs.map((cc) =>
                cc.id === c.id
                  ? { ...cc, characters: cc.characters.map((cch, ci) => (ci === i ? { ...cch, img: url } : cch)) }
                  : cc
              ));
            })
            .catch(() => {})
            .finally(() => setPortraitBusy((b) => { const n = { ...b }; delete n[key]; return n; }));
          return; // generate one character at a time
        }
      }
    }
  }, [loaded, collections, portraitBusy]);

  // Polls any collection currently mid-training. Keyed on collId:requestId pairs rather
  // than the whole collections array, so unrelated edits elsewhere (typing in a style
  // guide, renaming a book) don't keep tearing down and restarting this interval.
  const trainingKey = collections
    .filter((c) => c.loraStatus === "training" && c.loraRequestId)
    .map((c) => c.id + ":" + c.loraRequestId)
    .join(",");
  useEffect(() => {
    if (!loaded || !trainingKey) return;
    const pairs = trainingKey.split(",").map((s) => {
      const idx = s.lastIndexOf(":");
      return { collId: s.slice(0, idx), requestId: s.slice(idx + 1) };
    });
    const poll = async () => {
      for (const { collId, requestId } of pairs) {
        try {
          const result = await checkStyleTrainingStatus(requestId);
          if (result.status === "ready") {
            setCollections((cs) => cs.map((c) => c.id === collId
              ? { ...c, loraStatus: "ready", loraUrl: result.loraUrl, loraRequestId: null }
              : c));
          } else if (result.status === "failed") {
            setCollections((cs) => cs.map((c) => c.id === collId ? { ...c, loraStatus: "failed" } : c));
            setStyleSetupErr((p) => ({ ...p, [collId]: result.error || "Training failed." }));
          }
        } catch (e) { /* transient — try again on the next tick */ }
      }
    };
    const t = setInterval(poll, 15000);
    return () => clearInterval(t);
  }, [loaded, trainingKey]);

  const createBookWithCollection = (collId) => {
    if (!isHouseAccount && data.books.length >= DRAFT_CAP) {
      window.alert(`You've reached the ${DRAFT_CAP}-book limit for this account. Finish, publish, or delete an existing book before starting a new one.`);
      setPickingCollection(false);
      return;
    }
    const coll = collections.find((c) => c.id === collId);
    const id = "b" + Date.now();
    setData((d) => ({
      ...d,
      books: [...d.books, {
        id, title: "Untitled book", status: "draft", earnings: 0, collectionId: collId || null,
        characters: coll ? coll.characters.map((c) => ({ ...c })) : [],
        styleGuide: coll ? coll.styleGuide : "",
        bibleLocked: false,
        scriptApproved: false,
        pages: [],
      }],
    }));
    setOpenId(id);
    setPickingCollection(false);
    setView("build");
  };

  const startNewBook = () => {
    if (!isHouseAccount && data.books.length >= DRAFT_CAP) {
      window.alert(`You've reached the ${DRAFT_CAP}-book limit for this account. Finish, publish, or delete an existing book before starting a new one.`);
      return;
    }
    if (collections.length > 0) { setPickingCollection(true); }
    else { createBookWithCollection(null); }
  };

  const deleteBook = (bookId) => {
    const b = data.books.find((x) => x.id === bookId);
    if (!b) return;
    if (!window.confirm(`Delete "${b.title || "this book"}"? This permanently removes it and can't be undone.`)) return;
    setData((d) => ({ ...d, books: d.books.filter((x) => x.id !== bookId) }));
    if (openId === bookId) { setOpenId(null); setView("list"); }
  };

  const startWithCharacters = (chars) => {
    if (!isHouseAccount && data.books.length >= DRAFT_CAP) {
      window.alert(`You've reached the ${DRAFT_CAP}-book limit for this account. Finish, publish, or delete an existing book before starting a new one.`);
      return;
    }
    const id = "b" + Date.now();
    setData((d) => ({ ...d, books: [...d.books, { id, title: "Untitled book", status: "draft", earnings: 0, characters: chars.map((c) => ({ ...c })), bibleLocked: false, scriptApproved: false, pages: [] }] }));
    setOpenId(id);
    setView("build");
  };

  const saveCollectionFromBook = (bookId) => {
    const bk = data.books.find((b) => b.id === bookId);
    if (!bk || !bk.characters.length) return;
    const name = prompt("Name this character collection:", bk.title + " Universe");
    if (!name) return;
    const id = "coll_" + Date.now();
    const seed = Math.floor(Math.random() * 900000) + 100000;
    setCollections((cs) => [...cs, { id, name, styleGuide: bk.styleGuide || "", modelHint: "auto", seed, characters: bk.characters.map((c) => ({ ...c })) }]);
    setData((d) => ({ ...d, books: d.books.map((b) => b.id === bookId ? { ...b, collectionId: id } : b) }));
  };

  // Until the real Supabase row has loaded, `data` is still the hardcoded KIRBY_SEED
  // fallback (an old 8-page, image-less draft of "Mama Has Papers Today" used only to
  // give brand-new accounts something to look at before they have real saved data).
  // Rendering the studio before `loaded` is true means anyone who opens it on a slow
  // connection — or a tool inspecting it a beat too early — sees that stale seed and
  // can mistake it for their real, current book. The autosave effect already guards
  // against this seed ever overwriting real data (it no-ops until loaded is true), but
  // nothing previously stopped the UI itself from showing it as if it were live. Gate
  // the entire studio behind a real loading state so stale seed data is never rendered.
  if (!loaded) {
    return (
      <section className="morning page-top">
        <div className="wrap" style={{ textAlign: "center", padding: "120px 0" }}>
          <p className="fine">Loading your studio…</p>
        </div>
      </section>
    );
  }

  /* ---------------- BOOK LIST ---------------- */
  if (view === "list" || !book) {
    const royalties = data.books.reduce((s, b) => s + (b.earnings || 0), 0);
    return (
      <section className="morning page-top">
        <div className="wrap">
          {/* Collection picker modal */}
          {pickingCollection ? (
            <div className="modal-backdrop">
              <div className="modal-box">
                <h3>Which universe does this book live in?</h3>
                <p className="fine">Characters, art style, and colour palette will carry across from the collection you choose.</p>
                <div className="coll-pick-list">
                  {collections.map((c) => (
                    <button key={c.id} className="coll-pick-item" onClick={() => createBookWithCollection(c.id)}>
                      <strong>{c.name}</strong>
                      <span>{c.characters.map((ch) => ch.name).join(", ")}</span>
                    </button>
                  ))}
                  <button className="coll-pick-item coll-pick-new" onClick={() => createBookWithCollection(null)}>
                    <strong>+ New universe</strong>
                    <span>Start fresh — create new characters and style with Amora</span>
                  </button>
                </div>
                <button className="btn-text soft" onClick={() => setPickingCollection(false)} style={{ marginTop: 10 }}>Cancel</button>
              </div>
            </div>
          ) : null}

          <div className="row-between">
            <div><p className="eyebrow plum">Author studio</p><h2>Good morning, {(account?.name || "Author").split(" ")[0]}.</h2></div>
            <button className="btn-text" onClick={onSignOut}>Sign out</button>
          </div>
          <div className="dash-grid">
            <div className="dash-col">
              <h3 className="bd-h">My books</h3>
              {data.books.map((b) => {
                const bColl = collections.find((c) => c.id === b.collectionId);
                return (
                  <div key={b.id} className="dash-book">
                    <div>
                      <strong>{b.title}</strong>
                      <span className={KCHIP[b.status][0]}>{KCHIP[b.status][1]}</span>
                      {bColl ? <span className="char-pill">✦ {bColl.name}</span> : null}
                    </div>
                    <div className="dash-actions">
                      <button className="btn-text" onClick={() => { setOpenId(b.id); setView("edit"); }}>Open →</button>
                      <button className="btn-text" style={{color:"#E2A857"}} onClick={() => { setOpenId(b.id); setView("publish"); }}>Publish ✦</button>
                      {b.characters && b.characters.length && !b.collectionId ? (
                        <button className="btn-text soft" onClick={() => saveCollectionFromBook(b.id)}>Save as collection</button>
                      ) : null}
                      <button className="btn-text soft" style={{color:"#C0556B"}} onClick={() => deleteBook(b.id)}>delete</button>
                    </div>
                  </div>
                );
              })}
              <button className="btn-gold" style={{ marginTop: 14, opacity: (!isHouseAccount && data.books.length >= DRAFT_CAP) ? 0.5 : 1 }} disabled={!isHouseAccount && data.books.length >= DRAFT_CAP} onClick={startNewBook}>+ Create a new book with Amora</button>
              {!isHouseAccount && data.books.length >= DRAFT_CAP ? (
                <p className="fine" style={{ color: "#C0556B" }}>You've used all {DRAFT_CAP} books on this account. Delete or publish one to start another.</p>
              ) : (
                <p className="fine">Everything you make here saves automatically and waits for you next time.</p>
              )}
            </div>
            <div className="dash-col">
              <h3 className="bd-h">Character Collections</h3>
              {collections.length === 0 ? (
                <p className="fine">Your character universes will appear here. Start one below — you'll set its style and train it before writing any pages, so even page 1 matches.</p>
              ) : null}
              <button className="btn-line dark" style={{ marginBottom: 12 }} onClick={startNewCollection}>+ New character collection</button>
              {collections.map((c) => (
                <div key={c.id} className="coll-card">
                  <div className="coll-card-head">
                    <strong>{c.name}</strong>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn-text soft" onClick={() => setEditingCollId(editingCollId === c.id ? null : c.id)}>
                        {editingCollId === c.id ? "done" : "edit"}
                      </button>
                      <button className="btn-text soft" onClick={() => {
                        if (window.confirm("Delete this collection?")) setCollections((cs) => cs.filter((x) => x.id !== c.id));
                      }}>delete</button>
                    </div>
                  </div>
                  <div className="coll-portraits">
                    {c.characters.map((ch, i) => (
                      <div key={i} className="coll-portrait" title={ch.name}>
                        {ch.img ? (
                          <img src={ch.img} alt={ch.name} />
                        ) : (
                          <span className="coll-portrait-fallback">{portraitBusy[c.id + ":" + i] ? "…" : ch.name.charAt(0)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {editingCollId === c.id ? (
                    <div className="coll-editor">
                      <label className="fine" style={{ display: "block", margin: "8px 0 4px" }}>Collection name</label>
                      <input className="char-name" style={{ width: "100%", marginBottom: 10 }} value={c.name} onChange={(e) => renameColl(c.id, e.target.value)} />
                      <label className="fine" style={{ display: "block", margin: "8px 0 4px" }}>Style guide</label>
                      <textarea rows={2} style={{ width: "100%", marginBottom: 10 }} value={c.styleGuide || ""} onChange={(e) => setCollStyleGuide(c.id, e.target.value)} placeholder="Art style, palette, mood — locked across every page." />
                      {c.characters.map((ch, i) => (
                        <div key={i} className="char-row">
                          <input className="char-name" value={ch.name} onChange={(e) => setCollChar(c.id, i, { name: e.target.value })} />
                          <textarea rows={3} value={ch.desc} onChange={(e) => setCollChar(c.id, i, { desc: e.target.value })} placeholder="Appearance, clothing, props, personality — everything that must stay the same." />
                          <div className="char-row-actions">
                            <button className="btn-text soft" disabled={!!portraitBusy[c.id + ":" + i]} onClick={() => regenPortrait(c.id, i)}>
                              {portraitBusy[c.id + ":" + i] ? "painting…" : "regenerate portrait"}
                            </button>
                            <button className="btn-text soft" onClick={() => removeCollChar(c.id, i)}>remove</button>
                          </div>
                        </div>
                      ))}
                      <button className="btn-line dark" onClick={() => addCollChar(c.id)}>+ Add a character</button>
                    </div>
                  ) : (
                    <>
                      <p className="fine" style={{ margin: "4px 0 6px" }}>{c.characters.map((ch) => ch.name).join(" · ")}</p>
                      {c.styleGuide ? <p className="fine coll-style">{c.styleGuide}</p> : null}
                    </>
                  )}
                  {c.loraStatus ? (
                    <div className="lora-panel">
                      {c.loraStatus === "sampling" ? (
                        <>
                          <p className="fine" style={{ margin: "6px 0" }}>
                            Before any book starts: generate a few style-anchor images and train a real style model on them, so page 1 already matches — not just page 22.
                          </p>
                          {(!c.styleSamples || c.styleSamples.length === 0) ? (
                            <button className="btn-text soft" disabled={!!styleSetupBusy[c.id]} onClick={() => generateStyleSamples(c.id)}>
                              {styleSetupBusy[c.id] ? "painting samples…" : "Generate 4 style samples"}
                            </button>
                          ) : (
                            <>
                              <div className="lora-samples">
                                {c.styleSamples.map((s, i) => (
                                  <div key={i} className="lora-sample">
                                    <img src={s.url} alt={`style sample ${i + 1}`} />
                                    <button className="btn-text soft" disabled={!!styleSetupBusy[c.id + ":" + i]} onClick={() => redoStyleSample(c.id, i)}>
                                      {styleSetupBusy[c.id + ":" + i] ? "…" : "redo"}
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <button className="btn-gold" style={{ marginTop: 8 }} onClick={() => kickoffTraining(c.id)}>
                                Train this style (~$2, 5–15 min) →
                              </button>
                            </>
                          )}
                        </>
                      ) : c.loraStatus === "training" ? (
                        <p className="fine" style={{ margin: "6px 0" }}>
                          ⏳ Training your style — usually 5–15 minutes. Keep working elsewhere; this updates on its own.
                        </p>
                      ) : c.loraStatus === "ready" ? (
                        <p className="fine coll-style" style={{ margin: "6px 0" }}>✦ Style trained — locked for every page, starting with page 1.</p>
                      ) : c.loraStatus === "failed" ? (
                        <>
                          <p className="fine" style={{ margin: "6px 0", color: "#B5533C" }}>Training failed. You can retry, or start a book now using the description-based style instead.</p>
                          <button className="btn-text soft" onClick={() => kickoffTraining(c.id)}>Retry training</button>
                        </>
                      ) : null}
                      {styleSetupErr[c.id] ? <p className="fine" style={{ color: "#B5533C" }}>{styleSetupErr[c.id]}</p> : null}
                    </div>
                  ) : (
                    <button className="btn-text soft" style={{ marginTop: 4, display: "block" }} onClick={() => trainStyleFromExistingPages(c.id)}>
                      Train style from finished pages →
                    </button>
                  )}
                  <button
                    className="btn-text"
                    style={{ marginTop: 4 }}
                    disabled={c.loraStatus === "sampling" || c.loraStatus === "training"}
                    onClick={() => createBookWithCollection(c.id)}
                  >
                    {c.loraStatus === "sampling" || c.loraStatus === "training" ? "Finish style setup first" : "Start a book with these characters →"}
                  </button>
                </div>
              ))}
              <h3 className="bd-h" style={{ marginTop: 18 }}>Earnings</h3>
              <div className="earn-card">
                <p><span>Book royalties</span><span>${royalties.toFixed(2)}</span></p>
                <p><span>Reader gifts — 100% yours</span><span>${(data.gifts || 0).toFixed(2)}</span></p>
                <p className="co-total"><span>Next payout</span><span>—</span></p>
              </div>
              <p className="fine">You keep 75% of every sale and 75% of net Amazon royalties, plus all reader gifts.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------- PUBLISH ---------------- */
  if (view === "publish" && book) {
    const pubColl = collections.find((c) => c.id === book?.collectionId) || null;
    return <PublishingModule book={book} setBook={setBook} author={{ name: data.name || "Kirby" }} collection={pubColl} onBack={() => setView("list")} />;
  }

  /* ---------------- AMORA BUILD ---------------- */
  if (view === "build") {
    const activeColl = collections.find((c) => c.id === book?.collectionId) || null;
    return <AmoraBuild book={book} setBook={setBook} collection={activeColl} savedFlash={savedFlash}
      authorEmail={account?.email}
      onGoEditor={(tab) => { setView("edit"); }}
      onPublish={() => setView("publish")}
      onBack={() => setView("list")} />;
  }

  /* ---------------- BOOK EDITOR ---------------- */
  const editorColl = collections.find((c) => c.id === book?.collectionId) || null;
  return <BookEditor book={book} setBook={setBook} collection={editorColl} onBack={() => setView("list")} onSignOut={onSignOut} onAmora={() => setView("build")} onPublish={() => setView("publish")} savedFlash={savedFlash} authorEmail={account?.email} />;
}

/* ---------------- Amora guided build ---------------- */
function AmoraBuild({ book, setBook, collection, savedFlash, onGoEditor, onPublish, onBack, authorEmail }) {
  const onDone = () => onGoEditor("pages");
  const [msgs, setMsgs] = useState(() => (book.amoraChat && book.amoraChat.length ? book.amoraChat : [
    { role: "amora", text: "Hi Kirby — I'm Amora. Let's make this book together, one step at a time.\n\nTell me what you have so far. It can be anything: just a feeling or an idea, a hard thing you want a child to understand, some page text you've already written, or even images you'd like to use. Where would you like to begin?" },
  ]));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chatImg, setChatImg] = useState(null); // {dataUrl, mediaType, name}
  const chatImgRef = useRef(null);
  const scroller = useRef(null);
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);
  // Keep the conversation saved on the book itself — so it survives switching screens and comes back next session.
  useEffect(() => { setBook((b) => ({ ...b, amoraChat: msgs })); }, [msgs]);

  const push = (role, text, extra) => setMsgs((m) => [...m, { role, text, ...(extra || {}) }]);

  // Fix 2 — generating art is paid and creative; it must require explicit confirmation
  // before painting 2+ pages, even when bibleLocked/scriptApproved are both already true.
  // Those flags are preconditions for painting at all, not standing consent for every
  // future batch. When a chat message would paint 2+ pages, a pendingPaintRequest is
  // created instead of painting immediately, and the chat shows real action buttons.
  const [pendingPaintRequest, setPendingPaintRequest] = useState(null);

  // Raw-idea discovery — when an author arrives with only a feeling, situation, or rough
  // concept (no named characters/style yet), Amora drafts a structured starter package
  // instead of reflecting the idea back or sending her to a blank Characters tab. This is
  // held only in session state (same as pendingPaintRequest) until the author explicitly
  // saves it — saving writes it into real book fields, never just book.amoraChat.
  const [pendingBibleDraft, setPendingBibleDraft] = useState(null);

  // Amora's continuous memory of this author — loaded once per session, updated quietly
  // after each real exchange so she keeps getting to know the author over time.
  const [memory, setMemory] = useState("");
  const memoryRef = useRef("");
  useEffect(() => {
    if (!authorEmail) return;
    (async () => {
      try {
        const { data: row } = await supabase.from("amora_memory").select("memory").eq("author_email", authorEmail).maybeSingle();
        if (row && row.memory) { memoryRef.current = row.memory; setMemory(row.memory); }
      } catch (e) { /* no memory yet, that's fine */ }
    })();
  }, [authorEmail]);
  const updateMemory = async (userText, amoraReply) => {
    if (!authorEmail) return;
    try {
      const updated = await amora(
        `You keep a private, ongoing memory file about this author for Amora's own use — never shown to her directly. Current memory:\n"""${memoryRef.current || "(nothing yet)"}"""\n\nNew exchange:\nAuthor: ${userText}\nAmora: ${amoraReply}\n\nRewrite the memory file: under 150 words, plain prose, durable facts only — her tone, recurring themes, what she's working through, names she cares about, preferences. Skip anything that's just small talk. Return ONLY the updated memory text, nothing else.`,
        "You are a quiet memory-keeper, not a conversational voice. Output plain text only, no preamble, no quotes.", 300
      );
      const trimmed = (updated || "").trim();
      if (!trimmed) return;
      memoryRef.current = trimmed;
      setMemory(trimmed);
      await supabase.from("amora_memory").upsert({ author_email: authorEmail, memory: trimmed, updated_at: new Date().toISOString() });
    } catch (e) { /* best-effort, never block the conversation on this */ }
  };

  const attachChatImage = (file) => {
    if (!file) return;
    const mimeMatch = file.type || "image/jpeg";
    const fr = new FileReader();
    fr.onload = () => setChatImg({ dataUrl: fr.result, mediaType: file.type || "image/jpeg", name: file.name });
    fr.readAsDataURL(file);
  };

  // Fix 2 — runs ONLY after the author has explicitly clicked "Paint these pages now"
  // (or typed the equivalent confirmation phrase). Every page in the request is painted
  // through the same shared paintPageWithConsistency core BookEditor uses, so chat-painted
  // pages get the identical loraUrl/referenceImageUrl/seed/style payload — no more silently
  // weaker consistency for art painted from chat than art painted from the page editor.
  const confirmPendingPaint = async () => {
    const req = pendingPaintRequest;
    if (!req || req.status !== "pending" || busy) return;
    assertBatchPaintConfirmed({ pageIds: req.pageIds, confirmedByUser: true, source: "amora_chat" });
    setPendingPaintRequest({ ...req, status: "confirmed" });
    setBusy(true);
    push("amora", `Painting ${req.pageIds.length} page${req.pageIds.length > 1 ? "s" : ""} now — this will take a moment…`);
    if (!book.derivedStyle) {
      const existingImgs = book.pages.filter((pg) => pg.img).map((pg) => pg.img).slice(0, 3);
      if (existingImgs.length) push("amora", "Looking at your existing pages to lock in the visual style…");
    }
    const built = []; const failed = [];
    for (let k = 0; k < req.pageIds.length; k++) {
      const pid = req.pageIds[k];
      const pIdx = book.pages.findIndex((pg) => pg.id === pid);
      if (pIdx === -1) { failed.push(req.pageNumbers[k]); continue; }
      const result = await paintPageWithConsistency({
        book, setBook, collection, page: book.pages[pIdx], pageIndex: pIdx,
        source: "amora_chat", confirmedByUser: true, isBatch: true, authorEmail,
      });
      if (result.ok) built.push(req.pageNumbers[k]); else failed.push(req.pageNumbers[k]);
    }
    setPendingPaintRequest((pr) => (pr && pr.id === req.id ? { ...pr, status: "completed" } : pr));
    push("amora", built.length
      ? `Done — page${built.length > 1 ? "s" : ""} ${built.join(", ")} ${built.length > 1 ? "are" : "is"} painted and matching the rest of the book.${failed.length ? ` Page${failed.length > 1 ? "s" : ""} ${failed.join(", ")} didn't generate — try regenerating from the page editor.` : ""}`
      : `The art didn't generate for any of those pages just now — try again from the page editor.`);
    setBusy(false);
  };

  // "Review first" / cancel — leaves the saved text exactly as it is, just doesn't spend
  // any image credits yet. The author can always trigger painting later from the page
  // editor's "Approve script & paint all pages" button, or by asking Amora again.
  const dismissPendingPaint = (note) => {
    setPendingPaintRequest((pr) => (pr ? { ...pr, status: "cancelled" } : pr));
    push("amora", note || "No problem — take your time. Tell me to paint them whenever you're ready, or use \"Approve script & paint all pages\" in the Page Editor.");
  };

  // Raw-idea discovery — formats a structured starter package (working title, age range,
  // concept, core message, emotional goal, characters, setting, refrain, trauma-sensitive
  // boundaries, what to avoid, style guide, next step) instead of reflecting an idea back.
  // "Amora is not a mirror. Amora is a maker."
  const formatBibleDraftMessage = (d) => {
    const chars = Array.isArray(d.characters) ? d.characters : [];
    const lines = [
      d.title ? `Working title: ${d.title}` : null,
      d.ageRange ? `Age range: ${d.ageRange}` : null,
      d.concept ? `Concept: ${d.concept}` : null,
      d.coreMessage ? `Core message: ${d.coreMessage}` : null,
      d.emotionalGoal ? `Emotional goal for the child: ${d.emotionalGoal}` : null,
      chars.length ? `Main characters:\n${chars.map((c) => `  — ${c.name}${c.role ? ` (${c.role})` : ""}: ${c.desc || ""}`).join("\n")}` : null,
      d.setting ? `Setting options: ${d.setting}` : null,
      d.refrain ? `Repeated phrase/refrain: "${d.refrain}"` : null,
      d.boundaries ? `Trauma-sensitive boundaries: ${d.boundaries}` : null,
      d.avoid ? `What this book should avoid: ${d.avoid}` : null,
      d.styleGuide ? `Visual style guide (draft): ${d.styleGuide}` : null,
      d.nextStep ? `Suggested next step: ${d.nextStep}` : null,
    ].filter(Boolean);
    return `Here's a starter package built from what you've told me:\n\n${lines.join("\n\n")}\n\nWould you like me to save this as a draft Book Bible, revise it, draft another option, or continue to a 24-page script?`;
  };

  // Writes a draft straight into real book state — book.bible, book.characters (saved as
  // drafts, NOT locked), book.styleGuide, book.ageRange, and the title if still "Untitled
  // book". Never left sitting only in book.amoraChat. bibleLocked stays false here on
  // purpose: the Characters tab becomes the visual-lock step, not a blank first creative
  // burden — locked characters are required before painting, not before story discovery.
  const applyBibleDraftToBook = (d) => {
    const chars = Array.isArray(d.characters)
      ? d.characters.filter((c) => c && c.name).map((c) => ({ name: c.name, desc: c.desc || "", role: c.role || "" }))
      : [];
    setBook((b) => ({
      ...b,
      title: (!b.title || b.title === "Untitled book") && d.title ? d.title : b.title,
      ageRange: d.ageRange || b.ageRange,
      bible: { ...(b.bible || {}), concept: d.concept || "", coreMessage: d.coreMessage || "", emotionalGoal: d.emotionalGoal || "", setting: d.setting || "", refrain: d.refrain || "", boundaries: d.boundaries || "", avoid: d.avoid || "" },
      characters: chars.length ? chars : b.characters,
      styleGuide: d.styleGuide || b.styleGuide,
      discoveryStarted: true,
      bibleDrafted: true,
    }));
  };

  // Re-runs the starter-package draft with extra instruction — used by both "revise this"
  // and "draft another option", so the author never has to re-explain the original idea.
  const regenerateBibleDraft = async (extraInstruction) => {
    try {
      const draftRaw = await amora(
        `An author already saw this starter book-idea draft:\n${JSON.stringify((pendingBibleDraft && pendingBibleDraft.draft) || {})}\n\n${extraInstruction}\n\nReturn ONLY JSON with these exact keys: {"title":"...","ageRange":"...","concept":"...","coreMessage":"...","emotionalGoal":"...","characters":[{"name":"...","role":"...","desc":"..."}],"setting":"...","refrain":"...","boundaries":"...","avoid":"...","styleGuide":"...","nextStep":"..."}`,
        AMORA_SYS + " STRUCTURED MODE: output valid JSON only. Be warm, concrete, and trauma-sensitive.", 1800
      );
      const draft = parseLoose(draftRaw);
      const id = newId();
      setPendingBibleDraft({ id, status: "pending", draft, createdAt: new Date().toISOString() });
      push("amora", formatBibleDraftMessage(draft), { pendingBibleId: id });
    } catch (e) {
      push("amora", "I had trouble reworking that just now — tell me what you'd like changed and I'll try again.");
    }
  };

  // Drafts a provisional 24-page manuscript straight from the discovery package. Drafting
  // and saving page text never requires a locked Character Bible — only painting does.
  const draftProvisionalScript = async (d) => {
    const chars = Array.isArray(d.characters) ? d.characters : [];
    const raw = await amora(
      `Draft a 24-page picture book manuscript from this provisional concept. Working title: "${d.title || "Untitled"}". Age range: ${d.ageRange || "not set"}. Concept: ${d.concept || ""}. Core message: ${d.coreMessage || ""}. Emotional goal: ${d.emotionalGoal || ""}. Characters: ${chars.map((c) => `${c.name}: ${c.desc}`).join(" | ") || "none named yet"}. Setting: ${d.setting || ""}. Repeated phrase/refrain to weave through the book: ${d.refrain || "none"}. Trauma-sensitive boundaries to respect: ${d.boundaries || "none stated"}. Avoid: ${d.avoid || "nothing specific stated"}.\n\nWrite exactly 24 short page texts, one per page, in the author's emotional tone — gentle, concrete, age-appropriate. This is a DRAFT for the author to revise, not final.\n\nReturn ONLY JSON: {"pages":["page 1 text", ...24 total]}`,
      AMORA_SYS + " STRUCTURED MODE: output valid JSON only.", 2600
    );
    const parsed = parseLoose(raw);
    return Array.isArray(parsed.pages) ? parsed.pages.filter((t) => typeof t === "string" && t.trim()) : [];
  };

  const send = async (override) => {
    const text = (override || input).trim();
    if ((!text && !chatImg) || busy) return;
    const imgSnap = chatImg;
    push("user", text + (imgSnap ? ` [image: ${imgSnap.name}]` : ""));
    setInput("");
    setChatImg(null);
    setBusy(true);
    try {
      if (imgSnap) {
        // Vision message — Amora reads the attached image (character sheet, sketch, etc.)
        const base64 = imgSnap.dataUrl.split(",")[1];
        const userPrompt = text || "Please read this image and tell me what you see. If it's a character design sheet, extract each character's name, appearance, and any colour palette or style notes, then build a Character Bible entry for each one. Keep every detail exactly as shown.";
        const res = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6", max_tokens: 2000, system: AMORA_SYS,
            messages: [{ role: "user", content: [
              { type: "image", source: { type: "base64", media_type: imgSnap.mediaType, data: base64 } },
              { type: "text", text: userPrompt },
            ] }],
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        const reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
        push("amora", reply);
        // If it looks like a character sheet, offer to save to Character Bible
        if (reply.toLowerCase().includes("character") || reply.toLowerCase().includes("mama") || reply.toLowerCase().includes("palette")) {
          push("amora", "Want me to save these characters to your book's Character Bible? Just say \"yes, save to my Character Bible\" and I'll add them.");
        }
      } else if (pendingPaintRequest && pendingPaintRequest.status === "pending"
        && /\b(paint (these |the |saved )?pages?( now)?|paint (it|them) now|yes,? paint|go ahead( and paint)?|paint now)\b/i.test(text)) {
        // Fix 2 — the simplest-safe confirmation path: typing the equivalent of the button's
        // own label also confirms, in case the chat UI's buttons aren't visible/usable.
        setBusy(false);
        await confirmPendingPaint();
        return;

      } else if (pendingPaintRequest && pendingPaintRequest.status === "pending"
        && /\b(review first|not yet|hold off|wait|cancel)\b/i.test(text)) {
        dismissPendingPaint();
        setBusy(false);
        return;

      } else if (pendingBibleDraft && pendingBibleDraft.status === "pending" && /\bsave\b/i.test(text)) {
        // "Save this Bible" — writes the draft into real book fields (Characters tab, style
        // guide, age range), unlocked. Never left sitting only in book.amoraChat.
        applyBibleDraftToBook(pendingBibleDraft.draft);
        setPendingBibleDraft((d) => (d ? { ...d, status: "saved" } : d));
        push("amora", `Saved — "${pendingBibleDraft.draft.title || book.title}" is your draft Book Bible now. I've written the characters into the Characters tab (as drafts, not locked yet), the style guide, and the age range — nothing's sitting only in chat. Next: keep developing the story, say "continue to script" for a 24-page draft, or lock the Character Bible whenever you're ready to paint.`);
        setBusy(false);
        return;

      } else if (pendingBibleDraft && pendingBibleDraft.status === "pending"
        && /\b(another option|draft another|second option|different (take|version|option))\b/i.test(text)) {
        await regenerateBibleDraft("Draft a meaningfully different second option — same real situation/idea, different angle on title, characters, or setting.");
        setBusy(false);
        return;

      } else if (pendingBibleDraft && pendingBibleDraft.status === "pending" && /\b(revise|change)\b/i.test(text)) {
        await regenerateBibleDraft(`Revise it per this feedback: "${text}"`);
        setBusy(false);
        return;

      } else if (pendingBibleDraft && (pendingBibleDraft.status === "pending" || pendingBibleDraft.status === "saved")
        && /\b(continue to script|continue to the script|script)\b/i.test(text)) {
        // Draft script — not ready for painting until the Character Bible is approved and
        // locked. Drafting/saving page text never requires locked characters; painting does.
        // Also fires once the draft has already been saved (status "saved"), not only while
        // still "pending" — bug found live: after tapping "Save this Bible," a free-text
        // follow-up like "continue to script... the Bible we just saved" no longer matched
        // this branch (status had moved to "saved"), so it fell through to the generic
        // cascade where the broad isSaveBible regex (save + bible) intercepted it instead,
        // tried to re-parse the prior "Saved..." confirmation message as character JSON,
        // failed, and surfaced a confusing "I wasn't quite sure how to parse those" reply —
        // the same root bug class as the raw-idea fixes: Amora not following an instruction
        // already given because an earlier, unrelated branch grabbed the message first.
        applyBibleDraftToBook(pendingBibleDraft.draft);
        setPendingBibleDraft((d) => (d ? { ...d, status: "saved" } : d));
        push("amora", "Drafting a provisional 24-page script from this — labeled as a draft, not ready for painting until the Character Bible is approved and locked…");
        try {
          const pageTexts = await draftProvisionalScript(pendingBibleDraft.draft);
          if (pageTexts.length) {
            setBook((b) => ({
              ...b,
              pages: pageTexts.map((t) => ({ id: newId(), text: t, img: "", textStatus: "draft", artStatus: "needs_paint" })),
              scriptDrafted: true,
              scriptApproved: false,
            }));
            push("amora", `Saved a draft ${pageTexts.length}-page script into the Page Editor. Draft script — not ready for painting until the Character Bible is approved and locked. Read through it and change anything, then lock the Character Bible and approve the script before we paint.`);
          } else throw new Error("no pages");
        } catch (e) {
          push("amora", "I had trouble drafting the script just now — say \"draft the script\" again, or paste the pages yourself and I'll save them as-is.");
        }
        setBusy(false);
        return;

      } else if (!pendingBibleDraft && book.bibleDrafted
        && /\b(continue to script|continue to the script|\bscript\b)\b/i.test(text)) {
        // Bug found live: pendingBibleDraft is local React component state and does NOT
        // survive a page reload or a fresh navigation back into this book — but the Bible
        // itself is already saved to book.bible/book.characters by that point (applyBibleDraftToBook
        // already ran). Without this fallback, saying "continue to script" after a reload fell
        // through to the generic cascade below, which had no memory of the already-saved Bible
        // and asked discovery questions again instead of building — the same root bug class as
        // the raw-idea fixes: Amora not following an instruction already given because the
        // information it needed was sitting in real book fields instead of transient chat state.
        const reconstructedDraft = {
          title: book.title,
          ageRange: book.ageRange,
          concept: (book.bible && book.bible.concept) || "",
          coreMessage: (book.bible && book.bible.coreMessage) || "",
          emotionalGoal: (book.bible && book.bible.emotionalGoal) || "",
          setting: (book.bible && book.bible.setting) || "",
          refrain: (book.bible && book.bible.refrain) || "",
          boundaries: (book.bible && book.bible.boundaries) || "",
          avoid: (book.bible && book.bible.avoid) || "",
          characters: Array.isArray(book.characters) ? book.characters : [],
        };
        push("amora", "Drafting a provisional 24-page script from the Book Bible already saved to this book — labeled as a draft, not ready for painting until the Character Bible is approved and locked…");
        try {
          const pageTexts = await draftProvisionalScript(reconstructedDraft);
          if (pageTexts.length) {
            setBook((b) => ({
              ...b,
              pages: pageTexts.map((t) => ({ id: newId(), text: t, img: "", textStatus: "draft", artStatus: "needs_paint" })),
              scriptDrafted: true,
              scriptApproved: false,
            }));
            push("amora", `Saved a draft ${pageTexts.length}-page script into the Page Editor. Draft script — not ready for painting until the Character Bible is approved and locked. Read through it and change anything, then lock the Character Bible and approve the script before we paint.`);
          } else throw new Error("no pages");
        } catch (e) {
          push("amora", "I had trouble drafting the script just now — say \"draft the script\" again, or paste the pages yourself and I'll save them as-is.");
        }
        setBusy(false);
        return;

      } else {
        const convo = msgs.concat({ role: "user", text }).slice(-12)
          .map((m) => `${m.role === "amora" ? "Amora" : "Kirby"}: ${m.text}`).join("\n");

        // Detect a bulk request that hands over literal, pre-written text for two or more
        // specifically-numbered pages at once (e.g. "create pages 22-24 ... Page 22 ... Page 23 ... Page 24").
        const namedPages = parseNamedPages(text);
        const isMultiPageReq = namedPages.length >= 2;

        // Detect a raw, undeveloped book idea purely by its content (feeling, family
        // situation, trauma/survivor parenting scenario, or rough-concept title) — computed
        // up front, before isImageReq, so a discovery message that happens to contain a
        // creation verb ("create", "make") alongside "book"/"picture" doesn't get hijacked
        // by the image-request branch and routed to the "tell me the idea" gate message —
        // even though the user just gave the idea. Bug reported: Amora replied asking for
        // the idea again after the author had already provided it. Fix: detect idea content
        // first, and have isImageReq stand down when it's present.
        const rawIdeaContentMatch = !book.bibleLocked && text.trim().length > 12 && (
          /\b(book idea|story idea|idea for a book|want(s)? to write a book|want(s)? to make a book|thinking about a book|working title|book about|story about|a book where|a story where)\b/i.test(text)
          || /\b(my (son|daughter|child|kid|kids)|survivor|trauma|traumatic|abuse|abusive|divorce|divorced|separation|deployment|deployed|foster care|adopt(ed|ion)?|grief|grieving|lost (her|his|my) (mom|dad|mother|father|parent)|passed away|\bdied\b|diagnosis|diagnosed|cancer|hospital|illness|anxiety|nightmares?|scared of|afraid of|bully|bullying|bullied|custody|new baby|new sibling|moving away)\b/i.test(text)
          // Catch a structured-but-not-yet-built concept brief — age range + page count +
          // an emotional/educational goal — even when it doesn't use a trauma keyword or the
          // literal phrase "book idea." This is the exact shape of brief an author pastes in
          // on the very first message (e.g. "A 24-page picture book for ages 4-8... the child
          // feels calmer, safer, and more connected"), which previously fell through to either
          // the image-request gate or the generic chat branch instead of starting discovery.
          || (/\bbook\b/i.test(text) && /\bages?\s*\d|\d+\s*[-–]?\s*page/i.test(text) && /safe|calm|connect|feel|teach|learn|understand|cope|process|confus|unfair|grown-?up words/i.test(text))
        );

        // Detect image generation requests — stem-based so typos like "illiatrate" still match.
        // Excludes rawIdeaContentMatch so a fresh raw-idea message isn't misread as an image
        // request just because it mentions "picture book" or uses a creation verb.
        const isImageReq = !isMultiPageReq && !rawIdeaContentMatch && /generat|draw|creat|mak[ei]|illustrat|paint|render|visuali|sketch/i.test(text)
          && /page|scene|spread|cover|illustrat|image|picture|background|setting/i.test(text);

        // Within an image request, "do the whole book" reads very differently from "draw me
        // a one-off scene" — it means paint every already-written page, not invent a single
        // floating image untethered to the actual manuscript. Route it through the same
        // gated batch-paint path as isMultiPageReq instead of the ad-hoc single-image branch.
        const isWholeBookImageReq = isImageReq
          && /\b(the book|all( of)? the pages|every page|whole book|each page|all of (it|them))\b/i.test(text);

        // Detect save-to-bible request
        const isSaveBible = text.toLowerCase().includes("save") && (text.toLowerCase().includes("character") || text.toLowerCase().includes("bible"));

        // Detect "create/build the character bible" requests — these get a real structured
        // draft written straight from the conversation, instead of indirectly asking the
        // model to "parse" whatever Amora's last reply happened to be (which invents
        // nonsense characters if that reply wasn't actually a character sheet).
        // Excludes rawIdeaContentMatch for the same reason as isImageReq above: a raw concept
        // brief that asks Amora to figure out "main characters" as part of the concept (rather
        // than handing over already-decided character names) should go to discovery/starter-
        // package generation, not to the build-bible-from-chat-history path, which has no real
        // character detail to work from yet and will correctly refuse rather than invent one —
        // which reads to the author as Amora asking for information she already gave.
        const isBuildBible = !isSaveBible && !isMultiPageReq && !rawIdeaContentMatch && /character|bible|cast/i.test(text)
          && /creat|build|writ|generat|make|start|set up|come up with/i.test(text);

        // Detect "lock the character bible" said in plain chat — this used to fall through to
        // the generic free-text reply, which could happily say "I've locked it in!" without
        // ever touching the book. Now it runs the exact same readiness check and state write
        // as the "Lock Character Bible" button, so chat can never claim something the data
        // doesn't back up.
        const isLockBible = !isSaveBible && !isBuildBible && !isMultiPageReq
          && /lock|finaliz|approve the bible|that's final/i.test(text)
          && /character|bible|cast/i.test(text);

        // Detect "make the Character Bible match the art already on the pages" request —
        // no fresh image attached, but the book already has generated/uploaded page art to look at.
        const isSyncCharsFromPages = !isMultiPageReq && /character|bible/i.test(text)
          && /match|update|sync|fix|correct|same as|reflect/i.test(text)
          && /image|picture|art|illustrat|page|drawing/i.test(text);

        // Detect a plain status check — "where are we", "what's left", "book status" — so
        // Amora can answer from the real book object instead of vibes/prose. Checked before
        // isScriptPaste since a short status question is neither a script paste nor multi-line.
        const isStatusReq = /\b(where are we|what's left|what is left|what still needs|book status|status update|status check|how's (the |my )?book|where (do |does )?(the |this )?book stand)\b/i.test(text);

        // Detect a raw, undeveloped book idea — a feeling, family situation, trauma/survivor
        // parenting scenario, or a rough-concept title, arriving with no named characters or
        // style yet. Discovery is allowed before the bible is locked — Amora drafts a real
        // structured starter package instead of reflecting the idea back or pointing to a
        // blank Characters tab. "Amora is not a mirror. Amora is a maker."
        const isRawBookIdea = !isMultiPageReq && !isSaveBible && !isBuildBible
          && !isLockBible && !isSyncCharsFromPages && !isStatusReq
          && rawIdeaContentMatch;

        // Detect a full manuscript paste — multiple distinct lines/paragraphs handed over at
        // once with no other matched intent. Previously this fell straight into the generic
        // chit-chat branch, which could only react in prose and never actually saved a word
        // of it onto the book's pages — which read to the author as Amora ignoring the script.
        const isScriptPaste = !isMultiPageReq && !isImageReq && !isSaveBible && !isBuildBible
          && !isLockBible && !isSyncCharsFromPages && !isStatusReq && !isRawBookIdea
          && text.split(/\n+/).map((l) => l.trim()).filter(Boolean).length >= 2
          && text.length > 120;

        // Visual Lock Mode messaging — locked characters are required before painting, not
        // before story discovery or script drafting. If the author hasn't discovered any
        // characters yet, don't point her at a blank Characters tab; offer discovery instead.
        const lockGateMsg = book.characters.length
          ? "Let's lock in your Character Bible and art style first — open the Characters tab, check everyone's filled in (and the book's style & feel), then tap \"Lock Character Bible.\" Once that's locked, every page I paint will actually match."
          : "Before we paint, we need to lock the Character Bible and style so the artwork stays consistent. You don't need to know the characters yet — tell me the idea (who it's for, what's going on) and I'll draft a starter Character Bible for you to approve, then we'll lock it before painting.";
        const scriptGateMsg = "Your Bible's locked — good. Now let's finish the full script before any art: write out the pages you want, then use \"Approve script & paint all pages\" in the Page Editor. I'll paint everything in one matching pass right after, instead of page by page.";
        // Visual Kit gate — separate from the Bible lock. The Bible locks the character
        // *descriptions*; the Visual Kit locks an actual *reference image* for each named
        // character plus the setting and style, and is what every page's art is literally
        // anchored to (image-to-image / page-1-as-anchor). Painting without an approved kit
        // is exactly how identity drifted across "My Mind Is Mine" — locked text alone wasn't
        // enough to keep the model's output consistent.
        const visualKitGateMsg = "One more step before painting: build and approve the Visual Kit on the Characters tab (a reference image for each character, the setting, and the style). Every page's art anchors to those approved images, so this is what actually keeps everyone looking the same from page 1 to the end.";

        if (isSyncCharsFromPages) {
          const pageImgs = book.pages.filter((p) => p.img).map((p) => p.img);
          if (!pageImgs.length) {
            push("amora", "I don't see any finished page art in this book yet to compare against — generate or upload at least one page, then ask me again and I'll line up the Character Bible with it.");
          } else {
            push("amora", "Let me look at your pages and line up the Character Bible with what's actually drawn…");
            try {
              const chars = await deriveCharactersFromImages(pageImgs.slice(0, 6), book.characters);
              if (Array.isArray(chars) && chars.length) {
                setBook((b) => ({ ...b, characters: chars }));
                push("amora", `Done — I matched the Character Bible to your pages. Updated: ${chars.map((c) => c.name).join(", ")}. You can see and fine-tune them anytime in the Character Bible below.`);
              } else throw new Error("no chars");
            } catch (e) {
              push("amora", "I had trouble reading the characters off those pages just now — could you try again, or tell me directly what's changed about how they look?");
            }
          }

        } else if (isStatusReq) {
          // Answers from the real book object only — no vibes, no "sounds good." This is
          // the one place that reads every relevant field at once, so it's the cheapest way
          // to sanity-check that the data model and the chat are actually in sync.
          const painted = book.pages.filter((p) => p.img).length;
          const finished = book.pages.filter((p) => p.finishedArt).length;
          const needsReview = book.pages
            .map((p, i) => ({ p, num: i + 1 }))
            .filter(({ p }) => p.textStatus === "updated_needs_review" || p.imageDirty)
            .map(({ num }) => num);
          const empty = book.pages.filter((p) => p.text && p.text.trim() && !p.img && !p.finishedArt).length;
          const charsOk2 = book.characters.length > 0 && book.characters.every((c) => c.name && c.name.trim() && c.desc && c.desc.trim());
          const lines = [
            `Book Bible: ${book.bibleLocked ? "locked" : charsOk2 ? "drafted, not locked yet" : "not started"}.`,
            `Script: ${book.pages.length} page${book.pages.length === 1 ? "" : "s"}, ${book.scriptApproved ? "approved" : "not approved yet"}.`,
            `Style guide: ${book.styleGuide || book.derivedStyle ? "set" : "not set yet"}.`,
            `Art: ${painted} of ${book.pages.length} page${book.pages.length === 1 ? "" : "s"} painted${empty ? `, ${empty} with text but no art yet` : ""}.`,
            finished ? `Finished uploaded art: ${finished} page${finished === 1 ? "" : "s"} — protected from chat overwrite.` : null,
            needsReview.length ? `Needs your review (text changed since the art was made): page${needsReview.length > 1 ? "s" : ""} ${needsReview.join(", ")}.` : null,
            pendingPaintRequest && pendingPaintRequest.status === "pending" ? `Waiting on you: a paint request for ${pendingPaintRequest.pageIds.length} page${pendingPaintRequest.pageIds.length > 1 ? "s" : ""} is pending — say "paint these pages now" or "review first."` : null,
          ].filter(Boolean);
          push("amora", `Here's where the book stands:\n${lines.map((l) => `— ${l}`).join("\n")}`);

        } else if (isLockBible) {
          const charsOk = book.characters.length > 0 && book.characters.every((c) => c.name && c.name.trim() && c.desc && c.desc.trim());
          const styleOk = !!(book.styleGuide && book.styleGuide.trim());
          if (charsOk && styleOk) {
            setBook((b) => ({ ...b, bibleLocked: true, seed: b.seed || (Math.floor(Math.random() * 900000) + 100000) }));
            push("amora", `Locked it in — ${book.characters.map((c) => c.name).join(", ")}, with the style guide set. Every page I paint from here matches that exactly. Next: finish your script, then "Approve script & paint all pages."`);
          } else {
            const missing = [];
            if (!book.characters.length) missing.push("at least one character");
            else {
              const incomplete = book.characters.filter((c) => !(c.name && c.name.trim()) || !(c.desc && c.desc.trim()));
              if (incomplete.length) missing.push(`a full description for ${incomplete.map((c) => c.name || "an unnamed character").join(", ")}`);
            }
            if (!styleOk) missing.push("the book's style guide");
            push("amora", `I can't lock it yet — still missing ${missing.join(" and ")}. Fill that in on the Characters tab and tell me to lock it again, or I'll keep it open.`);
          }

        } else if (isMultiPageReq) {
          // The literal page text the author handed over is data, not art — save it to the
          // book immediately, no matter what the bible-lock/script-approval state is. Only
          // the actual painting step below is gated, so a script paste always gets acknowledged.
          let newPages = [...book.pages];
          const touchedIds = [];
          for (const np of namedPages) {
            const idx = np.num - 1;
            while (newPages.length < idx) newPages.push({ id: newId(), text: "", img: "" });
            const prev = newPages[idx] || {};
            const hadArt = !!prev.img;
            newPages[idx] = {
              ...prev,
              id: prev.id || newId(),
              text: np.text,
              img: prev.img || "",
              textStatus: "updated_needs_review",
              artStatus: hadArt ? "needs_revision" : (prev.artStatus || "needs_paint"),
              imageDirty: hadArt,
              lastUpdatedBy: "amora_chat",
              lastUpdatedAt: new Date().toISOString(),
            };
            touchedIds.push(newPages[idx].id);
          }
          setBook((b) => ({ ...b, pages: newPages }));

          if (!book.bibleLocked) {
            push("amora", `Saved text for page${namedPages.length > 1 ? "s" : ""} ${namedPages.map(p => p.num).join(", ")} into the page builder — open the Page Editor and you'll see it there now. ${lockGateMsg}`, { affectedPageIds: touchedIds });
          } else if (!book.scriptApproved) {
            push("amora", `Saved text for page${namedPages.length > 1 ? "s" : ""} ${namedPages.map(p => p.num).join(", ")} into the page builder. ${scriptGateMsg}`, { affectedPageIds: touchedIds });
          } else if (!book.visualKitApproved) {
            push("amora", `Saved text for page${namedPages.length > 1 ? "s" : ""} ${namedPages.map(p => p.num).join(", ")} into the page builder. ${visualKitGateMsg}`, { affectedPageIds: touchedIds });
          } else {
            // Fix 2 — text is saved either way, but painting 2+ pages is paid and creative, so it
            // needs the author's explicit go-ahead even though the bible/script gates are open.
            // Pages already flagged finishedArt are real uploaded art and are never auto-queued.
            const eligible = namedPages.filter((np) => !(newPages[np.num - 1] && newPages[np.num - 1].finishedArt));
            const skippedFinished = namedPages.filter((np) => newPages[np.num - 1] && newPages[np.num - 1].finishedArt).map((np) => np.num);
            if (!eligible.length) {
              push("amora", `Saved text for page${namedPages.length > 1 ? "s" : ""} ${namedPages.map(p => p.num).join(", ")} into the page builder — but ${namedPages.length > 1 ? "all of those are" : "that one is"} marked as finished, uploaded art, so I won't repaint over it. Say so explicitly if you want me to replace it.`, { affectedPageIds: touchedIds });
            } else {
              const req = {
                id: newId(), source: "amora_chat", type: "batch_pages",
                pageIds: eligible.map((np) => newPages[np.num - 1].id),
                pageNumbers: eligible.map((np) => np.num),
                estimatedImageCalls: eligible.length,
                createdAt: new Date().toISOString(), status: "pending",
              };
              setPendingPaintRequest(req);
              push("amora", `I saved text for page${namedPages.length > 1 ? "s" : ""} ${namedPages.map(p => p.num).join(", ")} into the page builder.${skippedFinished.length ? ` (Skipping page${skippedFinished.length > 1 ? "s" : ""} ${skippedFinished.join(", ")} — marked as finished art.)` : ""} That's ${eligible.length} page${eligible.length > 1 ? "s" : ""} of new artwork, which spends image credits — I won't generate it until you say go. Review the pages first, or tell me to paint these pages now.`,
                { pendingPaintId: req.id, affectedPageIds: touchedIds });
            }
          }


        } else if (isWholeBookImageReq && !book.bibleLocked) {
          push("amora", lockGateMsg);

        } else if (isWholeBookImageReq && !book.scriptApproved) {
          const written = book.pages.filter((p) => p.text && p.text.trim()).length;
          push("amora", written
            ? `Your Bible's locked, and you've already got ${written} page${written > 1 ? "s" : ""} of real text sitting in the Page Editor — open it and tap "Approve script & paint all pages," and I'll paint every one of them from its actual words in a single matching pass.`
            : "I don't have any page text yet to paint from — write out your pages (or paste the full script here) so I have real words to match the art to, then tell me to approve and paint.");

        } else if (isWholeBookImageReq && !book.visualKitApproved) {
          push("amora", visualKitGateMsg);

        } else if (isWholeBookImageReq) {
          // Fix 2 — same reasoning as isMultiPageReq: propose, don't auto-paint.
          const targets = book.pages.map((p, i) => ({ p, i })).filter(({ p }) => p.text && p.text.trim() && !p.img && !p.finishedArt);
          if (!targets.length) {
            push("amora", "Every page with real text already has art, or there's no page text yet to paint from — add or change some page text and ask me again.");
          } else {
            const req = {
              id: newId(), source: "amora_chat", type: "whole_book",
              pageIds: targets.map(({ p }) => p.id),
              pageNumbers: targets.map(({ i }) => i + 1),
              estimatedImageCalls: targets.length,
              createdAt: new Date().toISOString(), status: "pending",
            };
            setPendingPaintRequest(req);
            push("amora", `I found ${targets.length} page${targets.length > 1 ? "s" : ""} with text but no art yet (page${targets.length > 1 ? "s" : ""} ${req.pageNumbers.join(", ")}). Painting all of them is ${targets.length} image credit${targets.length > 1 ? "s" : ""} — real money, so I'll wait for your go-ahead. Review first, or tell me to paint these pages now.`,
              { pendingPaintId: req.id });
          }

        } else if (isImageReq && !book.bibleLocked) {
          push("amora", lockGateMsg);

        } else if (isImageReq && !book.scriptApproved) {
          push("amora", scriptGateMsg);

        } else if (isImageReq && !book.visualKitApproved) {
          push("amora", visualKitGateMsg);

        } else if (isImageReq) {
          // A single image is one explicit ask in one message — no separate batch confirmation
          // needed (Fix 2 only gates 2+ pages), but it still goes through the same shared
          // paintPageWithConsistency core as every other path, so it gets the identical
          // loraUrl/referenceImageUrl/seed/style payload a button-painted page would get.
          const pageNumMatch = text.match(/page\s+(\d+)/i);
          const namedPage = pageNumMatch ? book.pages[parseInt(pageNumMatch[1], 10) - 1] : null;

          if (namedPage && namedPage.finishedArt && !/\b(replace|overwrite|redo|regenerate|repaint)\b/i.test(text)) {
            push("amora", `Page ${pageNumMatch[1]} is marked as finished, uploaded art, so I won't repaint over it from chat. Say "regenerate page ${pageNumMatch[1]}'s finished art" if you really do want to replace it.`);
          } else {
            push("amora", "On it — building that image now…");

            const charManifestForScene = ((collection && Array.isArray(collection.characters) && collection.characters.length ? collection.characters : book.characters) || [])
              .map((c) => `— ${c.name}: ${c.desc}`).join("\n") || "(no named characters — environment/setting only)";

            let sceneText = text;
            if (namedPage && namedPage.text && namedPage.text.trim()) {
              sceneText = namedPage.text;
            } else {
              // Step 1: Ask Amora ONLY for the scene description.
              const sceneRaw = await amora(
                `The author wants to generate a picture-book illustration.\n\nCharacter Bible (already locked into the image — do NOT re-describe, just use names):\n${charManifestForScene}\n\nRequest: "${text}"\n\nReturn ONLY JSON:\n{"scene":"A 2-3 sentence description of ONLY the scene action, setting, camera angle, lighting, and mood for this specific page. Do NOT re-describe characters — their appearance is locked separately. Be specific about what is happening and where."}`,
                AMORA_SYS + " STRUCTURED MODE: output valid JSON only.", 400
              );
              let sceneMeta = { scene: text };
              try { sceneMeta = parseLoose(sceneRaw); } catch (_) { /* use defaults */ }
              sceneText = sceneMeta.scene || text;
            }

            if (namedPage) {
              const idx = parseInt(pageNumMatch[1], 10) - 1;
              const result = await paintPageWithConsistency({
                book, setBook, collection, page: { ...namedPage, text: sceneText }, pageIndex: idx,
                allowOverwriteFinishedArt: !!namedPage.finishedArt,
                source: "amora_chat", confirmedByUser: true, isBatch: false, authorEmail,
              });
              if (!result.ok) {
                push("amora", `I couldn't generate that image just now — ${result.error}.`);
              } else {
                push("amora", `Done — page ${pageNumMatch[1]}'s art now matches its actual text, painted with the same style/character/LoRA settings as everything else in the book. Take a look in the page editor.`, { affectedPageIds: [namedPage.id].filter(Boolean) });
              }
            } else {
              const pseudoPage = { id: null, text: sceneText, img: null, finishedArt: false };
              const result = await paintPageWithConsistency({
                book, setBook, collection, page: pseudoPage, pageIndex: book.pages.length,
                applyToBookPages: false,
                source: "amora_chat", confirmedByUser: true, isBatch: false, authorEmail,
              });
              if (!result.ok) {
                push("amora", `I couldn't generate that image just now — ${result.error}. Check that FAL_API_KEY is set in your Vercel environment variables.`);
              } else {
                setMsgs((m) => [...m, { role: "amora", text: "Here it is ❖ Click “Add to book” to place it on a page.", imgUrl: result.url }]);
              }
            }
          }

        } else if (isSaveBible) {
          const lastAmoraMsg = [...msgs].reverse().find((m) => m.role === "amora");
          const charText = lastAmoraMsg ? lastAmoraMsg.text : "";
          const saveReply = await amora(
            `Kirby wants to save these character descriptions to her Character Bible. Parse the following Amora message and return a JSON array: [{"name":"...","desc":"full visual + emotional description including clothing, palette, personality"}]. Only valid JSON array, nothing else.\n\nAmora message:\n${charText}`,
            AMORA_SYS + " STRUCTURED MODE: output valid JSON only.", 1500
          );
          try {
            const chars = JSON.parse(saveReply.trim().replace(/^```json\n?|\n?```$/g, ""));
            if (Array.isArray(chars) && chars.length) {
              setBook((b) => ({ ...b, characters: [...b.characters.filter((c) => !chars.find((nc) => nc.name === c.name)), ...chars] }));
              push("amora", `Saved ${chars.map((c) => c.name).join(", ")} to your Character Bible. You can see and edit them in the book editor any time.`);
            } else throw new Error("no chars");
          } catch {
            push("amora", "I wasn't quite sure how to parse those — could you copy the character descriptions into the Character Bible fields in the editor and I'll keep them consistent from there?");
          }

        } else if (isBuildBible) {
          push("amora", "Let's build your Character Bible from scratch — give me a second to pull together what we've talked about…");
          const draftRaw = await amora(
            `The author wants a Character Bible drafted for their picture book "${book.title}".

Conversation so far:
${convo}

Look ONLY at what the author has actually told you about characters in this conversation (names, appearance, personality, role in the story). Do NOT invent characters, names, or traits that were never mentioned or implied — if the conversation doesn't contain enough real character information yet, return an empty array. Never pad the result with generic or made-up filler just to have something to show.

Return ONLY JSON: {"characters":[{"name":"...","desc":"full visual + emotional description including clothing, palette, personality"}], "enough": true|false}
"enough" should be false if there isn't yet real character detail in the conversation to build from.`,
            AMORA_SYS + " STRUCTURED MODE: output valid JSON only. Never hallucinate characters that weren't actually discussed.", 1500
          );
          try {
            const draft = parseLoose(draftRaw);
            const chars = Array.isArray(draft.characters) ? draft.characters.filter((c) => c && c.name && c.desc) : [];
            if (draft.enough && chars.length) {
              setBook((b) => ({ ...b, characters: [...b.characters.filter((c) => !chars.find((nc) => nc.name === c.name)), ...chars] }));
              push("amora", `Here's a first pass at your Character Bible: ${chars.map((c) => c.name).join(", ")}. I've added them to the Characters tab — take a look, tweak anything that's off, then we'll lock it in before painting any pages.`);
            } else {
              push("amora", "I don't have enough real detail yet to build actual characters — I'd rather leave it blank than make something up. Tell me who's in this book: names, what they look like, how they act, and I'll draft proper entries from that.");
            }
          } catch (e) {
            push("amora", "I don't have enough real detail yet to build actual characters — I'd rather leave it blank than make something up. Tell me who's in this book: names, what they look like, how they act, and I'll draft proper entries from that.");
          }

        } else if (isRawBookIdea) {
          // Discovery Mode — the author arrived with only a feeling, situation, or rough
          // concept, not named characters. Draft a real structured starter package instead
          // of reflecting the idea back. No image generation happens here.
          push("amora", "Let's shape this into a story — give me a moment to put together a starter package…");
          try {
            const draftRaw = await amora(
              `An author is bringing a raw book idea, family situation, or feeling — not yet named characters or a style. Here is the conversation so far:\n${convo}\n\nDraft a structured starter package for her picture book. Stay close to what she actually said — extend it gently, but do not invent unrelated plot. Be trauma-sensitive: this may involve a survivor parent, a hard family situation, or a child's hard feeling. Never make the book heavier or more explicit than the parent's own words.\n\nReturn ONLY JSON with these exact keys:\n{"title":"working title","ageRange":"e.g. 4-8","concept":"one sentence concept","coreMessage":"the book's core message","emotionalGoal":"the emotional goal for the child reader","characters":[{"name":"...","role":"main character / caregiver / comfort object etc","desc":"full visual + emotional description"}],"setting":"setting options, 1-2 sentences","refrain":"a short repeated phrase/refrain the book can use","boundaries":"trauma-sensitive boundaries to respect","avoid":"what this book should avoid doing or saying","styleGuide":"a draft visual style direction, 1-2 sentences","nextStep":"one sentence suggested next step"}`,
              AMORA_SYS + " STRUCTURED MODE: output valid JSON only. Be warm, concrete, and trauma-sensitive. Never generate or describe explicit imagery, only describe style direction.", 1800
            );
            const draft = parseLoose(draftRaw);
            const id = newId();
            setPendingBibleDraft({ id, status: "pending", draft, createdAt: new Date().toISOString() });
            push("amora", formatBibleDraftMessage(draft), { pendingBibleId: id });
          } catch (e) {
            push("amora", "I want to build this properly instead of guessing — could you say a little more about the idea (who it's for, what's going on, how you want the child to feel by the end)? I'll turn that straight into a starter Book Bible.");
          }

        } else if (isScriptPaste) {
          push("amora", "Got your script — let me split this into pages exactly as written…");
          const splitRaw = await amora(
            `The author just pasted what looks like the full manuscript for her picture book "${book.title}". Split it into individual page entries, in order. Use her EXACT words — do not rewrite, summarize, fix, or add anything. If she already numbered or clearly separated pages/spreads, respect those breaks; otherwise split on paragraph breaks.\n\nText:\n"""${text}"""\n\nReturn ONLY JSON: {"pages":["page 1 text", "page 2 text", ...]}`,
            AMORA_SYS + " STRUCTURED MODE: output valid JSON only. Never alter the author's wording.", 2000
          );
          try {
            const draft = parseLoose(splitRaw);
            const pageTexts = Array.isArray(draft.pages) ? draft.pages.filter((t) => typeof t === "string" && t.trim()) : [];
            if (pageTexts.length) {
              setBook((b) => {
                const newPages = pageTexts.map((t, i) => {
                  const prev = b.pages[i] || {};
                  const hadArt = !!prev.img;
                  return {
                    ...prev,
                    id: prev.id || newId(),
                    text: t,
                    img: prev.img || "",
                    textStatus: "draft",
                    artStatus: hadArt ? "needs_revision" : (prev.artStatus || "needs_paint"),
                    imageDirty: hadArt,
                    lastUpdatedBy: "amora_chat",
                    lastUpdatedAt: new Date().toISOString(),
                  };
                });
                return { ...b, pages: newPages, scriptApproved: false };
              });
              push("amora", `Saved — that's ${pageTexts.length} page${pageTexts.length > 1 ? "s" : ""} of real text in the Page Editor now, exactly as you wrote it. Take a look, and once it's right, lock your Character Bible (if you haven't) and use "Approve script & paint all pages" so the art matches every word.`);
            } else throw new Error("no pages");
          } catch (e) {
            push("amora", "I had trouble splitting that into pages just now — could you paste it again, or mark where each page should break (a blank line between them works)?");
          }

        } else {
          const collContext = collection ? `\nCharacter collection: "${collection.name}". Style: ${collection.styleGuide}.` : "";
          const charBible = book.characters.length
            ? `\n\nCharacter Bible:\n${book.characters.map((c) => `— ${c.name}: ${c.desc}`).join("\n")}`
            : "";
          const memoryContext = memoryRef.current ? `\n\nWhat you remember about this author from past sessions: ${memoryRef.current}` : "";
          const reply = await amora(
            `You are guiding the author through building a children's picture book, step by step. Current book title: "${book.title}". Existing characters: ${book.characters.map((c) => c.name).join(", ") || "none yet"}. Pages so far: ${book.pages.length}.${collContext}${charBible}${memoryContext}\n\nConversation:\n${convo}\n\nRespond as Amora with ONE warm, short next step or question. Move the book forward gently — help shape the idea, suggest a title when ready, develop characters, or offer to draft or generate pages. You CAN generate illustration images — just tell the author to say something like "generate page 3 showing [scene]". Don't dump the whole book at once. End by inviting her next bit. Plain text only.

CRITICAL: You have NOT locked, saved, added, or generated anything by writing this reply — plain conversation never changes the book. NEVER say or imply you've "locked it in," "saved that," "added the characters," or "generated the images" unless you are certain it already happened earlier in this conversation. If she describes characters here, tell her to say "build the character bible" so it actually gets saved. If she wants it locked, tell her to say "lock the character bible." If she just pasted a full script and nothing was saved, tell her plainly and ask her to resend it.`
          );
          push("amora", reply);
          updateMemory(text, reply);
        }
      }
    } catch (e) {
      push("amora", "I lost my thread for a second there — nothing's lost. Could you say that once more?");
    }
    setBusy(false);
  };

  const [uploads, setUploads] = useState([]); // {name, dataUrl} finished page images, in order
  const [manuscript, setManuscript] = useState("");
  const [showMs, setShowMs] = useState(false);
  const fileRef = useRef(null);

  const resize = (file, max = 1100) => new Promise((res) => {
    // Try canvas downscale; if anything fails in the sandbox, fall back to the raw file via FileReader.
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
          finish(c.toDataURL("image/jpeg", 0.78));
        } catch (e) { finish(null); readRaw(); }
      };
      img.onerror = () => { try { URL.revokeObjectURL(url); } catch (e) {} readRaw(); };
      // safety net: if the image never loads in the sandbox, read raw after a beat
      setTimeout(() => { if (!done) { img.onload = null; readRaw(); } }, 4000);
      img.src = url;
    } catch (e) { readRaw(); }
  });

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) {
      push("amora", "I didn't catch any image files there. Try clicking the “Upload finished pages” button and choosing your page images (JPG or PNG), or drag them onto this box.");
      return;
    }
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const added = [];
    let failed = 0;
    for (const f of files) {
      const dataUrl = await resize(f);
      if (dataUrl) added.push({ name: f.name, dataUrl });
      else failed++;
    }
    if (!added.length) {
      push("amora", "I could see the files but couldn't load them. Try a smaller batch — upload 5–10 pages at a time — or resize the images to under 2MB each before uploading.");
      return;
    }
    setUploads((u) => [...u, ...added]);
    push("amora", `I've got ${added.length} page image${added.length > 1 ? "s" : ""}${failed ? ` (${failed} couldn't be read — try those again)` : ""}${uploads.length ? `, ${uploads.length + added.length} total now` : ""}. They're in filename order — you can reorder them below. When all your pages and your story text are in, tap “Build the book from my uploads” and I'll read each page and place everything for you.`);
  };

  const moveUp = (i) => setUploads((u) => { if (i === 0) return u; const a = [...u]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  const moveDown = (i) => setUploads((u) => { if (i === u.length - 1) return u; const a = [...u]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; return a; });
  const removeUpload = (i) => setUploads((u) => u.filter((_, j) => j !== i));

  const generatePages = async () => {
    setBusy(true);
    push("amora", "Lovely. Let me shape what we've talked about into pages — give me a moment…");
    try {
      const convo = msgs.map((m) => `${m.role === "amora" ? "Amora" : "Kirby"}: ${m.text}`).join("\n");
      const raw = await amora(
        `From this conversation with Kirby, build a children's picture book.\n\n${convo}\n\nReturn ONLY JSON, no markdown:\n{"title":"a fitting title","characters":[{"name":"","desc":"vivid, consistent visual + emotional description for illustration consistency"}],"pages":[{"text":"page text, under 40 words, true to her idea and voice"}]}\nMake AT LEAST 24 pages (Amazon KDP requires a 24-page minimum for paperback picture books) — aim for 24 to 32. Pace the story quietly across that many spreads; it is fine for some pages to be a single quiet line. Arc must move toward reassurance and safety. Preserve any exact page text Kirby gave; otherwise write in her spirit.`,
        AMORA_SYS + " You are in STRUCTURED MODE: output valid JSON only."
      );
      const j = parseLoose(raw);
      setBook((b) => ({
        ...b,
        title: j.title || b.title,
        characters: (j.characters && j.characters.length ? j.characters : b.characters),
        pages: (j.pages || []).map((p) => ({ id: newId(), text: p.text || "", img: "" })),
      }));
      push("amora", `I've drafted "${j.title}" with ${(j.pages || []).length} pages and a Character Bible for ${(j.characters || []).map((c) => c.name).join(", ")}. Open the book to read, reorder, and tune any page with me — and when you're ready, run the consistency check so every page stays true to your characters.`);
      setTimeout(onDone, 900);
    } catch (e) {
      push("amora", "That didn't come together cleanly — let's try again in a moment, or tell me a little more first.");
    }
    setBusy(false);
  };

  // Build the book by reading the uploaded finished pages with vision
  const buildFromUploads = async () => {
    if (!uploads.length) { push("amora", "Add your finished page images first — tap the “Upload finished pages” button below."); return; }
    setBusy(true);
    push("amora", `Reading all ${uploads.length} of your finished pages now — looking at the art, the characters, and the words on each one. This part takes a little longer because I'm truly looking at every page…`);

    // timeout-guarded fetch so a blocked request can never hang the button forever
    const fetchWithTimeout = async (body, ms = 30000) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), ms);
      try {
        const res = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body), signal: ctrl.signal,
        });
        clearTimeout(timer);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || "tools unavailable");
        return data;
      } catch (e) {
        clearTimeout(timer);
        if (e.name === "AbortError") throw new Error("a page took too long to read — please try again");
        throw e;
      }
    };

    try {
      // Vision pass: analyze each page image into {text, characters, style, sceneSummary}
      const analyses = [];
      for (let i = 0; i < uploads.length; i++) {
        const dataUrl = uploads[i].dataUrl;
        const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
        const mediaType = (mimeMatch && mimeMatch[1]) || "image/jpeg";
        const base64 = dataUrl.split(",")[1];
        const data = await fetchWithTimeout({
          model: "claude-sonnet-4-6", max_tokens: 700, system: AMORA_SYS + " STRUCTURED MODE: output valid JSON only.",
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `This is finished page ${i + 1} of a survivor mother's children's picture book. Look closely. Return ONLY JSON: {"text":"the exact words printed on this page, verbatim, or empty string if none","characters":["names or short labels of any characters visible, e.g. 'Mama','child','bear'"],"style":"brief note on art style, palette, and any visible font/lettering style","scene":"one-line description of what happens on this page"}` },
          ] }],
        });
        const txt = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
        let parsed; try { parsed = parseLoose(txt); } catch (e) { parsed = { text: "", characters: [], style: "", scene: "" }; }
        analyses.push(parsed);
        if (i === 0) push("amora", "Good — my reading tools are responding. Working through the rest now…");
        if ((i + 1) % 5 === 0 || i === uploads.length - 1) push("amora", `…read ${i + 1} of ${uploads.length}.`);
      }

      // Synthesis pass: build Character Bible + reconcile any pasted manuscript with detected page text
      const perPage = analyses.map((a, i) => `Page ${i + 1}: text="${a.text}" | characters=${(a.characters || []).join(", ")} | scene=${a.scene}`).join("\n");
      const styleNotes = analyses.map((a) => a.style).filter(Boolean).slice(0, 6).join(" | ");
      let j = {};
      try {
        const synthRaw = await amora(
          `A survivor author uploaded ${uploads.length} finished picture-book pages. Here is what I read from each:\n${perPage}\n\n${manuscript.trim() ? `She also pasted her own manuscript text below. Where a page's printed text is blank or unclear, use the matching manuscript line. Preserve her exact words — never rewrite.\nMANUSCRIPT:\n"""${manuscript.trim()}"""\n` : ""}\nArt/lettering style notes across pages: ${styleNotes}\n\nReturn ONLY JSON:\n{"title":"the book's title if visible on a page, else best guess","characters":[{"name":"","desc":"consistent visual + emotional description built from how this character actually appears across the pages"}],"styleGuide":"a short locked style + font description for future pages and the cover","pages":[{"n":1,"text":"final text for page 1"}],"note":"one warm sentence on what you found"}\nInclude one pages entry per uploaded page, in order. Merge recurring characters into one bible entry each.`,
          AMORA_SYS + " STRUCTURED MODE: output valid JSON only.",
          4000
        );
        j = parseLoose(synthRaw);
      } catch (_synthErr) {
        // Synthesis parse failed — continue with vision-only data so the editor always opens
        j = {};
      }
      const byN = {}; (j.pages || []).forEach((p) => { byN[p.n] = p.text; });
      setBook((b) => ({
        ...b,
        title: j.title && j.title !== "best guess" ? j.title : b.title,
        characters: (j.characters && j.characters.length ? j.characters : b.characters),
        styleGuide: j.styleGuide || b.styleGuide || "",
        // finishedArt: true marks these as already-complete pages — art AND text were
        // baked into the same uploaded pixels by the author before this ever reached us.
        // The `text` field below is only a transcription Amora read off the image for her
        // own reference (consistency checks, search) — it is NOT story copy waiting to be
        // typeset. makeBookPDF (Publishing.jsx) must never draw it a second time under the
        // image; that was the literal duplicate-text bug.
        pages: uploads.map((u, i) => ({ id: newId(), text: byN[i + 1] || (analyses[i] && analyses[i].text) || "", img: u.dataUrl, finishedArt: true })),
      }));
      push("amora", `${j.note || "All done — your pages are in."} I placed your ${uploads.length} finished pages in order and kept your words on each one. Open the book to see everything — and run the consistency check when you're ready.`);
      setTimeout(onDone, 1100);
    } catch (e) {
      const msg = (e && e.message) ? e.message : "";
      push("amora", `I couldn't finish reading the pages just now${msg ? ` — ${msg}` : ""}. Nothing was lost — click "Build the book from my uploads" to try again.`);
    }
    setBusy(false);
  };

  const quick = [
    "I only have an idea",
    "I have page text already",
    "Help me name the book",
    "Build the pages now",
  ];

  return (
    <section className="morning page-top">
      <div className="wrap">
        <div className="row-between">
          <button className="btn-text" onClick={onBack}>← My books</button>
          <span className={`saved-flash${savedFlash ? " visible" : ""}`}>✓ Saved</span>
        </div>
        <h2 style={{ marginBottom: 6 }}>{book.title}</h2>
        <div className="studio-nav">
          <button className="studio-tab on">Amora</button>
          <button className="studio-tab" onClick={() => onGoEditor("pages")}>Page Editor</button>
          <button className="studio-tab" onClick={() => onGoEditor("bible")}>Characters</button>
          <button className="studio-tab" style={{color:"#E2A857"}} onClick={onPublish}>Publishing ✦</button>
        </div>
        <div className="amora-chat">
          <div className="amora-scroll" ref={scroller}>
            {msgs.map((m, i) => (
              <div key={i} className={"abubble " + m.role}>
                {m.role === "amora" ? <span className="amora-name"><MoonMark size={15} /> Amora</span> : null}
                {m.imgUrl ? (
                  <div className="gen-img-wrap">
                    <img src={m.imgUrl} className="gen-img" alt="Amora-generated illustration" />
                    <div className="gen-img-actions">
                      <span className="gen-badge">{m.model === "dalle" ? "DALL-E 3" : "Flux"}</span>
                      <button className="btn-gold" style={{ fontSize: 13, padding: "6px 12px" }} onClick={() => {
                        setBook((b) => ({ ...b, pages: [...b.pages, { id: newId(), text: "", img: m.imgUrl }] }));
                        push("amora", "Added to your book as a new page — open Page Editor to place the text.");
                      }}>+ Add to book</button>
                    </div>
                  </div>
                ) : null}
                {m.text ? m.text.split("\n").map((l, j) => (l ? <p key={j}>{l}</p> : <br key={j} />)) : null}
                {m.pendingPaintId && pendingPaintRequest && pendingPaintRequest.id === m.pendingPaintId && pendingPaintRequest.status === "pending" ? (
                  <div className="gen-img-actions" style={{ marginTop: 8 }}>
                    <button className="btn-gold" style={{ fontSize: 13, padding: "6px 12px" }} disabled={busy} onClick={confirmPendingPaint}>Paint these pages now</button>
                    <button className="btn-line dark" style={{ fontSize: 13, padding: "6px 12px" }} disabled={busy} onClick={() => dismissPendingPaint()}>Review first</button>
                    <button className="btn-line dark" style={{ fontSize: 13, padding: "6px 12px" }} disabled={busy} onClick={() => dismissPendingPaint("No problem — cancelled. Nothing was painted.")}>Cancel</button>
                  </div>
                ) : null}
                {m.pendingBibleId && pendingBibleDraft && pendingBibleDraft.id === m.pendingBibleId && pendingBibleDraft.status === "pending" ? (
                  <div className="gen-img-actions" style={{ marginTop: 8 }}>
                    <button className="btn-gold" style={{ fontSize: 13, padding: "6px 12px" }} disabled={busy} onClick={() => send("Save this Bible")}>Save this Bible</button>
                    <button className="btn-line dark" style={{ fontSize: 13, padding: "6px 12px" }} disabled={busy} onClick={() => send("Revise this Bible")}>Revise this Bible</button>
                    <button className="btn-line dark" style={{ fontSize: 13, padding: "6px 12px" }} disabled={busy} onClick={() => send("Draft another option")}>Draft another option</button>
                    <button className="btn-line dark" style={{ fontSize: 13, padding: "6px 12px" }} disabled={busy} onClick={() => send("Continue to script")}>Continue to script</button>
                  </div>
                ) : null}
              </div>
            ))}
            {busy ? <div className="abubble amora"><span className="amora-name"><MoonMark size={15} /> Amora</span><p className="typing">creating your book<i>.</i><i>.</i><i>.</i></p></div> : null}
          </div>
          <div className="amora-quick">
            {quick.map((q) => (
              <button key={q} disabled={busy} onClick={() => q === "Build the pages now" ? generatePages() : send(q)}>{q}</button>
            ))}
          </div>
          {chatImg ? (
            <div className="chat-img-preview">
              <img src={chatImg.dataUrl} alt="attached" />
              <span>{chatImg.name}</span>
              <button onClick={() => setChatImg(null)} title="Remove">✕</button>
            </div>
          ) : null}
          <div className="amora-bar">
            <input type="file" accept="image/*" ref={chatImgRef} style={{ display: "none" }}
              onChange={(e) => { attachChatImage(e.target.files[0]); e.target.value = ""; }} />
            <button className="btn-attach" title="Attach image (character sheet, sketch…)" onClick={() => chatImgRef.current && chatImgRef.current.click()}>📎</button>
            <textarea rows={1} placeholder="Tell Amora what you have… or attach an image ↑" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button className="btn-gold" disabled={busy || (!input.trim() && !chatImg)} onClick={() => send()}>Send</button>
          </div>
        </div>

        <div className="upload-zone"
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag"); }}
          onDragLeave={(e) => e.currentTarget.classList.remove("drag")}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("drag"); addFiles(e.dataTransfer.files); }}>
          <input type="file" accept="image/*" multiple ref={fileRef} style={{ display: "none" }}
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <div className="uz-head">
            <div>
              <p className="eyebrow plum tightm">Have finished pages?</p>
              <p className="uz-sub">Drop your finished page images here (or click to choose). Amora will read each one — the art, the characters, the words — and place them in order.</p>
            </div>
            <button className="btn-line dark" onClick={() => fileRef.current && fileRef.current.click()}>Upload finished pages</button>
          </div>

          {uploads.length ? (
            <>
              <div className="uz-grid">
                {uploads.map((u, i) => (
                  <div key={i} className="uz-thumb">
                    <span className="uz-n">{i + 1}</span>
                    <img src={u.dataUrl} alt={"Page " + (i + 1)} />
                    <div className="uz-ctrls">
                      <button onClick={() => moveUp(i)} disabled={i === 0} title="Move earlier">↑</button>
                      <button onClick={() => moveDown(i)} disabled={i === uploads.length - 1} title="Move later">↓</button>
                      <button onClick={() => removeUpload(i)} title="Remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="ms-toggle" onClick={() => setShowMs((s) => !s)}>
                {showMs ? "▾ " : "▸ "}Paste your story text too (optional — helps Amora place the exact words)
              </button>
              {showMs ? (
                <textarea className="ms-box" rows={6} placeholder={"Page 1: ...\nPage 2: ...\n(Paste your written manuscript — Amora keeps your exact words and matches them to the right page.)"}
                  value={manuscript} onChange={(e) => setManuscript(e.target.value)} />
              ) : null}
              <button className="btn-gold full" style={{ marginTop: 14 }} disabled={busy} onClick={buildFromUploads}>
                {busy ? "Amora is reading your pages…" : `Build the book from my ${uploads.length} uploaded page${uploads.length > 1 ? "s" : ""}`}
              </button>
            </>
          ) : (
            <p className="uz-empty">No pages yet. Tip: name your files so they sort in order (page01, page02…) and they'll arrive already sequenced.</p>
          )}
        </div>

        <p className="fine">Two ways to build: tell Amora your idea and tap “Build the pages now,” or upload finished pages above and tap “Build the book from my uploads.” Either way she creates the Character Bible for you.</p>
      </div>
    </section>
  );
}

/* ---------------- Book editor: drag-drop pages, per-page chat, bible, consistency ---------------- */
// Shared by the per-page "upload your own image" control — same downscale-then-fallback
// approach already used for whole-book page uploads, so a manually supplied photo behaves
// the same way a generated one does everywhere downstream (Publishing, Supabase, etc).
function resizeImageFile(file, max = 1400) {
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
          finish(c.toDataURL("image/jpeg", 0.85));
        } catch (e) { finish(null); readRaw(); }
      };
      img.onerror = () => { try { URL.revokeObjectURL(url); } catch (e) {} readRaw(); };
      setTimeout(() => { if (!done) { img.onload = null; readRaw(); } }, 4000);
      img.src = url;
    } catch (e) { readRaw(); }
  });
}

function BookEditor({ book, setBook, collection, onBack, onSignOut, onAmora, onPublish, savedFlash, authorEmail }) {
  const [tab, setTab] = useState("pages");
  const [report, setReport] = useState(null);
  const [checking, setChecking] = useState(false);
  const [portraitBusy, setPortraitBusy] = useState({}); // character index -> true while painting
  const [pgImgBusy, setPgImgBusy] = useState({}); // page id -> true while painting
  const [pgImgErr, setPgImgErr] = useState({}); // page id -> error string
  const [portraitErr, setPortraitErr] = useState({}); // character index -> error string
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchNote, setBatchNote] = useState("");
  const [pgUploadBusy, setPgUploadBusy] = useState({}); // page id -> true while reading an author-supplied image
  const pageFileInputs = useRef({}); // page id -> <input type="file"> ref, one per page row
  const drag = useRef(null);
  const [vkBusy, setVkBusy] = useState(false); // Visual Kit build in progress
  const [vkErr, setVkErr] = useState("");

  // Bible-lock + script-approval gates. Locking is a real workflow state now, not just
  // prompt language — nothing paints until characters + style are filled in and locked,
  // and no batch art runs until the full script (every page's text) is approved.
  const charsOk = book.characters.length > 0 && book.characters.every((c) => c.name && c.name.trim() && c.desc && c.desc.trim());
  const styleOk = !!(book.styleGuide && book.styleGuide.trim());
  const bibleReady = charsOk && styleOk;
  const bibleLocked = !!book.bibleLocked;
  const scriptApproved = !!book.scriptApproved;
  const hasScript = book.pages.length > 0 && book.pages.every((p) => p.text && p.text.trim());

  const lockBible = () => { if (bibleReady) setBook((b) => ({ ...b, bibleLocked: true, seed: b.seed || (Math.floor(Math.random() * 900000) + 100000) })); };
  const unlockBible = () => setBook((b) => ({ ...b, bibleLocked: false, scriptApproved: false }));

  // --- Visual Kit -----------------------------------------------------------------
  // The Bible above locks character *descriptions*. The Visual Kit locks actual
  // *reference images* — one clean portrait per named character (main child, trusted
  // adult, companion/object if the story has one), a character-free setting reference,
  // and a character-free style sample. Page painting anchors to these images (see
  // paintPageWithConsistency's referenceImageUrl logic), which is what actually keeps
  // identity/setting/style consistent — locked text alone wasn't enough; that's the
  // root cause of the identity drift found in the "My Mind Is Mine" live trial.
  // Symbolic-motif Bible entries ("The Quiet Place Inside," a feeling, an inner light)
  // aren't a paintable character — see isSymbolicMotif. They don't need a portrait and
  // don't gate Visual Kit readiness; only real characters (main child, trusted adult,
  // companion/object) do.
  const paintableCharacters = book.characters.filter((c) => !isSymbolicMotif(c));
  const symbolicMotifCharacters = book.characters.filter((c) => isSymbolicMotif(c));
  const visualKitReady = !!(
    book.visualKit && book.visualKit.settingImg && book.visualKit.styleSampleImg && book.visualKit.sceneAnchorImg &&
    paintableCharacters.length && paintableCharacters.every((c) => c.img)
  );
  const visualKitApproved = !!book.visualKitApproved;

  const buildVisualKit = async () => {
    if (vkBusy || !bibleLocked) return;
    setVkBusy(true); setVkErr("");
    try {
const styleGuide = (book.visualKit && book.visualKit.styleDesc) || book.styleGuide || collection?.styleGuide || book.derivedStyle || "";
      let seed = collection?.seed || book.seed;
      if (!seed) { seed = Math.floor(Math.random() * 900000) + 100000; setBook((b) => ({ ...b, seed: b.seed || seed })); }
      // One reference portrait per named character — main child, trusted adult, and any
      // companion/object that's already a real Character Bible entry. (A companion only
      // mentioned in passing in the story text, never added here, is exactly the gap that
      // let an unlocked dog/creature appear on pages 11-12 and 25 of the trial book — see
      // the advisory check below.)
      for (let i = 0; i < book.characters.length; i++) {
        if (isSymbolicMotif(book.characters[i])) continue; // symbolic motif — no portrait, see isSymbolicMotif
        if (!book.characters[i].img) {
          const url = await genCharacterPortrait(book.characters[i], styleGuide, seed);
          setChar(i, { img: url });
        }
      }
      const settingDesc = (book.bible && book.bible.setting) || book.setting || "";
      const settingImg = await genSettingReference(styleGuide, settingDesc, seed);
      const sampleScene = STYLE_SAMPLE_SCENES[Math.floor(Math.random() * STYLE_SAMPLE_SCENES.length)];
      const styleSampleImg = await genStyleSample(styleGuide, sampleScene, seed);
      // The Scene Anchor — protagonist actually placed in the setting, full composition —
      // is what page 1 anchors to instead of the isolated portrait (see genSceneAnchor and
      // the page-1 referenceImageUrl logic in paintPageWithConsistency).
      const protagonist = protagonistCharacter(book.characters);
      const sceneAnchorImg = await genSceneAnchor(protagonist, styleGuide, settingDesc, seed);
      // Rebuilding the kit always clears approval — a regenerated reference image needs
      // a fresh look before it's trusted as the anchor for every page again.
      setBook((b) => ({ ...b, visualKit: { settingDesc, settingImg, styleSampleImg, sceneAnchorImg, builtAt: new Date().toISOString() }, visualKitApproved: false }));
    } catch (e) {
      setVkErr((e && e.message) || "Visual Kit generation failed — try again.");
    } finally {
      setVkBusy(false);
    }
  };

  const approveVisualKit = () => { if (visualKitReady) setBook((b) => ({ ...b, visualKitApproved: true })); };
  const unapproveVisualKit = () => setBook((b) => ({ ...b, visualKitApproved: false }));

  // Lightweight, advisory-only heuristic: if the page text mentions a common
  // companion/comfort-object noun that isn't any named character's name, flag it. This
  // is a word-list guess, not real NLP — it never blocks the kit, it just surfaces the
  // exact failure mode Kirby found (an animal/companion that was never visually locked)
  // so the author can decide whether to add it as a real Character Bible entry.
  const unlockedCompanionWarning = (() => {
    const names = book.characters.map((c) => (c.name || "").toLowerCase()).filter(Boolean);
    const words = ["dog", "puppy", "cat", "kitten", "bear", "teddy", "rabbit", "bunny", "blanket",
      "stuffed animal", "stuffie", "companion", "pet", "creature", "fox", "owl", "bird"];
    const allText = book.pages.map((p) => p.text || "").join(" ").toLowerCase();
    const hit = words.find((w) => allText.includes(w) && !names.some((n) => n && (w.includes(n) || n.includes(w))));
    return hit || null;
  })();

  const setPage = (id, patch) => setBook((b) => ({ ...b, pages: b.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const addPage = () => setBook((b) => ({ ...b, pages: [...b.pages, { id: newId(), text: "", img: "" }] }));
  const removePage = (id) => setBook((b) => ({ ...b, pages: b.pages.filter((p) => p.id !== id) }));
  // Dedication/Copyright/About Author/About Little Amour Books are real pages too — they
  // print at the front or back of every book, but until now the only way to touch them was
  // a separate set of static form fields buried in Publishing, with no Amora chat at all.
  // This reads/writes the exact same book.publishing.<key> records Publishing's own builders
  // use (see DedicationBuilder etc. in Publishing.jsx) so edits made here or there are the
  // same data, never a fork of it.
  const setMatter = (key, patch) => setBook((b) => ({ ...b, publishing: { ...b.publishing, [key]: { ...(b.publishing?.[key]), ...patch } } }));

  // Lets an author drop in their own finished art for a page instead of painting with Amora —
  // e.g. Kirby finishing "Mama Has Papers Today" with her own illustrations for pages the AI
  // pipeline hasn't matched yet. Goes through the same resize path as whole-book uploads so
  // the result is just a normal data URI in p.img, identical to an AI-painted page everywhere
  // downstream (Page Editor, Publishing export, Supabase storage).
  const uploadPageImage = async (p, file) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      setPgImgErr((prev) => ({ ...prev, [p.id]: "That doesn't look like an image file — try a JPG or PNG." }));
      return;
    }
    setPgImgErr((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
    setPgUploadBusy((prev) => ({ ...prev, [p.id]: true }));
    try {
      const dataUrl = await resizeImageFile(file);
      if (!dataUrl) {
        setPgImgErr((prev) => ({ ...prev, [p.id]: "Couldn't read that image — try a smaller file or a different format." }));
        return;
      }
      setPage(p.id, { img: dataUrl, artStatus: "painted", imageDirty: false, lastUpdatedBy: "upload", lastUpdatedAt: new Date().toISOString() });
    } finally {
      setPgUploadBusy((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
    }
  };

  // Generates (or regenerates, with optional author feedback) the illustration for ONE page.
  // All the actual consistency logic (style guide, character manifest, seed, LoRA/reference
  // image, finished-art guard) now lives in the shared paintPageWithConsistency function —
  // this is a thin wrapper that owns this component's busy/error UI state around it.
  // Returns true/false for real — callers must never report success unless this actually returns true.
  const paintPage = async (p, i, feedback, opts = {}) => {
    if (pgImgBusy[p.id]) return false;
    if (!p.text || !p.text.trim()) {
      setPgImgErr((prev) => ({ ...prev, [p.id]: "Add this page's text first — Amora needs words to paint from." }));
      return false;
    }
    setPgImgErr((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
    setPgImgBusy((prev) => ({ ...prev, [p.id]: true }));
    try {
      const result = await paintPageWithConsistency({
        book, setBook, collection, page: p, pageIndex: i, feedback,
        allowOverwriteFinishedArt: !!opts.allowOverwriteFinishedArt,
        source: opts.source || "book_editor",
        confirmedByUser: opts.confirmedByUser !== undefined ? opts.confirmedByUser : true,
        isBatch: !!opts.isBatch,
        authorEmail,
      });
      if (!result.ok) { setPgImgErr((prev) => ({ ...prev, [p.id]: result.error || "Image generation failed — try again." })); return false; }
      return true;
    } catch (e) {
      setPgImgErr((prev) => ({ ...prev, [p.id]: (e && e.message) || "Image generation failed — try again." }));
      return false;
    } finally {
      setPgImgBusy((prev) => { const n = { ...prev }; delete n[p.id]; return n; });
    }
  };

  // Public, gated entry point — every page-painting call in the UI goes through this,
  // never paintPage directly, so the lock/approval workflow can't be bypassed.
  const genPageImage = async (p, i, feedback, opts) => {
    if (!bibleLocked) {
      setPgImgErr((prev) => ({ ...prev, [p.id]: "Lock the Character Bible (Characters tab) before painting any pages." }));
      return false;
    }
    if (!scriptApproved) {
      setPgImgErr((prev) => ({ ...prev, [p.id]: "Finish and approve the full script first — use \"Approve script & paint all pages\" below." }));
      return false;
    }
    if (!visualKitApproved) {
      setPgImgErr((prev) => ({ ...prev, [p.id]: "Build and approve the Visual Kit (Characters tab) before painting any pages — that's what anchors every page's art to the same faces, setting, and style." }));
      return false;
    }
    return paintPage(p, i, feedback, opts);
  };

  // Batch action: once every page has text and the author explicitly approves, paint
  // every page's art in one consistent pass — same Bible, same derived style, correct order.
  // Clicking this button IS the explicit confirmation for this batch (Fix 2's guardrail
  // exists for chat-triggered batches that have no equivalent deliberate click).
  const approveAndPaintAll = async () => {
    if (!bibleLocked || !hasScript || !visualKitApproved || batchBusy) return;
    // Checkpoint: the first time a book paints in batch, only pages 1-4 are generated.
    // The author has to look at those four — same Pip, same trusted adult, single full-
    // page scenes, no embedded text — and explicitly run this again to unlock the rest.
    // This is the direct fix for "instant 24-page book, never actually checked" — the
    // exact gap that let identity drift and concept-board pages reach a finished PDF
    // before anyone looked at a single image.
    const isCheckpointRun = !book.fourPageCheckpointPassed && book.pages.length > 4;
    const pagesToPaint = isCheckpointRun ? book.pages.slice(0, 4) : book.pages;
    assertBatchPaintConfirmed({ pageIds: pagesToPaint.map((p) => p.id), confirmedByUser: true, source: "book_editor_approve_all" });
    setBatchBusy(true);
    setBook((b) => ({ ...b, scriptApproved: true }));
    setBatchNote(isCheckpointRun
      ? `Painting pages 1–4 first so you can check visual coherence before the rest of the book…`
      : `Painting ${pagesToPaint.length} pages…`);
    let done = 0, failed = 0;
    for (let i = 0; i < pagesToPaint.length; i++) {
      const p = pagesToPaint[i];
      setBatchNote(`Painting page ${i + 1} of ${pagesToPaint.length}…`);
      const ok = await paintPage(p, i, undefined, { isBatch: true, confirmedByUser: true, source: "book_editor_approve_all" });
      if (ok) done++; else failed++;
    }
    if (isCheckpointRun) {
      if (done > 0) setBook((b) => ({ ...b, fourPageCheckpointPassed: true }));
      setBatchNote(`Done — pages 1–4 painted (${done} ok${failed ? `, ${failed} need a retry` : ""}). Check: is Pip the same child on every page? Is the trusted adult the same person? Is each page one single illustration, not a collage or panels? Any text baked into the art? Once it actually looks right, click "Approve script & paint all pages" again to paint the rest of the book.`);
    } else {
      setBatchNote(`Done — ${done} page${done === 1 ? "" : "s"} painted${failed ? `, ${failed} need a retry from the page editor` : ""}.`);
    }
    setBatchBusy(false);
  };
  const setChar = (i, patch) => setBook((b) => ({ ...b, characters: b.characters.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));
  const addChar = () => setBook((b) => ({ ...b, characters: [...b.characters, { name: "New character", desc: "" }] }));
  const removeChar = (i) => setBook((b) => ({ ...b, characters: b.characters.filter((_, j) => j !== i) }));

  // Same character-portrait pipeline as the Character Collections cards — generated once
  // per character and editable here too, so the Character Bible isn't text-only.
  const regenChar = async (i) => {
    if (portraitBusy[i]) return;
    const c = book.characters[i];
    if (!c) return;
    setPortraitBusy((b) => ({ ...b, [i]: true }));
    setPortraitErr((prev) => { const n = { ...prev }; delete n[i]; return n; });
    try {
const styleGuide = (book.visualKit && book.visualKit.styleDesc) || book.styleGuide || collection?.styleGuide || book.derivedStyle || "";
      let seed = collection?.seed || book.seed;
      if (!seed) { seed = Math.floor(Math.random() * 900000) + 100000; setBook((b) => ({ ...b, seed: b.seed || seed })); }
      const url = await genCharacterPortrait(c, styleGuide, seed);
      setChar(i, { img: url });
    } catch (e) {
      // Record the failure so the lazy-fill effect below moves on to other characters
      // instead of retrying this same one forever (the actual cause of portraits never
      // showing for some characters — it wasn't generation failing, it was nothing else
      // ever getting a turn).
      setPortraitErr((prev) => ({ ...prev, [i]: (e && e.message) || "Portrait generation failed." }));
    }
    setPortraitBusy((b) => { const n = { ...b }; delete n[i]; return n; });
  };
  // Lazily fill in any character missing a portrait while the Characters tab is open, one at a time.
  // Skips characters that already failed this session so one stuck character can't block the rest.
  useEffect(() => {
    if (tab !== "bible") return;
    for (let i = 0; i < book.characters.length; i++) {
      if (!book.characters[i].img && !portraitBusy[i] && !portraitErr[i]) { regenChar(i); return; }
    }
  }, [tab, book.characters, portraitBusy, portraitErr]);

  const onDrop = (id) => {
    const from = drag.current, to = id;
    drag.current = null;
    if (!from || from === to) return;
    setBook((b) => {
      const arr = [...b.pages];
      const fi = arr.findIndex((p) => p.id === from);
      const ti = arr.findIndex((p) => p.id === to);
      const [moved] = arr.splice(fi, 1);
      arr.splice(ti, 0, moved);
      return { ...b, pages: arr };
    });
  };

  const runConsistency = async () => {
    setChecking(true); setReport(null);
    try {
      const chars = book.characters.map((c) => `${c.name}: ${c.desc}`).join("\n") || "(none defined)";
      const pages = book.pages.map((p, i) => `Page ${i + 1}: ${p.text || "(empty)"}`).join("\n");
      const raw = await amora(
        `Run a whole-book consistency and sense check on this children's picture book. The author's biggest worry is characters drifting or details contradicting between pages.\n\nCHARACTER BIBLE:\n${chars}\n\nPAGES:\n${pages}\n\nReturn ONLY JSON:\n{"verdict":"one warm sentence: does the book hold together?","issues":[{"type":"character|continuity|tone|arc|safety|length","where":"page number or 'overall'","note":"specific problem","fix":"concrete suggestion"}],"praise":"one true thing done well"}\nFlag character drift (appearance, clothing, props, names changing), continuity slips, tone breaks too scary for a child, arc gaps (no reassurance/safe ending), and safety concerns. IMPORTANT: Amazon KDP requires a minimum of 24 pages for paperback picture books. This book currently has ${book.pages.length} page(s). If it has fewer than 24 pages, you MUST include a "length" issue noting how many more pages are needed and gently suggesting where the story could breathe into more spreads. If the book is consistent and long enough, return an empty issues array. Never invent problems.`,
        AMORA_SYS + " You are in STRUCTURED MODE: output valid JSON only."
      );
      setReport(parseLoose(raw));
    } catch (e) {
      setReport({ verdict: "I couldn't finish the check just now — nothing changed. Try again in a moment.", issues: [], praise: "" });
    }
    setChecking(false);
  };

  const TYPE = {
    character: ["#EEE6F0", P.mauve], continuity: ["#F4E5C8", P.goldDeep],
    tone: ["#F4D6D0", "#9E4A44"], arc: ["#E2EAD8", "#5C7048"], safety: ["#F4D6D0", "#9E4A44"],
    length: ["#DCE6EE", "#3E5A6E"],
  };
  const MIN_PAGES = 24;
  const enoughPages = book.pages.length >= MIN_PAGES;
  const canSubmit = (book.status === "draft" || book.status === "changes") && enoughPages;

  return (
    <section className="morning page-top">
      <div className="wrap">
        <div className="row-between">
          <button className="btn-text" onClick={onBack}>← My books</button>
          <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className={`saved-flash${savedFlash ? " visible" : ""}`}>✓ Saved</span>
            <button className="btn-text" onClick={onSignOut}>Sign out</button>
          </span>
        </div>
        <input className="ed-title" value={book.title} onChange={(e) => setBook({ title: e.target.value })} aria-label="Book title" />
        <p style={{ margin: "4px 0 10px" }}>
          <span className={KCHIP[book.status][0]}>{KCHIP[book.status][1]}</span>
          {book.status === "published" ? <span className="fine" style={{ marginLeft: 12 }}>Edits to a published book go back through review.</span> : null}
        </p>

        <div className="studio-nav">
          <button className="studio-tab" onClick={onAmora}>Amora</button>
          <button className={`studio-tab${tab === "pages" ? " on" : ""}`} onClick={() => setTab("pages")}>Page Editor</button>
          <button className={`studio-tab${tab === "bible" ? " on" : ""}`} onClick={() => setTab("bible")}>Characters</button>
          <button className="studio-tab" style={{color:"#E2A857"}} onClick={onPublish}>Publishing ✦</button>
        </div>

        {/* Status strip — same fields Amora's "where are we" answers from, so chat and the
            page builder can never disagree about what's actually been done. This is a quick
            glance, not the authoritative export check (Publishing's own Validation Report
            owns that). */}
        {(() => {
          const painted = book.pages.filter((p) => p.img).length;
          const finishedCount = book.pages.filter((p) => p.finishedArt).length;
          const needsReviewCount = book.pages.filter((p) => p.textStatus === "updated_needs_review" || p.imageDirty).length;
          return (
            <div className="fine" style={{ display: "flex", flexWrap: "wrap", gap: 14, margin: "2px 0 16px", padding: "8px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee" }}>
              <span><strong>Bible:</strong> {bibleLocked ? "locked" : bibleReady ? "drafted, not locked" : "not started"}</span>
              <span><strong>Visual Kit:</strong> {visualKitApproved ? "approved" : visualKitReady ? "built, not approved" : "not built"}</span>
              <span><strong>Script:</strong> {book.pages.length} page{book.pages.length === 1 ? "" : "s"}{scriptApproved ? ", approved" : ", not approved"}</span>
              <span><strong>Art:</strong> {painted} of {book.pages.length} painted</span>
              {finishedCount ? <span><strong>Finished uploads:</strong> {finishedCount}</span> : null}
              {needsReviewCount ? <span style={{ color: "#9E4A44" }}><strong>Needs review:</strong> {needsReviewCount} page{needsReviewCount === 1 ? "" : "s"}</span> : null}
            </div>
          );
        })()}

        {tab === "pages" ? (
          <div className="ed-grid">
            <div>
              <div className={`lockbanner${bibleLocked ? " ok" : ""}${scriptApproved ? " done" : ""}`}>
                {!bibleLocked ? (
                  <p>① Lock your Character Bible (Characters tab) before writing or painting pages — that's what keeps everyone looking the same throughout.</p>
                ) : !scriptApproved ? (
                  <p>② Bible's locked. Write every page's text below, then approve the full script — Amora paints all the art in one matching pass right after, in the correct order.</p>
                ) : (
                  <p>✓ Bible locked, script approved. Art is painted — use “regenerate image” on any page for a touch-up.</p>
                )}
              </div>
              {bibleLocked && !scriptApproved ? (
                <>
                  {!visualKitApproved ? (
                    <p className="fine" style={{ color: "#9E4A44", marginTop: 0 }}>
                      Build and approve your Visual Kit on the Characters tab first — every page's art anchors to those reference images, so painting stays blocked until that's approved.
                    </p>
                  ) : null}
                  <button className="btn-gold full" style={{ marginBottom: 14 }} disabled={!hasScript || batchBusy || !visualKitApproved} onClick={approveAndPaintAll}>
                    {batchBusy ? (batchNote || "Painting…") : !visualKitApproved ? "Approve the Visual Kit first (Characters tab)" : hasScript ? "Approve script & paint all pages" : "Write text for every page first"}
                  </button>
                </>
              ) : null}
              <p className="fine" style={{ marginTop: 0 }}>Drag pages by the handle to reorder. Each page has its own Amora chat right below it.</p>
              {book.pages.map((p, i) => (
                <div key={p.id} className="ed-page" draggable
                  onDragStart={() => (drag.current = p.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(p.id)}>
                  <div className="ed-page-head">
                    <span className="drag-handle" title="Drag to reorder">⠿ Page {i + 1}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {p.lastUpdatedBy === "amora_chat" && (p.textStatus === "updated_needs_review" || p.imageDirty) ? (
                        <span className="fine" style={{ color: "#9E4A44" }} title="Amora updated this page's text from chat">Updated by Amora — needs review</span>
                      ) : null}
                      {book.pages.length > 1 ? <button className="btn-text soft" onClick={() => removePage(p.id)}>remove</button> : null}
                    </span>
                  </div>
                  {p.img ? <img src={p.img} alt={"Page " + (i + 1)} className="ed-page-img" /> : null}
                  <textarea rows={2} value={p.text} onChange={(e) => setPage(p.id, {
                    text: e.target.value, textStatus: "draft",
                    artStatus: p.img ? "needs_revision" : (p.artStatus || "needs_paint"),
                    imageDirty: !!p.img, lastUpdatedBy: "page_editor", lastUpdatedAt: new Date().toISOString(),
                  })} placeholder="Write this page, or build it with Amora below." />
                  <div className="ed-page-imgrow">
                    <button className="btn-text soft" disabled={!!pgImgBusy[p.id] || !bibleLocked || !scriptApproved} onClick={() => {
                      // Fix 4 — a page flagged "finished art" is real, final, uploaded author
                      // art. The regenerate button must never silently overwrite it; require a
                      // second explicit confirmation naming exactly what's about to happen.
                      if (p.finishedArt) {
                        if (!window.confirm("This page is marked as finished, uploaded art. Regenerating will replace it with new AI-painted art and this can't be undone. Continue?")) return;
                        genPageImage(p, i, undefined, { allowOverwriteFinishedArt: true });
                      } else {
                        genPageImage(p, i);
                      }
                    }}>
                      {pgImgBusy[p.id] ? "painting…" : p.img ? "regenerate image" : "generate image"}
                    </button>
                    <button className="btn-text soft" disabled={!!pgUploadBusy[p.id]} onClick={() => pageFileInputs.current[p.id] && pageFileInputs.current[p.id].click()}>
                      {pgUploadBusy[p.id] ? "reading…" : p.img ? "replace with my own image" : "upload my own image"}
                    </button>
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      ref={(el) => { pageFileInputs.current[p.id] = el; }}
                      onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) uploadPageImage(p, f); }} />
                    {pgImgErr[p.id] ? <span className="fine" style={{ color: "#9E4A44" }}>{pgImgErr[p.id]}</span> : null}
                    {p.img ? (
                      <label className="fine" style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input type="checkbox" checked={!!p.finishedArt} onChange={(e) => setPage(p.id, { finishedArt: e.target.checked, artStatus: e.target.checked ? "finished_uploaded" : (p.img ? "painted" : "needs_paint") })} />
                        This image already has the text on it — don't print the text below it again
                      </label>
                    ) : null}
                  </div>
                  <PageChat book={book} page={p}
                    onApply={(text) => setPage(p.id, {
                      text, textStatus: "draft",
                      artStatus: p.img ? "needs_revision" : (p.artStatus || "needs_paint"),
                      imageDirty: !!p.img, lastUpdatedBy: "amora_chat", lastUpdatedAt: new Date().toISOString(),
                    })}
                    onGenerateImage={(feedback, allowOverwriteFinishedArt) => genPageImage(p, i, feedback, { allowOverwriteFinishedArt })} />
                </div>
              ))}
              <button className="btn-line dark" onClick={addPage}>+ Add a blank page</button>

              <div style={{ margin: "26px 0 14px" }}>
                <p className="fine" style={{ margin: 0, fontWeight: 700 }}>Other pages</p>
                <p className="fine" style={{ marginTop: 2 }}>
                  Dedication, copyright, and the about pages print with your book too — write
                  them here or ask Amora for help, same as any story page. Fine print like
                  ISBN, alignment, and tone presets still live in Publishing → that page's tab.
                </p>
              </div>
              {MATTER_PAGES.map((mp) => {
                const d = book.publishing?.[mp.key] || {};
                const text = d[mp.field] || matterDefault(book, mp);
                const skip = mp.skippable && !!d.skipped;
                return (
                  <div key={mp.key} className="ed-page">
                    <div className="ed-page-head"><span>{mp.label}</span></div>
                    {mp.skippable ? (
                      <label className="fine" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={skip} onChange={(e) => setMatter(mp.key, { skipped: e.target.checked })} />
                        Skip this page
                      </label>
                    ) : null}
                    {!skip ? (
                      <>
                        <textarea rows={mp.rows} value={text} onChange={(e) => setMatter(mp.key, { [mp.field]: e.target.value })} placeholder={mp.placeholder} />
                        <MatterChat label={mp.chatLabel} intro={mp.intro} book={book} currentText={text}
                          onApply={(t) => setMatter(mp.key, { [mp.field]: t })} />
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div>
              <h3 className="bd-h" style={{ marginTop: 0 }}>Make it make sense</h3>
              <button className="btn-gold full" disabled={checking} onClick={runConsistency}>
                {checking ? "Amora is reading the whole book…" : "Check story, characters & sense"}
              </button>
              <p className="fine">Amora reads every page against your Character Bible and flags anything that drifts — the fix for characters changing between pages.</p>
              {report ? (
                <div className="report">
                  <p className="report-verdict"><MoonMark size={16} /> {report.verdict}</p>
                  {report.issues && report.issues.length ? report.issues.map((x, i) => (
                    <div key={i} className="issue">
                      <span className="issue-tag" style={{ background: (TYPE[x.type] || ["#eee", "#555"])[0], color: (TYPE[x.type] || ["#eee", "#555"])[1] }}>{x.type} · {x.where}</span>
                      <p className="issue-note">{x.note}</p>
                      <p className="issue-fix">→ {x.fix}</p>
                    </div>
                  )) : <p className="all-clear">✓ Everything holds together. Characters stay consistent and the story lands safely.</p>}
                  {report.praise ? <p className="praise">♡ {report.praise}</p> : null}
                </div>
              ) : null}

              {(book.status === "draft" || book.status === "changes") ? (
                <div className="pagecount" style={{ marginTop: 16 }}>
                  <div className="pc-meter">
                    <div className="pc-fill" style={{ width: Math.min(100, (book.pages.length / MIN_PAGES) * 100) + "%", background: enoughPages ? P.sage : P.gold }} />
                  </div>
                  <p className="fine" style={{ marginTop: 6 }}>
                    {book.pages.length} of {MIN_PAGES} pages{enoughPages ? " — meets Amazon's minimum." : ` — Amazon needs at least ${MIN_PAGES}. ${MIN_PAGES - book.pages.length} more to go.`}
                  </p>
                </div>
              ) : null}
              {canSubmit ? (
                <button className="btn-line dark full" style={{ marginTop: 12 }} onClick={() => setBook({ status: "in_review" })}>Submit for review</button>
              ) : (book.status === "draft" || book.status === "changes") ? (
                <button className="btn-line dark full" style={{ marginTop: 12, opacity: 0.55, cursor: "default" }} disabled title={`Books need at least ${MIN_PAGES} pages before review`}>
                  Submit for review (needs {MIN_PAGES} pages)
                </button>
              ) : null}
              {book.status === "in_review" ? <p className="fine">Submitted. At deployment your editor is notified and feedback lands right here.</p> : null}
            </div>
          </div>
        ) : (
          <div className="bible">
            <p className="fine" style={{ marginTop: 0 }}>This is your Character Bible — the locked descriptions that keep everyone looking and feeling the same on every page. Lock it in once everyone and the style are filled in, before you write or paint any pages. The consistency check measures the whole book against it, and you can start a brand-new book reusing these exact characters from your book list.</p>

            <div className="biblelock">
              <label className="fine" style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Book style & feel</label>
              <textarea rows={2} value={book.styleGuide || ""} disabled={bibleLocked}
                onChange={(e) => setBook((b) => ({ ...b, styleGuide: e.target.value }))}
                placeholder="e.g. soft watercolor, warm muted palette, gentle rounded shapes — the visual feel every page should share." />
              {bibleLocked ? (
                <button className="btn-line dark" style={{ marginTop: 10 }} onClick={unlockBible}>Unlock to make changes</button>
              ) : (
                <button className="btn-gold" style={{ marginTop: 10 }} disabled={!bibleReady} onClick={lockBible}>
                  {bibleReady ? "Lock Character Bible" : "Fill in every character + the style above to lock"}
                </button>
              )}
            </div>

            {book.characters.map((c, i) => (
              <div key={i} className="char-row">
                <div className="char-row-id">
                  <div className="coll-portrait" style={{ width: 56, height: 56 }} title={c.name}>
                    {c.img ? <img src={c.img} alt={c.name} /> : <span className="coll-portrait-fallback">{portraitBusy[i] ? "…" : (c.name || "?").charAt(0)}</span>}
                  </div>
                  <input className="char-name" disabled={bibleLocked} value={c.name} onChange={(e) => setChar(i, { name: e.target.value })} />
                </div>
                <textarea rows={3} disabled={bibleLocked} value={c.desc} onChange={(e) => setChar(i, { desc: e.target.value })} placeholder="Appearance, clothing, props, personality — everything that must stay the same." />
                <div className="char-row-actions">
                  <button className="btn-text soft" disabled={!!portraitBusy[i]} onClick={() => regenChar(i)}>
                    {portraitBusy[i] ? "painting…" : c.img ? "regenerate portrait" : "generate portrait"}
                  </button>
                  {portraitErr[i] ? <span className="fine" style={{ color: "#9E4A44" }}>{portraitErr[i]}</span> : null}
                  {!bibleLocked ? <button className="btn-text soft" onClick={() => removeChar(i)}>remove</button> : null}
                </div>
              </div>
            ))}
            {!bibleLocked ? <button className="btn-line dark" onClick={addChar}>+ Add a character</button> : null}

            {bibleLocked ? (
              <div className="visualkit" style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #E8DFD2" }}>
                <h4 style={{ margin: "0 0 6px" }}>Visual Kit</h4>
                <p className="fine" style={{ marginTop: 0 }}>
                  Before any page gets painted, this locks one reference image each for your setting and your style — on top of the character portraits above — and you approve the whole set. Every page's art then anchors to these exact images instead of guessing from text alone, which is what keeps Pip (and everyone else) looking like the same person from page 1 to the end.
                </p>

                {unlockedCompanionWarning ? (
                  <p className="fine" style={{ color: "#9E4A44" }}>
                    Heads up — the story text mentions "{unlockedCompanionWarning}" but there's no matching character above. If that's a real companion or comfort object that appears on multiple pages, add it as a character first so it gets its own locked portrait and stays consistent too.
                  </p>
                ) : null}

                {symbolicMotifCharacters.length ? (
                  <p className="fine">
                    Treating as a visual motif, not a character — no portrait, never painted as a person: {symbolicMotifCharacters.map((c) => c.name).join(", ")}.
                  </p>
                ) : null}

                <div className="char-row" style={{ alignItems: "flex-start" }}>
                  <div className="char-row-id">
                    <div className="coll-portrait" style={{ width: 56, height: 56 }} title="Opening scene reference">
                      {book.visualKit?.sceneAnchorImg ? <img src={book.visualKit.sceneAnchorImg} alt="Opening scene reference" /> : <span className="coll-portrait-fallback">?</span>}
                    </div>
                    <span className="char-name" style={{ display: "flex", alignItems: "center" }}>Opening scene reference</span>
                  </div>
                  <div className="char-row-id">
                    <div className="coll-portrait" style={{ width: 56, height: 56 }} title="Setting">
                      {book.visualKit?.settingImg ? <img src={book.visualKit.settingImg} alt="Setting" /> : <span className="coll-portrait-fallback">?</span>}
                    </div>
                    <span className="char-name" style={{ display: "flex", alignItems: "center" }}>Setting / location</span>
                  </div>
                  <div className="char-row-id">
                    <div className="coll-portrait" style={{ width: 56, height: 56 }} title="Style sample">
                      {book.visualKit?.styleSampleImg ? <img src={book.visualKit.styleSampleImg} alt="Style sample" /> : <span className="coll-portrait-fallback">?</span>}
                    </div>
                    <span className="char-name" style={{ display: "flex", alignItems: "center" }}>Style sample</span>
                  </div>
                </div>

                {vkErr ? <p className="fine" style={{ color: "#9E4A44" }}>{vkErr}</p> : null}

                <div className="char-row-actions" style={{ marginTop: 10 }}>
                  <button className="btn-text soft" disabled={vkBusy} onClick={buildVisualKit}>
                    {vkBusy ? "generating…" : visualKitReady ? "regenerate Visual Kit" : "generate Visual Kit"}
                  </button>
                  {visualKitReady && !visualKitApproved ? (
                    <button className="btn-gold" onClick={approveVisualKit}>Approve Visual Kit</button>
                  ) : null}
                  {visualKitApproved ? (
                    <>
                      <span className="fine" style={{ color: "#3F6F52", fontWeight: 700 }}>Approved — pages can be painted</span>
                      <button className="btn-text soft" onClick={unapproveVisualKit}>unapprove</button>
                    </>
                  ) : null}
                </div>
                {!visualKitReady ? (
                  <p className="fine" style={{ marginTop: 6 }}>
                    Generate a portrait for every character above first (or click "generate Visual Kit" and it'll fill any missing ones in automatically) — then the opening scene, setting, and style images complete the set. Symbolic motifs (like a feeling or an inner light) don't need a portrait.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Tiny per-page Amora chat ---------------- */
function PageChat({ book, page, onApply, onGenerateImage }) {
  const idx = book.pages.findIndex((p) => p.id === page.id);
  const [msgs, setMsgs] = useState([{ role: "amora", text: `Let's polish page ${idx + 1} together. Want it softer, shorter, more magical, or truer to a character? Tell me — or ask me to rewrite it and I'll suggest a version you can accept.` }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const scroller = useRef(null);
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);

  // Anything that reads as "generate/draw/paint THIS IMAGE" gets routed to the real
  // image pipeline below — never to free-text chat, which has no way to actually paint
  // anything and was previously just narrating fake "Done" messages.
  // Generic verbs like "make"/"create" are ambiguous on their own — "make page 1 warmer"
  // is a wording request, not an art request, even though it mentions "page." Only treat
  // those generic verbs as an image request when paired with an explicit art noun
  // (image/picture/illustration/art/drawing). Strong, unambiguous art verbs
  // (paint/draw/generate/render/visualize/sketch/illustrate) still pair with the full noun
  // set, since "paint this page" is the natural way to ask for art here.
  const isImgReq = (t) => {
    const strongArtVerb = /generat|draw|illustrat|paint|render|visuali|sketch/i.test(t);
    const weakArtVerb = /mak[ei]|creat/i.test(t);
    const broadArtNoun = /page|scene|spread|cover|background|setting|image|picture|illustrat|art\b|drawing/i.test(t);
    const explicitArtNoun = /image|picture|illustrat|art\b|drawing/i.test(t);
    return (strongArtVerb && broadArtNoun) || (weakArtVerb && explicitArtNoun);
  };

  const send = async () => {
    const text = input.trim(); if (!text || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]); setInput(""); setBusy(true);
    try {
      if (isImgReq(text) && onGenerateImage) {
        if (!page.text || !page.text.trim()) {
          setMsgs((x) => [...x, { role: "amora", text: "This page doesn't have any text yet — write it in the box above (or tell me what should happen here), then ask me to paint it." }]);
        } else if (page.finishedArt && !/\b(replace|overwrite|redo|regenerate|repaint)\b/i.test(text)) {
          // Fix 4 — this page is flagged as finished, uploaded art. Don't silently repaint
          // over it just because the chat message contains a paint-ish verb; require the
          // author to say so in a way that clearly means "yes, replace the finished art."
          setMsgs((x) => [...x, { role: "amora", text: "This page is marked as finished, uploaded art, so I won't repaint over it from chat. If you really do want me to replace it with new AI art, say so explicitly — e.g. \"regenerate this finished page.\"" }]);
        } else {
          const allowOverwrite = !!page.finishedArt;
          setMsgs((x) => [...x, { role: "amora", text: `Painting page ${idx + 1} now, locked to your Character Bible and the rest of the book's art…` }]);
          const ok = await onGenerateImage(text, allowOverwrite);
          setMsgs((x) => [...x, { role: "amora", text: ok
            ? "Done — the image is on the page now. Tell me exactly what to change and I'll repaint it."
            : "That didn't generate — check the page above for the reason, or just ask me again." }]);
        }
      } else {
        const chars = book.characters.map((c) => `${c.name}: ${c.desc}`).join("\n");
        const reply = await amora(
          `Character Bible:\n${chars}\n\nThe current text of page ${idx + 1} is:\n"${page.text}"\n\nKirby says: "${text}"\n\nHelp with JUST this page's WORDS — you have no way to generate or place images from this chat, so never claim to have created, generated, or placed an image; if she wants art, tell her to use the "generate image" button under the page instead. If you're suggesting new page text, put the exact suggested text on its own final line prefixed with PAGE: — under 40 words, consistent with the Character Bible. Otherwise just answer warmly. Keep it short.`
        );
        const m = reply.match(/PAGE:\s*([\s\S]+)$/);
        if (m) { setDraft(m[1].trim().replace(/^"|"$/g, "")); setMsgs((x) => [...x, { role: "amora", text: reply.replace(/PAGE:[\s\S]+$/, "").trim() || "Here's a version to consider:" }]); }
        else setMsgs((x) => [...x, { role: "amora", text: reply }]);
      }
    } catch (e) { setMsgs((x) => [...x, { role: "amora", text: "I slipped just now — try once more?" }]); }
    setBusy(false);
  };

  return (
    <div className="pagechat-inline">
      <div className="pc-head"><span><MoonMark size={14} color="#FFF9F0" /> Amora · page {idx + 1}</span></div>
      <div className="pc-scroll pc-scroll-inline" ref={scroller}>
        {msgs.map((m, i) => <div key={i} className={"abubble " + m.role}>{m.text.split("\n").map((l, j) => l ? <p key={j}>{l}</p> : null)}</div>)}
        {busy ? <div className="abubble amora"><p className="typing">thinking<i>.</i><i>.</i><i>.</i></p></div> : null}
        {draft ? (
          <div className="pc-draft">
            <p className="pc-draft-label">Suggested page text</p>
            <p>{draft}</p>
            <button className="btn-gold" onClick={() => { onApply(draft); setDraft(null); setMsgs((x) => [...x, { role: "amora", text: "Done — I've placed it on the page. You can keep editing anytime." }]); }}>Use this</button>
          </div>
        ) : null}
      </div>
      <div className="pc-bar">
        <textarea rows={1} placeholder="Ask Amora about this page…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="btn-gold" disabled={busy || !input.trim()} onClick={send}>Send</button>
      </div>
    </div>
  );
}

/* ---------------- Front/back-matter "pages" (Dedication, Copyright, About) ----------------
   These live at book.publishing.<key>, the exact same record Publishing's own dedicated
   builders (DedicationBuilder, CopyrightBuilder, AboutAuthorBuilder, AboutLABBuilder) read
   and write — this is just a second, chat-enabled door onto the same data, not a fork of it. */
function matterDefault(book, mp) {
  if (mp.key === "aboutLAB") {
    return "Little Amour Books creates gentle, emotionally honest stories for children and families moving through hard things. Our books are made with survivor-centered care, creative technology, and human editorial support \u2014 so more mothers and lived-experience authors can share the stories only they could tell.";
  }
  if (mp.key === "copyright") {
    const pub = book.publishing || {};
    const d = pub.copyright || {};
    const yr = d.year || String(new Date().getFullYear());
    const owner = d.owner || pub.cover?.authorName || book.authorName || "[Author Name]";
    return "Copyright \u00a9 " + yr + " " + owner + ". All rights reserved. No part of this book may be reproduced, distributed, or transmitted in any form without written permission from the copyright holder, except for brief quotations in reviews.";
  }
  return "";
}

const MATTER_PAGES = [
  { key: "dedication", field: "text", label: "\ud83d\udc8c Dedication", chatLabel: "Dedication",
    skippable: true, rows: 3, placeholder: "For\u2026",
    intro: "Want help with the dedication? One true sentence is plenty \u2014 tell me who it's for, or ask me to draft one." },
  { key: "aboutAuthor", field: "bio", label: "\ud83d\udc64 About the Author", chatLabel: "About the Author",
    skippable: true, rows: 4, placeholder: "Generate with a tone in Publishing \u2192 About Author, or write your own here.",
    intro: "I can draft or polish your author bio \u2014 tell me the tone (warm, playful, professional\u2026) or what you want it to say." },
  { key: "aboutLAB", field: "copy", label: "\ud83c\udf19 About Little Amour Books", chatLabel: "About Little Amour Books",
    skippable: false, rows: 4, placeholder: "Default publisher description \u2014 edit freely.",
    intro: "This is the publisher page that appears in every book \u2014 the default is ready to go, but I can help personalize the closing note if you'd like." },
  { key: "copyright", field: "rights", label: "\u00a9 Copyright", chatLabel: "Copyright",
    skippable: false, rows: 4, placeholder: "Rights statement \u2014 a professional default is set in Publishing \u2192 Copyright.",
    intro: "This is the legal rights statement \u2014 I can help reword it, but keep in mind it should stay clear and professional." },
];

function MatterChat({ label, intro, book, currentText, onApply }) {
  const [msgs, setMsgs] = useState([{ role: "amora", text: intro }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const scroller = useRef(null);
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);

  const send = async () => {
    const text = input.trim(); if (!text || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]); setInput(""); setBusy(true);
    try {
      const reply = await amora(
        `This is the "${label}" page of a children's picture book titled "${book.title || "Untitled"}". This page has no illustration -- it's text only, so you have no way to generate or place an image here, only words.\n\nThe current text is:\n"${currentText || "(empty)"}"\n\nKirby says: "${text}"\n\nHelp with JUST this page's words. If you're suggesting new text, put the exact suggested text on its own final line prefixed with PAGE: -- length appropriate for this kind of page (a dedication is one short sentence; a bio or publisher note is a few sentences; never sprawl). Otherwise just answer warmly. Keep it short.`,
        AMORA_SYS
      );
      const m = reply.match(/PAGE:\s*([\s\S]+)$/);
      if (m) { setDraft(m[1].trim().replace(/^"|"$/g, "")); setMsgs((x) => [...x, { role: "amora", text: reply.replace(/PAGE:[\s\S]+$/, "").trim() || "Here's a version to consider:" }]); }
      else setMsgs((x) => [...x, { role: "amora", text: reply }]);
    } catch (e) { setMsgs((x) => [...x, { role: "amora", text: "I slipped just now -- try once more?" }]); }
    setBusy(false);
  };

  return (
    <div className="pagechat-inline">
      <div className="pc-head"><span><MoonMark size={14} color="#FFF9F0" /> Amora · {label}</span></div>
      <div className="pc-scroll pc-scroll-inline" ref={scroller}>
        {msgs.map((m, i) => <div key={i} className={"abubble " + m.role}>{m.text.split("\n").map((l, j) => l ? <p key={j}>{l}</p> : null)}</div>)}
        {busy ? <div className="abubble amora"><p className="typing">thinking<i>.</i><i>.</i><i>.</i></p></div> : null}
        {draft ? (
          <div className="pc-draft">
            <p className="pc-draft-label">Suggested text</p>
            <p>{draft}</p>
            <button className="btn-gold" onClick={() => { onApply(draft); setDraft(null); setMsgs((x) => [...x, { role: "amora", text: "Done -- I've placed it on the page. You can keep editing anytime." }]); }}>Use this</button>
          </div>
        ) : null}
      </div>
      <div className="pc-bar">
        <textarea rows={1} placeholder={`Ask Amora about the ${label.toLowerCase()}\u2026`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="btn-gold" disabled={busy || !input.trim()} onClick={send}>Send</button>
      </div>
    </div>
  );
}

/* ============================================================
   APP SHELL
   ============================================================ */
// Initial-load deep-link parsing. The app is otherwise a pure client-state
// SPA (go() never touches the URL), so without this, navigating directly to
// /book/:id or /deliver/:token (e.g. from the sitemap or a confirmation
// email) always rendered the homepage instead. This only resolves the
// *first* render; in-app navigation continues to go through go() as before.
function routeFromPath(pathname) {
  const parts = (pathname || "/").split("/").filter(Boolean);
  if (parts[0] === "deliver" && parts[1]) return { page: "deliver", id: parts[1] };
  if (parts[0] === "book" && parts[1]) return { page: "book", id: parts[1] };
  return { page: "home", id: null };
}

export default function App() {
  const [route, setRoute] = useState(() => routeFromPath(window.location.pathname));
  const [studioHome, setStudioHome] = useState(0); // bumped to force KirbyStudio back to its dashboard list
  const [account, setAccount] = useState(() => {
    try { const raw = localStorage.getItem("la_account"); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  });
  const [persona, setPersona] = useState(() => {
    try { const raw = localStorage.getItem("la_persona"); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }); // author Kirby is currently viewing as
  useEffect(() => {
    try { if (account) localStorage.setItem("la_account", JSON.stringify(account)); else localStorage.removeItem("la_account"); } catch (e) {}
  }, [account]);
  useEffect(() => {
    try { if (persona) localStorage.setItem("la_persona", JSON.stringify(persona)); else localStorage.removeItem("la_persona"); } catch (e) {}
  }, [persona]);
  const [order, setOrder] = useState(null);
  const [cart, setCart] = useState([]);      // { cartId, type, id, title, price, authorName, grad, motif }
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);
  // Pull each author's real saved cover art (Publishing → studio_data.books[].publishing.cover.coverImageUrl)
  // into the shared coverImageMap so the public Cover/MiniCover components show the actual finished
  // cover instead of the gradient+motif placeholder, for any book that has one. Best-effort: if this
  // fetch fails, every book just keeps showing its placeholder — never blocks the page.
  const [coverTick, setCoverTick] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        const { data: rows } = await supabase.from("studio_data").select("id,data").in("id", ["kirby", "mara", "june"]);
        let changed = false;
        (rows || []).forEach((row) => {
          (row.data?.books || []).forEach((sb) => {
            const c = sb.publishing?.cover;
            const url = c?.coverImageUrl;
            if (!url) return;
            // Store the whole cover record, not just the image URL — ComposedCover needs
            // title/subtitle/author/series/age-badge/logo to render the same overlay the
            // author approved in Publishing, not just the bare illustration.
            const next = { url, title: c.title, subtitle: c.subtitle, authorName: c.authorName, series: c.series, ageRange: c.ageRange, showAgeBadge: c.showAgeBadge, showLogo: c.showLogo, finishedArt: c.finishedArt };
            const prev = coverImageMap[sb.id];
            if (!prev || JSON.stringify(prev) !== JSON.stringify(next)) { coverImageMap[sb.id] = next; changed = true; }

            // Sell-format flags (PDF / Physical / Amazon) set by the author in Publishing -> Sell As.
            const sellAs = sb.publishing?.sellAs;
            const amazonUrl = sb.publishing?.amazonUrl;
            const nextFmt = { sellAs: sellAs || { pdf: true, physical: true, amazon: false }, amazonUrl: amazonUrl || "" };
            const prevFmt = formatMap[sb.id];
            if (!prevFmt || JSON.stringify(prevFmt) !== JSON.stringify(nextFmt)) { formatMap[sb.id] = nextFmt; changed = true; }
          });
        });
        if (changed) setCoverTick((t) => t + 1);
      } catch (e) { /* keep placeholders */ }
    })();
  }, []);

  const addToCart = (item) => {
    const cartId = item.type + "_" + item.id;
    setCart(prev => prev.find(c => c.cartId === cartId) ? prev : [...prev, { ...item, cartId }]);
    go("cart");
  };
  const removeFromCart = (cartId) => setCart(prev => prev.filter(c => c.cartId !== cartId));
  const clearCart = () => setCart([]);

  const go = (page, id = null) => {
    setRoute({ page, id });
    window.scrollTo(0, 0);
  };
  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 5200);
  };
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const completeOrder = async (items, gifts, total, email) => {
    // If no Stripe key configured, fall back to demo mode
    const pubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!pubKey) {
      setOrder({ items, gifts, total });
      clearCart();
      go("thanks");
      return;
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email }),
      });
      const data = await res.json();
      if (data.url) {
        clearCart();
        window.location.href = data.url; // redirect to Stripe Checkout
      } else {
        toast("Checkout error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      toast("Checkout failed. Please try again.");
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Resolve current book for book pages (used for SEO)
  const currentBook = route.page === "book" ? (BOOKS.find((b) => b.id === route.id) || BOOKS[0]) : null;

  let page = null;
  if (route.page === "home") page = (
    <>
      <SEOHead
        title="Gentle Children's Books for Hard Family Moments"
        description="Illustrated children's books written by survivor mothers for families navigating hard moments — divorce, court days, big feelings, and new beginnings. 75% of every sale goes to the author."
        canonical="https://littleamour.com"
        schema={{ "@context":"https://schema.org","@type":"WebPage","name":"Little Amour Books","url":"https://littleamour.com","description":"Gentle children's books for hard family moments, written by survivor mothers." }}
      />
      <HomePage go={go} />
    </>
  );
  else if (route.page === "store") page = (
    <>
      <SEOHead
        title="Shop Children's Books"
        description="Browse our full collection of gentle illustrated children's books for hard family moments. Written by survivor mothers. Ships worldwide."
        canonical="https://littleamour.com/shop"
      />
      <StoreLanding go={go} books={BOOKS} afterFavorites={<ShopMerchSection go={go} />} />
    </>
  );
  else if (route.page === "books") page = (
    <>
      <SEOHead
        title="All Children's Books"
        description="Every book in the Little Amour collection — gentle illustrated picture books for families navigating hard moments. Browse by topic or age."
        canonical="https://littleamour.com/books"
      />
      <BooksShop go={go} books={BOOKS} />
    </>
  );
  else if (route.page === "packs") page = (
    <>
      <SEOHead
        title="Book Packs — Save on Sets"
        description="Curated book packs for hard family moments. Save when you buy a set. Each pack includes books matched by emotional theme."
        canonical="https://littleamour.com/packs"
      />
      <PacksPage go={go} books={BOOKS} />
    </>
  );
  else if (route.page === "pack") page = <PackPage packId={route.id} go={go} books={BOOKS} addToCart={addToCart} />;
  else if (route.page === "book" && currentBook) page = (
    <>
      <SEOHead
        title={currentBook.title}
        description={currentBook.tagline || currentBook.adult || `A gentle illustrated children's book by ${currentBook.authorName}. For families navigating ${currentBook.theme || "hard moments"}.`}
        canonical={`https://littleamour.com/book/${currentBook.id}`}
        ogType="book"
        schema={bookSchema(currentBook)}
      />
      <BookPage book={currentBook} go={go} toast={toast} addToCart={addToCart} />
    </>
  );
  else if (route.page === "deliver") page = <DeliverPage token={route.id} go={go} />;
  else if (route.page === "cart") page = <CartPage cart={cart} removeFromCart={removeFromCart} go={go} onCheckout={completeOrder} checkoutLoading={checkoutLoading} />;
  else if (route.page === "checkout") page = <CartPage cart={cart} removeFromCart={removeFromCart} go={go} onCheckout={completeOrder} checkoutLoading={checkoutLoading} />;
  else if (route.page === "thanks") page = <ThanksPage order={order} go={go} />;
  else if (route.page === "authors") page = (
    <>
      <SEOHead
        title="Our Authors — Survivor Mothers"
        description="Meet the survivor mothers who write Little Amour Books. Every author writes from lived experience. 75% of every sale goes back to them."
        canonical="https://littleamour.com/authors"
      />
      <AuthorsPage go={go} />
    </>
  );
  else if (route.page === "author") page = <AuthorPage author={AUTHORS[route.id] || AUTHORS.kirby} go={go} toast={toast} />;
  else if (route.page === "write") page = (
    <>
      <SEOHead
        title="Write and Publish Your Story"
        description="Survivor mothers publish their own illustrated children's books with Little Amour Books. No writing experience needed. Keep 75% of every sale. Start with Amora, our AI studio."
        canonical="https://littleamour.com/write"
      />
      <WritePage go={go} />
    </>
  );
  else if (route.page === "apply") page = <ApplyPage />;
  else if (route.page === "legal") page = <AuthorLegalPage go={go} />;
  else if (route.page === "topic") page = <TopicPage slug={route.id} books={BOOKS} go={go} />;
  else if (route.page === "policy-terms") page = <TermsOfSalePage go={go} />;
  else if (route.page === "policy-refund") page = <RefundPolicyPage go={go} />;
  else if (route.page === "policy-license") page = <DigitalLicensePage go={go} />;
  else if (route.page === "policy-shipping") page = <ShippingPolicyPage go={go} />;
  else if (route.page === "policy-privacy") page = <PrivacyPolicyPage go={go} />;
  else if (route.page === "policy-website-terms") page = <WebsiteTermsPage go={go} />;
  else if (route.page === "policy-dmca") page = <DMCAPolicyPage go={go} />;
  else if (route.page === "policy-accessibility") page = <AccessibilityPage go={go} />;
  else if (route.page === "policy-reviews") page = <ReviewsPolicyPage go={go} />;
  else if (route.page === "policy-preorder") page = <PreorderPolicyPage go={go} />;
  else if (route.page === "policy-refund-form") page = <RefundRequestForm go={go} />;
  else if (route.page === "contact") page = <RefundRequestForm go={go} />;
  else if (route.page === "admin") return <AdminDashboard onBack={() => go("home")} />;
  else if (route.page === "signin") {
    if (!account) page = <SignInPage onSignIn={(a) => { setPersona(null); setAccount(a); }} />;
    else if (account?.isKirby && !persona) page = <AuthorChooserPage
        account={account}
        go={go}
        onPickAuthor={(a) => setPersona({ id: a.id, name: a.name, email: account.email, photoUrl: a.photo || null, isKirby: false })}
        onPickAdmin={() => setPersona("admin")}
        onSignOut={() => { setAccount(null); setPersona(null); go("home"); }} />;
    else if (account?.isKirby && persona === "admin") page = <KirbyStudio go={go} account={account} studioKey="kirby" homeSignal={studioHome} onSignOut={() => { setAccount(null); setPersona(null); go("home"); }} />;
    else if (account?.isKirby && persona) page = <KirbyStudio go={go} account={persona} studioKey={persona.id}
        homeSignal={studioHome}
        onSignOut={() => setPersona(null)} />;
    else page = <KirbyStudio go={go} account={account} studioKey={resolveStudioKey(account)} homeSignal={studioHome} onSignOut={() => { setAccount(null); go("home"); }} />;
  }
  else page = <NotFoundPage go={go} />;

  const NAV = [
    ["home", "Home"],
    ["store", "Shop"],
    ["packs", "Book Packs"],
    ["books", "All Books"],
    ["authors", "Authors"],
    ["write", "Become an Author"],
  ];

  return (
    <div className="root">
      <style>{CSS}</style>
      <nav className="nav">
        <button className="brand" onClick={() => go("home")}>
          <MoonMark size={26} /> <span>Little Amour Books</span>
        </button>
        <div className="nav-links">
          {NAV.map(([k, label]) => (
            <button key={k} className={"nav-link" + (route.page === k ? " on" : "")} onClick={() => go(k)}>{label}</button>
          ))}
          <button className={"nav-link cart-btn" + (route.page === "cart" ? " on" : "")} onClick={() => go("cart")} aria-label={`Cart — ${cart.length} item${cart.length !== 1 ? "s" : ""}`}>
            🛍 {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
          <button className={"nav-link signin" + (route.page === "signin" ? " on" : "")} onClick={() => { setPersona(null); setStudioHome((n) => n + 1); go("signin"); }}>
            {account ? "My studio" : "Sign in"}
          </button>
        </div>
      </nav>
      {page}
      <footer className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <p className="brand-foot"><MoonMark size={20} /> Little Amour Books</p>
              <p className="foot-line">Truth told gently. Healing made beautiful.</p>
              <p className="foot-small" style={{ marginTop: 10 }}>
                Little Amour Books is a press — creative and publishing support for survivor
                mothers. We are not therapy, legal advice, or crisis support. 75% of every sale
                goes to the author.
              </p>
            </div>
            <div>
              <p className="foot-policy-heading">Shop</p>
              <div className="foot-nav">
                <button className="foot-nav-link" onClick={() => go("store")}>Shop books</button>
                <button className="foot-nav-link" onClick={() => go("packs")}>Book packs</button>
                <button className="foot-nav-link" onClick={() => go("authors")}>Our authors</button>
                <button className="foot-nav-link" onClick={() => go("write")}>Become an author</button>
              </div>
            </div>
          </div>
          <div className="foot-legal-row">
            <p className="foot-policy-heading" style={{ marginBottom: 10 }}>Legal & Policies</p>
            <PolicyFooterLinks go={go} />
          </div>
          <p className="foot-copy">© {new Date().getFullYear()} Little Amour Books. All rights reserved. Policy version {POLICY_VERSION}.</p>
        </div>
      </footer>
      <button onClick={() => go("admin")} style={{ position: "fixed", bottom: 10, right: 14, background: "none", border: "none", color: "#ffffff18", fontSize: 11, cursor: "pointer" }}>admin</button>
      {toastMsg ? <div className="toast" role="status">{toastMsg}</div> : null}
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,560;0,9..144,640;1,9..144,420&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap');

* { box-sizing: border-box; margin: 0; }
.root {
  --display: 'Fraunces', Georgia, serif;
  --body: 'Nunito Sans', 'Segoe UI', system-ui, sans-serif;
  font-family: var(--body); color: ${P.ink}; background: ${P.paper};
  font-size: 16.5px; line-height: 1.62; min-height: 100vh;
}
h1, h2, h3 { font-family: var(--display); font-weight: 560; line-height: 1.12; color: ${P.ink}; }
h2 { font-size: clamp(28px, 4.4vw, 42px); letter-spacing: -0.01em; }
h3 { font-size: 19px; }
.light { color: ${P.cream}; }
button { font-family: var(--body); cursor: pointer; }
button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid ${P.gold}; outline-offset: 2px; }

.wrap { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
.narrow { max-width: 760px; }
.center { text-align: center; }
.center-text { text-align: center; margin-left: auto; margin-right: auto; }
.eyebrow { font-size: 12.5px; letter-spacing: 0.24em; text-transform: uppercase; font-weight: 700; margin-bottom: 13px; }
.eyebrow.gold { color: ${P.gold}; } .eyebrow.rose { color: ${P.rose}; } .eyebrow.plum { color: ${P.mauve}; }
.eyebrow.tightm { margin-bottom: 4px; }
.lead { font-size: 18px; line-height: 1.68; max-width: 64ch; margin-bottom: 14px; }
.lead.light { color: #E9DFEA; }
.fine { font-size: 13px; color: ${P.inkSoft}; margin-top: 11px; }
.light-fine { color: #C9BED2; }
.row-between { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; }

/* buttons */
.btn-gold { background: ${P.gold}; color: ${P.nightDeep}; border: none; border-radius: 999px; padding: 14px 30px; font-size: 15.5px; font-weight: 700; transition: transform .16s ease, box-shadow .16s ease; box-shadow: 0 4px 18px rgba(226,168,87,.35); }
.btn-gold:hover { transform: translateY(-2px); box-shadow: 0 7px 24px rgba(226,168,87,.45); }
.btn-gold.full { width: 100%; }
.btn-line { background: transparent; color: ${P.cream}; border: 1.5px solid rgba(242,207,197,.55); border-radius: 999px; padding: 13px 26px; font-size: 15px; font-weight: 600; }
.btn-line:hover { border-color: ${P.rose}; background: rgba(242,207,197,.08); }
.btn-line.dark { color: ${P.ink}; border-color: ${P.mauve}; }
.btn-line.dark:hover { background: rgba(110,85,114,.08); }
.btn-line.full { width: 100%; margin-top: 16px; }
.btn-text { background: none; border: none; color: ${P.mauve}; font-size: 14.5px; font-weight: 700; padding: 6px 0; }
.btn-text:hover { color: ${P.ink}; }
.link { background: none; border: none; padding: 0; font: inherit; color: ${P.mauve}; text-decoration: underline; text-underline-offset: 3px; }


/* ---- Cart ---- */
.cart-items { display: flex; flex-direction: column; gap: 12px; margin-bottom: 4px; }
.cart-item { display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #ECD9C5; border-radius: 14px; padding: 14px 16px; }
.cart-item-cover { width: 52px; height: 52px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-title { font-weight: 700; font-size: 15px; line-height: 1.25; margin-bottom: 2px; }
.cart-item-by { font-size: 13px; color: #6E5572; }
.cart-item-type { font-size: 11.5px; color: #999; margin-top: 2px; text-transform: uppercase; letter-spacing: .08em; }
.cart-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.cart-item-price { font-weight: 700; font-size: 16px; }
.cart-remove { background: none; border: none; color: #c0392b; font-size: 12.5px; font-weight: 600; padding: 3px 8px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(192,57,43,.25); }
.cart-remove:hover { background: rgba(192,57,43,.07); }
.cart-badge { display: inline-flex; align-items: center; justify-content: center; background: #E2A857; color: #fff; font-size: 10px; font-weight: 700; width: 17px; height: 17px; border-radius: 999px; margin-left: 4px; vertical-align: middle; }
.cart-btn { position: relative; }
.cart-consent { display: flex; align-items: flex-start; gap: 10px; background: #F4EADC; border-radius: 10px; padding: 14px 16px; font-size: 13.5px; line-height: 1.55; margin-top: 16px; border: 1px solid #ECD9C5; }
.cart-consent input[type=checkbox] { margin-top: 3px; flex-shrink: 0; width: 16px; height: 16px; accent-color: #E2A857; }
.cart-consent .link { background: none; border: none; color: #6E5572; font-weight: 600; text-decoration: underline; padding: 0; font-size: inherit; cursor: pointer; }

/* nav */
.nav { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 24px; background: rgba(13,18,38,.94); backdrop-filter: blur(8px); }
.brand { display: flex; align-items: center; gap: 9px; background: none; border: none; color: ${P.cream}; font-family: var(--display); font-size: 18px; }
.nav-links { display: flex; gap: 2px; flex-wrap: wrap; align-items: center; }
.nav-link { background: none; border: none; color: #C9BED2; font-size: 14px; font-weight: 600; padding: 8px 12px; border-radius: 999px; }
.nav-link:hover { color: ${P.cream}; }
.nav-link.on { background: rgba(226,168,87,.16); color: ${P.gold}; }
.nav-link.signin { border: 1.2px solid rgba(226,168,87,.5); color: ${P.gold}; margin-left: 6px; }

/* hero */
.hero { position: relative; background: radial-gradient(120% 90% at 50% 0%, #1B2444 0%, ${P.night} 45%, ${P.nightDeep} 100%); color: ${P.cream}; padding: 78px 26px 116px; overflow: hidden; }
.sky { position: absolute; inset: 0; pointer-events: none; }
.star { position: absolute; width: 2.5px; height: 2.5px; border-radius: 50%; background: #EADFC9; animation: twinkle 4.5s ease-in-out infinite; }
@keyframes twinkle { 0%,100% { opacity: .25 } 50% { opacity: .9 } }
.hero-moon { position: absolute; top: 52px; right: 9%; filter: drop-shadow(0 0 26px rgba(226,168,87,.45)); }
.hero-inner { position: relative; max-width: 860px; margin: 0 auto; text-align: center; }
.hero h1 { font-size: clamp(40px, 7vw, 72px); color: ${P.cream}; margin-bottom: 22px; letter-spacing: -0.015em; }
.hero-sub { font-size: 18.5px; line-height: 1.68; color: #DCD2E2; max-width: 56ch; margin: 0 auto 32px; }
.hero-sub strong { color: ${P.gold}; }
.hero-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.hero-studio-line { margin-top: 22px; font-size: 14px; font-style: italic; color: ${P.rose}; }
.horizon { position: absolute; left: 0; right: 0; bottom: -1px; height: 90px; background: linear-gradient(180deg, rgba(51,48,79,0) 0%, ${P.dusk} 100%); }

/* dusk */
.dusk { background: linear-gradient(180deg, ${P.dusk} 0%, #4A4063 100%); padding: 62px 0; }
.dusk h2 { color: ${P.cream}; margin-bottom: 18px; }
.why-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 44px; align-items: center; }
.kitchen { width: 100%; max-width: 340px; display: block; margin: 0 auto; filter: drop-shadow(0 14px 30px rgba(0,0,0,.3)); }
.hero-reading-img { width: 100%; max-width: 380px; display: block; margin: 0 auto; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,.4); }
.pull { font-family: var(--display); font-style: italic; font-size: clamp(21px, 3vw, 28px); color: ${P.rose}; margin-top: 22px; line-height: 1.35; }

/* dawn */
.dawn { background: linear-gradient(180deg, #4A4063 0%, #8A6478 26%, ${P.rose} 62%, ${P.paperWarm} 100%); padding: 76px 0 56px; }
.dawn h2, .dawn .lead { color: ${P.cream}; }
.dawn .lead { text-shadow: 0 1px 8px rgba(43,36,51,.18); }
.two-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
.two-grid.tight { margin-top: 12px; }
.story-card { background: ${P.cream}; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(43,36,51,.12); }
.story-tag { display: inline-block; font-size: 11.5px; letter-spacing: .18em; text-transform: uppercase; font-weight: 700; color: ${P.goldDeep}; margin-bottom: 9px; }
.story-card p { font-size: 15.5px; line-height: 1.62; }
.motto { font-family: var(--display); font-style: italic; font-size: 20px; color: ${P.ink}; text-align: center; margin-top: 24px; }
.small-motto { text-align: left; font-size: 16.5px; margin: 16px 0 0; color: ${P.mauve}; }

/* AI studio band */
.studio-band { background: ${P.paperWarm}; padding: 58px 0 64px; border-bottom: 1px solid #EADAC4; }
.studio-band h2 { max-width: 22ch; }
.studio-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 30px; }
.studio-card { background: ${P.cream}; border: 1px solid #EBDCC6; border-radius: 16px; padding: 24px 22px; height: 100%; }
.studio-num { display: block; font-family: var(--display); font-size: 19px; color: ${P.mauve}; margin-bottom: 9px; }
.studio-card p { font-size: 14.5px; line-height: 1.62; color: ${P.inkSoft}; }
.studio-equation { font-family: var(--display); font-style: italic; font-size: 20px; color: ${P.goldDeep}; margin-top: 28px; text-align: center; }

/* morning */
.morning { background: ${P.paper}; padding: 58px 0; }
.page-top { padding-top: 48px; min-height: 58vh; }
.tall { min-height: 74vh; display: flex; align-items: center; }

/* books */
.book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); gap: 24px; margin-top: 28px; }
.small-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.book-tile { text-align: left; background: none; border: none; padding: 0; display: block; }
.book-tile:hover .cover { transform: translateY(-5px) rotate(-0.4deg); box-shadow: 0 18px 38px rgba(19,26,48,.28); }
.cover { aspect-ratio: 1 / 1; border-radius: 10px; padding: 22px 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; overflow: hidden; box-shadow: 0 10px 26px rgba(19,26,48,.22); transition: transform .2s ease, box-shadow .2s ease; }
.cover-lg { max-width: 360px; }
.ribbon { position: absolute; top: 22px; right: -42px; transform: rotate(36deg); background: ${P.gold}; color: ${P.nightDeep}; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; padding: 5px 48px; box-shadow: 0 3px 10px rgba(0,0,0,.3); }
.cover-stars i { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: rgba(255,249,240,.7); }
.cover-motif { margin-bottom: 13px; }
.cover-title { font-family: var(--display); font-size: 21px; line-height: 1.2; color: ${P.cream}; }
.cover-rule { width: 36px; height: 1.5px; background: ${P.gold}; margin: 12px 0; }
.cover-author { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,249,240,.85); }
.tile-meta { padding: 13px 4px 0; }
.tile-meta h3 { font-size: 18.5px; }
.tile-by { font-size: 13.5px; color: ${P.inkSoft}; margin: 3px 0 6px; }
.tile-by.big { font-size: 15px; margin-bottom: 12px; }
.tile-line { font-size: 14px; font-style: italic; color: ${P.mauve}; }
.mini-two p { font-size: 13.5px; line-height: 1.5; margin-bottom: 5px; color: ${P.inkSoft}; }
.mini-two strong { color: ${P.ink}; }
.price { font-family: var(--display); font-size: 16.5px; color: ${P.goldDeep}; }

/* book detail */
.book-detail { display: grid; grid-template-columns: 340px 1fr; gap: 42px; margin-top: 20px; align-items: start; }
.bd-right h2 { margin-bottom: 4px; }
.bd-h { margin: 22px 0 9px; font-size: 16.5px; letter-spacing: .02em; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { background: ${P.paperWarm}; border: 1px solid #E5D6C2; color: ${P.ink}; font-size: 13px; font-weight: 600; padding: 6px 13px; border-radius: 999px; }
.caregiver { background: ${P.paperWarm}; border-left: 3px solid ${P.gold}; border-radius: 8px; padding: 13px 15px; font-size: 15px; max-width: 60ch; }
.buy-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }

/* checkout */
.checkout-grid { display: grid; grid-template-columns: 1fr 1.25fr; gap: 36px; margin-top: 22px; align-items: start; }
.co-order { background: ${P.cream}; border: 1px solid #EBDCC6; border-radius: 18px; padding: 26px; }
.co-book { display: flex; gap: 18px; align-items: flex-start; margin-bottom: 18px; }
.co-cover { width: 110px; flex-shrink: 0; }
.co-lines { border-top: 1px solid #EAD9C3; padding-top: 14px; margin-bottom: 18px; }
.co-lines p { display: flex; justify-content: space-between; font-size: 14.5px; padding: 5px 0; }
.co-total { border-top: 1px solid #EAD9C3; margin-top: 6px; padding-top: 11px !important; font-family: var(--display); font-size: 17px !important; }
.co-author { background: ${P.paperWarm}; border-radius: 18px; padding: 26px; }
.co-author-head { display: flex; gap: 16px; align-items: center; margin-bottom: 14px; }
.co-story { font-size: 15.5px; font-weight: 600; margin-bottom: 10px; max-width: 60ch; }
.co-story.soft { font-weight: 400; color: ${P.inkSoft}; font-size: 14.5px; }
.gift-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
.gift { text-align: left; background: ${P.cream}; border: 1.6px solid #E5D6C2; border-radius: 12px; padding: 14px 16px; transition: border-color .15s ease, background .15s ease; }
.gift:hover { border-color: ${P.gold}; }
.gift.on { border-color: ${P.gold}; background: #FDF3DF; box-shadow: 0 4px 14px rgba(226,168,87,.25); }
.gift-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; }
.gift-top strong { font-family: var(--display); font-size: 16.5px; }
.gift-top em { font-style: normal; color: ${P.goldDeep}; font-weight: 700; }
.gift-desc { font-size: 13.5px; color: ${P.inkSoft}; }
.thanks-card { background: rgba(255,249,240,.08); border: 1px solid rgba(226,168,87,.4); border-radius: 16px; padding: 22px 26px; margin: 24px auto; max-width: 480px; text-align: left; }
.thanks-card p { display: flex; justify-content: space-between; gap: 18px; font-size: 14.5px; color: #E9DFEA; padding: 6px 0; }
.t-total { border-top: 1px solid rgba(226,168,87,.4); margin-top: 6px; padding-top: 12px !important; font-family: var(--display); color: ${P.gold} !important; }

/* split band */
.split-band { background: linear-gradient(160deg, ${P.night}, #2A2547); padding: 60px 0; }
.split-band h2 { margin-bottom: 26px; text-align: center; }
.split-bar { display: flex; border-radius: 14px; overflow: hidden; margin-bottom: 22px; box-shadow: 0 10px 30px rgba(0,0,0,.3); }
.split-a { flex: 4; background: ${P.gold}; color: ${P.nightDeep}; padding: 20px 10px; text-align: center; font-family: var(--display); font-size: clamp(22px, 3vw, 30px); }
.split-b { flex: 1; background: rgba(242,207,197,.18); color: ${P.roseSoft}; padding: 20px 8px; text-align: center; font-family: var(--display); font-size: clamp(16px, 2vw, 20px); }
.split-a span, .split-b span { display: block; font-family: var(--body); font-size: 12px; letter-spacing: .1em; text-transform: uppercase; margin-top: 4px; }

/* authors */
.author-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); gap: 22px; margin-top: 28px; }
.author-tile { text-align: left; background: ${P.cream}; border: 1px solid #EBDFCC; border-radius: 18px; padding: 26px 22px; transition: transform .18s ease, box-shadow .18s ease; }
.author-tile:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(43,36,51,.12); }
.author-tile svg { margin-bottom: 14px; border-radius: 50%; box-shadow: 0 6px 18px rgba(43,36,51,.18); }
.author-tile h3 { margin-bottom: 5px; }
.author-tile p { font-size: 14.5px; color: ${P.inkSoft}; margin-bottom: 10px; }
.author-detail { display: grid; grid-template-columns: 270px 1fr; gap: 44px; margin-top: 20px; align-items: start; }
.ad-left { text-align: center; }
.ad-left svg { border-radius: 50%; box-shadow: 0 10px 28px rgba(43,36,51,.22); }
.author-intro { font-size: 16.5px; font-style: italic; color: ${P.mauve}; margin: 12px 0 16px; max-width: 60ch; }
.author-para { margin-bottom: 13px; max-width: 64ch; }

/* night CTA */
.night-cta { background: radial-gradient(110% 100% at 50% 100%, #1C2546 0%, ${P.nightDeep} 70%); padding: 68px 0; text-align: center; }
.night-cta h2 { margin: 16px 0 18px; }
.night-cta .btn-gold { margin-top: 8px; }

/* journey */
.journey { list-style: none; padding: 0; margin: 30px 0 8px; }
.journey li { display: flex; gap: 18px; padding: 16px 0; border-bottom: 1px solid #EAD9C3; }
.j-num { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; background: ${P.night}; color: ${P.gold}; font-family: var(--display); font-size: 18px; display: flex; align-items: center; justify-content: center; }
.journey h3 { margin-bottom: 4px; }
.journey p { font-size: 15px; color: ${P.inkSoft}; max-width: 62ch; }

/* feedback */
.feedback-demo { margin: 36px 0 8px; }
.fb-card { background: ${P.cream}; border: 1px solid #EBDFCC; border-left: 4px solid ${P.gold}; border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; font-size: 14.5px; }
.fb-card.mine { border-left-color: ${P.mauve}; background: #F6EFF4; }
.fb-meta { font-size: 12.5px; color: ${P.inkSoft}; margin-bottom: 7px; }
.fb-tag { background: #F4E5C8; color: ${P.goldDeep}; font-weight: 700; padding: 2px 9px; border-radius: 999px; text-transform: uppercase; letter-spacing: .06em; font-size: 10.5px; }
.fb-tag.ok { background: #E2EAD8; color: #5C7048; }
.fb-tag.req { background: #F4D6D0; color: #9E4A44; }

/* honesty */
.honesty { background: ${P.paperWarm}; border-radius: 16px; padding: 24px 26px; margin-top: 28px; }
.honesty h3 { margin-bottom: 12px; }
.honesty p { font-size: 14.5px; margin-bottom: 11px; max-width: 66ch; }
.honesty strong { font-family: var(--display); font-weight: 640; }

/* form */
.form-wrap { max-width: 660px; }
.form { margin-top: 24px; display: flex; flex-direction: column; gap: 16px; }
.form label { display: block; }
.form label > span { display: block; font-size: 13px; font-weight: 700; letter-spacing: .04em; color: ${P.mauve}; margin-bottom: 6px; }
.form input, .form textarea, .form select { width: 100%; font-family: var(--body); font-size: 15px; color: ${P.ink}; background: ${P.cream}; border: 1.5px solid #E3D3BC; border-radius: 10px; padding: 11px 13px; }
.form textarea { resize: vertical; }
.dark-form label > span { color: ${P.rose}; }
.social-set { border: 1.5px solid #E3D3BC; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.social-set legend { font-size: 13px; font-weight: 700; color: ${P.mauve}; padding: 0 8px; }
.check { display: flex !important; gap: 12px; align-items: flex-start; }
.check input { width: 18px !important; height: 18px; margin-top: 3px; flex-shrink: 0; }
.check span { font-size: 14px !important; font-weight: 400 !important; letter-spacing: 0 !important; color: ${P.ink} !important; line-height: 1.55; }
.form-err { color: #9E4A44; font-size: 14px; background: #F8E7E4; border-radius: 8px; padding: 10px 14px; }
.form .btn-gold { align-self: flex-start; }
.form .btn-line { align-self: flex-start; }

/* dashboard */
.chooser-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 18px; margin-top: 28px; }
.chooser-card { background: #fff; border: 1.5px solid #EBDFCC; border-radius: 18px; padding: 28px 20px 22px; text-align: center; cursor: pointer; transition: box-shadow .15s, transform .15s; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.chooser-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.10); transform: translateY(-2px); }
.chooser-avatar { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; font-weight: 700; flex-shrink: 0; }
.chooser-avatar-img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid #E5AC9F; }
.chooser-name { font-weight: 700; font-size: 15px; color: var(--ink); }
.chooser-tagline { font-size: 13px; color: var(--inkSoft); line-height: 1.4; }
.chooser-admin .chooser-avatar { font-size: 22px; }
.profile-photo-card { display: flex; align-items: center; gap: 20px; background: #fff; border: 1px solid #EBDFCC; border-radius: 16px; padding: 18px 22px; margin: 22px 0 4px; }
.profile-photo-wrap { flex-shrink: 0; }
.profile-photo-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #E5AC9F; }
.profile-photo-placeholder { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #6E3E50, #A4707E); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 32px; font-weight: 600; }
.profile-photo-name { font-weight: 600; font-size: 16px; margin-bottom: 2px; }
.profile-photo-info { display: flex; flex-direction: column; }
.dash-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 36px; margin-top: 18px; align-items: start; }
/* Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(30,24,18,0.45); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: ${P.paper}; border-radius: 18px; padding: 28px; max-width: 480px; width: 100%; box-shadow: 0 12px 40px rgba(0,0,0,0.18); }
.modal-box h3 { font-family: var(--display); margin: 0 0 6px; }
.coll-pick-list { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.coll-pick-item { background: ${P.cream}; border: 1.5px solid #E3D3BC; border-radius: 12px; padding: 14px 16px; text-align: left; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
.coll-pick-item:hover { border-color: ${P.mauve}; background: #F9F3EE; }
.coll-pick-item strong { display: block; font-family: var(--display); font-size: 15px; margin-bottom: 3px; }
.coll-pick-item span { font-size: 13px; color: ${P.inkSoft}; }
.coll-pick-new { border-style: dashed; }
/* Collection cards on dashboard */
.coll-card { background: ${P.cream}; border: 1px solid #EBDFCC; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
.coll-portraits { display: flex; gap: 8px; margin: 6px 0; }
.coll-portrait { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: #EBDFCC; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.coll-portrait img { width: 100%; height: 100%; object-fit: cover; }
.coll-portrait-fallback { font-family: var(--display); font-size: 15px; color: #8a7a5c; }
.coll-card-head { display: flex; justify-content: space-between; align-items: center; }
.coll-card-head strong { font-family: var(--display); font-size: 15px; }
.coll-style { opacity: 0.7; font-style: italic; }
.lora-panel { background: #fff; border: 1px solid #EBDFCC; border-radius: 10px; padding: 10px 12px; margin: 8px 0; }
.lora-samples { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.lora-sample { display: flex; flex-direction: column; gap: 4px; }
.lora-sample img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; }
/* Generated image in chat */
.gen-img-wrap { margin: 6px 0 10px; }
.gen-img { width: 100%; border-radius: 10px; display: block; }
.gen-img-actions { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.gen-badge { font-size: 11px; font-weight: 700; background: ${P.night}; color: ${P.cream}; border-radius: 999px; padding: 3px 9px; letter-spacing: 0.04em; }
.dash-book { display: flex; justify-content: space-between; align-items: center; gap: 14px; background: ${P.cream}; border: 1px solid #EBDFCC; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
.dash-book strong { font-family: var(--display); font-size: 16px; display: block; margin-bottom: 4px; }
.st { display: inline-block; font-size: 11.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; }
.st-ok { background: #E2EAD8; color: #5C7048; }
.st-req { background: #F4D6D0; color: #9E4A44; }
.st-draft { background: #EEE6F0; color: ${P.mauve}; }
.earn-card { background: ${P.cream}; border: 1px solid #EBDFCC; border-radius: 12px; padding: 16px 18px; }
.earn-card p { display: flex; justify-content: space-between; font-size: 14.5px; padding: 5px 0; }
.thread { max-height: 420px; overflow-y: auto; }
.reply-row { display: flex; gap: 10px; align-items: flex-end; margin-top: 8px; }
.reply-row textarea { flex: 1; font-family: var(--body); font-size: 14.5px; border: 1.5px solid #E3D3BC; border-radius: 10px; padding: 10px 12px; background: ${P.cream}; resize: vertical; }

/* studio editor */
.ed-title { width: 100%; max-width: 620px; font-family: var(--display); font-size: 26px; color: ${P.ink}; background: ${P.cream}; border: 1.5px solid #E3D3BC; border-radius: 10px; padding: 10px 14px; margin: 12px 0 10px; }
.ed-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; align-items: start; }
.ed-page { background: ${P.cream}; border: 1px solid #EBDFCC; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; }
.ed-page-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.ed-page-head span { font-family: var(--display); font-size: 15px; color: ${P.mauve}; }
.ed-page-img { width: 100%; max-height: 340px; object-fit: contain; border-radius: 8px; margin-bottom: 10px; background: ${P.paper}; display: block; }
.ed-page textarea { width: 100%; font-family: var(--body); font-size: 15px; color: ${P.ink}; background: ${P.paper}; border: 1.5px solid #E9DCC8; border-radius: 8px; padding: 10px 12px; resize: vertical; }
.ed-page-imgrow { display: flex; align-items: baseline; gap: 12px; margin-top: 6px; flex-wrap: wrap; }
.ai-notes { background: ${P.paperWarm}; border-left: 4px solid ${P.gold}; border-radius: 12px; padding: 16px 18px; margin-top: 16px; font-size: 14.5px; white-space: pre-wrap; line-height: 1.6; }
.st-rev { background: #F4E5C8; color: ${P.goldDeep}; }
@media (max-width: 940px) { .ed-grid { grid-template-columns: 1fr; } }

/* studio v2: amora build + editor */
.char-pill { display: inline-block; margin-left: 8px; font-size: 11px; background: #EEE6F0; color: ${P.mauve}; padding: 2px 9px; border-radius: 999px; font-weight: 700; }
.dash-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.btn-text.soft { color: ${P.inkSoft}; font-size: 13px; }

.amora-chat { background: ${P.cream}; border: 1px solid #EBDFCC; border-radius: 18px; overflow: hidden; margin-top: 16px; display: flex; flex-direction: column; max-width: 760px; }
.amora-scroll { padding: 18px; display: flex; flex-direction: column; gap: 12px; max-height: 440px; overflow-y: auto; }
.abubble { max-width: 86%; padding: 12px 15px; border-radius: 15px; font-size: 14.5px; line-height: 1.55; }
.abubble.amora { background: ${P.paperWarm}; border-bottom-left-radius: 4px; align-self: flex-start; }
.abubble.user { background: ${P.night}; color: ${P.cream}; border-bottom-right-radius: 4px; align-self: flex-end; }
.abubble p { margin-bottom: 5px; } .abubble p:last-child { margin-bottom: 0; }
.amora-name { display: inline-flex; align-items: center; gap: 6px; font-family: var(--display); font-size: 14px; color: ${P.mauve}; margin-bottom: 5px; }
.typing { font-weight: 600; letter-spacing: 0.01em; }
.typing i { animation: blink 1.4s infinite; font-style: normal; font-size: 1.3em; font-weight: 700; vertical-align: middle; line-height: 1; } .typing i:nth-child(2){animation-delay:.25s} .typing i:nth-child(3){animation-delay:.5s}
@keyframes blink { 0%,70%,100%{opacity:.15; transform:translateY(0)} 35%{opacity:1; transform:translateY(-3px)} }
.amora-quick { display: flex; flex-wrap: wrap; gap: 7px; padding: 0 18px 12px; }
.amora-quick button { background: ${P.paper}; border: 1px solid ${P.mauve}; color: ${P.plum || P.mauve}; border-radius: 999px; padding: 6px 13px; font-size: 12.5px; color: ${P.mauve}; }
.amora-quick button:hover:not(:disabled) { background: ${P.paperWarm}; }
.amora-bar { display: flex; gap: 10px; padding: 14px 18px; border-top: 1px solid #EBDFCC; align-items: flex-end; }
.amora-bar textarea { flex: 1; font-family: var(--body); font-size: 14.5px; border: 1.5px solid #E3D3BC; border-radius: 12px; padding: 11px 13px; background: ${P.paper}; resize: none; max-height: 120px; }
.btn-attach { background: none; border: 1.5px solid #E3D3BC; border-radius: 10px; padding: 9px 11px; font-size: 16px; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
.btn-attach:hover { background: ${P.paperWarm}; }
.chat-img-preview { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: ${P.paperWarm}; border-radius: 10px; margin-bottom: 6px; font-size: 13px; color: ${P.ink}; }
.chat-img-preview img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #E3D3BC; }
.chat-img-preview span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-img-preview button { background: none; border: none; cursor: pointer; font-size: 14px; color: ${P.mauve}; padding: 2px 6px; }

.saved-flash { font-size: 13px; font-weight: 600; color: ${P.sage}; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
.saved-flash.visible { opacity: 1; }
.studio-nav { display: flex; gap: 0; margin: 0 0 20px; border-bottom: 2px solid #E3D3BC; }
.studio-tab { background: none; border: none; border-bottom: 3px solid transparent; margin-bottom: -2px; padding: 10px 20px; font-family: var(--display); font-size: 15px; font-weight: 600; color: ${P.inkSoft}; cursor: pointer; transition: color 0.15s, border-color 0.15s; }
.studio-tab:hover { color: ${P.ink}; }
.studio-tab.on { color: ${P.mauve}; border-bottom-color: ${P.mauve}; }

.drag-handle { cursor: grab; user-select: none; }
.ed-page[draggable=true]:active { cursor: grabbing; opacity: .7; }
.mini-amora { display: inline-flex; align-items: center; gap: 5px; background: ${P.paperWarm}; border: 1px solid ${P.gold}; color: ${P.goldDeep}; border-radius: 999px; padding: 4px 11px; font-size: 12px; font-weight: 700; margin-right: 10px; }
.mini-amora:hover { background: #FDF3DF; }

.report { margin-top: 16px; }
.report-verdict { display: flex; align-items: center; gap: 9px; font-family: var(--display); font-size: 16.5px; color: ${P.ink}; background: ${P.paperWarm}; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; }
.issue { background: ${P.cream}; border: 1px solid #EBDFCC; border-radius: 12px; padding: 13px 15px; margin-bottom: 10px; }
.issue-tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; margin-bottom: 7px; }
.issue-note { font-size: 14px; margin-bottom: 5px; }
.issue-fix { font-size: 14px; color: ${P.goldDeep}; }
.all-clear { background: #E2EAD8; color: #4C6038; border-radius: 12px; padding: 14px 16px; font-size: 14.5px; }
.praise { margin-top: 10px; font-style: italic; color: ${P.mauve}; font-size: 14.5px; }

.bible { max-width: 720px; }
.char-row { display: grid; grid-template-columns: 180px 1fr auto; gap: 12px; align-items: start; background: ${P.cream}; border: 1px solid #EBDFCC; border-radius: 12px; padding: 14px; margin-bottom: 10px; }
.char-name { font-family: var(--display); font-size: 16px; color: ${P.ink}; background: ${P.paper}; border: 1.5px solid #E9DCC8; border-radius: 8px; padding: 9px 11px; }
.char-row textarea { width: 100%; font-family: var(--body); font-size: 14px; background: ${P.paper}; border: 1.5px solid #E9DCC8; border-radius: 8px; padding: 9px 11px; resize: vertical; }
.char-row-actions { display: flex; flex-direction: column; gap: 6px; }
.coll-editor { margin: 6px 0 10px; }
.char-row-id { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.char-row-id .char-name { width: 100%; }

.pagechat-overlay { position: fixed; inset: 0; background: rgba(19,26,48,.5); z-index: 70; display: flex; align-items: flex-end; justify-content: center; padding: 20px; }
.pagechat { background: ${P.paper}; width: 100%; max-width: 560px; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; max-height: 80vh; box-shadow: 0 -10px 40px rgba(0,0,0,.4); }
.pc-head { display: flex; justify-content: space-between; align-items: center; background: ${P.plum || P.night}; background: ${P.night}; color: ${P.cream}; padding: 13px 18px; }
.pc-head span { display: inline-flex; align-items: center; gap: 8px; font-family: var(--display); font-size: 16px; }
.pc-head button { background: transparent; border: 1px solid ${P.mauve}; color: ${P.cream}; border-radius: 999px; padding: 5px 14px; font-size: 13px; }
.pc-scroll { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.pc-draft { background: #FDF3DF; border: 1.5px solid ${P.gold}; border-radius: 12px; padding: 14px; }
.pc-draft-label { font-size: 11.5px; letter-spacing: .08em; text-transform: uppercase; color: ${P.goldDeep}; font-weight: 700; margin-bottom: 6px; }
.pc-draft p { font-size: 15px; margin-bottom: 10px; }
.pc-bar { display: flex; gap: 10px; padding: 13px 16px; border-top: 1px solid #EBDFCC; align-items: flex-end; }
.pc-bar textarea { flex: 1; font-family: var(--body); font-size: 14.5px; border: 1.5px solid #E3D3BC; border-radius: 12px; padding: 11px 13px; background: ${P.cream}; resize: none; }

.lockbanner { background: #FDF3DF; border: 1.5px solid ${P.gold}; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; font-size: 14px; color: ${P.goldDeep}; font-weight: 600; }
.lockbanner.ok { background: #F1F6EC; border-color: ${P.sage}; color: #4D6B3C; }
.lockbanner.ok.done { background: #EAF3E4; }
.biblelock { background: ${P.paperWarm}; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px; }
.biblelock textarea { width: 100%; font-family: var(--body); font-size: 14.5px; border: 1.5px solid #E3D3BC; border-radius: 10px; padding: 10px 12px; background: ${P.cream}; resize: vertical; }
.pagechat-inline { background: ${P.paperWarm}; border-radius: 14px; margin-top: 10px; overflow: hidden; display: flex; flex-direction: column; max-height: 360px; }
.pagechat-inline .pc-head { background: ${P.night}; color: ${P.cream}; padding: 9px 14px; }
.pc-scroll-inline { max-height: 220px; padding: 12px; }

@media (max-width: 640px) { .char-row { grid-template-columns: 1fr; } }

.pc-meter { height: 8px; background: #EBDFCC; border-radius: 999px; overflow: hidden; }
.pc-fill { height: 100%; border-radius: 999px; transition: width .3s ease; }

/* upload zone */
.upload-zone { max-width: 760px; margin-top: 16px; background: ${P.cream}; border: 2px dashed #D9C6AC; border-radius: 18px; padding: 20px; transition: border-color .15s ease, background .15s ease; }
.upload-zone.drag { border-color: ${P.gold}; background: #FDF3DF; }
.uz-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.uz-sub { font-size: 14px; color: ${P.inkSoft}; max-width: 46ch; }
.uz-empty { font-size: 13.5px; color: ${P.inkSoft}; margin-top: 14px; }
.uz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; margin-top: 16px; }
.uz-thumb { position: relative; border-radius: 10px; overflow: hidden; border: 1px solid #E3D3BC; background: ${P.paper}; }
.uz-thumb img { width: 100%; aspect-ratio: 1/1.2; object-fit: cover; display: block; }
.uz-n { position: absolute; top: 5px; left: 5px; background: ${P.night}; color: ${P.gold}; font-size: 11px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.uz-ctrls { display: flex; justify-content: center; gap: 4px; padding: 5px; background: ${P.paperWarm}; }
.uz-ctrls button { width: 26px; height: 24px; border: 1px solid #E3D3BC; background: ${P.cream}; border-radius: 6px; font-size: 12px; color: ${P.ink}; }
.uz-ctrls button:disabled { opacity: .35; }
.ms-toggle { background: none; border: none; color: ${P.mauve}; font-size: 13.5px; font-weight: 700; margin-top: 14px; padding: 4px 0; }
.ms-box { width: 100%; margin-top: 10px; font-family: var(--body); font-size: 14px; background: ${P.paper}; border: 1.5px solid #E3D3BC; border-radius: 10px; padding: 12px; resize: vertical; }

/* footer */
.foot { background: ${P.nightDeep}; color: #B9AEC4; padding: 38px 0; }
.foot-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 30px; align-items: start; }
.brand-foot { display: flex; align-items: center; gap: 8px; font-family: var(--display); font-size: 17px; color: ${P.cream}; margin-bottom: 5px; }
.foot-line { font-style: italic; font-size: 14px; color: ${P.rose}; }
.foot-small { font-size: 13px; line-height: 1.6; }

/* ---- Footer extended ---- */
.foot-legal-row { border-top: 1px solid rgba(255,255,255,.08); margin-top: 24px; padding-top: 20px; }
.foot-policy-heading { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: rgba(201,190,210,.5); font-weight: 700; margin-bottom: 6px; }
.foot-nav { display: flex; flex-direction: column; gap: 4px; }
.foot-nav-link { background: none; border: none; color: #C9BED2; font-size: 13px; text-align: left; cursor: pointer; padding: 2px 0; opacity: .85; }
.foot-nav-link:hover { color: #E2A857; opacity: 1; }
.foot-copy { font-size: 12px; color: rgba(201,190,210,.4); margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.06); }


/* toast */
.toast { position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%); background: ${P.night}; color: ${P.cream}; padding: 14px 22px; border-radius: 12px; font-size: 14.5px; max-width: 480px; box-shadow: 0 12px 34px rgba(0,0,0,.4); z-index: 60; border: 1px solid rgba(226,168,87,.4); }

/* reveal */
.reveal { opacity: 0; transform: translateY(18px); transition: opacity .7s ease, transform .7s ease; }
.reveal.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
  .star { animation: none; }
  .btn-gold, .cover, .author-tile, .gift { transition: none; }
}

/* responsive */
@media (max-width: 940px) {
  .why-grid { grid-template-columns: 1fr; gap: 26px; }
  .studio-grid { grid-template-columns: 1fr; }
  .checkout-grid, .dash-grid { grid-template-columns: 1fr; }
  .book-detail, .author-detail { grid-template-columns: 1fr; gap: 26px; }
  .cover-lg { margin: 0 auto; }
  .ad-left { max-width: 320px; margin: 0 auto; }
  .foot-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .two-grid { grid-template-columns: 1fr; }
  .hero { padding: 58px 20px 96px; }
  .nav { padding: 10px 12px; }
  .nav-link { padding: 7px 8px; font-size: 13px; }
  .brand span { display: none; }
}

/* suggest theme box in apply form */
.suggest-theme-box { background: #F5F0FB; border: 1.5px solid #D8CBE8; border-radius: 12px; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.suggest-theme-note { font-size: 13.5px; color: #6E5572; line-height: 1.6; margin: 0; }


/* ============================================================
   BECOME AN AUTHOR — WritePage styles
   ============================================================ */

/* Page wrapper */
.write-page { }

/* ── HERO ───────────────────────────────────────────────── */
.write-hero {
  position: relative;
  background: radial-gradient(130% 100% at 50% 0%, #1B2444 0%, ${P.night} 50%, #0D1221 100%);
  color: ${P.cream};
  padding: 90px 26px 100px;
  overflow: hidden;
  text-align: center;
}
.write-hero-inner { position: relative; z-index: 1; }
.write-stars { position: absolute; inset: 0; pointer-events: none; }
.write-star {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,249,240,.75);
  animation: write-twinkle 3s ease-in-out infinite alternate;
}
@keyframes write-twinkle { from { opacity: .3; } to { opacity: 1; } }
.write-hero-h {
  font-family: var(--display);
  font-size: clamp(30px, 5vw, 52px);
  font-weight: 800;
  color: ${P.cream};
  line-height: 1.15;
  margin-bottom: 22px;
}
.write-hero-sub {
  font-size: clamp(15px, 2vw, 17.5px);
  color: rgba(255,249,240,.82);
  max-width: 58ch;
  margin: 0 auto 30px;
  line-height: 1.72;
}
.write-hero-ctas {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.write-hero-link {
  color: ${P.roseSoft};
  font-size: 14.5px;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid rgba(242,207,197,.4);
  padding-bottom: 2px;
}
.write-hero-link:hover { border-bottom-color: ${P.roseSoft}; }
.write-hero-note {
  font-size: 12.5px;
  color: rgba(255,249,240,.45);
  margin: 0;
  letter-spacing: .02em;
}

/* ── EMOTIONAL INVITATION ───────────────────────────────── */
.write-invitation {
  background: ${P.cream};
  padding: 80px 26px;
}
.write-inv-inner {
  max-width: 680px;
  margin: 0 auto;
}
.write-inv-line {
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, ${P.mauve}, ${P.rose});
  border-radius: 99px;
  margin: 0 auto 36px;
}
.write-inv-h {
  font-family: var(--display);
  font-size: clamp(24px, 3.5vw, 36px);
  color: ${P.ink};
  text-align: center;
  line-height: 1.25;
  margin-bottom: 28px;
}
.write-inv-p {
  font-size: 16.5px;
  color: ${P.inkSoft};
  line-height: 1.78;
  margin-bottom: 18px;
  max-width: 62ch;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
.write-inv-bold {
  color: ${P.ink};
  font-style: italic;
  font-size: 17px;
}

/* ── WHO THIS IS FOR ────────────────────────────────────── */
.write-who {
  background: ${P.paperWarm};
  padding: 80px 26px;
}
.write-who-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin: 28px 0 22px;
}
.write-who-card {
  background: #fff;
  border: 1.5px solid #E9DCC8;
  border-radius: 16px;
  padding: 22px 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  box-shadow: 0 2px 12px rgba(0,0,0,.04);
}
.write-who-icon {
  font-size: 20px;
  color: ${P.mauve};
  flex-shrink: 0;
  line-height: 1.3;
}
.write-who-card p {
  font-size: 14.5px;
  color: ${P.inkSoft};
  line-height: 1.65;
  margin: 0;
}
.write-who-note {
  text-align: center;
  font-size: 14px;
  color: ${P.inkSoft};
  font-style: italic;
  margin: 8px 0 0;
}

/* ── HOW IT WORKS ───────────────────────────────────────── */
.write-steps-section {
  background: ${P.cream};
  padding: 80px 26px;
}
.write-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.write-step {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 24px 0;
  border-bottom: 1px solid #EAD9C3;
}
.write-step:last-child { border-bottom: none; }
.write-step-num {
  font-family: var(--display);
  font-size: 13px;
  font-weight: 800;
  color: ${P.gold};
  letter-spacing: .08em;
  background: ${P.night};
  border-radius: 8px;
  padding: 7px 10px;
  flex-shrink: 0;
  min-width: 42px;
  text-align: center;
}
.write-step-title {
  font-size: 17px;
  font-weight: 700;
  color: ${P.ink};
  margin-bottom: 6px;
}
.write-step-text {
  font-size: 15px;
  color: ${P.inkSoft};
  line-height: 1.68;
  margin: 0;
  max-width: 62ch;
}

/* ── AI STUDIO ──────────────────────────────────────────── */
.write-ai {
  background: linear-gradient(160deg, ${P.night} 0%, #1E2A4A 100%);
  padding: 80px 26px;
  color: ${P.cream};
}
.write-ai-inner {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}
.write-ai-tag {
  display: inline-block;
  background: rgba(226,168,87,.18);
  color: ${P.gold};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 20px;
}
.write-ai-h {
  font-family: var(--display);
  font-size: clamp(24px, 4vw, 38px);
  font-weight: 800;
  color: ${P.cream};
  line-height: 1.2;
  margin-bottom: 22px;
}
.write-ai-p {
  font-size: 16px;
  color: rgba(255,249,240,.78);
  line-height: 1.75;
  margin-bottom: 16px;
  max-width: 58ch;
  margin-left: auto;
  margin-right: auto;
}
.write-ai-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 28px;
}
.write-ai-pill {
  background: rgba(255,249,240,.1);
  border: 1px solid rgba(255,249,240,.2);
  color: rgba(255,249,240,.85);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
}

/* ── EDITORIAL CARE ─────────────────────────────────────── */
.write-editorial {
  background: ${P.paperWarm};
  padding: 80px 26px;
}
.write-fb-card {
  background: #fff;
  border: 1.5px solid #E9DCC8;
  border-left: 5px solid ${P.gold};
  border-radius: 14px;
  padding: 20px 22px;
  margin-bottom: 14px;
  box-shadow: 0 3px 14px rgba(0,0,0,.05);
}
.write-fb-card.approved {
  border-left-color: ${P.sage};
}
.write-fb-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.write-fb-type {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 999px;
}
.write-fb-type.editorial { background: #F4E5C8; color: #8B6320; }
.write-fb-type.safety { background: #D4EFE0; color: #1A6B41; }
.write-fb-book {
  font-size: 12px;
  color: ${P.inkSoft};
  font-style: italic;
}
.write-fb-approved {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  color: ${P.sage};
  text-transform: uppercase;
  letter-spacing: .1em;
}
.write-fb-text {
  font-size: 14.5px;
  color: ${P.ink};
  line-height: 1.7;
  margin: 0;
}
.write-ed-promises {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
  margin-top: 28px;
}
.write-ed-promise {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${P.inkSoft};
}
.write-ed-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${P.mauve};
  flex-shrink: 0;
}

/* ── ROYALTIES ──────────────────────────────────────────── */
.write-royalty {
  background: ${P.dusk};
  padding: 80px 26px;
}
.write-royalty-h {
  color: ${P.cream};
  margin-bottom: 36px;
}
.write-royalty-card {
  background: rgba(255,249,240,.06);
  border: 1.5px solid rgba(226,168,87,.3);
  border-radius: 20px;
  padding: 36px 32px;
  max-width: 600px;
  margin: 0 auto;
}
.write-royalty-split {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 28px;
  background: rgba(255,249,240,.05);
  border-radius: 14px;
  overflow: hidden;
}
.write-royalty-author {
  flex: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 16px;
  background: rgba(226,168,87,.15);
  border-right: 1px solid rgba(226,168,87,.2);
}
.write-royalty-press {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 16px;
}
.write-royalty-pct {
  font-family: var(--display);
  font-size: 48px;
  font-weight: 900;
  color: ${P.gold};
  line-height: 1;
}
.write-royalty-pct.small { font-size: 30px; color: rgba(255,249,240,.5); }
.write-royalty-who {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,249,240,.6);
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-top: 6px;
}
.write-royalty-divider { width: 1px; background: rgba(226,168,87,.2); align-self: stretch; }
.write-royalty-desc {
  font-size: 15px;
  color: rgba(255,249,240,.8);
  line-height: 1.7;
  margin-bottom: 20px;
  text-align: center;
}
.write-royalty-desc strong { color: ${P.gold}; }
.write-royalty-example {
  background: rgba(255,249,240,.07);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.write-royalty-eg-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  color: ${P.gold};
  text-transform: uppercase;
  letter-spacing: .12em;
  margin-bottom: 6px;
}
.write-royalty-example p {
  font-size: 14px;
  color: rgba(255,249,240,.75);
  line-height: 1.6;
  margin: 0;
}
.write-royalty-note {
  font-size: 12.5px;
  color: rgba(255,249,240,.45);
  line-height: 1.65;
  text-align: center;
  margin: 0;
}

/* ── PRIVACY ────────────────────────────────────────────── */
.write-privacy {
  background: ${P.cream};
  padding: 80px 26px;
}
.write-priv-lead {
  font-size: 16px;
  color: ${P.mauve};
  font-style: italic;
  font-weight: 600;
  margin-bottom: 32px;
  line-height: 1.5;
}
.write-priv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}
.write-priv-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14.5px;
  color: ${P.ink};
  line-height: 1.55;
}
.write-priv-check {
  color: ${P.sage};
  font-size: 16px;
  font-weight: 900;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── FAQ ────────────────────────────────────────────────── */
.write-faq-section {
  background: ${P.paperWarm};
  padding: 80px 26px;
}
.wfaq {
  border: 1.5px solid #E9DCC8;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}
.wfaq-item {
  border-bottom: 1px solid #EAD9C3;
}
.wfaq-item:last-child { border-bottom: none; }
.wfaq-q {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: none;
  border: none;
  text-align: left;
  font-size: 15px;
  font-weight: 700;
  color: ${P.ink};
  cursor: pointer;
  font-family: inherit;
}
.wfaq-q:hover { background: ${P.cream}; }
.wfaq-icon {
  font-size: 20px;
  color: ${P.mauve};
  flex-shrink: 0;
  font-weight: 400;
}
.wfaq-a {
  padding: 0 22px 18px;
  font-size: 14.5px;
  color: ${P.inkSoft};
  line-height: 1.72;
  margin: 0;
}
.wfaq-open .wfaq-q { color: ${P.mauve}; background: #FAF6FF; }

/* ── FINAL CTA ──────────────────────────────────────────── */
.write-final-cta {
  background: radial-gradient(120% 100% at 50% 0%, #1B2444 0%, ${P.night} 60%, #0D1221 100%);
  padding: 90px 26px;
  text-align: center;
  color: ${P.cream};
}
.write-final-h {
  font-family: var(--display);
  font-size: clamp(26px, 4vw, 40px);
  color: ${P.cream};
  margin: 20px 0 16px;
}
.write-final-sub {
  font-size: 16.5px;
  color: rgba(255,249,240,.78);
  max-width: 52ch;
  margin: 0 auto 30px;
  line-height: 1.72;
}
.write-final-btns {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

/* ── MOBILE ─────────────────────────────────────────────── */
@media (max-width: 660px) {
  .write-who-grid { grid-template-columns: 1fr; }
  .write-ed-promises { grid-template-columns: 1fr; }
  .write-priv-grid { grid-template-columns: 1fr; }
  .write-royalty-card { padding: 24px 18px; }
  .write-hero-ctas { flex-direction: column; gap: 14px; }
  .write-final-btns { flex-direction: column; gap: 14px; }
}

/* ── APPLY PAGE ──────────────────────────────────────────── */
.apply-privacy-box {
  display: flex; gap: 16px; align-items: flex-start;
  background: #f0f7ef; border: 1.5px solid #5a9e6f;
  border-radius: 12px; padding: 20px 22px; margin-bottom: 32px;
}
.apply-privacy-lock { font-size: 26px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
.apply-privacy-title { font-weight: 700; color: #2d6a4f; margin: 0 0 6px; font-size: 0.97rem; }
.apply-privacy-body { color: #3a5a47; font-size: 0.9rem; line-height: 1.55; margin: 0 0 6px; }
.apply-privacy-body:last-child { margin-bottom: 0; }
.apply-section-label {
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: #7a5c8a; margin: 20px 0 2px;
}
.apply-section-note { font-size: 0.82rem; color: #888; margin: 0 0 10px; }
.apply-opt { font-style: italic; font-weight: 400; color: #aaa; font-size: 0.88em; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.apply-footer-note {
  border-top: 1px solid #eee; padding-top: 14px; margin-top: 4px;
}
.apply-footer-note p { font-size: 0.82rem; color: #999; margin: 0 0 4px; }
.apply-coupon-wrap { margin-top: 28px; padding: 18px; background: #F0EAF8; border: 1.5px solid #D4C4E4; border-radius: 14px; }
.apply-coupon-hint { font-size: 13px; color: #6E5572; margin: 4px 0 12px; line-height: 1.5; }
.apply-coupon-row { display: flex; gap: 8px; align-items: center; }
.apply-coupon-input { flex: 1; border: 1.5px solid #C4B4D4; border-radius: 9px; padding: 10px 13px; font-size: 14px; font-family: monospace; text-transform: uppercase; background: #fff; }
.apply-coupon-input.valid { border-color: #27ae60; background: #F0FBF0; }
.apply-coupon-input.invalid { border-color: #c0392b; }
.apply-coupon-btn { background: #6E5572; color: #fff; border: none; border-radius: 9px; padding: 10px 18px; font-size: 14px; font-weight: 700; cursor: pointer; }
.apply-coupon-ok { font-size: 13px; color: #27ae60; font-weight: 700; margin-top: 8px; }
.apply-coupon-err { font-size: 13px; color: #c0392b; margin-top: 8px; }
.apply-coupon-checking { font-size: 13px; color: #888; margin-top: 8px; }
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

${STORE_CSS}
`;
// deploy-trigger-retest 2026-06-24T03:33:15Z
