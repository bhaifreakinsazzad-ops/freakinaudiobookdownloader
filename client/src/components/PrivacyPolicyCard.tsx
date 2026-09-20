import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyCard() {
  return (
    <div className="settings-card privacy-policy-card">
      <div className="settings-card-head">
        <div className="settings-icon blue">
          <LockKeyhole size={18} />
        </div>
        <div>
          <h2>Privacy policy</h2>
          <p>Clear boundaries for capture, storage, and sharing.</p>
        </div>
      </div>
      <div className="policy-copy">
        <p>
          <b>Local-first by default.</b> Audio and metadata stay in this
          browser’s IndexedDB archive. The app does not record in the background
          or upload without an explicit action and consent.
        </p>
        <p>
          <b>Rights and protected media.</b> Capture requires your confirmation
          that you have permission. Protected or DRM-controlled sources are
          blocked; the app never bypasses access controls.
        </p>
        <p>
          <b>বাংলা:</b> আপনার অনুমতি ছাড়া কোনো রেকর্ডিং বা আপলোড করা হয় না।
          অধিকার নিশ্চিত না করলে এবং সুরক্ষিত/DRM কনটেন্ট হলে ক্যাপচার বন্ধ
          থাকে।
        </p>
      </div>
      <div className="policy-badges">
        <span>
          <ShieldCheck size={14} /> No hidden recording
        </span>
        <span>
          <LockKeyhole size={14} /> No upload without consent
        </span>
      </div>
    </div>
  );
}
