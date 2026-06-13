import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   LITTLE AMOUR BOOKS — Admin Pricing & Royalty Dashboard
   ============================================================ */

const P = {
  night: "#131A30", mauve: "#6E5572", rose: "#E5AC9F", gold: "#E2A857",
  paper: "#FAF4EB", ink: "#2B2433", inkSoft: "#5E5468", cream: "#FFF9F0",
  sage: "#6A8F7A", red: "#C0392B", green: "#27AE60",
};

const GOAL = 100000;

/* ---- tiny helpers ---- */
const fmt = (n) => n == null ? "—" : `$${Number(n).toFixed(2)}`;
const pct = (n) => n == null ? "—" : `${(Number(n) * 100).toFixed(1)}%`;

function calcFinancials({ price, format_type, costRow, authorPct }) {
  if (!price || !costRow) return null;
  const print = Number(costRow.print_cost || 0);
  const procPct = Number(costRow.payment_processing_pct || 0);
  const procFixed = Number(costRow.payment_processing_fixed || 0);
  const fulfillment = Number(costRow.fulfillment_cost || 0);
  const platformPct = Number(costRow.platform_fee_pct || 0);
  const aiReserve = Number(costRow.ai_token_reserve || 0);
  const gross = Number(price);
  const directCosts = print + (gross * procPct) + procFixed + fulfillment + (gross * platformPct) + aiReserve;
  const netPool = gross - directCosts;
  const authorPayout = netPool * Number(authorPct || 0);
  const labContribution = netPool - authorPayout;
  return { gross, directCosts, netPool, authorPayout, labContribution, marginPct: labContribution / gross };
}

