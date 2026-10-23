import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { SEOSettings, SingletonEnvelope } from '@/lib/types';
import PublishBar from '@/components/admin/PublishBar';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import {
  Globe,
  Share2,
  Image as ImageIcon,
  Loader2,
  Upload,
  Search,
} from 'lucide-react';

export default function SEOEditor() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [seo, setSeo] = useState<Partial<SEOSettings>>({});
  const [envelope, setEnvelope] = useState<SingletonEnvelope<SEOSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fetchSeo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<SingletonEnvelope<SEOSettings>>('/cms/seo/');
      setEnvelope(res);
      const initial = res.draft ? { ...res.live, ...res.draft } : res.live;
      setSeo(initial || {});
      setIsDirty(false);
    } catch (err) {
      error((err as Error).message || 'Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchSeo();
  }, [fetchSeo]);

  const handleChange = (field: keyof SEOSettings, value: unknown) => {
    setSeo((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      await api.put('/cms/seo/', { fields: seo });
      success('Draft SEO settings saved. Publish to make them active.', 'Draft Saved');
      await fetchSeo();
    } catch (err) {
      error((err as Error).message || 'Failed to save SEO draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await api.post('/cms/seo/', { fields: seo });
      success('SEO metadata published live successfully!', 'Published');
      await fetchSeo();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to publish SEO');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!window.confirm('Discard staged SEO changes?')) return;
    try {
      setIsDiscarding(true);
      await api.delete('/cms/seo/');
      success('Staged draft discarded.');
      await fetchSeo();
    } catch (err) {
      error((err as Error).message || 'Failed to discard draft');
    } finally {
      setIsDiscarding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-steel/60">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
      </div>
    );
  }

  const resolvedOg = seo.og_image ? mediaUrl(seo.og_image) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-body">
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
          Search Engine Optimization (SEO) & Social Sharing
        </h2>
        <p className="text-xs text-surface-steel/70">
          Manage how Jobale Engineering appears on Google, Bing, LinkedIn, Facebook, and Twitter.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Search Engine Snippet Preview & Meta Fields */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Search className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Search Engine Listing
            </h3>
          </div>

          {/* Google Preview */}
          <div className="p-4 rounded-xl bg-[#07111E] border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase text-surface-steel/40">
              Google Search Result Simulation
            </span>
            <div className="text-xs text-emerald-400 font-mono truncate">
              {seo.canonical_url || 'https://www.jobaleengineering.com'}
            </div>
            <h4 className="text-base text-brand-blue-light font-medium hover:underline cursor-pointer truncate">
              {seo.page_title || 'Jobale Engineering PLC | Construction & Civil Engineering in Adama, Ethiopia'}
            </h4>
            <p className="text-xs text-surface-steel/80 line-clamp-2">
              {seo.meta_description ||
                'General construction and civil engineering company in Adama, Ethiopia. Building construction, civil infrastructure, water supply, renovation, and maintenance.'}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Default Page Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={seo.page_title || ''}
                onChange={(e) => handleChange('page_title', e.target.value)}
                placeholder="Jobale Engineering PLC | Construction & Civil Engineering in Adama, Ethiopia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Meta Description ({seo.meta_description?.length || 0} / 160 characters recommended)
              </label>
              <textarea
                rows={3}
                value={seo.meta_description || ''}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                placeholder="Comprehensive summary of engineering competencies, location, and services..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Canonical URL
              </label>
              <input
                type="text"
                value={seo.canonical_url || ''}
                onChange={(e) => handleChange('canonical_url', e.target.value)}
                placeholder="https://www.jobaleengineering.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Open Graph & Social Sharing */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Share2 className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Social Sharing (Open Graph & Twitter Cards)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                  Social Sharing Title
                </label>
                <input
                  type="text"
                  value={seo.social_title || ''}
                  onChange={(e) => handleChange('social_title', e.target.value)}
                  placeholder="Jobale Engineering PLC — Building Excellence"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                  Social Sharing Description
                </label>
                <textarea
                  rows={3}
                  value={seo.social_description || ''}
                  onChange={(e) => handleChange('social_description', e.target.value)}
                  placeholder="General contractor and civil engineering company based in Adama, Ethiopia..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-surface-steel/90">
                Open Graph Social Sharing Banner Image
              </label>
              <div className="h-40 rounded-xl bg-[#07111E] border border-white/15 overflow-hidden flex items-center justify-center relative">
                {resolvedOg ? (
                  <img src={resolvedOg} alt="OG banner" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-surface-steel/40 font-mono">1200x630px image recommended</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light hover:text-white text-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select / Upload Social Banner</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        currentValue={seo.og_image}
        onSelect={(url) => handleChange('og_image', url)}
        title="Select Social Share Banner (1200x630)"
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
