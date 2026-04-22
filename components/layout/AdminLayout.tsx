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
    <div className="flex h-screen bg-white/20 backdrop-blur-xl relative">
      {/* Radial gradient atmosphere backdrop */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            150% 150% at 35% 35%,
            rgba(0, 0, 0, 0.08) 0%,
            rgba(0, 0, 0, 0.04) 35%,
            rgba(0, 0, 0, 0.02) 100%
          )`
        }}
      />
      <Sidebar onUploadClick={() => setIsUploadModalOpen(true)} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header
          userEmail={userEmail}
          showSearch={showSearch}
          onSearch={onSearch}
        />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
