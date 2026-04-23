'use client';

import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Document } from '@/lib/types';

/* ── Status badge ─────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const isPending = status === 'FOR_PICKUP';
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap border flex-shrink-0',
        isPending
          ? 'bg-amber-100 text-amber-600 border-amber-200'
          : 'bg-emerald-100 text-emerald-600 border-emerald-200',
      ].join(' ')}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPending ? 'bg-amber-400' : 'bg-emerald-400'}`} />
      {isPending ? 'Ready for Pickup' : 'Released'}
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
    <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-xl p-4 shadow-sm flex flex-col h-full min-w-0">
      <div className="w-7 h-7 flex items-center justify-center mb-3 flex-shrink-0">
        {icon}
      </div>
      <p className={['text-3xl sm:text-4xl font-bold tabular-nums leading-none mb-1.5', valueColor].join(' ')}>
        {value}
      </p>
      <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest leading-snug">
        {label}
      </p>
    </div>
  );
}

/* ── Document row ─────────────────────────────────────────────────────── */
function DocRow({ doc }: { doc: Document }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 px-4 py-3 border-b border-gray-100/80 last:border-0 hover:bg-white/40 transition-colors">
      <div className="flex items-center justify-between gap-2 sm:contents">
        <span className="font-mono text-[11px] sm:text-xs font-bold text-gray-600 flex-shrink-0 leading-tight">
          {doc.controlNo}
        </span>
        <span className="sm:hidden">
          <StatusBadge status={doc.status} />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-800 leading-snug line-clamp-2 sm:truncate">
          {doc.subject}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">{doc.date}</p>
      </div>
      <span className="hidden sm:block flex-shrink-0">
        <StatusBadge status={doc.status} />
      </span>
    </div>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white/60 border border-white/80 rounded-xl p-4 animate-pulse h-full">
      <div className="w-8 h-8 rounded-lg bg-gray-200 mb-3" />
      <div className="h-9 w-14 bg-gray-200 rounded mb-1.5" />
      <div className="h-3 w-20 bg-gray-100 rounded" />
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
        /* Outline document icon — matches sidebar style */
        <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Ready for Pickup',
      value: pendingCount,
      valueColor: 'text-amber-500',
      icon: (
        /* Outline clock icon */
        <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Released',
      value: releasedCount,
      valueColor: 'text-emerald-500',
      icon: (
        /* Outline circle-check icon */
        <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'This Month',
      value: thisMonthCount,
      valueColor: 'text-rose-400',
      icon: (
        /* Outline calendar icon */
        <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <AdminLayout userEmail={user.email || 'Admin User'} showSearch={false}>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden">
        <Breadcrumb items={[{ label: 'Home', href: '/admin/dashboard' }]} />

        {/* ── Page Header ── */}
        <div className="mb-6 sm:mb-8 mt-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight mb-1.5 sm:mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            Here's what's happening with your documents today.
          </p>
        </div>

        {/* ── Stats grid ── */}
        <section
          aria-label="Statistics"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          {docsLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((s) => <StatCard key={s.label} {...s} />)}
        </section>

        {/* ── Recent Documents ── */}
        <section aria-label="Recent documents" className="w-full">
          <div className="flex items-center justify-between mb-3 gap-2">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
              Recent Documents
            </p>
            <Link
              href="/admin/documents"
              className="text-xs font-semibold text-gray-600 hover:text-black transition-colors flex-shrink-0 whitespace-nowrap"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100/80 bg-white/30 gap-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
                Latest Activity
              </p>
              {pendingCount > 0 && (
                <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200 flex-shrink-0 whitespace-nowrap">
                  {pendingCount} pending
                </span>
              )}
            </div>

            {recentDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs text-gray-400 font-medium">No documents yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100/80">
                {recentDocuments.map((doc) => <DocRow key={doc.id} doc={doc} />)}
              </div>
            )}
          </div>
        </section>

        <div className="h-8" />
      </div>
    </AdminLayout>
  );
}