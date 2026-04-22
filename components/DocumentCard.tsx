'use client';

import { Document } from '@/lib/types';
import { useState } from 'react';
import { DocumentModal } from '@/components/DocumentModal';

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const [showModal, setShowModal] = useState(false);

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <div className="bg-white/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-gray-300/40 overflow-hidden hover:bg-white/60 hover:shadow-lg hover:border-gray-400/60 transition-all duration-200 aspect-square flex flex-col">
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          {/* Status Badge */}
          <div className="mb-3 flex justify-between items-start">
            <span
              className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-light ${
                document.status === 'FOR_PICKUP'
                  ? 'bg-amber-100/60 text-amber-700 backdrop-blur'
                  : 'bg-green-100/60 text-green-700 backdrop-blur'
              }`}
            >
              {document.status === 'FOR_PICKUP' ? 'Ready for Pickup' : 'Received'}
            </span>
          </div>

          {/* Control No */}
          <div className="mb-2 pb-2 border-b-2 border-gray-300/30">
            <p className="text-xs text-gray-600 font-light uppercase tracking-wider">CONTROL NO.</p>
            <p className="font-mono font-light text-gray-900 text-xs truncate">{document.controlNo}</p>
          </div>

          {/* Date */}
          <div className="mb-2 pb-2 border-b-2 border-gray-300/30">
            <p className="text-xs text-gray-600 font-light uppercase tracking-wider">Date</p>
            <p className="text-xs text-gray-700 font-light">{document.date}</p>
          </div>

          {/* Subject */}
          <div className="mb-2 pb-2 border-b-2 border-gray-300/30 flex-1">
            <p className="text-xs text-gray-600 font-light uppercase tracking-wider">Subject</p>
            <p className="text-xs text-gray-700 font-light line-clamp-2">{truncateText(document.subject, 40)}</p>
          </div>

          {/* Destination */}
          <div className="mb-3 border-b-2 border-gray-300/30 pb-3">
            <p className="text-xs text-gray-600 font-light uppercase tracking-wider">Destination</p>
            <p className="text-xs text-gray-700 font-light truncate">{document.destination}</p>
          </div>

          {/* View Details Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white/60 backdrop-blur border-2 border-gray-300/40 text-gray-900 rounded-lg hover:bg-white/80 hover:border-gray-400/60 transition-all text-xs sm:text-sm font-light mt-auto"
          >
            View Details
          </button>
        </div>
      </div>

      {showModal && (
        <DocumentModal document={document} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
