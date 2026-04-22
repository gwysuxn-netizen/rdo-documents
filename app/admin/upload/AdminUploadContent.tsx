'use client';

import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AdminUploadContent() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to documents page where upload modal is available
      router.push('/admin/documents');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600 font-light text-sm">Redirecting...</p>
    </div>
  );
}
