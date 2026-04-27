'use client';

import { useDocuments } from '@/lib/hooks/useDocuments';
import { Document } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { DocumentModal } from '@/components/DocumentModal';

// ─── Office list (acronym → full name) ──────────────────────────────────────

export const OFFICES: { acronym: string; full: string }[] = [
  { acronym: 'ACCT',       full: 'Accounting Section' },
  { acronym: 'BAC',      full: 'Bids and Award Committee' },
  { acronym: 'BFR',      full: 'Birthing Facilities Regulation' },
  { acronym: 'BS',       full: 'Budget Section' },
  { acronym: 'CS',       full: 'Cashiering Section' },
  { acronym: 'City DOH', full: 'City DOH - Iloilo' },
  { acronym: 'COA',      full: 'Commission on Audit' },
  { acronym: 'CMU',      full: 'Communications Management Unit' },
  { acronym: 'DMU',      full: 'Data Management Unit' },
  { acronym: 'EOH',      full: 'Environmental and Occupational Health' },
  { acronym: 'EHSCU',    full: 'Equity in Health and Special Concerns Unit' },
  { acronym: 'FHNC',     full: 'Family Health and Nutrition Cluster' },
  { acronym: 'GSM',      full: 'General Services and Maintenance' },
  { acronym: 'HEMU',     full: 'Health Emergency Management Unit' },
  { acronym: 'HFDU',     full: 'Health Facilities Development Unit' },
  { acronym: 'HFEP',     full: 'Health Facility Enhancement Program' },
  { acronym: 'HPCS',     full: 'Health Promotion and Communications Section' },
  { acronym: 'HSRP',     full: 'Health System Resilience Project' },
  { acronym: 'HRT',      full: 'Hospital Regulation Team' },
  { acronym: 'HRDU',     full: 'Human Resource Development Unit' },
  { acronym: 'HRMO',     full: 'Human Resource Management Office' },
  { acronym: 'IDC',      full: 'Infectious Disease and Environment Health Cluster' },
  { acronym: 'ICTU',     full: 'Information and Communications Technology Unit' },
  { acronym: 'IPCNCS',   full: 'Integrated Prevention and Control of Non-Communicable Disease Section' },
  { acronym: 'LS',       full: 'Legal Section' },
  { acronym: 'LHSCS',    full: 'Local Health Systems Coordination Section' },
  { acronym: 'MPU',      full: 'Malasakit Program Unit' },
  { acronym: 'OC-LHSD',  full: 'Office of the Chief - LHSD' },
  { acronym: 'OC-MSD',   full: 'Office of the Chief - MSD' },
  { acronym: 'OC-RLED',  full: 'Office of the Chief - RLED' },
  { acronym: 'ORD III',   full: 'Office of the Director III' },
  { acronym: 'ORD IV',    full: 'Office of the Director IV' },
  { acronym: 'OSAO',     full: 'Office of the Supervising Administrative Officer' },
  { acronym: 'OHFR',     full: 'Other Health Facilities Regulation' },
  { acronym: 'PMNP',     full: 'Philippine Multisectoral Nutrition Project' },
  { acronym: 'PU',       full: 'Planning Unit' },
  { acronym: 'PMU',      full: 'Procurement Management Unit' },
  { acronym: 'PDO-Aklan',   full: 'Provincial DOH - Aklan' },
  { acronym: 'PDO-Antique', full: 'Provincial DOH - Antique' },
  { acronym: 'PDO-Capiz',   full: 'Provincial DOH - Capiz' },
  { acronym: 'PDO-Guimaras',full: 'Provincial DOH - Guimaras' },
  { acronym: 'PDO-Iloilo',  full: 'Provincial DOH - Iloilo' },
  { acronym: 'PACD',     full: 'Public Assistance and Complaints Desk' },
  { acronym: 'RESU',     full: 'RESU/Statistics' },
  { acronym: 'RM',       full: 'Records Management' },
  { acronym: 'RWTL',     full: 'Regional Water Testing Laboratory' },
  { acronym: 'SLM-NP',   full: 'Supply and Logistics/Warehousing Management - Non-Pharma' },
  { acronym: 'SLM-P',    full: 'Supply and Logistics/Warehousing Management - Pharma' },
];

// ─── Destination Filter Dropdown ─────────────────────────────────────────────

interface DestinationFilterProps {
  value: string;
  onChange: (val: string) => void;
  fullWidth?: boolean;
}

