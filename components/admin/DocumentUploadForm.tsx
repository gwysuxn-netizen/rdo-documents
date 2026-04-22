'use client';

import { useState, useEffect } from 'react';
import { DocumentFormData } from '@/lib/types';
import { uploadDocument } from '@/lib/admin-utils';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';


// ─── Processing Overlay ───────────────────────────────────────────────────────

type ProcessingStage = 'validating' | 'uploading' | 'saving' | 'done';

const STAGE_ORDER: ProcessingStage[] = ['validating', 'uploading', 'saving', 'done'];

const STAGE_CONFIG: Record<ProcessingStage, { label: string; sub: string; progress: number }> = {
  validating: { label: 'Validating document',  sub: 'Checking required fields…',       progress: 20  },
  uploading:  { label: 'Uploading file',        sub: 'Transferring to storage…',        progress: 55  },
  saving:     { label: 'Saving record',         sub: 'Writing to the database…',        progress: 85  },
  done:       { label: 'All done!',             sub: 'Document uploaded successfully.', progress: 100 },
};

function ProcessingOverlay({ stage }: { stage: ProcessingStage }) {
  const { label, sub, progress } = STAGE_CONFIG[stage];
  const isDone = stage === 'done';
  const currentIdx = STAGE_ORDER.indexOf(stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gray-900 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-8 py-8 flex flex-col items-center text-center gap-5">
          {/* Icon / spinner */}
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
                <circle
                  className="opacity-20"
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-80"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
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
              const idx     = STAGE_ORDER.indexOf(s);
              const isPast  = idx < currentIdx;
              const isCurr  = s === stage;
              return (
                <div
                  key={s}
                  className={`rounded-full transition-all duration-300 ${
                    isCurr  ? 'w-6 h-2 bg-gray-900'
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFormattedDate(): string {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins  = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocumentUploadForm() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const adminName = user?.displayName || user?.email || '';

  const [formData, setFormData] = useState<DocumentFormData>({
    controlNo: '',
    date: getFormattedDate(),
    source: '',
    category: '',
    origin: '',
    destination: '',
    encodedBy: adminName,
    subject: '',
    notes: '',
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, encodedBy: adminName }));
  }, [adminName]);

  const [file, setFile]                       = useState<File | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.controlNo ||
      !formData.date ||
      !formData.category ||
      !formData.destination ||
      !formData.encodedBy ||
      !formData.subject
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Stage 1 — validating (brief pause so it's visible)
      setProcessingStage('validating');
      await new Promise((r) => setTimeout(r, 600));

      // Stage 2 — uploading (actual work)
      setProcessingStage('uploading');
      await uploadDocument({ ...formData, file: file || undefined });

      // Stage 3 — saving
      setProcessingStage('saving');
      await new Promise((r) => setTimeout(r, 500));

      // Stage 4 — done
      setProcessingStage('done');
      await new Promise((r) => setTimeout(r, 900));

      toast.success('Document uploaded successfully!');

      setFormData({
        controlNo: '',
        date: getFormattedDate(),
        source: '',
        category: '',
        origin: '',
        destination: '',
        encodedBy: adminName,
        subject: '',
        notes: '',
      });
      setFile(null);

      router.push('/admin/documents');
    } catch (error) {
      toast.error('Error uploading document');
      console.error(error);
    } finally {
      setLoading(false);
      setProcessingStage(null);
    }
  };

  return (
    <>
      {/* Processing overlay — rendered outside the form so it covers everything */}
      {processingStage && <ProcessingOverlay stage={processingStage} />}

      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur rounded-2xl border border-gray-300/40 p-6 sm:p-8 lg:p-10 shadow-lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Control No */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="controlNo"
              value={formData.controlNo}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 bg-white/95 border border-gray-300/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600/30 font-light text-xs sm:text-sm"
              disabled={loading}
            />
          </div>

          {/* Date */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 bg-white/95 border border-gray-300/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600/30 font-light text-xs sm:text-sm"
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 bg-white/95 border border-gray-300/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600/30 font-light text-xs sm:text-sm"
              disabled={loading}
            >
              {/* populate options here */}
            </select>
          </div>

          {/* Destination */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              To <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 bg-white/95 border border-gray-300/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600/30 font-light text-xs sm:text-sm"
              placeholder="e.g., Services"
              disabled={loading}
            />
          </div>

          {/* Encoded By */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              By <span className="text-red-500">*</span>
            </label>
            <div className="w-full px-3 sm:px-4 py-2 bg-gray-50/80 border border-gray-300/40 rounded-lg font-light text-xs sm:text-sm text-gray-700 flex items-center">
              {formData.encodedBy || 'Loading...'}
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
            Subject <span className="text-red-500">*</span>
          </label>
          <textarea
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full px-3 sm:px-4 py-2 bg-white/95 border border-gray-300/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600/30 resize-none font-light text-xs sm:text-sm"
            rows={2}
            placeholder="Document subject..."
            disabled={loading}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Upload Document
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-white/95 border border-gray-300/40 text-gray-900 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}