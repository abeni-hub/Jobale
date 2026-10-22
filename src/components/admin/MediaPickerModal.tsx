import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api, mediaUrl, unwrapList } from '@/lib/api';
import type { MediaAsset } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import {
  Upload,
  Image as ImageIcon,
  Search,
  X,
  Check,
  Loader2,
  FileText,
} from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: MediaAsset) => void;
  currentValue?: string | null;
  title?: string;
  kind?: 'image' | 'document' | 'all';
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue,
  title = 'Select Media Asset',
  kind = 'image',
}: MediaPickerModalProps) {
  const { success, error } = useToast();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<unknown>('/cms/media/');
      const list = unwrapList<MediaAsset>(res);
      const filtered = kind === 'all' ? list : list.filter((a) => a.kind === kind);
      setAssets(filtered);
    } catch (err) {
      error((err as Error).message || 'Failed to load media assets');
    } finally {
      setLoading(false);
    }
  }, [error, kind]);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen, fetchAssets]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // File validation
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      error(`File size exceeds ${maxMb}MB limit.`);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('alt_text', file.name.replace(/\.[^/.]+$/, ''));

      const created = await api.post<MediaAsset>('/cms/media/', formData);
      success('File uploaded successfully to media library.');
      await fetchAssets();
      onSelect(created.url || created.file, created);
      onClose();
    } catch (err) {
      error((err as Error).message || 'Failed to upload media file.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredAssets = assets.filter(
    (a) =>
      a.title?.toLowerCase().includes(search.toLowerCase().trim()) ||
      a.filename?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-brand-navy-dark/80 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-2xl bg-brand-navy border border-white/15 shadow-elevated p-6 text-white flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-brand-blue/20 text-brand-blue-light">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-heading font-bold text-white">{title}</h3>
              <p className="text-xs text-surface-steel/60">
                Choose an existing asset from the library or upload a new one
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-surface-steel/60 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-3 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'library'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-surface-steel/70 hover:bg-white/5'
            }`}
          >
            Media Library ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'upload'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-surface-steel/70 hover:bg-white/5'
            }`}
          >
            Upload New File
          </button>
        </div>

        {activeTab === 'library' ? (
          <>
            {/* Search */}
            <div className="mt-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-steel/50" />
              <input
                type="text"
                placeholder="Search by filename or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-brand-navy-dark/70 border border-white/10 text-sm text-white placeholder-surface-steel/40 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Grid */}
            <div className="mt-4 overflow-y-auto flex-1 min-h-[280px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-surface-steel/60">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light mb-2" />
                  <p className="text-sm">Loading media library...</p>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-xl">
                  <ImageIcon className="w-10 h-10 text-surface-steel/40 mb-3" />
                  <p className="text-sm font-medium text-white mb-1">No media assets found</p>
                  <p className="text-xs text-surface-steel/60 mb-4 max-w-sm">
                    {search
                      ? 'No items match your search. Try another query.'
                      : 'You have not uploaded any media files yet. Upload a file to get started.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 rounded-lg bg-brand-blue text-xs font-semibold text-white"
                  >
                    Upload Asset
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                  {filteredAssets.map((asset) => {
                    const resolved = mediaUrl(asset.url || asset.file);
                    const isSelected = currentValue === (asset.url || asset.file) || currentValue === resolved;

                    return (
                      <div
                        key={asset.id}
                        onClick={() => {
                          onSelect(asset.url || asset.file, asset);
                          onClose();
                        }}
                        className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-square flex flex-col ${
                          isSelected
                            ? 'border-brand-blue-light ring-2 ring-brand-blue/50 bg-brand-blue/10'
                            : 'border-white/10 bg-brand-navy-dark/50 hover:border-white/30'
                        }`}
                      >
                        {asset.kind === 'image' ? (
                          <img
                            src={resolved}
                            alt={asset.alt_text || asset.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-surface-steel/70">
                            <FileText className="w-10 h-10 text-brand-blue-light mb-1" />
                            <span className="text-[10px] uppercase font-mono">{asset.extension}</span>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-[11px] truncate text-white">
                          <p className="truncate font-medium">{asset.title || asset.filename}</p>
                          <p className="text-[9px] text-surface-steel/60">{asset.size_display}</p>
                        </div>

                        {isSelected && (
                          <span className="absolute top-2 right-2 p-1 rounded-full bg-brand-blue text-white shadow">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Upload tab */
          <div className="mt-4 flex-1 flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-white/20 rounded-2xl bg-brand-navy-dark/40 hover:border-brand-blue-light/50 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              accept={kind === 'image' ? 'image/*' : '*/*'}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center text-center">
                <Loader2 className="w-12 h-12 text-brand-blue-light animate-spin mb-3" />
                <p className="text-sm font-semibold text-white">Uploading media asset...</p>
                <p className="text-xs text-surface-steel/60 mt-1">
                  Validating file size and optimizing asset
                </p>
              </div>
            ) : (
              <div
                className="flex flex-col items-center text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-4 rounded-2xl bg-brand-blue/10 text-brand-blue-light mb-3">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-heading font-semibold text-white mb-1">
                  Click to browse or drag file here
                </h4>
                <p className="text-xs text-surface-steel/60 max-w-sm mb-4">
                  Supports JPG, PNG, WEBP, GIF, SVG up to 10MB. Assets are stored securely and
                  can be reused anywhere across the website.
                </p>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-semibold tracking-wide shadow-md transition-all"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-surface-steel/60">
          <span>Max upload: 10MB</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
