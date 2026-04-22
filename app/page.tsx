'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DocumentBoardContent } from '@/app/DocumentBoardContent';
import { useUserAuth } from '@/lib/hooks/useUserAuth';

export default function Home() {
  const { user, loading } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white/20 backdrop-blur-xl flex items-center justify-center">
        <p className="text-gray-600 font-light">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PublicLayout>
      <DocumentBoardContent />
    </PublicLayout>
  );
}
