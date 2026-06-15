import React, { useState, useEffect, useRef } from "react";
import AdminDashboard from "./AdminDashboard";
import { PLACEHOLDER_BOOKS, PACKS, StoreLanding, BooksShop, PacksPage, PackPage, STORE_CSS } from "./Bookstore";
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
    id: "june", name: "June Ellery", grad: ["#6E3E50", "#A4707E"],
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
  const { look, grad, id } = author;
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
                    <p className="tile-by">by {b.authorName} · {b.age}</p>
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
                <p className="tile-by">by {b.authorName} · {b.age}</p>
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

function BookPage({ book, go, toast, addToCart }) {
  const author = AUTHORS[book.author];
  const coming = book.status === "coming";
  return (
    <section className="morning page-top">
      <div className="wrap">
        <button className="btn-text" onClick={() => go("books")}>← All books</button>
        <div className="book-detail">
          <div><Cover book={book} large /></div>
          <div className="bd-right">
            <h2>{book.title}</h2>
            <p className="tile-by big">
              by <button className="link" onClick={() => go("author", author.id)}>{book.authorName}</button> · {book.age}
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
              ) : (
                <>
                  <button className="btn-gold" onClick={() => addToCart ? addToCart({ type: "book", id: book.id, title: book.title, price: book.price, authorName: book.authorName, grad: book.grad, motif: book.motif }) : go("checkout", book.id)}>
                    Add to bag — ${book.price.toFixed(2)}
                  </button>
                  <button className="btn-line dark" onClick={() => toast("In production this links to the book's live Amazon listing, published under the Little Amour imprint.")}>
                    Buy on Amazon
                  </button>
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
function CartPage({ cart, removeFromCart, go, onCheckout }) {
  const [gifts, setGifts] = useState({});
  const [agreed, setAgreed] = useState(false);
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
                    <p className="cart-item-type">{item.type === "pack" ? "Book Pack" : "Digital Book"}</p>
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

            <button
              className="btn-gold full"
              disabled={!agreed}
              style={{ opacity: agreed ? 1 : 0.5, marginTop: 16 }}
              onClick={() => onCheckout(cart, gifts, total)}
            >
              Complete purchase — ${total.toFixed(2)}
            </button>
            <p className="fine" style={{ marginTop: 12 }}>Secure checkout via Stripe at deployment. 75% of every direct sale goes to the author.</p>
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
  if (!order) return null;
  const items = order.items || [];
  const giftAmt = Object.values(order.gifts || {}).filter(Boolean).length * 5; // approx
  return (
    <section className="dusk page-top tall">
      <div className="wrap narrow center">
        <Moon size={44} />
        <h2 className="light">Thank you. Here's what just happened.</h2>
        <div className="thanks-card">
          {items.map(item => (
            <p key={item.cartId}><span>{item.title} — to author (75%)</span><span>${(item.price * 0.75).toFixed(2)}</span></p>
          ))}
          {giftAmt > 0 && <p><span>Your support gifts (100%)</span><span>${giftAmt.toFixed(2)}</span></p>}
          <p><span>To the publisher — keeps the studio free</span><span>${(items.reduce((s,i)=>s+i.price,0)*0.25).toFixed(2)}</span></p>
          <p className="t-total"><span>Children get braver words</span><span>priceless</span></p>
        </div>
        <p className="lead light center-text">
          {items.length === 1 ? items[0].title : `${items.length} books`} will be on their way once payments are live.
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
                  <div className="tile-meta"><h3>{b.title}</h3><p className="tile-by">{b.age} · {b.status === "coming" ? "Coming soon" : "$" + b.price.toFixed(2)}</p></div>
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
    consent: false,
    // Publishing agreement initials
    init1: "", init2: "", init3: "", init4: "", init5: "", init6: "",
    agreementAccepted: false,
  });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
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
        consent_initials: JSON.stringify({
          i1: form.init1.trim(), i2: form.init2.trim(), i3: form.init3.trim(),
          i4: form.init4.trim(), i5: form.init5.trim(), i6: form.init6.trim(),
        }),
        agreement_accepted: true,
        agreement_accepted_at: new Date().toISOString(),
      });
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
        onSignIn({ id: data.id, name: data.pen_name, email: data.email, isKirby: data.is_admin });
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

