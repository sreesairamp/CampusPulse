'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Database, CheckCircle2 } from 'lucide-react';

interface DemoStatus {
  isDemoActive: boolean;
  demoRegistrations: number;
  realRegistrations: number;
}

export function DemoSimulationBanner() {
  const [status, setStatus] = useState<DemoStatus>({
    isDemoActive: true,
    demoRegistrations: 263,
    realRegistrations: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/demo');
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleReset = async () => {
    if (confirmInput.trim().toUpperCase() !== 'RESET') return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', confirm: true, confirmationKeyword: 'RESET' }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Demo simulation data cleared. Refreshing in 1s...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setFeedback(data.message || 'Error resetting demo data.');
      }
    } catch (err: any) {
      setFeedback('Failed to execute reset.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReseed = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed', confirm: true }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Simulated demo dataset restored (262 registrations). Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setFeedback(data.message || 'Error reseeding demo data.');
      }
    } catch (err: any) {
      setFeedback('Failed to reseed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!status) return null;

  return (
    <>
      {status.isDemoActive ? (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 px-4 py-2.5 text-xs sm:text-sm font-medium">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[11px] font-bold tracking-wide uppercase">
                <AlertTriangle className="w-3.5 h-3.5" />
                DEMO SIMULATION — Fictional Data
              </span>
              <span className="hidden md:inline text-amber-800">
                Displaying simulated Day 4 growth dataset ({status.demoRegistrations} demo records). Real registrations ({status.realRegistrations}) are preserved separately.
              </span>
            </div>
            <button
              onClick={() => {
                setConfirmInput('');
                setFeedback(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-semibold transition"
            >
              <Database className="w-3.5 h-3.5" />
              Manage Demo Data
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 border-b border-slate-200 text-slate-700 px-4 py-2 text-xs font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Live Mode Active — {status.realRegistrations} organic registrations recorded.
            </span>
            <button
              onClick={() => {
                setFeedback(null);
                setModalOpen(true);
              }}
              className="text-indigo-600 hover:text-indigo-800 underline font-semibold"
            >
              Load Demo Dataset
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Simulation Data Manager</h3>
                  <p className="text-xs text-slate-500">
                    Isolate demo records from real registrations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="my-5 space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>
                  <strong>Simulated Demo Records:</strong> {status.demoRegistrations}
                </p>
                <p>
                  <strong>Real Live Registrations:</strong> {status.realRegistrations}
                </p>
                <p className="text-slate-500 pt-1 border-t border-slate-200 mt-1">
                  Resetting removes only demo records flagged with <code>isDemo: true</code>. Real registrations will never be erased.
                </p>
              </div>

              {feedback && (
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium">
                  {feedback}
                </div>
              )}

              {status.isDemoActive ? (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    To reset simulation data, type <span className="text-rose-600 font-bold">RESET</span> below:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="Type RESET"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleReset}
                      disabled={confirmInput.trim().toUpperCase() !== 'RESET' || actionLoading}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {actionLoading ? 'Resetting...' : 'Confirm Reset'}
                    </button>
                    <button
                      onClick={handleReseed}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-300 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-seed
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-600">
                    Demo data is currently cleared. You can re-populate the realistic 7-day simulated dataset anytime for demonstration and testing.
                  </p>
                  <button
                    onClick={handleReseed}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {actionLoading ? 'Loading Simulation...' : 'Seed Realistic Demo Data (262 Records)'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

