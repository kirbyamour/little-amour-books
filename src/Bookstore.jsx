import { supabase } from "./supabaseClient";
import React, { useState } from "react";

/* ============================================================
   LITTLE AMOUR BOOKS — Public Bookstore
   Landing · Shop · Packs · Pack Detail
   ============================================================ */

const P = {
  night: "#131A30", nightDeep: "#0D1226", dusk: "#33304F", mauve: "#6E5572",
  rose: "#E5AC9F", roseSoft: "#F2CFC5", gold: "#E2A857", goldDeep: "#C68B3C",
  paper: "#FAF4EB", paperWarm: "#F4EADC", ink: "#2B2433", inkSoft: "#5E5468",
  cream: "#FFF9F0", sage: "#6A8F7A", sageSoft: "#EAF0EB",
};

// Real per-book cover data, saved in an author's Publishing studio
// (studio_data → book.publishing.cover) and pulled in here by App() on mount. Stores the
// whole cover record (image + title/subtitle/author/series/age-badge/logo flags), not just
// the bare image URL — see ComposedCover below for why. Shared by plain object reference
// (not React state) so both the public shop's MiniCover and the book-detail page's Cover
// can show it, without prop-drilling through every page that reads the module-level BOOKS
// constant directly.
export const coverImageMap = {};

// Every public age-range display (book tiles, shop cards, book detail page) used to read
// book.age straight off the static placeholder BOOKS/PLACEHOLDER_BOOKS array — a hardcoded
// string that has zero connection to the "Age Range" field an author actually edits in
// Publishing's Cover Builder. Changing it there (e.g. to "Ages 3-10") silently did nothing
// on the live site because nothing ever read it. coverImageMap already carries the real
// ageRange (see App.jsx's cover-fetch effect), so this just prefers that when it exists.
export function displayAge(book) {
  const real = coverImageMap[book.id]?.ageRange;
  return real || book.age;
}

// Mirrors Publishing.jsx's CoverBuilder preview (and the print PDF export) exactly, on
// purpose. The raw cover image alone is NEVER the finished cover: the AI-art prompt
// forbids the model from painting any typography, and an uploaded photo is only resized,
// never retouched — title/subtitle/author/age-badge/logo only exist as this overlay,
// composited live. The book's real print trim is also a square (215.9 x 215.9mm), not a
// tall portrait. Before this existed, the public site dropped the bare square image into
// a portrait-shaped frame with no overlay at all, so a real cover showed up cropped to an
// arbitrary slice with no title on it. If the recipe (percentages, scrim opacity, font
// sizes) ever changes in Publishing.jsx, change it here too — that drift is exactly what
// caused this bug the first time.
export function ComposedCover({ cover, fallbackTitle, fallbackAuthor, tiny }) {
  if (!cover || !cover.url) return null;
  const alt = "Cover of " + (cover.title || fallbackTitle || "book");
  if (tiny) {
    return <img src={cover.url} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "inherit" }} />;
  }
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", containerType: "inline-size" }}>
      <img src={cover.url} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "27%", height: "42%", background: "rgba(10,8,22,0.88)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: (34 / 215.9 * 100) + "%", background: "rgba(10,8,22,0.88)" }} />
      {cover.series && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "30%", textAlign: "center", color: "#c4a8d1", fontWeight: 700, fontSize: "5cqw", letterSpacing: 1 }}>
          {cover.series.toUpperCase()}
        </div>
      )}
      <div style={{ position: "absolute", left: "8%", right: "8%", top: "38%", textAlign: "center", color: "#FAF4EB", fontWeight: 700, fontSize: "9cqw", fontFamily: "Georgia,serif", lineHeight: 1.15 }}>
        {cover.title || fallbackTitle || "Untitled"}
      </div>
      {cover.subtitle && (
        <div style={{ position: "absolute", left: "10%", right: "10%", top: "48%", textAlign: "center", color: "#e1d6e8", fontStyle: "italic", fontSize: "5.5cqw" }}>
          {cover.subtitle}
        </div>
      )}
      {(cover.authorName || fallbackAuthor) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "56%", textAlign: "center", color: "#FAF4EB", fontSize: "6cqw" }}>
          {cover.authorName || fallbackAuthor}
        </div>
      )}
      {cover.showAgeBadge !== false && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "16%", textAlign: "center", color: "#c4a8d1", fontSize: "4cqw", letterSpacing: 0.5 }}>
          {(cover.ageRange || "Ages 3–6").toUpperCase()}
        </div>
      )}
      {cover.showLogo !== false && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "5%", textAlign: "center", color: "#9b7eb8", fontSize: "4.5cqw" }}>
          Little Amour Books
        </div>
      )}
    </div>
  );
}

