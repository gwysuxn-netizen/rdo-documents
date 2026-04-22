'use client';

import { useRouter } from 'next/navigation';
import { logoutAdmin } from '@/lib/admin-utils';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface HeaderProps {
  userEmail?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function Header({ userEmail, showSearch = false, onSearch }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      toast.success('Logged out');
      router.push('/admin');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="bg-gradient-to-r from-gray-50 to-gray-50/50 backdrop-blur-xl border-b border-gray-200/50 px-8 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-black to-gray-900 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-gray-900">RD's Office Queuing System</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Department of Health • Western Visayas Regional Director IV</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showSearch && onSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="px-4 py-2.5 rounded-lg bg-white/70 backdrop-blur border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent w-64 font-medium text-sm"
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">🔍</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
