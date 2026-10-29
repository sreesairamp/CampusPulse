'use client';

import React, { useState, useEffect } from 'react';
import {
  Users2,
  UserPlus,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  Search,
  Award,
  Zap,
  Target,
  ArrowUpRight,
} from 'lucide-react';
import {
  generateWhatsAppMessage,
  generateEmailTemplate,
  buildReferralUrl,
} from '@/lib/referral';

interface Partner {
  id: string;
  name: string;
  email: string;
  college: string;
  referralCode: string;
  targetRegistrations: number;
  clicks: number;
  registrationsCount: number;
  conversionRate: number;
  targetProgress: number;
  isDemo: boolean;
  createdAt: string;
}

export default function CampusPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedPartnerForShare, setSelectedPartnerForShare] = useState<Partner | null>(null);

  // New partner form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCollege, setNewCollege] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newTarget, setNewTarget] = useState('60');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Copy status indicators
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/partners');
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners);
        if (data.partners.length > 0 && !selectedPartnerForShare) {
          setSelectedPartnerForShare(data.partners[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          college: newCollege,
          referralCode: newCode,
          targetRegistrations: Number(newTarget) || 60,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewCollege('');
        setNewCode('');
        fetchPartners();
      } else {
        setFormError(data.message || 'Failed to create partner');
      }
    } catch (e: any) {
      setFormError('Network error onboarding partner.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getPartnerLink = (code: string) => {
    return buildReferralUrl(code);
  };

  const copyToClipboard = async (text: string, type: 'code' | 'link' | 'wa' | 'email', id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code' && id) {
        setCopiedCodeId(id);
        setTimeout(() => setCopiedCodeId(null), 2000);
      } else if (type === 'link') {
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
      console.error(e);
    }
  };

  const filteredPartners = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Partner Referral Network
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Target: 300 Registrations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Empower campus student leads with tracked referral codes and automated invitation assets.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard Campus Partner</span>
        </button>
      </div>

      {/* Main Grid: Partner Table (8 cols) and Asset Generator (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Partners Leaderboard Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Partner Performance ({filteredPartners.length})
              </h2>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search college, lead, or code..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading partners...</div>
          ) : filteredPartners.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No campus partners found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Partner</th>
                    <th className="py-2.5 px-3 font-semibold">Referral Code</th>
                    <th className="py-2.5 px-3 font-semibold text-right" title="Total referral link clicks">Link Clicks</th>
                    <th className="py-2.5 px-3 font-semibold text-right" title="Confirmed unique registrations">Registrations</th>
                    <th className="py-2.5 px-3 font-semibold text-right" title="Click-to-Registration Conversion Rate = (Registrations / Clicks) × 100%">Click-to-Reg Conv. %</th>
                    <th className="py-2.5 px-3 font-semibold text-right" title="Individual Quota Target Progress = (Registrations / 60) × 100%">Quota Progress (60)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPartners.map((partner) => {
                    const isSelected = selectedPartnerForShare?.id === partner.id;
                    return (
                      <tr
                        key={partner.id}
                        className={`hover:bg-slate-50/70 transition ${
                          isSelected ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{partner.name}</div>
                          <div className="text-[11px] text-slate-500">{partner.college}</div>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() =>
                              copyToClipboard(partner.referralCode, 'code', partner.id)
                            }
                            title="Click to copy referral code"
                            className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 transition"
                          >
                            <span>{partner.referralCode}</span>
                            {copiedCodeId === partner.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">{partner.clicks}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {partner.registrationsCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                            {partner.conversionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <div className="text-[11px] font-bold text-slate-800">
                            {partner.targetProgress}%
                          </div>
                          <div className="w-16 ml-auto bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1 rounded-full"
                              style={{ width: `${Math.min(100, partner.targetProgress)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedPartnerForShare(partner)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Share</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Copyable Invitation Asset Generator */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Invitation Asset Generator</h3>
            </div>
            {selectedPartnerForShare && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                {selectedPartnerForShare.referralCode}
              </span>
            )}
          </div>

          {selectedPartnerForShare ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs">
                <span className="text-slate-500">Selected Ambassador:</span>
                <p className="font-bold text-indigo-950 text-sm">
                  {selectedPartnerForShare.name}
                </p>
                <p className="text-[11px] text-slate-600">{selectedPartnerForShare.college}</p>
              </div>

              {/* Direct Link Copy */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unique Partner Registration Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getPartnerLink(selectedPartnerForShare.referralCode)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 select-all"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        getPartnerLink(selectedPartnerForShare.referralCode),
                        'link'
                      )
                    }
                    className="shrink-0 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp Broadcast Template */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                    WhatsApp Invite Template
                  </span>
                  <button
                    onClick={() => {
                      const msg = generateWhatsAppMessage(
                        getPartnerLink(selectedPartnerForShare.referralCode),
                        selectedPartnerForShare.name
                      );
                      copyToClipboard(msg, 'wa');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-semibold transition"
                  >
                    {copiedWhatsApp ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedWhatsApp ? 'Copied Template!' : 'Copy WhatsApp'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {generateWhatsAppMessage(
                    getPartnerLink(selectedPartnerForShare.referralCode),
                    selectedPartnerForShare.name
                  )}
                </div>
              </div>

              {/* Email Broadcast Template */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                    Email Invite Template
                  </span>
                  <button
                    onClick={() => {
                      const tmpl = generateEmailTemplate(
                        getPartnerLink(selectedPartnerForShare.referralCode),
                        selectedPartnerForShare.name
                      );
                      copyToClipboard(`Subject: ${tmpl.subject}\n\n${tmpl.body}`, 'email');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold transition"
                  >
                    {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? 'Copied Email!' : 'Copy Email'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {
                    generateEmailTemplate(
                      getPartnerLink(selectedPartnerForShare.referralCode),
                      selectedPartnerForShare.name
                    ).body
                  }
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              Select a partner from the table on the left to generate shareable referral assets.
            </p>
          )}
        </div>
      </div>

      {/* Onboard Campus Partner Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Onboard Campus Ambassador</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ambassador Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rao"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ambassador Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. vikram.r@college.edu.in"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College or Campus Name
                </label>
                <input
                  type="text"
                  required
                  value={newCollege}
                  onChange={(e) => setNewCollege(e.target.value)}
                  placeholder="e.g. BITS Pilani, Hyderabad Campus"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unique Referral Code
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BITS-AI24"
                  className="w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Letters, numbers, and hyphens only (e.g. RVCE-AI24).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Registrations Quota
                </label>
                <input
                  type="number"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  {formSubmitting ? 'Creating...' : 'Onboard Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

