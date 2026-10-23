import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api, mediaUrl, unwrapList } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { MediaAsset } from '@/lib/types';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  AlertTriangle,
  Check,
  Calendar,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';

interface MediaUsageReport {
  asset_id: number;
  references: Array<{ section: string; field: string; object_label: string }>;
  is_referenced: boolean;
}

export default function MediaLibraryPage() {
  const { success, error, warning } = useToast();

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Asset deletion and usage checking
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [usageReport, setUsageReport] = useState<MediaUsageReport | null>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview lightbox
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<unknown>('/cms/media/');
      setAssets(unwrapList<MediaAsset>(res));
    } catch (err) {
      error((err as Error).message || 'Failed to load media assets');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      error(`File size exceeds the ${maxMb}MB limit.`);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('alt_text', file.name.replace(/\.[^/.]+$/, ''));

      await api.post('/cms/media/', formData);
      success(`Asset "${file.name}" uploaded successfully.`);
      await fetchAssets();
    } catch (err) {
      error((err as Error).message || 'Failed to upload asset');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (asset: MediaAsset) => {
    const full = mediaUrl(asset.url || asset.file);
    navigator.clipboard.writeText(full);
    setCopiedId(asset.id);
    success('Media URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleInitiateDelete = async (asset: MediaAsset) => {
    setDeleteTarget(asset);
    try {
      setIsCheckingUsage(true);
      const report = await api.get<MediaUsageReport>(`/cms/media/usage/?asset_id=${asset.id}`);
      setUsageReport(report);
      if (report.is_referenced) {
        warning(
          `Notice: This asset is currently referenced in "${report.references[0]?.section}". Deleting it may cause missing imagery.`,
          'Asset In Use'
        );
      }
    } catch {
      // Safe fallback if usage check returns 404
      setUsageReport(null);
    } finally {
      setIsCheckingUsage(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.delete(`/cms/media/${deleteTarget.id}/`);
      success(`Asset "${deleteTarget.title || deleteTarget.filename}" deleted.`);
      setDeleteTarget(null);
      setUsageReport(null);
      await fetchAssets();
    } catch (err) {
      error((err as Error).message || 'Failed to delete asset');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.title?.toLowerCase().includes(search.toLowerCase().trim()) ||
      a.filename?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
            Media Asset Library
          </h2>
          <p className="text-xs text-surface-steel/70">
            Upload, preview, and reuse images and documents across your corporate engineering website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-heading font-bold tracking-wide shadow-md transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload New Asset</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0F2137] border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-steel/50 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#07111E]/80 border border-white/10 text-white text-xs placeholder-surface-steel/40 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="text-xs text-surface-steel/70 flex items-center gap-4">
          <span>Total Assets: <strong className="text-white">{assets.length}</strong></span>
          <span>Max Size: <strong className="text-surface-steel/90">10MB</strong></span>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-5 shadow-card min-h-[360px]">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-surface-steel/60">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-20 text-center text-xs text-surface-steel/60">
            <ImageIcon className="w-12 h-12 mx-auto text-surface-steel/30 mb-3" />
            <p className="text-sm font-semibold text-white mb-1">No media assets found</p>
            <p className="max-w-xs mx-auto mb-4">
              {search ? 'Try clearing your search term.' : 'Click "Upload New Asset" to add photography or documents.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAssets.map((asset) => {
              const resolved = mediaUrl(asset.url || asset.file);
              return (
                <div
                  key={asset.id}
                  className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#07111E] flex flex-col hover:border-brand-blue-light/50 transition-all shadow"
                >
                  <div
                    className="aspect-square w-full overflow-hidden bg-black/40 flex items-center justify-center cursor-pointer relative"
                    onClick={() => setPreviewAsset(asset)}
                  >
                    {asset.kind === 'image' ? (
                      <img
                        src={resolved}
                        alt={asset.alt_text || asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-surface-steel/60 p-4">
                        <FileText className="w-10 h-10 text-brand-blue-light mb-1" />
                        <span className="text-[10px] uppercase font-mono font-bold">
                          {asset.extension}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white truncate" title={asset.title || asset.filename}>
                        {asset.title || asset.filename}
                      </h4>
                      <p className="text-[10px] text-surface-steel/50 font-mono mt-0.5">
                        {asset.size_display} • {asset.extension?.toUpperCase()}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(asset)}
                        className="text-surface-steel/70 hover:text-white flex items-center gap-1 text-[11px]"
                        title="Copy direct URL"
                      >
                        {copiedId === asset.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInitiateDelete(asset)}
                        className="text-surface-steel/50 hover:text-rose-400 p-1"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-brand-navy-dark/90 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-brand-navy border border-white/15 p-6 shadow-elevated text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-heading font-bold text-white truncate">
                {previewAsset.title || previewAsset.filename}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="text-surface-steel/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-black/60 flex items-center justify-center p-2 mb-4">
              <img
                src={mediaUrl(previewAsset.url || previewAsset.file)}
                alt={previewAsset.alt_text}
                className="max-h-[55vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="text-xs text-surface-steel/70 space-y-1 font-mono">
              <p>Path: {previewAsset.file}</p>
              <p>Size: {previewAsset.size_display} ({previewAsset.size_bytes} bytes)</p>
              <p>Uploaded: {new Date(previewAsset.created_at).toLocaleString()}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleCopyUrl(previewAsset)}
                className="px-4 py-2 rounded-lg bg-brand-blue text-xs font-semibold text-white"
              >
                Copy URL
              </button>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-2 rounded-lg bg-white/10 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Usage Report */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Media Asset"
        message={
          usageReport?.is_referenced
            ? `WARNING: This media asset is actively referenced by "${usageReport.references[0]?.section}". Deleting it will cause broken image links on published pages. Are you certain you want to delete "${deleteTarget?.filename}"?`
            : `Are you sure you want to delete "${deleteTarget?.filename}"? This action cannot be undone.`
        }
        confirmLabel={usageReport?.is_referenced ? 'Delete Anyway' : 'Delete Asset'}
        isLoading={isDeleting || isCheckingUsage}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteTarget(null);
          setUsageReport(null);
        }}
      />
    </div>
  );
}
