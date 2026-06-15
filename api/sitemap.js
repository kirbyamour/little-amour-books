/* api/sitemap.js — dynamic XML sitemap for littleamour.com */

const SITE = "https://littleamour.com";

const STATIC_PAGES = [
  { loc: "/",        changefreq: "weekly",  priority: "1.0" },
  { loc: "/shop",    changefreq: "weekly",  priority: "0.9" },
  { loc: "/books",   changefreq: "weekly",  priority: "0.9" },
  { loc: "/packs",   changefreq: "weekly",  priority: "0.8" },
  { loc: "/write",   changefreq: "monthly", priority: "0.8" },
  { loc: "/authors", changefreq: "monthly", priority: "0.7" },
];

const BOOK_SLUGS = [
  "papers", "bluebag", "brave", "moonbear", "backpack",
  "worrycloud", "twohomes", "firststep", "bigchange",
  "quietday", "nightlight", "bravemorning",
];

const TOPIC_SLUGS = [
  "divorce", "court", "big-feelings", "survivor-families",
  "anxiety", "separation", "moving", "two-homes",
  "trauma-informed", "rebuilding", "brave-days",
];

const now = new Date().toISOString().split("T")[0];

function url(loc, changefreq, priority, lastmod = now) {
  return `  <url>
    <loc>${SITE}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export default function handler(req, res) {
  const entries = [
    ...STATIC_PAGES.map(p => url(p.loc, p.changefreq, p.priority)),
    ...BOOK_SLUGS.map(slug => url(`/book/${slug}`, "monthly", "0.8")),
    ...TOPIC_SLUGS.map(slug => url(`/topic/${slug}`, "monthly", "0.7")),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries.join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.status(200).send(xml);
}
