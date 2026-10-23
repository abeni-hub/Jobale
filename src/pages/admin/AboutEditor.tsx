import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl, unwrapList } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { AboutContent, AboutBlock, SingletonEnvelope, IconTextItem, AboutStat } from '@/lib/types';
import PublishBar from '@/components/admin/PublishBar';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import IconPicker, { renderLucideIcon } from '@/components/admin/IconPicker';
import {
  Info,
  Target,
  Eye,
  Heart,
  History,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  Loader2,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function AboutEditor() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [about, setAbout] = useState<Partial<AboutContent>>({});
  const [envelope, setEnvelope] = useState<SingletonEnvelope<AboutContent> | null>(null);
  const [aboutBlocks, setAboutBlocks] = useState<AboutBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Modal states
  const [mediaPickerField, setMediaPickerField] = useState<'main_image' | 'secondary_image' | null>(null);

  const fetchAbout = useCallback(async () => {
    try {
      setLoading(true);
      const [aboutRes, blocksRes] = await Promise.all([
        api.get<SingletonEnvelope<AboutContent>>('/cms/about/'),
        api.get<unknown>('/cms/about-blocks/'),
      ]);
      setEnvelope(aboutRes);
      const initial = aboutRes.draft ? { ...aboutRes.live, ...aboutRes.draft } : aboutRes.live;
      setAbout(initial || {});
      setAboutBlocks(unwrapList<AboutBlock>(blocksRes));
      setIsDirty(false);
    } catch (err) {
      error((err as Error).message || 'Failed to load About section');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const handleChange = (field: keyof AboutContent, value: unknown) => {
    setAbout((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Structured Core Values handlers
  const handleAddCoreValue = () => {
    const current = (about.core_values as IconTextItem[]) || [];
    const updated: IconTextItem[] = [
      ...current,
      { title: 'New Core Value', description: 'Description of this engineering value...', icon: 'ShieldCheck' },
    ];
    handleChange('core_values', updated);
  };

  const handleUpdateCoreValue = (index: number, updatedItem: Partial<IconTextItem>) => {
    const current = [...((about.core_values as IconTextItem[]) || [])];
    if (current[index]) {
      current[index] = { ...current[index], ...updatedItem };
      handleChange('core_values', current);
    }
  };

  const handleRemoveCoreValue = (index: number) => {
    const current = [...((about.core_values as IconTextItem[]) || [])];
    current.splice(index, 1);
    handleChange('core_values', current);
  };

  // Structured Stats handlers
  const handleAddStat = () => {
    const current = (about.stats as AboutStat[]) || [];
    const updated: AboutStat[] = [
      ...current,
      { label: 'Stat Metric', value: '10', suffix: '+' },
    ];
    handleChange('stats', updated);
  };

  const handleUpdateStat = (index: number, updatedItem: Partial<AboutStat>) => {
    const current = [...((about.stats as AboutStat[]) || [])];
    if (current[index]) {
      current[index] = { ...current[index], ...updatedItem };
      handleChange('stats', current);
    }
  };

  const handleRemoveStat = (index: number) => {
    const current = [...((about.stats as AboutStat[]) || [])];
    current.splice(index, 1);
    handleChange('stats', current);
  };

  // Publish / Draft handlers
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      await api.put('/cms/about/', { fields: about });
      success('Draft changes saved for About Us. Publish to make them live.', 'Draft Saved');
      await fetchAbout();
    } catch (err) {
      error((err as Error).message || 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await api.post('/cms/about/', { fields: about });
      success('About Us content published successfully!', 'Published');
      await fetchAbout();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to publish About content');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!window.confirm('Are you sure you want to discard your staged About draft?')) return;
    try {
      setIsDiscarding(true);
      await api.delete('/cms/about/');
      success('Staged draft discarded.');
      await fetchAbout();
    } catch (err) {
      error((err as Error).message || 'Failed to discard draft');
    } finally {
      setIsDiscarding(false);
    }
  };

  // About Blocks actions
  const handleCreateBlock = async () => {
    try {
      await api.post('/cms/about-blocks/', {
        title: 'New Section Block',
        body: 'Provide content for this engineering block...',
        icon: 'Building2',
        is_visible: true,
        display_order: aboutBlocks.length + 1,
      });
      success('New About section block created.');
      await fetchAbout();
    } catch (err) {
      error((err as Error).message || 'Failed to create block');
    }
  };

  const handleDeleteBlock = async (id: number) => {
    if (!window.confirm('Delete this about block?')) return;
    try {
      await api.delete(`/cms/about-blocks/${id}/`);
      success('About block removed.');
      await fetchAbout();
    } catch (err) {
      error((err as Error).message || 'Failed to delete block');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-steel/60">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light mb-2" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-body">
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
          About Us Content Editor
        </h2>
        <p className="text-xs text-surface-steel/70">
          Manage company overview, mission & vision statements, core values, company history, and key metrics.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Overview & Headings */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Info className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Section Heading & Overview
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Eyebrow Label
              </label>
              <input
                type="text"
                value={about.eyebrow || ''}
                onChange={(e) => handleChange('eyebrow', e.target.value)}
                placeholder="ABOUT JOBALE ENGINEERING PLC"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Main Heading
              </label>
              <input
                type="text"
                value={about.heading || ''}
                onChange={(e) => handleChange('heading', e.target.value)}
                placeholder="Engineering with Integrity & Execution"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Introduction Lead Paragraph
              </label>
              <textarea
                rows={2}
                value={about.introduction || ''}
                onChange={(e) => handleChange('introduction', e.target.value)}
                placeholder="Jobale Engineering PLC is a general contractor and civil engineering company based in Adama, Ethiopia..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Detailed Company Overview
              </label>
              <textarea
                rows={4}
                value={about.overview || ''}
                onChange={(e) => handleChange('overview', e.target.value)}
                placeholder="Comprehensive background on the company's capabilities, operational footprint, and contracting standards..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Mission & Vision */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Target className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Mission & Vision Statements
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Company Mission
              </label>
              <textarea
                rows={3}
                value={about.mission || ''}
                onChange={(e) => handleChange('mission', e.target.value)}
                placeholder="To deliver high-standard construction and civil engineering projects with precision, reliability, and accountability..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Company Vision
              </label>
              <textarea
                rows={3}
                value={about.vision || ''}
                onChange={(e) => handleChange('vision', e.target.value)}
                placeholder="To be a respected engineering and construction partner known for structural excellence and sustainable project delivery..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Core Values (Structured List) */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-brand-blue-light" />
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                Core Engineering Values
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddCoreValue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Value</span>
            </button>
          </div>

          <div className="space-y-4">
            {((about.core_values as IconTextItem[]) || []).map((val, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-brand-blue/20 text-brand-blue-light">
                      {renderLucideIcon(val.icon || 'ShieldCheck', 'w-4 h-4')}
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Core Value #{idx + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoreValue(idx)}
                    className="text-surface-steel/50 hover:text-rose-400 p-1"
                    title="Remove value"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-surface-steel/70 mb-1">Title</label>
                    <input
                      type="text"
                      value={val.title}
                      onChange={(e) => handleUpdateCoreValue(idx, { title: e.target.value })}
                      placeholder="e.g. Safety First"
                      className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <IconPicker
                      value={val.icon || 'ShieldCheck'}
                      onChange={(iconName) => handleUpdateCoreValue(idx, { icon: iconName })}
                      label="Value Icon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-surface-steel/70 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={val.description}
                    onChange={(e) => handleUpdateCoreValue(idx, { description: e.target.value })}
                    placeholder="Brief explanation of how this value guides projects..."
                    className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Company History */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <History className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Company History & Growth
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
              Historical Summary
            </label>
            <textarea
              rows={4}
              value={about.history || ''}
              onChange={(e) => handleChange('history', e.target.value)}
              placeholder="Founded in Adama, Ethiopia, Jobale Engineering PLC has progressively expanded its construction and civil capabilities..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        </div>

        {/* Card 5: Key Statistics Metrics */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-brand-blue-light" />
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                Statistics & Milestones
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddStat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Metric</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {((about.stats as AboutStat[]) || []).map((st, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-blue-light font-bold">Metric #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(idx)}
                    className="text-surface-steel/50 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] text-surface-steel/70 mb-1">Label</label>
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => handleUpdateStat(idx, { label: e.target.value })}
                      placeholder="Projects Completed"
                      className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-surface-steel/70 mb-1">Value & Suffix</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={st.value}
                        onChange={(e) => handleUpdateStat(idx, { value: e.target.value })}
                        placeholder="10"
                        className="w-full px-2 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={st.suffix || ''}
                        onChange={(e) => handleUpdateStat(idx, { suffix: e.target.value })}
                        placeholder="+"
                        className="w-8 px-1 py-2 text-center rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 6: Supporting Imagery */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <ImageIcon className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              About Section Imagery
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-surface-steel/90">Main About Image</label>
              <div className="h-44 rounded-xl bg-[#07111E] border border-white/15 overflow-hidden flex items-center justify-center">
                {about.main_image ? (
                  <img src={mediaUrl(about.main_image)} alt="About main" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-surface-steel/40 font-mono">No image selected</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerField('main_image')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light text-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select Main Image</span>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-surface-steel/90">Secondary / Detail Image</label>
              <div className="h-44 rounded-xl bg-[#07111E] border border-white/15 overflow-hidden flex items-center justify-center">
                {about.secondary_image ? (
                  <img src={mediaUrl(about.secondary_image)} alt="About secondary" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-surface-steel/40 font-mono">Optional secondary image</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerField('secondary_image')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light text-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select Secondary Image</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 7: Custom About Blocks */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-brand-blue-light" />
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                Additional About Subsections ({aboutBlocks.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCreateBlock}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block</span>
            </button>
          </div>

          <div className="space-y-3">
            {aboutBlocks.map((blk) => (
              <div
                key={blk.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-brand-navy border border-white/10 text-brand-blue-light">
                    {renderLucideIcon(blk.icon, 'w-4 h-4')}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{blk.title}</h4>
                    <p className="text-[11px] text-surface-steel/60 line-clamp-1">{blk.body}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteBlock(blk.id)}
                  className="text-surface-steel/50 hover:text-rose-400 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerField !== null}
        onClose={() => setMediaPickerField(null)}
        currentValue={mediaPickerField ? (about[mediaPickerField] as string) : null}
        onSelect={(url) => {
          if (mediaPickerField) {
            handleChange(mediaPickerField, url);
          }
        }}
        title="Select About Image"
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
