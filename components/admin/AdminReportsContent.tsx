'use client';

import { useState, useMemo } from 'react';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useRouter } from 'next/navigation';
import { Document } from '@/lib/types';

/* ── helpers ─────────────────────────────────────────────────────────── */
function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatReceivedAt(ts?: number | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
}

/* ── main component ──────────────────────────────────────────────────── */
export function AdminReportsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAdminAuth();
  const { documents, loading: docsLoading } = useDocuments();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [search, setSearch]     = useState('');

  /* Only received documents */
  const receivedDocuments = useMemo(
    () => documents.filter(d => d.status === 'RECEIVED'),
    [documents]
  );

  /* Apply date + search filters */
  const filtered = useMemo(() => {
    let result = receivedDocuments;

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter(d => d.receivedAt && new Date(d.receivedAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(d => d.receivedAt && new Date(d.receivedAt) <= to);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        d =>
          d.controlNo.toLowerCase().includes(q) ||
          d.subject.toLowerCase().includes(q) ||
          (d.receivedBy ?? '').toLowerCase().includes(q) ||
          d.destination.toLowerCase().includes(q)
      );
    }

    return result;
  }, [receivedDocuments, dateFrom, dateTo, search]);

  /* Summary stats */
  const stats = useMemo(() => {
    const total = filtered.length;

    /* Unique receivers */
    const receivers = new Set(filtered.map(d => d.receivedBy).filter(Boolean));

    /* Avg pickup time in hours */
    const withTime = filtered.filter(d => d.receivedAt && d.uploadedAt);
    const avgHours = withTime.length
      ? withTime.reduce((sum, d) => sum + (d.receivedAt! - d.uploadedAt!) / (1000 * 60 * 60), 0) /
        withTime.length
      : 0;

    /* Most recent received date */
    const latest = filtered.reduce<number | null>((max, d) => {
      if (!d.receivedAt) return max;
      return max === null || d.receivedAt > max ? d.receivedAt : max;
    }, null);

    return { total, receivers: receivers.size, avgHours: avgHours.toFixed(1), latest };
  }, [filtered]);

  /* Print handler */
  const handlePrint = () => {
    const win = window.open('', '', 'height=700,width=1000');
    if (!win) return;

    const rows = filtered
      .slice()
      .sort((a, b) => (b.receivedAt ?? 0) - (a.receivedAt ?? 0))
      .map(
        (d, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${d.controlNo}</td>
          <td>${d.date}</td>
          <td>${d.subject}</td>
          <td>${d.destination}</td>
          <td>${d.receivedBy ?? '—'}</td>
          <td>${formatReceivedAt(d.receivedAt)}</td>
          <td>${d.notes ?? '—'}</td>
        </tr>`
      )
      .join('');

    win.document.write(`
      <!DOCTYPE html><html>
      <head>
        <title>Received Documents Report</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#111; padding:40px; }
          h1 { font-size:22px; font-weight:700; margin-bottom:4px; }
          .meta { color:#6b7280; font-size:13px; margin-bottom:24px; }
          .stats { display:flex; gap:24px; margin-bottom:32px; }
          .stat { background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:14px 20px; min-width:120px; }
          .stat-label { font-size:11px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
          .stat-value { font-size:24px; font-weight:700; color:#111; }
          table { width:100%; border-collapse:collapse; font-size:13px; }
          thead { background:#f3f4f6; }
          th,td { padding:10px 12px; text-align:left; border-bottom:1px solid #e5e7eb; }
          th { font-weight:600; color:#374151; }
          tr:nth-child(even) { background:#fafafa; }
          @media print { body { padding:20px; } }
        </style>
      </head>
      <body>
        <h1>Received Documents Report</h1>
        <p class="meta">Printed: ${new Date().toLocaleString()} &nbsp;·&nbsp; ${filtered.length} record${filtered.length !== 1 ? 's' : ''}</p>
        <div class="stats">
          <div class="stat"><div class="stat-label">Total Received</div><div class="stat-value">${stats.total}</div></div>
          <div class="stat"><div class="stat-label">Unique Receivers</div><div class="stat-value">${stats.receivers}</div></div>
          <div class="stat"><div class="stat-label">Avg Pickup (hrs)</div><div class="stat-value">${stats.avgHours}</div></div>
        </div>
        <table>
          <thead>
            <tr><th>#</th><th>Control No</th><th>Date</th><th>Subject</th><th>Destination</th><th>Received By</th><th>Received At</th><th>Notes</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 250);
  };

  /* ── guards ── */
  if (authLoading || docsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const hasFilters = dateFrom || dateTo || search.trim();

  return (
    <AdminLayout>
      <Breadcrumb items={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Reports', href: '/admin/reports' }]} />

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Reports</h1>
          <p className="text-sm font-light text-gray-500 mt-1">Summary of received documents</p>
        </div>

        {filtered.length > 0 && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-sm font-light transition-all flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Received"    value={stats.total}      color="text-gray-900" />
        <StatCard label="Unique Receivers"  value={stats.receivers}  color="text-gray-900" />
        <StatCard label="Avg Pickup (hrs)"  value={stats.avgHours}   color="text-gray-900" />
        <StatCard
          label="Latest Received"
          value={stats.latest ? new Date(stats.latest).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          color="text-gray-900"
        />
      </div>

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200 px-4 py-4 mb-4 flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Search</label>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4.5" /><path strokeLinecap="round" d="M10.5 10.5l3 3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Control no., subject, receiver…"
              className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-light text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        {/* Date from */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-light text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-colors"
          />
        </div>

        {/* Date to */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-light text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-colors"
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}
            className="px-3 py-2 text-xs font-light text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-white/30 flex items-center justify-between">
          <h2 className="text-sm font-light text-gray-900">
            Received Documents
          </h2>
          <span className="text-xs text-gray-400 font-light">
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
            {hasFilters && receivedDocuments.length !== filtered.length && ` of ${receivedDocuments.length}`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400 font-light">
              {hasFilters ? 'No records match your filters.' : 'No received documents yet.'}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}
                className="mt-3 text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/30 border-b border-gray-200">
                <tr>
                  {['No', 'Control No', 'Date', 'Subject', 'Destination', 'Received By', 'Received At', 'Notes'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-light text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered
                  .slice()
                  .sort((a, b) => (b.receivedAt ?? 0) - (a.receivedAt ?? 0))
                  .map((doc, i) => (
                    <tr key={doc.id} className="hover:bg-white/50 transition-all">
                      <td className="px-5 py-3.5 text-sm text-gray-400 font-light">{i + 1}</td>
                      <td className="px-5 py-3.5 font-mono text-sm text-gray-900 font-light whitespace-nowrap">{doc.controlNo}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 font-light whitespace-nowrap">{formatDate(doc.date)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 font-light max-w-xs">
                        <span title={doc.subject}>
                          {doc.subject.length > 55 ? doc.subject.slice(0, 55) + '…' : doc.subject}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 font-light whitespace-nowrap">{doc.destination}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 font-light whitespace-nowrap">
                        {doc.receivedBy ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                            {doc.receivedBy}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 font-light whitespace-nowrap">{formatReceivedAt(doc.receivedAt)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-400 font-light max-w-xs">
                        {doc.notes ? (
                          <span title={doc.notes}>
                            {doc.notes.length > 40 ? doc.notes.slice(0, 40) + '…' : doc.notes}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

/* ── Stat Card ───────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums leading-none ${color}`}>{value}</p>
    </div>
  );
}