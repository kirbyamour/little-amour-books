import React, { useState } from "react";

/* ============================================================
   LITTLE AMOUR BOOKS — Customer Legal & Policy Pages
   All policy pages are warm, plain-English, and protective.
   ============================================================ */

const POLICY_VERSION = "2024-01";
const SUPPORT_EMAIL = "hello@littleamour.com";
const BUSINESS_NAME = "Little Amour Books";
const GOVERNING_LAW = "the State of [YOUR STATE], United States";
const DAMAGE_CLAIM_WINDOW = "14";
const PROCESSING_TIME = "3–5";

const P = {
  night: "#131A30", dusk: "#33304F", mauve: "#6E5572",
  rose: "#E5AC9F", gold: "#E2A857", paper: "#FAF4EB",
  paperWarm: "#F4EADC", ink: "#2B2433", inkSoft: "#5E5468",
  cream: "#FFF9F0", sage: "#6A8F7A",
};

/* ---- Shared layout shell ---- */
function PolicyShell({ title, eyebrow, children, go }) {
  return (
    <section style={{ background: P.paper, minHeight: "100vh", paddingTop: 64, paddingBottom: 80 }}>
      <style>{POLICY_CSS}</style>
      <div className="pol-wrap">
        {go && (
          <button className="pol-back" onClick={() => go("store")}>← Back to shop</button>
        )}
        <div className="pol-header">
          {eyebrow && <p className="pol-eyebrow">{eyebrow}</p>}
          <h1 className="pol-h1">{title}</h1>
          <p className="pol-version">Policy version: {POLICY_VERSION} · Last updated January 2024</p>
        </div>
        <div className="pol-body">{children}</div>
        <div className="pol-footer-note">
          <p>Questions? Contact us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We respond within 2–3 business days.</p>
          <p style={{ marginTop: 8, fontSize: 13, color: P.inkSoft }}>
            ⚖️ <em>These policies are operational drafts and should be reviewed by a qualified attorney, especially for refund law, consumer protection, privacy law, digital licensing, children's privacy, sales tax, international sales, and state-specific requirements.</em>
          </p>
        </div>
      </div>
    </section>
  );
}

function Sec({ title, children }) {
  return (
    <div className="pol-sec">
      {title && <h2 className="pol-sec-h">{title}</h2>}
      {children}
    </div>
  );
}

function Box({ color = P.paperWarm, children }) {
  return <div className="pol-box" style={{ background: color, borderLeft: `4px solid ${P.gold}` }}>{children}</div>;
}

function Sub({ title }) {
  return <h3 className="pol-sub">{title}</h3>;
}

/* ============================================================
   1. TERMS OF SALE
   ============================================================ */
