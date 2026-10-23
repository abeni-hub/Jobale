import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl, unwrapList } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { ApiService, PublishState } from '@/lib/types';
import IconPicker, { renderLucideIcon } from '@/components/admin/IconPicker';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Wrench,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload,
  ArrowRight,
  Loader2,
  X,
  Layers,
} from 'lucide-react';

export default function ServicesManager() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Editing / Creating Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ApiService> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Scope items temp state for modal
  const [scopeItemsText, setScopeItemsText] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<ApiService | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<unknown>('/cms/services/');
      setServices(unwrapList<ApiService>(res));
    } catch (err) {
      error((err as Error).message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenAdd = () => {
    setEditingService({
      title: '',
      slug: '',
      short_name: '',
      icon: 'Building2',
      summary: '',
      overview: '',
      scope: [],
      display_order: (services.length + 1) * 10,
      status: 'published',
      cta_label: 'Learn More',
      cta_url: '/contact',
      image: null,
    });
    setScopeItemsText('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (svc: ApiService) => {
    setEditingService({ ...svc });
    setScopeItemsText(Array.isArray(svc.scope) ? svc.scope.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleSlugify = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title) {
      error('Service title is required.');
      return;
    }

    try {
      setIsSaving(true);
      const parsedScope = scopeItemsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...editingService,
        slug: editingService.slug || handleSlugify(editingService.title),
        scope: parsedScope,
      };

      if (editingService.id) {
        await api.put(`/cms/services/${editingService.id}/`, payload);
        success(`Service "${editingService.title}" updated successfully.`);
      } else {
        await api.post('/cms/services/', payload);
        success(`Service "${editingService.title}" created successfully.`);
      }

      setIsModalOpen(false);
      await fetchServices();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to save service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (svc: ApiService) => {
    const nextStatus: PublishState = svc.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/cms/services/${svc.id}/`, { status: nextStatus });
      success(
        `Service "${svc.title}" is now ${nextStatus === 'published' ? 'published live' : 'saved as draft'}.`
      );
      await fetchServices();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to toggle publication status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.delete(`/cms/services/${deleteTarget.id}/`);
      success(`Service "${deleteTarget.title}" was deleted.`);
      setDeleteTarget(null);
      await fetchServices();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase().trim()) ||
      s.summary?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
            Services Catalog
          </h2>
          <p className="text-xs text-surface-steel/70">
            Manage your engineering capabilities, icon representations, scope bullet points, and public availability.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-heading font-bold tracking-wide shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Search and Stats bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0F2137] border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-steel/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search services by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#07111E]/80 border border-white/10 text-white text-xs placeholder-surface-steel/40 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="text-xs text-surface-steel/70 flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span>Total: <strong className="text-white">{services.length}</strong></span>
          <span>Published: <strong className="text-emerald-400">{services.filter((s) => s.status === 'published').length}</strong></span>
          <span>Draft: <strong className="text-amber-400">{services.filter((s) => s.status === 'draft').length}</strong></span>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl bg-[#0F2137] border border-white/10 overflow-hidden shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-steel/60">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-xs text-surface-steel/60">
            <Wrench className="w-10 h-10 mx-auto text-surface-steel/30 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">No services found</p>
            <p className="max-w-xs mx-auto mb-4">
              {search ? 'Try clearing your search query.' : 'Click "Add New Service" to create your first offering.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07111E] text-surface-steel/70 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredServices.map((svc) => (
                  <tr key={svc.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-brand-navy border border-white/10 text-brand-blue-light">
                          {renderLucideIcon(svc.icon, 'w-5 h-5')}
                        </span>
                        <div>
                          <p className="font-heading font-bold text-white text-sm">{svc.title}</p>
                          <p className="text-surface-steel/60 line-clamp-1 max-w-sm mt-0.5">
                            {svc.summary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-surface-steel/60">
                      /services/{svc.slug}
                    </td>
                    <td className="py-3 px-4 font-mono text-surface-steel/70">
                      {svc.display_order}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(svc)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                          svc.status === 'published'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                            : 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {svc.status === 'published' ? (
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
                          onClick={() => handleOpenEdit(svc)}
                          className="p-1.5 rounded-lg text-surface-steel/70 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(svc)}
                          className="p-1.5 rounded-lg text-surface-steel/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingService && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-navy-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-brand-navy border border-white/15 shadow-elevated p-6 text-white flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-brand-blue/20 text-brand-blue-light">
                  {renderLucideIcon(editingService.icon || 'Building2', 'w-5 h-5')}
                </span>
                <h3 className="text-base font-heading font-bold text-white">
                  {editingService.id ? `Edit Service: ${editingService.title}` : 'Add New Engineering Service'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-surface-steel/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Service Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingService((prev) => ({
                        ...prev,
                        title,
                        slug: prev?.id ? prev.slug : handleSlugify(title),
                      }));
                    }}
                    placeholder="e.g. Building Construction"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editingService.slug || ''}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="building-construction"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <IconPicker
                    value={editingService.icon || 'Building2'}
                    onChange={(iconName) =>
                      setEditingService((prev) => ({ ...prev, icon: iconName }))
                    }
                    label="Service Icon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingService.display_order ?? 10}
                    onChange={(e) =>
                      setEditingService((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Short Description (Card Summary)
                </label>
                <textarea
                  rows={2}
                  value={editingService.summary || ''}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  placeholder="Concise overview displayed on cards across the website..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Detailed Overview / Scope of Service
                </label>
                <textarea
                  rows={4}
                  value={editingService.overview || ''}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...prev, overview: e.target.value }))
                  }
                  placeholder="Full description of the engineering approach, methodologies, and deliverables..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Scope Bullet Points (One item per line)
                </label>
                <textarea
                  rows={4}
                  value={scopeItemsText}
                  onChange={(e) => setScopeItemsText(e.target.value)}
                  placeholder="Commercial buildings&#10;Multi-storey residential&#10;Structural concrete works"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                />
              </div>

              {/* Image Picker */}
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Service Feature Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-[#07111E] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {editingService.image ? (
                      <img
                        src={mediaUrl(editingService.image)}
                        alt="Service thumb"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-surface-steel/40">No image</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light text-xs font-semibold transition-all"
                  >
                    Select / Upload Image
                  </button>
                  {editingService.image && (
                    <button
                      type="button"
                      onClick={() => setEditingService((prev) => ({ ...prev, image: null }))}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Publication Status
                </label>
                <select
                  value={editingService.status || 'published'}
                  onChange={(e) =>
                    setEditingService((prev) => ({
                      ...prev,
                      status: e.target.value as PublishState,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                >
                  <option value="published">Published (Visible on Public Website)</option>
                  <option value="draft">Draft (Private, CMS Only)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-light text-xs font-semibold text-white shadow disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Service'}
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
        currentValue={editingService?.image}
        onSelect={(url) => setEditingService((prev) => ({ ...prev, image: url }))}
        title="Select Service Image"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Service Offering"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This service will be immediately removed from the public website.`}
        confirmLabel="Delete Service"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
