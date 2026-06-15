import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   LITTLE AMOUR BOOKS — Print-on-Demand System
   - PODProductSection: shows on BookPage below digital buy
   - PODDesignStudio: creator flow with AI assistant
   - PODProviderLayer: abstraction over printful/printify
   - PODApprovalWorkflow: admin moderation queue
   - PODAdminDashboard: full POD admin interface
   ============================================================ */

const P = {
  night: "#131A30", dusk: "#33304F", mauve: "#6E5572",
  rose: "#E5AC9F", gold: "#E2A857", paper: "#FAF4EB",
  paperWarm: "#F4EADC", ink: "#2B2433", inkSoft: "#5E5468",
  cream: "#FFF9F0", green: "#27ae60", red: "#c0392b", orange: "#e67e22",
};

/* ============================================================
   PROVIDER ABSTRACTION LAYER
   Swap printful/printify without changing components
   ============================================================ */
const POD_PROVIDER = {
  name: "printify", // set VITE_POD_PROVIDER env var to override
  products: {
    "tote-natural":     { id: "tote-natural",     label: "Tote Bag (Natural)",     basePrice: 8.50,  sellPrice: 28,   sizes: ["One Size"] },
    "mug-11oz":         { id: "mug-11oz",          label: "Mug — 11oz",             basePrice: 7.00,  sellPrice: 22,   sizes: ["11oz"] },
    "print-8x10":       { id: "print-8x10",        label: "Art Print — 8×10\"",     basePrice: 6.50,  sellPrice: 24,   sizes: ['8"×10"'] },
    "tee-soft":         { id: "tee-soft",           label: "T-Shirt (Unisex Soft)",  basePrice: 12.00, sellPrice: 36,   sizes: ["XS","S","M","L","XL","2XL"] },
    "onesie-soft":      { id: "onesie-soft",        label: "Baby Onesie",            basePrice: 10.50, sellPrice: 30,   sizes: ["0-3M","3-6M","6-12M","12-18M","18-24M"] },
    "pillow-18":        { id: "pillow-18",          label: "Throw Pillow — 18\"",    basePrice: 14.00, sellPrice: 42,   sizes: ["18\"×18\""] },
    "puzzle-500":       { id: "puzzle-500",         label: "Jigsaw Puzzle — 500pc",  basePrice: 16.50, sellPrice: 48,   sizes: ["500pc"] },
    "journal-softcover":{ id: "journal-softcover",  label: "Illustrated Journal",    basePrice: 9.00,  sellPrice: 32,   sizes: ["One Size"] },
    "bookmark-set":     { id: "bookmark-set",      label: "Bookmark Set (3-pack)",  basePrice: 3.50,  sellPrice: 14,   sizes: ["Standard"] },
  },

  authorRevenue(sellPrice, basePrice) {
    const platform = sellPrice * 0.10;
    const profit = sellPrice - basePrice - platform;
    return { authorShare: profit * 0.75, platformShare: profit * 0.25 + platform, basePrice, platform, profit };
  },
};

/* ============================================================
   SAMPLE / DEMO PRODUCTS — shown when no Supabase products exist
   These serve as branded examples for every book
   ============================================================ */
function makeSamples(book) {
  const base = { book_id: book.id, status: "approved", sizes: ["One Size"] };
  return [
    {
      ...base,
      id: `sample-tote-${book.id}`,
      product_id: "tote-natural",
      product_label: "Tote Bag",
      description: `Natural canvas tote printed with artwork from "${book.title}". Sturdy 6oz cotton. 15"×16" with 12" handles.`,
      sell_price: 28,
      base_price: 8.50,
      sizes: ["One Size"],
      design_notes: "Front: book title + illustrated character. Back: Little Amour moon logo.",
      emoji: "👜",
    },
    {
      ...base,
      id: `sample-mug-${book.id}`,
      product_id: "mug-11oz",
      product_label: "Ceramic Mug — 11oz",
      description: `White ceramic mug with full-wrap illustration from "${book.title}". Dishwasher safe. Ships individually boxed.`,
      sell_price: 22,
      base_price: 7.00,
      sizes: ["11oz", "15oz"],
      design_notes: "Wrap: book artwork + quote. Handle: accent color from cover.",
      emoji: "☕",
    },
    {
      ...base,
      id: `sample-bookmark-${book.id}`,
      product_id: "bookmark-set",
      product_label: "Bookmark Set (3-pack)",
      description: `Set of 3 illustrated bookmarks from "${book.title}". Laminated 2"×7" card stock. Comes in a kraft paper sleeve.`,
      sell_price: 14,
      base_price: 3.50,
      sizes: ["Standard"],
      design_notes: "Each bookmark features a different character moment from the book with a short quote.",
      emoji: "🔖",
    },
  ];
}

/* ============================================================
   POD PRODUCT SECTION — shown on BookPage below digital buy
   ============================================================ */
