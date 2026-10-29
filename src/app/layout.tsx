import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { DemoSimulationBanner } from '@/components/DemoSimulationBanner';

export const metadata: Metadata = {
  title: 'CampusPulse | Growth Campaign Management Platform',
  description:
    'Simulate and manage growth campaigns to attract final-year engineering students to hands-on AI workshops.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <header className="sticky top-0 z-40 w-full">
          <DemoSimulationBanner />
          <Navbar />
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>
              <strong>CampusPulse</strong> — Growth Campaign Management System (NxtWave Hiring Assignment Prototype)
            </p>
            <p className="text-slate-400">
              Deterministic Analytics Engine • SQLite + Prisma • Next.js App Router
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

