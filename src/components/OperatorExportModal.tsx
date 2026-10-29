'use client';

import React, { useState } from 'react';
import { Download, ShieldCheck, Lock, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface OperatorExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OperatorExportModal({ isOpen, onClose }: OperatorExportModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleDownloadDetailed = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Trigger download with key
        window.location.href = `/api/export?key=${encodeURIComponent(passcode.trim())}`;
        setTimeout(() => onClose(), 1000);
      } else {
        setError(data.message || 'Invalid operator access code.');
      }
    } catch (err) {
      setError('Failed to verify operator credentials.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadSummary = () => {
    window.location.href = '/api/export?format=summary';
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Campaign Data Export</h3>
              <p className="text-[11px] text-slate-500">Security & Privacy Guardrails</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
          >
            &times;
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Privacy Protection Notice:</p>
          <p>
            Individual student registration records (names, personal emails, phone numbers) are
            protected from unauthorized public access.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Option 1: Full Operator Export with Passcode */}
        <form onSubmit={handleDownloadDetailed} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operator Access Code (Full PII Export)
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter operator code..."
                className="pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <p className="text-[10px] text-indigo-600 mt-1 font-medium">
              Local evaluation demo code: <code>campus_operator_2025</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={!passcode.trim() || verifying}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{verifying ? 'Verifying...' : 'Export Detailed Records (CSV)'}</span>
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            OR
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Option 2: Anonymized Public Summary */}
        <div>
          <button
            type="button"
            onClick={handleDownloadSummary}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Anonymized Summary (No PII)</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-1">
            Aggregated channel stats, partner numbers, and budget KPIs without student names/emails.
          </p>
        </div>
      </div>
    </div>
  );
}

