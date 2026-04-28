'use client';

import { useState, useEffect, useRef } from 'react';
import { DocumentFormData } from '@/lib/types';
import { uploadDocument } from '@/lib/admin-utils';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import toast from 'react-hot-toast';

// ─── Shared office list (also exported for DocumentBoardContent) ─────────────

export const OFFICES: { acronym: string; full: string }[] = [
  { acronym: 'ACCT',         full: 'Accounting Section' },
  { acronym: 'BAC',        full: 'Bids and Award Committee' },
  { acronym: 'BFR',        full: 'Birthing Facilities Regulation' },
  { acronym: 'BGT',         full: 'Budget Section' },
  { acronym: 'CS',         full: 'Cashiering Section' },
  { acronym: 'City DOH',   full: 'City DOH - Iloilo' },
  { acronym: 'COA',        full: 'Commission on Audit' },
  { acronym: 'CMU',        full: 'Communications Management Unit' },
  { acronym: 'DMU',        full: 'Data Management Unit' },
  { acronym: 'EOH',        full: 'Environmental and Occupational Health' },
  { acronym: 'EHSCU',      full: 'Equity in Health and Special Concerns Unit' },
  { acronym: 'FHNC',       full: 'Family Health and Nutrition Cluster' },
  { acronym: 'GSM',        full: 'General Services and Maintenance' },
  { acronym: 'HEMS',       full: 'Health Emergency Management Unit' },
  { acronym: 'HFDU',       full: 'Health Facilities Development Unit' },
  { acronym: 'HFEP',       full: 'Health Facility Enhancement Program' },
  { acronym: 'HPCS',       full: 'Health Promotion and Communications Section' },
  { acronym: 'HSRP',       full: 'Health System Resilience Project' },
  { acronym: 'HRT',        full: 'Hospital Regulation Team' },
  { acronym: 'HRDU',       full: 'Human Resource Development Unit' },
  { acronym: 'HRMO',       full: 'Human Resource Management Office' },
  { acronym: 'IDC',        full: 'Infectious Disease and Environment Health Cluster' },
  { acronym: 'ICTU',       full: 'Information and Communications Technology Unit' },
  { acronym: 'IPCNCS',     full: 'Integrated Prevention and Control of Non-Communicable Disease Section' },
  { acronym: 'LS',         full: 'Legal Section' },
  { acronym: 'LHSCS',      full: 'Local Health Systems Coordination Section' },
  { acronym: 'MPU',        full: 'Malasakit Program Unit' },
  { acronym: 'OC-LHSD',    full: 'Office of the Chief - LHSD' },
  { acronym: 'OC-MSD',     full: 'Office of the Chief - MSD' },
  { acronym: 'OC-RLED',    full: 'Office of the Chief - RLED' },
  { acronym: 'ORD III',     full: 'Office of the Director III' },
  { acronym: 'ORD IV',      full: 'Office of the Director IV' },
  { acronym: 'OSAO',       full: 'Office of the Supervising Administrative Officer' },
  { acronym: 'OHFR',       full: 'Other Health Facilities Regulation' },
  { acronym: 'PMNP',       full: 'Philippine Multisectoral Nutrition Project' },
  { acronym: 'PU',         full: 'Planning Unit' },
  { acronym: 'PMU',        full: 'Procurement Management Unit' },
  { acronym: 'PDO-Aklan',    full: 'Provincial DOH - Aklan' },
  { acronym: 'PDO-Antique',  full: 'Provincial DOH - Antique' },
  { acronym: 'PDO-Capiz',    full: 'Provincial DOH - Capiz' },
  { acronym: 'PDO-Guimaras', full: 'Provincial DOH - Guimaras' },
  { acronym: 'PDO-Iloilo',   full: 'Provincial DOH - Iloilo' },
  { acronym: 'PACD',       full: 'Public Assistance and Complaints Desk' },
  { acronym: 'RESU',       full: 'RESU/Statistics' },
  { acronym: 'RM',         full: 'Records Management' },
  { acronym: 'RWTL',       full: 'Regional Water Testing Laboratory' },
  { acronym: 'SLM-NP',     full: 'Supply and Logistics/Warehousing Management - Non-Pharma' },
  { acronym: 'SLM-P',      full: 'Supply and Logistics/Warehousing Management - Pharma' },
];

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Action Plan', 'Activity Report', 'Advisory', 'Allocation List', 'Application for Leave',
  'Application Letter', 'Authority to Provide or Grant Honorarium', 'Authority to Reimburse',
  'Call-Off Order / Call Off Request', 'Canvas Form for Small Value Procurement',
  'Certification for Clearance', 'Clearance for Maternity Leave',
  'Clearance for Retirement or Resignation of Personnel', 'Commission on Audit Issuances',
  'Contract of Service', 'Contract/Framework Agreement', 'Cost Benefit Analysis',
  'COVID-19 Claims', 'CSS Complaint Form', 'Daily Time Record', 'Data Request',
  'Deed of Donation', 'Demand Letter', 'Department of Health Administrative Issuances',
  'Document Creation', 'Document Request', 'Endorsement Letter', 'Evaluation Form',
  'External Complaint/Concern', 'For Transfer of Cash Assistance Fund',
  'For Your Information Letter', 'Freedom of Information Request', 'GSIS Life Insurance Form',
  'GSIS Retirement / Separation Form', 'HCI and Other Related Documents',
  'HFEP and Other Related Documents', 'Incident Report', 'Indorsement',
  'Inspection & Acceptance Report', 'Inventory Custodian Slip', 'Invitation to Bid',
  'Issuances of Certificate of Inclusion in the Blood Services Network',
  'Justification Letter for Procurement', 'Legal and Other Related Documents',
  'Letter for Request', 'Letter of Cancellation', 'Letter of Inquiry',
  'Letter of Invitation', 'Letter of Postponement / Notice of Postponement',
  'Letter of Recommendation', 'License-Permit-Certificate', 'Liquidation',
  'Memorandum', 'Memorandum of Agreement', 'Minutes of the Meeting',
  'MOA-MOU-RESOLUTIONS', 'Monitoring and Technical Assistance Plan',
  'Multi Purpose Loan Application Plan', 'Multi Purpose Loan Application Form',
  'National Government Agencies Issuances', 'Notice of Award', 'Notice of Meeting',
  'Notice to Proceed', 'Obligation Request', 'OPCR-DPCR-IPCR',
  'Payroll of Personnel Communication Allowance', 'Payroll of Personnel Salaries and Benefits',
  'Personnel Memorandum', 'Petty Cash Voucher',
  'PR Attachments (Learning Design, Concept Note, Notice of Meeting)',
  'Project Procurement Management Plan', 'Project Proposal', 'Property Acknowledgement Receipt',
  'Property Transfer Receipt', 'Prototype', 'Pull-out Slip',
  'Quarterly Monitory of Accomplishments (QMOA) Regional Memorandum',
  'Regional Office Personnel Order', 'Regional Order', 'Report Of Semi-Expendable Property Issued',
  'Report of Supplies and Material Issued', 'Reports on Financial Related Information',
  'Reports on Health Related Information', 'Request for Action', 'Request for Approval',
  'Request for Certificate of Employment', 'Request for Certification',
  'Request for Certification of Accreditation of Health Facility', 'Request for Change of Schedule',
  'Request for Extension', 'Request for Inspection', 'Request for Medical or Financial Assistance',
  'Request for Personnel to act as Resource Person', 'Request for Posting',
  'Request for Technical Assistance', 'Requisition Issuance Slip',
  'Reschedule / Cancellation Letter', 'Research Proposal', 'Response Letter',
  'Return of Equipment', 'Risk and Opportunities Analysis (ROA)', 'Service Request Form',
  'Statement of Accounts', "Supplier's Evaluation Form", 'Terms of Reference',
  'Transmittal', 'Travel Authority', 'Travel Reimbursement', 'Travel Report',
  'Travel Request', 'Trip Ticket', 'Work and Financial Plan',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFormattedDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'invert';
  label?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-6 h-6 border-2',
  lg: 'w-9 h-9 border-[2.5px]',
};

