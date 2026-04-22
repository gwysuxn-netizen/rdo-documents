'use client';

import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Document } from '@/lib/types';

/* ─────────────────────────────────────────────────────────────────────────
   GLOBALS.CSS  — add this to your global stylesheet so the soft lavender
   gradient background renders behind all glass surfaces:

   body {
     background: linear-gradient(135deg, #dde8fb 0%, #e9e4f8 40%, #d8eaf9 100%);
     min-height: 100vh;
   }
───────────────────────────────────────────────────────────────────────── */

/* ── Status badge ─────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const isPending = status === 'FOR_PICKUP';
  return (
    <span
      className={[
        'inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold whitespace-nowrap border flex-shrink-0',
        isPending
          ? 'bg-amber-100 text-amber-600 border-amber-200'
          : 'bg-emerald-100 text-emerald-600 border-emerald-200',
      ].join(' ')}
    >
      • {isPending ? 'For Pickup' : 'Released'}
    </span>
  );
}

/* ── Stat card ────────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  valueColor: string;
}

function StatCard({ label, value, icon, valueColor }: StatCardProps) {
  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm flex flex-col h-full">
      <div className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center mb-2 opacity-70 flex-shrink-0">
        {icon}
      </div>
      <p className={['text-2xl sm:text-3xl lg:text-4xl font-bold tabular-nums leading-none mb-1', valueColor].join(' ')}>
        {value}
      </p>
      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-snug">
        {label}
      </p>
    </div>
  );
}

/* ── Document row ─────────────────────────────────────────────────────── */
function DocRow({ doc }: { doc: Document }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100/80 last:border-0 hover:bg-white/40 transition-colors">
      <span className="flex-shrink-0 font-mono text-[11px] sm:text-[13px] lg:text-[14px] font-bold text-gray-700 w-32 sm:w-40 lg:w-48 leading-tight whitespace-nowrap overflow-x-auto scrollbar-hide">
        {doc.controlNo}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] sm:text-[13px] font-medium text-gray-800 leading-snug truncate">{doc.subject}</p>
        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{doc.date}</p>
      </div>
      <StatusBadge status={doc.status} />
    </div>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white/60 border border-white/80 rounded-lg sm:rounded-xl p-3 sm:p-4 animate-pulse h-full">
      <div className="w-6 sm:w-8 h-6 sm:h-8 rounded bg-gray-200 mb-2" />
      <div className="h-7 sm:h-9 w-12 sm:w-14 bg-gray-200 rounded mb-1" />
      <div className="h-2.5 sm:h-3 w-16 sm:w-20 bg-gray-100 rounded" />
    </div>
  );
}

/* ── Main dashboard ───────────────────────────────────────────────────── */
export function AdminDashboardContent() {
  const { user, loading: authLoading } = useAdminAuth();
  const { documents, loading: docsLoading } = useDocuments();
  const router = useRouter();

  const recentDocuments = documents.slice(0, 5);
  const pendingCount    = documents.filter((d) => d.status === 'FOR_PICKUP').length;
  const releasedCount   = documents.filter((d) => d.status !== 'FOR_PICKUP').length;
  const thisMonthCount  = documents.filter((d) => {
    const now = new Date();
    const docDate = new Date(d.date);
    return (
      docDate.getMonth() === now.getMonth() &&
      docDate.getFullYear() === now.getFullYear()
    );
  }).length;

  if (authLoading || docsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
        <p className="text-xs font-medium text-gray-400 tracking-wider">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  const stats: StatCardProps[] = [
    {
      label: 'Total Documents',
      value: documents.length,
      valueColor: 'text-gray-700',
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'For Pickup',
      value: pendingCount,
      valueColor: 'text-amber-500',
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Released',
      value: releasedCount,
      valueColor: 'text-emerald-500',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      label: 'This Month',
      value: thisMonthCount,
      valueColor: 'text-rose-400',
      icon: (
        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <AdminLayout userEmail={user.email || 'Admin User'} showSearch={false}>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Home', href: '/admin/dashboard' }]} />

        {/* ── Page Header ── */}
        <div className="mb-8 mt-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-gray-700 bg-gray-200 ring-1 ring-gray-300/50 px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" />
            Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600">
            Here's what's happening with your documents today.
          </p>
        </div>

        {/* ── Stats ── */}
        <section aria-label="Statistics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3 mb-6 sm:mb-8 auto-rows-max">
          {docsLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((s) => <StatCard key={s.label} {...s} />)}
        </section>

        {/* ── Recent Documents ── */}
        <section aria-label="Recent documents" className="min-w-0">
          <div className="flex items-center justify-between mb-2 px-0.5 gap-2">
            <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-400 truncate">
              Recent Documents
            </p>
            <Link
              href="/admin/documents"
              className="text-[10px] sm:text-[11px] lg:text-xs font-semibold text-gray-700 hover:text-black transition-colors flex-shrink-0 whitespace-nowrap"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-lg sm:rounded-xl overflow-hidden shadow-sm min-w-0">
            {/* card header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 border-b border-gray-100/80 bg-white/30 gap-2">
              <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-400 truncate">
                Latest Activity
              </p>
              {pendingCount > 0 && (
                <span className="text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200 flex-shrink-0 whitespace-nowrap">
                  {pendingCount} pending
                </span>
              )}
            </div>

            {recentDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 gap-3">
                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-[11px] sm:text-xs text-gray-400 font-medium">No documents yet</p>
              </div>
            ) : (
              <div className="min-w-0 max-h-64 sm:max-h-72 lg:max-h-80 overflow-y-auto">
                {recentDocuments.map((doc) => <DocRow key={doc.id} doc={doc} />)}
              </div>
            )}
          </div>
        </section>

        {/* bottom breathing room */}
        <div className="h-8 sm:h-4" />
      </div>
    </AdminLayout>
  );
}