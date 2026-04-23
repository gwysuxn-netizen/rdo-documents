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
    const receivers = new Set(filtered.map(d => d.receivedBy).filter(Boolean));
    const withTime = filtered.filter(d => d.receivedAt && d.uploadedAt);
    const avgHours = withTime.length
      ? withTime.reduce((sum, d) => sum + (d.receivedAt! - d.uploadedAt!) / (1000 * 60 * 60), 0) /
        withTime.length
      : 0;
    const latest = filtered.reduce<number | null>((max, d) => {
      if (!d.receivedAt) return max;
      return max === null || d.receivedAt > max ? d.receivedAt : max;
    }, null);

    return { total, receivers: receivers.size, avgHours: avgHours.toFixed(1), latest };
  }, [filtered]);

  /* Handle Print */
  const handlePrint = () => {
    const win = window.open('', '', 'height=1123,width=794');
    if (!win) return;

    const rows = filtered
      .slice()
      .sort((a, b) => (b.receivedAt ?? 0) - (a.receivedAt ?? 0))
      .map(
        (d, i) => `
        <tr>
          <td class="center">${i + 1}</td>
          <td>${d.controlNo}</td>
          <td class="center">${formatDate(d.date)}</td>
          <td class="subject-cell">${d.subject}</td>
          <td class="center">${d.destination}</td>
          <td class="center">${d.receivedAt ? formatReceivedAt(d.receivedAt) : ''}</td>
          <td class="center">${d.receivedBy ?? ''}</td>
        </tr>`
      )
      .join('');

    win.document.write(`
      <!DOCTYPE html><html>
      <head>
        <title>Received Documents Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4 portrait; margin: 0; }
          body { font-family: Arial, sans-serif; color: #111; font-size: 10px; width: 100%; padding: 10mm 8mm; }
          .header { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 6px; }
          .header-logo { width: 58px; height: 58px; object-fit: contain; flex-shrink: 0; }
          .header-text { text-align: center; line-height: 1.6; }
          .header-text .line   { font-size: 9.5px; }
          .header-text .agency { font-size: 15px; font-weight: bold; }
          .header-text .sub    { font-size: 10.5px; }
          .divider { border: none; border-top: 1.5px solid #111; margin: 6px 0 5px; }
          .report-title { text-align: center; font-size: 13.5px; font-weight: bold; margin-bottom: 2px; }
          .report-meta { text-align: center; font-size: 9.5px; color: #444; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 9.5px; table-layout: fixed; }
          th, td { padding: 5px 5px; border: 0.75px solid #999; vertical-align: top; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; line-height: 1.45; }
          th { font-weight: bold; font-size: 9px; text-align: center; text-transform: uppercase; background: #fff; line-height: 1.35; white-space: normal; }
          td.center { text-align: center; }
          col.col-no          { width: 3%; }
          col.col-controlno   { width: 18%; }
          col.col-date        { width: 9%; }
          col.col-subject     { width: 31%; }
          col.col-destination { width: 9%; }
          col.col-receivedat  { width: 16%; }
          col.col-receivedby  { width: 14%; }
          .subject-cell { white-space: normal; word-wrap: break-word; word-break: break-word; line-height: 1.45; text-align: left; }
          tr:nth-child(even) td { background: #f7f7f7; }
          tr:nth-child(odd)  td { background: #fff; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img class="header-logo" src="/doh-logo.png" onerror="this.style.display='none'" />
          <div class="header-text">
            <p class="line">Republic of the Philippines</p>
            <p class="agency">DEPARTMENT OF HEALTH</p>
            <p class="sub">Western Visayas</p>
            <p class="sub">Center for Health Development</p>
          </div>
          <img class="header-logo" src="/bagong-pilipinas-logo.png" onerror="this.style.display='none'" />
        </div>
        <hr class="divider" />
        <div class="report-title">Received Documents Report</div>
        <div class="report-meta">
          Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          &nbsp;&nbsp;|&nbsp;&nbsp;
          Total Documents: ${filtered.length}
        </div>
        <table>
          <colgroup>
            <col class="col-no" /><col class="col-controlno" /><col class="col-date" />
            <col class="col-subject" /><col class="col-destination" />
            <col class="col-receivedat" /><col class="col-receivedby" />
          </colgroup>
          <thead>
            <tr>
              <th>#</th><th>Control No.</th><th>Date Created</th><th>Subject</th>
              <th>Assigned Office</th><th>Date Received</th><th>Received By</th>
            </tr>
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

  const sortedFiltered = filtered
    .slice()
    .sort((a, b) => (b.receivedAt ?? 0) - (a.receivedAt ?? 0));

  return (
    <AdminLayout>
      <Breadcrumb items={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Reports', href: '/admin/reports' }]} />

      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Reports</h1>
          <p className="text-sm font-light text-gray-500 mt-1">Summary of received documents</p>
        </div>

        {filtered.length > 0 && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-sm font-light transition-all w-full sm:w-auto flex-shrink-0"
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
        <StatCard label="Total Received"   value={stats.total}     color="text-gray-900" />
        <StatCard label="Unique Receivers" value={stats.receivers} color="text-gray-900" />
        <StatCard label="Avg Pickup (hrs)" value={stats.avgHours}  color="text-gray-900" />
        <StatCard
          label="Latest Received"
          value={stats.latest ? new Date(stats.latest).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
          color="text-gray-900"
        />
      </div>

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200 px-4 py-4 mb-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
        {/* Search — full width on mobile, flexible on larger */}
        <div className="w-full sm:flex-1 sm:min-w-48">
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

        {/* Date range — side by side on mobile too */}
        <div className="flex gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-light text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="flex-1 sm:flex-none">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-light text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}
            className="w-full sm:w-auto px-3 py-2 text-xs font-light text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table / Cards */}
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-white/30 flex items-center justify-between">
          <h2 className="text-sm font-light text-gray-900">Received Documents</h2>
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
          <>
            {/* ── Desktop table (hidden on mobile) ── */}
            <div className="hidden md:block overflow-x-auto">
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
                  {sortedFiltered.map((doc, i) => (
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

            {/* ── Mobile cards (shown below md breakpoint) ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {sortedFiltered.map((doc, i) => (
                <div key={doc.id} className="px-4 py-4 space-y-2 hover:bg-white/60 transition-all">
                  {/* Row 1: index + control no + date */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] text-gray-400 font-light flex-shrink-0">{i + 1}.</span>
                      <span className="font-mono text-sm text-gray-900 font-light truncate">{doc.controlNo}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-light whitespace-nowrap flex-shrink-0">{formatDate(doc.date)}</span>
                  </div>

                  {/* Row 2: subject */}
                  <p className="text-sm text-gray-700 font-light leading-snug">
                    {doc.subject.length > 80 ? doc.subject.slice(0, 80) + '…' : doc.subject}
                  </p>

                  {/* Row 3: meta pills */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-light">
                      <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2C5.79 2 4 3.79 4 6c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4zm0 5.5A1.5 1.5 0 118 5a1.5 1.5 0 010 3z" />
                      </svg>
                      {doc.destination}
                    </span>

                    {doc.receivedBy && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-light">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        {doc.receivedBy}
                      </span>
                    )}
                  </div>

                  {/* Row 4: received at */}
                  {doc.receivedAt && (
                    <p className="text-xs text-gray-400 font-light">
                      Received: {formatReceivedAt(doc.receivedAt)}
                    </p>
                  )}

                  {/* Row 5: notes (if any) */}
                  {doc.notes && (
                    <p className="text-xs text-gray-400 font-light italic">
                      {doc.notes.length > 60 ? doc.notes.slice(0, 60) + '…' : doc.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
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