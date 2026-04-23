'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { UploadModal } from '@/components/admin/UploadModal';
import { logoutAdmin } from '@/lib/admin-utils';

interface AdminLayoutProps {
  children: ReactNode;
  userEmail?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function AdminLayout({
  children,
  userEmail,
  showSearch = false,
  onSearch,
}: AdminLayoutProps) {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      router.push('/admin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-white/20 backdrop-blur-xl relative overflow-hidden">
      {/* Atmosphere backdrop */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            150% 150% at 35% 35%,
            rgba(0, 0, 0, 0.08) 0%,
            rgba(0, 0, 0, 0.04) 35%,
            rgba(0, 0, 0, 0.02) 100%
          )`,
        }}
      />

      {/* Sidebar (renders its own mobile top bar + desktop persistent sidebar) */}
      <Sidebar onUploadClick={() => setIsUploadModalOpen(true)} onLogout={handleLogout} />

      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        {/* Desktop header (hidden on mobile — Sidebar top bar handles mobile) */}
        <Header userEmail={userEmail} showSearch={showSearch} onSearch={onSearch} />

        {/*
          pt-14: clears the fixed 56px mobile top bar from Sidebar (visible on < lg)
          lg:pt-0: no extra padding on desktop since Header is shown there instead
        */}
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="px-4 sm:px-6 xl:px-8 py-5 sm:py-6">
            {children}
          </div>
        </main>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}