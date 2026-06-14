import React, { useState, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   LITTLE AMOUR BOOKS — Customer Refund / Support Request Form
   ============================================================ */

const SUPPORT_EMAIL = "hello@littleamour.com";

const REASONS_DIGITAL = [
  "I accidentally purchased the same item twice",
  "The file is corrupted or won't open",
  "I received the wrong file",
  "My download link isn't working",
  "I believe this was an unauthorised transaction",
  "Other — please describe below",
];

const REASONS_PHYSICAL = [
  "My book arrived damaged",
  "My book arrived with printing defects",
  "I received the wrong book",
  "My order never arrived",
  "Other — please describe below",
];

export function RefundRequestForm({ go }) {
  const [step, setStep] = useState("form"); // form | submitted | error
  const [productType, setProductType] = useState("");
  const [form, setForm] = useState({
    orderNumber: "",
    email: "",
    productName: "",
    reason: "",
    description: "",
    confirmed: false,
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const reasons = productType === "digital" ? REASONS_DIGITAL : productType === "physical" ? REASONS_PHYSICAL : [];

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const readers = files.map(file => new Promise(resolve => {
      const r = new FileReader();
      r.onload = () => resolve({ name: file.name, dataUrl: r.result });
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then(setPhotos);
  };

  const canSubmit = form.orderNumber && form.email && productType && form.reason && form.confirmed;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("refund_requests").insert({
        order_number: form.orderNumber.trim(),
        customer_email: form.email.trim(),
        product_name: form.productName.trim(),
        product_type: productType,
        reason: form.reason,
        description: form.description.trim(),
        photo_count: photos.length,
        status: "pending",
        submitted_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStep("submitted");
    } catch (err) {
      setStep("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "submitted") {
    return (
      <div className="rf-shell">
        <style>{RF_CSS}</style>
        <div className="rf-card rf-success">
          <div className="rf-success-icon">🌙</div>
          <h2 className="rf-h2">Request received</h2>
          <p>We've got your request and will review it within <strong>2–3 business days</strong>. We'll reply to <strong>{form.email}</strong>.</p>
          <p style={{ marginTop: 12, fontSize: 14, color: "#6E5572" }}>Order: {form.orderNumber}</p>
          {productType === "digital" && (
            <div className="rf-notice rf-notice-info" style={{ marginTop: 20 }}>
              A reminder: digital downloads are final sale once delivered. We review requests involving duplicate purchases, corrupted files, failed delivery, incorrect files, unauthorised transactions, and legally required refunds.
            </div>
          )}
          {productType === "physical" && (
            <div className="rf-notice rf-notice-info" style={{ marginTop: 20 }}>
              Physical books are final sale except for damaged, defective, or incorrect items. If you didn't have a chance to include photos, you can reply to your confirmation email.
            </div>
          )}
          <button className="rf-btn-primary" style={{ marginTop: 24 }} onClick={() => go ? go("store") : null}>Back to shop</button>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="rf-shell">
        <style>{RF_CSS}</style>
        <div className="rf-card">
          <h2 className="rf-h2">Something went wrong</h2>
          <p>We couldn't submit your request. Please email us directly at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Refund Request — Order ${form.orderNumber}`} className="rf-link">{SUPPORT_EMAIL}</a>{" "}
            with your order number and we'll sort it out.
          </p>
          <button className="rf-btn-secondary" onClick={() => setStep("form")}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <section style={{ background: "#FAF4EB", minHeight: "100vh", paddingTop: 64, paddingBottom: 80 }}>
      <style>{RF_CSS}</style>
      <div className="rf-wrap">
        {go && (
          <button className="rf-back" onClick={() => go("store")}>← Back to shop</button>
        )}
        <div className="rf-header">
          <p className="rf-eyebrow">Support</p>
          <h1 className="rf-h1">Refund or Support Request</h1>
          <p className="rf-sub">We'll review your request and reply within 2–3 business days.</p>
        </div>

        <form className="rf-form" onSubmit={submit} noValidate>
          {/* Order info */}
          <div className="rf-section">
            <h2 className="rf-sec-h">Your order</h2>
            <div className="rf-row">
              <label className="rf-label">
                Order number <span className="rf-req">*</span>
                <input
                  className="rf-input"
                  type="text"
                  placeholder="e.g. LAB-10042"
                  value={form.orderNumber}
                  onChange={e => set("orderNumber", e.target.value)}
                  required
                />
              </label>
              <label className="rf-label">
                Email used at checkout <span className="rf-req">*</span>
                <input
                  className="rf-input"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required
                />
              </label>
            </div>
            <label className="rf-label">
              Product name
              <input
                className="rf-input"
                type="text"
                placeholder="e.g. The Blue Bag — Digital PDF"
                value={form.productName}
                onChange={e => set("productName", e.target.value)}
              />
            </label>
          </div>

          {/* Product type */}
          <div className="rf-section">
            <h2 className="rf-sec-h">Product type <span className="rf-req">*</span></h2>
            <div className="rf-type-grid">
              {[
                { val: "digital", label: "Digital download", icon: "📥", desc: "PDF, EPUB, printable, or ZIP" },
                { val: "physical", label: "Physical book", icon: "📦", desc: "Paperback or hardcover" },
                { val: "bundle", label: "Bundle", icon: "🎁", desc: "Includes both types" },
              ].map(opt => (
                <button
                  type="button"
                  key={opt.val}
                  className={"rf-type-card" + (productType === opt.val ? " rf-type-on" : "")}
                  onClick={() => { setProductType(opt.val); set("reason", ""); }}
                >
                  <span className="rf-type-icon">{opt.icon}</span>
                  <strong>{opt.label}</strong>
                  <span className="rf-type-desc">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Automated message based on type */}
            {productType === "digital" && (
              <div className="rf-notice rf-notice-info">
                Digital downloads are final sale once delivered. We review requests involving duplicate purchases, corrupted files, failed download links, incorrect files, unauthorised transactions, and legally required refunds.
              </div>
            )}
            {productType === "physical" && (
              <div className="rf-notice rf-notice-info">
                Physical books are final sale except for damaged, defective, or incorrect items. Please upload clear photos so we can review quickly.
              </div>
            )}
            {productType === "bundle" && (
              <div className="rf-notice rf-notice-info">
                For bundles, digital items are final sale once delivered. Physical items may be eligible for replacement if damaged, defective, or incorrect.
              </div>
            )}
          </div>

          {/* Reason */}
          {productType && (
            <div className="rf-section">
              <h2 className="rf-sec-h">Reason for request <span className="rf-req">*</span></h2>
              <div className="rf-reason-list">
                {reasons.map(r => (
                  <label key={r} className={"rf-reason" + (form.reason === r ? " rf-reason-on" : "")}>
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={form.reason === r}
                      onChange={() => set("reason", r)}
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {productType && (
            <div className="rf-section">
              <h2 className="rf-sec-h">Describe the issue</h2>
              <textarea
                className="rf-textarea"
                rows={5}
                placeholder="Please share as much detail as you can. The more we know, the faster we can help."
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>
          )}

          {/* Photo upload for physical */}
          {(productType === "physical" || productType === "bundle") && (
            <div className="rf-section">
              <h2 className="rf-sec-h">Photos <span className="rf-optional">(recommended for physical issues)</span></h2>
              <p className="rf-hint">Clear photos of the damaged item and packaging help us resolve your request faster. Upload up to 4 images.</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handlePhotos}
              />
              <button type="button" className="rf-btn-secondary" onClick={() => fileRef.current?.click()}>
                📸 Upload photos
              </button>
              {photos.length > 0 && (
                <div className="rf-photos">
                  {photos.map((p, i) => (
                    <div key={i} className="rf-photo-thumb">
                      <img src={p.dataUrl} alt={p.name} />
                      <button type="button" className="rf-photo-remove" onClick={() => setPhotos(pp => pp.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Confirmation */}
          {productType && (
            <div className="rf-section">
              <label className="rf-check-label">
                <input
                  type="checkbox"
                  checked={form.confirmed}
                  onChange={e => set("confirmed", e.target.checked)}
                  required
                />
                <span>I confirm the information above is accurate and complete to the best of my knowledge.</span>
              </label>
            </div>
          )}

          {/* Submit */}
          <div className="rf-section">
            <button
              type="submit"
              className="rf-btn-primary"
              disabled={!canSubmit || submitting}
              style={{ opacity: canSubmit ? 1 : 0.5 }}
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>
            <p className="rf-hint" style={{ marginTop: 10 }}>
              Submitting a refund request does not guarantee approval. We review every request individually.
              For urgent issues: <a href={`mailto:${SUPPORT_EMAIL}`} className="rf-link">{SUPPORT_EMAIL}</a>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

const RF_CSS = `
.rf-wrap { max-width: 680px; margin: 0 auto; padding: 0 24px; }
.rf-back { background: none; border: none; color: #6E5572; font-weight: 600; font-size: 14px; cursor: pointer; padding: 0; margin-bottom: 28px; display: block; }
.rf-back:hover { text-decoration: underline; }
.rf-header { margin-bottom: 36px; }
.rf-eyebrow { font-size: 11.5px; letter-spacing: .22em; text-transform: uppercase; color: #6E5572; font-weight: 700; margin-bottom: 10px; }
.rf-h1 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(24px, 3.5vw, 34px); font-weight: 560; color: #131A30; line-height: 1.1; margin-bottom: 10px; }
.rf-h2 { font-family: 'Fraunces', Georgia, serif; font-size: 22px; font-weight: 560; color: #131A30; line-height: 1.1; margin-bottom: 8px; }
.rf-sub { font-size: 16px; color: #5E5468; line-height: 1.6; }
.rf-form { display: flex; flex-direction: column; gap: 0; }
.rf-section { background: #fff; border: 1px solid #ECD9C5; border-radius: 16px; padding: 24px 24px; margin-bottom: 16px; }
.rf-sec-h { font-size: 17px; font-weight: 700; color: #131A30; margin-bottom: 16px; }
.rf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 600px) { .rf-row { grid-template-columns: 1fr; } }
.rf-label { display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 600; color: #33304F; }
.rf-input { border: 1.5px solid #DDD0C8; border-radius: 9px; padding: 10px 13px; font-size: 15px; font-family: inherit; color: #2B2433; background: #FAF4EB; transition: border .15s; }
.rf-input:focus { outline: none; border-color: #E2A857; }
.rf-textarea { width: 100%; border: 1.5px solid #DDD0C8; border-radius: 9px; padding: 11px 13px; font-size: 15px; font-family: inherit; color: #2B2433; background: #FAF4EB; resize: vertical; transition: border .15s; }
.rf-textarea:focus { outline: none; border-color: #E2A857; }
.rf-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
@media (max-width: 600px) { .rf-type-grid { grid-template-columns: 1fr; } }
.rf-type-card { background: #FAF4EB; border: 2px solid #DDD0C8; border-radius: 12px; padding: 16px 14px; display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; text-align: center; transition: border .15s, background .15s; }
.rf-type-card.rf-type-on { border-color: #E2A857; background: #FFF6E8; }
.rf-type-icon { font-size: 26px; }
.rf-type-desc { font-size: 12px; color: #888; }
.rf-notice { border-radius: 10px; padding: 13px 16px; font-size: 13.5px; line-height: 1.6; }
.rf-notice-info { background: #EAF0EB; border-left: 4px solid #6A8F7A; }
.rf-reason-list { display: flex; flex-direction: column; gap: 8px; }
.rf-reason { display: flex; align-items: center; gap: 10px; border: 1.5px solid #DDD0C8; border-radius: 9px; padding: 12px 14px; font-size: 14.5px; cursor: pointer; transition: border .15s, background .15s; }
.rf-reason input { width: 16px; height: 16px; accent-color: #E2A857; flex-shrink: 0; }
.rf-reason.rf-reason-on { border-color: #E2A857; background: #FFF6E8; }
.rf-photos { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
.rf-photo-thumb { position: relative; width: 80px; height: 80px; border-radius: 9px; overflow: hidden; border: 1.5px solid #ECD9C5; }
.rf-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
.rf-photo-remove { position: absolute; top: 3px; right: 3px; background: rgba(0,0,0,.55); border: none; color: #fff; font-size: 10px; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.rf-check-label { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #2B2433; line-height: 1.55; cursor: pointer; }
.rf-check-label input { margin-top: 3px; flex-shrink: 0; width: 16px; height: 16px; accent-color: #E2A857; }
.rf-req { color: #c0392b; }
.rf-optional { font-weight: 400; color: #888; font-size: 13px; }
.rf-hint { font-size: 13px; color: #888; line-height: 1.55; }
.rf-link { color: #6E5572; font-weight: 600; }
.rf-btn-primary { background: #E2A857; color: #fff; border: none; border-radius: 999px; padding: 13px 36px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity .15s; }
.rf-btn-primary:hover:not(:disabled) { opacity: .88; }
.rf-btn-secondary { background: #FAF4EB; border: 1.5px solid #DDD0C8; border-radius: 999px; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; color: #33304F; }
.rf-btn-secondary:hover { background: #F4EADC; }
.rf-card { background: #fff; border: 1px solid #ECD9C5; border-radius: 20px; padding: 40px 36px; max-width: 560px; margin: 0 auto; text-align: center; }
.rf-card.rf-success { border-color: #B8D4BE; }
.rf-success-icon { font-size: 48px; margin-bottom: 16px; }
.rf-shell { padding: 80px 24px; background: #FAF4EB; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; }
`;

export default RefundRequestForm;
