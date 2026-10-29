'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
  BarChart,
  Target,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { ActionRecommendation } from '@/lib/recommendations';
import { DashboardMetrics } from '@/lib/analytics';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<ActionRecommendation[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/metrics');
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations);
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const toggleTask = (taskId: string) => {
    setCheckedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const categories = [
    { key: 'ALL', label: 'All Actions' },
    { key: 'PACING', label: 'Run-Rate & Pacing' },
    { key: 'CHANNEL', label: 'Channel Gap' },
    { key: 'PARTNER', label: 'Campus Partners' },
    { key: 'OPERATIONS', label: 'Operations & Review' },
    { key: 'BUDGET', label: 'Budget Controls' },
  ];

  const filteredRecs = recommendations.filter((r) =>
    activeCategory === 'ALL' ? true : r.category === activeCategory
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Action Recommendation Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Deterministic Rules
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Algorithmic recommendations grounded in current campaign velocity, channel gaps, and timeline pacing.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Logic Transparency Disclosure Box */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-start gap-3 shadow-sm">
        <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white text-sm">
            Deterministic Engine — No Fake Chatbots or Black-Box Models
          </p>
          <p className="text-slate-300 leading-relaxed">
            Every recommendation is generated through explicit mathematical criteria evaluated against live
            database counts: linear trajectory pacing, channel deficit ratios, partner click conversion rates,
            and remaining campaign days. All supporting equations and raw data points are displayed transparently below.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Recommendations Cards List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          Evaluating campaign rules and pacing math...
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500">
          No recommendations found for this category.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRecs.map((rec) => {
            const isCritical = rec.priority === 'CRITICAL';
            const isHigh = rec.priority === 'HIGH';

            return (
              <div
                key={rec.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm transition ${
                  isCritical
                    ? 'border-rose-300/80 bg-rose-50/20'
                    : isHigh
                    ? 'border-amber-300/80'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isHigh
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {rec.category} • {rec.priority} PRIORITY
                    </span>
                  </div>

                  {/* Supporting metric tags */}
                  <div className="flex flex-wrap gap-2">
                    {rec.metrics.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono"
                      >
                        {m.label}: <strong>{m.value}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title & Summary */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{rec.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">{rec.summary}</p>

                {/* Mathematical Explanation Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Data & Mathematical Rationale</span>
                  </div>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">
                    {rec.dataExplanation}
                  </p>
                </div>

                {/* Action Steps Checklist */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Operational Action Steps
                  </h4>
                  <div className="space-y-2">
                    {rec.actionSteps.map((step, sIdx) => {
                      const taskId = `${rec.id}-${sIdx}`;
                      const isDone = !!checkedTasks[taskId];

                      return (
                        <div
                          key={sIdx}
                          onClick={() => toggleTask(taskId)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none text-xs transition ${
                            isDone
                              ? 'bg-emerald-50/60 border-emerald-200 text-slate-400 line-through'
                              : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

