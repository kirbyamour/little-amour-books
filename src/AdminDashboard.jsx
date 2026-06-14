import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   LITTLE AMOUR BOOKS — Full Admin Dashboard
   ============================================================ */

const P = {
  night: "#131A30", mauve: "#6E5572", rose: "#E5AC9F", gold: "#E2A857",
  paper: "#FAF4EB", ink: "#2B2433", inkSoft: "#5E5468", cream: "#FFF9F0",
  sage: "#6A8F7A", red: "#C0392B", green: "#27AE60", blue: "#3B6EA5",
  sidebar: "#0E1525",
};
const GOAL = 100000;
const fmt = (n) => n == null ? "—" : `$${Number(n).toFixed(2)}`;
const pct = (n) => n == null ? "—" : `${(Number(n) * 100).toFixed(1)}%`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—";

function calcFinancials({ price, costRow, authorPct }) {
  if (!price || !costRow) return null;
  const gross = Number(price);
  const print = Number(costRow.print_cost || 0);
  const procPct = Number(costRow.payment_processing_pct || 0);
  const procFixed = Number(costRow.payment_processing_fixed || 0);
  const fulfillment = Number(costRow.fulfillment_cost || 0);
  const platformPct = Number(costRow.platform_fee_pct || 0);
  const aiReserve = Number(costRow.ai_token_reserve || 0);
  const directCosts = print + (gross * procPct) + procFixed + fulfillment + (gross * platformPct) + aiReserve;
  const netPool = gross - directCosts;
  const authorPayout = netPool * Number(authorPct || 0);
  const labContribution = netPool - authorPayout;
  return { gross, directCosts, netPool, authorPayout, labContribution, marginPct: labContribution / gross };
}

/* ============================================================
   T1: OVERVIEW
   ============================================================ */
