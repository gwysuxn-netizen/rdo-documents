'use client';

import { Document } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

interface AdminSearchAndFilterProps {
  documents: Document[];
  onFilter: (filtered: Document[]) => void;
  initialStatus?: 'ALL' | 'FOR_PICKUP' | 'RECEIVED';
}

export function AdminSearchAndFilter({
  documents,
  onFilter,
  initialStatus = 'ALL',
}: AdminSearchAndFilterProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FOR_PICKUP' | 'RECEIVED'>(
    initialStatus
  );
  const [officeFilter, setOfficeFilter] = useState('');
  const [officeDropdownOpen, setOfficeDropdownOpen] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  const officeButtonRef = useRef<HTMLButtonElement>(null);

  // ✅ Only show offices that exist under the current status tab
  const statusFilteredDocs =
    statusFilter === 'ALL'
      ? documents
      : documents.filter((doc) => doc.status === statusFilter);

  const uniqueOffices = Array.from(new Set(statusFilteredDocs.map((doc) => doc.destination)))
    .filter((office) => office && office.trim())
    .sort();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        officeButtonRef.current &&
        !officeButtonRef.current.contains(event.target as Node)
      ) {
        const dropdown = document.getElementById('office-dropdown-portal');
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOfficeDropdownOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recalculate position on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (officeDropdownOpen && officeButtonRef.current) {
        const rect = officeButtonRef.current.getBoundingClientRect();
        setDropdownCoords({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: Math.max(rect.width, 250),
        });
      }
    };
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [officeDropdownOpen]);

  // ✅ Reset office filter when status tab or documents change
 useEffect(() => {
  setStatusFilter(initialStatus);
  setOfficeFilter(''); // ← add this
  applyFilter(search, initialStatus, '', documents);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialStatus, documents]);

  const applyFilter = (
    searchTerm: string,
    status: 'ALL' | 'FOR_PICKUP' | 'RECEIVED',
    office: string,
    docs: Document[]
  ) => {
    let filtered = docs;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.controlNo.toLowerCase().includes(term) ||
          doc.subject.toLowerCase().includes(term) ||
          doc.destination.toLowerCase().includes(term) ||
          (doc.receivedBy ?? '').toLowerCase().includes(term)
      );
    }
    if (status !== 'ALL') {
      filtered = filtered.filter((doc) => doc.status === status);
    }
    if (office) {
      filtered = filtered.filter((doc) => doc.destination === office);
    }
    onFilter(filtered);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilter(value, statusFilter, officeFilter, documents);
  };

  // ✅ Reset office filter when switching status tabs
  const handleStatusFilter = (status: 'ALL' | 'FOR_PICKUP' | 'RECEIVED') => {
  setStatusFilter(status);
  setOfficeFilter(''); // ← add this
  applyFilter(search, status, '', documents); // ← pass empty office
  if (status === 'ALL') {
    router.push('/admin/documents');
  } else {
    router.push(`/admin/documents?status=${status}`);
  }
};

  const handleOfficeFilter = (office: string) => {
    setOfficeFilter(office);
    applyFilter(search, statusFilter, office, documents);
    setOfficeDropdownOpen(false);
  };

  const handleOpenDropdown = () => {
    if (officeButtonRef.current) {
      const rect = officeButtonRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 250),
      });
    }
    setOfficeDropdownOpen((prev) => !prev);
  };

  const counts = {
    ALL: documents.length,
    FOR_PICKUP: documents.filter((d) => d.status === 'FOR_PICKUP').length,
    RECEIVED: documents.filter((d) => d.status === 'RECEIVED').length,
  };

  const tabClass = (tab: 'ALL' | 'FOR_PICKUP' | 'RECEIVED') =>
    `px-4 py-2 rounded-lg font-light text-sm transition-all ${
      statusFilter === tab
        ? 'bg-gray-900 text-white shadow-sm'
        : 'bg-white/40 backdrop-blur border border-white/30 text-gray-600 hover:bg-white/50'
    }`;

  const dropdownPortal =
    officeDropdownOpen && typeof window !== 'undefined'
      ? createPortal(
          <div
            id="office-dropdown-portal"
            style={{
              position: 'absolute',
              top: dropdownCoords.top,
              left: dropdownCoords.left,
              minWidth: dropdownCoords.width,
              zIndex: 99999,
            }}
            className="bg-white border border-gray-300 rounded-lg shadow-2xl max-w-sm"
          >
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
              <button
                onClick={() => handleOfficeFilter('')}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-all font-light ${
                  !officeFilter
                    ? 'bg-gray-900 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Offices ({statusFilteredDocs.length})
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {uniqueOffices.map((office) => {
                const officeCount = statusFilteredDocs.filter(
                  (doc) => doc.destination === office
                ).length;
                return (
                  <button
                    key={office}
                    onClick={() => handleOfficeFilter(office)}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-all flex justify-between items-center ${
                      officeFilter === office
                        ? 'bg-gray-100 text-gray-900 font-medium border-l-2 border-gray-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex-1 truncate">{office}</span>
                    <span
                      className={`text-xs ml-2 flex-shrink-0 ${
                        officeFilter === office ? 'font-semibold text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {officeCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/40 p-4 mb-6">
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by control no., subject, destination, or receiver..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 bg-white/50 backdrop-blur border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 font-light text-sm"
        />
      </div>

      {/* Filter tabs and office filter */}
      <div className="flex gap-2 flex-wrap items-center">
        <button onClick={() => handleStatusFilter('ALL')} className={tabClass('ALL')}>
          All ({counts.ALL})
        </button>
        <button onClick={() => handleStatusFilter('FOR_PICKUP')} className={tabClass('FOR_PICKUP')}>
          Ready for Pickup ({counts.FOR_PICKUP})
        </button>
        <button onClick={() => handleStatusFilter('RECEIVED')} className={tabClass('RECEIVED')}>
          Received ({counts.RECEIVED})
        </button>

        {/* ✅ Office filter button — only shown when offices exist for the current status */}
        {uniqueOffices.length > 0 && (
          <>
            <button
              ref={officeButtonRef}
              onClick={handleOpenDropdown}
              className={`px-3 py-2 rounded-lg font-light text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                officeFilter
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white/40 backdrop-blur border border-white/30 text-gray-600 hover:bg-white/50'
              }`}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                />
              </svg>
              <span className="hidden sm:inline max-w-[200px] truncate">
                {officeFilter ? officeFilter : 'By Office'}
              </span>
              <span className="sm:hidden">Office</span>
            </button>

            {/* Clear Filter — only shown when an office is selected */}
            {officeFilter && (
              <button
                onClick={() => handleOfficeFilter('')}
                className="px-3 py-2 rounded-lg font-light text-sm transition-all flex items-center gap-1.5 whitespace-nowrap bg-white/40 backdrop-blur border border-white/30 text-gray-600 hover:bg-white/50"
              >
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filter
              </button>
            )}
          </>
        )}
      </div>

      {/* Portal-rendered dropdown */}
      {dropdownPortal}
    </div>
  );
}