function DestinationFilter({ value, onChange, fullWidth }: DestinationFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const filtered = OFFICES.filter(
    (o) =>
      o.acronym.toLowerCase().includes(search.toLowerCase()) ||
      o.full.toLowerCase().includes(search.toLowerCase()),
  );

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropH = Math.min(300, spaceBelow - 12);
    const isMobile = window.innerWidth < 640;
    const MARGIN = isMobile ? 16 : 8;

    if (isMobile) {
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: MARGIN,
        right: MARGIN,
        width: undefined,
        maxHeight: dropH,
        zIndex: 9999,
        borderRadius: '16px',
      });
    } else {
      const maxW = 420;
      const left = Math.min(rect.left, window.innerWidth - maxW - MARGIN);
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: Math.max(MARGIN, left),
        right: undefined,
        width: maxW,
        maxHeight: dropH,
        zIndex: 9999,
      });
    }
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      setTimeout(() => searchRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
        setSearch('');
      }
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
        {selected ? (
          <span className="font-medium">{selected.acronym}</span>
        ) : (
          'Destination'
        )}
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="ml-1 text-gray-400 hover:text-gray-700 cursor-pointer leading-none"
            title="Clear"
          >
            ✕
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
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
                className={`w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors ${
                  !value ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-600'
                }`}
              >
                All Destinations
              </button>
            </li>
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <li key={o.acronym}>
                  <button
                    type="button"
                    onClick={() => { onChange(o.full); setOpen(false); setSearch(''); }}
                    className={`w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors ${
                      value === o.full ? 'bg-gray-100 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span className="font-semibold text-gray-900">{o.acronym}</span>
                    <span className="text-gray-400 ml-1.5 text-xs">— {o.full}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-xs text-gray-400">No offices found</li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}

// ─── Date Range Filter Dropdown ───────────────────────────────────────────────

interface DateRange {
  from: string;
  to: string;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (val: DateRange) => void;
  fullWidth?: boolean;
}

function DateRangeFilter({ value, onChange, fullWidth }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [localFrom, setLocalFrom] = useState(value.from);
  const [localTo, setLocalTo] = useState(value.to);

  const hasValue = value.from || value.to;

  const toInputDate = (d: Date) => d.toISOString().split('T')[0];

  const quickSelects = [
    {
      label: 'Today',
      action: () => {
        const today = toInputDate(new Date());
        setLocalFrom(today);
        setLocalTo(today);
      },
    },
    {
      label: 'This week',
      action: () => {
        const now = new Date();
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((day + 6) % 7));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        setLocalFrom(toInputDate(monday));
        setLocalTo(toInputDate(sunday));
      },
    },
    {
      label: 'This month',
      action: () => {
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setLocalFrom(toInputDate(first));
        setLocalTo(toInputDate(last));
      },
    },
    {
      label: 'Last 30 days',
      action: () => {
        const now = new Date();
        const past = new Date(now);
        past.setDate(now.getDate() - 30);
        setLocalFrom(toInputDate(past));
        setLocalTo(toInputDate(now));
      },
    },
  ];

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;
    const MARGIN = isMobile ? 16 : 8;

    if (isMobile) {
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: MARGIN,
        right: MARGIN,
        width: undefined,
        zIndex: 9999,
      });
    } else {
      const width = 300;
      const left = Math.min(rect.left, window.innerWidth - width - MARGIN);
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: Math.max(MARGIN, left),
        width,
        zIndex: 9999,
      });
    }
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      setLocalFrom(value.from);
      setLocalTo(value.to);
    }
  }, [open]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  const handleApply = () => {
    onChange({ from: localFrom, to: localTo });
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFrom('');
    setLocalTo('');
    onChange({ from: '', to: '' });
    setOpen(false);
  };

  const formatLabel = () => {
    if (value.from && value.to) return `${value.from} – ${value.to}`;
    if (value.from) return `From ${value.from}`;
    if (value.to) return `To ${value.to}`;
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
          >
            ✕
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-4 flex flex-col gap-3">

            {/* Filter by Date heading */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Date</p>

            {/* From */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 font-medium">From</label>
              <input
                type="date"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
            </div>

            {/* To */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 font-medium">To</label>
              <input
                type="date"
                value={localTo}
                min={localFrom}
                onChange={(e) => setLocalTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              />
            </div>

            {/* Quick Select */}
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quick Select</p>
              <div className="flex flex-wrap gap-1.5">
                {quickSelects.map((qs) => (
                  <button
                    key={qs.label}
                    type="button"
                    onClick={qs.action}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {qs.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer: Clear dates + Apply */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
              >
                Clear dates
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!localFrom && !localTo}
                className="px-5 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-black rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
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

function DocumentCard({
  doc,
  onView,
  onStatusClick,
}: {
  doc: Document;
  onView: () => void;
  onStatusClick: () => void;
}) {
  const destOffice = OFFICES.find(
    (o) => o.full.toLowerCase() === doc.destination.toLowerCase(),
  );

  return (
    <div className="bg-white/50 backdrop-blur-xl border border-gray-200/60 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md hover:bg-white/60 transition-all">

      {/* Row 1: Control No. + Status Badge */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <span className="font-mono text-xs font-semibold text-gray-800 leading-tight break-all min-w-0 flex-1">
          {doc.controlNo}
        </span>
        <div className="flex-shrink-0">
          <StatusBadge status={doc.status} onClick={onStatusClick} />
        </div>
      </div>

      {/* Row 2: Subject */}
      <p
        className="text-xs text-gray-700 leading-snug cursor-pointer hover:text-gray-900 hover:underline line-clamp-3"
        onClick={onView}
      >
        {doc.subject}
      </p>

      {/* Row 3: Date + Destination + View button */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200/50 min-w-0">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1 overflow-hidden">
          <span className="text-[10px] text-gray-400 truncate">{doc.date}</span>
          {destOffice ? (
            <span className="text-[10px] font-semibold text-gray-600 truncate" title={destOffice.full}>
              {destOffice.acronym}
              <span className="text-gray-400 font-normal ml-1 hidden xs:inline">
                — {destOffice.full}
              </span>
            </span>
          ) : (
            <span className="text-[10px] text-gray-500 truncate" title={doc.destination}>
              {doc.destination}
            </span>
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FOR_PICKUP' | 'RECEIVED'>('ALL');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPickupTooltip, setShowPickupTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const pickupBtnRef = useRef<HTMLButtonElement>(null);

  const updateTooltipPosition = () => {
    if (!pickupBtnRef.current) return;
    const rect = pickupBtnRef.current.getBoundingClientRect();
    setTooltipStyle({
      position: 'fixed',
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
      transform: 'translate(-50%, -100%)',
      zIndex: 9999,
    });
  };

  // Parse a "MM/DD/YYYY, HH:MM:SS AM/PM" date string into a Date object
  const parseDocDate = (dateStr: string): Date | null => {
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.controlNo.toLowerCase().includes(search.toLowerCase()) ||
      doc.subject.toLowerCase().includes(search.toLowerCase()) ||
      doc.destination.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;

    const matchesDestination =
      !destinationFilter ||
      doc.destination.toLowerCase().includes(destinationFilter.toLowerCase());

    let matchesDate = true;
    if (dateRange.from || dateRange.to) {
      const docDate = parseDocDate(doc.date);
      if (docDate) {
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          if (docDate < fromDate) matchesDate = false;
        }
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (docDate > toDate) matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesDestination && matchesDate;
  });

  const forPickupCount = documents.filter((d) => d.status === 'FOR_PICKUP').length;

  return (
    <>
      <div className="w-full max-w-full overflow-x-hidden">

        {/* Page Title + Search Bar (top right) */}
        <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">Available Documents</h2>
            <p className="text-xs sm:text-sm text-gray-500">Search and view all available documents</p>
          </div>

          {/* Search bar — top right on desktop, full width on mobile */}
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
            <button
              type="button"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="w-full mb-5 sm:mb-7">

          {/* Row 1: Status pills — full width on mobile, scrollable on desktop */}
          <div className="w-full overflow-x-auto sm:overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex sm:flex-nowrap items-center gap-1 sm:gap-2 pt-3 pb-1 sm:pr-4">
              {[
                { key: 'ALL', label: 'All', count: documents.length },
                { key: 'FOR_PICKUP', label: 'Ready for Pickup', count: forPickupCount },
                { key: 'RECEIVED', label: 'Received', count: documents.filter((d) => d.status === 'RECEIVED').length },
              ].map(({ key, label, count }) => {
                const isForPickup = key === 'FOR_PICKUP';
                return (
                  <div key={key} className="relative flex-1 sm:flex-shrink-0 sm:flex-grow-0 isolate">
                    <button
                      ref={isForPickup ? pickupBtnRef : undefined}
                      onClick={() => setStatusFilter(key as 'ALL' | 'FOR_PICKUP' | 'RECEIVED')}
                      onMouseEnter={() => {
                        if (isForPickup && count > 0) {
                          updateTooltipPosition();
                          setShowPickupTooltip(true);
                        }
                      }}
                      onMouseLeave={() => setShowPickupTooltip(false)}
                      className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-light text-xs sm:text-sm transition-all border-2 whitespace-nowrap ${
                        statusFilter === key
                          ? 'bg-white/60 backdrop-blur border-gray-400/60 text-gray-900 shadow-md'
                          : 'bg-white/40 backdrop-blur border-gray-300/40 text-gray-600 hover:bg-white/50'
                      }`}
                    >
                      {label}
                      <span className={`text-[10px] px-1 py-0.5 rounded-full font-semibold ${
                        statusFilter === key ? 'bg-gray-200/70 text-gray-700' : 'bg-gray-100/60 text-gray-500'
                      }`}>
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

              {/* Divider — desktop only, same row */}
              <span className="flex-shrink-0 w-px h-5 bg-gray-300/60 mx-0.5 hidden sm:inline-block" />

              {/* Destination + Date Range — same row on desktop */}
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <DestinationFilter value={destinationFilter} onChange={setDestinationFilter} />
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
              </div>
            </div>
          </div>

          {/* Row 2: Destination + Date Range — mobile only, full width */}
          <div className="flex sm:hidden items-center gap-2 pt-2 pb-1 w-full">
            <div className="flex-1">
              <DestinationFilter value={destinationFilter} onChange={setDestinationFilter} fullWidth />
            </div>
            <div className="flex-1">
              <DateRangeFilter value={dateRange} onChange={setDateRange} fullWidth />
            </div>
          </div>

        </div>

        {/* Active filter hints */}
        {(destinationFilter || dateRange.from || dateRange.to) && (
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3 -mt-3">
            {destinationFilter && (
              <p>
                Destination:{' '}
                <span className="font-semibold text-gray-700">
                  {OFFICES.find((o) => o.full === destinationFilter)?.acronym ?? destinationFilter}
                </span>
                <button onClick={() => setDestinationFilter('')} className="ml-2 text-gray-400 hover:text-gray-600 underline">Clear</button>
              </p>
            )}
            {(dateRange.from || dateRange.to) && (
              <p>
                Date:{' '}
                <span className="font-semibold text-gray-700">
                  {dateRange.from && dateRange.to
                    ? `${dateRange.from} – ${dateRange.to}`
                    : dateRange.from
                    ? `From ${dateRange.from}`
                    : `To ${dateRange.to}`}
                </span>
                <button onClick={() => setDateRange({ from: '', to: '' })} className="ml-2 text-gray-400 hover:text-gray-600 underline">Clear</button>
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16 bg-white/50 backdrop-blur-xl rounded-2xl border-2 border-gray-300/40">
            <p className="text-gray-500 font-light text-sm">Loading documents…</p>
          </div>
        )}

        {/* No Results */}
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

        {/* Mobile: Card List */}
        {!loading && filteredDocuments.length > 0 && (
          <>
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

            {/* Desktop/Tablet: Table */}
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
                      const destOffice = OFFICES.find(
                        (o) => o.full.toLowerCase() === doc.destination.toLowerCase(),
                      );
                      return (
                        <tr
                          key={doc.id}
                          className={`border-b border-gray-300/30 hover:bg-white/40 transition-colors ${
                            index % 2 === 0 ? 'bg-white/30' : 'bg-white/20'
                          }`}
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
                            ) : (
                              doc.destination
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <StatusBadge
                              status={doc.status}
                              onClick={() => setStatusFilter(doc.status as 'FOR_PICKUP' | 'RECEIVED')}
                            />
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <button
                              onClick={() => setSelectedDocument(doc)}
                              className="px-3 py-1 bg-white/60 backdrop-blur border border-gray-300 text-gray-700 rounded-lg hover:bg-white/80 text-xs font-light transition-all"
                              title="View details"
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

      {selectedDocument && (
        <DocumentModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          isAdminView={false}
        />
      )}

      {/* Fixed-position For Pickup tooltip */}
      {showPickupTooltip && forPickupCount > 0 && (
        <div style={tooltipStyle} className="pointer-events-none">
          <div className="bg-red-600 text-white rounded-xl shadow-2xl px-4 py-3 flex flex-col items-center gap-0.5 whitespace-nowrap min-w-[140px] mb-2 relative">
            <svg className="w-4 h-4 mb-1 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-2xl font-bold leading-none">{forPickupCount}</span>
            <span className="text-[11px] font-semibold opacity-95 uppercase tracking-wider mt-0.5">
              {forPickupCount === 1 ? 'Document' : 'Documents'}
            </span>
            <span className="text-[10px] opacity-80">ready for pick up</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-red-600" />
          </div>
        </div>
      )}
    </>
  );
}