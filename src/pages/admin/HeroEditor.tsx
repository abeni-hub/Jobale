import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { HeroContent, SingletonEnvelope } from '@/lib/types';
import PublishBar from '@/components/admin/PublishBar';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import BlueprintAnimation from '@/components/BlueprintAnimation';
import {
  Sparkles,
  Image as ImageIcon,
  Sliders,
  Layers,
  ArrowRight,
  Eye,
  Loader2,
  Upload,
  Factory,
} from 'lucide-react';

export default function HeroEditor() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [hero, setHero] = useState<Partial<HeroContent>>({});
  const [envelope, setEnvelope] = useState<SingletonEnvelope<HeroContent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Media Picker state
  const [mediaPickerField, setMediaPickerField] = useState<'hero_image' | 'background_image' | null>(null);

  const fetchHero = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<SingletonEnvelope<HeroContent>>('/cms/hero/');
      setEnvelope(res);
      const initial = res.draft ? { ...res.live, ...res.draft } : res.live;
      setHero(initial || {});
      setIsDirty(false);
    } catch (err) {
      error((err as Error).message || 'Failed to load Hero section content');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchHero();
  }, [fetchHero]);

  const handleChange = (field: keyof HeroContent, value: unknown) => {
    setHero((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      await api.put('/cms/hero/', { fields: hero });
      success('Draft hero changes saved. Publish to make them visible to website visitors.', 'Draft Saved');
      await fetchHero();
    } catch (err) {
      error((err as Error).message || 'Failed to save draft hero changes');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await api.post('/cms/hero/', { fields: hero });
      success('Hero section published live successfully!', 'Published');
      await fetchHero();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to publish hero section');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!window.confirm('Are you sure you want to discard your staged hero draft?')) return;
    try {
      setIsDiscarding(true);
      await api.delete('/cms/hero/');
      success('Staged hero draft discarded.');
      await fetchHero();
    } catch (err) {
      error((err as Error).message || 'Failed to discard draft');
    } finally {
      setIsDiscarding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-steel/60">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light mb-2" />
      </div>
    );
  }

  const bgImageSource = hero.background_image
    ? mediaUrl(hero.background_image)
    : hero.hero_image
    ? mediaUrl(hero.hero_image)
    : 'https://images.pexels.com/photos/4170185/pexels-photo-4170185.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080';

  const overlayOpacity = typeof hero.overlay_opacity === 'number' ? hero.overlay_opacity : 0.8;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
            Hero Section Editor
          </h2>
          <p className="text-xs text-surface-steel/70">
            Edit the main headline, call-to-actions, background imagery, and architectural animations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLivePreview(!showLivePreview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all ${
            showLivePreview
              ? 'bg-brand-blue text-white border-brand-blue-light shadow-md'
              : 'bg-[#0F2137] text-surface-steel border-white/10 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{showLivePreview ? 'Hide Live Preview' : 'Show Live Preview'}</span>
        </button>
      </div>

      {/* Live Preview Panel */}
      {showLivePreview && (
        <div className="rounded-3xl border border-white/15 overflow-hidden shadow-elevated bg-[#07111E]">
          <div className="px-4 py-2.5 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs text-surface-steel/70">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Interactive Live Preview (Responsive Desktop Scale)</span>
            </span>
            <span className="font-mono text-[11px] text-surface-steel/50">
              Matches Public Homepage
            </span>
          </div>

          <div className="relative min-h-[460px] flex items-center overflow-hidden p-8 sm:p-14">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={bgImageSource}
                alt="Hero preview background"
                className="h-full w-full object-cover"
                style={{
                  objectPosition: hero.image_position || 'center',
                }}
              />
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#041D33] via-[#082C4C] to-[#082C4C]"
                style={{ opacity: overlayOpacity }}
              />
            </div>

            {/* Architectural Blueprint Animation Overlay */}
            {hero.show_blueprint !== false && (
              <div className="absolute inset-y-0 right-0 w-full lg:w-2/3 pointer-events-none opacity-25 overflow-hidden">
                <BlueprintAnimation loop={true} idPrefix="admin-preview-bp" />
              </div>
            )}

            {/* Hero Content Overlay */}
            <div className="relative z-10 max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-semibold text-brand-blue-light uppercase tracking-wider mb-4">
                <Factory className="w-4 h-4" />
                <span>{hero.eyebrow || 'JOBALE ENGINEERING PLC | CONSTRUCTION & CIVIL WORKS'}</span>
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white font-heading font-extrabold tracking-tight leading-[1.1]">
                {hero.headline || 'Building with Precision.'}
                {hero.headline_accent && (
                  <>
                    <br />
                    <span className="text-brand-blue-light">{hero.headline_accent}</span>
                  </>
                )}
              </h1>

              <p className="mt-4 text-sm sm:text-base text-surface-steel max-w-xl leading-relaxed">
                {hero.supporting_text ||
                  'From building construction to civil infrastructure, Jobale Engineering delivers practical engineering solutions grounded in quality, safety, reliability, and lasting value.'}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue text-white font-heading font-semibold text-xs tracking-wide shadow-md">
                  <span>{hero.primary_cta_label || 'Explore Our Projects'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-transparent text-white border border-white/40 font-heading font-semibold text-xs tracking-wide">
                  <span>{hero.secondary_cta_label || 'Discuss Your Project'}</span>
                </span>
              </div>

              {hero.slogan && (
                <p className="mt-6 text-xs text-surface-steel/60 font-heading italic">
                  "{hero.slogan}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editing Form */}
      <div className="space-y-6">
        {/* Card 1: Headings & Copy */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Sparkles className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Headline Copy & Eyebrow
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Eyebrow Text (Small Pre-Headline Label)
              </label>
              <input
                type="text"
                value={hero.eyebrow || ''}
                onChange={(e) => handleChange('eyebrow', e.target.value)}
                placeholder="JOBALE ENGINEERING PLC | CONSTRUCTION & CIVIL WORKS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                  Main Headline (Line 1) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={hero.headline || ''}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  placeholder="Building with Precision."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                  Accent Headline (Line 2)
                </label>
                <input
                  type="text"
                  value={hero.headline_accent || ''}
                  onChange={(e) => handleChange('headline_accent', e.target.value)}
                  placeholder="Delivering with Confidence."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Supporting Paragraph
              </label>
              <textarea
                rows={3}
                value={hero.supporting_text || ''}
                onChange={(e) => handleChange('supporting_text', e.target.value)}
                placeholder="From building construction to civil infrastructure, Jobale Engineering delivers..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Hero Slogan
              </label>
              <input
                type="text"
                value={hero.slogan || ''}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder="Building Excellence, Delivering Trust."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Call to Action Buttons */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <ArrowRight className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Call-to-Action Buttons
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-bold text-white uppercase">Primary Button (Blue)</h4>
              <div>
                <label className="block text-[11px] text-surface-steel/70 mb-1">Button Label</label>
                <input
                  type="text"
                  value={hero.primary_cta_label || ''}
                  onChange={(e) => handleChange('primary_cta_label', e.target.value)}
                  placeholder="Explore Our Projects"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-surface-steel/70 mb-1">Destination URL / Anchor</label>
                <input
                  type="text"
                  value={hero.primary_cta_url || ''}
                  onChange={(e) => handleChange('primary_cta_url', e.target.value)}
                  placeholder="/projects"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-bold text-white uppercase">Secondary Button (Outlined)</h4>
              <div>
                <label className="block text-[11px] text-surface-steel/70 mb-1">Button Label</label>
                <input
                  type="text"
                  value={hero.secondary_cta_label || ''}
                  onChange={(e) => handleChange('secondary_cta_label', e.target.value)}
                  placeholder="Discuss Your Project"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-surface-steel/70 mb-1">Destination URL / Anchor</label>
                <input
                  type="text"
                  value={hero.secondary_cta_url || ''}
                  onChange={(e) => handleChange('secondary_cta_url', e.target.value)}
                  placeholder="/contact"
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Background Imagery & Blueprint Controls */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <ImageIcon className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Background Imagery & Blueprint Animation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Background Image Field */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-surface-steel/90">
                Hero Background Image
              </label>
              <div className="h-40 rounded-xl bg-[#07111E] border border-white/15 overflow-hidden flex items-center justify-center relative group">
                <img
                  src={bgImageSource}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerField('background_image')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light hover:text-white text-xs font-semibold transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Background Image</span>
              </button>
            </div>

            {/* Visual Controls */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-surface-steel/90 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand-blue-light" />
                    <span>Overlay Opacity ({Math.round(overlayOpacity * 100)}%)</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.95"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => handleChange('overlay_opacity', parseFloat(e.target.value))}
                  className="w-full accent-brand-blue cursor-pointer"
                />
                <p className="text-[11px] text-surface-steel/50 mt-1">
                  Adjust darkness to ensure text readability over the image.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                  Image Focus Position
                </label>
                <select
                  value={hero.image_position || 'center'}
                  onChange={(e) => handleChange('image_position', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hero.show_blueprint !== false}
                    onChange={(e) => handleChange('show_blueprint', e.target.checked)}
                    className="w-4 h-4 rounded bg-[#07111E] border-white/20 text-brand-blue focus:ring-brand-blue"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">
                      Enable Blueprint CAD Line Animation
                    </span>
                    <span className="text-surface-steel/60">
                      Renders the GSAP animated three-building blueprint in the background.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerField !== null}
        onClose={() => setMediaPickerField(null)}
        currentValue={mediaPickerField ? (hero[mediaPickerField] as string) : null}
        onSelect={(url) => {
          if (mediaPickerField) {
            handleChange(mediaPickerField, url);
          }
        }}
        title="Select Hero Image"
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
