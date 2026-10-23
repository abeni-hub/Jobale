import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl, unwrapList } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { NavigationItem, FooterSettings, SingletonEnvelope, PublishState } from '@/lib/types';
import PublishBar from '@/components/admin/PublishBar';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Compass,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Layers,
  Globe,
  Upload,
  Loader2,
  X,
} from 'lucide-react';

export default function NavigationFooterEditor() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [footer, setFooter] = useState<Partial<FooterSettings>>({});
  const [footerEnvelope, setFooterEnvelope] = useState<SingletonEnvelope<FooterSettings> | null>(null);
  const [loading, setLoading] = useState(true);

  // Footer publishing states
  const [isSavingFooterDraft, setIsSavingFooterDraft] = useState(false);
  const [isPublishingFooter, setIsPublishingFooter] = useState(false);
  const [isDiscardingFooter, setIsDiscardingFooter] = useState(false);
  const [isFooterDirty, setIsFooterDirty] = useState(false);

  // Nav Item Modal
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [editingNav, setEditingNav] = useState<Partial<NavigationItem> | null>(null);
  const [isSavingNav, setIsSavingNav] = useState(false);
  const [deleteNavTarget, setDeleteNavTarget] = useState<NavigationItem | null>(null);
  const [isDeletingNav, setIsDeletingNav] = useState(false);

  // Media picker for footer logo
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [navRes, footRes] = await Promise.all([
        api.get<unknown>('/cms/navigation/'),
        api.get<SingletonEnvelope<FooterSettings>>('/cms/footer/'),
      ]);
      setNavItems(unwrapList<NavigationItem>(navRes));
      setFooterEnvelope(footRes);
      const initialFooter = footRes.draft ? { ...footRes.live, ...footRes.draft } : footRes.live;
      setFooter(initialFooter || {});
      setIsFooterDirty(false);
    } catch (err) {
      error((err as Error).message || 'Failed to load navigation & footer data');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Nav actions
  const handleOpenAddNav = () => {
    setEditingNav({
      label: '',
      url: '/',
      display_order: (navItems.length + 1) * 10,
      is_visible: true,
      is_external: false,
      open_in_new_tab: false,
      status: 'published',
    });
    setIsNavModalOpen(true);
  };

  const handleOpenEditNav = (item: NavigationItem) => {
    setEditingNav({ ...item });
    setIsNavModalOpen(true);
  };

  const handleSaveNav = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNav?.label || !editingNav?.url) {
      error('Navigation label and target destination are required.');
      return;
    }
    try {
      setIsSavingNav(true);
      if (editingNav.id) {
        await api.put(`/cms/navigation/${editingNav.id}/`, editingNav);
        success(`Navigation item "${editingNav.label}" updated.`);
      } else {
        await api.post('/cms/navigation/', editingNav);
        success(`Navigation item "${editingNav.label}" added.`);
      }
      setIsNavModalOpen(false);
      await fetchData();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to save navigation item');
    } finally {
      setIsSavingNav(false);
    }
  };

  const handleToggleNavVisibility = async (item: NavigationItem) => {
    try {
      await api.patch(`/cms/navigation/${item.id}/`, { is_visible: !item.is_visible });
      success(`Navigation item is now ${!item.is_visible ? 'visible' : 'hidden'}.`);
      await fetchData();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to update visibility');
    }
  };

  const handleDeleteNavConfirm = async () => {
    if (!deleteNavTarget) return;
    try {
      setIsDeletingNav(true);
      await api.delete(`/cms/navigation/${deleteNavTarget.id}/`);
      success(`Navigation item "${deleteNavTarget.label}" deleted.`);
      setDeleteNavTarget(null);
      await fetchData();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to delete navigation item');
    } finally {
      setIsDeletingNav(false);
    }
  };

  // Footer handlers
  const handleFooterChange = (field: keyof FooterSettings, value: unknown) => {
    setFooter((prev) => ({ ...prev, [field]: value }));
    setIsFooterDirty(true);
  };

  const handleSaveFooterDraft = async () => {
    try {
      setIsSavingFooterDraft(true);
      await api.put('/cms/footer/', { fields: footer });
      success('Footer draft changes saved. Publish to make them live.', 'Draft Saved');
      await fetchData();
    } catch (err) {
      error((err as Error).message || 'Failed to save footer draft');
    } finally {
      setIsSavingFooterDraft(false);
    }
  };

  const handlePublishFooter = async () => {
    try {
      setIsPublishingFooter(true);
      await api.post('/cms/footer/', { fields: footer });
      success('Footer settings published live successfully!', 'Published');
      await fetchData();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to publish footer');
    } finally {
      setIsPublishingFooter(false);
    }
  };

  const handleDiscardFooterDraft = async () => {
    if (!window.confirm('Discard staged footer draft changes?')) return;
    try {
      setIsDiscardingFooter(true);
      await api.delete('/cms/footer/');
      success('Footer staged draft discarded.');
      await fetchData();
    } catch (err) {
      error((err as Error).message || 'Failed to discard draft');
    } finally {
      setIsDiscardingFooter(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-steel/60">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-body">
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
          Navigation & Footer Manager
        </h2>
        <p className="text-xs text-surface-steel/70">
          Control header navigation links, order, visibility, and global footer branding.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Header Navigation Menu */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-brand-blue-light" />
              <div>
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                  Header Navigation Links ({navItems.length})
                </h3>
                <p className="text-[11px] text-surface-steel/60">
                  Visible in header menu and responsive mobile drawer.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenAddNav}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          </div>

          <div className="divide-y divide-white/5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07111E] text-surface-steel/60 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Label</th>
                  <th className="py-2.5 px-3">Destination URL</th>
                  <th className="py-2.5 px-3">Visibility</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {navItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5">
                    <td className="py-3 px-3 font-mono text-surface-steel/60">
                      {item.display_order}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {item.label}
                    </td>
                    <td className="py-3 px-3 font-mono text-brand-blue-light text-[11px]">
                      {item.url}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleNavVisibility(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                          item.is_visible
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-white/10 text-surface-steel/60'
                        }`}
                      >
                        {item.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.is_visible ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditNav(item)}
                          className="p-1.5 rounded-lg text-surface-steel/70 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteNavTarget(item)}
                          className="p-1.5 rounded-lg text-surface-steel/70 hover:text-rose-400 hover:bg-rose-500/10"
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
        </div>

        {/* Section 2: Footer Settings */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Globe className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Footer Description & Branding
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Footer Company Description
              </label>
              <textarea
                rows={3}
                value={footer.description || ''}
                onChange={(e) => handleFooterChange('description', e.target.value)}
                placeholder="General construction and civil engineering company based in Adama, Oromia, Ethiopia..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={footer.copyright_text || ''}
                onChange={(e) => handleFooterChange('copyright_text', e.target.value)}
                placeholder="Jobale Engineering PLC. All rights reserved."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={footer.show_replay_intro !== false}
                  onChange={(e) => handleFooterChange('show_replay_intro', e.target.checked)}
                  className="w-4 h-4 rounded bg-[#07111E] border-white/20 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-xs text-white">
                  Show "Replay CAD Intro Animation" button in footer
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Item Modal */}
      {isNavModalOpen && editingNav && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-navy-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-brand-navy border border-white/15 shadow-elevated p-6 text-white flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-heading font-bold text-white">
                {editingNav.id ? 'Edit Navigation Item' : 'Add Navigation Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNavModalOpen(false)}
                className="text-surface-steel/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNav} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Menu Label <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingNav.label || ''}
                  onChange={(e) => setEditingNav((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g. Services, About Us"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Target Destination URL / Path <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingNav.url || ''}
                  onChange={(e) => setEditingNav((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="/services or #contact"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingNav.display_order ?? 10}
                    onChange={(e) =>
                      setEditingNav((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Visibility
                  </label>
                  <select
                    value={editingNav.is_visible ? 'yes' : 'no'}
                    onChange={(e) =>
                      setEditingNav((prev) => ({ ...prev, is_visible: e.target.value === 'yes' }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  >
                    <option value="yes">Visible</option>
                    <option value="no">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNavModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-xs text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNav}
                  className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-light text-xs font-semibold text-white shadow disabled:opacity-50"
                >
                  {isSavingNav ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Nav Confirm Modal */}
      <ConfirmModal
        isOpen={deleteNavTarget !== null}
        title="Delete Navigation Item"
        message={`Are you sure you want to remove "${deleteNavTarget?.label}" from the header navigation?`}
        confirmLabel="Delete"
        isLoading={isDeletingNav}
        onConfirm={handleDeleteNavConfirm}
        onCancel={() => setDeleteNavTarget(null)}
      />

      {/* Sticky Publish Bar for Footer */}
      <PublishBar
        hasDraft={footerEnvelope?.has_draft}
        publishedAt={footerEnvelope?.published_at}
        updatedAt={footerEnvelope?.updated_at}
        isDirty={isFooterDirty}
        isSavingDraft={isSavingFooterDraft}
        isPublishing={isPublishingFooter}
        isDiscarding={isDiscardingFooter}
        onSaveDraft={handleSaveFooterDraft}
        onPublish={handlePublishFooter}
        onDiscardDraft={footerEnvelope?.has_draft ? handleDiscardFooterDraft : undefined}
      />
    </div>
  );
}
