'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Clock,
  Code2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Share2,
  ArrowRight,
  ShieldAlert,
  Terminal,
  BookOpen,
  Send,
  Zap,
} from 'lucide-react';
import {
  ENGINEERING_BRANCHES,
  ENGINEERING_YEARS,
  WORKSHOP_DETAILS,
} from '@/lib/constants';
import {
  generateWhatsAppMessage,
  generateEmailTemplate,
  buildReferralUrl,
} from '@/lib/referral';

interface FormState {
  fullName: string;
  email: string;
  college: string;
  graduationYear: string;
  branch: string;
  referralCode: string;
  utmSource: string;
}

function RegistrationForm() {
  const searchParams = useSearchParams();
  const refFromUrl = searchParams.get('ref') || '';
  const utmSourceFromUrl = searchParams.get('utm_source') || '';

  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    email: '',
    college: '',
    graduationYear: ENGINEERING_YEARS[0], // Default to Final Year
    branch: ENGINEERING_BRANCHES[0],
    referralCode: refFromUrl,
    utmSource: utmSourceFromUrl,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<any | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Copy feedback state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (refFromUrl) {
      setFormData((prev) => ({ ...prev, referralCode: refFromUrl.toUpperCase() }));
    }
    if (utmSourceFromUrl) {
      setFormData((prev) => ({ ...prev, utmSource: utmSourceFromUrl.toLowerCase() }));
    }
  }, [refFromUrl, utmSourceFromUrl]);

  const validateClientSide = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Please enter your full name.';
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.college.trim()) errors.college = 'Please specify your college or university.';
    if (!formData.graduationYear) errors.graduationYear = 'Select your graduation year.';
    if (!formData.branch) errors.branch = 'Select your branch.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setDuplicateResult(null);

    if (!validateClientSide()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 409 && data.duplicate) {
        setDuplicateResult(data);
        return;
      }

      if (!res.ok || !data.success) {
        if (data.errors) {
          setFieldErrors(data.errors);
        } else {
          setGeneralError(data.message || 'Registration failed. Please check your entries.');
        }
        return;
      }

      setSuccessResult(data);
    } catch (err: any) {
      setGeneralError('Network error connecting to registration server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFullShareLink = () => {
    const code = successResult?.registration?.myReferralCode || formData.referralCode;
    return buildReferralUrl(code);
  };

  const copyToClipboard = async (text: string, type: 'link' | 'wa' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else if (type === 'wa') {
        setCopiedWhatsApp(true);
        setTimeout(() => setCopiedWhatsApp(false), 2000);
      } else if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Interactive 60-Minute Workshop for Final-Year Engineers</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Build Your First AI Project <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
            in 60 Minutes
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed text-balance">
          Stop watching passive tutorials. Join our live, hands-on session where you will build,
          test, and deploy a functional LLM-powered project with production-grade code.
        </p>

        {/* Quick Highlights Pill Row */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>60 Minutes Live</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>Real GitHub Repository</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span>Free Registration</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left/Right and Workshop Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Workshop Curriculum & Expectations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              What You Will Build & Learn
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Many students struggle to transition from prompt engineering in ChatGPT to writing
              actual software that interfaces with AI APIs. In this 60-minute practical lab, you
              will write clean, deterministic code to integrate an LLM pipeline with error
              handling and structured responses.
            </p>

            {/* Timeline Breakdown */}
            <div className="space-y-4">
              <div className="border-l-2 border-indigo-500 pl-4 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Minutes 00 – 15
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  LLM API Fundamentals & Architecture
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Understand authentication, token optimization, temperature, and structured JSON outputs.
                </p>
              </div>

              <div className="border-l-2 border-emerald-500 pl-4 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Minutes 15 – 40
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Live Coding: Intelligent Document Query Assistant
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Build and test an end-to-end Python/JS backend that ingests user files and synthesizes accurate answers.
                </p>
              </div>

              <div className="border-l-2 border-purple-500 pl-4 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Minutes 40 – 50
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Latency, Retries, & Failure Modes
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  How to prevent application crashes when API rate limits or hallucinated formats occur.
                </p>
              </div>

              <div className="border-l-2 border-amber-500 pl-4 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Minutes 50 – 60
                </span>
                <h4 className="text-sm font-bold text-slate-800">
                  Code Walkthrough & Capstone Project Ideas
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cloneable GitHub starter kit distribution and final-year project guidance.
                </p>
              </div>
            </div>

            {/* Key Takeaways Checklist */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Workshop Deliverables
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {WORKSHOP_DETAILS.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Honest Transparency Notice */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Transparent Educational Policy:</span>
              <p className="mt-0.5">{WORKSHOP_DETAILS.disclaimer}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Registration Form / Result States (5 cols) */}
        <div className="lg:col-span-5">
          {/* SUCCESS STATE */}
          {successResult ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-lg shadow-emerald-500/5 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Spot Reserved!</h3>
              <p className="text-sm text-slate-600 mt-1">
                You are confirmed for <strong>Build Your First AI Project in 60 Minutes</strong>.
                Details have been registered for <strong>{successResult.registration.email}</strong>.
              </p>

              {/* Unique Student Referral Share Block */}
              <div className="mt-6 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    Your Personal Invite Link
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                    {successResult.registration.myReferralCode}
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Invite your project teammates! Registrations via your link count toward the Student Referral target.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getFullShareLink()}
                    className="w-full text-xs font-mono bg-white border border-emerald-300 rounded-lg px-2.5 py-2 text-slate-700 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(getFullShareLink(), 'link')}
                    className="shrink-0 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* WhatsApp & Email Quick Templates */}
                <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const msg = generateWhatsAppMessage(getFullShareLink(), successResult.registration.fullName);
                      copyToClipboard(msg, 'wa');
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-sm transition"
                  >
                    {copiedWhatsApp ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedWhatsApp ? 'WhatsApp Copied!' : 'Copy WhatsApp Invite'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const tmpl = generateEmailTemplate(getFullShareLink(), successResult.registration.fullName);
                      copyToClipboard(`Subject: ${tmpl.subject}\n\n${tmpl.body}`, 'email');
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Email Copied!' : 'Copy Email Invite'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center text-xs text-slate-500">
                <span>Attributed to: <strong>{successResult.attribution.channel}</strong></span>
                <button
                  onClick={() => {
                    setSuccessResult(null);
                    setFormData({
                      fullName: '',
                      email: '',
                      college: '',
                      graduationYear: ENGINEERING_YEARS[0],
                      branch: ENGINEERING_BRANCHES[0],
                      referralCode: '',
                      utmSource: '',
                    });
                  }}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Register another student
                </button>
              </div>
            </div>
          ) : duplicateResult ? (
            /* DUPLICATE REGISTRATION NOTICE */
            <div className="bg-white rounded-2xl border-2 border-amber-500/40 p-6 sm:p-8 shadow-lg shadow-amber-500/5 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Already Registered!</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {duplicateResult.message}
              </p>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p><strong>Registered Email:</strong> {duplicateResult.existingData?.email}</p>
                <p><strong>Original Channel:</strong> {duplicateResult.existingData?.channel}</p>
                {duplicateResult.existingData?.myReferralCode && (
                  <p><strong>Your Referral Code:</strong> {duplicateResult.existingData?.myReferralCode}</p>
                )}
              </div>
              <button
                onClick={() => setDuplicateResult(null)}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
              >
                Back to Registration Form
              </button>
            </div>
          ) : (
            /* ACTIVE REGISTRATION FORM */
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Reserve Your Free Seat</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Limited live interactive seats for engineering students.
                </p>

                {/* Referral Applied Pill if detected */}
                {formData.referralCode && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Referral Code Applied: <strong className="font-mono">{formData.referralCode}</strong>
                    </span>
                  </div>
                )}
              </div>

              {generalError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Aarav Patel"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                      fieldErrors.fullName
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College / Student Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. aarav.p@college.edu.in"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                      fieldErrors.email
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Emails are automatically trimmed and normalized to lowercase.
                  </p>
                </div>

                {/* College Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College or University Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g. RV College of Engineering, Bengaluru"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                      fieldErrors.college
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                  />
                  {fieldErrors.college && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.college}</p>
                  )}
                </div>

                {/* Graduation Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Graduation Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {ENGINEERING_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Engineering Branch */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Engineering Branch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {ENGINEERING_BRANCHES.map((br) => (
                      <option key={br} value={br}>
                        {br}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Referral Code (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campus Referral Code <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. RVCE-AI24 or STU-..."
                    className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  {fieldErrors.referralCode && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.referralCode}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
                >
                  {submitting ? (
                    <span>Confirming Spot...</span>
                  ) : (
                    <>
                      <span>Complete Free Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading workshop registration...
        </div>
      }
    >
      <RegistrationForm />
    </Suspense>
  );
}

