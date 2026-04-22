'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ProcessingModal } from '@/components/admin/UploadModal';

interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <rect x="3" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="3" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="14" width="7" height="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Upload',
    href: '/admin/upload',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
    ),
  },
  {
    label: 'Documents',
    href: '/admin/documents',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    children: [
      { label: 'All', href: '/admin/documents', icon: <></> },
      { label: 'Ready for Pickup', href: '/admin/documents?status=FOR_PICKUP', icon: <></> },
      { label: 'Received', href: '/admin/documents?status=RECEIVED', icon: <></> },
    ],
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

function LogoutIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

// ── Logout Confirmation Modal ────────────────────────────────────────────────
interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function LogoutConfirmModal({ isOpen, onConfirm, onCancel }: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/60 w-full max-w-sm mx-4 overflow-hidden animate-[fadeSlideUp_0.2s_ease-out]">
        {/* Top accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-gray-800 to-black" />

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mx-auto mb-4">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>

          {/* Text */}
          <h2
            id="logout-modal-title"
            className="text-center text-lg font-bold text-gray-900 mb-1"
          >
            Confirm Logout
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Are you sure you want to log out of your session?
          </p>

          {/* Actions */}
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

      {/* Keyframe animation — injected via a style tag so no Tailwind config needed */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
      `}</style>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  onUploadClick?: () => void;
  onLogout?: () => Promise<void> | void;
}

export function Sidebar({ onUploadClick, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Documents']);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isItemActive = (href?: string): boolean => {
    if (!href || href === '#') return false;
    const [hrefPath, hrefQuery] = href.split('?');
    if (!hrefQuery) {
      if (pathname !== hrefPath) return false;
      return searchParams.toString() === '';
    }
    if (pathname !== hrefPath) return false;
    const hrefParams = new URLSearchParams(hrefQuery);
    for (const [key, value] of Array.from(hrefParams.entries())) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  };

  const isItemOrChildActive = (item: SidebarItem): boolean => {
    if (item.children?.length) {
      return item.children.some((child) => isItemActive(child.href));
    }
    return isItemActive(item.href);
  };

  // Step 1 — open confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // Step 2 — user confirmed → actually log out
  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    if (!onLogout) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  };

  // User cancelled
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Logout confirmation modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {/* Processing mini modal — shown during actual logout */}
      <ProcessingModal isOpen={loggingOut} label="Logging out..." />

      <aside
        className={`flex flex-col h-screen bg-gradient-to-b from-gray-50/80 to-white/60 backdrop-blur-xl border-r border-gray-200/50 text-gray-900 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo / Header */}
        <div className="p-6 border-b border-gray-200/30 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold tracking-wide text-gray-900">DOH WV CHD</h1>
                <p className="text-[10px] text-gray-500 font-medium">Queuing System</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-200/50 rounded-lg transition-colors flex-shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4" aria-label="Main navigation">
          <ul className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {sidebarItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isParentActive = isItemOrChildActive(item);
              const isExpanded = expandedItems.includes(item.label);

              const parentStyle = (() => {
                if (isParentActive && !hasChildren) return 'bg-black text-white shadow-md';
                if (isParentActive && hasChildren) return 'bg-gray-200 text-black';
                return 'text-gray-600 hover:bg-gray-100 hover:text-black';
              })();

              const itemClasses = [
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 w-full text-left',
                parentStyle,
                isCollapsed ? 'justify-center' : '',
              ]
                .filter(Boolean)
                .join(' ');

              const itemInner = (
                <>
                  <span className={`flex-shrink-0 opacity-90 ${isParentActive && !hasChildren ? 'text-white' : 'text-black'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {hasChildren && (
                        <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      )}
                      {isParentActive && !hasChildren && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" aria-hidden="true" />
                      )}
                    </>
                  )}
                </>
              );

              return (
                <li key={item.label}>
                  {hasChildren ? (
                    <button className={itemClasses} onClick={() => toggleExpand(item.label)} aria-expanded={isExpanded} aria-controls={`submenu-${item.label}`}>
                      {itemInner}
                    </button>
                  ) : item.label === 'Upload' ? (
                    <button className={itemClasses} onClick={onUploadClick} type="button">
                      {itemInner}
                    </button>
                  ) : (
                    <Link href={item.href!}>
                      <div className={itemClasses}>{itemInner}</div>
                    </Link>
                  )}

                  {hasChildren && !isCollapsed && isExpanded && (
                    <ul id={`submenu-${item.label}`} className="mt-1 ml-4 space-y-1 border-l border-gray-300/50 pl-3" role="list">
                      {item.children!.map((child) => {
                        const childActive = isItemActive(child.href);
                        return (
                          <li key={child.label}>
                            <Link href={child.href!}>
                              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${childActive ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" aria-hidden="true" />
                                {child.label}
                                {childActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" aria-hidden="true" />}
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200/30 p-3 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gray-600">RD</span>
              </div>
              <div className="text-xs min-w-0">
                <p className="font-medium text-gray-900 truncate">Regional Director IV</p>
                <p className="text-gray-500 font-normal truncate">Department of Health</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogoutClick}
            disabled={loggingOut}
            type="button"
            title="Logout"
            aria-label="Logout"
            className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium bg-black text-white hover:bg-gray-800 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogoutIcon />
            {!isCollapsed && <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}