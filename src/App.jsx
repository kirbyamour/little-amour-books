import React, { useState, useEffect, useRef } from "react";
import AdminDashboard from "./AdminDashboard";

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
const BOOKS = [
  {
    id: "papers", title: "Mama Has Papers Today", author: "kirby", authorName: "Kirby Amour",
    age: "Ages 3–6", price: 14.99, motif: "moon", grad: ["#2A2150", "#4A3B6E"], status: "available",
    tagline: "A gentle story about big changes, brave hearts, and finding safety.",
    adult: "Family court. Legal paperwork spread across the kitchen table. A mother carrying custody stress while her child quietly watches — and wonders if the worry is somehow their fault.",
    child: "Little One sees Mama's serious papers and worries they did something wrong. With help from Mama and Moon Bear, Little One learns that grown-up papers are not theirs to carry — and love is still for them.",
    helps: ["Family court & custody", "A parent under legal stress", "\u201CIs it my fault?\u201D worries", "Repair after a tense day"],
    note: "Read it together on paper days. Let your child point to Moon Bear. The book does the explaining so you don't have to find the words alone.",
  },
  {
    id: "bluebag", title: "The Night We Packed the Blue Bag", author: "mara", authorName: "Mara Voss",
    age: "Ages 4–7", price: 14.99, motif: "bag", grad: ["#1E3A52", "#3E6B7E"], status: "coming",
    tagline: "A story about leaving bravely, and arriving somewhere soft.",
    adult: "Leaving an unsafe home. Relocation, shelters, staying with family — the night a mother decides that somewhere else is safer, and a child needs the move to feel like courage, not catastrophe.",
    child: "One night, Mama says it's time for a brave adventure. They pack the blue bag with the most important things — and discover that home isn't a place you leave. It's something you carry, together.",
    helps: ["Leaving & relocation", "Shelter or transitional housing", "New rooms, new schools", "Feeling safe in a new place"],
    note: "Pack a small 'brave bag' with your child after reading. Choosing what comes along returns a feeling of control to little hands.",
  },
  {
    id: "brave", title: "Brave Is a Quiet Thing", author: "june", authorName: "June Ellery",
    age: "Ages 3–6", price: 13.99, motif: "lantern", grad: ["#4A2E3E", "#7A4E5C"], status: "coming",
    tagline: "A small lantern, a big feeling, and the truth about courage.",
    adult: "Anxiety after upheaval. Children who go quiet, cling harder, or startle easily after a hard season — and parents who want to honor the fear without feeding it.",
    child: "Pip thinks brave means being loud and big and never scared. But holding Mama's hand, trying again, and whispering 'I'm here' to a worried friend turn out to be the bravest things of all.",
    helps: ["Worry & big feelings", "After a hard season", "Quiet or clingy phases", "Naming feelings gently"],
    note: "Ask 'what was your quiet-brave today?' at bedtime. It builds a vocabulary for courage that fits in small pockets.",
  },
];

