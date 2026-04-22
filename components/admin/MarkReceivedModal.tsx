'use client';

import { Document } from '@/lib/types';
import { markDocumentReceived } from '@/lib/admin-utils';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

interface MarkReceivedModalProps {
  document: Document;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Processing Overlay ───────────────────────────────────────────────────────

type ProcessingStage = 'saving' | 'done';

const STAGE_ORDER: ProcessingStage[] = ['saving', 'done'];

const STAGE_CONFIG: Record<ProcessingStage, { label: string; sub: string; progress: number }> = {
  saving: { label: 'Saving record', sub: 'Marking document as received…', progress: 60  },
  done:   { label: 'All done!',     sub: 'Document marked as received.',  progress: 100 },
};

function ProcessingOverlay({ stage }: { stage: ProcessingStage }) {
  const { label, sub, progress } = STAGE_CONFIG[stage];
  const isDone     = stage === 'done';
  const currentIdx = STAGE_ORDER.indexOf(stage);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gray-900 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-8 py-8 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isDone ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            {isDone ? (
              <svg
                className="w-7 h-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-gray-700 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
          </div>

          {/* Labels */}
          <div>
            <p className="text-base font-semibold text-gray-900 leading-snug">{label}</p>
            <p className="text-sm text-gray-400 font-light mt-1">{sub}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {STAGE_ORDER.map((s) => {
              const idx    = STAGE_ORDER.indexOf(s);
              const isPast = idx < currentIdx;
              const isCurr = s === stage;
              return (
                <div
                  key={s}
                  className={`rounded-full transition-all duration-300 ${
                    isCurr   ? 'w-6 h-2 bg-gray-900'
                    : isPast ? 'w-2 h-2 bg-gray-400'
                             : 'w-2 h-2 bg-gray-200'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MarkReceivedModal({ document, onClose, onSuccess }: MarkReceivedModalProps) {
  const [receivedBy, setReceivedBy]             = useState('');
  const [notes, setNotes]                       = useState('');
  const [loading, setLoading]                   = useState(false);
  const [receivedDateTime, setReceivedDateTime] = useState('');
  const [processingStage, setProcessingStage]   = useState<ProcessingStage | null>(null);

  useEffect(() => {
    const now = new Date();
    setReceivedDateTime(
      now.toLocaleString('en-US', {
        year:   'numeric',
        month:  '2-digit',
        day:    '2-digit',
        hour:   '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receivedBy.trim()) {
      toast.error('Please enter recipient name');
      return;
    }

    setLoading(true);
    try {
      // Stage 1 — saving (actual API call)
      setProcessingStage('saving');
      await markDocumentReceived(document.id, receivedBy.trim(), notes, receivedDateTime);

      // Stage 2 — done; show animation before handing control back to parent
      setProcessingStage('done');
      await new Promise((r) => setTimeout(r, 1200));

      toast.success('Document marked as received');
      // onSuccess() calls addReceivedIds() + closes the modal in the parent.
      // The parent's useEffect will trigger onDocumentUpdate() after 2 s.
      onSuccess();
    } catch (error) {
      toast.error('Error marking document as received');
      console.error(error);
      setProcessingStage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg border border-gray-400 shadow-lg max-w-md w-full">
          <div className="border-b border-gray-400 px-6 py-4 bg-gray-800">
            <h2 className="text-lg font-light text-white">Mark Received</h2>
            <p className="text-xs text-gray-300 mt-1 font-mono">{document.controlNo}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
                Date &amp; Time Received
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-900">
                {receivedDateTime}
              </div>
            </div>

            <div>
              <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
                Receiver
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 font-light text-sm"
                placeholder="Name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none font-light text-sm"
                placeholder="Add notes..."
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-white border border-gray-400 text-gray-900 rounded-lg hover:bg-gray-50 font-light disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-light disabled:opacity-50 transition-all"
              >
                Done
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Processing overlay — rendered AFTER the modal so it sits on top */}
      {processingStage && <ProcessingOverlay stage={processingStage} />}
    </>
  );
}