'use client';

import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { AdminSearchAndFilter } from '@/components/admin/AdminSearchAndFilter';
import { AdminDocumentTable } from '@/components/admin/AdminDocumentTable';
import { useState, useEffect } from 'react';
import { Document, DocumentStatus } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

export function AdminDocumentsContent() {
  const { user, loading: authLoading } = useAdminAuth();
  const { documents, loading: docsLoading } = useDocuments();
  const searchParams = useSearchParams();
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documents);
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

  // Get breadcrumb label based on current filter
  const getBreadcrumbLabel = () => {
    switch (statusFilter) {
      case 'FOR_PICKUP':
        return 'Ready for Pickup';
      case 'RECEIVED':
        return 'Received';
      default:
        return 'All';
    }
  };

  // Update filtered documents when documents or status filter change
  useEffect(() => {
    let filtered = documents;
    if (statusFilter !== 'ALL') {
      filtered = documents.filter((doc) => doc.status === statusFilter);
    }
    setFilteredDocuments(filtered);
  }, [documents, statusFilter]);

  if (authLoading || docsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 font-light text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout
      userEmail={user.email || 'Admin User'}
      showSearch={true}
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/admin/dashboard' },
          { label: getBreadcrumbLabel() },
        ]}
      />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-gray-900 mb-2">Documents</h1>
        <p className="text-sm font-light text-gray-600">Manage and track documents</p>
      </div>

      {/* Search and Filter */}
      <AdminSearchAndFilter
        documents={documents}
        onFilter={(filtered) => setFilteredDocuments(filtered)}
        initialStatus={statusFilter}
      />

      {/* Document Table */}
      <AdminDocumentTable
        documents={filteredDocuments}
        allDocuments={documents}
        onDocumentUpdate={() => {
          setFilteredDocuments(documents);
        }}
      />
    </AdminLayout>
  );
}