const AUTHORS = {
  kirby: {
    id: "kirby", name: "Kirby Amour", grad: ["#4A3B6E", "#8A6A8E"],
    look: { skin: "#C68863", hair: "#352523", top: "#5A4570", style: "waves" },
    tagline: "Survivor mama, storyteller, and founder of Little Amour Books.",
    intro: "Kirby creates gentle children's books for families navigating hard things — family court, big changes, fear, and rebuilding — with the belief that children deserve stories that tell the truth gently.",
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
function Motif({ kind, size }) {
  if (kind === "bag") return <Bag size={size} />;
  if (kind === "lantern") return <Lantern size={size} />;
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
            We publish gentle stories about hard things — family court, leaving, fear,
            starting over — written by mothers who lived them. <strong>80% of every sale
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
              <p className="pull">So we built a press that pays survivors to tell the truth gently.</p>
            </div>
          </Reveal>
          <Reveal delay={150}><KitchenScene /></Reveal>
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
                <p>A warm, age-true story with no graphic detail and no adult weight — just gentle language, a comfort friend, and an ending that lands on safety, every single time.</p>
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
            <div className="split-bar" role="img" aria-label="80 percent to the author, 20 percent to the press">
              <div className="split-a">80% <span>to the author</span></div>
              <div className="split-b">20% <span>to the press</span></div>
            </div>
            <p className="lead light center-text">
              Author earnings have funded legal fees, first months' rent, and the quiet
              luxury of one less terrifying bill. The press's share keeps the studio,
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
              your privacy, your voice, and 80% of every sale.
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

function BookPage({ book, go, toast }) {
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
            <h3 className="bd-h">A gentle note for caregivers</h3>
            <p className="caregiver">{book.note}</p>
            <div className="buy-row">
              {coming ? (
                <button className="btn-gold" onClick={() => toast("This book is in the studio now. In production this joins a notify-me list — we'll let you know the moment it launches.")}>
                  Notify me when it launches
                </button>
              ) : (
                <>
                  <button className="btn-gold" onClick={() => go("checkout", book.id)}>
                    Buy the book — ${book.price.toFixed(2)}
                  </button>
                  <button className="btn-line dark" onClick={() => toast("In production this links to the book's live Amazon listing, published under the Little Amour imprint.")}>
                    Buy on Amazon
                  </button>
                </>
              )}
            </div>
            <p className="fine">80% of every direct sale goes to {book.authorName}. Created in our AI book studio with her story at the center, and reviewed for emotional safety before publication.</p>
          </div>
        </div>
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

function ThanksPage({ order, go }) {
  if (!order) return null;
  const author = AUTHORS[order.book.author];
  const authorBook = order.book.price * 0.8;
  const press = order.book.price * 0.2;
  const gifts = order.total - order.book.price;
  return (
    <section className="dusk page-top tall">
      <div className="wrap narrow center">
        <Moon size={44} />
        <h2 className="light">Thank you. Here's what just happened.</h2>
        <div className="thanks-card">
          <p><span>To {author.name} (80% of the book)</span><span>${authorBook.toFixed(2)}</span></p>
          {gifts > 0 ? <p><span>Your gifts to {author.name.split(" ")[0]} (100%)</span><span>${gifts.toFixed(2)}</span></p> : null}
          <p><span>To the press — keeps the studio free for every author</span><span>${press.toFixed(2)}</span></p>
          <p className="t-total"><span>A child gets braver words</span><span>priceless</span></p>
        </div>
        <p className="lead light center-text">
          {order.book.title} will be on its way once payments are live. You didn't just buy
          a book — you helped a mother rebuild, in her own words.
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
          keep: 80% of every sale.
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

function WritePage({ go }) {
  const steps = [
    { t: "Apply", d: "A short, gentle application. No proof of anything is required — your word is enough, and your story is yours to share at whatever depth you choose." },
    { t: "Be welcomed", d: "A real conversation about your idea, your goals, and your privacy. Pen names from day one if you want one." },
    { t: "Create in the AI studio", d: "You bring the lived wisdom; our AI studio brings the skill. It drafts pages with you, illustrates them in the style you choose, and keeps your exact words whenever you want them kept. You don't need to know how to write or draw — truly." },
    { t: "Editorial care & review", d: "Every book is read closely before publication — for emotional safety for young readers, and to make your story shine. You'll receive warm, specific feedback in your studio dashboard, and nothing is published without your approval and ours." },
    { t: "Published to Amazon", d: "We format your book, finalize the files, and publish it on Amazon under the Little Amour imprint through our publisher account — paperback and Kindle. You approve everything first." },
    { t: "Earn while you rebuild", d: "80% of direct sales and 80% of net Amazon royalties are yours, plus 100% of reader gifts, paid on a regular schedule with a clear statement." },
  ];
  return (
    <div>
      <section className="dusk page-top">
        <div className="wrap narrow">
          <p className="eyebrow rose">For survivor mothers</p>
          <h2 className="light">From your kitchen table<br />to a published book.</h2>
          <p className="lead light">
            You don't need savings, a portfolio, or publishing experience. You need a story
            only you could tell — our AI studio and our editors carry the rest.
          </p>
        </div>
      </section>
      <section className="morning">
        <div className="wrap narrow">
          <ol className="journey">
            {steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 60}>
                <li>
                  <span className="j-num">{i + 1}</span>
                  <div><h3>{s.t}</h3><p>{s.d}</p></div>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal>
            <div className="feedback-demo">
              <p className="eyebrow plum">What feedback looks like in your dashboard</p>
              <div className="fb-card">
                <p className="fb-meta">Editorial note · <em>The Night We Packed the Blue Bag</em>, page 4 · <span className="fb-tag">suggestion</span></p>
                <p>"This page is beautiful. One thought: 'we had to go fast' might land as urgency for a sensitive reader. Could the bag itself carry the pace — 'the blue bag was ready before the kettle whistled'? Your call entirely; the page works as written."</p>
              </div>
              <div className="fb-card">
                <p className="fb-meta">Safety review · final pass · <span className="fb-tag ok">approved</span></p>
                <p>"Every page lands on reassurance. The child is never blamed, never burdened, and the ending is unmistakably safe. Approved for publication — congratulations, Mara."</p>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="honesty">
              <h3>A few honest answers</h3>
              <p><strong>Do I need to be a writer or artist?</strong> No. Our in-house AI studio drafts, illustrates, and designs with you. Your job is the story and the final say.</p>
              <p><strong>Who publishes the book?</strong> Amazon doesn't allow automated third-party publishing, so we publish for you under the Little Amour imprint through our KDP account. You approve the final files, the price, and the listing before anything goes live.</p>
              <p><strong>What does it cost me?</strong> Nothing. The studio, editing, design, and publishing are covered by the press's 20% share.</p>
              <p><strong>Do I have to share my trauma?</strong> No. We will never ask for court papers, proof, or graphic details.</p>
              <p><strong>Is this therapy or legal help?</strong> No — we are a press. We can cheer while your royalties pay the lawyer, but we aren't one.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="center" style={{ padding: "28px 0 6px" }}>
              <button className="btn-gold" onClick={() => go("apply")}>Apply to write with us</button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ApplyPage() {
  const [form, setForm] = useState({
    name: "", email: "", pen: "", stage: "Just an idea",
    issue: "", feeling: "", avoid: "",
    instagram: "", tiktok: "", facebook: "",
    consent: false,
  });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.issue.trim()) {
      setErr("Your name, email, and the story idea help us welcome you — the rest is optional.");
      return;
    }
    if (!form.consent) { setErr("Please confirm the review checkbox so we know we're on the same page."); return; }
    setErr("");
    try {
      let list = [];
      try {
        const r = await window.storage.get("lab:applications");
        if (r && r.value) list = JSON.parse(r.value);
      } catch (e) { /* first application */ }
      list.push({ ...form, at: new Date().toISOString() });
      await window.storage.set("lab:applications", JSON.stringify(list));
    } catch (e) { /* non-fatal */ }
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
            out, and there's no rush on our side or yours.
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
        <h2>Tell us a little. Only what you want.</h2>
        <p className="lead">
          No proof. No court papers. No graphic details — please don't relive anything for
          this form. We're asking about the book you want to make, not the things you survived.
        </p>
        <div className="form">
          <label><span>Your name *</span><input value={form.name} onChange={set("name")} autoComplete="name" /></label>
          <label><span>Email *</span><input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></label>
          <label><span>Pen name, if you'd like one (changeable anytime)</span><input value={form.pen} onChange={set("pen")} /></label>
          <label><span>Where is your book right now?</span>
            <select value={form.stage} onChange={set("stage")}>
              <option>Just an idea</option><option>Some notes or an outline</option>
              <option>A rough manuscript</option><option>A finished manuscript</option>
            </select>
          </label>
          <label><span>What hard thing does your story gently speak to? *</span>
            <textarea rows={3} value={form.issue} onChange={set("issue")} placeholder="e.g., a child sensing family court stress; moving somewhere safe; big feelings after a hard season" />
          </label>
          <label><span>When a child finishes your book, what should they feel?</span>
            <textarea rows={2} value={form.feeling} onChange={set("feeling")} placeholder="e.g., safe, not at fault, still loved" />
          </label>
          <label><span>Anything you want us to avoid or be careful with?</span>
            <textarea rows={2} value={form.avoid} onChange={set("avoid")} />
          </label>
          <fieldset className="social-set">
            <legend>Your social media — optional, private to our team. It simply helps us hear your voice.</legend>
            <label><span>Instagram</span><input value={form.instagram} onChange={set("instagram")} placeholder="@yourname" /></label>
            <label><span>TikTok</span><input value={form.tiktok} onChange={set("tiktok")} placeholder="@yourname" /></label>
            <label><span>Facebook or other</span><input value={form.facebook} onChange={set("facebook")} placeholder="link or name" /></label>
          </fieldset>
          <label className="check">
            <input type="checkbox" checked={form.consent} onChange={set("consent")} />
            <span>I understand every book is lovingly reviewed for emotional safety before it can be published or sold, and nothing is ever published without my approval.</span>
          </label>
          {err ? <p className="form-err">{err}</p> : null}
          <button className="btn-gold" onClick={submit}>Send my application</button>
          <p className="fine">Your application and social links are private to our team. Applying creates no obligation on either side.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Sign in + author dashboard ---------------- */
const ACCOUNTS = {
  "hi@kirbyamour.com": { pw: "love", id: "kirby", name: "Kirby Amour" },
};

function SignInPage({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const tryIn = () => {
    const acct = ACCOUNTS[email.trim().toLowerCase()];
    if (acct && acct.pw === pw) { setErr(""); onSignIn(acct.id); }
    else setErr("We don't recognize that email and password together. Try again — or tour the demo studio below.");
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
          <button className="btn-gold" onClick={tryIn}>Sign in</button>
          <button className="btn-line" onClick={() => onSignIn("mara")}>Tour the demo studio as Mara</button>
          <p className="fine light-fine">Prototype sign-in: credentials are checked in the page itself, which is fine for trying the studio but not for real accounts — secure authentication arrives at deployment.</p>
        </div>
      </div>
    </section>
  );
}

const DASH_SEED = {
  author: "Mara Voss",
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

function DashboardPage({ go, onSignOut }) {
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
            <h2>Good morning, {DASH_SEED.author.split(" ")[0]}.</h2>
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
            <p className="fine">You keep 80% of every sale and 80% of net Amazon royalties. Statements itemize every book, every month.</p>
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
        { name: "Mama", desc: "Warm, tired-but-steady mother; dark hair loosely tied back; soft mustard cardigan and a small gold locket. Always gentle toward Little One." },
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
        { name: "Mama", desc: "Warm, tired-but-steady mother; dark hair loosely tied back; soft mustard cardigan and a small gold locket. Always gentle toward Little One." },
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
  const [view, setView] = useState("list"); // list | build | edit
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
              <p className="fine">You keep 80% of every sale and 80% of net Amazon royalties, plus all reader gifts.</p>
            </div>
          </div>
        </div>
      </section>
    );
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
    { role: "amora", text: "Hi Kirby — I'm Amora. Let's make this book together, one gentle step at a time.\n\nTell me what you have so far. It can be anything: just a feeling or an idea, a hard thing you want a child to understand, some page text you've already written, or even images you'd like to use. Where would you like to begin?" },
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

          const lockedPrompt = [
            `STYLE (locked, must not change between pages): ${styleGuide}`,
            ``,
            `CHARACTERS (locked, exact appearance must be identical on every page):`,
            charManifest,
            ``,
            `SCENE (this page only): ${sceneMeta.scene || text}`,
            ``,
            `CONSISTENCY RULES: Every character must appear exactly as described above — same face, hair, skin tone, clothing, props. Same colour palette as the style guide. Same art medium and rendering style throughout. This is page ${book.pages.length + 1} of a series; visual consistency with all other pages is essential.`,
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
        `From this conversation with Kirby, build a gentle children's picture book.\n\n${convo}\n\nReturn ONLY JSON, no markdown:\n{"title":"a fitting gentle title","characters":[{"name":"","desc":"vivid, consistent visual + emotional description for illustration consistency"}],"pages":[{"text":"page text, under 40 words, true to her idea and voice"}]}\nMake AT LEAST 24 pages (Amazon KDP requires a 24-page minimum for paperback picture books) — aim for 24 to 32. Pace the story gently across that many spreads; it is fine for some pages to be a single quiet line. Arc must move toward reassurance and safety. Preserve any exact page text Kirby gave; otherwise write in her spirit.`,
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
        `Run a whole-book consistency and sense check on this children's picture book. The author's biggest worry is characters drifting or details contradicting between pages.\n\nCHARACTER BIBLE:\n${chars}\n\nPAGES:\n${pages}\n\nReturn ONLY JSON:\n{"verdict":"one warm sentence: does the book hold together?","issues":[{"type":"character|continuity|tone|arc|safety|length","where":"page number or 'overall'","note":"specific problem","fix":"concrete gentle suggestion"}],"praise":"one true thing done well"}\nFlag character drift (appearance, clothing, props, names changing), continuity slips, tone breaks too scary for a child, arc gaps (no reassurance/safe ending), and safety concerns. IMPORTANT: Amazon KDP requires a minimum of 24 pages for paperback picture books. This book currently has ${book.pages.length} page(s). If it has fewer than 24 pages, you MUST include a "length" issue noting how many more pages are needed and gently suggesting where the story could breathe into more spreads. If the book is consistent and long enough, return an empty issues array. Never invent problems.`,
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
  const [msgs, setMsgs] = useState([{ role: "amora", text: `Let's polish page ${idx + 1} together. Want it gentler, shorter, more magical, or truer to a character? Tell me — or ask me to rewrite it and I'll suggest a version you can accept.` }]);
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
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  const go = (page, id = null) => {
    setRoute({ page, id });
    window.scrollTo(0, 0);
  };
  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 5200);
  };
  const completeOrder = (book, gifts, total) => {
    setOrder({ book, gifts, total });
    go("thanks");
  };

  let page = null;
  if (route.page === "home") page = <HomePage go={go} />;
  else if (route.page === "books") page = <BooksPage go={go} />;
  else if (route.page === "book") page = <BookPage book={BOOKS.find((b) => b.id === route.id) || BOOKS[0]} go={go} toast={toast} />;
  else if (route.page === "checkout") page = <CheckoutPage book={BOOKS.find((b) => b.id === route.id) || BOOKS[0]} go={go} onComplete={completeOrder} />;
  else if (route.page === "thanks") page = <ThanksPage order={order} go={go} />;
  else if (route.page === "authors") page = <AuthorsPage go={go} />;
  else if (route.page === "author") page = <AuthorPage author={AUTHORS[route.id] || AUTHORS.kirby} go={go} toast={toast} />;
  else if (route.page === "write") page = <WritePage go={go} />;
  else if (route.page === "apply") page = <ApplyPage />;
  else if (route.page === "admin") return <AdminDashboard onBack={() => go("home")} />;
  else if (route.page === "signin") {
    if (!account) page = <SignInPage onSignIn={(a) => setAccount(a)} />;
    else if (account === "kirby") page = <KirbyStudio go={go} onSignOut={() => { setAccount(null); go("home"); }} />;
    else page = <DashboardPage go={go} onSignOut={() => { setAccount(null); go("home"); }} />;
  }

  const NAV = [
    ["home", "Home"], ["books", "Books"], ["authors", "Authors"],
    ["write", "Write with us"], ["apply", "Apply"],
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
          <button className={"nav-link signin" + (route.page === "signin" ? " on" : "")} onClick={() => go("signin")}>
            {account ? "My studio" : "Sign in"}
          </button>
        </div>
      </nav>
      {page}
      <footer className="foot">
        <div className="wrap foot-grid">
          <div>
            <p className="brand-foot"><MoonMark size={20} /> Little Amour Books</p>
            <p className="foot-line">Truth told gently. Healing made beautiful.</p>
          </div>
          <p className="foot-small">
            Little Amour Books is a press — creative and publishing support for survivor
            mothers. We are not therapy, legal advice, or crisis support. 80% of every sale
            goes to the author. Books are published to Amazon under the Little Amour imprint
            with the author's approval.
          </p>
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
`;