const DASH_SEED = {
  author: "Author",
  books: [
    { id: "bluebag", title: "The Night We Packed the Blue Bag", status: "approved", statusLabel: "Approved — launching soon", earnings: 0 },
    { id: "lighthouse", title: "The Lighthouse Keeps Its Promise", status: "changes", statusLabel: "Changes requested", earnings: 0 },
    { id: "untitled", title: "Untitled new idea", status: "draft", statusLabel: "Draft — in the AI studio", earnings: 0 },
  ],
  earnings: { royalties: 342.18, gifts: 85.0, lifetime: 1204.36, nextPayout: "July 1" },
  feedback: [
    { from: "editor", tag: "required", text: "Page 7: 'the waves got angry' may read as frightening for our youngest readers. Could the storm stay outside the window while the lighthouse keeps its promise inside? The metaphor will still land — gently." },
    { from: "editor", tag: "suggestion", text: "Page 12 is gorgeous. Consider repeating 'the light stays on' as the closing line of the book — children love a promise they can memorize." },
  ],
};

function DashboardPage({ go, author, onSignOut }) {
  const [reply, setReply] = useState("");
  const [thread, setThread] = useState(DASH_SEED.feedback);
  const send = () => {
    const t = reply.trim();
    if (!t) return;
    setThread([...thread, { from: "author", tag: "reply", text: t }]);
    setReply("");
  };
  const chip = (s) => ({
    approved: "st st-ok", changes: "st st-req", draft: "st st-draft",
  }[s] || "st");
  return (
    <section className="morning page-top">
      <div className="wrap">
        <div className="row-between">
          <div>
            <p className="eyebrow plum">Author studio</p>
            <h2>Good morning, {(author?.name || "Author").split(" ")[0]}.</h2>
          </div>
          <button className="btn-text" onClick={onSignOut}>Sign out</button>
        </div>

        <div className="dash-grid">
          <div className="dash-col">
            <h3 className="bd-h">My books</h3>
            {DASH_SEED.books.map((b) => (
              <div key={b.id} className="dash-book">
                <div>
                  <strong>{b.title}</strong>
                  <span className={chip(b.status)}>{b.statusLabel}</span>
                </div>
                <button className="btn-text">{b.status === "draft" ? "Continue in studio →" : b.status === "changes" ? "View feedback →" : "View book →"}</button>
              </div>
            ))}
            <button className="btn-gold" style={{ marginTop: 14 }} onClick={() => go("write")}>+ Start a new book with the AI studio</button>

            <h3 className="bd-h" style={{ marginTop: 30 }}>Earnings</h3>
            <div className="earn-card">
              <p><span>Book royalties (this period)</span><span>${DASH_SEED.earnings.royalties.toFixed(2)}</span></p>
              <p><span>Reader gifts — 100% yours</span><span>${DASH_SEED.earnings.gifts.toFixed(2)}</span></p>
              <p><span>Lifetime earnings</span><span>${DASH_SEED.earnings.lifetime.toFixed(2)}</span></p>
              <p className="co-total"><span>Next payout</span><span>{DASH_SEED.earnings.nextPayout}</span></p>
            </div>
            <p className="fine">You keep 75% of every sale and 75% of net Amazon royalties. Statements itemize every book, every month.</p>
          </div>

          <div className="dash-col">
            <h3 className="bd-h">Editorial feedback — <em>The Lighthouse Keeps Its Promise</em></h3>
            <div className="thread">
              {thread.map((m, i) => (
                <div key={i} className={"fb-card" + (m.from === "author" ? " mine" : "")}>
                  <p className="fb-meta">
                    {m.from === "author" ? "You" : "Your editor"}
                    {m.tag !== "reply" ? <> · <span className={"fb-tag" + (m.tag === "suggestion" ? "" : " req")}>{m.tag}</span></> : null}
                  </p>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <div className="reply-row">
              <textarea rows={2} placeholder="Reply to your editor…" value={reply} onChange={(e) => setReply(e.target.value)} />
              <button className="btn-gold" onClick={send}>Send</button>
            </div>
            <p className="fine">When all required changes are resolved, your book moves to final approval — then to Amazon.</p>
          </div>
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
async function deriveStyleFromImages(dataUrls) {
  if (!dataUrls.length) return null;
  try {
    const content = [
      { type: "text", text: "These are pages from a children's picture book. Describe the visual art style in 4–5 sentences precise enough for an AI image generator to reproduce it on new pages. Cover: art medium, line quality, colour palette and saturation, rendering technique (flat/textured/painterly), character proportions and facial style, background treatment, mood. Be technical and specific — this description locks the style for every future page." },
      ...dataUrls.map(url => {
        const m = url.match(/^data:([^;]+);base64,(.+)$/);
        return m ? { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } } : null;
      }).filter(Boolean),
    ];
    const res = await fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 350, messages: [{ role: "user", content }] }),
    });
    const data = await res.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch (_) { return null; }
}
function parseLoose(text) {
  let t = text.replace(/```json|```/g, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a === -1 || b === -1) throw new Error("no json");
  return JSON.parse(t.slice(a, b + 1));
}

const KIRBY_SEED = {
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
      id: "papers", title: "Mama Has Papers Today", status: "published", earnings: 218.4,
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

function KirbyStudio({ go, onSignOut }) {
  const [data, setData] = useState(KIRBY_SEED);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [view, setView] = useState("list"); // list | build | edit | publish
  const [pickingCollection, setPickingCollection] = useState(false); // collection picker modal
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("lab:studio:kirby:v2");
        if (r && r.value) setData(JSON.parse(r.value));
      } catch (e) { /* first visit */ }
      setLoaded(true);
    })();
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        await window.storage.set("lab:studio:kirby:v2", JSON.stringify(data));
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      } catch (e) { /* non-fatal */ }
    }, 700);
    return () => clearTimeout(t);
  }, [data, loaded]);

  const book = data.books.find((b) => b.id === openId);
  const setBook = (patch) =>
    setData((d) => ({ ...d, books: d.books.map((b) => (b.id === openId ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) } : b)) }));

  const collections = data.collections || [];
  const setCollections = (patch) => setData((d) => ({ ...d, collections: typeof patch === "function" ? patch(d.collections || []) : patch }));

  const createBookWithCollection = (collId) => {
    const coll = collections.find((c) => c.id === collId);
    const id = "b" + Date.now();
    setData((d) => ({
      ...d,
      books: [...d.books, {
        id, title: "Untitled book", status: "draft", earnings: 0, collectionId: collId || null,
        characters: coll ? coll.characters.map((c) => ({ ...c })) : [],
        styleGuide: coll ? coll.styleGuide : "",
        pages: [],
      }],
    }));
    setOpenId(id);
    setPickingCollection(false);
    setView("build");
  };

  const startNewBook = () => {
    if (collections.length > 0) { setPickingCollection(true); }
    else { createBookWithCollection(null); }
  };

  const startWithCharacters = (chars) => {
    const id = "b" + Date.now();
    setData((d) => ({ ...d, books: [...d.books, { id, title: "Untitled book", status: "draft", earnings: 0, characters: chars.map((c) => ({ ...c })), pages: [] }] }));
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
            <div><p className="eyebrow plum">Author studio</p><h2>Good morning, Kirby.</h2></div>
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
                    </div>
                  </div>
                );
              })}
              <button className="btn-gold" style={{ marginTop: 14 }} onClick={startNewBook}>+ Create a new book with Amora</button>
              <p className="fine">Everything you make here saves automatically and waits for you next time.</p>
            </div>
            <div className="dash-col">
              <h3 className="bd-h">Character Collections</h3>
              {collections.length === 0 ? (
                <p className="fine">Your character universes will appear here. Once you've built your first book's characters with Amora, save them as a collection and reuse them in any future book.</p>
              ) : collections.map((c) => (
                <div key={c.id} className="coll-card">
                  <div className="coll-card-head">
                    <strong>{c.name}</strong>
                    <button className="btn-text soft" onClick={() => {
                      if (window.confirm("Delete this collection?")) setCollections((cs) => cs.filter((x) => x.id !== c.id));
                    }}>delete</button>
                  </div>
                  <p className="fine" style={{ margin: "4px 0 6px" }}>{c.characters.map((ch) => ch.name).join(" · ")}</p>
                  {c.styleGuide ? <p className="fine coll-style">{c.styleGuide}</p> : null}
                </div>
              ))}
              <h3 className="bd-h" style={{ marginTop: 18 }}>Earnings</h3>
              <div className="earn-card">
                <p><span>Book royalties</span><span>${royalties.toFixed(2)}</span></p>
                <p><span>Reader gifts — 100% yours</span><span>$42.00</span></p>
                <p className="co-total"><span>Next payout</span><span>July 1</span></p>
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
    return <PublishingModule book={book} setBook={setBook} author={{ name: data.name || "Kirby" }} onBack={() => setView("list")} />;
  }

  /* ---------------- AMORA BUILD ---------------- */
  if (view === "build") {
    const activeColl = collections.find((c) => c.id === book?.collectionId) || null;
    return <AmoraBuild book={book} setBook={setBook} collection={activeColl} savedFlash={savedFlash}
      onGoEditor={(tab) => { setView("edit"); }}
      onBack={() => setView("list")} />;
  }

  /* ---------------- BOOK EDITOR ---------------- */
  return <BookEditor book={book} setBook={setBook} onBack={() => setView("list")} onSignOut={onSignOut} onAmora={() => setView("build")} savedFlash={savedFlash} />;
}

