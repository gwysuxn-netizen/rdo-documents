'use client';

import { Document } from '@/lib/types';

interface DocumentTrackingFormProps {
  document: Document;
}

export function DocumentTrackingForm({ document }: DocumentTrackingFormProps) {
  const receivedDate = document.receivedAt
    ? new Date(document.receivedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null;

  return (
    <div className="bg-white rounded-lg border border-gray-400">
      {/* Header */}
      <div className="border-b border-gray-400 bg-gray-800 px-4 py-3">
        <h2 className="font-light text-center text-xs uppercase tracking-wider text-white">Document Tracking</h2>
      </div>

      {/* Responsive Grid Layout */}
      <div className="space-y-0">
        {/* Row 1: Control No & Date */}
        <div className="grid grid-cols-2 gap-0 border-b border-gray-300">
          <div className="border-r border-gray-300 px-4 py-3">
            <div className="font-light text-xs text-gray-600 uppercase tracking-wider">No</div>
            <div className="mt-1 font-mono font-light text-gray-900 text-xs sm:text-sm truncate">{document.controlNo}</div>
          </div>
          <div className="px-4 py-3">
            <div className="font-light text-xs text-gray-600 uppercase tracking-wider">Date</div>
            <div className="mt-1 font-light text-gray-900 text-xs sm:text-sm">{document.date}</div>
          </div>
        </div>

        {/* Row 2: Category & Destination */}
        <div className="grid grid-cols-2 gap-0 border-b border-gray-300">
          <div className="border-r border-gray-300 px-4 py-3">
            <div className="font-light text-xs text-gray-600 uppercase tracking-wider">Type</div>
            <div className="mt-1 font-light text-gray-900 text-xs sm:text-sm truncate">{document.category}</div>
          </div>
          <div className="px-4 py-3">
            <div className="font-light text-xs text-gray-600 uppercase tracking-wider">To</div>
            <div className="mt-1 font-light text-gray-900 text-xs sm:text-sm truncate">{document.destination}</div>
          </div>
        </div>

        {/* Row 3: Encoded By */}
        <div className="border-b border-gray-300 px-4 py-3">
          <div className="font-light text-xs text-gray-600 uppercase tracking-wider">By</div>
          <div className="mt-1 font-light text-gray-900 text-xs sm:text-sm">{document.encodedBy}</div>
        </div>

        {/* Row 4: Subject */}
        <div className="border-b border-gray-300 px-4 py-3">
          <div className="font-light text-xs text-gray-600 uppercase tracking-wider">Subject</div>
          <div className="mt-1 whitespace-pre-wrap font-light text-gray-900 text-xs sm:text-sm">{document.subject}</div>
        </div>

        {/* Row 5: Status & Received Info */}
        <div className="border-t border-gray-300 px-4 py-3 bg-gray-50">
          <div className="mb-2">
            <span className="font-light text-xs text-gray-600 uppercase tracking-wider">Status: </span>
            <span
              className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-light text-xs border ${
                document.status === 'FOR_PICKUP'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-green-100 text-green-700 border-green-300'
              }`}
            >
              {document.status === 'FOR_PICKUP' ? 'Ready for Pickup' : 'Received'}
            </span>
          </div>
          {document.status === 'RECEIVED' && document.receivedBy && receivedDate && (
            <div className="mt-2 text-xs sm:text-sm font-light text-green-700">
              ✓ Received by {document.receivedBy} on {receivedDate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
