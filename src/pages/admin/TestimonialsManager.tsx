import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl, unwrapList } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { Testimonial, PublishState } from '@/lib/types';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Quote,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  EyeOff,
  User,
  Building,
  Upload,
  Loader2,
  X,
  ShieldCheck,
  Star,
} from 'lucide-react';

export default function TestimonialsManager() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<unknown>('/cms/testimonials/');
      setTestimonials(unwrapList<Testimonial>(res));
    } catch (err) {
      error((err as Error).message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleOpenAdd = () => {
    setEditingTestimonial({
      name: '',
      job_title: '',
      organization: '',
      quote: '',
      image: null,
      display_order: (testimonials.length + 1) * 10,
      status: 'published',
      is_verified: true,
      internal_notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingTestimonial({ ...t });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial?.name || !editingTestimonial?.quote) {
      error('Author name and testimonial quote are required.');
      return;
    }

    try {
      setIsSaving(true);
      if (editingTestimonial.id) {
        await api.put(`/cms/testimonials/${editingTestimonial.id}/`, editingTestimonial);
        success(`Testimonial from "${editingTestimonial.name}" updated successfully.`);
      } else {
        await api.post('/cms/testimonials/', editingTestimonial);
        success(`Testimonial from "${editingTestimonial.name}" added successfully.`);
      }

      setIsModalOpen(false);
      await fetchTestimonials();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to save testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (t: Testimonial) => {
    const nextStatus: PublishState = t.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/cms/testimonials/${t.id}/`, { status: nextStatus });
      success(
        `Testimonial is now ${nextStatus === 'published' ? 'published live' : 'saved as draft'}.`
      );
      await fetchTestimonials();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to update publication status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.delete(`/cms/testimonials/${deleteTarget.id}/`);
      success(`Testimonial from "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await fetchTestimonials();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to delete testimonial');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      t.organization?.toLowerCase().includes(search.toLowerCase().trim()) ||
      t.quote?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
            Testimonials & Client Feedback
          </h2>
          <p className="text-xs text-surface-steel/70">
            Manage genuine client reviews and endorsements. Fake reviews are strictly excluded from the public site.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-heading font-bold tracking-wide shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Verified Testimonial</span>
        </button>
      </div>

      {/* Compliance Box */}
      <div className="p-4 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-surface-steel text-xs flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-brand-blue-light shrink-0 mt-0.5" />
        <p>
          <strong>Authenticity Notice:</strong> Only verified testimonials provided directly by client representatives are displayed on the public website. If no testimonials are present, the public website displays a clean layout without fake reviews.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F2137] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-steel/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#07111E]/80 border border-white/10 text-white text-xs placeholder-surface-steel/40 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="text-xs text-surface-steel/70">
          Total Testimonials: <strong className="text-white">{testimonials.length}</strong>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="rounded-2xl bg-[#0F2137] border border-white/10 overflow-hidden shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-steel/60">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-surface-steel/60">
            <Quote className="w-10 h-10 mx-auto text-surface-steel/30 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">No verified testimonials yet</p>
            <p className="max-w-md mx-auto mb-4">
              {search
                ? 'No reviews match your search query.'
                : 'You have not added any client testimonials yet. When you receive approved written feedback from clients, click "Add Verified Testimonial" above.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((t) => {
              const resolvedImg = t.image ? mediaUrl(t.image) : null;
              return (
                <div
                  key={t.id}
                  className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-4 max-w-2xl">
                    <div className="w-12 h-12 rounded-full bg-brand-navy border border-white/15 overflow-hidden shrink-0 flex items-center justify-center text-brand-blue-light">
                      {resolvedImg ? (
                        <img src={resolvedImg} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-heading font-bold text-white">{t.name}</h4>
                        {t.is_verified && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-steel/70 mb-2 font-mono">
                        {t.job_title ? `${t.job_title}, ` : ''}{t.organization}
                      </p>
                      <blockquote className="text-xs text-surface-steel/90 italic bg-white/5 p-3 rounded-xl border border-white/5">
                        "{t.quote}"
                      </blockquote>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(t)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        t.status === 'published'
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {t.status === 'published' ? (
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
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 rounded-lg text-surface-steel/70 hover:text-white hover:bg-white/10"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(t)}
                      className="p-1.5 rounded-lg text-surface-steel/70 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-navy-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-brand-navy border border-white/15 shadow-elevated p-6 text-white flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-heading font-bold text-white">
                {editingTestimonial.id ? 'Edit Testimonial' : 'Add Verified Client Testimonial'}
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
                  Representative Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.name || ''}
                  onChange={(e) =>
                    setEditingTestimonial((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Ato Daniel Kebede"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.job_title || ''}
                    onChange={(e) =>
                      setEditingTestimonial((prev) => ({ ...prev, job_title: e.target.value }))
                    }
                    placeholder="Project Manager / Director"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Organization / Client
                  </label>
                  <input
                    type="text"
                    value={editingTestimonial.organization || ''}
                    onChange={(e) =>
                      setEditingTestimonial((prev) => ({ ...prev, organization: e.target.value }))
                    }
                    placeholder="e.g. Adama Real Estate Dev"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Testimonial Quote / Statement <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingTestimonial.quote || ''}
                  onChange={(e) =>
                    setEditingTestimonial((prev) => ({ ...prev, quote: e.target.value }))
                  }
                  placeholder="The construction was executed with meticulous attention to drawing specifications..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#07111E] border border-white/15 overflow-hidden shrink-0 flex items-center justify-center">
                    {editingTestimonial.image ? (
                      <img
                        src={mediaUrl(editingTestimonial.image)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-surface-steel/40" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-3 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light text-xs font-semibold"
                  >
                    Select Photo
                  </button>
                  {editingTestimonial.image && (
                    <button
                      type="button"
                      onClick={() => setEditingTestimonial((prev) => ({ ...prev, image: null }))}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Verification & Status */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingTestimonial.display_order ?? 10}
                    onChange={(e) =>
                      setEditingTestimonial((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={editingTestimonial.status || 'published'}
                    onChange={(e) =>
                      setEditingTestimonial((prev) => ({
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

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingTestimonial.is_verified || false}
                    onChange={(e) =>
                      setEditingTestimonial((prev) => ({ ...prev, is_verified: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-[#07111E] border-white/20 text-brand-blue focus:ring-brand-blue"
                  />
                  <span className="text-xs text-white font-medium">
                    Verified Customer Statement (Authorized for public display)
                  </span>
                </label>
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
                  {isSaving ? 'Saving...' : 'Save Testimonial'}
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
        currentValue={editingTestimonial?.image}
        onSelect={(url) => setEditingTestimonial((prev) => ({ ...prev, image: url }))}
        title="Select Testimonial Profile Photo"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