export function TermsOfSalePage({ go }) {
  return (
    <PolicyShell title="Terms of Sale" eyebrow="Legal" go={go}>
      <Sec>
        <Box>
          <strong>{BUSINESS_NAME}</strong> sells children's books, digital downloads, printable files, EPUB files, physical books, and related products. By purchasing from our shop, you agree to these Terms of Sale and any policies linked at checkout.
        </Box>
      </Sec>

      <Sec title="Product Types">
        <p>We sell the following product types:</p>
        <ul className="pol-list">
          <li><strong>Digital Reading PDF</strong> — A digital PDF file delivered by download link, optimised for tablets and computers.</li>
          <li><strong>Printable PDF</strong> — A PDF formatted for home or professional printing.</li>
          <li><strong>EPUB / Kindle-friendly file</strong> — A reflowable ebook file compatible with Kindle and most e-readers.</li>
          <li><strong>Physical Paperback</strong> — A printed paperback book shipped to your address.</li>
          <li><strong>Physical Hardcover</strong> — A printed hardcover book shipped to your address.</li>
          <li><strong>Bundle</strong> — A combination of two or more product types, which may include digital and physical items.</li>
          <li><strong>Preorder</strong> — A purchase made before a book is available. See our Preorder Policy.</li>
          <li><strong>Classroom / Group License</strong> — A license for use with groups of children in professional, educational, therapeutic, or organisational settings.</li>
          <li><strong>Gift Purchase</strong> — A purchase made as a gift for another person.</li>
          <li><strong>Author Support Contribution</strong> — An optional voluntary contribution to support the author. Not a donation for tax purposes unless expressly stated and processed through a qualified nonprofit.</li>
        </ul>
      </Sec>

      <Sec title="Digital Products">
        <p>Digital products are delivered electronically by download link. They may include PDF, printable PDF, EPUB, ZIP folder, or other downloadable files.</p>
        <p>You are responsible for using a compatible device or reading app. {BUSINESS_NAME} does not guarantee that every file will display perfectly on every device or application.</p>
        <ul className="pol-list">
          <li>PDF files are best viewed on tablets, computers, and PDF reader apps.</li>
          <li>EPUB files are usually better suited to Kindle-style and e-ink reading.</li>
          <li>Download links may expire or have a limited number of uses. Contact support if a link fails.</li>
        </ul>
      </Sec>

      <Sec title="Physical Products">
        <p>Physical books may be printed in-house, through print-on-demand partners, or through third-party fulfilment services.</p>
        <ul className="pol-list">
          <li>Product photos and mockups are for illustration. Final products may vary slightly in colour, trim, or finish.</li>
          <li>Minor colour differences may occur between screen display and the printed book.</li>
          <li>Estimated production and shipping times are shown at checkout or on the product page. These are estimates, not guarantees, unless expressly stated.</li>
        </ul>
      </Sec>

      <Sec title="Pricing">
        <p>Prices are listed in US dollars unless otherwise shown. Prices may change at any time without notice.</p>
        <p>Discounts and coupons must be applied at checkout and cannot always be applied retroactively. {BUSINESS_NAME} may correct pricing errors, cancel orders affected by obvious pricing mistakes, and issue refunds where required.</p>
      </Sec>

      <Sec title="Taxes">
        <p>Sales tax, VAT, GST, or other applicable taxes may be charged where required by law. Taxes are calculated at checkout when supported by the payment processor. You are responsible for any taxes, customs duties, or import fees not collected at checkout.</p>
      </Sec>

      <Sec title="Payment">
        <p>Payment is due at the time of purchase. Payments may be processed by third-party providers such as Stripe, PayPal, Shopify Payments, or others. {BUSINESS_NAME} does not store full payment card numbers. Orders are not complete until payment is authorised and accepted.</p>
        <p>Suspicious, fraudulent, or high-risk orders may be cancelled at our discretion.</p>
      </Sec>

      <Sec title="Order Confirmation">
        <p>You should receive an order confirmation by email. You are responsible for entering the correct email address and shipping address. If you entered the wrong address, please contact us immediately. {BUSINESS_NAME} is not responsible for delays or failed delivery caused by incorrect customer information, but we will do our best to help.</p>
      </Sec>

      <Sec title="License, Not Ownership">
        <Box>
          When you purchase a digital product, you receive a limited personal-use licence. You do not receive copyright ownership. You may not resell, redistribute, upload publicly, share files, or use files for commercial purposes. Full terms are in our <a href="#license" className="pol-link">Digital Product Licence</a>.
        </Box>
      </Sec>

      <Sec title="Refunds and Returns">
        <p>Digital downloads are final sale once delivered, except where required by law or where {BUSINESS_NAME} chooses to make an exception. Physical book returns are handled under our <a href="#refund" className="pol-link">Refund &amp; Return Policy</a>. Shipping fees may be non-refundable unless required by law or due to {BUSINESS_NAME} error.</p>
      </Sec>

      <Sec title="No Guarantees">
        <p>{BUSINESS_NAME} does not guarantee that a book will meet every personal preference. You are responsible for reading product descriptions, age guidance, content notes, file format details, and product information before purchasing.</p>
      </Sec>

      <Sec title="Legal Savings Clause">
        <Box color="#EAF0EB">
          Nothing in these Terms limits any rights you may have under applicable consumer protection laws. Where the law requires a refund, replacement, cancellation right, or other remedy, {BUSINESS_NAME} will comply.
        </Box>
      </Sec>

      <Sec title="Contact">
        <p>For questions about your order: <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a>. We respond within 2–3 business days.</p>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   2. REFUND & RETURN POLICY
   ============================================================ */
export function RefundPolicyPage({ go }) {
  return (
    <PolicyShell title="Refund & Return Policy" eyebrow="Legal" go={go}>
      <Sec>
        <Box color="#FFF0EE">
          <strong>Summary:</strong> Digital downloads are final sale and non-refundable once delivered, except where required by law. Physical books may be eligible for replacement or refund only if they arrive damaged, defective, or incorrect. Please contact us within {DAMAGE_CLAIM_WINDOW} days of delivery.
        </Box>
      </Sec>

      <Sec title="Digital Downloads — Final Sale">
        <p>Digital PDF files, printable PDFs, EPUB files, ZIP packages, and other digital downloads are <strong>final sale</strong>.</p>
        <p>Once a digital file or download link has been delivered, the purchase is non-refundable. Digital files cannot be returned the same way a physical item can.</p>
        <p><strong>Refunds are not provided because you:</strong></p>
        <ul className="pol-list">
          <li>Changed your mind after purchase</li>
          <li>Bought the wrong item</li>
          <li>No longer want the product</li>
          <li>Expected a different file format</li>
          <li>Did not read the product description before purchasing</li>
        </ul>
      </Sec>

      <Sec title="When We May Help — Digital Exceptions">
        <p>{BUSINESS_NAME} may choose to help or issue a refund in these limited circumstances:</p>
        <ul className="pol-list">
          <li>You accidentally purchased the same item twice</li>
          <li>The file is corrupted and we cannot replace it</li>
          <li>The wrong file was delivered to you</li>
          <li>The download link fails and we cannot fix it</li>
          <li>The transaction was unauthorised or fraudulent, confirmed after review</li>
          <li>A refund is required by law</li>
          <li>Another situation {BUSINESS_NAME} approves in writing</li>
        </ul>
        <Box>
          Submitting a refund request does not guarantee approval. We review every request individually and respond within 2–3 business days.
        </Box>
      </Sec>

      <Sec title="Physical Books">
        <p>Physical books are <strong>final sale</strong> except where your item arrives damaged, defective, materially misprinted, or incorrect.</p>
        <p>To request help with a physical book issue:</p>
        <ul className="pol-list">
          <li>Contact us within <strong>{DAMAGE_CLAIM_WINDOW} days of delivery</strong></li>
          <li>Provide your order number</li>
          <li>Include clear photos of the damage, defect, or incorrect item — and the packaging if relevant</li>
        </ul>
        <p>Depending on the situation, we may offer a replacement, store credit, or refund. Minor colour variations, slight trimming differences, and normal print variation do not qualify as defects.</p>
      </Sec>

      <Sec title="Return Shipping">
        <p>Do not send items back without contacting us first. If {BUSINESS_NAME} requires a return, we will provide instructions.</p>
        <p>If the return is due to our error or a defective item, we may cover return shipping where required or appropriate. If an exception return is approved for another reason, you may be responsible for return shipping costs.</p>
      </Sec>

      <Sec title="Lost or Stolen Packages">
        <p>{BUSINESS_NAME} is not responsible for packages marked as delivered by the carrier but reported lost or stolen after delivery. Please check with household members, neighbours, your building, and your carrier first.</p>
        <p>We're happy to help you open a carrier claim where possible.</p>
      </Sec>

      <Sec title="Wrong Address">
        <p>You are responsible for entering the correct shipping address. Orders shipped to an incorrect address you provided are not automatically eligible for a refund. If a package is returned to us, we may offer reshipment at your cost or another solution.</p>
      </Sec>

      <Sec title="Cancellations">
        <ul className="pol-list">
          <li><strong>Digital orders</strong> — cannot usually be cancelled once delivered.</li>
          <li><strong>Physical orders</strong> — can only be cancelled before production or fulfilment begins. Print-on-demand orders may enter production quickly and may not be cancellable.</li>
          <li><strong>Preorders</strong> — may be cancelled before fulfilment unless otherwise stated.</li>
        </ul>
        <p>Contact us as soon as possible if you need to cancel: <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a></p>
      </Sec>

      <Sec title="Chargebacks">
        <p>Please contact us before filing a chargeback — most issues can be resolved quickly. Fraudulent chargebacks may result in account restriction.</p>
        <p>{BUSINESS_NAME} reserves the right to dispute chargebacks and may provide order records, download logs, delivery proof, policy acceptance records, and customer communications to the payment processor.</p>
      </Sec>

      <Sec title="Your Legal Rights">
        <Box color="#EAF0EB">
          Nothing in this policy limits any rights you may have under applicable consumer protection laws. Where the law requires a refund, replacement, cancellation right, or other remedy, {BUSINESS_NAME} will comply.
        </Box>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   3. DIGITAL PRODUCT LICENCE
   ============================================================ */
export function DigitalLicensePage({ go }) {
  return (
    <PolicyShell title="Digital Product Licence" eyebrow="Legal" go={go}>
      <Sec>
        <Box>
          When you purchase a digital book or file from {BUSINESS_NAME}, you receive a <strong>limited, non-exclusive, non-transferable, revocable licence for personal use only</strong>. You do not receive copyright ownership.
        </Box>
      </Sec>

      <Sec title="What You Can Do">
        <ul className="pol-list">
          <li>Download the file to your personal devices</li>
          <li>Read it on your own devices and apps</li>
          <li>Print one personal-use copy if the product includes printable rights</li>
          <li>Send an EPUB or PDF to your own Kindle account for personal reading</li>
          <li>Share the book with your own child and immediate family at home</li>
        </ul>
      </Sec>

      <Sec title="What You Cannot Do">
        <ul className="pol-list">
          <li>Resell the files</li>
          <li>Redistribute the files to others</li>
          <li>Upload files publicly online</li>
          <li>Share download links</li>
          <li>Email files to others outside your household</li>
          <li>Post files in groups, forums, or communities</li>
          <li>Use files for commercial purposes</li>
          <li>Print copies for resale</li>
          <li>Alter, remix, adapt, or create derivative works</li>
          <li>Remove copyright notices or author credits</li>
          <li>Use art or text separately from the book without written permission</li>
          <li>Train AI models on the files</li>
          <li>Use files in a paid class, therapy practice, school programme, or group setting without a classroom/professional licence</li>
        </ul>
      </Sec>

      <Sec title="Classroom & Professional Use">
        <Box>
          Individual purchases cover personal and family use only. Teachers, therapists, social workers, libraries, schools, churches, and group facilitators need a <strong>classroom or professional licence</strong> for any group setting. Contact us to enquire: <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a>
        </Box>
      </Sec>

      <Sec title="Copyright">
        <p>All text, illustrations, layouts, covers, characters, and designs in {BUSINESS_NAME} publications are protected by copyright and contract rights to the fullest extent permitted by law. Purchase does not transfer copyright to you.</p>
      </Sec>

      <Sec title="Violations">
        <p>Licence violations may result in account termination, revoked download access, legal action, and/or DMCA takedown notices. We take copyright and author protection seriously.</p>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   4. SHIPPING POLICY
   ============================================================ */
export function ShippingPolicyPage({ go }) {
  return (
    <PolicyShell title="Shipping Policy" eyebrow="Legal" go={go}>
      <Sec title="Processing Times">
        <p>Physical books may take <strong>{PROCESSING_TIME} business days</strong> to process before shipping. Print-on-demand products may have additional production times shown on the product page. Orders are processed on business days, excluding public holidays.</p>
        <p>Preorders ship according to the preorder timeline shown at checkout or on the product page.</p>
      </Sec>

      <Sec title="Shipping Times">
        <p>Estimated shipping times are shown at checkout where available. These are estimates, not guarantees. Carrier delays, weather events, and peak periods may affect delivery times.</p>
      </Sec>

      <Sec title="Delays">
        <p>If a physical product cannot ship within the timeframe we've indicated, we will notify you by email and give you the option to accept the delay or cancel your order for a full refund of unshipped merchandise where required by law.</p>
      </Sec>

      <Sec title="Address Accuracy">
        <p>You are responsible for entering the correct shipping address at checkout. {BUSINESS_NAME} is not responsible for failed delivery due to an incorrect address you provided. Please contact us immediately if you notice an error: <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a></p>
      </Sec>

      <Sec title="Tracking">
        <p>Tracking information will be provided when available. Tracking may take 24–48 hours to update after a label is created.</p>
      </Sec>

      <Sec title="Lost, Stolen, or Delivered Packages">
        <p>{BUSINESS_NAME} is not responsible for packages marked as delivered by the carrier but reported lost or stolen. Please check with your household, neighbours, and carrier first. We're happy to help open a carrier claim where possible.</p>
      </Sec>

      <Sec title="International Orders">
        <p>Where international shipping is available, any customs duties, VAT, taxes, and import fees are your responsibility unless collected at checkout. Delivery times vary significantly for international orders. Customs delays are outside our control.</p>
      </Sec>

      <Sec title="Damaged Items">
        <p>If your book arrives damaged, please contact us within <strong>{DAMAGE_CLAIM_WINDOW} days of delivery</strong> with photos of the item and packaging. Replacements and refunds for damaged items are handled under our <a href="#refund" className="pol-link">Refund &amp; Return Policy</a>.</p>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   5. PRIVACY POLICY
   ============================================================ */
export function PrivacyPolicyPage({ go }) {
  return (
    <PolicyShell title="Privacy Policy" eyebrow="Legal" go={go}>
      <Sec>
        <p>We care deeply about your privacy. This policy explains what information we collect, how we use it, and how we protect it. If you have questions, email us at <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a>.</p>
      </Sec>

      <Sec title="Information We Collect">
        <ul className="pol-list">
          <li>Name and contact information (email, billing and shipping address)</li>
          <li>Payment details — handled securely by our payment processor; we do not store full card numbers</li>
          <li>Order history and product purchases</li>
          <li>Download logs (to support delivery and prevent fraud)</li>
          <li>IP address and basic device/browser information</li>
          <li>Account information if you create an account</li>
          <li>Customer support messages</li>
          <li>Marketing email preferences and subscription status</li>
          <li>Analytics and cookie data (see Cookies section)</li>
          <li>Reviews or testimonials if you submit them</li>
        </ul>
      </Sec>

      <Sec title="How We Use Your Information">
        <ul className="pol-list">
          <li>Process and fulfil your orders</li>
          <li>Deliver digital downloads and ship physical products</li>
          <li>Provide customer support and respond to enquiries</li>
          <li>Detect and prevent fraud and chargebacks</li>
          <li>Handle refunds, replacements, and claims</li>
          <li>Send order confirmation and transactional emails</li>
          <li>Send marketing emails if you've opted in (you can unsubscribe anytime)</li>
          <li>Improve our website and shop</li>
          <li>Comply with applicable laws</li>
        </ul>
      </Sec>

      <Sec title="Payment Processing">
        <p>Payment is handled by third-party processors (such as Stripe or PayPal). {BUSINESS_NAME} does not store full card numbers. The payment processor's privacy policy also applies to your transaction.</p>
      </Sec>

      <Sec title="Email Marketing">
        <p>If you opt in to marketing emails, you can unsubscribe at any time using the link in any email. Unsubscribing from marketing does not stop transactional emails related to your orders.</p>
      </Sec>

      <Sec title="Children's Privacy">
        <Box>
          Our shop is intended for adults purchasing books for children. Children should not submit personal information directly. If a child has submitted personal data, a parent or guardian may contact us at <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a> to request a review and deletion.
        </Box>
      </Sec>

      <Sec title="Cookies">
        <p>We use cookies and similar technologies for:</p>
        <ul className="pol-list">
          <li><strong>Essential cookies</strong> — needed for checkout and security</li>
          <li><strong>Preference cookies</strong> — to remember your settings</li>
          <li><strong>Analytics cookies</strong> — to understand how people use our site (anonymised where possible)</li>
        </ul>
        <p>You can manage cookies through your browser settings.</p>
      </Sec>

      <Sec title="Who We Share Data With">
        <p>We share data only as needed to run our business:</p>
        <ul className="pol-list">
          <li>Payment processors (to process transactions)</li>
          <li>Shipping and fulfilment providers (to deliver physical orders)</li>
          <li>Email service providers (to send order confirmations and newsletters)</li>
          <li>Analytics providers (to understand site usage)</li>
          <li>Fraud prevention services</li>
          <li>Legal or compliance advisors where required</li>
        </ul>
        <p>We do not sell your personal data.</p>
      </Sec>

      <Sec title="Your Privacy Rights">
        <p>Depending on where you live, you may have the right to:</p>
        <ul className="pol-list">
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of marketing communications</li>
        </ul>
        <p>To exercise any of these rights, contact us at <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a>.</p>
      </Sec>

      <Sec title="Security">
        <p>We use reasonable technical and organisational safeguards to protect your data. No system is 100% secure. If you have concerns about your data, please contact us.</p>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   6. WEBSITE TERMS OF USE
   ============================================================ */
export function WebsiteTermsPage({ go }) {
  return (
    <PolicyShell title="Website Terms of Use" eyebrow="Legal" go={go}>
      <Sec>
        <p>By using the {BUSINESS_NAME} website, you agree to these Terms of Use. If you don't agree, please don't use the site.</p>
      </Sec>
      <Sec title="Content Ownership">
        <p>All content on this website — including text, images, illustrations, designs, characters, logos, and other materials — is owned by or licensed to {BUSINESS_NAME}. You may not copy, scrape, reproduce, republish, or use any content for commercial purposes without our written permission.</p>
      </Sec>
      <Sec title="Acceptable Use">
        <p>You agree not to:</p>
        <ul className="pol-list">
          <li>Use the site for any unlawful purpose</li>
          <li>Attempt to hack, bypass security, or interfere with the site</li>
          <li>Upload malicious code, viruses, or harmful files</li>
          <li>Harass, abuse, or threaten other users or {BUSINESS_NAME} staff</li>
          <li>Impersonate any person or entity</li>
          <li>Scrape or harvest data from the site</li>
          <li>Use automated tools to access the site without permission</li>
        </ul>
      </Sec>
      <Sec title="User Accounts">
        <p>If you create an account, you must provide accurate information and keep your credentials secure. {BUSINESS_NAME} may suspend or terminate accounts that violate these terms.</p>
      </Sec>
      <Sec title="Errors and Availability">
        <p>Product descriptions and prices may occasionally contain errors. We reserve the right to correct errors and cancel orders affected by them. We do not guarantee that the site will always be available or error-free.</p>
      </Sec>
      <Sec title="Disclaimers">
        <p>The site and its content are provided "as is" without warranties of any kind, to the extent permitted by law. {BUSINESS_NAME} is not a therapy service, legal adviser, or crisis support service. If you or someone you know is in danger, please contact emergency services or the National DV Hotline at 1-800-799-7233.</p>
      </Sec>
      <Sec title="Limitation of Liability">
        <p>To the extent permitted by law, {BUSINESS_NAME}'s liability for any claim arising from use of this site is limited to the amount you paid for the relevant purchase.</p>
      </Sec>
      <Sec title="Governing Law">
        <p>These terms are governed by the laws of {GOVERNING_LAW}. Any disputes will be resolved in the courts of that jurisdiction unless otherwise required by law.</p>
      </Sec>
      <Sec title="Changes to These Terms">
        <p>We may update these Terms of Use at any time. Continued use of the site after changes are posted means you accept the updated terms.</p>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   7. COPYRIGHT / DMCA POLICY
   ============================================================ */
export function DMCAPolicyPage({ go }) {
  return (
    <PolicyShell title="Copyright & DMCA Policy" eyebrow="Legal" go={go}>
      <Sec>
        <p>{BUSINESS_NAME} respects intellectual property rights and expects users and partners to do the same. All book content, illustrations, characters, designs, and materials published by {BUSINESS_NAME} are protected by copyright.</p>
      </Sec>
      <Sec title="Reporting Copyright Infringement">
        <p>If you believe your copyrighted work has been infringed, please send a written notice to <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a> with the following:</p>
        <ul className="pol-list">
          <li>Your electronic or physical signature</li>
          <li>A description of the copyrighted work you believe has been infringed</li>
          <li>A description of where the allegedly infringing material is located on our site</li>
          <li>Your contact information (name, address, phone, email)</li>
          <li>A statement that you have a good-faith belief that the use is not authorised by the copyright owner, its agent, or the law</li>
          <li>A statement made under penalty of perjury that your notice is accurate and that you are the copyright owner or authorised to act on their behalf</li>
        </ul>
      </Sec>
      <Sec title="Counter-Notice">
        <p>If you believe your content was removed in error, you may submit a counter-notice to <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a> with the information required under the DMCA. We will forward it to the original claimant.</p>
      </Sec>
      <Sec title="Repeat Infringers">
        <p>{BUSINESS_NAME} will terminate the accounts of users who are repeat copyright infringers in appropriate circumstances.</p>
      </Sec>
      <Sec title="Our Content">
        <p>All {BUSINESS_NAME} books, illustrations, characters, and brand assets are protected. Unauthorised copying, distribution, or commercial use may result in legal action and/or DMCA notices.</p>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   8. ACCESSIBILITY STATEMENT
   ============================================================ */
export function AccessibilityPage({ go }) {
  return (
    <PolicyShell title="Accessibility Statement" eyebrow="Legal" go={go}>
      <Sec>
        <p>{BUSINESS_NAME} is committed to making our website and books accessible to everyone, including people with disabilities.</p>
      </Sec>
      <Sec title="Our Commitment">
        <p>We aim to meet WCAG 2.1 Level AA accessibility standards where possible. This includes:</p>
        <ul className="pol-list">
          <li>Readable font sizes and sufficient colour contrast</li>
          <li>Alternative text for images</li>
          <li>Keyboard navigability</li>
          <li>Clear page structure with headings</li>
          <li>Accessible form labels and error messages</li>
        </ul>
      </Sec>
      <Sec title="Known Limitations">
        <p>Some older content or third-party components may not yet meet full accessibility standards. We are actively working to improve these areas.</p>
      </Sec>
      <Sec title="Digital Book Accessibility">
        <p>Our EPUB files are designed for compatibility with screen readers and e-reader accessibility features. If you encounter accessibility issues with a specific book file, please contact us and we will do our best to assist.</p>
      </Sec>
      <Sec title="Contact Us">
        <p>If you experience any accessibility barriers on our site or with our products, please let us know at <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a>. We take all feedback seriously and will respond within 2–3 business days.</p>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   9. REVIEWS POLICY
   ============================================================ */
export function ReviewsPolicyPage({ go }) {
  return (
    <PolicyShell title="Reviews & Testimonials Policy" eyebrow="Legal" go={go}>
      <Sec>
        <p>We welcome honest reviews and believe they help families find the right books for their situation.</p>
      </Sec>
      <Sec title="Our Standards">
        <ul className="pol-list">
          <li>Reviews must be honest and reflect your genuine experience</li>
          <li>No fake, incentivised, or manufactured reviews</li>
          <li>No abusive, harassing, or defamatory content</li>
          <li>No private information about other people</li>
          <li>No spam, off-topic content, or promotional material</li>
        </ul>
      </Sec>
      <Sec title="Moderation">
        <p>{BUSINESS_NAME} may moderate or remove reviews that contain spam, profanity, hate speech, threats, private information, or content that is clearly irrelevant to the product. We do not remove reviews solely because they are negative — honest critical feedback is valuable.</p>
      </Sec>
      <Sec title="Incentivised Reviews">
        <p>If we ever offer an incentive (such as a free product or discount) in exchange for a review, we will disclose this clearly in accordance with applicable advertising standards.</p>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   10. PREORDER POLICY
   ============================================================ */
export function PreorderPolicyPage({ go }) {
  return (
    <PolicyShell title="Preorder Policy" eyebrow="Legal" go={go}>
      <Sec>
        <Box>
          Preorders let you reserve a book before it's available. Payment may be collected at checkout or at fulfilment depending on the product.
        </Box>
      </Sec>
      <Sec title="Release Dates">
        <p>Estimated release dates are shown on the product page. Release dates may change. We will notify you by email if there is a material delay to your preorder.</p>
      </Sec>
      <Sec title="Cancellations">
        <p>You may cancel a preorder before digital delivery or physical fulfilment begins, unless otherwise stated. Once a digital preorder file is delivered, the standard digital final-sale terms apply. Physical preorders follow our standard physical return policy after fulfilment.</p>
      </Sec>
      <Sec title="Contact">
        <p>For preorder questions: <a href={`mailto:${SUPPORT_EMAIL}`} className="pol-link">{SUPPORT_EMAIL}</a></p>
      </Sec>
    </PolicyShell>
  );
}

/* ============================================================
   FOOTER LEGAL LINKS COMPONENT
   Drop this inside any footer
   ============================================================ */
export function PolicyFooterLinks({ go }) {
  const links = [
    ["policy-terms", "Terms of Sale"],
    ["policy-refund", "Refund & Return Policy"],
    ["policy-license", "Digital Product Licence"],
    ["policy-shipping", "Shipping Policy"],
    ["policy-privacy", "Privacy Policy"],
    ["policy-website-terms", "Website Terms of Use"],
    ["policy-dmca", "Copyright / DMCA"],
    ["policy-accessibility", "Accessibility"],
    ["policy-refund-form", "Refund Request"],
    ["contact", "Contact / Support"],
  ];
  return (
    <nav className="pol-footer-links" aria-label="Legal links">
      {links.map(([page, label]) => (
        <button key={page} className="pol-footer-link" onClick={() => go(page)}>{label}</button>
      ))}
    </nav>
  );
}

/* ============================================================
   CHECKOUT POLICY LINKS (near checkout button)
   ============================================================ */
export function CheckoutPolicyLinks({ go }) {
  return (
    <p className="checkout-policy-links" style={{ fontSize: 12.5, color: "#888", lineHeight: 1.6, marginTop: 8 }}>
      By completing your purchase you agree to our{" "}
      <button className="pol-link-inline" onClick={() => go("policy-terms")}>Terms of Sale</button>,{" "}
      <button className="pol-link-inline" onClick={() => go("policy-refund")}>Refund Policy</button>,{" "}
      <button className="pol-link-inline" onClick={() => go("policy-license")}>Digital Licence</button>,{" "}
      <button className="pol-link-inline" onClick={() => go("policy-shipping")}>Shipping Policy</button>, and{" "}
      <button className="pol-link-inline" onClick={() => go("policy-privacy")}>Privacy Policy</button>.
    </p>
  );
}

/* ============================================================
   PRODUCT PAGE NOTICES
   ============================================================ */
export function DigitalProductNotice() {
  return (
    <div className="product-notice product-notice-digital">
      <span className="product-notice-icon">📥</span>
      <div>
        <strong>This is a digital download.</strong> No physical item will be shipped.
        Digital downloads are final sale and non-refundable once delivered, except where required by law.
      </div>
    </div>
  );
}

export function PhysicalProductNotice() {
  return (
    <div className="product-notice product-notice-physical">
      <span className="product-notice-icon">📦</span>
      <div>
        <strong>Physical book.</strong> Estimated production and shipping times shown at checkout.
        Final sale except for damaged, defective, or incorrect items.
      </div>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */
const POLICY_CSS = `
.pol-wrap { max-width: 780px; margin: 0 auto; padding: 0 26px; }
.pol-back { background: none; border: none; color: #6E5572; font-weight: 600; font-size: 14px; cursor: pointer; padding: 0; margin-bottom: 28px; display: block; }
.pol-back:hover { text-decoration: underline; }
.pol-header { margin-bottom: 40px; padding-bottom: 28px; border-bottom: 2px solid #ECD9C5; }
.pol-eyebrow { font-size: 11.5px; letter-spacing: .22em; text-transform: uppercase; color: #6E5572; font-weight: 700; margin-bottom: 10px; }
.pol-h1 { font-family: 'Fraunces', Georgia, serif; font-size: clamp(26px, 4vw, 38px); font-weight: 560; color: #131A30; line-height: 1.1; margin-bottom: 10px; }
.pol-version { font-size: 12.5px; color: #999; }
.pol-body { display: flex; flex-direction: column; gap: 32px; }
.pol-sec { }
.pol-sec-h { font-family: 'Fraunces', Georgia, serif; font-size: 21px; font-weight: 560; color: #131A30; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #ECD9C5; }
.pol-sub { font-size: 16px; font-weight: 700; color: #33304F; margin: 14px 0 8px; }
.pol-box { border-radius: 12px; padding: 18px 20px; line-height: 1.65; font-size: 15px; }
.pol-list { padding-left: 22px; line-height: 2; color: #2B2433; }
.pol-list li { margin-bottom: 2px; }
.pol-link { color: #6E5572; font-weight: 600; text-decoration: underline; }
.pol-link-inline { background: none; border: none; color: #6E5572; font-weight: 600; text-decoration: underline; cursor: pointer; font-size: inherit; padding: 0; }
.pol-footer-note { margin-top: 48px; padding-top: 24px; border-top: 1px solid #ECD9C5; font-size: 14px; color: #666; line-height: 1.6; }
.pol-sec p { line-height: 1.72; color: #2B2433; margin-bottom: 12px; }

/* Footer policy links */
.pol-footer-links { display: flex; flex-wrap: wrap; gap: 6px 14px; }
.pol-footer-link { background: none; border: none; color: #C9BED2; font-size: 12.5px; cursor: pointer; padding: 0; opacity: 0.85; }
.pol-footer-link:hover { color: #E2A857; opacity: 1; }

/* Product notices */
.product-notice { display: flex; gap: 12px; align-items: flex-start; border-radius: 10px; padding: 13px 16px; font-size: 13.5px; line-height: 1.55; margin: 14px 0; }
.product-notice-digital { background: #EAF0EB; border: 1px solid #B8D4BE; }
.product-notice-physical { background: #F4EADC; border: 1px solid #E8C99A; }
.product-notice-icon { font-size: 20px; flex-shrink: 0; }
`;

export { POLICY_VERSION, POLICY_CSS };
