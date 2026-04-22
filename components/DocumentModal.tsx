'use client';

import { Document } from '@/lib/types';
import { useEffect } from 'react';

interface DocumentModalProps {
  document: Document;
  onClose: () => void;
  isAdminView?: boolean;
}

export function DocumentModal({ document, onClose, isAdminView = false }: DocumentModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const isPickup = document.status === 'FOR_PICKUP';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl border border-gray-200/80">

        {/* Header */}
        <div className="px-7 pt-6 pb-5 flex justify-between items-start border-b border-gray-100">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">CONTROL NO.</p>
            <p className="text-lg font-medium text-gray-900 font-mono">{document.controlNo}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className={`text-[11px] px-3 py-1 rounded-full tracking-wide ${
                isPickup
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {isPickup ? 'Ready for pickup' : 'Received'}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors text-base leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-5">

          {/* Subject */}
          <p className="text-sm text-gray-800 leading-relaxed">{document.subject}</p>

          {/* Meta grid - Date & Encoded By */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {[
              { label: 'Date', value: document.date },
              { label: 'Encoded by', value: document.encodedBy || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <p className="text-[13px] font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Type */}
          <div className="border border-gray-100 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Type</p>
            <p className="text-[13px] font-medium text-gray-900">{document.category || '—'}</p>
          </div>

          {/* Received By / Received At — only shown when RECEIVED */}
          {!isPickup && (
            <div className="grid grid-cols-2 divide-x divide-gray-100 border border-gray-100 bg-gray-50/40 rounded-xl overflow-hidden">
              <div className="px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Received By</p>
                <p className="text-[13px] font-medium text-gray-900">{document.receivedBy || '—'}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Received At</p>
                <p className="text-[13px] font-medium text-gray-900">
                  {document.receivedAt
                    ? new Date(document.receivedAt).toLocaleString()
                    : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {document.notes && (
            <div className="border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Notes</p>
              <p className="text-[13px] text-gray-500 leading-relaxed whitespace-pre-wrap">{document.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {document.fileURL && (
              <button
                onClick={() => window.open(document.fileURL, '_blank')}
                className="flex-1 py-2.5 text-[13px] text-gray-500 border border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-700 transition-colors"
              >
                View attachment
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-[13px] font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}