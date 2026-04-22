'use client';

import { ReactNode, useState } from 'react';
import { useUserAuth } from '@/lib/hooks/useUserAuth';
import { logoutUser } from '@/lib/user-utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface PublicLayoutProps {
  children: ReactNode;
}

function LogoutConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/60 w-full max-w-sm mx-4 overflow-hidden animate-[fadeSlideUp_0.2s_ease-out]">
        <div className="h-1 w-full bg-gradient-to-r from-gray-800 to-black" />

        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>

          <h2 id="logout-modal-title" className="text-center text-lg font-bold text-gray-900 mb-1">
            Confirm Logout
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Are you sure you want to log out of your session?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              type="button"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all duration-150"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              type="button"
              className="flex-1 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 active:scale-95 transition-all duration-150 shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { user } = useUserAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    setLoggingOut(true);
    try {
      await logoutUser();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <div className="flex flex-col h-screen overflow-hidden relative z-10">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-black flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold tracking-wide text-gray-900 truncate">Document Pickup Board</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5 truncate">RDO Western Visayas Regional Director IV</p>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-gray-700">{user.displayName || user.email}</p>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  disabled={loggingOut}
                  className="px-3 sm:px-4 py-1.5 sm:py-2.5 bg-black hover:bg-gray-900 text-white rounded-lg font-light text-xs sm:text-sm transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}