/* ============================================================
   SECTION: Pricing Settings
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
    if (row.id) {
      await supabase.from("pricing_settings").update({
        name: row.name, default_price: row.default_price,
        min_price: row.min_price, max_price: row.max_price,
        is_pay_what_you_can: row.is_pay_what_you_can, is_active: row.is_active,
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);
    } else {
      await supabase.from("pricing_settings").insert(row);
    }
    setSaving(false);
    setEditing(null);
    load();
  }

  return (
    <Section title="Pricing Settings" action={<button className="a-btn" onClick={() => setEditing({ product_type: "website_digital", is_pay_what_you_can: false, is_active: true })}>+ Add</button>}>
      <table className="a-table">
        <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Min</th><th>Max</th><th>PWYW</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ opacity: r.is_active ? 1 : 0.45 }}>
              <td>{r.name}</td>
              <td><code>{r.product_type}</code></td>
              <td>{fmt(r.default_price)}</td>
              <td>{fmt(r.min_price)}</td>
              <td>{fmt(r.max_price)}</td>
              <td>{r.is_pay_what_you_can ? "✓" : ""}</td>
              <td>{r.is_active ? "✓" : "—"}</td>
              <td><button className="a-link" onClick={() => setEditing({ ...r })}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title={editing.id ? "Edit Price" : "Add Price"} onClose={() => setEditing(null)}>
          <PriceForm row={editing} onChange={setEditing} onSave={() => save(editing)} saving={saving} />
        </Modal>
      )}
    </Section>
  );
}

function PriceForm({ row, onChange, onSave, saving }) {
  const f = (k, v) => onChange({ ...row, [k]: v });
  return (
    <div className="a-form">
      <label>Name<input value={row.name || ""} onChange={e => f("name", e.target.value)} /></label>
      <label>Product type<input value={row.product_type || ""} onChange={e => f("product_type", e.target.value)} /></label>
      <div className="a-row">
        <label>Default price<input type="number" step="0.01" value={row.default_price || ""} onChange={e => f("default_price", e.target.value)} /></label>
        <label>Min<input type="number" step="0.01" value={row.min_price || ""} onChange={e => f("min_price", e.target.value)} /></label>
        <label>Max<input type="number" step="0.01" value={row.max_price || ""} onChange={e => f("max_price", e.target.value)} /></label>
      </div>
      <div className="a-row">
        <label className="a-check"><input type="checkbox" checked={!!row.is_pay_what_you_can} onChange={e => f("is_pay_what_you_can", e.target.checked)} /> Pay-what-you-can</label>
        <label className="a-check"><input type="checkbox" checked={!!row.is_active} onChange={e => f("is_active", e.target.checked)} /> Active</label>
      </div>
      <button className="a-btn gold" onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
    </div>
  );
}

/* ============================================================
   SECTION: Cost Assumptions
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
    <Section title="Cost Assumptions per Format" action={<button className="a-btn" onClick={() => setEditing({ format_type: "", print_cost: 0, payment_processing_pct: 0.029, payment_processing_fixed: 0.30, fulfillment_cost: 0, platform_fee_pct: 0, digital_delivery_cost: 0, ai_token_reserve: 0 })}>+ Add</button>}>
      <table className="a-table">
        <thead><tr><th>Format</th><th>Print</th><th>Processing</th><th>Fulfillment</th><th>Platform %</th><th>AI Reserve</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><code>{r.format_type}</code></td>
              <td>{fmt(r.print_cost)}</td>
              <td>{fmt(r.payment_processing_fixed)} + {pct(r.payment_processing_pct)}</td>
              <td>{fmt(r.fulfillment_cost)}</td>
              <td>{pct(r.platform_fee_pct)}</td>
              <td>{fmt(r.ai_token_reserve)}</td>
              <td style={{ fontSize: 12, color: P.inkSoft }}>{r.notes}</td>
              <td><button className="a-link" onClick={() => setEditing({ ...r })}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title="Cost Assumptions" onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Format type<input value={editing.format_type || ""} onChange={e => setEditing(p => ({ ...p, format_type: e.target.value }))} /></label>
            <div className="a-row">
              <label>Print cost<input type="number" step="0.01" value={editing.print_cost || 0} onChange={e => setEditing(p => ({ ...p, print_cost: e.target.value }))} /></label>
              <label>Processing %<input type="number" step="0.001" value={editing.payment_processing_pct || 0} onChange={e => setEditing(p => ({ ...p, payment_processing_pct: e.target.value }))} /></label>
              <label>Processing fixed<input type="number" step="0.01" value={editing.payment_processing_fixed || 0} onChange={e => setEditing(p => ({ ...p, payment_processing_fixed: e.target.value }))} /></label>
            </div>
            <div className="a-row">
              <label>Fulfillment<input type="number" step="0.01" value={editing.fulfillment_cost || 0} onChange={e => setEditing(p => ({ ...p, fulfillment_cost: e.target.value }))} /></label>
              <label>Platform %<input type="number" step="0.001" value={editing.platform_fee_pct || 0} onChange={e => setEditing(p => ({ ...p, platform_fee_pct: e.target.value }))} /></label>
              <label>AI reserve<input type="number" step="0.01" value={editing.ai_token_reserve || 0} onChange={e => setEditing(p => ({ ...p, ai_token_reserve: e.target.value }))} /></label>
            </div>
            <label>Notes<input value={editing.notes || ""} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} /></label>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </Section>
  );
}

/* ============================================================
   SECTION: Royalty Rules
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
    <Section title="Royalty Rules" action={<button className="a-btn" onClick={() => setEditing({ ownership_type: "author", author_pct: 0.70, platform_pct: 0.30, deduct_production_costs: true, is_default: false })}>+ Add</button>}>
      <table className="a-table">
        <thead><tr><th>Name</th><th>Type</th><th>Author %</th><th>Little Amour %</th><th>Deduct costs</th><th>Default</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ fontWeight: r.is_default ? 600 : 400 }}>
              <td>{r.name}</td>
              <td>{r.ownership_type}</td>
              <td>{pct(r.author_pct)}</td>
              <td>{pct(r.platform_pct)}</td>
              <td>{r.deduct_production_costs ? "✓" : "—"}</td>
              <td>{r.is_default ? "✓" : ""}</td>
              <td><button className="a-link" onClick={() => setEditing({ ...r })}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title="Royalty Rule" onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Name<input value={editing.name || ""} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} /></label>
            <div className="a-row">
              <label>Type
                <select value={editing.ownership_type} onChange={e => setEditing(p => ({ ...p, ownership_type: e.target.value }))}>
                  <option value="house">House</option>
                  <option value="author">Author</option>
                </select>
              </label>
              <label>Author %<input type="number" step="0.01" min="0" max="1" value={editing.author_pct || 0} onChange={e => setEditing(p => ({ ...p, author_pct: e.target.value, platform_pct: (1 - e.target.value).toFixed(5) }))} /></label>
              <label>Platform %<input type="number" step="0.01" value={editing.platform_pct || 0} onChange={e => setEditing(p => ({ ...p, platform_pct: e.target.value }))} /></label>
            </div>
            <div className="a-row">
              <label className="a-check"><input type="checkbox" checked={!!editing.deduct_production_costs} onChange={e => setEditing(p => ({ ...p, deduct_production_costs: e.target.checked }))} /> Deduct production costs</label>
              <label className="a-check"><input type="checkbox" checked={!!editing.is_default} onChange={e => setEditing(p => ({ ...p, is_default: e.target.checked }))} /> Default rule</label>
            </div>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </Section>
  );
}

/* ============================================================
   SECTION: Production Cost Ledger
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

  return (
    <Section title="Production Cost Ledger" action={<button className="a-btn" onClick={() => setEditing({ cost_type: "ai_tokens", amount: 0, status: "absorbed" })}>+ Add Cost</button>}>
      <p className="a-meta">Total tracked: <strong>{fmt(total)}</strong></p>
      <table className="a-table">
        <thead><tr><th>Book</th><th>Type</th><th>Amount</th><th>Status</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.books_pricing?.title || "—"}</td>
              <td><code>{r.cost_type}</code></td>
              <td>{fmt(r.amount)}</td>
              <td><StatusBadge status={r.status} /></td>
              <td style={{ fontSize: 12, color: P.inkSoft }}>{r.notes}</td>
              <td><button className="a-link" onClick={() => setEditing({ ...r })}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title="Production Cost" onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Book
              <select value={editing.book_id || ""} onChange={e => setEditing(p => ({ ...p, book_id: e.target.value }))}>
                <option value="">— select —</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </label>
            <div className="a-row">
              <label>Cost type
                <select value={editing.cost_type} onChange={e => setEditing(p => ({ ...p, cost_type: e.target.value }))}>
                  {["ai_tokens","image_generation","editing","formatting","cover","upload","other"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>Amount<input type="number" step="0.01" value={editing.amount || 0} onChange={e => setEditing(p => ({ ...p, amount: e.target.value }))} /></label>
            </div>
            <label>Status
              <select value={editing.status} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
                {["paid_upfront","deduct_from_royalties","sponsored","waived","absorbed"].map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label>Notes<input value={editing.notes || ""} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} /></label>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </Section>
  );
}

/* ============================================================
   SECTION: Sponsor Funds
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
    <Section title="Sponsor Funds" action={<button className="a-btn" onClick={() => setEditing({ recipient_type: "general_fund", amount_received: 0, amount_used: 0 })}>+ Add</button>}>
      <div className="a-stats-row">
        <Stat label="Total received" value={fmt(totalReceived)} />
        <Stat label="Available" value={fmt(totalRemaining)} color={P.green} />
      </div>
      <table className="a-table">
        <thead><tr><th>Sponsor</th><th>Type</th><th>Received</th><th>Used</th><th>Remaining</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.sponsor_name || <span style={{ color: P.inkSoft }}>Anonymous</span>}</td>
              <td>{r.recipient_type?.replace(/_/g, " ")}</td>
              <td>{fmt(r.amount_received)}</td>
              <td>{fmt(r.amount_used)}</td>
              <td style={{ color: P.green, fontWeight: 600 }}>{fmt(r.amount_received - r.amount_used)}</td>
              <td style={{ fontSize: 12, color: P.inkSoft }}>{r.notes}</td>
              <td><button className="a-link" onClick={() => setEditing({ ...r })}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <Modal title="Sponsor Fund" onClose={() => setEditing(null)}>
          <div className="a-form">
            <label>Sponsor name (optional)<input value={editing.sponsor_name || ""} onChange={e => setEditing(p => ({ ...p, sponsor_name: e.target.value }))} /></label>
            <div className="a-row">
              <label>Amount received<input type="number" step="0.01" value={editing.amount_received || 0} onChange={e => setEditing(p => ({ ...p, amount_received: e.target.value }))} /></label>
              <label>Amount used<input type="number" step="0.01" value={editing.amount_used || 0} onChange={e => setEditing(p => ({ ...p, amount_used: e.target.value }))} /></label>
            </div>
            <label>Recipient type
              <select value={editing.recipient_type} onChange={e => setEditing(p => ({ ...p, recipient_type: e.target.value }))}>
                {["general_fund","specific_family","specific_author","specific_book"].map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label>Notes<textarea rows={2} value={editing.notes || ""} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} /></label>
            <button className="a-btn gold" onClick={() => save(editing)} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </Section>
  );
}

/* ============================================================
   SECTION: Pricing Simulator
   ============================================================ */
