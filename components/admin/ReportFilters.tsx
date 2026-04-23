'use client';

import { useState, useMemo } from 'react';

export interface ReportFiltersState {
  dateFrom: string;
  dateTo: string;
  status: 'ALL' | 'FOR_PICKUP' | 'RECEIVED';
  category: string;
}

interface ReportFiltersProps {
  onFilterChange: (filters: ReportFiltersState) => void;
}

/* ── helpers ─────────────────────────────────────────────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 5 + i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

type DatePart = { day: string; month: string; year: string };

function partsToIso({ day, month, year }: DatePart): string {
  if (!year) return '';
  const m = month ? String(MONTHS.indexOf(month) + 1).padStart(2, '0') : '01';
  const d = day ? String(day).padStart(2, '0') : '01';
  return `${year}-${m}-${d}`;
}

function isoToParts(iso: string): DatePart {
  if (!iso) return { day: '', month: '', year: '' };
  const [y, m, d] = iso.split('-');
  return { year: y, month: MONTHS[parseInt(m, 10) - 1] ?? '', day: String(parseInt(d, 10)) };
}

const STATUS_OPTIONS = [
  { value: 'ALL' as const, label: 'All documents', dot: null },
  { value: 'FOR_PICKUP' as const, label: 'Ready for Pickup', dot: '#F59E0B' },
  { value: 'RECEIVED' as const, label: 'Received', dot: '#10B981' },
];

const STATUS_ACTIVE: Record<ReportFiltersState['status'], string> = {
  ALL: 'bg-gray-900 border-gray-900 text-white',
  FOR_PICKUP: 'bg-amber-400 border-amber-400 text-amber-950',
  RECEIVED: 'bg-emerald-500 border-emerald-500 text-emerald-950',
};

/* ── icon atoms ──────────────────────────────────────────────────────── */
function XIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" d="M1 1l6 6M7 1L1 7" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" d="M2 4h12M4 8h8M6 12h4" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
    </svg>
  );
}

