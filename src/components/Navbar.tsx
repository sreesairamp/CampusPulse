'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  BarChart3,
  Users2,
  DollarSign,
  Lightbulb,
  Download,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { OperatorExportModal } from './OperatorExportModal';

const NAV_ITEMS = [
  { label: 'Public Landing', href: '/', icon: Sparkles },
  { label: 'Growth Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Campus Partners', href: '/partners', icon: Users2 },
  { label: 'Planning & Budget', href: '/budget', icon: DollarSign },
  { label: 'Recommendations', href: '/recommendations', icon: Lightbulb },
];

export function Navbar() {
  const pathname = usePathname();
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <>
      <OperatorExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 transition group-hover:scale-105">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  Campus<span className="text-indigo-600">Pulse</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Growth Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setExportModalOpen(true)}
              title="Download registration records as CSV (Operator Guardrail)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>

            {pathname !== '/' ? (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
              >
                <span>Live Landing</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm"
              >
                <span>Open Dashboard</span>
                <BarChart3 className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation strip */}
        <div className="lg:hidden flex items-center justify-start overflow-x-auto py-2.5 border-t border-slate-100 gap-1.5 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      </div>
    </>
  );
}

