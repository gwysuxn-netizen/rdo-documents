'use client';

import { Document } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { DocumentModal } from '@/components/DocumentModal';
import { MarkReceivedModal } from '@/components/admin/MarkReceivedModal';
import { BatchMarkReceivedModal } from '@/components/admin/BatchMarkReceivedModal';
import { UploadModal } from '@/components/admin/UploadModal';
import { deleteDoc, markDocumentReceived } from '@/lib/admin-utils';
import toast from 'react-hot-toast';

interface AdminDocumentTableProps {
  documents: Document[];
  onDocumentUpdate: () => void;
  activeTab?: 'ALL' | 'FOR_PICKUP' | 'RECEIVED';
}

function formatReceivedAt(receivedAt?: number | null): string {
  if (!receivedAt) return '—';
  return new Date(receivedAt).toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
}

// ─── Delete Processing Overlay ────────────────────────────────────────────────

type DeleteStage = 'deleting' | 'done';
const DELETE_STAGE_ORDER: DeleteStage[] = ['deleting', 'done'];
const DELETE_STAGE_CONFIG: Record<DeleteStage, { label: string; sub: string; progress: number }> = {
  deleting: { label: 'Deleting document', sub: 'Removing from the database…',    progress: 55  },
  done:     { label: 'Deleted',           sub: 'Document removed successfully.', progress: 100 },
};

function DeleteProcessingOverlay({ stage }: { stage: DeleteStage }) {
  const { label, sub, progress } = DELETE_STAGE_CONFIG[stage];
  const isDone     = stage === 'done';
  const currentIdx = DELETE_STAGE_ORDER.indexOf(stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-gray-100 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="px-8 py-8 flex flex-col items-center text-center gap-5">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300 ${isDone ? 'bg-red-50' : 'bg-gray-50'}`}>
            {isDone ? (
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-gray-700 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 leading-snug">{label}</p>
            <p className="text-sm text-gray-400 font-light mt-1">{sub}</p>
          </div>
          <div className="flex items-center gap-2">
            {DELETE_STAGE_ORDER.map((s) => {
              const idx    = DELETE_STAGE_ORDER.indexOf(s);
              const isPast = idx < currentIdx;
              const isCurr = s === stage;
              return (
                <div key={s} className={`rounded-full transition-all duration-300 ${isCurr ? 'w-6 h-2 bg-red-500' : isPast ? 'w-2 h-2 bg-gray-400' : 'w-2 h-2 bg-gray-200'}`} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

interface ConfirmDeleteModalProps {
  count: number;
  docLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmDeleteModal({ count, docLabel, onConfirm, onClose }: ConfirmDeleteModalProps) {
  const isSingle = count === 1;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Delete {isSingle ? (docLabel ? `"${docLabel}"` : 'this document') : `${count} documents`}?
          </h3>
          <p className="text-sm text-gray-500 font-light">
            This action cannot be undone. The selected document{!isSingle ? 's' : ''} will be permanently removed.
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-2xl text-sm font-medium hover:bg-red-700 transition-all">
            {isSingle ? 'Delete document' : `Delete ${count} documents`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status === 'FOR_PICKUP'
        ? 'bg-amber-100/80 text-amber-700'
        : 'bg-green-100/80 text-green-700'
    }`}>
      {status === 'FOR_PICKUP' ? 'For Pickup' : 'Received'}
    </span>
  );
}

// ─── Mobile Document Card ─────────────────────────────────────────────────────

interface DocCardProps {
  doc: Document;
  isSelected: boolean;
  isReceivedTab: boolean;
  isAllTab: boolean;
  isOptimisticallyReceived: boolean;
  onSelect: () => void;
  onView: () => void;
  onMarkReceived: () => void;
  onDelete: () => void;
}

