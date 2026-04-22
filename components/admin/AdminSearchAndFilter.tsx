'use client';

import { Document } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FOR_PICKUP' | 'RECEIVED'>(
    initialStatus
  );

  useEffect(() => {
    setStatusFilter(initialStatus);
    applyFilter(search, initialStatus, documents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus, documents]);

  const applyFilter = (
    searchTerm: string,
    status: 'ALL' | 'FOR_PICKUP' | 'RECEIVED',
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

    onFilter(filtered);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilter(value, statusFilter, documents);
  };

  const handleStatusFilter = (status: 'ALL' | 'FOR_PICKUP' | 'RECEIVED') => {
    setStatusFilter(status);
    applyFilter(search, status, documents);
    
    // Update URL to reflect the selected filter
    if (status === 'ALL') {
      router.push('/admin/documents');
    } else {
      router.push(`/admin/documents?status=${status}`);
    }
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

  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/40 p-4 mb-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by control no., subject, destination, or receiver..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-2 bg-white/50 backdrop-blur border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 font-light text-sm"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => handleStatusFilter('ALL')} className={tabClass('ALL')}>
          All ({counts.ALL})
        </button>
        <button onClick={() => handleStatusFilter('FOR_PICKUP')} className={tabClass('FOR_PICKUP')}>
          Ready for Pickup ({counts.FOR_PICKUP})
        </button>
        <button onClick={() => handleStatusFilter('RECEIVED')} className={tabClass('RECEIVED')}>
          Received ({counts.RECEIVED})
        </button>
      </div>
    </div>
  );
}