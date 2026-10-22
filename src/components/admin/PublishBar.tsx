import React from 'react';
import { Save, Send, RotateCcw, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface PublishBarProps {
  hasDraft?: boolean;
  publishedAt?: string | null;
  updatedAt?: string | null;
  isSavingDraft?: boolean;
  isPublishing?: boolean;
  isDiscarding?: boolean;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onDiscardDraft?: () => void;
  onTogglePreview?: () => void;
  showPreviewToggle?: boolean;
  isPreviewOpen?: boolean;
  isDirty?: boolean;
}

export default function PublishBar({
  hasDraft,
  publishedAt,
  isSavingDraft,
  isPublishing,
  isDiscarding,
  onSaveDraft,
  onPublish,
  onDiscardDraft,
  onTogglePreview,
  showPreviewToggle = false,
  isPreviewOpen = false,
  isDirty = false,
}: PublishBarProps) {
  return (
    <div className="sticky bottom-4 z-40 mt-8 rounded-2xl bg-brand-navy-dark/95 border border-white/15 p-4 shadow-elevated backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {hasDraft || isDirty ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Unpublished draft changes staged</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All changes are published</span>
          </div>
        )}

        {publishedAt && (
          <span className="hidden sm:inline text-[11px] text-surface-steel/50">
            Last published: {new Date(publishedAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {showPreviewToggle && onTogglePreview && (
          <button
            type="button"
            onClick={onTogglePreview}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors border ${
              isPreviewOpen
                ? 'bg-brand-blue/30 border-brand-blue-light text-white'
                : 'border-white/15 text-surface-steel/80 hover:bg-white/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewOpen ? 'Hide Preview' : 'Live Preview'}</span>
          </button>
        )}

        {hasDraft && onDiscardDraft && (
          <button
            type="button"
            onClick={onDiscardDraft}
            disabled={isDiscarding || isPublishing || isSavingDraft}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isDiscarding ? 'Discarding...' : 'Discard Draft'}</span>
          </button>
        )}

        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSavingDraft || isPublishing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-surface-steel hover:text-white hover:bg-white/10 text-xs font-semibold tracking-wide transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
          </button>
        )}

        {onPublish && (
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing || isSavingDraft}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-light active:scale-[0.98] text-white text-xs font-bold tracking-wide shadow-md transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Changes'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