function DocCard({
  doc, isSelected, isReceivedTab, isAllTab,
  isOptimisticallyReceived, onSelect, onView, onMarkReceived, onDelete,
}: DocCardProps) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isSelected ? 'bg-red-50/60 border-red-200' : 'bg-white/50 border-gray-200/60'
    }`}>
      {/* Top row: checkbox + control no + status */}
      <div className="flex items-start gap-3 mb-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <button
            onClick={onView}
            className="font-mono text-xs font-semibold text-gray-800 hover:underline text-left break-all leading-snug"
          >
            {doc.controlNo}
          </button>
        </div>
        {!isReceivedTab && <StatusBadge status={doc.status} />}
      </div>

      {/* Subject */}
      <p
        className="text-xs text-gray-700 leading-snug mb-2 pl-7 line-clamp-2 cursor-pointer hover:text-gray-900"
        onClick={onView}
      >
        {doc.subject}
      </p>

      {/* Meta row: date + received by */}
      <div className="pl-7 mb-3 space-y-0.5">
        <p className="text-[10px] text-gray-400">
          {isReceivedTab ? formatReceivedAt(doc.receivedAt) : doc.date}
        </p>
        {(isReceivedTab || isAllTab) && doc.receivedBy && (
          <p className="text-[10px] text-gray-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            {doc.receivedBy}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="pl-7 flex items-center gap-2">
        <button
          onClick={onView}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white/70 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-white transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>

        {doc.status === 'FOR_PICKUP' && !isOptimisticallyReceived && (
          <button
            onClick={onMarkReceived}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/70 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-white transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Received
          </button>
        )}

        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white/70 border border-gray-300 text-red-600 rounded-lg text-xs font-medium hover:bg-white transition-all ml-auto"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDocumentTable({
  documents,
  onDocumentUpdate,
  activeTab = 'ALL',
}: AdminDocumentTableProps) {
  const [viewModal, setViewModal]                         = useState<Document | null>(null);
  const [markReceivedModal, setMarkReceivedModal]         = useState<Document | null>(null);
  const [selectedDocuments, setSelectedDocuments]         = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal]             = useState(false);
  const [showBatchMarkReceivedModal, setShowBatchMarkReceivedModal] = useState(false);
  const [confirmSingleDelete, setConfirmSingleDelete]     = useState<Document | null>(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [deleteStage, setDeleteStage]                     = useState<DeleteStage | null>(null);
  const [deletedIds, setDeletedIds]                       = useState<Set<string>>(new Set());

  const receivedIdsRef              = useRef<Set<string>>(new Set());
  const [receivedIds, setReceivedIds] = useState<Set<string>>(new Set());

  const addReceivedIds = (...ids: string[]) => {
    ids.forEach((id) => receivedIdsRef.current.add(id));
    setReceivedIds(new Set(receivedIdsRef.current));
  };

  useEffect(() => {
    if (receivedIds.size === 0) return;
    const timer = setTimeout(() => onDocumentUpdate(), 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receivedIds]);

  const isReceivedTab = activeTab === 'RECEIVED';
  const isAllTab      = activeTab === 'ALL';

  const visibleDocuments = documents.filter((doc) => {
    if (deletedIds.has(doc.id)) return false;
    if (activeTab === 'FOR_PICKUP' && receivedIdsRef.current.has(doc.id)) return false;
    return true;
  });

  // ── Selection helpers ─────────────────────────────────────────────────────
  const handleSelectDocument = (docId: string) => {
    const next = new Set(selectedDocuments);
    if (next.has(docId)) next.delete(docId);
    else next.add(docId);
    setSelectedDocuments(next);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === visibleDocuments.length) setSelectedDocuments(new Set());
    else setSelectedDocuments(new Set(visibleDocuments.map((d) => d.id)));
  };

  const eligibleForReceived = visibleDocuments.filter(
    (doc) => selectedDocuments.has(doc.id) && doc.status === 'FOR_PICKUP'
  );

  // ── Single delete ─────────────────────────────────────────────────────────
  const handleDeleteConfirmed = async () => {
    if (!confirmSingleDelete) return;
    const targetId = confirmSingleDelete.id;
    setConfirmSingleDelete(null);
    try {
      setDeleteStage('deleting');
      await deleteDoc(targetId);
      setDeletedIds((prev) => new Set([...prev, targetId]));
      setDeleteStage('done');
      await new Promise((r) => setTimeout(r, 2000));
      toast.success('Deleted');
      onDocumentUpdate();
    } catch (error) {
      toast.error('Delete failed');
      console.error(error);
    } finally {
      setDeleteStage(null);
    }
  };

  // ── Batch delete ──────────────────────────────────────────────────────────
  const handleBatchDeleteConfirmed = async () => {
    setShowBatchDeleteConfirm(false);
    const idsToDelete = new Set(selectedDocuments);
    try {
      setDeleteStage('deleting');
      const succeeded: string[] = [];
      for (const docId of idsToDelete) {
        try { await deleteDoc(docId); succeeded.push(docId); }
        catch (error) { console.error(`Failed to delete ${docId}`, error); }
      }
      if (succeeded.length > 0) {
        setDeletedIds((prev) => new Set([...prev, ...succeeded]));
        setDeleteStage('done');
        await new Promise((r) => setTimeout(r, 2000));
        toast.success(`Deleted ${succeeded.length} document${succeeded.length > 1 ? 's' : ''}`);
        setSelectedDocuments(new Set());
        onDocumentUpdate();
      }
    } catch (error) {
      toast.error('Batch delete failed');
      console.error(error);
    } finally {
      setDeleteStage(null);
    }
  };

  // ── Mark received ─────────────────────────────────────────────────────────
  const handleBatchMarkReceived = () => {
    if (eligibleForReceived.length === 0) {
      toast.error('No eligible documents selected (must be Ready for Pickup)');
      return;
    }
    setShowBatchMarkReceivedModal(true);
  };

  const handleBatchMarkReceivedConfirm = async (receivedBy: string, notes: string) => {
    try {
      const receivedDateTime = new Date().toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      });
      const succeeded: string[] = [];
      for (const doc of eligibleForReceived) {
        try { await markDocumentReceived(doc.id, receivedBy.trim(), notes, receivedDateTime); succeeded.push(doc.id); }
        catch (error) { console.error(`Failed to mark ${doc.id} as received`, error); }
      }
      if (succeeded.length > 0) {
        addReceivedIds(...succeeded);
        toast.success(`Marked ${succeeded.length} document(s) as received`);
        setSelectedDocuments(new Set());
        setShowBatchMarkReceivedModal(false);
      }
    } catch (error) {
      toast.error('Batch update failed');
      console.error(error);
    }
  };

  const truncateText = (text: string, maxLength = 60) =>
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (visibleDocuments.length === 0) {
    return (
      <>
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-300 text-center py-16">
          <p className="text-gray-500 text-sm font-light">No documents</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-light text-sm transition-all"
          >
            Create
          </button>
        </div>
        {showUploadModal && (
          <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={() => { setShowUploadModal(false); onDocumentUpdate(); }} />
        )}
      </>
    );
  }

  // ── Bulk action bar (shared between mobile + desktop) ─────────────────────
  const BulkBar = () => (
    selectedDocuments.size > 0 ? (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500 font-light">{selectedDocuments.size} selected</span>
        {eligibleForReceived.length > 0 && (
          <button onClick={handleBatchMarkReceived} className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 text-xs font-medium transition-all">
            Mark Received
          </button>
        )}
        <button
          onClick={() => setShowBatchDeleteConfirm(true)}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium transition-all inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete{selectedDocuments.size > 1 ? ` (${selectedDocuments.size})` : ''}
        </button>
      </div>
    ) : null
  );

  return (
    <>
      {deleteStage && <DeleteProcessingOverlay stage={deleteStage} />}

      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-300 px-4 sm:px-6 py-3 sm:py-4 bg-white/30">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-base sm:text-lg font-light text-gray-900">Documents</h2>
            <BulkBar />
          </div>
        </div>

        {/* ── Mobile: card list (< sm) ── */}
        <div className="sm:hidden divide-y divide-gray-200/60 p-3 space-y-3">
          {/* Select all row */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60">
            <input
              type="checkbox"
              checked={selectedDocuments.size === visibleDocuments.length && visibleDocuments.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 cursor-pointer"
              title="Select all"
            />
            <span className="text-xs text-gray-500 font-medium">Select all</span>
          </div>

          {visibleDocuments.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              isSelected={selectedDocuments.has(doc.id)}
              isReceivedTab={isReceivedTab}
              isAllTab={isAllTab}
              isOptimisticallyReceived={receivedIdsRef.current.has(doc.id)}
              onSelect={() => handleSelectDocument(doc.id)}
              onView={() => setViewModal(doc)}
              onMarkReceived={() => setMarkReceivedModal(doc)}
              onDelete={() => setConfirmSingleDelete(doc)}
            />
          ))}
        </div>

        {/* ── Desktop: table (≥ sm) ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/30 border-b border-gray-300">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.size === visibleDocuments.length && visibleDocuments.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                    title="Select all"
                  />
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Control No.</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  {isReceivedTab ? 'Date Received' : 'Date'}
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Subject</th>
                {(isReceivedTab || isAllTab) && (
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">Received By</th>
                )}
                {!isReceivedTab && (
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                )}
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visibleDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className={`hover:bg-white/50 transition-all ${selectedDocuments.has(doc.id) ? 'bg-red-50/40' : ''}`}
                >
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <input type="checkbox" checked={selectedDocuments.has(doc.id)} onChange={() => handleSelectDocument(doc.id)} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <button onClick={() => setViewModal(doc)} className="font-mono text-xs lg:text-sm font-medium text-gray-900 hover:underline text-left whitespace-nowrap">
                      {doc.controlNo}
                    </button>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-600 font-light whitespace-nowrap">
                    {isReceivedTab ? formatReceivedAt(doc.receivedAt) : doc.date}
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-700 font-light max-w-xs" title={doc.subject}>
                    <span className="line-clamp-2">{doc.subject}</span>
                  </td>
                  {(isReceivedTab || isAllTab) && (
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-700 font-light">
                      {doc.receivedBy ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          {doc.receivedBy}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  )}
                  {!isReceivedTab && (
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                  )}
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewModal(doc)} className="p-1.5 bg-white/60 backdrop-blur border border-gray-300 text-gray-700 rounded-lg hover:bg-white/80 transition-all" title="View">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {doc.status === 'FOR_PICKUP' && !receivedIdsRef.current.has(doc.id) && (
                        <button onClick={() => setMarkReceivedModal(doc)} className="p-1.5 bg-white/60 backdrop-blur border border-gray-300 text-gray-700 rounded-lg hover:bg-white/80 transition-all" title="Mark received">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button onClick={() => setConfirmSingleDelete(doc)} className="p-1.5 bg-white/60 backdrop-blur border border-gray-300 text-red-600 rounded-lg hover:bg-white/80 transition-all" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {viewModal && <DocumentModal document={viewModal} onClose={() => setViewModal(null)} isAdminView={true} />}

      {markReceivedModal && (
        <MarkReceivedModal
          document={markReceivedModal}
          onClose={() => setMarkReceivedModal(null)}
          onSuccess={() => {
            const id = markReceivedModal.id;
            addReceivedIds(id);
            setMarkReceivedModal(null);
          }}
        />
      )}

      {showUploadModal && (
        <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onSuccess={() => { setShowUploadModal(false); onDocumentUpdate(); }} />
      )}

      {showBatchMarkReceivedModal && (
        <BatchMarkReceivedModal
          documentCount={eligibleForReceived.length}
          onClose={() => setShowBatchMarkReceivedModal(false)}
          onConfirm={handleBatchMarkReceivedConfirm}
        />
      )}

      {confirmSingleDelete && (
        <ConfirmDeleteModal
          count={1}
          docLabel={confirmSingleDelete.controlNo}
          onConfirm={handleDeleteConfirmed}
          onClose={() => setConfirmSingleDelete(null)}
        />
      )}

      {showBatchDeleteConfirm && (
        <ConfirmDeleteModal
          count={selectedDocuments.size}
          onConfirm={handleBatchDeleteConfirmed}
          onClose={() => setShowBatchDeleteConfirm(false)}
        />
      )}
    </>
  );
}