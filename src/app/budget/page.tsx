'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  PieChart,
  ShieldCheck,
  PlusCircle,
  AlertTriangle,
  Receipt,
  Layers,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { DashboardMetrics } from '@/lib/analytics';
import { BUDGET_ALLOCATIONS, CAMPAIGN_TARGETS } from '@/lib/constants';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  isDemo: boolean;
}

export default function CampaignPlanningBudgetPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New expense form
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('CREATIVE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMetrics, resExpenses] = await Promise.all([
        fetch('/api/metrics').then((r) => r.json()),
        fetch('/api/expenses').then((r) => r.json()),
      ]);

      if (resMetrics.success) setMetrics(resMetrics.metrics);
      if (resExpenses.success) setExpenses(resExpenses.expenses);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description,
          amount: parseFloat(amount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setDescription('');
        setAmount('');
        fetchData();
      } else {
        setError(data.message || 'Failed to log expense');
      }
    } catch (err: any) {
      setError('Network error logging expense.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading campaign planning and budget data...
      </div>
    );
  }

  const plannedTotal = BUDGET_ALLOCATIONS.TOTAL; // 2000
  const actualTotal = metrics?.budget.totalActual || 0;
  const remainingTotal = Math.max(0, plannedTotal - actualTotal);
  const costPerAcquisition =
    metrics && metrics.uniqueRegistrations > 0
      ? (actualTotal / metrics.uniqueRegistrations).toFixed(2)
      : '0.00';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campaign Planning & Financial Controls
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ₹2,000 Budget Cap
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Planned allocation versus verified expenditure for attracting 500 final-year engineers.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Verified Expense</span>
        </button>
      </div>

      {/* Critical Transparency Alert Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold text-amber-950">Planned Allocation vs Actual Spend Distinction:</strong>
          <p className="mt-0.5">
            The ₹2,000 budget is a planned allocation ceiling. Funds are not spent automatically.
            Actual expenditure requires recorded receipts and operator verification. If organic
            campus partners achieve the 500 registration target without paid promotion, the ₹1,200
            targeted promotion budget remains unspent.
          </p>
        </div>
      </div>

      {/* Budget Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Planned Budget
          </span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">₹{plannedTotal}</div>
          <p className="mt-1 text-xs text-slate-400">Total approved allocation cap</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified Actual Spend
          </span>
          <div className="mt-2 text-3xl font-extrabold text-indigo-600">₹{actualTotal}</div>
          <p className="mt-1 text-xs text-slate-400">
            {((actualTotal / plannedTotal) * 100).toFixed(1)}% of planned budget utilized
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Remaining Budget Reserve
          </span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600">₹{remainingTotal}</div>
          <p className="mt-1 text-xs text-slate-400">Unspent funds preserved</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Actual Cost / Registration (CPA)
          </span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">₹{costPerAcquisition}</div>
          <p className="mt-1 text-xs text-slate-400">Planned cap: ₹4.00 per student (₹2,000 / 500)</p>
        </div>
      </div>

      {/* Two Column Section: Budget Allocation Breakdown and Acquisition Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Itemized Budget Allocation vs Spend (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Budget Categories Breakdown</h2>
          </div>

          <div className="space-y-4">
            {metrics?.budget.categories.map((cat, idx) => {
              const utilPercent =
                cat.planned > 0 ? Math.min(100, Math.round((cat.actual / cat.planned) * 100)) : 0;

              return (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between items-start text-xs mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                      <span className="text-slate-500">
                        Planned Cap: <strong>₹{cat.planned}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-700 font-mono">
                        ₹{cat.actual} spent
                      </span>
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        ₹{cat.remaining} remaining
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${utilPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 italic">
            * ₹1,200 Targeted Promotion budget is reserved as a contingency lever if organic channels
            fall behind pacing by Day 5.
          </div>
        </div>

        {/* Right: Campaign Planning Targets (500 Goal) (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Campaign Planning Targets (500 Total)</h2>
          </div>

          <div className="space-y-3">
            {metrics?.channels.map((ch) => {
              const shareOf500 =
                ch.target > 0 ? ((ch.target / CAMPAIGN_TARGETS.TOTAL) * 100).toFixed(0) : '0';
              const gap = ch.target > 0 ? ch.target - ch.actual : 0;

              return (
                <div key={ch.channelKey} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: ch.color }}
                      ></span>
                      <span>{ch.label}</span>
                      {ch.target > 0 && (
                        <span className="text-[10px] text-slate-400">({shareOf500}% of total goal)</span>
                      )}
                    </div>
                    <div className="text-right font-mono">
                      <strong className="text-slate-900">{ch.actual}</strong>
                      {ch.target > 0 && (
                        <span className="text-slate-400"> / {ch.target}</span>
                      )}
                    </div>
                  </div>

                  {ch.target > 0 ? (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Status: {ch.actual >= ch.target ? 'Target Achieved' : `${gap} registrations to go`}</span>
                      <span className="font-bold text-slate-700">{ch.percentage}% target achievement</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">
                      Direct visits: Unattributed traffic tracked separately.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verified Expenses Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="font-bold text-base text-slate-900">Verified Campaign Expense Ledger</h3>
              <p className="text-xs text-slate-500">Itemized log of actual funds disbursed</p>
            </div>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-600 bg-slate-50 rounded-xl border border-slate-200">
            <Receipt className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No expenses recorded yet.</p>
            <p className="text-slate-500 mt-0.5">
              Verified actual campaign expenditure is <strong>₹0.00</strong>. The full <strong>₹2,000</strong> allocated budget remains intact in reserve.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold">Record Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-slate-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-sans font-semibold text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.isDemo
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.isDemo ? 'Demo Simulated' : 'Verified Actual'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹{item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Record Verified Expense</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Budget Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CREATIVE">Creative Assets (Cap: ₹300)</option>
                  <option value="TARGETED_PROMOTION">Optional Targeted Promotion (Cap: ₹1,200)</option>
                  <option value="CONTINGENCY">Contingency Reserve (Cap: ₹500)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Receipt Purpose
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Canva subscription for workshop banners"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount in INR (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  {submitting ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

