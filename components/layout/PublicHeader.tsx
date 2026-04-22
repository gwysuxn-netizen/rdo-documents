'use client';

import Link from 'next/link';

export function PublicHeader() {
  return (
    <header className="bg-gradient-to-b from-gray-50/80 to-white/60 backdrop-blur-xl border-b border-gray-200/50">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-black to-gray-900 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Document Pickup</h1>
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">RDO Western Visayas</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-sm font-light text-gray-700 hover:text-black transition-colors"
            >
              Documents
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
