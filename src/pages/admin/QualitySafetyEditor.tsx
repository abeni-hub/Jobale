import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl, unwrapList } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { QualitySafetyContent, QualityStandard, SingletonEnvelope, IconTextItem, PublishState } from '@/lib/types';
import PublishBar from '@/components/admin/PublishBar';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import IconPicker, { renderLucideIcon } from '@/components/admin/IconPicker';
import {
  ShieldCheck,
  Award,
  HardHat,
  Leaf,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Loader2,
  X,
  FileCheck,
} from 'lucide-react';

export default function QualitySafetyEditor() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [qsContent, setQsContent] = useState<Partial<QualitySafetyContent>>({});
  const [envelope, setEnvelope] = useState<SingletonEnvelope<QualitySafetyContent> | null>(null);
  const [standards, setStandards] = useState<QualityStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Standard modal state
  const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<Partial<QualityStandard> | null>(null);
  const [isSavingStandard, setIsSavingStandard] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QualityStandard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Picker state
  const [mediaPickerField, setMediaPickerField] = useState<'hero_image' | 'standard_image' | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [qsRes, stdRes] = await Promise.all([
        api.get<SingletonEnvelope<QualitySafetyContent>>('/cms/quality-safety/'),
        api.get<unknown>('/cms/quality-standards/'),
      ]);
      setEnvelope(qsRes);
      const initial = qsRes.draft ? { ...qsRes.live, ...qsRes.draft } : qsRes.live;
      setQsContent(initial || {});
      setStandards(unwrapList<QualityStandard>(stdRes));
      setIsDirty(false);
    } catch (err) {
      error((err as Error).message || 'Failed to load Quality & Safety content');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (field: keyof QualitySafetyContent, value: unknown) => {
    setQsContent((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Structured Commitments handlers
  const handleAddCommitment = () => {
    const current = (qsContent.commitments as IconTextItem[]) || [];
    const updated: IconTextItem[] = [
      ...current,
      { title: 'New Safety Commitment', description: 'Description of protocol or safety standard...', icon: 'HardHat' },
    ];
    handleChange('commitments', updated);
  };

  const handleUpdateCommitment = (index: number, updatedItem: Partial<IconTextItem>) => {
    const current = [...((qsContent.commitments as IconTextItem[]) || [])];
    if (current[index]) {
      current[index] = { ...current[index], ...updatedItem };
      handleChange('commitments', current);
    }
  };

  const handleRemoveCommitment = (index: number) => {
    const current = [...((qsContent.commitments as IconTextItem[]) || [])];
    current.splice(index, 1);
    handleChange('commitments', current);
  };

  // Section Publish / Draft
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      await api.put('/cms/quality-safety/', { fields: qsContent });
      success('Draft changes saved for Quality & Safety. Publish to make them live.', 'Draft Saved');
      await fetchData();
    } catch (err) {
      error((err as Error).message || 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await api.post('/cms/quality-safety/', { fields: qsContent });
      success('Quality & Safety section published successfully!', 'Published');
      await fetchData();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!window.confirm('Discard your staged draft changes for Quality & Safety?')) return;
    try {
      setIsDiscarding(true);
      await api.delete('/cms/quality-safety/');
      success('Staged draft discarded.');
      await fetchData();
    } catch (err) {
      error((err as Error).message || 'Failed to discard draft');
    } finally {
      setIsDiscarding(false);
    }
  };

  // Standards CRUD
  const handleOpenAddStandard = () => {
    setEditingStandard({
      name: '',
      issuing_body: '',
      certificate_number: '',
      category: 'Competency',
      description: '',
      is_public: true,
      status: 'published',
      display_order: (standards.length + 1) * 10,
    });
    setIsStandardModalOpen(true);
  };

  const handleOpenEditStandard = (std: QualityStandard) => {
    setEditingStandard({ ...std });
    setIsStandardModalOpen(true);
  };

  const handleSaveStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStandard?.name) {
      error('Credential / Certification name is required.');
      return;
    }
    try {
      setIsSavingStandard(true);
      if (editingStandard.id) {
        await api.put(`/cms/quality-standards/${editingStandard.id}/`, editingStandard);
        success(`Standard "${editingStandard.name}" updated successfully.`);
      } else {
        await api.post('/cms/quality-standards/', editingStandard);
        success(`Standard "${editingStandard.name}" added successfully.`);
      }
      setIsStandardModalOpen(false);
      await fetchData();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to save credential');
    } finally {
      setIsSavingStandard(false);
    }
  };

  const handleDeleteStandardConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.delete(`/cms/quality-standards/${deleteTarget.id}/`);
      success(`Certification "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      await fetchData();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to delete standard');
    } finally {
      setIsDeleting(false);
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
          Quality & Safety Management
        </h2>
        <p className="text-xs text-surface-steel/70">
          Manage quality assurance protocols, site safety practices, environmental policies, and verified credentials.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Section Headings */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <ShieldCheck className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Section Heading & Lead Text
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Section Heading
              </label>
              <input
                type="text"
                value={qsContent.heading || ''}
                onChange={(e) => handleChange('heading', e.target.value)}
                placeholder="Quality Assurance, Site Safety & Environmental Standards"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Introduction Overview
              </label>
              <textarea
                rows={3}
                value={qsContent.introduction || ''}
                onChange={(e) => handleChange('introduction', e.target.value)}
                placeholder="Jobale Engineering PLC enforces rigorous quality control, systematic safety protocols, and responsible environmental practices across every project site..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Card 2: QA, Safety, & Environmental Practices */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <HardHat className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Core Engineering Practices
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Quality Assurance Protocols
              </label>
              <textarea
                rows={4}
                value={qsContent.quality_assurance || ''}
                onChange={(e) => handleChange('quality_assurance', e.target.value)}
                placeholder="Detailed description of stage-by-stage inspections, material testing, drawing verification..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Site Safety Practices & PPE Compliance
              </label>
              <textarea
                rows={4}
                value={qsContent.safety_practices || ''}
                onChange={(e) => handleChange('safety_practices', e.target.value)}
                placeholder="Daily site safety briefings, mandatory PPE enforcement, scaffold inspections..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Environmental & Waste Management Practices
              </label>
              <textarea
                rows={4}
                value={qsContent.environmental_practices || ''}
                onChange={(e) => handleChange('environmental_practices', e.target.value)}
                placeholder="Site dust mitigation, responsible concrete disposal, resource efficiency..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Structured Safety Commitments */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-brand-blue-light" />
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                Safety & Quality Commitments
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddCommitment}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Commitment</span>
            </button>
          </div>

          <div className="space-y-3">
            {((qsContent.commitments as IconTextItem[]) || []).map((cmt, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-brand-blue/20 text-brand-blue-light">
                      {renderLucideIcon(cmt.icon || 'ShieldCheck', 'w-4 h-4')}
                    </span>
                    <span className="text-xs font-bold text-white uppercase">
                      Commitment #{idx + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCommitment(idx)}
                    className="text-surface-steel/50 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-surface-steel/70 mb-1">Title</label>
                    <input
                      type="text"
                      value={cmt.title}
                      onChange={(e) => handleUpdateCommitment(idx, { title: e.target.value })}
                      placeholder="e.g. Zero-Accident Objective"
                      className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <IconPicker
                      value={cmt.icon || 'ShieldCheck'}
                      onChange={(iconName) => handleUpdateCommitment(idx, { icon: iconName })}
                      label="Icon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-surface-steel/70 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={cmt.description}
                    onChange={(e) => handleUpdateCommitment(idx, { description: e.target.value })}
                    placeholder="Specific engineering safeguard or policy..."
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Verified Certifications & Credentials */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-brand-blue-light" />
              <div>
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                  Verified Credentials & Standards ({standards.length})
                </h3>
                <p className="text-[11px] text-surface-steel/60">
                  Only verified legal licenses and official trade certificates are displayed publicly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenAddStandard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Credential</span>
            </button>
          </div>

          <div className="space-y-3">
            {standards.length === 0 ? (
              <div className="py-8 text-center text-xs text-surface-steel/60 border border-dashed border-white/10 rounded-xl">
                <FileCheck className="w-8 h-8 mx-auto text-surface-steel/30 mb-2" />
                <p className="font-semibold text-white">No verified credentials entered yet</p>
                <p className="text-[11px] text-surface-steel/50 mt-1">
                  Add commercial registration, competency certificates, or engineering practice licenses.
                </p>
              </div>
            ) : (
              standards.map((std) => (
                <div
                  key={std.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-brand-navy border border-white/10 text-brand-blue-light">
                      <Award className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{std.name}</span>
                        {std.category && (
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-surface-steel/70">
                            {std.category}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-surface-steel/60 mt-0.5">
                        Issuing body: {std.issuing_body || 'Ministry of Urban Development & Infrastructure'}
                        {std.certificate_number ? ` • Ref: ${std.certificate_number}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditStandard(std)}
                      className="p-1.5 rounded-lg text-surface-steel/70 hover:text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(std)}
                      className="p-1.5 rounded-lg text-surface-steel/70 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Standard Modal */}
      {isStandardModalOpen && editingStandard && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-navy-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-brand-navy border border-white/15 shadow-elevated p-6 text-white flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-heading font-bold text-white">
                {editingStandard.id ? `Edit Credential: ${editingStandard.name}` : 'Add Official Credential'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStandardModalOpen(false)}
                className="text-surface-steel/60 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStandard} className="mt-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Credential / Certificate Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingStandard.name || ''}
                  onChange={(e) =>
                    setEditingStandard((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. General Contractor Competency Certificate"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={editingStandard.issuing_body || ''}
                    onChange={(e) =>
                      setEditingStandard((prev) => ({ ...prev, issuing_body: e.target.value }))
                    }
                    placeholder="e.g. Ministry of Urban Development"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                    Registration / Certificate No.
                  </label>
                  <input
                    type="text"
                    value={editingStandard.certificate_number || ''}
                    onChange={(e) =>
                      setEditingStandard((prev) => ({ ...prev, certificate_number: e.target.value }))
                    }
                    placeholder="e.g. GC/2024/098"
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingStandard.category || ''}
                  onChange={(e) =>
                    setEditingStandard((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="e.g. Competency Certification, Commercial Registration"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Description / Verification Details
                </label>
                <textarea
                  rows={2}
                  value={editingStandard.description || ''}
                  onChange={(e) =>
                    setEditingStandard((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Factual scope of competency..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                  Internal Verification / Audit Notes (Private)
                </label>
                <textarea
                  rows={2}
                  value={editingStandard.internal_notes || ''}
                  onChange={(e) =>
                    setEditingStandard((prev) => ({ ...prev, internal_notes: e.target.value }))
                  }
                  placeholder="Renewal date, registry reference, internal file ID..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStandardModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-xs text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStandard}
                  className="px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-light text-xs font-semibold text-white shadow disabled:opacity-50"
                >
                  {isSavingStandard ? 'Saving...' : 'Save Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Quality Standard / Credential"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteStandardConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Sticky Publish Bar */}
      <PublishBar
        hasDraft={envelope?.has_draft}
        publishedAt={envelope?.published_at}
        updatedAt={envelope?.updated_at}
        isDirty={isDirty}
        isSavingDraft={isSavingDraft}
        isPublishing={isPublishing}
        isDiscarding={isDiscarding}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscardDraft={envelope?.has_draft ? handleDiscardDraft : undefined}
      />
    </div>
  );
}
