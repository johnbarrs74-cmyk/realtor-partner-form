import { useState } from "react";
import { Shield, User, Building2, Phone, Mail, Hash, Image as ImageIcon, Link as LinkIcon, CheckCircle2, ArrowRight, Sparkles, Award } from "lucide-react";

// ============================================================
// SUBMISSION HANDLER CONFIG
// Replace SUBMISSION_ENDPOINT with your form processor URL
// (Formspree, Vercel Form, Zapier webhook, Google Apps Script, etc.)
// ============================================================
const SUBMISSION_ENDPOINT = "https://cobranded-realtor-calc.vercel.app/api/realtor";
const NOTIFICATION_EMAIL = "john@servicefirstpropertygroup.com";

export default function RealtorPartnerForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    title: "REALTOR®",
    brokerage: "",
    licenseNumber: "",
    licenseState: "TN",
    phone: "",
    email: "",
    tagline: "",
    photo: null,
    photoPreview: "",
    notes: "",
    agreedToTerms: false,
  });

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [submittedSlug, setSubmittedSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError("");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photo: file, photoPreview: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.fullName.trim()) return "Please enter your full name";
      if (!formData.brokerage.trim()) return "Please enter your brokerage";
      if (!formData.licenseNumber.trim()) return "Please enter your license number";
    }
    if (currentStep === 2) {
      if (!formData.phone.trim()) return "Please enter a phone number";
      if (!formData.email.trim() || !formData.email.includes("@")) return "Please enter a valid email";
    }
    if (currentStep === 3) {
      if (!formData.agreedToTerms) return "Please agree to the partnership terms";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setStep(step + 1);
    setError("");
  };

  const handleSubmit = async () => {
    const err = validateStep(3);
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError("");

    try {
      // Send as JSON. Photo is already a base64 data URL via FileReader.
      const payload = {
        fullName: formData.fullName,
        title: formData.title,
        brokerage: formData.brokerage,
        licenseNumber: formData.licenseNumber,
        licenseState: formData.licenseState,
        phone: formData.phone,
        email: formData.email,
        tagline: formData.tagline,
        photoBase64: formData.photoPreview || "",
        notes: formData.notes,
      };

      const response = await fetch(SUBMISSION_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.url) {
        setSubmittedUrl(result.url);
        setSubmittedSlug(result.slug || "");
        setSubmitted(true);
      } else {
        setError(result.error || "Submission failed. Please try again or call John directly at 757-232-1938.");
      }
    } catch (err) {
      setError("Network error. Please try again or call John directly at 757-232-1938.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(submittedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-white to-blue-700" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-yellow-300 opacity-30 animate-pulse"
              style={{
                width: Math.random() * 4 + 1 + "px", height: Math.random() * 4 + 1 + "px",
                top: Math.random() * 100 + "%", left: Math.random() * 100 + "%",
                animationDelay: Math.random() * 3 + "s",
              }} />
          ))}
        </div>

        <div className="relative max-w-xl w-full bg-slate-900/80 backdrop-blur-sm border-2 border-yellow-500/40 rounded-2xl p-8 shadow-2xl animate-fadeIn text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 mb-6 shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black leading-[1.15] pb-2 mb-3 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            You're In, {formData.fullName.split(" ")[0]}!
          </h1>
          <p className="text-blue-200 text-base sm:text-lg mb-6 leading-relaxed">
            Your custom co-branded mortgage calculator is <span className="text-yellow-400 font-bold">live right now</span>. Share this link with every client and lead.
          </p>

          {/* The URL */}
          <div className="bg-slate-800/80 border-2 border-yellow-500/40 rounded-xl p-4 mb-3">
            <p className="text-[10px] uppercase tracking-widest text-yellow-400 font-bold mb-2">Your unique calculator URL</p>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <a href={submittedUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-sm text-yellow-300 font-mono break-all text-left hover:bg-slate-800 transition-colors">
                {submittedUrl}
              </a>
              <button onClick={handleCopyUrl}
                className={`px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  copied ? "bg-green-600 text-white" : "bg-yellow-500 hover:bg-yellow-400 text-slate-900"
                }`}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          <a href={submittedUrl} target="_blank" rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl mb-6 transition-all">
            Visit my calculator →
          </a>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-6 text-left">
            <p className="text-xs uppercase tracking-wider text-yellow-400 font-bold mb-3">What happens next:</p>
            <ul className="space-y-2 text-sm text-blue-100">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">1.</span>
                <span>Bookmark your URL above and share it with every client</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">2.</span>
                <span>Buyers see your photo, your contact info, and live mortgage rates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">3.</span>
                <span>Mortgage applications route to John — you stay focused on closings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">4.</span>
                <span>Both of you win — you look like a pro, your buyers get pre-approved fast</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-slate-400">
            Questions? Call John directly: <a href="tel:7572321938" className="text-yellow-400 font-bold hover:text-yellow-300">757-232-1938</a>
          </p>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        `}</style>
      </div>
    );
  }

  // MAIN FORM
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white opacity-20 animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + "px", height: Math.random() * 3 + 1 + "px",
              top: Math.random() * 100 + "%", left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 3 + "s", animationDuration: Math.random() * 3 + 2 + "s",
            }} />
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-white to-blue-700" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/30 mb-4">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-red-300">Service First Partner Program</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15] pb-2 mb-3 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
            Become a Partner Realtor
          </h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Get your own <span className="text-yellow-400 font-semibold">co-branded mortgage calculator</span> to share with every client and lead.
            <br />Built for you in 24 hours. <span className="text-yellow-400">Free for partner agents.</span>
          </p>
        </div>

        {/* Value props */}
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-slate-900/60 border border-blue-900/50 rounded-xl p-4 text-center">
            <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-blue-100">Your photo + branding featured</p>
          </div>
          <div className="bg-slate-900/60 border border-blue-900/50 rounded-xl p-4 text-center">
            <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-blue-100">Live, daily-updated rates</p>
          </div>
          <div className="bg-slate-900/60 border border-blue-900/50 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-blue-100">Free for partner agents</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold border-2 transition-all ${
                step >= s ? "bg-gradient-to-br from-red-600 to-red-800 border-yellow-400 text-white shadow-lg shadow-red-900/50" : "bg-slate-800 border-slate-600 text-slate-400"
              }`}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s ? "bg-yellow-400" : "bg-slate-700"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-blue-900/50 p-6 sm:p-8 shadow-2xl animate-fadeIn">

          {/* STEP 1 — IDENTITY */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold">Tell Us Who You Are</h2>
              </div>

              <div>
                <label className="text-sm font-semibold text-blue-200 mb-1.5 block">Full Name *</label>
                <input type="text" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-blue-200 mb-1.5 block">Title</label>
                  <select value={formData.title} onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none">
                    <option>REALTOR®</option>
                    <option>Real Estate Agent</option>
                    <option>Broker</option>
                    <option>Associate Broker</option>
                    <option>Principal Broker</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-blue-200 mb-1.5 block">License State</label>
                  <select value={formData.licenseState} onChange={(e) => handleChange("licenseState", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none">
                    <option>TN</option>
                    <option>KY</option>
                    <option>Both TN & KY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-blue-200 mb-1.5 block">Brokerage *</label>
                <input type="text" value={formData.brokerage} onChange={(e) => handleChange("brokerage", e.target.value)}
                  placeholder="Keller Williams Realty - Nashville"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="text-sm font-semibold text-blue-200 mb-1.5 block">License Number *</label>
                <input type="text" value={formData.licenseNumber} onChange={(e) => handleChange("licenseNumber", e.target.value)}
                  placeholder="000000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors" />
              </div>
            </div>
          )}

          {/* STEP 2 — CONTACT & PHOTO */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold">How Clients Reach You</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-blue-200 mb-1.5 block">Phone Number *</label>
                  <input type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="615-555-0100"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-blue-200 mb-1.5 block">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@brokerage.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-blue-200 mb-1.5 block">Personal Tagline (Optional)</label>
                <input type="text" value={formData.tagline} onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="Your Trusted Middle Tennessee Realtor"
                  maxLength="60"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors" />
                <p className="text-xs text-slate-400 mt-1">Appears under your name on the calculator (60 char max)</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-blue-200 mb-1.5 block">Headshot Photo (Optional but Recommended)</label>
                <div className="flex items-center gap-4">
                  {formData.photoPreview ? (
                    <img src={formData.photoPreview} alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400 shadow-lg" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <label className="flex-1 cursor-pointer">
                    <div className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-3 text-center transition-colors">
                      <span className="text-sm text-yellow-400 font-semibold">
                        {formData.photo ? "Change Photo" : "Upload Photo"}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">Square format, under 5MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — REVIEW & CONFIRM */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold">Review & Confirm</h2>
              </div>

              {/* Summary */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                  {formData.photoPreview ? (
                    <img src={formData.photoPreview} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-yellow-400 flex items-center justify-center">
                      <span className="text-lg font-black text-white">
                        {formData.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white">{formData.fullName || "—"}</p>
                    <p className="text-xs text-blue-300">{formData.title} · {formData.brokerage || "—"}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-400">Phone:</span> <span className="text-white">{formData.phone || "—"}</span></div>
                  <div><span className="text-slate-400">Email:</span> <span className="text-white">{formData.email || "—"}</span></div>
                  <div><span className="text-slate-400">License:</span> <span className="text-white">{formData.licenseNumber} ({formData.licenseState})</span></div>
                  <div><span className="text-slate-400">Tagline:</span> <span className="text-white">{formData.tagline || "—"}</span></div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-blue-200 mb-1.5 block">Anything else John should know? (Optional)</label>
                <textarea value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Special requests, branding preferences, target market..."
                  rows="3"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors resize-none" />
              </div>

              <div className="bg-blue-950/40 border border-blue-700/40 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.agreedToTerms}
                    onChange={(e) => handleChange("agreedToTerms", e.target.checked)}
                    className="mt-1 w-5 h-5 accent-red-600 cursor-pointer" />
                  <span className="text-sm text-blue-100 leading-relaxed">
                    I agree to the Service First Partner terms: my client mortgage applications submitted through this calculator will route to <span className="font-semibold text-yellow-400">John Barrs at Intercoastal Mortgage</span>. I understand the calculator is provided free of charge as a marketing tool, and that all parties remain responsible for their own compliance with state real estate and mortgage regulations.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-900/40 border border-red-500/40 rounded-lg p-3 text-sm text-red-200">
              ⚠️ {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-slate-800">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all">
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button onClick={nextStep}
                className="ml-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-lg shadow-red-900/50 flex items-center gap-2 transition-all transform hover:scale-105">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="ml-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-lg shadow-red-900/50 flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                {submitting ? "Submitting..." : (<>Submit Partnership Application <ArrowRight className="w-4 h-4" /></>)}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-slate-400 text-center space-y-1 leading-relaxed">
          <p className="font-semibold text-slate-300">
            John Barrs · Service First Property Group · Keller Williams Realty - Nashville/Music City
          </p>
          <p>Powered by Intercoastal Mortgage, LLC · NMLS #2544471 · Company NMLS #56323</p>
          <p className="pt-1">
            Questions? Call John directly: <a href="tel:7572321938" className="text-yellow-400 font-semibold hover:text-yellow-300">757-232-1938</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}