function Overview({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    (async () => {
      const [
        { count: orders },
        { data: rev },
        { count: subs },
        { count: pendingApps },
        { count: pendingThemes },
        { data: recentOrders },
      ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("order_financials").select("little_amour_contribution, gross_price"),
        supabase.from("email_subscribers").select("*", { count: "exact", head: true }),
        supabase.from("author_applications").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("proposed_categories").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
      ]);
      const totalRevenue = (rev || []).reduce((s, r) => s + Number(r.gross_price || 0), 0);
      const totalContrib = (rev || []).reduce((s, r) => s + Number(r.little_amour_contribution || 0), 0);
      setStats({ orders: orders || 0, totalRevenue, totalContrib, subs: subs || 0, pendingApps: pendingApps || 0, pendingThemes: pendingThemes || 0 });
      setRecent(recentOrders || []);
    })();
  }, []);

  if (!stats) return <Empty>Loading overview…</Empty>;
  const progress = Math.min(100, (stats.totalContrib / GOAL) * 100);

  return (
    <div>
      <PageTitle title="Overview" sub="Your business at a glance" />
      <div className="ov-grid">
        <StatCard label="Total Revenue" value={fmt(stats.totalRevenue)} color={P.green} />
        <StatCard label="$100K Progress" value={`${progress.toFixed(1)}%`} color={P.gold} />
        <StatCard label="Orders" value={stats.orders} />
        <StatCard label="Subscribers" value={stats.subs} />
        <StatCard label="New Applications" value={stats.pendingApps} color={stats.pendingApps > 0 ? P.mauve : undefined} alert={stats.pendingApps > 0} onClick={() => onNavigate("applications")} />
        <StatCard label="Pending Themes" value={stats.pendingThemes} color={stats.pendingThemes > 0 ? P.gold : undefined} alert={stats.pendingThemes > 0} onClick={() => onNavigate("themes")} />
      </div>
      <div className="goal-bar-wrap" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span className="a-meta">$100K Contribution Goal</span>
          <span className="a-meta">{fmt(stats.totalContrib)} of {fmt(GOAL)}</span>
        </div>
        <div className="goal-bar"><div className="goal-fill" style={{ width: progress + "%" }} /></div>
      </div>
      <Section title="Recent Orders">
        {recent.length === 0 ? (
          <p className="a-meta">No orders yet — they appear here once sales begin.</p>
        ) : (
          <table className="a-table">
            <thead><tr><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recent.map(o => (
                <tr key={o.id}>
                  <td>{o.customer_email || <span style={{color:P.inkSoft}}>Guest</span>}</td>
                  <td>{fmt(o.total_amount)}</td>
                  <td><Chip status={o.status} /></td>
                  <td style={{color:P.inkSoft,fontSize:12}}>{fmtDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}

/* ============================================================
   T1: ORDERS
   ============================================================ */
function Orders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("orders").select("*, order_financials(book_id, format_type, gross_price, little_amour_contribution)").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }

  const visible = rows.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.customer_email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRevenue = rows.reduce((s, r) => s + Number(r.total_amount || 0), 0);

  return (
    <div>
      <PageTitle title="Orders" sub={`${rows.length} total · ${fmt(totalRevenue)} revenue`} />
      <div className="toolbar">
        <input className="search-input" placeholder="Search by email…" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="filter-pills">
          {["all","completed","refunded","pending"].map(s => (
            <button key={s} className={"pill" + (filter === s ? " on" : "")} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>
      {loading ? <Empty>Loading…</Empty> : visible.length === 0 ? (
        <Empty>{rows.length === 0 ? "No orders yet. Connect Stripe to start recording sales." : "No orders match that filter."}</Empty>
      ) : (
        <table className="a-table">
          <thead><tr><th>Customer</th><th>Total</th><th>Items</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {visible.map(o => (
              <tr key={o.id}>
                <td>{o.customer_email || <span style={{color:P.inkSoft}}>Guest</span>}</td>
                <td><strong>{fmt(o.total_amount)}</strong></td>
                <td style={{color:P.inkSoft,fontSize:12}}>{o.order_financials?.length || 0} item{o.order_financials?.length !== 1 ? "s" : ""}</td>
                <td><Chip status={o.status} /></td>
                <td style={{color:P.inkSoft,fontSize:12}}>{fmtDate(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ============================================================
   T1: EMAIL SUBSCRIBERS
   ============================================================ */
function EmailSubscribers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("email_subscribers").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  function exportCSV() {
    const csv = ["email,source,joined", ...rows.map(r => `${r.email},${r.source || "store"},${r.created_at?.slice(0,10)}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "subscribers.csv";
    a.click();
  }

  return (
    <div>
      <PageTitle title="Email Subscribers" sub={`${rows.length} subscribers`} action={rows.length > 0 && <button className="a-btn" onClick={exportCSV}>Export CSV</button>} />
      {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? (
        <Empty>No subscribers yet. The email capture on the store will populate this list.</Empty>
      ) : (
        <table className="a-table">
          <thead><tr><th>Email</th><th>Source</th><th>Joined</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td><span className="tag">{r.source || "store"}</span></td>
                <td style={{color:P.inkSoft,fontSize:12}}>{fmtDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ============================================================
   T1: ANALYTICS
   ============================================================ */
function Analytics() {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("page_views").select("page, book_id, pack_id, created_at").order("created_at", { ascending: false }).limit(500).then(({ data }) => {
      setViews(data || []);
      setLoading(false);
    });
  }, []);

  const byPage = views.reduce((acc, v) => {
    acc[v.page] = (acc[v.page] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(byPage).sort(([,a],[,b]) => b - a);
  const max = sorted[0]?.[1] || 1;

  const last7 = new Date(Date.now() - 7 * 86400000);
  const recent = views.filter(v => new Date(v.created_at) > last7).length;

  return (
    <div>
      <PageTitle title="Analytics" sub="Page views tracked via Supabase" />
      {loading ? <Empty>Loading…</Empty> : views.length === 0 ? (
        <Empty>No page views tracked yet. Analytics are recorded once visitors browse the store.</Empty>
      ) : (
        <>
          <div className="ov-grid" style={{marginBottom:24}}>
            <StatCard label="Total Page Views" value={views.length} />
            <StatCard label="Last 7 Days" value={recent} color={P.blue} />
            <StatCard label="Unique Pages" value={sorted.length} />
          </div>
          <Section title="Top Pages">
            <div className="bar-chart">
              {sorted.slice(0,10).map(([page, count]) => (
                <div key={page} className="bar-row">
                  <span className="bar-label">{page}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="bar-count">{count}</span>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

/* ============================================================
   T2: BOOKS MANAGER
   ============================================================ */
function BooksManager() {
  const [rows, setRows] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [rules, setRules] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    const [{ data: books }, { data: auths }, { data: rls }] = await Promise.all([
      supabase.from("books_pricing").select("*, authors(name)").order("title"),
      supabase.from("authors").select("id, name"),
      supabase.from("royalty_rules").select("id, name"),
    ]);
    setRows(books || []); setAuthors(auths || []); setRules(rls || []); setLoading(false);
  }
  async function save(row) {
    setSaving(true);
    const { id, created_at, authors: _, ...rest } = row;
    if (id) await supabase.from("books_pricing").update(rest).eq("id", id);
    else await supabase.from("books_pricing").insert(rest);
    setSaving(false); setEditing(null); load();
  }

  return (
    <div>
      <PageTitle title="Books" sub={`${rows.length} books in pricing database`} action={<button className="a-btn" onClick={() => setEditing({ ownership_type: "house" })}>+ Add Book</button>} />
      {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? (
        <Empty>No books in the pricing database yet. Add books to link them to pricing rules and royalties.</Empty>
      ) : (
        <table className="a-table">
          <thead><tr><th>Title</th><th>Key</th><th>Author</th><th>Ownership</th><th>Royalty Rule</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td><strong>{r.title}</strong></td>
                <td><code style={{fontSize:11,color:P.inkSoft}}>{r.book_key}</code></td>
                <td>{r.authors?.name || <span style={{color:P.inkSoft}}>House</span>}</td>
                <td><Chip status={r.ownership_type} /></td>
                <td style={{fontSize:12,color:P.inkSoft}}>{rules.find(x => x.id === r.royalty_rule_id)?.name || "—"}</td>
                <td><button className="a-link" onClick={() => setEditing({...r})}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && (
        <Modal title={editing.id ? "Edit Book" : "Add Book"} onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Title<input value={editing.title || ""} onChange={e => setEditing(p => ({...p, title: e.target.value}))} /></label>
            <label>Book key (matches BOOKS array)<input value={editing.book_key || ""} onChange={e => setEditing(p => ({...p, book_key: e.target.value}))} /></label>
            <div className="a-row">
              <label>Author
                <select value={editing.author_id || ""} onChange={e => setEditing(p => ({...p, author_id: e.target.value || null}))}>
                  <option value="">House book</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
              <label>Ownership
                <select value={editing.ownership_type || "house"} onChange={e => setEditing(p => ({...p, ownership_type: e.target.value}))}>
                  <option value="house">House</option>
                  <option value="author">Author</option>
                </select>
              </label>
            </div>
            <label>Royalty Rule
              <select value={editing.royalty_rule_id || ""} onChange={e => setEditing(p => ({...p, royalty_rule_id: e.target.value || null}))}>
                <option value="">Default</option>
                {rules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   T2: AUTHOR APPLICATIONS
   ============================================================ */
function AuthorApplications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("new");
  const [saving, setSaving] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("author_applications").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }
  async function decide(id, status) {
    setSaving(id);
    await supabase.from("author_applications").update({ status, admin_note: notes[id] || null, reviewed_at: new Date().toISOString() }).eq("id", id);
    setSaving(null);
    load();
  }

  const STATUS_COLORS = { new: P.mauve, reviewing: P.blue, approved: P.green, rejected: P.red, waitlisted: P.gold };
  const visible = filter === "all" ? rows : rows.filter(r => r.status === filter);
  const newCount = rows.filter(r => r.status === "new").length;

  return (
    <div>
      <PageTitle title="Author Applications" sub={`${rows.length} total · ${newCount} new`} />
      <div className="filter-pills" style={{marginBottom:20}}>
        {["new","reviewing","approved","waitlisted","rejected","all"].map(s => (
          <button key={s} className={"pill" + (filter === s ? " on" : "")} onClick={() => setFilter(s)}>{s} {s !== "all" && `(${rows.filter(r => r.status === s).length})`}</button>
        ))}
      </div>
      {loading ? <Empty>Loading…</Empty> : visible.length === 0 ? (
        <Empty>No applications with status “{filter}” yet.</Empty>
      ) : visible.map(r => (
        <div key={r.id} className="app-card">
          <div className="app-header">
            <div>
              <strong className="app-name">{r.name}</strong>
              {r.pen_name && <span className="app-pen">(pen: {r.pen_name})</span>}
              <a href={`mailto:${r.email}`} className="app-email">{r.email}</a>
            </div>
            <span className="cat-badge" style={{background: STATUS_COLORS[r.status] + "22", color: STATUS_COLORS[r.status]}}>{r.status}</span>
          </div>
          {r.book_title && <p className="app-field"><strong>Book title:</strong> {r.book_title}</p>}
          {r.book_idea && <p className="app-field"><strong>Story idea:</strong> {r.book_idea}</p>}
          {r.theme && <p className="app-field"><strong>Theme:</strong> {r.theme}{r.suggested_theme_name ? ` → suggested: “${r.suggested_theme_name}”` : ""}</p>}
          {r.stage && <p className="app-field" style={{color:P.inkSoft}}><strong>Stage:</strong> {r.stage}</p>}
          <p style={{fontSize:12,color:P.inkSoft,marginBottom:12}}>{fmtDate(r.created_at)}{r.admin_note && <> · Note: {r.admin_note}</>}</p>
          {(r.status === "new" || r.status === "reviewing") && (
            <div className="cat-actions">
              <input
                className="cat-note-input"
                placeholder="Note for your records (optional)…"
                value={notes[r.id] || ""}
                onChange={e => setNotes({...notes, [r.id]: e.target.value})}
              />
              <button className="a-btn" style={{background:P.blue}} disabled={saving===r.id} onClick={() => decide(r.id,"reviewing")}>Mark Reviewing</button>
              <button className="a-btn gold" disabled={saving===r.id} onClick={() => decide(r.id,"approved")}>✓ Approve</button>
              <button className="a-btn" style={{background:P.gold,color:P.ink}} disabled={saving===r.id} onClick={() => decide(r.id,"waitlisted")}>Waitlist</button>
              <button className="a-btn" style={{background:"#FADEDB",color:P.red}} disabled={saving===r.id} onClick={() => decide(r.id,"rejected")}>✕ Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   T2: PROPOSED CATEGORIES (existing, kept)
   ============================================================ */
function ProposedCategories() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [note, setNote] = useState({});

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("proposed_categories").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }
  async function decide(id, status) {
    setSaving(id);
    await supabase.from("proposed_categories").update({ status, admin_note: note[id] || null, reviewed_at: new Date().toISOString() }).eq("id", id);
    setSaving(null);
    load();
  }

  const pending = rows.filter(r => r.status === "pending");
  const decided = rows.filter(r => r.status !== "pending");

  return (
    <div>
      <PageTitle title="Proposed Themes" sub={`${pending.length} pending review`} />
      {loading ? <Empty>Loading…</Empty> : pending.length === 0 && decided.length === 0 ? (
        <Empty>No theme proposals yet. When an author suggests a new theme in their application, it appears here.</Empty>
      ) : (
        <>
          {pending.map(r => (
            <div key={r.id} className="cat-card cat-pending">
              <div className="cat-header">
                <strong className="cat-name">{r.name}</strong>
                <span className="cat-badge pending">Pending</span>
              </div>
              {r.description && <p className="cat-desc">{r.description}</p>}
              {r.example_book_idea && <p className="cat-example"><em>Example book idea:</em> {r.example_book_idea}</p>}
              <p className="cat-meta">Proposed by {r.proposed_by || "anonymous"} · {fmtDate(r.created_at)}</p>
              <div className="cat-actions">
                <input className="cat-note-input" placeholder="Optional note…" value={note[r.id] || ""} onChange={e => setNote({...note, [r.id]: e.target.value})} />
                <button className="a-btn gold" disabled={saving===r.id} onClick={() => decide(r.id,"approved")}>✓ Approve</button>
                <button className="a-btn" style={{background:"#FADEDB",color:P.red}} disabled={saving===r.id} onClick={() => decide(r.id,"rejected")}>✕ Reject</button>
              </div>
            </div>
          ))}
          {decided.length > 0 && (
            <Section title="Reviewed">
              <table className="a-table">
                <thead><tr><th>Theme</th><th>Proposed by</th><th>Status</th><th>Note</th><th>Date</th></tr></thead>
                <tbody>
                  {decided.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.name}</strong></td>
                      <td style={{fontSize:12}}>{r.proposed_by || "—"}</td>
                      <td><span className={"cat-badge " + r.status}>{r.status}</span></td>
                      <td style={{fontSize:12,color:P.inkSoft}}>{r.admin_note || "—"}</td>
                      <td style={{fontSize:12,color:P.inkSoft}}>{fmtDate(r.reviewed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
   T2: AMORA CHAT LOGS
   ============================================================ */
function ChatLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    supabase.from("chat_logs").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageTitle title="Amora Chat Logs" sub="Conversations from the AI assistant" />
      {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? (
        <Empty>No chat logs yet. Amora conversations will appear here once the logging hook is active. This is your gold mine for knowing what books to write next.</Empty>
      ) : (
        <table className="a-table">
          <thead><tr><th>Session</th><th>Book</th><th>Messages</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <React.Fragment key={r.id}>
                <tr>
                  <td style={{fontSize:11,color:P.inkSoft,fontFamily:"monospace"}}>{r.session_id?.slice(0,8) || "—"}</td>
                  <td>{r.book_id || <span style={{color:P.inkSoft}}>General</span>}</td>
                  <td>{r.message_count || r.messages?.length || 0}</td>
                  <td style={{fontSize:12,color:P.inkSoft}}>{fmtDate(r.created_at)}</td>
                  <td><button className="a-link" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>{expanded === r.id ? "Hide" : "View"}</button></td>
                </tr>
                {expanded === r.id && r.messages && (
                  <tr>
                    <td colSpan={5} style={{padding:"12px 10px",background:P.cream}}>
                      <div style={{maxHeight:300,overflowY:"auto",fontSize:13,lineHeight:1.5}}>
                        {(Array.isArray(r.messages) ? r.messages : []).map((m, i) => (
                          <div key={i} style={{marginBottom:8}}>
                            <strong style={{color: m.role === "user" ? P.mauve : P.sage}}>{m.role === "user" ? "User" : "Amora"}:</strong>{" "}
                            <span style={{color:P.ink}}>{m.content}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ============================================================
   T3: SPONSOR CRM
   ============================================================ */
function SponsorCRM() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("sponsor_crm").select("*").order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  }
  async function save(row) {
    setSaving(true);
    const { id, created_at, ...rest } = row;
    rest.updated_at = new Date().toISOString();
    if (id) await supabase.from("sponsor_crm").update(rest).eq("id", id);
    else await supabase.from("sponsor_crm").insert(rest);
    setSaving(false); setEditing(null); load();
  }

  const STATUS_COLORS = { prospect: P.inkSoft, contacted: P.blue, negotiating: P.gold, active: P.green, renewal: P.mauve, closed: P.red };
  const STATUSES = ["prospect","contacted","negotiating","active","renewal","closed"];
  const active = rows.filter(r => r.status === "active");
  const totalActive = active.reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div>
      <PageTitle title="Sponsors" sub={`${rows.length} relationships · ${fmt(totalActive)} active`} action={<button className="a-btn" onClick={() => setEditing({ status: "prospect" })}>+ Add Sponsor</button>} />
      <div className="pipeline">
        {STATUSES.map(s => {
          const count = rows.filter(r => r.status === s).length;
          return (
            <div key={s} className="pipeline-stage" style={{borderTopColor: STATUS_COLORS[s]}}>
              <div className="pipeline-label">{s}</div>
              <div className="pipeline-count" style={{color: STATUS_COLORS[s]}}>{count}</div>
            </div>
          );
        })}
      </div>
      {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? (
        <Empty>No sponsors tracked yet. Add prospects as you reach out.</Empty>
      ) : (
        <table className="a-table">
          <thead><tr><th>Company</th><th>Contact</th><th>Package</th><th>Value</th><th>Status</th><th>Renewal</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td><strong>{r.company_name}</strong></td>
                <td>
                  <div style={{fontSize:13}}>{r.contact_name || "—"}</div>
                  {r.contact_email && <a href={`mailto:${r.contact_email}`} style={{fontSize:11,color:P.blue}}>{r.contact_email}</a>}
                </td>
                <td style={{fontSize:12}}>{r.package || "—"}</td>
                <td>{r.amount ? fmt(r.amount) : "—"}</td>
                <td><span className="cat-badge" style={{background: STATUS_COLORS[r.status] + "22", color: STATUS_COLORS[r.status]}}>{r.status}</span></td>
                <td style={{fontSize:12,color: r.renewal_date && new Date(r.renewal_date) < new Date(Date.now() + 30*86400000) ? P.red : P.inkSoft}}>{r.renewal_date ? new Date(r.renewal_date).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"}) : "—"}</td>
                <td><button className="a-link" onClick={() => setEditing({...r})}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {editing && (
        <Modal title={editing.id ? "Edit Sponsor" : "Add Sponsor"} onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Company name<input value={editing.company_name || ""} onChange={e => setEditing(p => ({...p, company_name: e.target.value}))} /></label>
            <div className="a-row">
              <label>Contact name<input value={editing.contact_name || ""} onChange={e => setEditing(p => ({...p, contact_name: e.target.value}))} /></label>
              <label>Contact email<input type="email" value={editing.contact_email || ""} onChange={e => setEditing(p => ({...p, contact_email: e.target.value}))} /></label>
            </div>
            <div className="a-row">
              <label>Package<input value={editing.package || ""} placeholder="e.g. Sponsor Library × 1 year" onChange={e => setEditing(p => ({...p, package: e.target.value}))} /></label>
              <label>Value ($)<input type="number" step="0.01" value={editing.amount || ""} onChange={e => setEditing(p => ({...p, amount: e.target.value}))} /></label>
            </div>
            <div className="a-row">
              <label>Status
                <select value={editing.status || "prospect"} onChange={e => setEditing(p => ({...p, status: e.target.value}))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label>Renewal date<input type="date" value={editing.renewal_date || ""} onChange={e => setEditing(p => ({...p, renewal_date: e.target.value}))} /></label>
            </div>
            <label>Notes<textarea rows={3} value={editing.notes || ""} onChange={e => setEditing(p => ({...p, notes: e.target.value}))} /></label>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   FINANCE: $100K GOAL
   ============================================================ */
function GoalDashboard() {
  const [financials, setFinancials] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("order_financials").select("*"),
      supabase.from("sponsor_funds").select("amount_received, amount_used"),
    ]).then(([{ data: fin }, { data: sp }]) => {
      setFinancials(fin || []); setSponsors(sp || []); setLoading(false);
    });
  }, []);

  const totalContrib = financials.reduce((s, r) => s + Number(r.little_amour_contribution || 0), 0);
  const totalRevenue = financials.reduce((s, r) => s + Number(r.gross_price || 0), 0);
  const totalAuthor = financials.reduce((s, r) => s + Number(r.author_payout || 0), 0);
  const totalCosts = financials.reduce((s, r) => s + Number(r.direct_costs || 0), 0);
  const sponsorTotal = sponsors.reduce((s, r) => s + Number(r.amount_received || 0), 0);
  const progress = Math.min(100, (totalContrib / GOAL) * 100);
  const avg = financials.length ? totalContrib / financials.length : 0;
  const needed = avg > 0 ? Math.ceil((GOAL - totalContrib) / avg) : null;

  return (
    <div>
      <PageTitle title="$100K Goal" sub="Contribution progress tracker" />
      {loading ? <Empty>Loading…</Empty> : (
        <>
          <div className="goal-bar-wrap" style={{marginBottom:28}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span className="a-meta">Progress to $100,000</span>
              <span className="a-meta">{fmt(totalContrib)} of {fmt(GOAL)} · {progress.toFixed(1)}%</span>
            </div>
            <div className="goal-bar"><div className="goal-fill" style={{width: progress + "%"}} /></div>
          </div>
          <div className="ov-grid">
            <StatCard label="Gross Revenue" value={fmt(totalRevenue)} />
            <StatCard label="Direct Costs" value={fmt(totalCosts)} color={P.red} />
            <StatCard label="Author Payouts" value={fmt(totalAuthor)} color={P.mauve} />
            <StatCard label="Little Amour Contribution" value={fmt(totalContrib)} color={P.green} />
            <StatCard label="Total Orders" value={financials.length} />
            <StatCard label="Avg Contribution/Sale" value={fmt(avg)} />
            <StatCard label="Sponsor Funds" value={fmt(sponsorTotal)} color={P.blue} />
            {needed != null && <StatCard label="More Sales to $100K" value={needed.toLocaleString()} color={P.gold} />}
          </div>
          {financials.length === 0 && <Empty style={{marginTop:16}}>No order data yet — revenue will appear here once sales are recorded.</Empty>}
        </>
      )}
    </div>
  );
}

/* ============================================================
   FINANCE: SIMULATOR
   ============================================================ */
function Simulator() {
  const [costs, setCosts] = useState([]);
  const [form, setForm] = useState({ label: "Website digital – standard", price: 7.00, format_type: "website_digital", ownership_type: "author", author_pct: 0.70 });

  useEffect(() => {
    supabase.from("cost_assumptions").select("*").then(({ data }) => setCosts(data || []));
  }, []);

  const f = (k, v) => setForm(p => ({...p, [k]: v}));
  const costRow = costs.find(c => c.format_type === form.format_type);
  const result = calcFinancials({ price: form.price, costRow, authorPct: form.ownership_type === "author" ? form.author_pct : 0 });
  const salesTo100k = result ? Math.ceil(GOAL / result.labContribution) : null;

  return (
    <div>
      <PageTitle title="Pricing Simulator" sub="Model revenue before you price a product" />
      <div className="sim-grid">
        <div className="sim-inputs">
          <label className="a-form-label">Label<input value={form.label} onChange={e => f("label", e.target.value)} className="a-input" /></label>
          <div className="a-row">
            <label className="a-form-label">Sale price<input type="number" step="0.01" value={form.price} onChange={e => f("price", Number(e.target.value))} className="a-input" /></label>
            <label className="a-form-label">Format
              <select value={form.format_type} onChange={e => f("format_type", e.target.value)} className="a-input">
                {costs.map(c => <option key={c.format_type} value={c.format_type}>{c.format_type}</option>)}
              </select>
            </label>
          </div>
          <div className="a-row">
            <label className="a-form-label">Ownership
              <select value={form.ownership_type} onChange={e => f("ownership_type", e.target.value)} className="a-input">
                <option value="house">House book</option>
                <option value="author">Author book</option>
              </select>
            </label>
            {form.ownership_type === "author" && (
              <label className="a-form-label">Author %<input type="number" step="0.01" min="0" max="1" value={form.author_pct} onChange={e => f("author_pct", Number(e.target.value))} className="a-input" /></label>
            )}
          </div>
          {costRow && (
            <div style={{background:P.cream,borderRadius:8,padding:12,fontSize:12}}>
              <p className="a-meta" style={{marginBottom:8}}>Cost breakdown for <strong>{form.format_type}</strong></p>
              <table className="a-table tight">
                <tbody>
                  <tr><td>Print</td><td>{fmt(costRow.print_cost)}</td></tr>
                  <tr><td>Processing</td><td>{fmt((form.price*costRow.payment_processing_pct)+Number(costRow.payment_processing_fixed))}</td></tr>
                  <tr><td>Platform fee</td><td>{fmt(form.price*costRow.platform_fee_pct)}</td></tr>
                  <tr><td>Fulfillment</td><td>{fmt(costRow.fulfillment_cost)}</td></tr>
                  <tr><td>AI reserve</td><td>{fmt(costRow.ai_token_reserve)}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="sim-result">
          {result ? (
            <>
              <div className="sim-line"><span>Gross revenue</span><strong>{fmt(result.gross)}</strong></div>
              <div className="sim-line"><span>Direct costs</span><strong style={{color:P.rose}}>- {fmt(result.directCosts)}</strong></div>
              <div className="sim-line"><span>Net pool</span><strong>{fmt(result.netPool)}</strong></div>
              {form.ownership_type === "author" && <div className="sim-line"><span>Author ({pct(form.author_pct)})</span><strong style={{color:"#C9A8D4"}}>- {fmt(result.authorPayout)}</strong></div>}
              <div className="sim-line big"><span>Little Amour</span><strong style={{color:"#7FD4A8"}}>{fmt(result.labContribution)}</strong></div>
              <div className="sim-line"><span>Margin</span><strong>{pct(result.marginPct)}</strong></div>
              <div className="sim-goal"><span>Sales to $100K</span><strong>{salesTo100k?.toLocaleString() ?? "—"}</strong></div>
            </>
          ) : <p style={{color:"#ffffff88",fontSize:13}}>Select a format to see results.</p>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FINANCE: PRICING SETTINGS
   ============================================================ */
function PricingSettings() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("pricing_settings").select("*").order("product_type");
    setRows(data || []);
  }
  async function save(row) {
    setSaving(true);
    if (row.id) await supabase.from("pricing_settings").update({ name: row.name, default_price: row.default_price, min_price: row.min_price, max_price: row.max_price, is_pay_what_you_can: row.is_pay_what_you_can, is_active: row.is_active, updated_at: new Date().toISOString() }).eq("id", row.id);
    else await supabase.from("pricing_settings").insert(row);
    setSaving(false); setEditing(null); load();
  }

  return (
    <div>
      <PageTitle title="Pricing" sub="Default prices by product type" action={<button className="a-btn" onClick={() => setEditing({ product_type: "website_digital", is_pay_what_you_can: false, is_active: true })}>+ Add</button>} />
      <table className="a-table">
        <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th><th>PWYW</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{opacity: r.is_active ? 1 : 0.45}}>
              <td>{r.name}</td>
              <td><code style={{fontSize:11}}>{r.product_type}</code></td>
              <td>{fmt(r.default_price)}</td>
              <td>{fmt(r.min_price)}</td>
              <td>{fmt(r.max_price)}</td>
              <td>{r.is_pay_what_you_can ? "✓" : ""}</td>
              <td>{r.is_active ? "✓" : "—"}</td>
              <td><button className="a-link" onClick={() => setEditing({...r})}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title={editing.id ? "Edit Price" : "Add Price"} onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Name<input value={editing.name || ""} onChange={e => setEditing(p => ({...p, name: e.target.value}))} /></label>
            <label>Product type<input value={editing.product_type || ""} onChange={e => setEditing(p => ({...p, product_type: e.target.value}))} /></label>
            <div className="a-row">
              <label>Default<input type="number" step="0.01" value={editing.default_price || ""} onChange={e => setEditing(p => ({...p, default_price: e.target.value}))} /></label>
              <label>Min<input type="number" step="0.01" value={editing.min_price || ""} onChange={e => setEditing(p => ({...p, min_price: e.target.value}))} /></label>
              <label>Max<input type="number" step="0.01" value={editing.max_price || ""} onChange={e => setEditing(p => ({...p, max_price: e.target.value}))} /></label>
            </div>
            <div className="a-row">
              <label className="a-check"><input type="checkbox" checked={!!editing.is_pay_what_you_can} onChange={e => setEditing(p => ({...p, is_pay_what_you_can: e.target.checked}))} /> Pay-what-you-can</label>
              <label className="a-check"><input type="checkbox" checked={!!editing.is_active} onChange={e => setEditing(p => ({...p, is_active: e.target.checked}))} /> Active</label>
            </div>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   FINANCE: COST ASSUMPTIONS
   ============================================================ */
function CostAssumptions() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("cost_assumptions").select("*").order("format_type");
    setRows(data || []);
  }
  async function save(row) {
    setSaving(true);
    const { id, created_at, ...rest } = row;
    if (id) await supabase.from("cost_assumptions").update(rest).eq("id", id);
    else await supabase.from("cost_assumptions").insert(rest);
    setSaving(false); setEditing(null); load();
  }

  return (
    <div>
      <PageTitle title="Cost Assumptions" sub="Per-format cost breakdown for margin calculations" action={<button className="a-btn" onClick={() => setEditing({ format_type: "", print_cost: 0, payment_processing_pct: 0.029, payment_processing_fixed: 0.30, fulfillment_cost: 0, platform_fee_pct: 0, digital_delivery_cost: 0, ai_token_reserve: 0 })}>+ Add</button>} />
      <table className="a-table">
        <thead><tr><th>Format</th><th>Print</th><th>Processing</th><th>Fulfillment</th><th>Platform %</th><th>AI Reserve</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><code style={{fontSize:11}}>{r.format_type}</code></td>
              <td>{fmt(r.print_cost)}</td>
              <td>{fmt(r.payment_processing_fixed)} + {pct(r.payment_processing_pct)}</td>
              <td>{fmt(r.fulfillment_cost)}</td>
              <td>{pct(r.platform_fee_pct)}</td>
              <td>{fmt(r.ai_token_reserve)}</td>
              <td style={{fontSize:11,color:P.inkSoft}}>{r.notes}</td>
              <td><button className="a-link" onClick={() => setEditing({...r})}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title="Cost Assumptions" onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Format type<input value={editing.format_type || ""} onChange={e => setEditing(p => ({...p, format_type: e.target.value}))} /></label>
            <div className="a-row">
              <label>Print cost<input type="number" step="0.01" value={editing.print_cost || 0} onChange={e => setEditing(p => ({...p, print_cost: e.target.value}))} /></label>
              <label>Processing %<input type="number" step="0.001" value={editing.payment_processing_pct || 0} onChange={e => setEditing(p => ({...p, payment_processing_pct: e.target.value}))} /></label>
              <label>Processing fixed<input type="number" step="0.01" value={editing.payment_processing_fixed || 0} onChange={e => setEditing(p => ({...p, payment_processing_fixed: e.target.value}))} /></label>
            </div>
            <div className="a-row">
              <label>Fulfillment<input type="number" step="0.01" value={editing.fulfillment_cost || 0} onChange={e => setEditing(p => ({...p, fulfillment_cost: e.target.value}))} /></label>
              <label>Platform %<input type="number" step="0.001" value={editing.platform_fee_pct || 0} onChange={e => setEditing(p => ({...p, platform_fee_pct: e.target.value}))} /></label>
              <label>AI reserve<input type="number" step="0.01" value={editing.ai_token_reserve || 0} onChange={e => setEditing(p => ({...p, ai_token_reserve: e.target.value}))} /></label>
            </div>
            <label>Notes<input value={editing.notes || ""} onChange={e => setEditing(p => ({...p, notes: e.target.value}))} /></label>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   FINANCE: ROYALTY RULES
   ============================================================ */
function RoyaltyRules() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("royalty_rules").select("*").order("name");
    setRows(data || []);
  }
  async function save(row) {
    setSaving(true);
    const { id, created_at, ...rest } = row;
    if (id) await supabase.from("royalty_rules").update(rest).eq("id", id);
    else await supabase.from("royalty_rules").insert(rest);
    setSaving(false); setEditing(null); load();
  }

  return (
    <div>
      <PageTitle title="Royalty Rules" action={<button className="a-btn" onClick={() => setEditing({ ownership_type: "author", author_pct: 0.70, platform_pct: 0.30, deduct_production_costs: true, is_default: false })}>+ Add</button>} />
      <table className="a-table">
        <thead><tr><th>Name</th><th>Type</th><th>Author %</th><th>Little Amour %</th><th>Deduct costs</th><th>Default</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{fontWeight: r.is_default ? 600 : 400}}>
              <td>{r.name}</td>
              <td>{r.ownership_type}</td>
              <td>{pct(r.author_pct)}</td>
              <td>{pct(r.platform_pct)}</td>
              <td>{r.deduct_production_costs ? "✓" : "—"}</td>
              <td>{r.is_default ? "✓" : ""}</td>
              <td><button className="a-link" onClick={() => setEditing({...r})}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title="Royalty Rule" onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Name<input value={editing.name || ""} onChange={e => setEditing(p => ({...p, name: e.target.value}))} /></label>
            <div className="a-row">
              <label>Type
                <select value={editing.ownership_type} onChange={e => setEditing(p => ({...p, ownership_type: e.target.value}))}>
                  <option value="house">House</option>
                  <option value="author">Author</option>
                </select>
              </label>
              <label>Author %<input type="number" step="0.01" min="0" max="1" value={editing.author_pct || 0} onChange={e => setEditing(p => ({...p, author_pct: e.target.value, platform_pct: (1-Number(e.target.value)).toFixed(5)}))} /></label>
              <label>Platform %<input type="number" step="0.01" value={editing.platform_pct || 0} onChange={e => setEditing(p => ({...p, platform_pct: e.target.value}))} /></label>
            </div>
            <div className="a-row">
              <label className="a-check"><input type="checkbox" checked={!!editing.deduct_production_costs} onChange={e => setEditing(p => ({...p, deduct_production_costs: e.target.checked}))} /> Deduct production costs</label>
              <label className="a-check"><input type="checkbox" checked={!!editing.is_default} onChange={e => setEditing(p => ({...p, is_default: e.target.checked}))} /> Default rule</label>
            </div>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   FINANCE: PRODUCTION COSTS
   ============================================================ */
function ProductionCosts() {
  const [rows, setRows] = useState([]);
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const [{ data: costs }, { data: bks }] = await Promise.all([
      supabase.from("production_cost_ledger").select("*, books_pricing(title)").order("created_at", { ascending: false }),
      supabase.from("books_pricing").select("id, title"),
    ]);
    setRows(costs || []); setBooks(bks || []);
  }
  async function save(row) {
    setSaving(true);
    const { id, created_at, books_pricing: _, ...rest } = row;
    if (id) await supabase.from("production_cost_ledger").update(rest).eq("id", id);
    else await supabase.from("production_cost_ledger").insert(rest);
    setSaving(false); setEditing(null); load();
  }

  const total = rows.reduce((s, r) => s + Number(r.amount), 0);
  const STATUS_MAP = { paid_upfront: P.green, deduct_from_royalties: P.gold, sponsored: P.mauve, waived: P.inkSoft, absorbed: P.night };

  return (
    <div>
      <PageTitle title="Production Costs" sub={`Total tracked: ${fmt(total)}`} action={<button className="a-btn" onClick={() => setEditing({ cost_type: "ai_tokens", amount: 0, status: "absorbed" })}>+ Add Cost</button>} />
      <table className="a-table">
        <thead><tr><th>Book</th><th>Type</th><th>Amount</th><th>Status</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.books_pricing?.title || "—"}</td>
              <td><code style={{fontSize:11}}>{r.cost_type}</code></td>
              <td>{fmt(r.amount)}</td>
              <td><span className="cat-badge" style={{background: (STATUS_MAP[r.status]||P.inkSoft)+"22", color: STATUS_MAP[r.status]||P.inkSoft}}>{r.status?.replace(/_/g," ")}</span></td>
              <td style={{fontSize:11,color:P.inkSoft}}>{r.notes}</td>
              <td><button className="a-link" onClick={() => setEditing({...r})}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title="Production Cost" onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Book
              <select value={editing.book_id || ""} onChange={e => setEditing(p => ({...p, book_id: e.target.value}))}>
                <option value="">— select —</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </label>
            <div className="a-row">
              <label>Cost type
                <select value={editing.cost_type} onChange={e => setEditing(p => ({...p, cost_type: e.target.value}))}>
                  {["ai_tokens","image_generation","editing","formatting","cover","upload","other"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>Amount<input type="number" step="0.01" value={editing.amount || 0} onChange={e => setEditing(p => ({...p, amount: e.target.value}))} /></label>
            </div>
            <label>Status
              <select value={editing.status} onChange={e => setEditing(p => ({...p, status: e.target.value}))}>
                {["paid_upfront","deduct_from_royalties","sponsored","waived","absorbed"].map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
              </select>
            </label>
            <label>Notes<input value={editing.notes || ""} onChange={e => setEditing(p => ({...p, notes: e.target.value}))} /></label>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   FINANCE: SPONSOR FUNDS
   ============================================================ */
function SponsorFunds() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("sponsor_funds").select("*").order("created_at", { ascending: false });
    setRows(data || []);
  }
  async function save(row) {
    setSaving(true);
    const { id, created_at, ...rest } = row;
    if (id) await supabase.from("sponsor_funds").update(rest).eq("id", id);
    else await supabase.from("sponsor_funds").insert(rest);
    setSaving(false); setEditing(null); load();
  }

  const totalReceived = rows.reduce((s, r) => s + Number(r.amount_received), 0);
  const totalRemaining = rows.reduce((s, r) => s + Number(r.amount_received) - Number(r.amount_used || 0), 0);

  return (
    <div>
      <PageTitle title="Sponsor Funds" sub={`${fmt(totalReceived)} received · ${fmt(totalRemaining)} available`} action={<button className="a-btn" onClick={() => setEditing({ recipient_type: "general_fund", amount_received: 0, amount_used: 0 })}>+ Add</button>} />
      <table className="a-table">
        <thead><tr><th>Sponsor</th><th>Type</th><th>Received</th><th>Used</th><th>Remaining</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.sponsor_name || <span style={{color:P.inkSoft}}>Anonymous</span>}</td>
              <td style={{fontSize:12}}>{r.recipient_type?.replace(/_/g," ")}</td>
              <td>{fmt(r.amount_received)}</td>
              <td>{fmt(r.amount_used)}</td>
              <td style={{color:P.green,fontWeight:600}}>{fmt(r.amount_received - r.amount_used)}</td>
              <td style={{fontSize:11,color:P.inkSoft}}>{r.notes}</td>
              <td><button className="a-link" onClick={() => setEditing({...r})}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title="Sponsor Fund" onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Sponsor name (optional)<input value={editing.sponsor_name || ""} onChange={e => setEditing(p => ({...p, sponsor_name: e.target.value}))} /></label>
            <div className="a-row">
              <label>Amount received<input type="number" step="0.01" value={editing.amount_received || 0} onChange={e => setEditing(p => ({...p, amount_received: e.target.value}))} /></label>
              <label>Amount used<input type="number" step="0.01" value={editing.amount_used || 0} onChange={e => setEditing(p => ({...p, amount_used: e.target.value}))} /></label>
            </div>
            <label>Recipient type
              <select value={editing.recipient_type} onChange={e => setEditing(p => ({...p, recipient_type: e.target.value}))}>
                {["general_fund","specific_family","specific_author","specific_book"].map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
              </select>
            </label>
            <label>Notes<textarea rows={2} value={editing.notes || ""} onChange={e => setEditing(p => ({...p, notes: e.target.value}))} /></label>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   SHARED UI
   ============================================================ */
function PageTitle({ title, sub, action }) {
  return (
    <div className="page-title">
      <div>
        <h1 className="page-h1">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="a-section">
      <div className="a-section-head">
        <h2 className="a-h2">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="a-overlay" onClick={onClose}>
      <div className="a-modal" onClick={e => e.stopPropagation()}>
        <div className="a-modal-head"><h3>{title}</h3><button className="a-close" onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, alert, onClick }) {
  return (
    <div className={"stat-card" + (alert ? " stat-alert" : "") + (onClick ? " stat-clickable" : "")} onClick={onClick} style={color ? {"--stat-color": color} : {}}>
      <span className="stat-val" style={color ? {color} : {}}>{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Chip({ status }) {
  const map = { completed: [P.green,"#fff"], refunded: [P.red,"#fff"], pending: [P.gold,P.ink], new: [P.mauve,"#fff"], house: [P.night,"#fff"], author: [P.sage,"#fff"] };
  const [bg, fg] = map[status] || [P.inkSoft,"#fff"];
  return <span style={{background:bg,color:fg,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:700,display:"inline-block"}}>{status}</span>;
}

function Empty({ children }) {
  return <p style={{color:P.inkSoft,fontSize:14,padding:"20px 0",lineHeight:1.6}}>{children}</p>;
}

/* ============================================================
   STYLES
   ============================================================ */
const ADMIN_CSS = `
* { box-sizing: border-box; }
.admin-wrap { display: flex; min-height: 100vh; background: ${P.paper}; font-family: system-ui, -apple-system, sans-serif; color: ${P.ink}; }

/* Sidebar */
.admin-sidebar { width: 216px; min-width: 216px; background: ${P.sidebar}; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-shrink: 0; }
.admin-logo { padding: 20px 18px 16px; border-bottom: 1px solid #ffffff10; }
.admin-back { background: none; border: none; color: #ffffff55; font-size: 12px; cursor: pointer; padding: 0 0 10px; display: block; }
.admin-back:hover { color: #fff; }
.admin-brand { color: #fff; font-size: 17px; font-weight: 800; letter-spacing: -.01em; }
.admin-brand-sub { font-size: 10px; font-weight: 500; color: ${P.gold}; letter-spacing: .1em; text-transform: uppercase; margin-top: 2px; }
.nav-group { padding: 16px 0 4px; }
.nav-group-label { font-size: 9px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #ffffff33; padding: 0 18px 6px; }
.nav-item { display: flex; align-items: center; justify-content: space-between; width: 100%; background: none; border: none; border-left: 3px solid transparent; color: #ffffff77; font-size: 13px; padding: 8px 18px; cursor: pointer; text-align: left; transition: all .15s; }
.nav-item:hover { background: #ffffff0d; color: #ffffffcc; }
.nav-item.on { background: #ffffff12; color: #fff; border-left-color: ${P.gold}; font-weight: 600; }
.nav-badge { background: ${P.rose}; color: #fff; border-radius: 99px; font-size: 10px; font-weight: 700; padding: 1px 6px; }

/* Main */
.admin-main { flex: 1; overflow-y: auto; min-width: 0; }
.admin-main-inner { padding: 32px; max-width: 980px; }

/* Page title */
.page-title { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; color: ${P.ink}; }
.page-sub { font-size: 13px; color: ${P.inkSoft}; margin: 0; }

/* Stat cards */
.ov-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
.stat-card { background: #fff; border: 1.5px solid #EBE0CC; border-radius: 12px; padding: 16px 18px; cursor: default; }
.stat-card.stat-alert { border-color: #D8CBE8; background: #FAF6FF; }
.stat-card.stat-clickable { cursor: pointer; }
.stat-card.stat-clickable:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }
.stat-val { display: block; font-size: 24px; font-weight: 800; color: ${P.ink}; line-height: 1; margin-bottom: 6px; }
.stat-label { display: block; font-size: 11px; color: ${P.inkSoft}; font-weight: 500; }

/* Section */
.a-section { background: #fff; border: 1.5px solid #EBE0CC; border-radius: 12px; padding: 22px; margin-bottom: 20px; }
.a-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.a-h2 { font-size: 15px; font-weight: 700; margin: 0; }

/* Table */
.a-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.a-table th { text-align: left; padding: 7px 10px; border-bottom: 2px solid #EBE0CC; font-weight: 600; font-size: 11px; color: ${P.inkSoft}; text-transform: uppercase; letter-spacing: .05em; }
.a-table td { padding: 10px 10px; border-bottom: 1px solid #F5EDE0; vertical-align: middle; }
.a-table tr:last-child td { border-bottom: none; }
.a-table.tight td, .a-table.tight th { padding: 4px 8px; }

/* Forms */
.a-form { display: flex; flex-direction: column; gap: 12px; }
.a-form label, .a-form-label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 700; color: ${P.inkSoft}; text-transform: uppercase; letter-spacing: .05em; }
.a-form input, .a-form select, .a-form textarea, .a-input { border: 1.5px solid #DDD0BB; border-radius: 7px; padding: 8px 10px; font-size: 14px; color: ${P.ink}; font-family: inherit; background: #fff; }
.a-form input:focus, .a-form select:focus, .a-form textarea:focus { outline: none; border-color: ${P.mauve}; }
.a-row { display: flex; gap: 10px; flex-wrap: wrap; }
.a-row > * { flex: 1; min-width: 110px; }
.a-check { flex-direction: row !important; align-items: center; gap: 8px !important; font-weight: 500 !important; text-transform: none !important; letter-spacing: 0 !important; font-size: 13px !important; }

/* Buttons */
.a-btn { background: ${P.night}; color: #fff; border: none; padding: 9px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; font-weight: 700; }
.a-btn:hover { opacity: .88; }
.a-btn.gold { background: ${P.gold}; color: ${P.ink}; }
.a-link { background: none; border: none; color: ${P.mauve}; font-size: 13px; cursor: pointer; text-decoration: underline; padding: 0; }

/* Modal */
.a-overlay { position: fixed; inset: 0; background: #00000066; z-index: 200; display: flex; align-items: center; justify-content: center; }
.a-modal { background: #fff; border-radius: 16px; padding: 28px; width: 560px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
.a-modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.a-modal-head h3 { margin: 0; font-size: 17px; font-weight: 800; }
.a-close { background: none; border: none; font-size: 18px; cursor: pointer; color: ${P.inkSoft}; }
.a-meta { font-size: 13px; color: ${P.inkSoft}; margin: 0 0 10px; }

/* Toolbar */
.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.search-input { border: 1.5px solid #DDD0BB; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: ${P.ink}; min-width: 220px; font-family: inherit; }
.filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pill { background: none; border: 1.5px solid #DDD0BB; border-radius: 99px; padding: 5px 12px; font-size: 12px; cursor: pointer; color: ${P.inkSoft}; font-weight: 600; }
.pill.on { background: ${P.night}; border-color: ${P.night}; color: #fff; }
.tag { background: ${P.cream}; border: 1px solid #EBE0CC; border-radius: 4px; padding: 2px 7px; font-size: 11px; font-weight: 600; color: ${P.inkSoft}; }

/* Progress bar */
.goal-bar-wrap { }
.goal-bar { height: 10px; background: #EBE0CC; border-radius: 99px; overflow: hidden; }
.goal-fill { height: 100%; background: linear-gradient(90deg, ${P.sage}, ${P.green}); border-radius: 99px; transition: width .5s; }

/* Author application cards */
.app-card { background: #fff; border: 1.5px solid #EBE0CC; border-radius: 12px; padding: 20px; margin-bottom: 14px; }
.app-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 12px; }
.app-name { font-size: 16px; font-weight: 800; display: block; }
.app-pen { font-size: 13px; color: ${P.inkSoft}; display: block; margin-top: 2px; }
.app-email { display: block; font-size: 12px; color: ${P.blue}; margin-top: 2px; text-decoration: none; }
.app-field { font-size: 13px; color: ${P.ink}; margin: 0 0 8px; line-height: 1.5; }

/* Category cards */
.cat-card { border: 1.5px solid #E9DCC8; border-radius: 10px; padding: 18px 20px; margin-bottom: 14px; }
.cat-pending { border-color: #D8CBE8; background: #FAF6FF; }
.cat-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.cat-name { font-size: 16px; }
.cat-badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 2px 9px; border-radius: 999px; }
.cat-badge.pending { background: #EDE4F8; color: ${P.mauve}; }
.cat-badge.approved { background: #D4EFE0; color: ${P.green}; }
.cat-badge.rejected { background: #FADEDB; color: ${P.red}; }
.cat-desc { font-size: 14px; color: ${P.inkSoft}; margin: 0 0 6px; }
.cat-example { font-size: 13px; color: ${P.inkSoft}; margin: 0 0 8px; }
.cat-meta { font-size: 12px; color: ${P.inkSoft}; margin: 0 0 14px; }
.cat-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.cat-note-input { flex: 1 1 200px; border: 1.5px solid #DDD0BB; border-radius: 7px; padding: 7px 10px; font-size: 13px; font-family: inherit; color: ${P.ink}; min-width: 0; }

/* Sponsor pipeline */
.pipeline { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.pipeline-stage { flex: 1; min-width: 80px; background: #fff; border: 1.5px solid #EBE0CC; border-radius: 8px; border-top: 4px solid; padding: 10px 12px; text-align: center; }
.pipeline-label { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; color: ${P.inkSoft}; margin-bottom: 4px; }
.pipeline-count { font-size: 22px; font-weight: 800; }

/* Analytics bar chart */
.bar-chart { display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-label { font-size: 12px; color: ${P.inkSoft}; width: 140px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-track { flex: 1; height: 8px; background: #EBE0CC; border-radius: 99px; overflow: hidden; }
.bar-fill { height: 100%; background: linear-gradient(90deg, ${P.mauve}, ${P.rose}); border-radius: 99px; }
.bar-count { font-size: 12px; font-weight: 700; color: ${P.ink}; width: 36px; text-align: right; }

/* Simulator */
.sim-grid { display: grid; grid-template-columns: 1fr 260px; gap: 20px; align-items: start; }
.sim-inputs { display: flex; flex-direction: column; gap: 14px; }
.sim-result { background: ${P.night}; color: #fff; border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.sim-line { display: flex; justify-content: space-between; font-size: 14px; }
.sim-line.big { border-top: 1px solid #ffffff22; padding-top: 12px; font-size: 16px; font-weight: 700; }
.sim-goal { background: #ffffff18; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 2px; font-size: 12px; margin-top: 4px; }
.sim-goal strong { font-size: 22px; font-weight: 800; }

@media (max-width: 800px) {
  .admin-sidebar { display: none; }
  .admin-main-inner { padding: 16px; }
  .sim-grid { grid-template-columns: 1fr; }
  .ov-grid { grid-template-columns: 1fr 1fr; }
}
`;

/* ============================================================
   NAV CONFIG
   ============================================================ */
const NAV_GROUPS = [
  { label: "Business", items: [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "Orders" },
    { id: "subscribers", label: "Subscribers" },
    { id: "analytics", label: "Analytics" },
  ]},
  { label: "Content", items: [
    { id: "books", label: "Books" },
    { id: "applications", label: "Applications", alertKey: "applications" },
    { id: "themes", label: "Themes", alertKey: "themes" },
    { id: "chatlogs", label: "Chat Logs" },
  ]},
  { label: "Growth", items: [
    { id: "sponsorcrm", label: "Sponsors" },
  ]},
  { label: "Finance", items: [
    { id: "goal", label: "$100K Goal" },
    { id: "simulator", label: "Simulator" },
    { id: "pricing", label: "Pricing" },
    { id: "costs", label: "Costs" },
    { id: "royalties", label: "Royalties" },
    { id: "production", label: "Production" },
    { id: "sponsorfunds", label: "Sponsor Funds" },
  ]},
];

/* ============================================================
   ROOT
   ============================================================ */
export default function AdminDashboard({ onBack }) {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passErr, setPassErr] = useState(false);
  const [tab, setTab] = useState("overview");
  const [alerts, setAlerts] = useState({ applications: 0, themes: 0 });

  if (!unlocked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0E1525" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🌙</div>
          <h2 style={{ color: "#FAF4EB", fontFamily: "Georgia, serif", marginBottom: 8 }}>Little Amour Admin</h2>
          <p style={{ color: "#8a7a9a", marginBottom: 24, fontSize: 14 }}>Enter your passcode to continue</p>
          <input
            type="password"
            value={passcode}
            onChange={e => { setPasscode(e.target.value); setPassErr(false); }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                if (passcode.trim().toLowerCase() === "love") setUnlocked(true);
                else setPassErr(true);
              }
            }}
            placeholder="Passcode"
            style={{
              display: "block", width: 220, margin: "0 auto 12px", padding: "10px 16px",
              borderRadius: 8, border: passErr ? "1.5px solid #C0392B" : "1.5px solid #2a2f45",
              background: "#131A30", color: "#FAF4EB", fontSize: 15, outline: "none", textAlign: "center",
            }}
            autoFocus
          />
          {passErr && <p style={{ color: "#C0392B", fontSize: 13, marginBottom: 8 }}>Incorrect passcode</p>}
          <button
            onClick={() => {
              if (passcode.trim().toLowerCase() === "love") setUnlocked(true);
              else setPassErr(true);
            }}
            style={{
              background: "#E2A857", color: "#131A30", border: "none", borderRadius: 8,
              padding: "10px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer",
            }}
          >Enter</button>
          <div style={{ marginTop: 20 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", color: "#5E5468", fontSize: 13, cursor: "pointer" }}>← Back to site</button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    Promise.all([
      supabase.from("author_applications").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("proposed_categories").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]).then(([apps, themes]) => {
      setAlerts({ applications: apps.count || 0, themes: themes.count || 0 });
    });
  }, []);

  const renderTab = () => {
    switch (tab) {
      case "overview":     return <Overview onNavigate={setTab} />;
      case "orders":       return <Orders />;
      case "subscribers":  return <EmailSubscribers />;
      case "analytics":    return <Analytics />;
      case "books":        return <BooksManager />;
      case "applications": return <AuthorApplications />;
      case "themes":       return <ProposedCategories />;
      case "chatlogs":     return <ChatLogs />;
      case "sponsorcrm":   return <SponsorCRM />;
      case "goal":         return <GoalDashboard />;
      case "simulator":    return <Simulator />;
      case "pricing":      return <PricingSettings />;
      case "costs":        return <CostAssumptions />;
      case "royalties":    return <RoyaltyRules />;
      case "production":   return <ProductionCosts />;
      case "sponsorfunds": return <SponsorFunds />;
      default:             return <Overview onNavigate={setTab} />;
    }
  };

  return (
    <div className="admin-wrap">
      <style>{ADMIN_CSS}</style>
      <div className="admin-sidebar">
        <div className="admin-logo">
          <button className="admin-back" onClick={onBack}>← Back to site</button>
          <div className="admin-brand">Little Amour</div>
          <div className="admin-brand-sub">Admin</div>
        </div>
        {NAV_GROUPS.map(g => (
          <div key={g.label} className="nav-group">
            <div className="nav-group-label">{g.label}</div>
            {g.items.map(item => {
              const count = item.alertKey ? alerts[item.alertKey] || 0 : 0;
              return (
                <button
                  key={item.id}
                  className={"nav-item" + (tab === item.id ? " on" : "")}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                  {count > 0 && <span className="nav-badge">{count}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="admin-main">
        <div className="admin-main-inner">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
