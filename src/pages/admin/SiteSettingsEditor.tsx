import React, { useState, useEffect, useCallback } from 'react';
import { api, mediaUrl } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { SiteSettings, SingletonEnvelope } from '@/lib/types';
import PublishBar from '@/components/admin/PublishBar';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import {
  Building2,
  Image as ImageIcon,
  Palette,
  Globe,
  Share2,
  Loader2,
  Upload,
} from 'lucide-react';

export default function SiteSettingsEditor() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [envelope, setEnvelope] = useState<SingletonEnvelope<SiteSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Media picker modal state
  const [mediaPickerField, setMediaPickerField] = useState<'logo' | 'logo_dark' | 'favicon' | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<SingletonEnvelope<SiteSettings>>('/cms/settings/');
      setEnvelope(res);
      // Active working copy: use draft if exists, else live
      const initial = res.draft ? { ...res.live, ...res.draft } : res.live;
      setSettings(initial || {});
      setIsDirty(false);
    } catch (err) {
      error((err as Error).message || 'Failed to load website settings');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (field: keyof SiteSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      await api.put('/cms/settings/', { fields: settings });
      success('Draft settings saved. Publish to make them live on the website.', 'Draft Saved');
      await fetchSettings();
    } catch (err) {
      error((err as Error).message || 'Failed to save draft settings');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await api.post('/cms/settings/', { fields: settings });
      success('Global website settings published live successfully!', 'Published');
      await fetchSettings();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to publish settings');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!window.confirm('Are you sure you want to discard your staged draft changes?')) return;
    try {
      setIsDiscarding(true);
      await api.delete('/cms/settings/');
      success('Staged draft discarded.');
      await fetchSettings();
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-body">
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
          Global Website Settings
        </h2>
        <p className="text-xs text-surface-steel/70">
          Manage company branding, logos, slogan, social channels, and global website configurations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Card 1: Company Identity */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Building2 className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Company Identity & Branding
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Company Display Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={settings.company_name || ''}
                onChange={(e) => handleChange('company_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Legal Registered Name
              </label>
              <input
                type="text"
                value={settings.legal_name || ''}
                onChange={(e) => handleChange('legal_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Company Slogan / Tagline
              </label>
              <input
                type="text"
                value={settings.slogan || ''}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder="Building Excellence, Delivering Trust."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Official Website URL
              </label>
              <input
                type="text"
                value={settings.website_url || ''}
                onChange={(e) => handleChange('website_url', e.target.value)}
                placeholder="https://www.jobaleengineering.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Company Logos & Imagery */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <ImageIcon className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Logos & Favicon
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Logo */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-surface-steel/90">
                Primary Company Logo
              </label>
              <div className="h-32 rounded-xl bg-white p-3 border border-white/20 flex items-center justify-center relative overflow-hidden group">
                {settings.logo ? (
                  <img
                    src={mediaUrl(settings.logo)}
                    alt="Company logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img
                    src="/Jobale_Engineering_PLC_logo-04.png"
                    alt="Default logo"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerField('logo')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light hover:text-white text-xs font-semibold transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select / Upload Logo</span>
              </button>
            </div>

            {/* Dark Logo */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-surface-steel/90">
                Alternate Logo (Dark Surfaces)
              </label>
              <div className="h-32 rounded-xl bg-[#07111E] p-3 border border-white/20 flex items-center justify-center relative overflow-hidden group">
                {settings.logo_dark ? (
                  <img
                    src={mediaUrl(settings.logo_dark)}
                    alt="Dark logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-surface-steel/40 font-mono">Uses primary logo</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerField('logo_dark')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light hover:text-white text-xs font-semibold transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select Dark Logo</span>
              </button>
            </div>

            {/* Favicon */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-surface-steel/90">
                Website Favicon
              </label>
              <div className="h-32 rounded-xl bg-[#07111E] p-3 border border-white/20 flex items-center justify-center relative overflow-hidden group">
                {settings.favicon ? (
                  <img
                    src={mediaUrl(settings.favicon)}
                    alt="Favicon preview"
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <span className="text-xs text-surface-steel/40 font-mono">Default /favicon.ico</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerField('favicon')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light hover:text-white text-xs font-semibold transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select Favicon</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Brand Colors */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Palette className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Brand Colors (Design System Constraints)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Primary Engineering Blue
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={settings.brand_primary || '#086BB7'}
                  onChange={(e) => handleChange('brand_primary', e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.brand_primary || '#086BB7'}
                  onChange={(e) => handleChange('brand_primary', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Deep Corporate Navy
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={settings.brand_navy || '#082C4C'}
                  onChange={(e) => handleChange('brand_navy', e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.brand_navy || '#082C4C'}
                  onChange={(e) => handleChange('brand_navy', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Accent Light Blue
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={settings.brand_accent || '#2A8AE0'}
                  onChange={(e) => handleChange('brand_accent', e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.brand_accent || '#2A8AE0'}
                  onChange={(e) => handleChange('brand_accent', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07111E]/80 border border-white/15 text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Social Media Links */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Share2 className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Social Media Channels
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                LinkedIn Profile URL
              </label>
              <input
                type="text"
                value={settings.social_linkedin || ''}
                onChange={(e) => handleChange('social_linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/jobale-engineering"
                className="w-full px-3.5 py-2 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Facebook Page URL
              </label>
              <input
                type="text"
                value={settings.social_facebook || ''}
                onChange={(e) => handleChange('social_facebook', e.target.value)}
                placeholder="https://facebook.com/jobaleengineering"
                className="w-full px-3.5 py-2 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Twitter / X Profile URL
              </label>
              <input
                type="text"
                value={settings.social_twitter || ''}
                onChange={(e) => handleChange('social_twitter', e.target.value)}
                placeholder="https://twitter.com/jobale_eng"
                className="w-full px-3.5 py-2 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
                Instagram URL
              </label>
              <input
                type="text"
                value={settings.social_instagram || ''}
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                placeholder="https://instagram.com/jobaleengineering"
                className="w-full px-3.5 py-2 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Card 5: Footer & Legal */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Globe className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Footer Copyright Text
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5">
              Copyright Notice
            </label>
            <input
              type="text"
              value={settings.footer_copyright || ''}
              onChange={(e) => handleChange('footer_copyright', e.target.value)}
              placeholder="Jobale Engineering PLC. All rights reserved."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerField !== null}
        onClose={() => setMediaPickerField(null)}
        currentValue={mediaPickerField ? (settings[mediaPickerField] as string) : null}
        onSelect={(url) => {
          if (mediaPickerField) {
            handleChange(mediaPickerField, url);
          }
        }}
        title={`Select ${mediaPickerField === 'favicon' ? 'Favicon' : 'Logo'}`}
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
