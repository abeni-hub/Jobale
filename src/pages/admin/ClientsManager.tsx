import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl, unwrapList } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { ClientReference, PublishState } from '@/lib/types';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Users2,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  EyeOff,
  Building,
  Upload,
  Loader2,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function ClientsManager() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [clients, setClients] = useState<ClientReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<ClientReference> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ClientReference | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<unknown>('/cms/clients/');
      setClients(unwrapList<ClientReference>(res));
    } catch (err) {
      error((err as Error).message || 'Failed to load client references');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleOpenAdd = () => {
    setEditingClient({
      name: '',
      logo: null,
      association: '',
      description: '',
      display_order: (clients.length + 1) * 10,
      status: 'published',
      show_logo: true,
      internal_notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: ClientReference) => {
    setEditingClient({ ...client });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient?.name) {
      error('Organization or client name is required.');
      return;
    }

    try {
      setIsSaving(true);
      if (editingClient.id) {
        await api.put(`/cms/clients/${editingClient.id}/`, editingClient);
        success(`Client reference "${editingClient.name}" updated successfully.`);
      } else {
        await api.post('/cms/clients/', editingClient);
        success(`Client reference "${editingClient.name}" added successfully.`);
      }

      setIsModalOpen(false);
      await fetchClients();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to save client reference');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (client: ClientReference) => {
    const nextStatus: PublishState = client.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/cms/clients/${client.id}/`, { status: nextStatus });
      success(
        `Client reference "${client.name}" is now ${nextStatus === 'published' ? 'published' : 'draft'}.`
      );
      await fetchClients();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to update publication status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.delete(`/cms/clients/${deleteTarget.id}/`);
      success(`Client reference "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await fetchClients();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to delete client reference');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      c.association?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
            Clients & References Manager
          </h2>
          <p className="text-xs text-surface-steel/70">
            Manage factual client relationships and verified organization references.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-heading font-bold tracking-wide shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Reference</span>
        </button>
      </div>

      {/* Compliance / Policy note */}
      <div className="p-4 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-surface-steel text-xs flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-brand-blue-light shrink-0 mt-0.5" />
        <p>
          <strong>Corporate Policy:</strong> Only list client organizations with verified contractual associations or approved permission. Internal verification notes remain strictly confidential and are never exposed publicly.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F2137] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-steel/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#07111E]/80 border border-white/10 text-white text-xs placeholder-surface-steel/40 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="text-xs text-surface-steel/70">
          Total References: <strong className="text-white">{clients.length}</strong>
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-2xl bg-[#0F2137] border border-white/10 overflow-hidden shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-steel/60">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-xs text-surface-steel/60">
            <Users2 className="w-10 h-10 mx-auto text-surface-steel/30 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">No client references yet</p>
            <p className="max-w-xs mx-auto mb-4">
              Add verified corporate clients or organizations you have delivered projects for.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07111E] text-surface-steel/70 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Project Association</th>
                  <th className="py-3 px-4">Display Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClients.map((client) => {
                  const resolvedLogo = client.logo ? mediaUrl(client.logo) : null;
                  return (
                    <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white p-1 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                            {resolvedLogo ? (
                              <img
                                src={resolvedLogo}
                                alt={client.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <Building className="w-5 h-5 text-brand-navy" />
                            )}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-white text-sm">{client.name}</p>
                            {client.description && (
                              <p className="text-surface-steel/60 text-[11px] line-clamp-1 max-w-xs mt-0.5">
                                {client.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-surface-steel/80">
                        {client.association || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-surface-steel/70">
                        {client.display_order}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(client)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                            client.status === 'published'
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                              : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                          }`}
                        >
                          {client.status === 'published' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(client)}
                            className="p-1.5 rounded-lg text-surface-steel/70 hover:text-white hover:bg-white/10"
                            title="Edit Reference"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(client)}
                            className="p-1.5 rounded-lg text-surface-steel/70 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete Reference"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingClient && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-navy-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-brand-navy border border-white/15 shadow-elevated p-6 text-white flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-heading font-bold text-white">
                {editingClient.id ? `Edit Client: ${editingClient.name}` : 'Add Client Reference'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-surface-steel/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Organization / Client Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.name || ''}
                  onChange={(e) =>
                    setEditingClient((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Oromia Industrial Parks Corporation"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Project Association
                </label>
                <input
                  type="text"
                  value={editingClient.association || ''}
                  onChange={(e) =>
                    setEditingClient((prev) => ({ ...prev, association: e.target.value }))
                  }
                  placeholder="e.g. Adama Commercial Complex Civil Works"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Short Factual Description
                </label>
                <textarea
                  rows={2}
                  value={editingClient.description || ''}
                  onChange={(e) =>
                    setEditingClient((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Factual summary of work delivered..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              {/* Logo Picker */}
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Organization Logo (When Approved)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-white p-1 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                    {editingClient.logo ? (
                      <img
                        src={mediaUrl(editingClient.logo)}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-brand-navy">No Logo</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-3 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light text-xs font-semibold"
                  >
                    Select / Upload Logo
                  </button>
                  {editingClient.logo && (
                    <button
                      type="button"
                      onClick={() => setEditingClient((prev) => ({ ...prev, logo: null }))}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Internal Verification / Permission Notes (Private)
                </label>
                <textarea
                  rows={2}
                  value={editingClient.internal_notes || ''}
                  onChange={(e) =>
                    setEditingClient((prev) => ({ ...prev, internal_notes: e.target.value }))
                  }
                  placeholder="Contract ref, permission date, internal verification status..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingClient.display_order ?? 10}
                    onChange={(e) =>
                      setEditingClient((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Status
                  </label>
                  <select
                    value={editingClient.status || 'published'}
                    onChange={(e) =>
                      setEditingClient((prev) => ({
                        ...prev,
                        status: e.target.value as PublishState,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-xs text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-light text-xs font-semibold text-white shadow disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        currentValue={editingClient?.logo}
        onSelect={(url) => setEditingClient((prev) => ({ ...prev, logo: url }))}
        title="Select Client Logo"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Client Reference"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
