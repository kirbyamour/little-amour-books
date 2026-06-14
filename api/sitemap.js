/* ============================================================
   /api/sitemap — Dynamic XML Sitemap for Little Amour Books
   Returns sitemap.xml, auto-updated with published books/pages
   ============================================================ */

const SITE = "https://littleamour.com";

// Static pages with priority/changefreq
const STATIC_PAGES = [
  { loc: "/",              priority: "1.0", changefreq: "weekly"  },
  { loc: "/store",         priority: "0.9", changefreq: "weekly"  },
  { loc: "/books",         priority: "0.9", changefreq: "weekly"  },
  { loc: "/packs",         priority: "0.8", changefreq: "weekly"  },
  { loc: "/authors",       priority: "0.7", changefreq: "monthly" },
  { loc: "/write",         priority: "0.8", changefreq: "monthly" },
  { loc: "/apply",         priority: "0.7", changefreq: "monthly" },
  { loc: "/legal",         priority: "0.3", changefreq: "yearly"  },
  // Theme SEO landing pages
  { loc: "/topic/divorce",          priority: "0.8", changefreq: "monthly" },
  { loc: "/topic/court",            priority: "0.8", changefreq: "monthly" },
  { loc: "/topic/big-feelings",     priority: "0.8", changefreq: "monthly" },
  { loc: "/topic/survivor-families",priority: "0.8", changefreq: "monthly" },
  { loc: "/topic/anxiety",          priority: "0.8", changefreq: "monthly" },
  { loc: "/topic/separation",       priority: "0.8", changefreq: "monthly" },
  { loc: "/topic/moving",           priority: "0.7", changefreq: "monthly" },
  { loc: "/topic/two-homes",        priority: "0.7", changefreq: "monthly" },
  { loc: "/topic/trauma-informed",  priority: "0.7", changefreq: "monthly" },
  { loc: "/topic/rebuilding",       priority: "0.7", changefreq: "monthly" },
  { loc: "/topic/brave-days",       priority: "0.7", changefreq: "monthly" },
  // Policy pages (low priority, noindex recommended)
  { loc: "/policy-terms",        priority: "0.2", changefreq: "yearly" },
  { loc: "/policy-refund",       priority: "0.2", changefreq: "yearly" },
  { loc: "/policy-license",      priority: "0.2", changefreq: "yearly" },
  { loc: "/policy-shipping",     priority: "0.2", changefreq: "yearly" },
  { loc: "/policy-privacy",      priority: "0.2", changefreq: "yearly" },
  { loc: "/policy-accessibility",priority: "0.2", changefreq: "yearly" },
];

// Core books (static — always present)
const CORE_BOOKS = [
  "papers", "bluebag", "brave", "moonbear", "court", "sleepover",
  "backpack", "worrycloud", "twohomes", "grownups", "quiet", "promise",
];

// Core packs
const CORE_PACKS = [
  "court-pack", "safe-home-pack", "feelings-pack", "two-homes-pack",
  "survivor-library", "therapist-library", "sponsor-library",
];

function toXml(urls) {
  const items = urls.map(u => `
  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${u.lastmod || new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${u.changefreq || "monthly"}</changefreq>
    <priority>${u.priority || "0.5"}</priority>
  </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${items}
</urlset>`;
}

export default async function handler(req, res) {
  // Try to fetch dynamic book/page data from Supabase if configured
  let dynamicBooks = [];
  let dynamicBlogPosts = [];
  let lastBuildDate = new Date().toISOString().split("T")[0];

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      // Fetch published books
      const booksRes = await fetch(
        `${supabaseUrl}/rest/v1/books_pricing?select=id,updated_at&ownership_type=neq.null`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      if (booksRes.ok) {
        const books = await booksRes.json();
        dynamicBooks = (books || []).map(b => ({
          loc: `/book/${b.id}`,
          lastmod: b.updated_at ? b.updated_at.split("T")[0] : lastBuildDate,
          priority: "0.8",
          changefreq: "monthly",
        }));
      }
    } catch (e) { /* use static fallback */ }
  }

  // Build full URL list
  const bookUrls = dynamicBooks.length > 0 ? dynamicBooks : CORE_BOOKS.map(id => ({
    loc: `/book/${id}`,
    priority: "0.8",
    changefreq: "monthly",
    lastmod: lastBuildDate,
  }));

  const packUrls = CORE_PACKS.map(id => ({
    loc: `/pack/${id}`,
    priority: "0.7",
    changefreq: "monthly",
    lastmod: lastBuildDate,
  }));

  const allUrls = [
    ...STATIC_PAGES.map(p => ({ ...p, lastmod: lastBuildDate })),
    ...bookUrls,
    ...packUrls,
    ...dynamicBlogPosts,
  ];

  const xml = toXml(allUrls);

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);
}
