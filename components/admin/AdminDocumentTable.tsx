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

  // Optimistically remove deleted rows
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // ── receivedIds: use a ref as the source of truth so it survives
  //    parent re-renders triggered by onDocumentUpdate(). The state
  //    copy exists only to trigger re-renders of this component.
  const receivedIdsRef              = useRef<Set<string>>(new Set());
  const [receivedIds, setReceivedIds] = useState<Set<string>>(new Set());

  /** Add one or more IDs to the received set and trigger a re-render. */
  const addReceivedIds = (...ids: string[]) => {
    ids.forEach((id) => receivedIdsRef.current.add(id));
    setReceivedIds(new Set(receivedIdsRef.current));
  };

  // ── After marking documents as received, wait 2 s then ask the parent
  //    to refetch. By then the DB write has committed and the server
  //    will no longer include those docs in the FOR_PICKUP list.
  //    We deliberately do NOT call onDocumentUpdate() immediately so
  //    the optimistic removal is visible before the prop array refreshes.
  useEffect(() => {
    if (receivedIds.size === 0) return;
    const timer = setTimeout(() => onDocumentUpdate(), 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receivedIds]);

  const isReceivedTab = activeTab === 'RECEIVED';
  const isAllTab      = activeTab === 'ALL';

  // ── Derive visible documents ──────────────────────────────────────────────
  // Use the ref (not state) so the filter always reads the latest set
  // even if React hasn't flushed the state update yet.
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
        try {
          await deleteDoc(docId);
          succeeded.push(docId);
        } catch (error) {
          console.error(`Failed to delete ${docId}`, error);
        }
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
        try {
          await markDocumentReceived(doc.id, receivedBy.trim(), notes, receivedDateTime);
          succeeded.push(doc.id);
        } catch (error) {
          console.error(`Failed to mark ${doc.id} as received`, error);
        }
      }

      if (succeeded.length > 0) {
        // Immediately hide from FOR_PICKUP tab via the ref-backed helper.
        // onDocumentUpdate() is handled by the useEffect above after 2 s.
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

  const truncateText = (text: string, maxLength = 50) =>
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
          <UploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => { setShowUploadModal(false); onDocumentUpdate(); }}
          />
        )}
      </>
    );
  }

  // ── Table ─────────────────────────────────────────────────────────────────
  return (
    <>
      {deleteStage && <DeleteProcessingOverlay stage={deleteStage} />}

      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-300 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-300 px-6 py-4 bg-white/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light text-gray-900">Documents</h2>

            {selectedDocuments.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 font-light">{selectedDocuments.size} selected</span>

                {eligibleForReceived.length > 0 && (
                  <button onClick={handleBatchMarkReceived} className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 text-xs font-light transition-all">
                    Mark Received
                  </button>
                )}

                <button
                  onClick={() => setShowBatchDeleteConfirm(true)}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-light transition-all inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete{selectedDocuments.size > 1 ? ` (${selectedDocuments.size})` : ''}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/30 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.size === visibleDocuments.length && visibleDocuments.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                    title="Select all"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-light text-gray-700 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-light text-gray-700 uppercase tracking-wider">
                  {isReceivedTab ? 'Date Received' : 'Date'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-light text-gray-700 uppercase tracking-wider">Subject</th>
                {(isReceivedTab || isAllTab) && (
                  <th className="px-6 py-3 text-left text-xs font-light text-gray-700 uppercase tracking-wider">Received By</th>
                )}
                {!isReceivedTab && (
                  <th className="px-6 py-3 text-left text-xs font-light text-gray-700 uppercase tracking-wider">Status</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-light text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {visibleDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className={`hover:bg-white/50 transition-all ${selectedDocuments.has(doc.id) ? 'bg-red-50/40' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" checked={selectedDocuments.has(doc.id)} onChange={() => handleSelectDocument(doc.id)} className="w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="px-6 py-4">
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewModal(doc); }} className="font-mono font-light text-gray-900 hover:underline text-sm">
                      {doc.controlNo}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-light">
                    {isReceivedTab ? formatReceivedAt(doc.receivedAt) : doc.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs font-light" title={doc.subject}>
                    {truncateText(doc.subject)}
                  </td>
                  {(isReceivedTab || isAllTab) && (
                    <td className="px-6 py-4 text-sm text-gray-700 font-light">
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
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-light ${doc.status === 'FOR_PICKUP' ? 'bg-amber-100/60 text-amber-700 backdrop-blur' : 'bg-green-100/60 text-green-700 backdrop-blur'}`}>
                        {doc.status === 'FOR_PICKUP' ? 'Ready for Pickup' : 'Received'}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => setViewModal(doc)} className="px-3 py-1 bg-white/60 backdrop-blur border border-gray-300 text-gray-900 rounded-lg hover:bg-white/80 text-xs font-light transition-all" title="View">
                        <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {doc.status === 'FOR_PICKUP' && !receivedIdsRef.current.has(doc.id) && (
                        <button onClick={() => setMarkReceivedModal(doc)} className="px-3 py-1 bg-white/60 backdrop-blur border border-gray-300 text-gray-900 rounded-lg hover:bg-white/80 text-xs font-light transition-all" title="Mark received">
                          <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}

                      <button onClick={() => setConfirmSingleDelete(doc)} className="px-3 py-1 bg-white/60 backdrop-blur border border-gray-300 text-red-600 rounded-lg hover:bg-white/80 text-xs font-light transition-all" title="Delete">
                        <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      {viewModal && (
        <DocumentModal document={viewModal} onClose={() => setViewModal(null)} isAdminView={true} />
      )}

      {markReceivedModal && (
        <MarkReceivedModal
          document={markReceivedModal}
          onClose={() => setMarkReceivedModal(null)}
          onSuccess={() => {
            // Capture the id before nulling the modal state
            const id = markReceivedModal.id;
            // Immediately hide from FOR_PICKUP tab via ref-backed helper.
            // onDocumentUpdate() fires automatically after 2 s via the useEffect.
            addReceivedIds(id);
            setMarkReceivedModal(null);
          }}
        />
      )}

      {showUploadModal && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => { setShowUploadModal(false); onDocumentUpdate(); }}
        />
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