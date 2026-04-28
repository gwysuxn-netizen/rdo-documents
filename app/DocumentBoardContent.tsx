'use client';

import { useDocuments } from '@/lib/hooks/useDocuments';
import { Document } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { DocumentModal } from '@/components/DocumentModal';

// ─── Office list (acronym → full name) ──────────────────────────────────────

export const OFFICES: { acronym: string; full: string }[] = [
  { acronym: 'ACCT',           full: 'Accounting Section' },
  { acronym: 'BAC',          full: 'Bids and Award Committee' },
  { acronym: 'BFR',          full: 'Birthing Facilities Regulation' },
  { acronym: 'BGT',           full: 'Budget Section' },
  { acronym: 'CS',           full: 'Cashiering Section' },
  { acronym: 'City DOH',     full: 'City DOH - Iloilo' },
  { acronym: 'COA',          full: 'Commission on Audit' },
  { acronym: 'CMU',          full: 'Communications Management Unit' },
  { acronym: 'DMU',          full: 'Data Management Unit' },
  { acronym: 'EOH',          full: 'Environmental and Occupational Health' },
  { acronym: 'EHSCU',        full: 'Equity in Health and Special Concerns Unit' },
  { acronym: 'FHNC',         full: 'Family Health and Nutrition Cluster' },
  { acronym: 'GSM',          full: 'General Services and Maintenance' },
  { acronym: 'HEMS',         full: 'Health Emergency Management Unit' },
  { acronym: 'HFDU',         full: 'Health Facilities Development Unit' },
  { acronym: 'HFEP',         full: 'Health Facility Enhancement Program' },
  { acronym: 'HPCS',         full: 'Health Promotion and Communications Section' },
  { acronym: 'HSRP',         full: 'Health System Resilience Project' },
  { acronym: 'HRT',          full: 'Hospital Regulation Team' },
  { acronym: 'HRDU',         full: 'Human Resource Development Unit' },
  { acronym: 'HRMO',         full: 'Human Resource Management Office' },
  { acronym: 'IDC',          full: 'Infectious Disease and Environment Health Cluster' },
  { acronym: 'ICTU',         full: 'Information and Communications Technology Unit' },
  { acronym: 'IPCNCS',       full: 'Integrated Prevention and Control of Non-Communicable Disease Section' },
  { acronym: 'LS',           full: 'Legal Section' },
  { acronym: 'LHSCS',        full: 'Local Health Systems Coordination Section' },
  { acronym: 'MPU',          full: 'Malasakit Program Unit' },
  { acronym: 'OC-LHSD',      full: 'Office of the Chief - LHSD' },
  { acronym: 'OC-MSD',       full: 'Office of the Chief - MSD' },
  { acronym: 'OC-RLED',      full: 'Office of the Chief - RLED' },
  { acronym: 'ORD III',      full: 'Office of the Director III' },
  { acronym: 'ORD IV',       full: 'Office of the Director IV' },
  { acronym: 'OSAO',         full: 'Office of the Supervising Administrative Officer' },
  { acronym: 'OHFR',         full: 'Other Health Facilities Regulation' },
  { acronym: 'PMNP',         full: 'Philippine Multisectoral Nutrition Project' },
  { acronym: 'PU',           full: 'Planning Unit' },
  { acronym: 'PMU',          full: 'Procurement Management Unit' },
  { acronym: 'PDO-Aklan',    full: 'Provincial DOH - Aklan' },
  { acronym: 'PDO-Antique',  full: 'Provincial DOH - Antique' },
  { acronym: 'PDO-Capiz',    full: 'Provincial DOH - Capiz' },
  { acronym: 'PDO-Guimaras', full: 'Provincial DOH - Guimaras' },
  { acronym: 'PDO-Iloilo',   full: 'Provincial DOH - Iloilo' },
  { acronym: 'PACD',         full: 'Public Assistance and Complaints Desk' },
  { acronym: 'RESU',         full: 'RESU/Statistics' },
  { acronym: 'RM',           full: 'Records Management' },
  { acronym: 'RWTL',         full: 'Regional Water Testing Laboratory' },
  { acronym: 'SLM-NP',       full: 'Supply and Logistics/Warehousing Management - Non-Pharma' },
  { acronym: 'SLM-P',        full: 'Supply and Logistics/Warehousing Management - Pharma' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const VISIBLE_MS = 2400;
const FADE_MS    = 500;
const DOT_COUNT  = 8;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterBarProps {
  statusFilter:         'ALL' | 'FOR_PICKUP' | 'RECEIVED';
  setStatusFilter:      (v: 'ALL' | 'FOR_PICKUP' | 'RECEIVED') => void;
  forPickupCount:       number;
  totalCount:           number;
  receivedCount:        number;
  destinationFilter:    string;
  setDestinationFilter: (v: string) => void;
  dateRange:            { from: string; to: string };
  setDateRange:         (v: { from: string; to: string }) => void;
}

interface OfficeTickerProps {
  destinations: string[];
  documents:    Document[];
  filterBar:    FilterBarProps;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHeaderHeight(): number {
  const el = document.querySelector<HTMLElement>('[data-header]');
  return el ? el.getBoundingClientRect().height : 0;
}

function getScrollRoot(): HTMLElement | null {
  return document.getElementById('main-scroll');
}

// ─── Office Ticker ────────────────────────────────────────────────────────────

function OfficeTicker({ destinations, documents, filterBar }: OfficeTickerProps) {
  const [current,      setCurrent]      = useState(0);
  const [visible,      setVisible]      = useState(true);
  const [isSticky,     setIsSticky]     = useState(false);
  const [stickyReady,  setStickyReady]  = useState(false);
  const [stickyHeight, setStickyHeight] = useState(0);
  const [headerH,      setHeaderH]      = useState(0);

  const tickerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Measure header once on mount ─────────────────────────────────────────
  useEffect(() => {
    let attempts = 0;
    const measure = () => {
      const h = getHeaderHeight();
      if (h > 0) { setHeaderH(h); return; }
      if (++attempts < 10) setTimeout(measure, 100);
    };
    measure();
  }, []);

  // ── Reset animation on new destinations ──────────────────────────────────
  useEffect(() => { setCurrent(0); setVisible(true); }, [destinations.length]);

  // ── Cycle through destinations ───────────────────────────────────────────
  useEffect(() => {
    if (destinations.length <= 1) return;
    const cycle = () => {
      setVisible(false);
      timerRef.current = setTimeout(() => {
        setCurrent((p) => (p + 1) % destinations.length);
        setVisible(true);
        timerRef.current = setTimeout(cycle, VISIBLE_MS);
      }, FADE_MS);
    };
    timerRef.current = setTimeout(cycle, VISIBLE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [destinations.length]);

  // ── IntersectionObserver — fires relative to #main-scroll ────────────────
  useEffect(() => {
    if (!tickerRef.current) return;

    let observer: IntersectionObserver | null = null;
    let raf = 0;

    const init = () => {
      const root = getScrollRoot();
      if (!root || !tickerRef.current) {
        raf = requestAnimationFrame(init);
        return;
      }

      const hh = getHeaderHeight();
      observer = new IntersectionObserver(
        ([entry]) => {
          const hidden = !entry.isIntersecting;
          setIsSticky(hidden);
          if (hidden) requestAnimationFrame(() => setStickyReady(true));
          else        setStickyReady(false);
        },
        {
          root,
          rootMargin: `-${hh + 4}px 0px 0px 0px`,
          threshold: 0,
        },
      );
      observer.observe(tickerRef.current!);
    };

    raf = requestAnimationFrame(init);
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  // ── Measure sticky bar height for placeholder spacer ─────────────────────
  useEffect(() => {
    if (!stickyRef.current) return;
    const ro = new ResizeObserver(() => {
      setStickyHeight(stickyRef.current?.offsetHeight ?? 0);
    });
    ro.observe(stickyRef.current);
    return () => ro.disconnect();
  }, [isSticky]);

  // ── Empty state — no FOR_PICKUP destinations ──────────────────────────────
  if (destinations.length === 0) {
    return (
      <div ref={tickerRef} className="mb-8 sm:mb-10 w-full flex flex-col items-center">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-5">
          Document destinations
        </p>
        <div className="flex flex-col items-center gap-3 py-6">
          <span className="flex items-center justify-center w-20 h-20 rounded-full bg-green-50 border-2 border-green-200">
            <svg className="w-9 h-9 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <p className="text-base font-semibold text-gray-500 text-center">All caught up!</p>
          <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
            No documents are currently waiting for pickup. All have been received.
          </p>
        </div>
      </div>
    );
  }

  const fullName = destinations[current] ?? '';
  const matched  = OFFICES.find((o) => o.full.toLowerCase() === fullName.toLowerCase());
  const acronym  = matched?.acronym ?? null;
  const dotIdx   = current % DOT_COUNT;
  const dotCount = Math.min(destinations.length, DOT_COUNT);

  // Only count FOR_PICKUP documents for this destination
  const docCount = documents.filter(
    (d) =>
      d.destination?.trim().toLowerCase() === fullName.toLowerCase() &&
      d.status === 'FOR_PICKUP',
  ).length;

  return (
    <>
      {/* ── Full-size in-page ticker ──────────────────────────────────────── */}
      <div ref={tickerRef} className="mb-8 sm:mb-10 w-full flex flex-col items-center">

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-5">
          Documents ready for pickup
        </p>

        <div
          style={{ transition: `opacity ${FADE_MS}ms ease`, opacity: visible ? 1 : 0 }}
          className="flex flex-col items-center gap-2 w-full"
        >
          {acronym && (
            <span
              style={{ fontSize: 'clamp(6rem, 28vw, 14rem)', lineHeight: 1 }}
              className="font-black tracking-tighter text-gray-900 text-center"
            >
              {acronym}
            </span>
          )}
          <span
            style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}
            className="font-medium text-gray-400 text-center px-6 leading-snug"
          >
            {fullName}
          </span>

          {/* Single amber "for pickup" badge */}
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">{docCount}</span>
              <span className="text-xs text-amber-500">
                {docCount === 1 ? 'document for pickup' : 'documents for pickup'}
              </span>
            </span>
          </div>
        </div>

        {dotCount > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: dotCount }).map((_, i) => (
              <span
                key={i}
                style={{ transition: 'background-color 0.3s ease' }}
                className={`w-2 h-2 rounded-full ${i === dotIdx ? 'bg-gray-700' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Spacer prevents layout jump when sticky bar mounts ────────────── */}
      {isSticky && <div style={{ height: stickyHeight }} aria-hidden />}

      {/* ── Sticky bar ──────────────────────────────────────────────────────
           • position: fixed, full viewport width
           • top = measured header height → pins flush below the header
           • z-50 → above the header's z-40                                  */}
      {isSticky && (
        <div
          ref={stickyRef}
          style={{
            top:        headerH,
            opacity:    stickyReady ? 1 : 0,
            transform:  stickyReady ? 'translateY(0)' : 'translateY(-6px)',
            transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
          }}
          className="fixed left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/70 shadow-md"
        >
          <div
            style={{ opacity: visible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}
            className="max-w-screen-xl mx-auto flex items-center justify-center gap-3 px-4 sm:px-6 lg:px-8 py-3"
          >
            {/* Label */}
            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest flex-shrink-0 hidden sm:inline">
              For Pickup
            </span>

            {/* Divider */}
            <span className="hidden sm:inline w-px h-5 bg-gray-300 flex-shrink-0" />

            {/* Acronym + full name — centered */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {acronym && (
                <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-gray-900 leading-none flex-shrink-0">
                  {acronym}
                </span>
              )}
              <span className="text-sm sm:text-base md:text-lg text-gray-500 font-medium leading-tight truncate min-w-0">
                {fullName}
              </span>
            </div>

            {/* Divider */}
            <span className="w-px h-5 bg-gray-300 flex-shrink-0" />

            {/* Amber pill + dots */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-semibold text-amber-700">{docCount}</span>
                <span className="text-[10px] sm:text-xs text-amber-500 hidden sm:inline">
                  {docCount === 1 ? 'for pickup' : 'for pickup'}
                </span>
              </span>

              {dotCount > 1 && (
                <div className="flex items-center gap-1 ml-1 pl-2 border-l border-gray-200">
                  {Array.from({ length: dotCount }).map((_, i) => (
                    <span
                      key={i}
                      style={{ transition: 'background-color 0.3s ease' }}
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === dotIdx ? 'bg-gray-700' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Destination Filter Dropdown ─────────────────────────────────────────────

interface DestinationFilterProps {
  value: string;
  onChange: (val: string) => void;
  fullWidth?: boolean;
}

function DestinationFilter({ value, onChange, fullWidth }: DestinationFilterProps) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const buttonRef           = useRef<HTMLButtonElement>(null);
  const dropdownRef         = useRef<HTMLDivElement>(null);
  const searchRef           = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const filtered = OFFICES.filter(
    (o) =>
      o.acronym.toLowerCase().includes(search.toLowerCase()) ||
      o.full.toLowerCase().includes(search.toLowerCase()),
  );

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect       = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropH      = Math.min(300, spaceBelow - 12);
    const isMobile   = window.innerWidth < 640;
    const MARGIN     = isMobile ? 16 : 8;
    if (isMobile) {
      setDropdownStyle({ position: 'fixed', top: rect.bottom + 6, left: MARGIN, right: MARGIN, width: undefined, maxHeight: dropH, zIndex: 9999, borderRadius: '16px' });
    } else {
      const maxW = 420;
      const left = Math.min(rect.left, window.innerWidth - maxW - MARGIN);
      setDropdownStyle({ position: 'fixed', top: rect.bottom + 6, left: Math.max(MARGIN, left), right: undefined, width: maxW, maxHeight: dropH, zIndex: 9999 });
    }
  };

  useEffect(() => {
    if (open) { updatePosition(); setTimeout(() => searchRef.current?.focus(), 20); }
  }, [open]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) { setOpen(false); setSearch(''); }
    };
    const handleScroll = () => { if (open) updatePosition(); };
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const selected = OFFICES.find((o) => o.full === value);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-light text-xs sm:text-sm transition-all border-2 ${fullWidth ? 'w-full' : 'flex-shrink-0'} ${
          value
            ? 'bg-white/60 backdrop-blur border-gray-400/60 text-gray-900 shadow-md'
            : 'bg-white/40 backdrop-blur border-gray-300/40 text-gray-600 hover:bg-white/50'
        }`}
      >
        {selected ? <span className="font-medium">{selected.acronym}</span> : 'Destination'}
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="ml-1 text-gray-400 hover:text-gray-700 cursor-pointer leading-none"
            title="Clear"
          >✕</span>
        )}
        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div ref={dropdownRef} style={dropdownStyle} className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search office..."
                className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <ul className="overflow-y-auto py-1.5 flex-1">
            <li>
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors ${!value ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-600'}`}
              >
                All Destinations
              </button>
            </li>
            {filtered.length > 0 ? filtered.map((o) => (
              <li key={o.acronym}>
                <button
                  type="button"
                  onClick={() => { onChange(o.full); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors ${value === o.full ? 'bg-gray-100 font-semibold' : 'text-gray-700'}`}
                >
                  <span className="font-semibold text-gray-900">{o.acronym}</span>
                  <span className="text-gray-400 ml-1.5 text-xs">— {o.full}</span>
                </button>
              </li>
            )) : (
              <li className="px-4 py-6 text-center text-xs text-gray-400">No offices found</li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}

// ─── Date Range Filter Dropdown ───────────────────────────────────────────────

interface DateRange { from: string; to: string; }
interface DateRangeFilterProps { value: DateRange; onChange: (val: DateRange) => void; fullWidth?: boolean; }

function DateRangeFilter({ value, onChange, fullWidth }: DateRangeFilterProps) {
  const [open, setOpen]                   = useState(false);
  const buttonRef                         = useRef<HTMLButtonElement>(null);
  const dropdownRef                       = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [localFrom, setLocalFrom]         = useState(value.from);
  const [localTo,   setLocalTo]           = useState(value.to);
  const hasValue = value.from || value.to;
  const toInputDate = (d: Date) => d.toISOString().split('T')[0];

  const quickSelects = [
    { label: 'Today',        action: () => { const t = toInputDate(new Date()); setLocalFrom(t); setLocalTo(t); } },
    { label: 'This week',    action: () => { const now = new Date(); const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7)); const sun = new Date(mon); sun.setDate(mon.getDate() + 6); setLocalFrom(toInputDate(mon)); setLocalTo(toInputDate(sun)); } },
    { label: 'This month',   action: () => { const now = new Date(); setLocalFrom(toInputDate(new Date(now.getFullYear(), now.getMonth(), 1))); setLocalTo(toInputDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))); } },
    { label: 'Last 30 days', action: () => { const now = new Date(); const past = new Date(now); past.setDate(now.getDate() - 30); setLocalFrom(toInputDate(past)); setLocalTo(toInputDate(now)); } },
  ];

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect     = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;
    const MARGIN   = isMobile ? 16 : 8;
    if (isMobile) {
      setDropdownStyle({ position: 'fixed', top: rect.bottom + 6, left: MARGIN, right: MARGIN, zIndex: 9999 });
    } else {
      const width = 300;
      const left  = Math.min(rect.left, window.innerWidth - width - MARGIN);
      setDropdownStyle({ position: 'fixed', top: rect.bottom + 6, left: Math.max(MARGIN, left), width, zIndex: 9999 });
    }
  };

  useEffect(() => { if (open) { updatePosition(); setLocalFrom(value.from); setLocalTo(value.to); } }, [open]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const handleApply = () => { onChange({ from: localFrom, to: localTo }); setOpen(false); };
  const handleClear = () => { setLocalFrom(''); setLocalTo(''); onChange({ from: '', to: '' }); setOpen(false); };
  const formatLabel = () => {
    if (value.from && value.to) return `${value.from} – ${value.to}`;
    if (value.from) return `From ${value.from}`;
    if (value.to)   return `To ${value.to}`;
    return 'Date Range';
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-light text-xs sm:text-sm transition-all border-2 ${fullWidth ? 'w-full' : 'flex-shrink-0'} ${
          hasValue
            ? 'bg-white/60 backdrop-blur border-gray-400/60 text-gray-900 shadow-md'
            : 'bg-white/40 backdrop-blur border-gray-300/40 text-gray-600 hover:bg-white/50'
        }`}
      >
        <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={hasValue ? 'font-medium text-gray-900' : ''}>{formatLabel()}</span>
        {hasValue && (
          <span
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            className="ml-1 text-gray-400 hover:text-gray-700 cursor-pointer leading-none"
            title="Clear"
          >✕</span>
        )}
        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div ref={dropdownRef} style={dropdownStyle} className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Date</p>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 font-medium">From</label>
              <input type="date" value={localFrom} onChange={(e) => setLocalFrom(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 font-medium">To</label>
              <input type="date" value={localTo} min={localFrom} onChange={(e) => setLocalTo(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white" />
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quick Select</p>
              <div className="flex flex-wrap gap-1.5">
                {quickSelects.map((qs) => (
                <button key={qs.label} type="button" onClick={qs.action} className="px-3 py-1.5 rounded-full text-sm font-light transition-all duration-200 border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 flex items-center gap-1.5 whitespace-nowrap">
                {qs.label}
                </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <button type="button" onClick={handleClear} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">
                Clear dates
              </button>
              <button type="button" onClick={handleApply} disabled={!localFrom && !localTo} className="px-5 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-black rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, onClick }: { status: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium transition-all hover:shadow-md ${
        status === 'FOR_PICKUP'
          ? 'bg-amber-100/70 text-amber-700 hover:bg-amber-100'
          : 'bg-green-100/70 text-green-700 hover:bg-green-100'
      }`}
    >
      {status === 'FOR_PICKUP' ? 'Ready for Pickup' : 'Received'}
    </button>
  );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────

function DocumentCard({ doc, onView, onStatusClick }: { doc: Document; onView: () => void; onStatusClick: () => void }) {
  const destOffice = OFFICES.find((o) => o.full.toLowerCase() === doc.destination.toLowerCase());
  return (
    <div className="bg-white/50 backdrop-blur-xl border border-gray-200/60 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md hover:bg-white/60 transition-all">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <span className="font-mono text-xs font-semibold text-gray-800 leading-tight break-all min-w-0 flex-1">{doc.controlNo}</span>
        <div className="flex-shrink-0"><StatusBadge status={doc.status} onClick={onStatusClick} /></div>
      </div>
      <p className="text-xs text-gray-700 leading-snug cursor-pointer hover:text-gray-900 hover:underline line-clamp-3" onClick={onView}>{doc.subject}</p>
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/50 min-w-0">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
          <span className="text-[10px] text-gray-400 truncate">{doc.date}</span>
          {destOffice ? (
            <span className="text-[10px] font-semibold text-gray-600 truncate" title={destOffice.full}>
              {destOffice.acronym}
              <span className="text-gray-400 font-normal ml-1 hidden xs:inline">— {destOffice.full}</span>
            </span>
          ) : (
            <span className="text-[10px] text-gray-500 truncate" title={doc.destination}>{doc.destination}</span>
          )}
        </div>
        <button
          onClick={onView}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/70 backdrop-blur border border-gray-300 text-gray-700 rounded-lg hover:bg-white text-xs font-medium transition-all shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocumentBoardContent() {
  const { documents, loading } = useDocuments();
  const [search,            setSearch]            = useState('');
  const [statusFilter,      setStatusFilter]      = useState<'ALL' | 'FOR_PICKUP' | 'RECEIVED'>('ALL');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [dateRange,         setDateRange]         = useState<DateRange>({ from: '', to: '' });
  const [selectedDocument,  setSelectedDocument]  = useState<Document | null>(null);

  // ── Only cycle through destinations that have FOR_PICKUP documents ────────
  const tickerDestinations: string[] = Array.from(
    new Set(
      documents
        .filter((d) => d.status === 'FOR_PICKUP')
        .map((d) => d.destination?.trim())
        .filter((dest): dest is string => Boolean(dest)),
    ),
  );

  const parseDocDate = (dateStr: string): Date | null => {
    try { return new Date(dateStr); } catch { return null; }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.controlNo.toLowerCase().includes(search.toLowerCase()) ||
      doc.subject.toLowerCase().includes(search.toLowerCase()) ||
      doc.destination.toLowerCase().includes(search.toLowerCase());
    const matchesStatus      = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesDestination = !destinationFilter || doc.destination.toLowerCase().includes(destinationFilter.toLowerCase());
    let matchesDate = true;
    if (dateRange.from || dateRange.to) {
      const docDate = parseDocDate(doc.date);
      if (docDate) {
        if (dateRange.from) { const fromDate = new Date(dateRange.from); fromDate.setHours(0, 0, 0, 0); if (docDate < fromDate) matchesDate = false; }
        if (dateRange.to)   { const toDate   = new Date(dateRange.to);   toDate.setHours(23, 59, 59, 999); if (docDate > toDate) matchesDate = false; }
      }
    }
    return matchesSearch && matchesStatus && matchesDestination && matchesDate;
  });

  const forPickupCount = documents.filter((d) => d.status === 'FOR_PICKUP').length;

  return (
    <>
      <div className="w-full max-w-full overflow-x-hidden">

        {/* ── Page Title + Search Bar ── */}
        <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">Available Documents</h2>
            <p className="text-xs sm:text-sm text-gray-500">Search and view all available documents</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[280px] sm:max-w-[360px]">
            <div className="relative flex-1">
              <input
                type="search"
                placeholder="Search by control no., subject..."
                className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-300/40 bg-white/40 backdrop-blur rounded-lg focus:outline-none focus:border-gray-400/60 focus:bg-white/60 transition-all placeholder:text-gray-400"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <button type="button" className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0">
              Search
            </button>
          </div>
        </div>

        {/* ── Office Ticker ── */}
        {!loading && (
          <OfficeTicker
            destinations={tickerDestinations}
            documents={documents}
            filterBar={{
              statusFilter,
              setStatusFilter,
              forPickupCount,
              totalCount:    documents.length,
              receivedCount: documents.filter((d) => d.status === 'RECEIVED').length,
              destinationFilter,
              setDestinationFilter,
              dateRange,
              setDateRange,
            }}
          />
        )}

        {/* ── Filter bar ── */}
        <div className="w-full mb-5 sm:mb-7">
          <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex sm:flex-nowrap items-center gap-1 sm:gap-2 pt-3 pb-1 sm:pr-4">
              {[
                { key: 'ALL',        label: 'All',              count: documents.length },
                { key: 'FOR_PICKUP', label: 'Ready for Pickup', count: forPickupCount },
                { key: 'RECEIVED',   label: 'Received',         count: documents.filter((d) => d.status === 'RECEIVED').length },
              ].map(({ key, label, count }) => {
                const isForPickup = key === 'FOR_PICKUP';
                return (
                  <div key={key} className="relative flex-1 sm:flex-shrink-0 sm:flex-grow-0 isolate">
                    <button
                      onClick={() => setStatusFilter(key as 'ALL' | 'FOR_PICKUP' | 'RECEIVED')}
                      className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-light text-xs sm:text-sm transition-all duration-200 border whitespace-nowrap ${
                        statusFilter === key
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-transparent text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800'
                      }`}
                    >
                      {label}
                      <span className={`text-[10px] px-1 py-0.5 rounded-full font-semibold ${statusFilter === key ? 'bg-gray-200/70 text-gray-700' : 'bg-gray-100/60 text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                    {isForPickup && count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 text-white text-[8px] font-bold items-center justify-center leading-none">
                          {count > 99 ? '99+' : count}
                        </span>
                      </span>
                    )}
                  </div>
                );
              })}

              <span className="flex-shrink-0 w-px h-5 bg-gray-300/60 mx-0.5 hidden sm:inline-block" />
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <DestinationFilter value={destinationFilter} onChange={setDestinationFilter} />
                <DateRangeFilter   value={dateRange}         onChange={setDateRange} />
              </div>
            </div>
          </div>

          <div className="flex sm:hidden items-center gap-2 pt-2 pb-1 w-full">
            <div className="flex-1"><DestinationFilter value={destinationFilter} onChange={setDestinationFilter} fullWidth /></div>
            <div className="flex-1"><DateRangeFilter   value={dateRange}         onChange={setDateRange}         fullWidth /></div>
          </div>
        </div>

        {/* ── Active filter hints ── */}
        {(destinationFilter || dateRange.from || dateRange.to) && (
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3 -mt-3">
            {destinationFilter && (
              <p>
                Destination: <span className="font-semibold text-gray-700">{OFFICES.find((o) => o.full === destinationFilter)?.acronym ?? destinationFilter}</span>
                <button onClick={() => setDestinationFilter('')} className="ml-2 text-gray-400 hover:text-gray-600 underline">Clear</button>
              </p>
            )}
            {(dateRange.from || dateRange.to) && (
              <p>
                Date: <span className="font-semibold text-gray-700">
                  {dateRange.from && dateRange.to
                    ? `${dateRange.from} – ${dateRange.to}`
                    : dateRange.from ? `From ${dateRange.from}` : `To ${dateRange.to}`}
                </span>
                <button onClick={() => setDateRange({ from: '', to: '' })} className="ml-2 text-gray-400 hover:text-gray-600 underline">Clear</button>
              </p>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-16 bg-white/50 backdrop-blur-xl rounded-2xl border-2 border-gray-300/40">
            <p className="text-gray-500 font-light text-sm">Loading documents…</p>
          </div>
        )}

        {/* ── No Results ── */}
        {!loading && filteredDocuments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white/50 backdrop-blur-xl rounded-2xl border-2 border-gray-300/40">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 font-light text-center text-sm px-4">
              {documents.length === 0 ? 'No documents available at this time' : 'No matching documents found'}
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {!loading && filteredDocuments.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onView={() => setSelectedDocument(doc)}
                  onStatusClick={() => setStatusFilter(doc.status as 'FOR_PICKUP' | 'RECEIVED')}
                />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white/50 backdrop-blur-xl rounded-xl border-2 border-gray-300/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300/40 bg-gradient-to-r from-gray-50/60 to-gray-50/40">
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Control No.</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Date</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Destination</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc, index) => {
                      const destOffice = OFFICES.find((o) => o.full.toLowerCase() === doc.destination.toLowerCase());
                      return (
                        <tr
                          key={doc.id}
                          className={`border-b border-gray-300/30 hover:bg-white/40 transition-colors ${index % 2 === 0 ? 'bg-white/30' : 'bg-white/20'}`}
                        >
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs font-mono text-gray-900 whitespace-nowrap">{doc.controlNo}</td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs text-gray-600 whitespace-nowrap">{doc.date}</td>
                          <td
                            className="px-4 lg:px-6 py-3 lg:py-4 text-xs text-gray-700 cursor-pointer hover:text-gray-900 hover:underline transition-colors group relative max-w-xs"
                            onClick={() => setSelectedDocument(doc)}
                            title="Click to view full details"
                          >
                            <span className="line-clamp-2">{doc.subject}</span>
                            <div className="absolute bottom-full left-2 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-normal w-64 z-10 pointer-events-none">
                              {doc.subject}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs text-gray-700">
                            {destOffice ? (
                              <span title={destOffice.full} className="cursor-default">
                                <span className="font-semibold text-gray-900">{destOffice.acronym}</span>
                                <span className="text-gray-400 ml-1 hidden lg:inline">— {destOffice.full}</span>
                              </span>
                            ) : doc.destination}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <StatusBadge status={doc.status} onClick={() => setStatusFilter(doc.status as 'FOR_PICKUP' | 'RECEIVED')} />
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <button
                              onClick={() => setSelectedDocument(doc)}
                              className="px-3 py-1 bg-white/60 backdrop-blur border border-gray-300 text-gray-700 rounded-lg hover:bg-white/80 text-xs font-light transition-all"
                            >
                              <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── Document Modal ── */}
      {selectedDocument && (
        <DocumentModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          isAdminView={false}
        />
      )}
    </>
  );
}