export function PODProductSection({ book, addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [size, setSize] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("pod_products")
        .select("*")
        .eq("book_id", book.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      // Fall back to sample products so the section always shows
      setProducts(data?.length ? data : makeSamples(book));
      setLoading(false);
    }
    load();
  }, [book.id]);

  if (loading) return null;
  if (!products.length) return null;

  const handleAdd = (prod) => {
    const sz = size[prod.id] || (prod.sizes?.[0]);
    if (addToCart) {
      addToCart({
        type: "pod",
        id: prod.id,
        title: `${prod.product_label} — ${book.title}${sz ? ` (${sz})` : ""}`,
        price: prod.sell_price,
        authorName: book.authorName,
        grad: book.grad,
        motif: "tote",
        podProductId: prod.id,
        size: sz,
      });
    }
  };

  return (
    <div className="pod-section">
      <style>{POD_CSS}</style>
      <div className="pod-header">
        <h3 className="pod-heading">Take the story with you</h3>
        <p className="pod-sub">Illustrated merchandise from this book's artwork. Ships in 5–10 business days. Printed on demand — every purchase is made fresh.</p>
      </div>

      <div className="pod-grid">
        {products.map(prod => {
          const rev = POD_PROVIDER.authorRevenue(prod.sell_price, prod.base_price);
          const isSelected = selected === prod.id;
          return (
            <div
              key={prod.id}
              className={"pod-card" + (isSelected ? " selected" : "")}
              onClick={() => setSelected(isSelected ? null : prod.id)}
            >
              <div className="pod-card-img" style={{ background: `linear-gradient(160deg,${book.grad[0]},${book.grad[1]})` }}>
                <span className="pod-card-emoji">{prod.emoji || PROD_EMOJI[prod.product_id] || "🎨"}</span>
              </div>
              <div className="pod-card-body">
                <p className="pod-card-label">{prod.product_label}</p>
                <p className="pod-card-price">${prod.sell_price.toFixed(2)}</p>
                <p className="pod-card-earn">✦ ${rev.authorShare.toFixed(2)} to this author</p>

                {isSelected && (
                  <div className="pod-card-detail">
                    {prod.description && <p className="pod-card-desc">{prod.description}</p>}
                    {prod.sizes?.length > 1 && (
                      <div className="pod-size-row">
                        {prod.sizes.map(s => (
                          <button
                            key={s}
                            className={"pod-size-btn" + (size[prod.id] === s || (!size[prod.id] && prod.sizes[0] === s) ? " on" : "")}
                            onClick={e => { e.stopPropagation(); setSize(sz => ({ ...sz, [prod.id]: s })); }}
                          >{s}</button>
                        ))}
                      </div>
                    )}
                    <button className="pod-add-btn" onClick={e => { e.stopPropagation(); handleAdd(prod); setSelected(null); }}>
                      Add to bag
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="pod-disclaimer">Merch ships separately from digital downloads. Printed by third-party POD provider. See <a href="/shipping" onClick={e => { e.preventDefault(); }}>Shipping Policy</a> for timelines. Not eligible for digital refund policy.</p>
    </div>
  );
}

const PROD_EMOJI = {
  "tote-natural": "👜", "mug-11oz": "☕", "print-8x10": "🖼", "tee-soft": "👕",
  "onesie-soft": "🧸", "pillow-18": "🛋", "puzzle-500": "🧩", "journal-softcover": "📓",
};

/* ============================================================
   POD DESIGN STUDIO — author-facing product creation
   ============================================================ */
const STUDIO_STEPS = ["Choose product", "Design", "Pricing & earnings", "Submit for review"];

export function PODDesignStudio({ book, user, onClose }) {
  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState(null);
  const [designNotes, setDesignNotes] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [aiHistory, setAiHistory] = useState([
    { role: "assistant", content: "Hi! I'm Amora. I'll help you create merchandise that really captures what's special about your book. Which product are you thinking about?" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [customPrice, setCustomPrice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const chatRef = useRef(null);

  const product = productId ? POD_PROVIDER.products[productId] : null;
  const sellPrice = customPrice ?? product?.sellPrice ?? 0;
  const rev = product ? POD_PROVIDER.authorRevenue(sellPrice, product.basePrice) : null;

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [aiHistory]);

  const sendAI = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    const newHistory = [...aiHistory, { role: "user", content: userMsg }];
    setAiHistory(newHistory);
    setAiLoading(true);
    try {
      const sys = `You are Amora, the creative assistant at Little Amour Books — a platform where survivor mothers publish illustrated children's books. You are helping the author of "${book.title}" (by ${book.authorName}) design print-on-demand merchandise. The book is about: ${book.tagline || book.adult || "a gentle children's book for hard family moments"}. 

Help the author choose what artwork or phrases to feature on their product. Keep suggestions emotionally appropriate — warm, gentle, meaningful. Avoid anything that could re-traumatize or look exploitative. Suggest specific imagery (characters, motifs, quotes from the book). Be concise and warm. Under 150 words per response.`;

      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: sys, messages: newHistory }),
      });
      const data = await r.json();
      const text = data.content?.[0]?.text || data.text || "Let me think about that…";
      setAiHistory(h => [...h, { role: "assistant", content: text }]);
    } catch {
      setAiHistory(h => [...h, { role: "assistant", content: "I had trouble connecting. Please try again." }]);
    }
    setAiLoading(false);
  };

  const submit = async () => {
    if (!productId || !product) return;
    setSubmitting(true);
    setError("");
    const { error: err } = await supabase.from("pod_products").insert({
      book_id: book.id,
      author_id: user?.id,
      product_id: productId,
      product_label: product.label,
      sizes: product.sizes,
      base_price: product.basePrice,
      sell_price: sellPrice,
      author_revenue: rev?.authorShare,
      design_notes: designNotes,
      ai_design_conversation: JSON.stringify(aiHistory.slice(1)),
      status: "pending_review",
    });
    setSubmitting(false);
    if (err) setError("Something went wrong. Please try again.");
    else setSubmitted(true);
  };

  if (submitted) return (
    <div className="pod-studio-wrap">
      <style>{POD_CSS}</style>
      <div className="pod-submitted">
        <div style={{ fontSize: 56, marginBottom: 16 }}>✨</div>
        <h2 className="pod-h2">Design submitted!</h2>
        <p>We'll review your product and have it live within 2 business days. You'll receive an email when it's approved.</p>
        <button className="pod-btn-gold" onClick={onClose}>Back to your books</button>
      </div>
    </div>
  );

  return (
    <div className="pod-studio-wrap">
      <style>{POD_CSS}</style>

      {/* Header */}
      <div className="pod-studio-header">
        <div>
          <p className="pod-studio-eyebrow">Design Studio</p>
          <h2 className="pod-h2">{book.title}</h2>
        </div>
        <button className="pod-close" onClick={onClose}>✕</button>
      </div>

      {/* Steps */}
      <div className="pod-steps">
        {STUDIO_STEPS.map((s, i) => (
          <div key={s} className={"pod-step" + (i === step ? " on" : i < step ? " done" : "")}>
            <span className="pod-step-num">{i < step ? "✓" : i + 1}</span>
            <span className="pod-step-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="pod-studio-body">

        {/* Step 0: choose product */}
        {step === 0 && (
          <div>
            <p className="pod-hint">Choose a product type. You can create multiple products for the same book.</p>
            <div className="pod-product-grid">
              {Object.values(POD_PROVIDER.products).map(p => {
                const earn = POD_PROVIDER.authorRevenue(p.sellPrice, p.basePrice);
                return (
                  <button
                    key={p.id}
                    className={"pod-product-btn" + (productId === p.id ? " on" : "")}
                    onClick={() => setProductId(p.id)}
                  >
                    <span className="pod-pe">{PROD_EMOJI[p.id] || "🎨"}</span>
                    <span className="pod-pl">{p.label}</span>
                    <span className="pod-pp">${p.sellPrice}</span>
                    <span className="pod-earn">You earn ~${earn.authorShare.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
            <div className="pod-nav">
              <span />
              <button className="pod-btn-gold" disabled={!productId} onClick={() => setStep(1)}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 1: design with AI */}
        {step === 1 && (
          <div>
            <p className="pod-hint">Tell Amora what you'd like on your {product?.label}. She'll help you think through the artwork and phrases.</p>
            <div className="pod-chat" ref={chatRef}>
              {aiHistory.map((m, i) => (
                <div key={i} className={"pod-msg " + m.role}>
                  <p>{m.content}</p>
                </div>
              ))}
              {aiLoading && <div className="pod-msg assistant"><p className="pod-typing">Thinking…</p></div>}
            </div>
            <div className="pod-chat-input">
              <textarea
                className="pod-chat-ta"
                placeholder="Describe what you'd like on the product…"
                rows={2}
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAI(); } }}
              />
              <button className="pod-send-btn" onClick={sendAI} disabled={aiLoading}>Send</button>
            </div>

            <div className="pod-design-notes-wrap">
              <label className="pod-label">Final design notes for our team</label>
              <textarea
                className="pod-design-ta"
                rows={4}
                placeholder="Summarise what you want on the product — specific artwork, quotes, colour palette, positioning, any special requests. Our design team will work from these notes."
                value={designNotes}
                onChange={e => setDesignNotes(e.target.value)}
              />
            </div>

            <div className="pod-nav">
              <button className="pod-btn-line" onClick={() => setStep(0)}>← Back</button>
              <button className="pod-btn-gold" disabled={!designNotes.trim()} onClick={() => setStep(2)}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 2: pricing */}
        {step === 2 && rev && (
          <div>
            <p className="pod-hint">We set a suggested price based on production cost. You can adjust it within our guidelines.</p>
            <div className="pod-pricing-card">
              <div className="pod-pricing-row">
                <span>Production cost (base)</span>
                <span>${product.basePrice.toFixed(2)}</span>
              </div>
              <div className="pod-pricing-row">
                <span>Platform fee (10%)</span>
                <span>${POD_PROVIDER.authorRevenue(sellPrice, product.basePrice).platform.toFixed(2)}</span>
              </div>
              <div className="pod-pricing-row accent">
                <span>Your earnings (75% of profit)</span>
                <span>${POD_PROVIDER.authorRevenue(sellPrice, product.basePrice).authorShare.toFixed(2)}</span>
              </div>
              <div className="pod-pricing-divider" />
              <div className="pod-pricing-row total">
                <span>Customer price</span>
                <span>${sellPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="pod-price-adj">
              <label className="pod-label">Adjust price (min ${(product.basePrice * 1.5).toFixed(2)}, max $99)</label>
              <input
                type="number"
                min={(product.basePrice * 1.5).toFixed(2)}
                max={99}
                step={0.50}
                className="pod-price-input"
                value={sellPrice.toFixed(2)}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) setCustomPrice(Math.min(99, Math.max(product.basePrice * 1.5, v)));
                }}
              />
              <p className="pod-price-hint">With this price, you'll earn ${POD_PROVIDER.authorRevenue(sellPrice, product.basePrice).authorShare.toFixed(2)} per sale after production and platform fees.</p>
            </div>

            <div className="pod-nav">
              <button className="pod-btn-line" onClick={() => setStep(1)}>← Back</button>
              <button className="pod-btn-gold" onClick={() => setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3: review & submit */}
        {step === 3 && (
          <div>
            <div className="pod-review-card">
              <h3 className="pod-review-title">Review your submission</h3>
              <div className="pod-review-row"><span>Book</span><strong>{book.title}</strong></div>
              <div className="pod-review-row"><span>Product</span><strong>{product?.label}</strong></div>
              <div className="pod-review-row"><span>Price</span><strong>${sellPrice.toFixed(2)}</strong></div>
              <div className="pod-review-row"><span>Your earnings / sale</span><strong>${rev?.authorShare.toFixed(2)}</strong></div>
              <div className="pod-review-row col">
                <span>Design notes</span>
                <p className="pod-review-notes">{designNotes}</p>
              </div>
            </div>

            <div className="pod-review-notice">
              <p>Our team will review your product within 2 business days. We check that artwork is emotionally safe, artwork rights are clear, and the product meets quality standards. You'll receive an email with approval or feedback.</p>
            </div>

            {error && <p className="pod-error">{error}</p>}

            <div className="pod-nav">
              <button className="pod-btn-line" onClick={() => setStep(2)}>← Back</button>
              <button className="pod-btn-gold" onClick={submit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   POD ADMIN DASHBOARD
   ============================================================ */
export function PODAdminDashboard() {
  const [tab, setTab] = useState("queue");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [config, setConfig] = useState({
    authorRevenueShare: 75,
    platformFee: 10,
    requireManualApproval: true,
    allowedProducts: Object.keys(POD_PROVIDER.products),
    maxProductsPerBook: 8,
    reviewTimelineDays: 2,
    podProvider: POD_PROVIDER.name,
  });

  useEffect(() => { loadAll(); }, [tab]);

  async function loadAll() {
    setLoading(true);
    if (tab === "queue" || tab === "all") {
      const q = supabase.from("pod_products").select(`*, books:book_id(title, author_name)`).order("created_at", { ascending: false });
      if (tab === "queue") q.eq("status", "pending_review");
      const { data } = await q;
      setProducts(data || []);
    }
    if (tab === "orders") {
      const { data } = await supabase.from("pod_orders").select("*").order("created_at", { ascending: false }).limit(100);
      setOrders(data || []);
    }
    setLoading(false);
  }

  const decide = async (prodId, status) => {
    setActionLoading(true);
    await supabase.from("pod_products").update({ status, decision_note: decisionNote, reviewed_at: new Date().toISOString() }).eq("id", prodId);
    setDecisionNote("");
    setSelected(null);
    await loadAll();
    setActionLoading(false);
  };

  const STATUS_COLOR = { pending_review: P.orange, approved: P.green, rejected: P.red, changes_requested: P.mauve };
  const STATUS_LABEL = { pending_review: "Pending", approved: "Approved", rejected: "Rejected", changes_requested: "Changes needed" };

  return (
    <div>
      <style>{POD_CSS}</style>
      <div className="pod-admin-tabs">
        {["queue", "all", "orders", "config"].map(t => (
          <button key={t} className={"pod-admin-tab" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>
            {t === "queue" ? "Review Queue" : t === "all" ? "All Products" : t === "orders" ? "Orders" : "Configuration"}
          </button>
        ))}
      </div>

      {/* Review queue + all products */}
      {(tab === "queue" || tab === "all") && (
        <div>
          {loading ? <p className="pod-hint">Loading…</p> : !products.length ? (
            <div className="pod-empty">
              <p>🎉 No products {tab === "queue" ? "waiting for review" : "found"}.</p>
            </div>
          ) : (
            <div>
              {products.map(prod => (
                <div key={prod.id} className={"pod-admin-card" + (selected === prod.id ? " expanded" : "")}>
                  <div className="pod-admin-card-head" onClick={() => setSelected(selected === prod.id ? null : prod.id)}>
                    <span className="pod-admin-emoji">{PROD_EMOJI[prod.product_id] || "🎨"}</span>
                    <div className="pod-admin-card-info">
                      <p className="pod-admin-card-title">{prod.product_label}</p>
                      <p className="pod-admin-card-sub">{prod.books?.title || prod.book_id} · {prod.books?.author_name || ""}</p>
                    </div>
                    <span className="pod-admin-status" style={{ color: STATUS_COLOR[prod.status] }}>
                      {STATUS_LABEL[prod.status] || prod.status}
                    </span>
                    <span className="pod-chevron">{selected === prod.id ? "▲" : "▼"}</span>
                  </div>

                  {selected === prod.id && (
                    <div className="pod-admin-detail">
                      <div className="pod-detail-grid">
                        <div className="pod-detail-row"><span>Product</span><strong>{prod.product_label}</strong></div>
                        <div className="pod-detail-row"><span>Base cost</span><strong>${prod.base_price?.toFixed(2)}</strong></div>
                        <div className="pod-detail-row"><span>Sell price</span><strong>${prod.sell_price?.toFixed(2)}</strong></div>
                        <div className="pod-detail-row"><span>Author earns</span><strong>${prod.author_revenue?.toFixed(2)} / sale</strong></div>
                        <div className="pod-detail-row"><span>Submitted</span><strong>{prod.created_at ? new Date(prod.created_at).toLocaleDateString() : "—"}</strong></div>
                      </div>

                      <div className="pod-detail-section">
                        <p className="pod-detail-label">Design notes from author</p>
                        <div className="pod-design-notes-box">{prod.design_notes || <em>No notes provided.</em>}</div>
                      </div>

                      {prod.ai_design_conversation && (() => {
                        try {
                          const conv = JSON.parse(prod.ai_design_conversation);
                          if (conv.length > 0) return (
                            <div className="pod-detail-section">
                              <p className="pod-detail-label">Amora design conversation (excerpt)</p>
                              <div className="pod-ai-conv">
                                {conv.slice(0, 6).map((m, i) => (
                                  <div key={i} className={"pod-ai-msg " + m.role}>
                                    <strong>{m.role === "user" ? "Author" : "Amora"}</strong>
                                    <p>{m.content}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        } catch { return null; }
                        return null;
                      })()}

                      {prod.status === "pending_review" && (
                        <div className="pod-decision-wrap">
                          <label className="pod-label">Decision note (shown to author if not approved)</label>
                          <textarea
                            className="pod-design-ta"
                            rows={2}
                            value={decisionNote}
                            onChange={e => setDecisionNote(e.target.value)}
                            placeholder="Optional feedback for the author…"
                          />
                          <div className="pod-decision-btns">
                            <button className="pod-btn-approve" disabled={actionLoading} onClick={() => decide(prod.id, "approved")}>✓ Approve</button>
                            <button className="pod-btn-changes" disabled={actionLoading} onClick={() => decide(prod.id, "changes_requested")}>Request changes</button>
                            <button className="pod-btn-reject" disabled={actionLoading} onClick={() => decide(prod.id, "rejected")}>✕ Reject</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      {tab === "orders" && (
        <div>
          {loading ? <p className="pod-hint">Loading…</p> : !orders.length ? (
            <div className="pod-empty"><p>No POD orders yet.</p></div>
          ) : (
            <div>
              {orders.map(o => (
                <div key={o.id} className="pod-order-row">
                  <div>
                    <p className="pod-order-num">{o.order_number || o.id.slice(0, 8)}</p>
                    <p className="pod-order-sub">{o.product_label} · {o.customer_email}</p>
                  </div>
                  <div className="pod-order-right">
                    <span className="pod-order-price">${o.total?.toFixed(2)}</span>
                    <span className="pod-admin-status" style={{ color: STATUS_COLOR[o.fulfillment_status] || P.inkSoft }}>
                      {o.fulfillment_status || "pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Configuration */}
      {tab === "config" && (
        <div>
          <div className="pod-config-card">
            <h3 className="pod-config-h">Revenue Share</h3>
            <div className="pod-config-row">
              <label className="pod-label">Author revenue share (%)</label>
              <div className="pod-config-input-wrap">
                <input type="number" min={50} max={85} className="pod-price-input" value={config.authorRevenueShare}
                  onChange={e => setConfig(c => ({ ...c, authorRevenueShare: Number(e.target.value) }))} />
                <span className="pod-config-hint">Current: {config.authorRevenueShare}% to author, {100 - config.authorRevenueShare - config.platformFee}% Little Amour, {config.platformFee}% platform fee</span>
              </div>
            </div>
            <div className="pod-config-row">
              <label className="pod-label">Platform fee (%)</label>
              <div className="pod-config-input-wrap">
                <input type="number" min={5} max={25} className="pod-price-input" value={config.platformFee}
                  onChange={e => setConfig(c => ({ ...c, platformFee: Number(e.target.value) }))} />
              </div>
            </div>
          </div>

          <div className="pod-config-card">
            <h3 className="pod-config-h">Approval Workflow</h3>
            <label className="pod-toggle">
              <input type="checkbox" checked={config.requireManualApproval}
                onChange={e => setConfig(c => ({ ...c, requireManualApproval: e.target.checked }))} />
              <span>Require manual review before going live</span>
            </label>
            <div className="pod-config-row">
              <label className="pod-label">Review timeline (days shown to authors)</label>
              <input type="number" min={1} max={10} className="pod-price-input" value={config.reviewTimelineDays}
                onChange={e => setConfig(c => ({ ...c, reviewTimelineDays: Number(e.target.value) }))} />
            </div>
            <div className="pod-config-row">
              <label className="pod-label">Max products per book</label>
              <input type="number" min={1} max={20} className="pod-price-input" value={config.maxProductsPerBook}
                onChange={e => setConfig(c => ({ ...c, maxProductsPerBook: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="pod-config-card">
            <h3 className="pod-config-h">Provider</h3>
            <p className="pod-hint">Current POD provider: <strong>{config.podProvider}</strong></p>
            <p className="pod-hint">To switch providers, update <code>VITE_POD_PROVIDER</code> in Vercel environment variables. Supported: <code>printify</code>, <code>printful</code>, <code>gelato</code>.</p>
            <div className="pod-provider-btns">
              {["printify", "printful", "gelato"].map(p => (
                <button key={p} className={"pod-provider-btn" + (config.podProvider === p ? " on" : "")}
                  onClick={() => setConfig(c => ({ ...c, podProvider: p }))}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pod-config-card">
            <h3 className="pod-config-h">Supabase Tables Required</h3>
            <p className="pod-hint">Run these in your Supabase SQL editor:</p>
            <pre className="pod-sql">{POD_SQL}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

const POD_SQL = `-- POD Products
create table if not exists pod_products (
  id uuid primary key default gen_random_uuid(),
  book_id text not null,
  author_id uuid,
  product_id text not null,
  product_label text,
  sizes text[],
  base_price numeric,
  sell_price numeric,
  author_revenue numeric,
  design_notes text,
  ai_design_conversation text,
  status text default 'pending_review'
    check (status in ('pending_review','approved','rejected','changes_requested')),
  decision_note text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- POD Orders (populated by webhook from Printify/Printful)
create table if not exists pod_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text,
  pod_product_id uuid references pod_products(id),
  product_label text,
  customer_email text,
  size text,
  total numeric,
  author_payout numeric,
  fulfillment_status text default 'pending',
  provider_order_id text,
  tracking_number text,
  tracking_url text,
  created_at timestamptz default now()
);`;

/* ============================================================
   SHARED STYLES
   ============================================================ */
const POD_CSS = `
/* --- Section --- */
.pod-section { border-top:1.5px solid #ECD9C5; margin-top:40px; padding-top:36px; }
.pod-header { margin-bottom:22px; }
.pod-heading { font-family:'Fraunces',Georgia,serif; font-size:22px; font-weight:560; color:#131A30; margin-bottom:6px; }
.pod-sub { font-size:14px; color:#5E5468; line-height:1.6; max-width:58ch; }
.pod-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
.pod-card { border:1.5px solid #ECD9C5; border-radius:14px; overflow:hidden; cursor:pointer; transition:box-shadow .15s,border-color .15s; background:#fff; text-align:left; }
.pod-card:hover { box-shadow:0 4px 18px rgba(0,0,0,.08); }
.pod-card.selected { border-color:#E2A857; box-shadow:0 0 0 2px rgba(226,168,87,.25); }
.pod-card-img { height:96px; display:flex; align-items:center; justify-content:center; }
.pod-card-emoji { font-size:36px; }
.pod-card-body { padding:12px 14px 14px; }
.pod-card-label { font-size:13.5px; font-weight:700; color:#131A30; margin-bottom:4px; }
.pod-card-price { font-size:15px; font-weight:700; color:#E2A857; margin-bottom:3px; }
.pod-card-earn { font-size:11.5px; color:#27ae60; font-weight:600; margin-bottom:10px; }
.pod-card-detail { margin-top:10px; border-top:1px solid #ECD9C5; padding-top:10px; }
.pod-size-row { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px; }
.pod-size-btn { font-size:12px; border:1.5px solid #DDD0C8; border-radius:999px; padding:3px 10px; background:#fff; cursor:pointer; font-weight:600; color:#5E5468; }
.pod-size-btn.on { border-color:#E2A857; color:#E2A857; background:#FFF6E0; }
.pod-add-btn { width:100%; background:#131A30; color:#fff; border:none; border-radius:999px; padding:9px 0; font-size:14px; font-weight:700; cursor:pointer; }
.pod-disclaimer { font-size:12px; color:#aaa; margin-top:18px; line-height:1.6; }
.pod-card-desc { font-size:12.5px; color:#5E5468; line-height:1.55; margin-bottom:10px; }
.pod-disclaimer a { color:#6E5572; }

/* --- Studio --- */
.pod-studio-wrap { max-width:700px; margin:0 auto; padding:24px; }
.pod-studio-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; }
.pod-studio-eyebrow { font-size:11.5px; letter-spacing:.18em; text-transform:uppercase; color:#E2A857; font-weight:700; margin-bottom:4px; }
.pod-h2 { font-family:'Fraunces',Georgia,serif; font-size:24px; font-weight:560; color:#131A30; }
.pod-close { background:none; border:none; font-size:20px; color:#888; cursor:pointer; padding:4px 8px; }
.pod-steps { display:flex; gap:0; margin-bottom:28px; overflow-x:auto; }
.pod-step { display:flex; align-items:center; gap:7px; padding:8px 14px; font-size:13px; color:#bbb; font-weight:600; white-space:nowrap; }
.pod-step.on { color:#131A30; }
.pod-step.done { color:#27ae60; }
.pod-step-num { width:22px; height:22px; border-radius:50%; background:#ECD9C5; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:#6E5572; flex-shrink:0; }
.pod-step.on .pod-step-num { background:#131A30; color:#fff; }
.pod-step.done .pod-step-num { background:#27ae60; color:#fff; }
.pod-step-label { }
.pod-studio-body { }
.pod-hint { font-size:14px; color:#888; margin-bottom:16px; line-height:1.6; }
.pod-product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px; margin-bottom:24px; }
.pod-product-btn { border:1.5px solid #ECD9C5; border-radius:12px; padding:14px 16px; background:#FAF4EB; cursor:pointer; text-align:left; display:flex; flex-direction:column; gap:4px; transition:border-color .12s; }
.pod-product-btn:hover { border-color:#E2A857; }
.pod-product-btn.on { border-color:#E2A857; background:#FFF6E0; }
.pod-pe { font-size:26px; }
.pod-pl { font-size:13.5px; font-weight:700; color:#131A30; }
.pod-pp { font-size:14px; font-weight:700; color:#E2A857; }
.pod-earn { font-size:11.5px; color:#27ae60; font-weight:600; }
.pod-chat { height:280px; overflow-y:auto; border:1.5px solid #ECD9C5; border-radius:12px; padding:14px; background:#FAF4EB; margin-bottom:10px; display:flex; flex-direction:column; gap:10px; }
.pod-msg { max-width:85%; padding:10px 14px; border-radius:12px; font-size:14px; line-height:1.55; }
.pod-msg p { margin:0; }
.pod-msg.user { background:#131A30; color:#fff; align-self:flex-end; border-radius:12px 12px 2px 12px; }
.pod-msg.assistant { background:#fff; color:#2B2433; border:1px solid #ECD9C5; align-self:flex-start; border-radius:12px 12px 12px 2px; }
.pod-typing { color:#aaa; font-style:italic; }
.pod-chat-input { display:flex; gap:8px; margin-bottom:18px; }
.pod-chat-ta { flex:1; border:1.5px solid #DDD0C8; border-radius:10px; padding:10px 13px; font-size:14px; font-family:inherit; resize:none; }
.pod-send-btn { background:#E2A857; color:#fff; border:none; border-radius:999px; padding:0 20px; font-size:14px; font-weight:700; cursor:pointer; flex-shrink:0; }
.pod-send-btn:disabled { opacity:.5; }
.pod-design-notes-wrap { margin-bottom:18px; }
.pod-label { font-size:13px; font-weight:700; color:#33304F; display:block; margin-bottom:6px; }
.pod-design-ta { width:100%; border:1.5px solid #DDD0C8; border-radius:10px; padding:10px 13px; font-size:14px; font-family:inherit; resize:vertical; background:#fff; box-sizing:border-box; }
.pod-nav { display:flex; align-items:center; justify-content:space-between; margin-top:20px; }
.pod-btn-gold { background:#E2A857; color:#fff; border:none; border-radius:999px; padding:11px 28px; font-size:15px; font-weight:700; cursor:pointer; }
.pod-btn-gold:disabled { opacity:.45; cursor:default; }
.pod-btn-line { background:none; border:1.5px solid #2B2433; border-radius:999px; padding:10px 24px; font-size:15px; font-weight:700; cursor:pointer; }
.pod-pricing-card { background:#FAF4EB; border:1px solid #ECD9C5; border-radius:14px; padding:20px; margin-bottom:18px; }
.pod-pricing-row { display:flex; justify-content:space-between; font-size:14px; padding:7px 0; border-bottom:1px solid #ECD9C5; }
.pod-pricing-row:last-child { border-bottom:none; }
.pod-pricing-row.accent span:last-child { color:#27ae60; font-weight:700; }
.pod-pricing-row.total { font-weight:700; font-size:15.5px; }
.pod-pricing-divider { border:none; border-top:2px solid #DDD0C8; margin:6px 0; }
.pod-price-adj { margin-bottom:18px; }
.pod-price-input { border:1.5px solid #DDD0C8; border-radius:9px; padding:9px 13px; font-size:15px; font-family:inherit; width:120px; }
.pod-price-hint { font-size:12.5px; color:#888; margin-top:5px; }
.pod-review-card { background:#FAF4EB; border:1px solid #ECD9C5; border-radius:14px; padding:20px; margin-bottom:16px; }
.pod-review-title { font-weight:700; font-size:16px; color:#131A30; margin-bottom:14px; }
.pod-review-row { display:flex; gap:12px; justify-content:space-between; padding:7px 0; border-bottom:1px solid #ECD9C5; font-size:14px; }
.pod-review-row:last-child { border-bottom:none; }
.pod-review-row.col { flex-direction:column; gap:4px; }
.pod-review-notes { font-size:13.5px; color:#5E5468; line-height:1.6; margin:0; background:#fff; padding:10px 13px; border-radius:9px; border:1px solid #ECD9C5; }
.pod-review-notice { background:#FFF6E8; border:1px solid #F0D09A; border-radius:12px; padding:14px 16px; margin-bottom:18px; font-size:13.5px; color:#5E5468; line-height:1.6; }
.pod-error { color:#c0392b; font-size:14px; margin-bottom:12px; }
.pod-submitted { text-align:center; padding:48px 24px; }

/* --- Admin --- */
.pod-admin-tabs { display:flex; gap:0; border-bottom:2px solid #E3D3BC; margin-bottom:24px; }
.pod-admin-tab { background:none; border:none; border-bottom:3px solid transparent; padding:10px 18px; font-size:14px; font-weight:600; color:#888; cursor:pointer; margin-bottom:-2px; }
.pod-admin-tab.on { color:#131A30; border-bottom-color:#E2A857; }
.pod-admin-card { border:1px solid #ECD9C5; border-radius:14px; overflow:hidden; margin-bottom:12px; background:#fff; }
.pod-admin-card.expanded { border-color:#E2A857; }
.pod-admin-card-head { display:flex; align-items:center; gap:12px; padding:14px 16px; cursor:pointer; }
.pod-admin-emoji { font-size:24px; flex-shrink:0; }
.pod-admin-card-info { flex:1; }
.pod-admin-card-title { font-weight:700; font-size:15px; color:#131A30; margin-bottom:2px; }
.pod-admin-card-sub { font-size:13px; color:#888; }
.pod-admin-status { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; flex-shrink:0; }
.pod-chevron { font-size:12px; color:#bbb; flex-shrink:0; }
.pod-admin-detail { border-top:1px solid #ECD9C5; padding:18px 16px; background:#FAF4EB; }
.pod-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; }
.pod-detail-row { display:flex; flex-direction:column; gap:2px; font-size:13.5px; }
.pod-detail-row span:first-child { color:#888; font-size:12px; }
.pod-detail-section { margin-bottom:14px; }
.pod-detail-label { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#6E5572; margin-bottom:6px; }
.pod-design-notes-box { font-size:14px; line-height:1.6; color:#2B2433; background:#fff; border:1px solid #ECD9C5; border-radius:9px; padding:12px 14px; }
.pod-ai-conv { display:flex; flex-direction:column; gap:8px; max-height:200px; overflow-y:auto; }
.pod-ai-msg { font-size:13px; padding:8px 12px; border-radius:9px; }
.pod-ai-msg strong { font-size:11px; text-transform:uppercase; letter-spacing:.1em; display:block; margin-bottom:3px; }
.pod-ai-msg.user { background:#EAE2F0; color:#33304F; }
.pod-ai-msg.assistant { background:#fff; border:1px solid #ECD9C5; }
.pod-ai-msg p { margin:0; }
.pod-decision-wrap { border-top:1px solid #ECD9C5; padding-top:14px; margin-top:4px; }
.pod-decision-btns { display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
.pod-btn-approve { background:#27ae60; color:#fff; border:none; border-radius:999px; padding:9px 20px; font-size:14px; font-weight:700; cursor:pointer; }
.pod-btn-changes { background:#e67e22; color:#fff; border:none; border-radius:999px; padding:9px 20px; font-size:14px; font-weight:700; cursor:pointer; }
.pod-btn-reject { background:#c0392b; color:#fff; border:none; border-radius:999px; padding:9px 20px; font-size:14px; font-weight:700; cursor:pointer; }
.pod-btn-approve:disabled,.pod-btn-changes:disabled,.pod-btn-reject:disabled { opacity:.5; cursor:default; }
.pod-order-row { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #ECD9C5; }
.pod-order-num { font-size:14px; font-weight:700; color:#131A30; margin-bottom:2px; }
.pod-order-sub { font-size:13px; color:#888; }
.pod-order-right { display:flex; align-items:center; gap:14px; }
.pod-order-price { font-size:15px; font-weight:700; color:#E2A857; }
.pod-empty { text-align:center; padding:36px; color:#888; font-size:15px; }
.pod-config-card { background:#FAF4EB; border:1px solid #ECD9C5; border-radius:14px; padding:20px; margin-bottom:18px; }
.pod-config-h { font-size:15px; font-weight:700; color:#131A30; margin-bottom:14px; }
.pod-config-row { margin-bottom:14px; }
.pod-config-input-wrap { display:flex; flex-direction:column; gap:4px; }
.pod-config-hint { font-size:12.5px; color:#888; }
.pod-toggle { display:flex; align-items:center; gap:9px; cursor:pointer; font-size:14px; margin-bottom:14px; }
.pod-provider-btns { display:flex; gap:8px; margin-top:10px; }
.pod-provider-btn { background:#fff; border:1.5px solid #DDD0C8; border-radius:999px; padding:7px 18px; font-size:14px; font-weight:600; cursor:pointer; }
.pod-provider-btn.on { border-color:#E2A857; background:#FFF6E0; color:#E2A857; }
.pod-sql { font-size:11.5px; background:#fff; border:1px solid #ECD9C5; border-radius:9px; padding:14px; overflow-x:auto; white-space:pre; line-height:1.6; margin-top:10px; }
`;

export default PODAdminDashboard;