/* ── segmented date picker ───────────────────────────────────────────── */
function DateSegments({
  label,
  parts,
  onChange,
}: {
  label: string;
  parts: DatePart;
  onChange: (p: DatePart) => void;
}) {
  const selCls =
    'flex-1 min-w-0 appearance-none bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors cursor-pointer';

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <div className="flex gap-1.5">
        {/* Day */}
        <select
          value={parts.day}
          onChange={e => onChange({ ...parts, day: e.target.value })}
          className={selCls}
          aria-label={`${label} day`}
        >
          <option value="">Day</option>
          {DAYS.map(d => (
            <option key={d} value={String(d)}>{d}</option>
          ))}
        </select>

        {/* Month */}
        <select
          value={parts.month}
          onChange={e => onChange({ ...parts, month: e.target.value })}
          className={selCls}
          aria-label={`${label} month`}
        >
          <option value="">Month</option>
          {MONTHS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Year */}
        <select
          value={parts.year}
          onChange={e => onChange({ ...parts, year: e.target.value })}
          className={selCls}
          aria-label={`${label} year`}
        >
          <option value="">Year</option>
          {YEARS.map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>

        {/* Clear */}
        {(parts.day || parts.month || parts.year) && (
          <button
            type="button"
            onClick={() => onChange({ day: '', month: '', year: '' })}
            className="flex-shrink-0 flex items-center justify-center w-8 h-[38px] rounded-lg border border-gray-200 bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={`Clear ${label} date`}
          >
            <XIcon size={10} />
          </button>
        )}
      </div>
      {(parts.day || parts.month || parts.year) && (
        <span className="text-[11px] text-gray-400">
          {[parts.day ? `Day ${parts.day}` : null, parts.month, parts.year].filter(Boolean).join(' · ')}
        </span>
      )}
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────────── */
export function ReportFilters({ onFilterChange }: ReportFiltersProps) {
  const [open, setOpen] = useState(true);
  const [filters, setFilters] = useState<ReportFiltersState>({
    dateFrom: '', dateTo: '', status: 'ALL', category: '',
  });
  const [fromParts, setFromParts] = useState<DatePart>({ day: '', month: '', year: '' });
  const [toParts, setToParts] = useState<DatePart>({ day: '', month: '', year: '' });

  const update = (patch: Partial<ReportFiltersState>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFilterChange(next);
  };

  const handleFromChange = (p: DatePart) => {
    setFromParts(p);
    update({ dateFrom: partsToIso(p) });
  };

  const handleToChange = (p: DatePart) => {
    setToParts(p);
    update({ dateTo: partsToIso(p) });
  };

  const reset = () => {
    const blank: ReportFiltersState = { dateFrom: '', dateTo: '', status: 'ALL', category: '' };
    setFilters(blank);
    setFromParts({ day: '', month: '', year: '' });
    setToParts({ day: '', month: '', year: '' });
    onFilterChange(blank);
  };

  const activeTags = useMemo(() => {
    const tags: { label: string; key: keyof ReportFiltersState }[] = [];
    if (filters.status !== 'ALL')
      tags.push({ label: filters.status === 'FOR_PICKUP' ? 'Ready for Pickup' : 'Received', key: 'status' });
    if (filters.dateFrom) tags.push({ label: `From ${filters.dateFrom}`, key: 'dateFrom' });
    if (filters.dateTo) tags.push({ label: `To ${filters.dateTo}`, key: 'dateTo' });
    if (filters.category) tags.push({ label: `"${filters.category}"`, key: 'category' });
    return tags;
  }, [filters]);

  const removeTag = (key: keyof ReportFiltersState) => {
    if (key === 'status') update({ status: 'ALL' });
    else if (key === 'dateFrom') { setFromParts({ day: '', month: '', year: '' }); update({ dateFrom: '' }); }
    else if (key === 'dateTo') { setToParts({ day: '', month: '', year: '' }); update({ dateTo: '' }); }
    else if (key === 'category') update({ category: '' });
  };

  const resultHint = useMemo(() => {
    if (activeTags.length === 0) return 'Showing all records';
    const parts: string[] = [];
    if (filters.status !== 'ALL') parts.push(filters.status === 'FOR_PICKUP' ? 'Ready for Pickup' : 'Received');
    if (filters.dateFrom || filters.dateTo) parts.push('date filtered');
    if (filters.category) parts.push(`"${filters.category}"`);
    return `Filtering by ${parts.join(', ')}`;
  }, [activeTags, filters]);

  const pillBase = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 cursor-pointer select-none';
  const pillIdle = 'border-gray-200 text-gray-500 bg-white hover:border-gray-400 hover:text-gray-800';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Header (div, NOT button — fixes nested-button error) ──────── */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50/60 transition-colors cursor-pointer select-none"
      >
        <FilterIcon />
        <span className="text-sm font-semibold text-gray-800">Filters</span>

        {activeTags.length > 0 && (
          <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-blue-500 text-white text-[10px] font-semibold leading-none flex-shrink-0">
            {activeTags.length}
          </span>
        )}

        {/* Active tag pills — rendered as non-interactive spans; remove handled by separate buttons */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {activeTags.slice(0, 2).map(tag => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] text-gray-600"
              >
                {tag.label}
                {/* stop propagation so clicking X doesn't toggle the collapse */}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${tag.label} filter`}
                  onClick={e => { e.stopPropagation(); removeTag(tag.key); }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); removeTag(tag.key); } }}
                  className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer leading-none"
                >
                  <XIcon size={8} />
                </span>
              </span>
            ))}
            {activeTags.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] text-gray-500">
                +{activeTags.length - 2} more
              </span>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {activeTags.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={e => { e.stopPropagation(); reset(); }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); reset(); } }}
              className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Clear all
            </span>
          )}
          <ChevronIcon open={open} />
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      {open && (
        <div className="p-4 sm:p-5 space-y-5">

          {/* Status */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ status: opt.value })}
                  className={`${pillBase} ${filters.status === opt.value ? STATUS_ACTIVE[opt.value] : pillIdle}`}
                >
                  {opt.dot && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: opt.dot }} />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Date range — day / month / year selects */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Date range</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DateSegments label="From" parts={fromParts} onChange={handleFromChange} />
              <DateSegments label="To" parts={toParts} onChange={handleToChange} />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Category */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Category</p>
            <div className="relative flex items-center">
              <svg className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="4.5" /><path strokeLinecap="round" d="M10.5 10.5l3 3" />
              </svg>
              <input
                type="text"
                placeholder="Search by category…"
                value={filters.category}
                onChange={e => update({ category: e.target.value })}
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
              />
              {filters.category && (
                <button
                  type="button"
                  onClick={() => update({ category: '' })}
                  className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear category"
                >
                  <XIcon size={10} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-t border-gray-100">
        <span className="text-xs text-gray-400">{resultHint}</span>
        {activeTags.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}