/* ---------------- Amora guided build ---------------- */
function AmoraBuild({ book, setBook, collection, savedFlash, onGoEditor, onBack }) {
  const onDone = () => onGoEditor("pages");
  const [msgs, setMsgs] = useState([
    { role: "amora", text: "Hi Kirby — I'm Amora. Let's make this book together, one step at a time.\n\nTell me what you have so far. It can be anything: just a feeling or an idea, a hard thing you want a child to understand, some page text you've already written, or even images you'd like to use. Where would you like to begin?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chatImg, setChatImg] = useState(null); // {dataUrl, mediaType, name}
  const chatImgRef = useRef(null);
  const scroller = useRef(null);
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);

  const push = (role, text) => setMsgs((m) => [...m, { role, text }]);

  const attachChatImage = (file) => {
    if (!file) return;
    const mimeMatch = file.type || "image/jpeg";
    const fr = new FileReader();
    fr.onload = () => setChatImg({ dataUrl: fr.result, mediaType: file.type || "image/jpeg", name: file.name });
    fr.readAsDataURL(file);
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
      } else {
        const convo = msgs.concat({ role: "user", text }).slice(-12)
          .map((m) => `${m.role === "amora" ? "Amora" : "Kirby"}: ${m.text}`).join("\n");

        // Detect image generation requests — stem-based so typos like "illiatrate" still match
        const isImageReq = /generat|draw|creat|mak[ei]|illustrat|paint|render|visuali|sketch/i.test(text)
          && /page|scene|spread|cover|illustrat|image|picture|background|setting/i.test(text);

        // Detect save-to-bible request
        const isSaveBible = text.toLowerCase().includes("save") && (text.toLowerCase().includes("character") || text.toLowerCase().includes("bible"));

        if (isImageReq) {
          const activeChars = (collection && collection.characters.length ? collection.characters : book.characters) || [];
          const seed = collection ? collection.seed : null;

          // Look at pages already in the book (uploaded or previously generated) to derive
          // the true visual style — text descriptions alone can't guarantee page-to-page consistency.
          const existingImgs = book.pages.filter(p => p.img).map(p => p.img).slice(0, 3);
          let styleGuide = book.derivedStyle || (collection && collection.styleGuide) || book.styleGuide || "children's picture book illustration";
          if (!book.derivedStyle && existingImgs.length) {
            push("amora", "Looking at your existing pages to lock in the visual style…");
            const derived = await deriveStyleFromImages(existingImgs);
            if (derived) { styleGuide = derived; setBook(b => ({ ...b, derivedStyle: derived })); }
          }

          push("amora", "On it — building that image now…");

          // Step 1: Ask Amora ONLY for the scene description.
          // Model is always Flux (seed-locked for consistency). We inject the full
          // character manifest ourselves so nothing drifts from page to page.
          const sceneRaw = await amora(
            `The author wants to generate a picture-book illustration.\n\nCharacter Bible (already locked into the image — do NOT re-describe, just use names):\n${charManifest}\n\nRequest: "${text}"\n\nReturn ONLY JSON:\n{"scene":"A 2-3 sentence description of ONLY the scene action, setting, camera angle, lighting, and mood for this specific page. Do NOT re-describe characters — their appearance is locked separately. Be specific about what is happening and where."}`,
            AMORA_SYS + " STRUCTURED MODE: output valid JSON only.", 400
          );

          let sceneMeta = { scene: text };
          try { sceneMeta = parseLoose(sceneRaw); } catch (_) { /* use defaults */ }

          // Step 2: Build the locked consistency manifest client-side — always injected, never recalled from memory
          const charManifest = activeChars.length
            ? activeChars.map((c) => `— ${c.name}: ${c.desc}`).join("\n")
            : "(no named characters — environment/setting only)";

          const pageNum = book.pages.length + 1;
          // Derive a page number style that fits the book's visual aesthetic
          const pgNumStyle = (() => {
            const sg = styleGuide.toLowerCase();
            if (sg.includes("watercolour") || sg.includes("watercolor") || sg.includes("painted")) return "a small handwritten-style numeral in the bottom corner, in the book's ink colour, matching the painterly aesthetic";
            if (sg.includes("ink") || sg.includes("pen") || sg.includes("sketch")) return "a small inked numeral in the bottom corner, matching the line-art style of the book";
            if (sg.includes("flat") || sg.includes("vector") || sg.includes("minimal")) return "a small clean sans-serif numeral in the bottom corner, in a muted tone from the book's palette";
            if (sg.includes("vintage") || sg.includes("retro") || sg.includes("classic")) return "a small vintage-style numeral in the bottom corner, in a warm sepia or aged tone";
            if (sg.includes("collage") || sg.includes("mixed media")) return "a small hand-stamped or collaged numeral in the bottom corner";
            if (sg.includes("digital") || sg.includes("bright") || sg.includes("bold")) return "a small bold rounded numeral in the bottom corner, in a complementary colour from the palette";
            return "a small, gentle numeral in the bottom corner styled to match the book's art medium and colour palette";
          })();
          const lockedPrompt = [
            `STYLE (locked, must not change between pages): ${styleGuide}`,
            ``,
            `CHARACTERS (locked, exact appearance must be identical on every page):`,
            charManifest,
            ``,
            `SCENE (this page only): ${sceneMeta.scene || text}`,
            ``,
            `PAGE NUMBER: In the bottom corner of this illustration, include the numeral ${pageNum} as ${pgNumStyle}. The number should feel like a natural part of the illustration, not a label imposed on top.`,
            ``,
            `CONSISTENCY RULES: Every character must appear exactly as described above — same face, hair, skin tone, clothing, props. Same colour palette as the style guide. Same art medium and rendering style throughout. This is page ${pageNum} of a series; visual consistency with all other pages is essential.`,
          ].join("\n");

          // Negative prompt — what must never change or appear
          const negativePrompt = [
            "photo realistic", "3d render", "different clothing", "different hair", "different skin tone",
            "inconsistent character", "style change", "different art style", "cartoon", "anime",
            "changed proportions", "adult content", "violence", "scary imagery",
          ].join(", ");

          const imgRes = await fetch("/api/image", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: lockedPrompt, seed, negative_prompt: negativePrompt }),
          });
          const imgData = await imgRes.json();
          if (imgData.error) {
            push("amora", `I couldn't generate that image just now — ${imgData.error}. Check that FAL_API_KEY or OPENAI_API_KEY is set in your Vercel environment variables.`);
          } else {
            setMsgs((m) => [...m, { role: "amora", text: "Here it is ❖ Click “Add to book” to place it on a page.", imgUrl: imgData.url, model: imgData.model }]);
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

        } else {
          const collContext = collection ? `\nCharacter collection: "${collection.name}". Style: ${collection.styleGuide}.` : "";
          const charBible = book.characters.length
            ? `\n\nCharacter Bible:\n${book.characters.map((c) => `— ${c.name}: ${c.desc}`).join("\n")}`
            : "";
          const reply = await amora(
            `You are guiding the author through building a children's picture book, step by step. Current book title: "${book.title}". Existing characters: ${book.characters.map((c) => c.name).join(", ") || "none yet"}. Pages so far: ${book.pages.length}.${collContext}${charBible}\n\nConversation:\n${convo}\n\nRespond as Amora with ONE warm, short next step or question. Move the book forward gently — help shape the idea, suggest a title when ready, develop characters, or offer to draft or generate pages. You CAN generate illustration images — just tell the author to say something like "generate page 3 showing [scene]". Don't dump the whole book at once. End by inviting her next bit. Plain text only.`
          );
          push("amora", reply);
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
        pages: uploads.map((u, i) => ({ id: newId(), text: byN[i + 1] || (analyses[i] && analyses[i].text) || "", img: u.dataUrl })),
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
function BookEditor({ book, setBook, onBack, onSignOut, onAmora, savedFlash }) {
  const [tab, setTab] = useState("pages");
  const [report, setReport] = useState(null);
  const [checking, setChecking] = useState(false);
  const [chatPage, setChatPage] = useState(null);
  const drag = useRef(null);

  const setPage = (id, patch) => setBook((b) => ({ ...b, pages: b.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const addPage = () => setBook((b) => ({ ...b, pages: [...b.pages, { id: newId(), text: "", img: "" }] }));
  const removePage = (id) => setBook((b) => ({ ...b, pages: b.pages.filter((p) => p.id !== id) }));
  const setChar = (i, patch) => setBook((b) => ({ ...b, characters: b.characters.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));
  const addChar = () => setBook((b) => ({ ...b, characters: [...b.characters, { name: "New character", desc: "" }] }));
  const removeChar = (i) => setBook((b) => ({ ...b, characters: b.characters.filter((_, j) => j !== i) }));

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
        </div>

        {tab === "pages" ? (
          <div className="ed-grid">
            <div>
              <p className="fine" style={{ marginTop: 0 }}>Drag pages by the handle to reorder. Tap “Amora” on any page for a tiny chat about just that page.</p>
              {book.pages.map((p, i) => (
                <div key={p.id} className="ed-page" draggable
                  onDragStart={() => (drag.current = p.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(p.id)}>
                  <div className="ed-page-head">
                    <span className="drag-handle" title="Drag to reorder">⠿ Page {i + 1}</span>
                    <span>
                      <button className="mini-amora" onClick={() => setChatPage(p)}><MoonMark size={12} /> Amora</button>
                      {book.pages.length > 1 ? <button className="btn-text soft" onClick={() => removePage(p.id)}>remove</button> : null}
                    </span>
                  </div>
                  {p.img ? <img src={p.img} alt={"Page " + (i + 1)} className="ed-page-img" /> : null}
                  <textarea rows={2} value={p.text} onChange={(e) => setPage(p.id, { text: e.target.value })} placeholder="Write this page, or build it with Amora." />
                </div>
              ))}
              <button className="btn-line dark" onClick={addPage}>+ Add a blank page</button>
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
            <p className="fine" style={{ marginTop: 0 }}>This is your Character Bible — the locked descriptions that keep everyone looking and feeling the same on every page. The consistency check measures the whole book against it, and you can start a brand-new book reusing these exact characters from your book list.</p>
            {book.characters.map((c, i) => (
              <div key={i} className="char-row">
                <input className="char-name" value={c.name} onChange={(e) => setChar(i, { name: e.target.value })} />
                <textarea rows={3} value={c.desc} onChange={(e) => setChar(i, { desc: e.target.value })} placeholder="Appearance, clothing, props, personality — everything that must stay the same." />
                <button className="btn-text soft" onClick={() => removeChar(i)}>remove</button>
              </div>
            ))}
            <button className="btn-line dark" onClick={addChar}>+ Add a character</button>
          </div>
        )}
      </div>

      {chatPage ? <PageChat book={book} page={chatPage} onClose={() => setChatPage(null)} onApply={(text) => { setPage(chatPage.id, { text }); }} /> : null}
    </section>
  );
}

/* ---------------- Tiny per-page Amora chat ---------------- */
function PageChat({ book, page, onClose, onApply }) {
  const idx = book.pages.findIndex((p) => p.id === page.id);
  const [msgs, setMsgs] = useState([{ role: "amora", text: `Let's polish page ${idx + 1} together. Want it softer, shorter, more magical, or truer to a character? Tell me — or ask me to rewrite it and I'll suggest a version you can accept.` }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const scroller = useRef(null);
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);

  const send = async () => {
    const text = input.trim(); if (!text || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]); setInput(""); setBusy(true);
    try {
      const chars = book.characters.map((c) => `${c.name}: ${c.desc}`).join("\n");
      const reply = await amora(
        `Character Bible:\n${chars}\n\nThe current text of page ${idx + 1} is:\n"${page.text}"\n\nKirby says: "${text}"\n\nHelp with JUST this page. If you're suggesting new page text, put the exact suggested text on its own final line prefixed with PAGE: — under 40 words, consistent with the Character Bible. Otherwise just answer warmly. Keep it short.`
      );
      const m = reply.match(/PAGE:\s*([\s\S]+)$/);
      if (m) { setDraft(m[1].trim().replace(/^"|"$/g, "")); setMsgs((x) => [...x, { role: "amora", text: reply.replace(/PAGE:[\s\S]+$/, "").trim() || "Here's a version to consider:" }]); }
      else setMsgs((x) => [...x, { role: "amora", text: reply }]);
    } catch (e) { setMsgs((x) => [...x, { role: "amora", text: "I slipped just now — try once more?" }]); }
    setBusy(false);
  };

  return (
    <div className="pagechat-overlay" onClick={onClose}>
      <div className="pagechat" onClick={(e) => e.stopPropagation()}>
        <div className="pc-head"><span><MoonMark size={16} color="#FFF9F0" /> Amora · page {idx + 1}</span><button onClick={onClose}>Done</button></div>
        <div className="pc-scroll" ref={scroller}>
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
    </div>
  );
}

/* ============================================================
   APP SHELL
   ============================================================ */
export default function App() {
  const [route, setRoute] = useState({ page: "home", id: null });
  const [account, setAccount] = useState(null);
  const [order, setOrder] = useState(null);
  const [cart, setCart] = useState([]);      // { cartId, type, id, title, price, authorName, grad, motif }
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

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
  const completeOrder = (items, gifts, total) => {
    setOrder({ items, gifts, total });
    clearCart();
    go("thanks");
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
      <StoreLanding go={go} books={BOOKS} /><ShopMerchSection go={go} />
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
  else if (route.page === "cart") page = <CartPage cart={cart} removeFromCart={removeFromCart} go={go} onCheckout={completeOrder} />;
  else if (route.page === "checkout") page = <CartPage cart={cart} removeFromCart={removeFromCart} go={go} onCheckout={completeOrder} />;
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
    if (!account) page = <SignInPage onSignIn={(a) => setAccount(a)} />;
    else if (account?.isKirby) page = <KirbyStudio go={go} onSignOut={() => { setAccount(null); go("home"); }} />;
    else page = <DashboardPage go={go} author={account} onSignOut={() => { setAccount(null); go("home"); }} />;
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
          <button className={"nav-link signin" + (route.page === "signin" ? " on" : "")} onClick={() => go("signin")}>
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
.cover { aspect-ratio: 1 / 1.28; border-radius: 10px; padding: 22px 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; overflow: hidden; box-shadow: 0 10px 26px rgba(19,26,48,.22); transition: transform .2s ease, box-shadow .2s ease; }
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
.coll-card-head { display: flex; justify-content: space-between; align-items: center; }
.coll-card-head strong { font-family: var(--display); font-size: 15px; }
.coll-style { opacity: 0.7; font-style: italic; }
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
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

${STORE_CSS}
`;
