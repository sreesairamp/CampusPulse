'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Target,
  Users,
  Calendar,
  AlertCircle,
  Download,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  CheckCircle,
  Activity,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import { DashboardMetrics } from '@/lib/analytics';
import { ActionRecommendation } from '@/lib/recommendations';
import { OperatorExportModal } from '@/components/OperatorExportModal';

export default function GrowthDashboard() {
  const [data, setData] = useState<{
    metrics: DashboardMetrics;
    recommendations: ActionRecommendation[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/metrics');
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.message || 'Failed to load dashboard metrics');
      }
    } catch (e: any) {
      setError('Network error fetching campaign data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent mb-3"></div>
        <p className="text-sm font-semibold text-slate-600">Calculating real-time campaign analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <p className="font-bold">Error loading dashboard</p>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const { metrics, recommendations } = data;
  const topRecommendations = recommendations.slice(0, 3);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <OperatorExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campaign Growth Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Simulated Fictional Data
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time attribution, channel pacing, and student conversion analytics for{' '}
            <span className="font-semibold text-slate-700">
              “Build Your First AI Project in 60 Minutes”
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Action Engine</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unique Registrations vs 500 Target */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Registrations
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.uniqueRegistrations}
            </span>
            <span className="text-xs font-medium text-slate-400">/ {metrics.totalTarget} goal</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
              <span>{metrics.progressPercentage}% completed</span>
              <span className="text-slate-400">{metrics.remainingRegistrations} remaining</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Campaign Timeline & Velocity Required */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Timeline & Pacing
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              Day {metrics.currentCampaignDay}
            </span>
            <span className="text-xs font-medium text-slate-400">of {metrics.totalCampaignDays} days</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Required Velocity:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              {metrics.requiredDailyRunRate} / day
            </span>
          </div>
        </div>

        {/* Card 3: Budget Planned vs Verified Spend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Budget Allocation
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{metrics.budget.totalActual}
            </span>
            <span className="text-xs font-medium text-slate-400">
              spent / ₹{metrics.budget.totalPlanned} cap
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Remaining Reserve:</span>
            <span className="font-bold text-emerald-700">₹{metrics.budget.remaining}</span>
          </div>
        </div>

        {/* Card 4: Quality & Attribution Hygiene */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attribution & Quality
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.duplicateAttemptsCount}
            </span>
            <span className="text-xs font-medium text-slate-400">duplicates blocked</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Unattributed (Direct):</span>
            <span className="font-bold text-slate-700">
              {metrics.unattributedCount} ({metrics.unattributedPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Channels Breakdown & Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Acquisition Channels Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Registrations by Acquisition Channel
              </h2>
              <p className="text-xs text-slate-500">
                Performance against planned channel quotas (Total Target: 500)
              </p>
            </div>
            <Link
              href="/budget"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
            >
              Quota Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 pt-2">
            {metrics.channels.map((channel) => {
              const progressPct =
                channel.target > 0
                  ? Math.min(100, Math.round((channel.actual / channel.target) * 100))
                  : 0;

              return (
                <div key={channel.channelKey} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: channel.color }}
                      ></span>
                      <span>{channel.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{channel.actual}</span>
                      {channel.target > 0 && (
                        <span className="text-slate-400 font-normal"> / {channel.target} ({progressPct}%)</span>
                      )}
                    </div>
                  </div>

                  {channel.target > 0 ? (
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: channel.color,
                        }}
                      ></div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">
                      Direct / organic visits. Kept strictly separate without guessing attribution.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Daily Registration Trend (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  7-Day Campaign Pace Trend
                </h2>
                <p className="text-xs text-slate-500">
                  Cumulative student signups vs linear target path
                </p>
              </div>
            </div>

            {/* Daily Trend Visual Chart */}
            <div className="space-y-3 pt-2">
              {metrics.dailyTrend.map((item) => {
                const isElapsed = item.day <= metrics.currentCampaignDay;
                const percentOfGoal = Math.round((item.cumulative / metrics.totalTarget) * 100);

                return (
                  <div key={item.day} className="text-xs">
                    <div className="flex justify-between items-center text-slate-700 mb-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isElapsed ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        ></span>
                        {item.label}
                      </span>
                      <span className="font-mono">
                        {isElapsed ? (
                          <>
                            <strong className="text-slate-900">{item.cumulative}</strong> students (
                            <span className="text-indigo-600">+{item.count}</span> today)
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Projected ~{item.targetPacing}</span>
                        )}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 relative overflow-hidden">
                      {isElapsed && (
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, percentOfGoal)}%` }}
                        ></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
            <span className="font-bold">Timeline Benchmark:</span> Day {metrics.currentCampaignDay} has{' '}
            <strong>{metrics.uniqueRegistrations}</strong> registered students versus the linear benchmark of{' '}
            <strong>{metrics.dailyTrend[metrics.currentCampaignDay - 1]?.targetPacing || 286}</strong>.
          </div>
        </div>
      </div>

      {/* Campus Partner Leaderboard Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Campus Partner Leaderboard (Top Performers)
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by verified unique registrations generated
            </p>
          </div>
          <Link
            href="/partners"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
          >
            View All Partners ({metrics.partnerLeaderboard.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Campus Partner & College</th>
                <th className="py-2.5 px-3 font-semibold">Referral Code</th>
                <th className="py-2.5 px-3 font-semibold text-right" title="Total referral link clicks">Link Clicks</th>
                <th className="py-2.5 px-3 font-semibold text-right" title="Unique confirmed student registrations">Registrations</th>
                <th className="py-2.5 px-3 font-semibold text-right" title="Click-to-Registration Conversion Rate = (Registrations / Clicks) × 100%">Click-to-Reg Conv. %</th>
                <th className="py-2.5 px-3 font-semibold text-right" title="Share of 300 Campus Partner Quota = (Registrations / 300) × 100%">Share of 300 Goal %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.partnerLeaderboard.slice(0, 5).map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                        partner.rank === 1
                          ? 'bg-amber-100 text-amber-800 font-extrabold'
                          : partner.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : partner.rank === 3
                          ? 'bg-amber-50 text-amber-900'
                          : 'text-slate-500'
                      }`}
                    >
                      #{partner.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{partner.name}</div>
                    <div className="text-[11px] text-slate-500">{partner.college}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {partner.referralCode}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">{partner.clicks}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                    {partner.registrations}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                      {partner.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {partner.shareOfPartnerTarget}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Recommendation Engine Strip */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-indigo-900/60">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold">Deterministic Action Recommendations</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Transparent rules and mathematical gap calculations generated directly from campaign numbers.
            </p>
          </div>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition shrink-0"
          >
            <span>View All Insights ({recommendations.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      rec.priority === 'CRITICAL'
                        ? 'bg-rose-500/80 text-white'
                        : rec.priority === 'HIGH'
                        ? 'bg-amber-500/80 text-slate-900'
                        : 'bg-indigo-400/30 text-indigo-200'
                    }`}
                  >
                    {rec.category} • {rec.priority}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white mb-1.5">{rec.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {rec.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-amber-300 font-mono">
                {rec.metrics[0]?.label}: <strong>{rec.metrics[0]?.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

