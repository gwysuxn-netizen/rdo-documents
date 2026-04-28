'use client';

import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { AdminSearchAndFilter } from '@/components/admin/AdminSearchAndFilter';
import { AdminDocumentTable } from '@/components/admin/AdminDocumentTable';
import { useState, useEffect } from 'react';
import { Document } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

export function AdminDocumentsContent() {
  const { user, loading: authLoading } = useAdminAuth();
  const { documents, loading: docsLoading } = useDocuments();
  const searchParams = useSearchParams();
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FOR_PICKUP' | 'RECEIVED'>('ALL');

  // Initialize status filter from URL params
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam === 'FOR_PICKUP' || statusParam === 'RECEIVED') {
      setStatusFilter(statusParam);
    } else {
      setStatusFilter('ALL');
    }
  }, [searchParams]);

  // ✅ REMOVED: the useEffect([documents]) that was overwriting filteredDocuments.
  // AdminSearchAndFilter owns all filtering via its own internal useEffect([documents]).

  const getBreadcrumbLabel = () => {
    switch (statusFilter) {
      case 'FOR_PICKUP': return 'Ready for Pickup';
      case 'RECEIVED':   return 'Received';
      default:           return 'All';
    }
  };

  if (authLoading || docsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 font-light text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AdminLayout userEmail={user.email || 'Admin User'} showSearch={true}>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/admin/dashboard' },
          { label: getBreadcrumbLabel() },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-light text-gray-900 mb-2">Documents</h1>
        <p className="text-sm font-light text-gray-600">Manage and track documents</p>
      </div>

      <AdminSearchAndFilter
        documents={documents}
        onFilter={setFilteredDocuments}
        initialStatus={statusFilter}
      />

      {/* ✅ onDocumentUpdate is a no-op — Firebase listener handles updates automatically */}
      <AdminDocumentTable
        documents={filteredDocuments}
        allDocuments={documents}
        activeTab={statusFilter}
        onDocumentUpdate={() => {}}
      />
    </AdminLayout>
  );
}