/* ---- Motif SVGs (self-contained, so Bookstore works standalone) ---- */
function Moon({ size = 26, color = "#F2CFC5" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.8 3.2a9.5 9.5 0 1 0 4.1 13A8.2 8.2 0 0 1 16.8 3.2z" fill={color} />
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
function Lantern({ size = 30, color = "#E2A857" }) {
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

function Motif({ kind, size = 34, light = false }) {
  const c = light ? "rgba(255,249,240,0.9)" : undefined;
  if (kind === "bag")     return <Bag size={size} color={c || "#F2CFC5"} />;
  if (kind === "lantern") return <Lantern size={size} color={c || "#E2A857"} />;
  if (kind === "heart")   return <Heart size={size} color={c || "#E5AC9F"} />;
  if (kind === "house")   return <House size={size} color={c || "#6A8F7A"} />;
  if (kind === "cloud")   return <CloudIcon size={size} color={c || "#A0B4CC"} />;
  return <Moon size={size} color={c || "#F2CFC5"} />;
}

/* ---- Gradient book cover (used in pack pages and cards) ---- */
function MiniCover({ book, large = false, tiny = false }) {
  const sz = tiny ? "mini-cover-tiny" : large ? "mini-cover-lg" : "mini-cover";
  const motifSize = tiny ? 22 : large ? 48 : 32;
  const realCover = coverImageMap[book.id];
  if (realCover) {
    // ComposedCover replaces the placeholder entirely — it draws the real image plus
    // the same title/author/age-badge overlay the author approved in Publishing.
    return (
      <div className={sz} style={{ padding: 0 }} aria-label={"Cover of " + book.title}>
        {book.status === "coming" && !tiny && <span className="bs-ribbon">Coming soon</span>}
        <ComposedCover cover={realCover} fallbackTitle={book.title} fallbackAuthor={book.authorName} tiny={tiny} />
      </div>
    );
  }
  return (
    <div
      className={sz}
      style={{ background: `linear-gradient(165deg, ${book.grad[0]}, ${book.grad[1]})` }}
      aria-label={"Cover of " + book.title}
    >
      {book.status === "coming" && !tiny && <span className="bs-ribbon">Coming soon</span>}
      <div className="mini-stars" aria-hidden="true">
        <i style={{ top: "12%", left: "18%" }} />
        <i style={{ top: "8%", left: "72%" }} />
        <i style={{ top: "26%", left: "85%" }} />
        <i style={{ top: "20%", left: "45%" }} />
      </div>
      <div className="mini-motif"><Motif kind={book.motif} size={motifSize} light /></div>
      {!tiny && <div className="mini-title">{book.title}</div>}
      {!tiny && <div className="mini-rule" />}
      {!tiny && <div className="mini-author">{book.authorName}</div>}
    </div>
  );
}

/* ---- Theme moments (Shop by Hard Moment) ---- */
const MOMENTS = [
  { key: "court",       label: "Court & Legal Days",      desc: "For the papers, the hearings, and the waiting.",        icon: "⚖️",  bg: "#F0EBF6", text: "#4A3B6E" },
  { key: "safe-home",   label: "Leaving & Safe Homes",    desc: "For the night you left, and the first nights after.",   icon: "🏡",  bg: "#E8F0EB", text: "#3A5E4E" },
  { key: "big-feelings",label: "Big Feelings",            desc: "Worry, anxiety, and feelings bigger than words.",        icon: "💜",  bg: "#F5E8EC", text: "#7A3A50" },
  { key: "two-homes",   label: "Two Homes",               desc: "Split custody, visitation, and loving in two places.",   icon: "🌙",  bg: "#E6EEF5", text: "#2A4A6A" },
  { key: "anxiety",     label: "Worry & Breathing",       desc: "Tools for little bodies that carry too much.",           icon: "☁️",  bg: "#F4EDE8", text: "#5A4030" },
  { key: "quiet-courage",label: "Quiet Courage",          desc: "For children who went still when life got loud.",        icon: "🕯️", bg: "#F5F0E6", text: "#4A3A20" },
  { key: "transitions", label: "Big Changes",             desc: "New homes, new schools, new versions of family.",        icon: "🌱",  bg: "#E8EFE8", text: "#3A4A3A" },
  { key: "promises",    label: "Broken Promises",         desc: "For canceled visits and complicated love.",              icon: "🤍",  bg: "#F3EBF0", text: "#5A3040" },
];

/* ---- Pack data ---- */
export const PACKS = [
  {
    id: "court-pack",
    title: "Court Day Pack",
    subtitle: "For the days with papers, hearings, and waiting.",
    price: 39,
    originalPrice: 44.97,
    bookIds: ["papers", "court", "grownups"],
    themes: ["court"],
    bestFor: "Families navigating custody hearings, legal paperwork, or court days",
    helpsWidth: [
      "Explaining court and legal stress to young children",
      '"Is it my fault?" worries after big adult conversations',
      "Overheard conversations children piece together wrong",
      "Tense days, then repair",
    ],
    bonus: ["Court Day conversation guide (PDF)", "Feelings check-in card set"],
    gentleNote: "These books were written by mothers who have sat in courtrooms, spread papers across kitchen tables, and tried to find words for their children the night before. They know what you're carrying.",
    relatedPackIds: ["survivor-library", "therapist-library"],
    grad: ["#2A2150", "#4A3B6E"],
  },
  {
    id: "safe-home-pack",
    title: "Safe Home Pack",
    subtitle: "For the night you leave, and the first nights somewhere new.",
    price: 39,
    originalPrice: 44.97,
    bookIds: ["bluebag", "sleepover", "littlehouse"],
    themes: ["safe-home"],
    bestFor: "Families transitioning after leaving an unsafe home, entering a shelter, or navigating a move",
    helpsWidth: [
      "Leaving and relocation as an act of bravery",
      "First nights in shelter, transitional housing, or a new place",
      "Grief for a home left behind — even an imperfect one",
      "Building safety and attachment in a new space",
    ],
    bonus: ["Brave Bag packing guide for children (PDF)", "New-home ritual card"],
    gentleNote: "Leaving is one of the bravest things a mother does. These stories help children understand the move as love in action — and find safety not in a place, but in what they carry with them.",
    relatedPackIds: ["survivor-library", "court-pack"],
    grad: ["#2A4A3A", "#4A7A5E"],
  },
  {
    id: "feelings-pack",
    title: "Big Feelings Pack",
    subtitle: "For the worry, the breath, and the courage that lives in small bodies.",
    price: 39,
    originalPrice: 43.97,
    bookIds: ["backpack", "worrycloud", "brave"],
    themes: ["big-feelings", "anxiety"],
    bestFor: "Children experiencing anxiety, big emotions, or dysregulation after family stress",
    helpsWidth: [
      "Naming and externalizing big feelings",
      "Belly breathing and somatic regulation",
      "Quiet courage after fear",
      "Anxiety, worry, and hypervigilance",
    ],
    bonus: ["Feelings face card set (printable)", "Moon Bear belly breathing poster"],
    gentleNote: "Children who have lived through hard things carry their feelings in their bodies — as tummy aches, big reactions, or a quiet that breaks your heart. These stories help give that something a name.",
    relatedPackIds: ["survivor-library", "therapist-library"],
    grad: ["#4A2E3E", "#7A4E5C"],
  },
  {
    id: "two-homes-pack",
    title: "Two Homes Pack",
    subtitle: "For children who love in two places at once.",
    price: 39,
    originalPrice: 43.97,
    bookIds: ["twohomes", "visit", "promise"],
    themes: ["two-homes"],
    bestFor: "Children navigating split custody, visitation, or complicated feelings about a parent",
    helpsWidth: [
      "Split custody and the back-and-forth of visitation",
      "Loving a parent with complicated feelings",
      "Broken promises and self-worth after disappointment",
      "Finding stability when home is two places",
    ],
    bonus: ["Two homes feelings journal pages (printable)", "Re-entry conversation starters"],
    gentleNote: "This pack doesn't pretend two homes are easy. It helps children hold love and disappointment, missing and relief — without ever asking them to choose.",
    relatedPackIds: ["survivor-library", "therapist-library"],
    grad: ["#1E3858", "#3A5878"],
  },
  {
    id: "survivor-library",
    title: "Survivor Mama Starter Library",
    subtitle: "The four books every rebuilding family deserves on the shelf.",
    price: 59,
    originalPrice: 59.96,
    bookIds: ["papers", "bluebag", "brave", "moonbear"],
    themes: ["court", "safe-home", "big-feelings"],
    bestFor: "Any family that has lived through domestic violence, upheaval, or a long hard season and is beginning to rebuild",
    helpsWidth: [
      "Family court and legal stress",
      "Leaving and arriving somewhere safe",
      "Quiet courage and childhood anxiety",
      "Belly breathing and emotional regulation",
    ],
    bonus: ["Caregiver reading guide for all four books", "Family healing ritual card", "Moon Bear breathing poster"],
    gentleNote: "Start here. Four books that together cover the most common hard moments for families rebuilding after difficult seasons. Read them in any order — each one stands alone and works together.",
    relatedPackIds: ["sponsor-library", "therapist-library"],
    grad: ["#1A1530", "#3A2D50"],
    isFeatured: true,
  },
  {
    id: "therapist-library",
    title: "Therapist & Advocate Starter Library",
    subtitle: "A complete trauma-informed picture book shelf for your practice.",
    price: 99,
    originalPrice: 155.88,
    bookIds: ["papers", "bluebag", "brave", "moonbear", "court", "sleepover", "backpack", "worrycloud", "twohomes", "grownups", "quiet", "promise"],
    themes: ["court", "safe-home", "big-feelings", "two-homes"],
    bestFor: "Therapists, social workers, DV advocates, school counselors, and pediatric providers",
    helpsWidth: [
      "Bibliotherapy for trauma-affected children",
      "DV and custody-related stress presentations",
      "Emotional regulation and anxiety in children",
      "Transition, loss, and identity after family upheaval",
    ],
    bonus: [
      "Clinician's guide to all 12 titles",
      "Session integration prompts and discussion questions",
      "Parent handout templates (editable PDF)",
      "Waiting room display cards",
    ],
    gentleNote: "All 12 current Little Amour Books titles, plus the complete clinician's guide. Designed for use in sessions, waiting rooms, and family resource lending libraries. Bulk pricing available for organizations.",
    relatedPackIds: ["sponsor-library", "survivor-library"],
    grad: ["#1A3540", "#3A5A60"],
    isFeatured: true,
  },
  {
    id: "sponsor-library",
    title: "Sponsor a Starter Library",
    subtitle: "Give a family in shelter the books they need to begin healing.",
    price: 59,
    bookIds: ["papers", "bluebag", "brave", "moonbear"],
    themes: ["safe-home"],
    bestFor: "Donors, community organizations, DV shelters, faith communities, and supporters",
    helpsWidth: [
      "Gifting books to families in shelter or transitional housing",
      "Supporting survivor mothers and their children",
      "Community healing and resource donations",
    ],
    bonus: ["Gift card for the recipient family", "Caregiver reading guide", "Handwritten note from Little Amour Books"],
    gentleNote: "Your gift sends the Survivor Mama Starter Library directly to a family in a domestic violence shelter or transitional housing program. Little Amour Books handles delivery and the family receives the books with a personal note.",
    relatedPackIds: ["survivor-library", "therapist-library"],
    grad: ["#3A2028", "#6A4050"],
    isSponsor: true,
    isFeatured: true,
  },
];

/* ---- New placeholder books (to be added to App.jsx BOOKS array) ---- */
export const PLACEHOLDER_BOOKS = [
  {
    id: "sleepover", title: "The Safe House Sleepover",
    author: "kirby", authorName: "Kirby Amour",
    age: "Ages 3–6", price: 14.99,
    motif: "house", grad: ["#2A4A3A", "#4A7A5E"], status: "coming",
    tagline: "A gentle story for the first night somewhere new.",
    theme: "safe-home", themeBadge: "Safe Home",
    adult: "When a family enters shelter, transitional housing, or a relative's home, children carry the strangeness of a new bed in a new place — with no language for what they're feeling.",
    child: "Little Bear finds a new bed in a new place. With Mama close and something familiar at her side, she discovers that safe isn't a place — it's a feeling.",
    helps: ["First night in a new place", "Shelter or transitional housing", "Bedtime reassurance after a move", "Building safety in a new space"],
    note: "Read this the first night anywhere new. Let your child choose where Moon Bear sleeps. Returning control to small hands is its own kind of comfort.",
  },
  {
    id: "backpack", title: "My Feelings Are Bigger Than My Backpack",
    author: "kirby", authorName: "Kirby Amour",
    age: "Ages 4–7", price: 14.99,
    motif: "heart", grad: ["#4A2E3A", "#7A4A5A"], status: "coming",
    tagline: "For the day school is hard because home is hard.",
    theme: "big-feelings", themeBadge: "Big Feelings",
    adult: "Children who have experienced stress at home often bring invisible luggage to school — as meltdowns, withdrawal, or a kind of loaded silence that teachers notice before parents do.",
    child: "Milo brings his backpack to school every day. But today it also holds a worry, a sad, and a mad so big they barely fit. A gentle teacher helps him unpack.",
    helps: ["Emotional dysregulation", "School stress after home stress", "Big reactions and meltdowns", "Naming and externalizing feelings"],
    note: "Ask your child what's in their invisible backpack at pickup. Naming what they're carrying is often the first step to setting it down.",
  },
  {
    id: "moonbear", title: "Moon Bear Teaches Belly Breathing",
    author: "kirby", authorName: "Kirby Amour",
    age: "Ages 3–7", price: 14.99,
    motif: "moon", grad: ["#2A3048", "#4A4870"], status: "coming",
    tagline: "A breathing book that actually works.",
    theme: "big-feelings", themeBadge: "Big Feelings",
    adult: "Anxiety and hypervigilance show up in bodies first. This book gives children a simple, memorable regulation tool they can use anywhere — including in the car on the way to court.",
    child: "Moon Bear's tummy feels tight and fluttery. A wise tree teaches her to breathe in for four, hold for two, out for four — and suddenly the night feels wide enough.",
    helps: ["Belly breathing and somatic regulation", "Anxiety and worry", "Hypervigilance and fear responses", "Regulation before a hard event"],
    note: "Practice Moon Bear breathing together before school, before court, before any hard thing. Regulation is a skill. This book makes it a story they'll remember.",
  },
  {
    id: "court", title: "Mama Has Court Today",
    author: "mara", authorName: "Mara Voss",
    age: "Ages 3–6", price: 14.99,
    motif: "bag", grad: ["#1E3050", "#3A5878"], status: "coming",
    tagline: "A gentle story for court mornings.",
    theme: "court", themeBadge: "Court & Legal",
    adult: "Court days have their own texture — the careful clothes, the tight jaw, the early leaving. Children absorb all of it. They often wonder if they caused it.",
    child: "Mama wears her court dress today. It means a long day and a lot of waiting. But at the end, Mama comes home — and dinner is still dinner.",
    helps: ["Court and custody hearings", "Children absorbing adult stress", "Waiting and uncertainty", "Repair after a long hard day"],
    note: "Read this the night before. It won't answer their questions — but it tells them the feeling they're noticing has a name, and that you'll come home.",
  },
  {
    id: "littlehouse", title: "The Little House That Held Us",
    author: "mara", authorName: "Mara Voss",
    age: "Ages 4–7", price: 14.99,
    motif: "house", grad: ["#1E4040", "#3A6A6A"], status: "coming",
    tagline: "A love letter to the home that kept you safe.",
    theme: "safe-home", themeBadge: "Safe Home",
    adult: "After relocation, children sometimes grieve the place they left — even if it wasn't safe. This book honors the complicated love for a home they had to leave.",
    child: "The old house wasn't perfect. But it held a lot of important things — yellow curtains, a squeaky step, the smell of Sunday morning. Sometimes you can love a place and still need to leave it.",
    helps: ["Grief after moving", "Complicated feelings about a former home", "Building attachment to a new space", "Loss and memory in childhood"],
    note: "Invite your child to draw the old house and the new house side by side. Both can exist in memory. Both are allowed to be loved.",
  },
  {
    id: "worrycloud", title: "The Worry Cloud",
    author: "mara", authorName: "Mara Voss",
    age: "Ages 4–8", price: 14.99,
    motif: "cloud", grad: ["#2A3858", "#4A5E80"], status: "coming",
    tagline: "For the child who carries worry like weather.",
    theme: "big-feelings", themeBadge: "Big Feelings",
    adult: "Some children develop a persistent low-grade anxiety that follows them everywhere. This book helps name it — without making it bigger than it needs to be.",
    child: "Sam has a Worry Cloud that follows her. It's not always big — sometimes it's tiny and almost friendly. Learning to notice the cloud without feeding it makes it lighter.",
    helps: ["Generalized anxiety in children", "Persistent worry", "Mindfulness and noticing", "Externalizing and naming anxiety"],
    note: "After reading, draw Sam's cloud together. Naming a worry outside the body gives children a sense of agency. The cloud is not them — it's just weather.",
  },
  {
    id: "twohomes", title: "Two Homes, One Heart",
    author: "mara", authorName: "Mara Voss",
    age: "Ages 3–7", price: 14.99,
    motif: "heart", grad: ["#3A2A3A", "#6A4A5A"], status: "coming",
    tagline: "For children who love in two places at once.",
    theme: "two-homes", themeBadge: "Two Homes",
    adult: "Split custody asks children to be two different versions of themselves — and to carry love for two parents who may not love each other. This book holds the complexity without asking them to resolve it.",
    child: "Mama's house has the good blanket. Dada's house has the big window. Both houses have me. And my heart is big enough to live in both.",
    helps: ["Split custody and co-parenting", "Visitation transitions", "Belonging in two homes", "Love without loyalty conflicts"],
    note: "When your child comes back from the other home, this book is a gentle re-entry. It says: you belong here. Your love for both homes is not a problem.",
  },
  {
    id: "grownups", title: "The Grown-Ups Are Talking Again",
    author: "june", authorName: "June Ellery",
    age: "Ages 3–6", price: 13.99,
    motif: "moon", grad: ["#332A48", "#5A4A6A"], status: "coming",
    tagline: "For children who hear too much and understand too little.",
    theme: "court", themeBadge: "Court & Legal",
    adult: "Children overhear difficult adult conversations about court, money, and safety — and piece together fragments into something scarier than the truth.",
    child: "Sometimes the grown-ups talk in a low voice. Mia can hear the shape of the words but not what they mean. What she knows is: Mama is close. And tomorrow will still come.",
    helps: ["Overheard adult conversations", "Uncertainty and waiting", "Reassurance during legal stress", "Anxiety about what children can not understand"],
    note: "You don't have to explain everything. This book tells your child it's okay not to know all the words — and that love doesn't need translating.",
  },
  {
    id: "quiet", title: "When Mama Needs Quiet",
    author: "june", authorName: "June Ellery",
    age: "Ages 3–6", price: 13.99,
    motif: "lantern", grad: ["#2A3A30", "#4A6050"], status: "coming",
    tagline: "For the child who learned to read the room.",
    theme: "big-feelings", themeBadge: "Big Feelings",
    adult: "Children of mothers with depression, PTSD, or chronic stress often adapt by becoming very attuned — and very quiet. This book validates their experience and restores connection.",
    child: "Sometimes Mama needs quiet. Not because of anything I did, but because her heart is full. I can play near. I can wait. And when she's ready, she always comes back.",
    helps: ["Parent mental health and child response", "Children in stressed households", "Emotional attunement", "Reassurance and repair after a hard day"],
    note: "Read this together on a hard-quiet day. The line 'she always comes back' is the most important one. Say it out loud. Let them hear it in your voice.",
  },
  {
    id: "promise", title: "When Someone Breaks a Promise",
    author: "june", authorName: "June Ellery",
    age: "Ages 4–8", price: 13.99,
    motif: "heart", grad: ["#3A2A20", "#6A4A38"], status: "coming",
    tagline: "For the child learning the difference between people and love.",
    theme: "two-homes", themeBadge: "Two Homes",
    adult: "Canceled visits, forgotten birthdays, broken commitments from an unreliable parent — children internalize these as evidence of their own unworthiness. This book says otherwise.",
    child: "Dad said he would come. He didn't. That feeling is real and it's allowed. And the fact that he didn't come has nothing to do with whether I am worth coming for.",
    helps: ["Broken promises from a parent", "Canceled visits and disappointment", "Self-worth after rejection", "Complicated love for an unreliable parent"],
    note: "Read this before you have to explain. Then read it again. Some things need to be said many times before a child can carry them.",
  },
  {
    id: "visit", title: "The Visit I Didn't Want",
    author: "june", authorName: "June Ellery",
    age: "Ages 4–8", price: 13.99,
    motif: "lantern", grad: ["#3A2028", "#6A3848"], status: "coming",
    tagline: "For children with complicated feelings about visitation.",
    theme: "two-homes", themeBadge: "Two Homes",
    adult: "Mandatory visitation with a parent a child has complicated feelings about — fear, ambivalence, or grief. This book validates those feelings without directing them.",
    child: "I don't always want to go. That feeling is real. I can feel it and tell someone about it. And when I come home, Mama is here.",
    helps: ["Forced or unwanted visitation", "Fear or ambivalence about a parent", "Safety and agency during visitation", "Return and re-entry transitions"],
    note: "This book does not tell children what to feel about a parent. It tells them their feelings are allowed, they can say them out loud, and coming home is always the end of the story.",
  },
];

/* ============================================================
   COMPONENTS
   ============================================================ */

/* Boutique book card */
function BookCard({ book, go }) {
  return (
    <button className="bs-book-card" onClick={() => go("book", book.id)}>
      <MiniCover book={book} />
      <div className="bs-card-body">
        {book.themeBadge && (
          <span className="bs-theme-badge">{book.themeBadge}</span>
        )}
        <h3 className="bs-card-title">{book.title}</h3>
        <p className="bs-card-by">by {book.authorName} · {displayAge(book)}</p>
        <p className="bs-card-tagline">{book.tagline}</p>
        <div className="bs-card-footer">
          <span className="bs-price">
            {book.status === "coming" ? "Coming soon" : `$${book.price.toFixed(2)}`}
          </span>
          <span className="bs-format-badge">Paperback · Digital</span>
        </div>
      </div>
    </button>
  );
}

/* Pack cover — stacked gradient tiles */
function PackCover({ pack, size = "md" }) {
  const big = size === "lg";
  return (
    <div className={"bs-pack-cover" + (big ? " bs-pack-cover-lg" : "")}
      style={{ background: `linear-gradient(160deg, ${pack.grad[0]}, ${pack.grad[1]})` }}>
      <div className="bspc-stars" aria-hidden="true">
        <i style={{ top: "10%", left: "15%" }} />
        <i style={{ top: "22%", left: "78%" }} />
        <i style={{ top: "60%", left: "8%" }} />
        <i style={{ top: "70%", left: "85%" }} />
      </div>
      <div className="bspc-count">{pack.bookIds.length}</div>
      <div className="bspc-books">books</div>
      <div className="bspc-title">{pack.title}</div>
      {pack.isSponsor && <div className="bspc-sponsor-tag">Gift a Family</div>}
    </div>
  );
}

/* Pack card */
function PackCard({ pack, go, books }) {
  const packBooks = pack.bookIds.map(id => books.find(b => b.id === id)).filter(Boolean);
  return (
    <button className={"bs-pack-card" + (pack.isSponsor ? " bs-pack-card-sponsor" : "")}
      onClick={() => go("pack", pack.id)}>
      <PackCover pack={pack} />
      <div className="bs-pack-body">
        {pack.isSponsor && <span className="bs-sponsor-label">💛 Sponsor a Family</span>}
        <h3 className="bs-pack-title">{pack.title}</h3>
        <p className="bs-pack-sub">{pack.subtitle}</p>
        <div className="bs-pack-includes">
          {packBooks.slice(0, 3).map(b => (
            <span key={b.id} className="bs-pack-book-dot">
              <MiniCover book={b} tiny /> <span>{b.title}</span>
            </span>
          ))}
          {packBooks.length > 3 && (
            <span className="bs-pack-more">+ {packBooks.length - 3} more</span>
          )}
        </div>
        <div className="bs-pack-footer">
          <div>
            <span className="bs-pack-price">${pack.price}</span>
            {pack.originalPrice && (
              <span className="bs-pack-orig">${pack.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <span className="bs-pack-cta">View pack →</span>
        </div>
      </div>
    </button>
  );
}

/* Shop by Hard Moment section */
function ShopByMoment({ go }) {
  return (
    <section className="bs-moments-section">
      <div className="wrap">
        <p className="eyebrow gold center">Browse by what you're facing</p>
        <h2 className="center bs-section-heading">Shop by Hard Moment</h2>
        <p className="bs-section-lead center">
          Every book is named for the real situation it helps with.
          Find what fits your family's right now.
        </p>
        <div className="bs-moments-grid">
          {MOMENTS.map(m => (
            <button
              key={m.key}
              className="bs-moment-card"
              style={{ background: m.bg, color: m.text }}
              onClick={() => go("books")}
            >
              <span className="bs-moment-icon" aria-hidden="true">{m.icon}</span>
              <strong className="bs-moment-label">{m.label}</strong>
              <p className="bs-moment-desc">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* "Not sure where to start?" guide */
function StartHereGuide({ go }) {
  const [step, setStep] = useState(null);

  const steps = [
    {
      q: "What's happening in your home right now?",
      opts: [
        { label: "Court, legal stress, or custody hearings", dest: "court-pack" },
        { label: "We recently left or moved somewhere new", dest: "safe-home-pack" },
        { label: "My child is anxious or having big feelings", dest: "feelings-pack" },
        { label: "My child is going between two homes", dest: "two-homes-pack" },
        { label: "I want one of everything to start", dest: "survivor-library" },
        { label: "I work with children or families professionally", dest: "therapist-library" },
      ],
    },
  ];

  return (
    <section className="bs-start-section">
      <div className="wrap">
        <div className="bs-start-inner">
          <p className="eyebrow rose">Find your fit</p>
          <h2>Not sure where to start?</h2>
          <p className="lead" style={{ maxWidth: "52ch" }}>
            Answer one question and we'll point you to the right books.
          </p>
          {!step ? (
            <div className="bs-start-opts">
              {steps[0].opts.map(o => (
                <button
                  key={o.dest}
                  className="bs-start-opt"
                  onClick={() => go("pack", o.dest)}
                >
                  {o.label}
                  <span className="bs-opt-arrow">→</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* Sponsor CTA band */
function SponsorBand({ go }) {
  return (
    <section className="bs-sponsor-band">
      <div className="wrap bs-sponsor-inner">
        <div>
          <p className="eyebrow gold">Give the gift of gentle stories</p>
          <h2>Sponsor a Family in Shelter</h2>
          <p className="lead" style={{ color: "#E9DFEA", marginTop: 12 }}>
            For $59, you send four healing books directly to a family
            navigating domestic violence, shelter, or transitional housing.
            Little Amour handles everything. The family gets a personal note.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
            <button className="btn-gold" onClick={() => go("pack", "sponsor-library")}>
              Sponsor a Starter Library — $59
            </button>
            <button className="btn-line" onClick={() => go("write")}>
              Become an author
            </button>
          </div>
        </div>
        <div className="bs-sponsor-art" aria-hidden="true">
          <svg viewBox="0 0 180 180" width="180" height="180" fill="none">
            <circle cx="90" cy="90" r="88" fill="rgba(226,168,87,0.08)" stroke="rgba(226,168,87,0.25)" strokeWidth="1.5" />
            <text x="90" y="100" textAnchor="middle" fontSize="72" fill="rgba(226,168,87,0.4)">💛</text>
            <circle cx="90" cy="90" r="64" fill="none" stroke="rgba(226,168,87,0.12)" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* Trust section */
function TrustSection() {
  const badges = [
    { icon: "📖", label: "12 books", sub: "for hard family moments" },
    { icon: "💸", label: "75% to authors", sub: "survivor mothers rebuilding" },
    { icon: "🔒", label: "Privacy first", sub: "author identities protected" },
    { icon: "🌱", label: "Mission-led", sub: "every purchase funds healing" },
  ];
  return (
    <section className="bs-trust-section">
      <div className="wrap">
        <div className="bs-trust-grid">
          {badges.map(b => (
            <div key={b.label} className="bs-trust-item">
              <span className="bs-trust-icon" aria-hidden="true">{b.icon}</span>
              <strong className="bs-trust-label">{b.label}</strong>
              <p className="bs-trust-sub">{b.sub}</p>
            </div>
          ))}
        </div>
        <p className="bs-trust-note">
          Little Amour Books is a boutique press and income platform for survivor mothers.
          We are not therapy, legal advice, or crisis support. If you or someone you know is in danger,
          please contact the{" "}
          <a href="https://www.thehotline.org" target="_blank" rel="noopener" className="bs-trust-link">
            National DV Hotline
          </a>{" "}
          at 1-800-799-7233.
        </p>
      </div>
    </section>
  );
}

/* Email capture */
function EmailCapture() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="bs-email-section">
      <div className="wrap bs-email-inner">
        {done ? (
          <p className="bs-email-thanks">
            🌙 You're on the list. We'll be in touch when new books arrive.
          </p>
        ) : (
          <>
            <div>
              <p className="eyebrow plum">Stay in the story</p>
              <h3 className="bs-email-heading">New books. Gentle resources. Author updates.</h3>
              <p className="bs-email-sub">No noise. Just the things that matter for families like yours.</p>
            </div>
            <form
              className="bs-email-form"
              onSubmit={async e => {
                e.preventDefault();
                if (!email) return;
                try {
                  await supabase.from("email_subscribers").upsert({ email: email.trim(), source: "store" }, { onConflict: "email" });
                } catch (ex) { /* non-fatal */ }
                setDone(true);
              }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bs-email-input"
                required
              />
              <button type="submit" className="btn-gold">Join us</button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   PAGES
   ============================================================ */

/* Store Landing Page */
export function StoreLanding({ go, books, afterFavorites }) {
  const featuredBooks = books.filter(b => ["papers", "bluebag", "brave", "moonbear"].includes(b.id));
  const featuredPacks = PACKS.filter(p => p.isFeatured);

  return (
    <div className="bs-root">
      {/* Hero */}
      <section className="bs-hero">
        <div className="bs-hero-sky" aria-hidden="true">
          {[...Array(14)].map((_, i) => (
            <i key={i} className="bs-star" style={{
              top: `${8 + Math.sin(i * 2.3) * 30}%`,
              left: `${6 + (i * 6.8) % 88}%`,
              animationDelay: `${(i * 0.6) % 4}s`,
            }} />
          ))}
        </div>
        <div className="bs-hero-inner">
          <p className="eyebrow gold center">Little Amour Books</p>
          <h1 className="bs-hero-h1">
            Gentle children's books<br />
            <em>for hard family moments.</em>
          </h1>
          <p className="bs-hero-sub">
            Written by survivor mothers. Designed for the real conversations
            you're trying to find words for. Every book names the situation and
            tells the child-safe story.
          </p>
          <div className="bs-hero-ctas">
            <button className="btn-gold" onClick={() => go("packs")}>Shop Book Packs</button>
            <button className="btn-line" onClick={() => go("books")}>Browse All Books</button>
            <button className="btn-line" onClick={() => go("pack", "sponsor-library")}>Sponsor a Family</button>
          </div>
        </div>
        <div className="bs-hero-horizon" aria-hidden="true" />
      </section>

      {/* Shop by Hard Moment */}
      <ShopByMoment go={go} />

      {/* Featured Packs */}
      <section className="bs-featured-section bs-featured-dark">
        <div className="wrap">
          <p className="eyebrow gold center">Curated collections</p>
          <h2 className="center bs-section-heading" style={{ color: P.cream }}>Featured Book Packs</h2>
          <p className="bs-section-lead center" style={{ color: "#DDD2E4" }}>
            Grouped by moment. Priced to make it easy. Built for families
            who need the right books, not the search to find them.
          </p>
          <div className="bs-packs-grid">
            {featuredPacks.map(pack => (
              <PackCard key={pack.id} pack={pack} go={go} books={books} />
            ))}
          </div>
          <div className="center" style={{ marginTop: 32 }}>
            <button className="btn-line" onClick={() => go("packs")}>
              View all 7 packs →
            </button>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="bs-featured-section">
        <div className="wrap">
          <p className="eyebrow plum center">Individual titles</p>
          <h2 className="center bs-section-heading">Reader Favorites</h2>
          <p className="bs-section-lead center">
            Each book stands alone — and works as part of a pack.
          </p>
          <div className="bs-books-grid">
            {featuredBooks.map(book => (
              <BookCard key={book.id} book={book} go={go} />
            ))}
          </div>
          <div className="center" style={{ marginTop: 32 }}>
            <button className="btn-line dark" onClick={() => go("books")}>
              Browse all 12 books →
            </button>
          </div>
        </div>
      </section>

      {/* Merch — injected from parent to avoid circular import */}
      {afterFavorites}

      {/* Not sure where to start */}
      <StartHereGuide go={go} />

      {/* Sponsor band */}
      <SponsorBand go={go} />

      {/* Trust */}
      <TrustSection />

      {/* Email */}
      <EmailCapture />
    </div>
  );
}

/* All Books Shop Page */
export function BooksShop({ go, books }) {
  const [filter, setFilter] = useState("all");
  const themes = [
    { key: "all", label: "All books" },
    { key: "court", label: "Court & Legal" },
    { key: "safe-home", label: "Safe Home" },
    { key: "big-feelings", label: "Big Feelings" },
    { key: "two-homes", label: "Two Homes" },
  ];
  const visible = filter === "all"
    ? books
    : books.filter(b => b.theme === filter);

  return (
    <div className="bs-root morning page-top">
      <div className="wrap">
        <p className="eyebrow plum">The bookshop</p>
        <h2>All {books.length} books.</h2>
        <p className="lead">Named for the real situations. Written for the children in them.</p>

        {/* Filter pills */}
        <div className="bs-filter-row">
          {themes.map(t => (
            <button
              key={t.key}
              className={"bs-filter-pill" + (filter === t.key ? " on" : "")}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bs-books-grid" style={{ marginTop: 24 }}>
          {visible.map(book => (
            <BookCard key={book.id} book={book} go={go} />
          ))}
        </div>

        {/* Upsell to packs */}
        <div className="bs-shop-upsell">
          <p className="eyebrow gold">Better together</p>
          <h3>Save more with a pack</h3>
          <p>Book packs bundle 3–12 titles around a theme and include bonus caregiver tools.</p>
          <button className="btn-gold" style={{ marginTop: 16 }} onClick={() => go("packs")}>
            See all book packs
          </button>
        </div>
      </div>
    </div>
  );
}

/* All Packs Page */
export function PacksPage({ go, books }) {
  return (
    <div className="bs-root morning page-top">
      <div className="wrap">
        <p className="eyebrow plum">Themed collections</p>
        <h2>Book packs for every hard moment.</h2>
        <p className="lead">
          Bundled by situation. Priced to give you everything you need.
          Each pack includes bonus caregiver tools.
        </p>
        <div className="bs-all-packs-grid">
          {PACKS.map(pack => (
            <PackCard key={pack.id} pack={pack} go={go} books={books} />
          ))}
        </div>
        <div className="bs-shop-upsell">
          <p className="eyebrow plum">Individual titles</p>
          <h3>Or browse by book</h3>
          <p>Every title is also available individually. Each one stands on its own.</p>
          <button className="btn-line dark" style={{ marginTop: 16 }} onClick={() => go("books")}>
            Browse all {books.length} books →
          </button>
        </div>
      </div>
    </div>
  );
}

/* Individual Pack Page */
export function PackPage({ packId, go, books, addToCart }) {
  const pack = PACKS.find(p => p.id === packId) || PACKS[0];
  const packBooks = pack.bookIds.map(id => books.find(b => b.id === id)).filter(Boolean);
  const relatedPacks = pack.relatedPackIds
    ? pack.relatedPackIds.map(id => PACKS.find(p => p.id === id)).filter(Boolean)
    : [];

  return (
    <div className="bs-root">
      {/* Pack hero */}
      <section className="bs-pack-hero" style={{
        background: `linear-gradient(160deg, ${pack.grad[0]}, ${pack.grad[1]})`,
      }}>
        <div className="bs-pack-hero-sky" aria-hidden="true">
          {[...Array(10)].map((_, i) => (
            <i key={i} className="bs-star" style={{
              top: `${8 + Math.sin(i * 1.8) * 28}%`,
              left: `${5 + (i * 9.1) % 90}%`,
              animationDelay: `${(i * 0.5) % 4}s`,
            }} />
          ))}
        </div>
        <div className="wrap bs-pack-hero-inner">
          <div className="bs-pack-hero-text">
            <button className="btn-text light-text" onClick={() => go("packs")}>← All packs</button>
            {pack.isSponsor && (
              <span className="bs-sponsor-hero-badge">💛 Gift a Family</span>
            )}
            <h1 className="bs-pack-hero-h1">{pack.title}</h1>
            <p className="bs-pack-hero-sub">{pack.subtitle}</p>
            <div className="bs-pack-hero-price">
              <span className="bs-pack-hero-price-main">${pack.price}</span>
              {pack.originalPrice && (
                <span className="bs-pack-hero-price-orig">
                  Was ${pack.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="bs-pack-hero-price-note">
                {pack.bookIds.length} books · Paperback &amp; digital
              </span>
            </div>
            <div className="bs-pack-hero-ctas">
              <button className="btn-gold" onClick={() => addToCart ? addToCart({ type: "pack", id: pack.id, title: pack.title, price: Number(pack.price), authors: [...new Set(packBooks.map(b => b.author).filter(Boolean))], grad: pack.grad, motif: "lantern" }) : go("packs")}>
                {pack.isSponsor ? "Sponsor this library" : `Add to bag — $${pack.price}`}
              </button>
              {pack.isSponsor
                ? null
                : <button className="btn-line" onClick={() => go("pack", "sponsor-library")}>
                    Or gift this pack to a family in shelter
                  </button>
              }
            </div>
          </div>
          <PackCover pack={pack} size="lg" />
        </div>
      </section>

      {/* Helps with */}
      <section className="bs-pack-section bs-pack-section-light">
        <div className="wrap bs-pack-two-col">
          <div>
            <p className="eyebrow plum">What this pack helps with</p>
            <h2 className="bs-pack-section-h">It's for when&hellip;</h2>
            <ul className="bs-helps-list">
              {pack.helpsWidth.map((h, i) => (
                <li key={i} className="bs-helps-item">
                  <span className="bs-helps-dot" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
            <div className="bs-best-for">
              <p className="eyebrow gold" style={{ marginBottom: 6 }}>Best for</p>
              <p>{pack.bestFor}</p>
            </div>
          </div>
          <div className="bs-gentle-note">
            <p className="eyebrow rose" style={{ marginBottom: 8 }}>A gentle note</p>
            <p className="bs-gentle-text">{pack.gentleNote}</p>
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="bs-pack-section">
        <div className="wrap">
          <p className="eyebrow plum">The books</p>
          <h2 className="bs-pack-section-h">What's inside</h2>
          <div className="bs-inside-grid">
            {packBooks.map(book => (
              <button
                key={book.id}
                className="bs-inside-card"
                onClick={() => go("book", book.id)}
              >
                <MiniCover book={book} />
                <div className="bs-inside-body">
                  {book.themeBadge && (
                    <span className="bs-theme-badge" style={{ marginBottom: 6 }}>{book.themeBadge}</span>
                  )}
                  <h3 className="bs-inside-title">{book.title}</h3>
                  <p className="bs-inside-by">by {book.authorName} · {displayAge(book)}</p>
                  <p className="bs-inside-tagline">{book.tagline}</p>
                  <p className="bs-inside-more">Read more →</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bonus tools */}
      {pack.bonus && pack.bonus.length > 0 && (
        <section className="bs-pack-section bs-pack-section-warm">
          <div className="wrap">
            <p className="eyebrow gold">Included free</p>
            <h2 className="bs-pack-section-h">Bonus caregiver tools</h2>
            <div className="bs-bonus-grid">
              {pack.bonus.map((b, i) => (
                <div key={i} className="bs-bonus-card">
                  <span className="bs-bonus-icon" aria-hidden="true">🌙</span>
                  <p className="bs-bonus-text">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sponsor CTA within pack */}
      {!pack.isSponsor && (
        <section className="bs-pack-sponsor-cta">
          <div className="wrap bs-pack-sponsor-inner">
            <div>
              <p className="eyebrow gold">Know someone who needs this?</p>
              <h3>Sponsor this pack for a family in shelter.</h3>
              <p style={{ marginTop: 10, color: "#DDD2E4", lineHeight: 1.6 }}>
                For $59, Little Amour Books ships the Survivor Mama Starter Library
                directly to a family navigating domestic violence or transitional housing.
              </p>
            </div>
            <button className="btn-gold" onClick={() => go("pack", "sponsor-library")}
              style={{ flexShrink: 0, alignSelf: "center" }}>
              Sponsor a family
            </button>
          </div>
        </section>
      )}

      {/* Related packs */}
      {relatedPacks.length > 0 && (
        <section className="bs-pack-section">
          <div className="wrap">
            <p className="eyebrow plum">Also good for your family</p>
            <h2 className="bs-pack-section-h">Related packs</h2>
            <div className="bs-packs-grid" style={{ marginTop: 24 }}>
              {relatedPacks.map(rp => (
                <PackCard key={rp.id} pack={rp} go={go} books={books} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ============================================================
   ADDITIONAL CSS (injected via App.jsx)
   ============================================================ */
export const STORE_CSS = `
/* ---- Bookstore root ---- */
.bs-root { }

/* ---- Store hero ---- */
.bs-hero {
  position: relative;
  background: radial-gradient(120% 90% at 50% 0%, #1B2444 0%, #131A30 50%, #0D1226 100%);
  color: #FFF9F0;
  padding: 86px 26px 120px;
  overflow: hidden;
  text-align: center;
}
.bs-hero-sky { position: absolute; inset: 0; pointer-events: none; }
.bs-star {
  position: absolute; width: 2.5px; height: 2.5px; border-radius: 50%;
  background: #EADFC9; animation: twinkle 4.5s ease-in-out infinite;
}
.bs-hero-inner { position: relative; max-width: 760px; margin: 0 auto; }
.bs-hero-h1 {
  font-family: var(--display); font-size: clamp(36px, 6vw, 62px);
  color: #FFF9F0; line-height: 1.1; letter-spacing: -0.015em; margin: 14px 0 22px;
}
.bs-hero-h1 em { font-style: italic; color: ${P.gold}; }
.bs-hero-sub {
  font-size: 18px; line-height: 1.68; color: #DDD2E4;
  max-width: 54ch; margin: 0 auto 34px;
}
.bs-hero-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.bs-hero-horizon {
  position: absolute; left: 0; right: 0; bottom: -1px; height: 80px;
  background: linear-gradient(180deg, rgba(13,18,38,0) 0%, ${P.paper} 100%);
}

/* ---- Section common ---- */
.bs-section-heading { margin-bottom: 14px; }
.bs-section-lead {
  font-size: 17px; line-height: 1.7; max-width: 58ch;
  margin: 0 auto 32px; color: ${P.inkSoft};
}

/* ---- Moments ---- */
.bs-moments-section { background: ${P.paper}; padding: 72px 0; }
.bs-moments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px; margin-top: 32px;
}
.bs-moment-card {
  border: none; border-radius: 16px; padding: 22px 20px; text-align: left;
  cursor: pointer; transition: transform .16s ease, box-shadow .16s ease;
}
.bs-moment-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(43,36,51,.12); }
.bs-moment-icon { font-size: 28px; display: block; margin-bottom: 10px; }
.bs-moment-label { display: block; font-family: var(--display); font-size: 17px; font-weight: 560; margin-bottom: 6px; }
.bs-moment-desc { font-size: 13.5px; line-height: 1.55; margin: 0; opacity: 0.85; }

/* ---- Featured sections ---- */
.bs-featured-section { padding: 72px 0; background: ${P.paper}; }
.bs-featured-dark { background: linear-gradient(180deg, #1A1530 0%, #2A2150 100%); }
.bs-featured-dark .bs-section-heading { color: ${P.cream}; }

/* ---- Book cards ---- */
.bs-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(236px, 1fr));
  gap: 22px;
}
.bs-book-card {
  text-align: left; background: ${P.cream};
  border: 1px solid #ECD9C5; border-radius: 16px; padding: 0;
  overflow: hidden; cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;
  display: flex; flex-direction: column;
}
.bs-book-card:hover { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(43,36,51,.14); }
.bs-card-body { padding: 16px 18px 18px; flex: 1; display: flex; flex-direction: column; }
.bs-theme-badge {
  display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; background: ${P.paperWarm}; color: ${P.goldDeep};
  border: 1px solid #E8D5B6; border-radius: 999px; padding: 3px 10px;
  margin-bottom: 10px;
}
.bs-card-title { font-family: var(--display); font-size: 18px; font-weight: 560; margin-bottom: 4px; line-height: 1.2; }
.bs-card-by { font-size: 12.5px; color: ${P.inkSoft}; margin-bottom: 8px; }
.bs-card-tagline { font-size: 14px; line-height: 1.55; color: ${P.inkSoft}; font-style: italic; flex: 1; }
.bs-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; }
.bs-price { font-family: var(--display); font-size: 17px; color: ${P.goldDeep}; }
.bs-format-badge { font-size: 11px; color: ${P.inkSoft}; background: ${P.paperWarm}; padding: 3px 9px; border-radius: 999px; }

/* ---- Mini cover ---- */
.mini-cover {
  /* 1:1 — matches the book's actual print trim (215.9 x 215.9mm square), not an
     arbitrary portrait shape. A real cover image is composited for square; cropping it
     into a taller frame sliced off the title/art unpredictably. */
  aspect-ratio: 1 / 1; border-radius: 0; padding: 18px 14px;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; position: relative;
  overflow: hidden; width: 100%;
}
.mini-cover-lg {
  width: 200px; aspect-ratio: 1 / 1; border-radius: 10px; padding: 22px 18px;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; position: relative;
  overflow: hidden; box-shadow: 0 10px 26px rgba(19,26,48,.22);
}
.mini-cover-tiny {
  width: 24px; height: 30px; border-radius: 3px; flex-shrink: 0;
  position: relative; overflow: hidden; display: inline-block;
}
.bs-ribbon {
  position: absolute; top: 20px; right: -40px; transform: rotate(36deg);
  background: ${P.gold}; color: ${P.nightDeep}; font-size: 10px; font-weight: 800;
  letter-spacing: .1em; text-transform: uppercase; padding: 4px 44px;
}
.mini-stars i {
  position: absolute; width: 2px; height: 2px; border-radius: 50%;
  background: rgba(255,249,240,.6);
}
.mini-motif { margin-bottom: 10px; }
.mini-title { font-family: var(--display); font-size: 16px; line-height: 1.2; color: #FFF9F0; }
.mini-rule { width: 28px; height: 1.5px; background: ${P.gold}; margin: 9px 0; }
.mini-author { font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,249,240,.8); }

/* ---- Pack cards ---- */
.bs-packs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 22px; margin-top: 8px;
}
.bs-all-packs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 22px; margin-top: 28px;
}
.bs-pack-card {
  text-align: left; background: ${P.cream}; border: 1px solid #ECD9C5;
  border-radius: 18px; overflow: hidden; cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease;
  display: flex; flex-direction: column;
}
.bs-pack-card:hover { transform: translateY(-4px); box-shadow: 0 18px 38px rgba(43,36,51,.16); }
.bs-pack-card-sponsor { border-color: ${P.gold}; background: #FDF8EE; }
.bs-pack-body { padding: 18px 20px 20px; flex: 1; display: flex; flex-direction: column; }
.bs-sponsor-label { font-size: 12.5px; font-weight: 700; color: ${P.goldDeep}; margin-bottom: 8px; display: block; }
.bs-pack-title { font-family: var(--display); font-size: 20px; font-weight: 560; margin-bottom: 5px; line-height: 1.2; }
.bs-pack-sub { font-size: 14px; color: ${P.inkSoft}; font-style: italic; margin-bottom: 14px; }
.bs-pack-includes { display: flex; flex-direction: column; gap: 7px; flex: 1; margin-bottom: 16px; }
.bs-pack-book-dot { display: flex; align-items: center; gap: 9px; font-size: 13px; color: ${P.inkSoft}; }
.bs-pack-more { font-size: 12.5px; color: ${P.mauve}; font-weight: 700; padding-left: 33px; }
.bs-pack-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #ECD9C5; padding-top: 14px; }
.bs-pack-price { font-family: var(--display); font-size: 22px; color: ${P.goldDeep}; }
.bs-pack-orig { font-size: 14px; color: ${P.inkSoft}; text-decoration: line-through; margin-left: 8px; }
.bs-pack-cta { font-size: 14px; font-weight: 700; color: ${P.mauve}; }

/* ---- Pack cover art ---- */
.bs-pack-cover {
  aspect-ratio: 16 / 9; position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 20px;
  min-height: 140px;
}
.bs-pack-cover-lg {
  width: 280px; min-height: 280px; border-radius: 14px; position: relative;
  overflow: hidden; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 28px;
  box-shadow: 0 14px 36px rgba(0,0,0,.3);
}
.bspc-stars i {
  position: absolute; width: 2px; height: 2px; border-radius: 50%;
  background: rgba(255,249,240,.5);
}
.bspc-count {
  font-family: var(--display); font-size: 52px; color: rgba(255,249,240,.95);
  font-weight: 640; line-height: 1; position: relative;
}
.bspc-books {
  font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
  color: rgba(255,249,240,.7); margin-top: 2px; margin-bottom: 12px;
}
.bspc-title {
  font-family: var(--display); font-size: 17px; color: rgba(255,249,240,.95);
  line-height: 1.25; position: relative;
}
.bspc-sponsor-tag {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  background: ${P.gold}; color: ${P.nightDeep}; font-size: 10.5px; font-weight: 800;
  letter-spacing: .1em; text-transform: uppercase; padding: 4px 14px; border-radius: 999px;
}

/* ---- Start here guide ---- */
.bs-start-section {
  background: ${P.paperWarm};
  padding: 72px 0; border-top: 1px solid #EAD9C3; border-bottom: 1px solid #EAD9C3;
}
.bs-start-inner { max-width: 680px; }
.bs-start-opts { display: flex; flex-direction: column; gap: 10px; margin-top: 28px; }
.bs-start-opt {
  display: flex; align-items: center; justify-content: space-between;
  background: ${P.cream}; border: 1.5px solid #E5D6C2; border-radius: 12px;
  padding: 16px 20px; font-size: 15.5px; font-weight: 600; text-align: left;
  cursor: pointer; transition: border-color .14s ease, background .14s ease;
  color: ${P.ink};
}
.bs-start-opt:hover { border-color: ${P.gold}; background: #FDF8EE; }
.bs-opt-arrow { color: ${P.mauve}; font-size: 18px; flex-shrink: 0; margin-left: 16px; }

/* ---- Sponsor band ---- */
.bs-sponsor-band {
  background: radial-gradient(110% 100% at 50% 100%, #1C2546 0%, ${P.nightDeep} 70%);
  padding: 72px 0;
}
.bs-sponsor-inner {
  display: grid; grid-template-columns: 1fr auto; gap: 48px; align-items: center;
}
.bs-sponsor-art { opacity: 0.85; }

/* ---- Trust section ---- */
.bs-trust-section { background: ${P.paper}; padding: 48px 0 40px; border-top: 1px solid #EAD9C3; }
.bs-trust-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px; margin-bottom: 28px;
}
.bs-trust-item { text-align: center; }
.bs-trust-icon { font-size: 28px; display: block; margin-bottom: 8px; }
.bs-trust-label { display: block; font-family: var(--display); font-size: 18px; margin-bottom: 4px; }
.bs-trust-sub { font-size: 13.5px; color: ${P.inkSoft}; margin: 0; }
.bs-trust-note { font-size: 13px; color: ${P.inkSoft}; text-align: center; max-width: 66ch; margin: 0 auto; line-height: 1.65; }
.bs-trust-link { color: ${P.mauve}; text-decoration: underline; text-underline-offset: 2px; }

/* ---- Email section ---- */
.bs-email-section { background: ${P.paperWarm}; padding: 60px 0; border-top: 1px solid #EAD9C3; }
.bs-email-inner {
  display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
}
.bs-email-heading { font-family: var(--display); font-size: 22px; margin: 8px 0 6px; }
.bs-email-sub { font-size: 14.5px; color: ${P.inkSoft}; }
.bs-email-form { display: flex; gap: 10px; flex-wrap: wrap; }
.bs-email-input {
  flex: 1 1 220px; font-family: var(--body); font-size: 15px; color: ${P.ink};
  background: ${P.cream}; border: 1.5px solid #E3D3BC; border-radius: 999px;
  padding: 11px 18px;
}
.bs-email-thanks {
  font-family: var(--display); font-size: 18px; color: ${P.mauve};
  text-align: center; grid-column: 1 / -1;
}

/* ---- Pack hero ---- */
.bs-pack-hero { position: relative; padding: 72px 0 80px; overflow: hidden; }
.bs-pack-hero-sky { position: absolute; inset: 0; pointer-events: none; }
.bs-pack-hero-inner {
  display: grid; grid-template-columns: 1fr auto; gap: 48px;
  align-items: center; position: relative;
}
.bs-pack-hero-text { color: #FFF9F0; }
.light-text { color: rgba(255,249,240,.7) !important; }
.bs-sponsor-hero-badge {
  display: inline-block; background: ${P.gold}; color: ${P.nightDeep};
  font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  padding: 5px 14px; border-radius: 999px; margin-bottom: 14px;
}
.bs-pack-hero-h1 {
  font-family: var(--display); font-size: clamp(30px, 5vw, 52px);
  color: #FFF9F0; line-height: 1.1; margin: 12px 0 14px;
}
.bs-pack-hero-sub { font-size: 17px; color: rgba(255,249,240,.8); max-width: 52ch; margin-bottom: 24px; }
.bs-pack-hero-price { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
.bs-pack-hero-price-main { font-family: var(--display); font-size: 38px; color: ${P.gold}; }
.bs-pack-hero-price-orig { font-size: 16px; color: rgba(255,249,240,.5); text-decoration: line-through; }
.bs-pack-hero-price-note { font-size: 13.5px; color: rgba(255,249,240,.65); }
.bs-pack-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }

/* ---- Pack detail sections ---- */
.bs-pack-section { padding: 64px 0; }
.bs-pack-section-light { background: ${P.cream}; }
.bs-pack-section-warm { background: ${P.paperWarm}; }
.bs-pack-section-h { font-size: clamp(24px, 3.5vw, 34px); margin-bottom: 28px; }
.bs-pack-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.bs-helps-list { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 12px; }
.bs-helps-item { display: flex; gap: 14px; font-size: 15.5px; align-items: flex-start; }
.bs-helps-dot {
  width: 10px; height: 10px; border-radius: 50%; background: ${P.gold};
  flex-shrink: 0; margin-top: 6px;
}
.bs-best-for {
  background: ${P.paperWarm}; border-radius: 12px; padding: 18px 20px;
  border-left: 3px solid ${P.gold};
}
.bs-gentle-note {
  background: linear-gradient(135deg, #F5EEF8, #EEF3F5);
  border-radius: 18px; padding: 30px;
}
.bs-gentle-text { font-size: 16px; line-height: 1.75; font-style: italic; color: ${P.ink}; }

/* ---- What's inside ---- */
.bs-inside-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px; margin-top: 10px;
}
.bs-inside-card {
  text-align: left; background: ${P.cream}; border: 1px solid #ECD9C5;
  border-radius: 14px; overflow: hidden; cursor: pointer;
  transition: transform .16s ease, box-shadow .16s ease;
  display: flex; flex-direction: column;
}
.bs-inside-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(43,36,51,.12); }
.bs-inside-body { padding: 14px 16px 16px; }
.bs-inside-title { font-family: var(--display); font-size: 16px; font-weight: 560; margin-bottom: 3px; }
.bs-inside-by { font-size: 12px; color: ${P.inkSoft}; margin-bottom: 7px; }
.bs-inside-tagline { font-size: 13.5px; color: ${P.inkSoft}; font-style: italic; margin-bottom: 10px; }
.bs-inside-more { font-size: 13px; font-weight: 700; color: ${P.mauve}; }

/* ---- Bonus tools ---- */
.bs-bonus-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.bs-bonus-card {
  background: ${P.cream}; border: 1px solid #E5D6C2; border-radius: 14px;
  padding: 20px; display: flex; align-items: flex-start; gap: 14px;
}
.bs-bonus-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
.bs-bonus-text { font-size: 14.5px; line-height: 1.55; }

/* ---- Pack sponsor CTA ---- */
.bs-pack-sponsor-cta {
  background: linear-gradient(160deg, #1A1530, #2A2150); padding: 48px 0;
}
.bs-pack-sponsor-inner {
  display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap;
}
.bs-pack-sponsor-inner h3 {
  font-family: var(--display); font-size: 22px; color: ${P.cream}; margin: 8px 0 0;
}
.bs-pack-sponsor-inner .eyebrow { margin-bottom: 4px; }

/* ---- Shop page additions ---- */
.bs-filter-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }
.bs-filter-pill {
  background: none; border: 1.5px solid #E3D3BC; border-radius: 999px;
  padding: 8px 18px; font-size: 14px; font-weight: 600; color: ${P.inkSoft};
  cursor: pointer; transition: all .14s ease;
}
.bs-filter-pill:hover { border-color: ${P.mauve}; color: ${P.ink}; }
.bs-filter-pill.on { background: ${P.mauve}; border-color: ${P.mauve}; color: #FFF9F0; }
.bs-shop-upsell {
  background: ${P.paperWarm}; border: 1px solid #EAD9C3; border-radius: 18px;
  padding: 32px; margin-top: 48px; max-width: 540px;
}
.bs-shop-upsell .eyebrow { margin-bottom: 6px; }
.bs-shop-upsell h3 { font-family: var(--display); font-size: 22px; margin-bottom: 10px; }
.bs-shop-upsell p { font-size: 15px; color: ${P.inkSoft}; max-width: 50ch; }

/* ---- Responsive ---- */
@media (max-width: 720px) {
  .bs-pack-hero-inner { grid-template-columns: 1fr; }
  .bs-pack-cover-lg { display: none; }
  .bs-pack-two-col { grid-template-columns: 1fr; }
  .bs-email-inner { grid-template-columns: 1fr; gap: 24px; }
  .bs-sponsor-inner { grid-template-columns: 1fr; }
  .bs-sponsor-art { display: none; }
  .bs-pack-sponsor-inner { flex-direction: column; }
}
`;