export function Spinner({ size = 'md', variant = 'default', label }: SpinnerProps) {
  const base =
    'rounded-full animate-spin border-gray-200 ' +
    (variant === 'invert' ? 'border-t-white' : 'border-t-gray-900');
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`${sizeMap[size]} ${base} block`} role="status" aria-label={label ?? 'Loading'} />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </span>
  );
}

// ─── Processing Mini Modal ────────────────────────────────────────────────────

export interface ProcessingModalProps {
  isOpen: boolean;
  label?: string;
}

export function ProcessingModal({ isOpen, label = 'Processing...' }: ProcessingModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center gap-5 bg-white rounded-2xl shadow-2xl px-12 py-8">
        <div className="relative w-14 h-14">
          <span className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-900 animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-700 tracking-wide whitespace-nowrap">{label}</p>
      </div>
    </div>
  );
}

// ─── Category Dropdown ────────────────────────────────────────────────────────

interface CategoryDropdownProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

function CategoryDropdown({ value, onChange, disabled }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const filtered = CATEGORIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
        setIsCustom(false);
        setCustomVal('');
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  useEffect(() => {
    if (open && !isCustom) setTimeout(() => searchRef.current?.focus(), 20);
  }, [open, isCustom]);

  useEffect(() => {
    if (isCustom) setTimeout(() => customInputRef.current?.focus(), 20);
  }, [isCustom]);

  const handleSelect = (cat: string) => {
    onChange(cat);
    setOpen(false);
    setSearch('');
    setIsCustom(false);
    setCustomVal('');
  };

  const handleCustomAdd = () => {
    const trimmed = customVal.trim();
    if (trimmed) {
      onChange(trimmed);
      setOpen(false);
      setSearch('');
      setIsCustom(false);
      setCustomVal('');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-2xl text-sm transition-all ${
          open ? 'border-black' : 'border-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className="flex-1 text-left focus:outline-none"
        >
          <span className={`truncate block ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {value || 'Select category'}
          </span>
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); }}
              className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Clear selection"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((prev) => !prev)}
            className="focus:outline-none"
          >
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-3 border-b">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <ul className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className={`w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors ${
                      value === cat ? 'bg-gray-100 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-5 py-8 text-center text-sm text-gray-400">No results</li>
            )}
          </ul>

          <div className="border-t p-3">
            {!isCustom ? (
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-xl transition-colors"
              >
                <span className="text-xl leading-none">+</span> Add Custom Category
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  ref={customInputRef}
                  type="text"
                  value={customVal}
                  onChange={(e) => setCustomVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleCustomAdd(); }
                    if (e.key === 'Escape') { setIsCustom(false); setCustomVal(''); }
                  }}
                  placeholder="Custom category name..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
                <button
                  type="button"
                  onClick={handleCustomAdd}
                  disabled={!customVal.trim()}
                  className="px-6 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setIsCustom(false); setCustomVal(''); }}
                  className="px-4 border border-gray-300 text-gray-500 rounded-2xl font-medium hover:bg-gray-50"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Destination (Office) Dropdown ────────────────────────────────────────────

interface DestinationDropdownProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

function DestinationDropdown({ value, onChange, disabled }: DestinationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = OFFICES.filter(
    (o) =>
      o.acronym.toLowerCase().includes(search.toLowerCase()) ||
      o.full.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 20);
  }, [open]);

  const selected = OFFICES.find((o) => o.full === value);

  const handleSelect = (office: { acronym: string; full: string }) => {
    onChange(office.full);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <div
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-2xl text-sm transition-all ${
          open ? 'border-black' : 'border-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((p) => !p)}
          className="flex-1 text-left focus:outline-none min-w-0"
        >
          {selected ? (
            <span className="flex items-baseline gap-2 min-w-0">
              <span className="font-semibold text-gray-900 whitespace-nowrap">{selected.acronym}</span>
              <span className="text-gray-400 text-xs truncate">{selected.full}</span>
            </span>
          ) : (
            <span className="text-gray-400">Select destination office</span>
          )}
        </button>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); }}
              className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Clear"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((p) => !p)}
            className="focus:outline-none"
          >
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by acronym or name..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <ul className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((o) => (
                <li key={o.acronym}>
                  <button
                    type="button"
                    onClick={() => handleSelect(o)}
                    className={`w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors flex items-baseline gap-2 ${
                      value === o.full ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="font-semibold text-gray-900 whitespace-nowrap w-24 flex-shrink-0">{o.acronym}</span>
                    <span className="text-gray-500 text-xs">{o.full}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-5 py-8 text-center text-sm text-gray-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const { user } = useAdminAuth();
  const adminName = user?.displayName || user?.email || '';

  const [formData, setFormData] = useState<DocumentFormData>({
    controlNo: '',
    date: getFormattedDate(),
    source: '',
    category: '',
    origin: '',
    destination: '',
    encodedBy: adminName,
    subject: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        controlNo: '',
        date: getFormattedDate(),
        source: '',
        category: '',
        origin: '',
        destination: '',
        encodedBy: adminName,
        subject: '',
        notes: '',
      });
    }
  }, [isOpen, adminName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.controlNo || !formData.category || !formData.destination || !formData.subject) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await uploadDocument({ ...formData, file: undefined });
      toast.success('Document registered successfully!');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Error registering document');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ProcessingModal isOpen={loading} label="Registering document..." />

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-5 border-b flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-2xl font-semibold">New Document</h2>
              <p className="text-sm text-gray-500">Upload new document</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-3xl text-gray-400 hover:text-gray-600 leading-none disabled:opacity-40"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-visible p-6 space-y-6">
            {/* Control No + Date */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  CONTROL NO. <span className="text-red-500"></span>
                </label>
                <input
                  type="text"
                  name="controlNo"
                  value={formData.controlNo}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Date <span className="text-red-500"></span>
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Category */}
            <div className="pb-[280px] -mb-[280px]">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Category <span className="text-red-500"></span>
              </label>
              <CategoryDropdown
                value={formData.category}
                onChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
                disabled={loading}
              />
            </div>

            {/* Destination (office dropdown) + Encoded By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
              <div className="pb-[240px] -mb-[240px]">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  To (Destination) <span className="text-red-500"></span>
                </label>
                <DestinationDropdown
                  value={formData.destination}
                  onChange={(val) => setFormData((prev) => ({ ...prev, destination: val }))}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Encoded By</label>
                <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-2xl text-sm text-gray-600">
                  {formData.encodedBy}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Subject <span className="text-red-500"></span>
              </label>
              <textarea
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                rows={4}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/20 resize-y disabled:opacity-50"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3.5 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 disabled:opacity-70"
              >
                Done
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}