'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface BatchMarkReceivedModalProps {
  documentCount: number;
  onClose: () => void;
  onConfirm: (receivedBy: string, notes: string) => void;
}

export function BatchMarkReceivedModal({ documentCount, onClose, onConfirm }: BatchMarkReceivedModalProps) {
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receivedBy.trim()) {
      toast.error('Please enter recipient name');
      return;
    }

    setLoading(true);
    try {
      onConfirm(receivedBy, notes);
    } catch (error) {
      toast.error('Error processing batch mark');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg border border-gray-400 shadow-lg max-w-md w-full">
        <div className="border-b border-gray-400 px-6 py-4 bg-gray-800">
          <h2 className="text-lg font-light text-white">Mark Documents Received</h2>
          <p className="text-xs text-gray-300 mt-1 font-light">{documentCount} document(s) selected</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-light text-gray-600 mb-2 uppercase tracking-wider">
              Receiver *
            </label>
            <input
              type="text"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 font-light text-sm"
              placeholder="Name"
              disabled={loading}
              autoFocus
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
              className="flex-1 px-4 py-2 bg-white border border-gray-400 text-gray-900 rounded-lg hover:bg-gray-50 font-light disabled:opacity-50 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-light disabled:opacity-50 transition-all"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
