'use client';

import { useState, useEffect } from 'react';
import { UserRecord, deleteUserRecord, updateUserRecord, getAllUsers } from '@/lib/user-utils';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import toast from 'react-hot-toast';

interface AdminAccountsTableProps {
  accounts: UserRecord[];
  currentUserEmail: string;
  onUpdate: () => void;
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: 'admin' | 'user' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        role === 'admin' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {role === 'admin' ? (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )}
      {role === 'admin' ? 'Admin' : 'User'}
    </span>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ account, onClose, onSaved }: { account: UserRecord; onClose: () => void; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(account.displayName ?? '');
  const [office, setOffice] = useState(account.office ?? '');
  const [saving, setSaving] = useState(false);

  const dirty = displayName !== (account.displayName ?? '') || office !== (account.office ?? '');

  const handleSave = async () => {
    if (!displayName.trim() || !office.trim()) {
      toast.error('Name and Office are required.');
      return;
    }
    setSaving(true);
    try {
      await updateUserRecord(account, { displayName: displayName.trim(), office: office.trim(), role: account.role });
      toast.success('Account updated.');
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Edit Account</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">{account.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={saving}
              placeholder="Full Name"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Office</label>
            <input
              type="text"
              value={office}
              onChange={(e) => setOffice(e.target.value)}
              disabled={saving}
              placeholder="e.g. Records Section"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition disabled:opacity-60"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-2">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-60">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose }: {
  title: string; message: string; confirmLabel: string; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-6">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 font-light">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-300 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Account Card ──────────────────────────────────────────────────────

function AccountCard({ account, isSelf, onEdit, onDelete }: {
  account: UserRecord; isSelf: boolean; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200/60 bg-white/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {account.displayName}
            {isSelf && <span className="ml-1.5 text-[10px] font-medium text-gray-400">(you)</span>}
          </p>
          <p className="text-xs text-gray-400 truncate">{account.email}</p>
        </div>
        <RoleBadge role={account.role} />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs text-gray-600">
          <span className="text-gray-400">Office: </span>
          {account.office || <span className="italic text-gray-300">—</span>}
        </p>
        <p className="text-xs text-gray-400">
          Joined {new Date(account.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
      {!isSelf && (
        <div className="flex items-center gap-2 pt-1">
          <button onClick={onEdit} className="flex items-center gap-1 px-2.5 py-1.5 bg-white/70 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-white transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button onClick={onDelete} className="flex items-center gap-1 px-2.5 py-1.5 bg-white/70 border border-gray-300 text-red-600 rounded-lg text-xs font-medium hover:bg-white transition-all ml-auto">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type PendingAction = { type: 'delete'; account: UserRecord } | null;

function AdminAccountsTable({ accounts, currentUserEmail, onUpdate }: AdminAccountsTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'admin' | 'user'>('ALL');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = accounts.filter((a) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      a.displayName.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      (a.office || '').toLowerCase().includes(term);
    const matchesRole = roleFilter === 'ALL' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = {
    ALL: accounts.length,
    admin: accounts.filter((a) => a.role === 'admin').length,
    user: accounts.filter((a) => a.role === 'user').length,
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    setLoading(true);
    const { account } = pendingAction;
    setPendingAction(null);
    try {
      await deleteUserRecord(account.email);
      toast.success(`${account.displayName} removed`);
      onUpdate();
    } catch {
      toast.error('Delete failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (tab: 'ALL' | 'admin' | 'user') =>
    `px-4 py-2 rounded-lg font-light text-sm transition-all ${
      roleFilter === tab
        ? 'bg-gray-900 text-white shadow-sm'
        : 'bg-white/40 backdrop-blur border border-white/30 text-gray-600 hover:bg-white/50'
    }`;

  return (
    <>
      {/* Edit modal */}
      {editTarget && (
        <EditModal
          account={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={onUpdate}
        />
      )}

      {/* Search + filter */}
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/40 p-4 mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or office..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-white/50 backdrop-blur border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 font-light text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setRoleFilter('ALL')} className={tabClass('ALL')}>All ({counts.ALL})</button>
          <button onClick={() => setRoleFilter('admin')} className={tabClass('admin')}>Admins ({counts.admin})</button>
          <button onClick={() => setRoleFilter('user')} className={tabClass('user')}>Users ({counts.user})</button>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-300 overflow-hidden">
        <div className="border-b border-gray-300 px-4 sm:px-6 py-3 sm:py-4 bg-white/30">
          <h2 className="text-base sm:text-lg font-light text-gray-900">
            Accounts <span className="ml-2 text-sm text-gray-400">({filtered.length})</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm font-light">No accounts found</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden p-3 space-y-3">
              {filtered.map((account) => (
                <AccountCard
                  key={account.email}
                  account={account}
                  isSelf={account.email === currentUserEmail.toLowerCase()}
                  onEdit={() => setEditTarget(account)}
                  onDelete={() => setPendingAction({ type: 'delete', account })}
                />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/30 border-b border-gray-300">
                  <tr>
                    {['Name', 'Email', 'Office', 'Role', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((account) => {
                    const isSelf = account.email === currentUserEmail.toLowerCase();
                    return (
                      <tr key={account.email} className="hover:bg-white/50 transition-all">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {account.displayName}
                            {isSelf && <span className="ml-1.5 text-xs text-gray-400 font-normal">(you)</span>}
                          </p>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs text-gray-500 font-light">{account.email}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs text-gray-600 font-light">
                          {account.office || <span className="italic text-gray-300">—</span>}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4"><RoleBadge role={account.role} /></td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs text-gray-400 font-light whitespace-nowrap">
                          {new Date(account.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {isSelf ? (
                            <span className="text-xs text-gray-300 italic">—</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditTarget(account)}
                                disabled={loading}
                                className="p-1.5 bg-white/60 backdrop-blur border border-gray-300 text-gray-700 rounded-lg hover:bg-white/80 transition-all disabled:opacity-50"
                                title="Edit account"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setPendingAction({ type: 'delete', account })}
                                disabled={loading}
                                className="p-1.5 bg-white/60 backdrop-blur border border-gray-300 text-red-600 rounded-lg hover:bg-white/80 transition-all disabled:opacity-50"
                                title="Delete account"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Confirm delete modal */}
      {pendingAction && (
        <ConfirmModal
          title={`Delete ${pendingAction.account.displayName}?`}
          message="This will permanently remove the account record. This action cannot be undone."
          confirmLabel="Delete Account"
          onConfirm={handleConfirm}
          onClose={() => setPendingAction(null)}
        />
      )}
    </>
  );
}

// ─── Content Wrapper ──────────────────────────────────────────────────────────

export function AdminAccountsContent() {
  const { user, loading: authLoading } = useAdminAuth();
  const [accounts, setAccounts] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      setAccounts(users);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadAccounts();
    }
  }, [authLoading, user]);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Accounts', href: '/admin/accounts' },
          ]}
        />
        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-1">Account Management</h1>
          <p className="text-sm text-gray-500 font-light mb-6">Manage user accounts and permissions</p>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
            </div>
          ) : (
            <AdminAccountsTable
              accounts={accounts}
              currentUserEmail={user?.email || ''}
              onUpdate={loadAccounts}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}