function Simulator() {
  const [costs, setCosts] = useState([]);
  const [form, setForm] = useState({
    label: "Website digital – standard",
    price: 7.00,
    format_type: "website_digital",
    ownership_type: "author",
    author_pct: 0.70,
  });

  useEffect(() => {
    supabase.from("cost_assumptions").select("*").then(({ data }) => setCosts(data || []));
  }, []);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const costRow = costs.find(c => c.format_type === form.format_type);
  const result = calcFinancials({ price: form.price, format_type: form.format_type, costRow, authorPct: form.ownership_type === "author" ? form.author_pct : 0 });
  const salesTo100k = result ? Math.ceil(GOAL / result.labContribution) : null;

  return (
    <Section title="Pricing Simulator">
      <div className="sim-grid">
        <div className="sim-inputs">
          <label>Label (for reference)<input value={form.label} onChange={e => f("label", e.target.value)} /></label>
          <div className="a-row">
            <label>Sale price<input type="number" step="0.01" value={form.price} onChange={e => f("price", Number(e.target.value))} /></label>
            <label>Format
              <select value={form.format_type} onChange={e => f("format_type", e.target.value)}>
                {costs.map(c => <option key={c.format_type} value={c.format_type}>{c.format_type}</option>)}
              </select>
            </label>
          </div>
          <div className="a-row">
            <label>Ownership
              <select value={form.ownership_type} onChange={e => f("ownership_type", e.target.value)}>
                <option value="house">House book</option>
                <option value="author">Author book</option>
              </select>
            </label>
            {form.ownership_type === "author" && (
              <label>Author %<input type="number" step="0.01" min="0" max="1" value={form.author_pct} onChange={e => f("author_pct", Number(e.target.value))} /></label>
            )}
          </div>
          {costRow && (
            <div className="sim-costs-breakdown">
              <p className="a-meta">Cost breakdown for <strong>{form.format_type}</strong>:</p>
              <table className="a-table tight">
                <tbody>
                  <tr><td>Print cost</td><td>{fmt(costRow.print_cost)}</td></tr>
                  <tr><td>Processing ({pct(costRow.payment_processing_pct)} + {fmt(costRow.payment_processing_fixed)})</td><td>{fmt((form.price * costRow.payment_processing_pct) + Number(costRow.payment_processing_fixed))}</td></tr>
                  <tr><td>Platform fee ({pct(costRow.platform_fee_pct)})</td><td>{fmt(form.price * costRow.platform_fee_pct)}</td></tr>
                  <tr><td>Fulfillment</td><td>{fmt(costRow.fulfillment_cost)}</td></tr>
                  <tr><td>AI token reserve</td><td>{fmt(costRow.ai_token_reserve)}</td></tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="sim-result">
          {result ? (
            <>
              <div className="sim-line"><span>Gross revenue</span><strong>{fmt(result.gross)}</strong></div>
              <div className="sim-line"><span>Direct costs</span><strong style={{ color: P.red }}>− {fmt(result.directCosts)}</strong></div>
              <div className="sim-line"><span>Net royalty pool</span><strong>{fmt(result.netPool)}</strong></div>
              {form.ownership_type === "author" && (
                <div className="sim-line"><span>Author payout ({pct(form.author_pct)})</span><strong style={{ color: P.mauve }}>− {fmt(result.authorPayout)}</strong></div>
              )}
              <div className="sim-line big"><span>Little Amour contribution</span><strong style={{ color: P.green }}>{fmt(result.labContribution)}</strong></div>
              <div className="sim-line"><span>Margin</span><strong>{pct(result.marginPct)}</strong></div>
              <div className="sim-goal">
                <span>Sales needed to reach $100K</span>
                <strong>{salesTo100k?.toLocaleString() ?? "—"}</strong>
              </div>
            </>
          ) : <p className="a-meta">Select a format to see results.</p>}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
   SECTION: $100K Dashboard
   ============================================================ */
function GoalDashboard() {
  const [financials, setFinancials] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    const [{ data: fin }, { data: sp }] = await Promise.all([
      supabase.from("order_financials").select("*"),
      supabase.from("sponsor_funds").select("amount_received, amount_used"),
    ]);
    setFinancials(fin || []); setSponsors(sp || []); setLoading(false);
  }

  const totalContribution = financials.reduce((s, r) => s + Number(r.little_amour_contribution || 0), 0);
  const totalRevenue = financials.reduce((s, r) => s + Number(r.gross_price || 0), 0);
  const totalAuthorPayout = financials.reduce((s, r) => s + Number(r.author_payout || 0), 0);
  const totalDirectCosts = financials.reduce((s, r) => s + Number(r.direct_costs || 0), 0);
  const sponsorReceived = sponsors.reduce((s, r) => s + Number(r.amount_received || 0), 0);
  const progressPct = Math.min(100, (totalContribution / GOAL) * 100);
  const avgContribution = financials.length ? totalContribution / financials.length : 0;
  const salesNeeded = avgContribution > 0 ? Math.ceil((GOAL - totalContribution) / avgContribution) : null;

  return (
    <Section title="$100K Contribution Goal">
      {loading ? <p className="a-meta">Loading…</p> : (
        <>
          <div className="goal-bar-wrap">
            <div className="goal-bar">
              <div className="goal-fill" style={{ width: progressPct + "%" }} />
            </div>
            <p className="goal-label">{fmt(totalContribution)} of {fmt(GOAL)} — {progressPct.toFixed(1)}%</p>
          </div>
          <div className="a-stats-row">
            <Stat label="Gross revenue" value={fmt(totalRevenue)} />
            <Stat label="Direct costs" value={fmt(totalDirectCosts)} color={P.red} />
            <Stat label="Author payouts" value={fmt(totalAuthorPayout)} color={P.mauve} />
            <Stat label="Little Amour contribution" value={fmt(totalContribution)} color={P.green} />
          </div>
          <div className="a-stats-row">
            <Stat label="Total orders" value={financials.length} />
            <Stat label="Avg contribution/sale" value={fmt(avgContribution)} />
            <Stat label="Sponsor funds received" value={fmt(sponsorReceived)} />
            {salesNeeded != null && <Stat label="More sales to hit $100K" value={salesNeeded.toLocaleString()} color={P.gold} />}
          </div>
          {salesNeeded != null && avgContribution > 0 && (
            <p className="goal-note">
              At your current average Little Amour contribution of <strong>{fmt(avgContribution)}</strong> per sale, you need <strong>{salesNeeded.toLocaleString()}</strong> more sales to reach $100K.
            </p>
          )}
          {financials.length === 0 && (
            <p className="a-meta">No order data yet — revenue will appear here once sales are recorded.</p>
          )}
        </>
      )}
    </Section>
  );
}

/* ============================================================
   SHARED UI
   ============================================================ */
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

function Stat({ label, value, color }) {
  return (
    <div className="a-stat">
      <span className="a-stat-val" style={{ color: color || P.ink }}>{value}</span>
      <span className="a-stat-label">{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    paid_upfront: [P.green, "#fff"],
    deduct_from_royalties: [P.gold, P.ink],
    sponsored: [P.mauve, "#fff"],
    waived: [P.inkSoft, "#fff"],
    absorbed: [P.night, "#fff"],
  };
  const [bg, fg] = colors[status] || [P.inkSoft, "#fff"];
  return <span style={{ background: bg, color: fg, borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 600 }}>{status?.replace(/_/g, " ")}</span>;
}

/* ============================================================
   STYLES
   ============================================================ */
const ADMIN_CSS = `
.admin-wrap { background: ${P.paper}; min-height: 100vh; font-family: system-ui, sans-serif; color: ${P.ink}; }
.admin-header { background: ${P.night}; color: #fff; padding: 18px 32px; display: flex; align-items: center; gap: 16px; }
.admin-header h1 { font-size: 20px; font-weight: 700; margin: 0; }
.admin-header span { font-size: 13px; opacity: .6; }
.admin-nav { display: flex; gap: 4px; padding: 0 32px; background: ${P.night}; border-bottom: 1px solid #ffffff18; }
.admin-nav button { background: none; border: none; color: #ffffffaa; font-size: 13px; padding: 10px 14px; cursor: pointer; border-bottom: 2px solid transparent; }
.admin-nav button.on { color: ${P.gold}; border-bottom-color: ${P.gold}; }
.admin-body { padding: 32px; max-width: 1100px; }
.a-section { background: #fff; border: 1px solid #E9DCC8; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
.a-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.a-h2 { font-size: 17px; font-weight: 700; margin: 0; }
.a-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.a-table th { text-align: left; padding: 7px 10px; border-bottom: 2px solid #EBE0CC; font-weight: 600; font-size: 12px; color: ${P.inkSoft}; }
.a-table td { padding: 8px 10px; border-bottom: 1px solid #F2E8D8; vertical-align: middle; }
.a-table.tight td, .a-table.tight th { padding: 4px 8px; }
.a-btn { background: ${P.night}; color: #fff; border: none; padding: 8px 16px; border-radius: 7px; font-size: 13px; cursor: pointer; font-weight: 600; }
.a-btn.gold { background: ${P.gold}; color: ${P.ink}; }
.a-link { background: none; border: none; color: ${P.mauve}; font-size: 13px; cursor: pointer; text-decoration: underline; padding: 0; }
.a-meta { font-size: 13px; color: ${P.inkSoft}; margin: 0 0 12px; }
.a-form { display: flex; flex-direction: column; gap: 12px; }
.a-form label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; font-weight: 600; color: ${P.inkSoft}; }
.a-form input, .a-form select, .a-form textarea { border: 1.5px solid #DDD0BB; border-radius: 7px; padding: 8px 10px; font-size: 14px; color: ${P.ink}; font-family: inherit; }
.a-row { display: flex; gap: 12px; flex-wrap: wrap; }
.a-row label { flex: 1; min-width: 120px; }
.a-check { flex-direction: row !important; align-items: center; gap: 8px !important; font-weight: 500 !important; }
.a-overlay { position: fixed; inset: 0; background: #00000066; z-index: 100; display: flex; align-items: center; justify-content: center; }
.a-modal { background: #fff; border-radius: 14px; padding: 28px; width: 540px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
.a-modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.a-modal-head h3 { margin: 0; font-size: 16px; }
.a-close { background: none; border: none; font-size: 18px; cursor: pointer; color: ${P.inkSoft}; }
.a-stats-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.a-stat { background: ${P.cream}; border: 1px solid #EBE0CC; border-radius: 10px; padding: 14px 18px; flex: 1; min-width: 140px; }
.a-stat-val { display: block; font-size: 22px; font-weight: 700; }
.a-stat-label { display: block; font-size: 12px; color: ${P.inkSoft}; margin-top: 2px; }
.goal-bar-wrap { margin-bottom: 20px; }
.goal-bar { height: 12px; background: #EBE0CC; border-radius: 99px; overflow: hidden; }
.goal-fill { height: 100%; background: ${P.green}; border-radius: 99px; transition: width .4s; }
.goal-label { font-size: 13px; color: ${P.inkSoft}; margin-top: 6px; }
.goal-note { background: ${P.cream}; border: 1px solid #EBE0CC; border-radius: 10px; padding: 14px 18px; font-size: 14px; margin-top: 8px; }
.sim-grid { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
.sim-inputs { display: flex; flex-direction: column; gap: 14px; }
.sim-costs-breakdown { background: ${P.cream}; border-radius: 8px; padding: 12px; }
.sim-result { background: ${P.night}; color: #fff; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.sim-line { display: flex; justify-content: space-between; font-size: 14px; }
.sim-line.big { border-top: 1px solid #ffffff22; padding-top: 10px; font-size: 16px; }
.sim-goal { background: #ffffff18; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 4px; font-size: 13px; margin-top: 8px; }
.sim-goal strong { font-size: 22px; }
@media (max-width: 700px) { .sim-grid { grid-template-columns: 1fr; } .admin-body { padding: 16px; } }
`;

/* ============================================================
   ROOT
   ============================================================ */
const TABS = [
  { id: "goal", label: "Goal Dashboard" },
  { id: "simulator", label: "Simulator" },
  { id: "pricing", label: "Prices" },
  { id: "costs", label: "Cost Assumptions" },
  { id: "royalties", label: "Royalty Rules" },
  { id: "production", label: "Production Costs" },
  { id: "sponsors", label: "Sponsor Funds" },
];

export default function AdminDashboard({ onBack }) {
  const [tab, setTab] = useState("goal");

  return (
    <div className="admin-wrap">
      <style>{ADMIN_CSS}</style>
      <div className="admin-header">
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, opacity: .7 }}>←</button>
        <h1>Little Amour Admin</h1>
        <span>Pricing · Royalties · $100K Goal</span>
      </div>
      <div className="admin-nav">
        {TABS.map(t => (
          <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="admin-body">
        {tab === "goal" && <GoalDashboard />}
        {tab === "simulator" && <Simulator />}
        {tab === "pricing" && <PricingSettings />}
        {tab === "costs" && <CostAssumptions />}
        {tab === "royalties" && <RoyaltyRules />}
        {tab === "production" && <ProductionCosts />}
        {tab === "sponsors" && <SponsorFunds />}
      </div>
    </div>
  );
}
