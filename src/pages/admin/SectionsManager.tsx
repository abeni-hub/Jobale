import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, unwrapList } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useCms } from '@/context/CmsContext';
import type { PageSection } from '@/lib/types';
import { renderLucideIcon } from '@/components/admin/IconPicker';
import {
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';

const SECTION_ROUTES: Record<string, string> = {
  hero: '/admin/hero',
  about: '/admin/about',
  services: '/admin/services',
  projects: '/admin/projects',
  'quality-safety': '/admin/quality-safety',
  clients: '/admin/clients',
  testimonials: '/admin/testimonials',
  contact: '/admin/contact',
  navigation: '/admin/navigation',
  footer: '/admin/navigation',
  settings: '/admin/settings',
  seo: '/admin/seo',
};

export default function SectionsManager() {
  const { success, error } = useToast();
  const { refresh: refreshPublicCms } = useCms();

  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<unknown>('/cms/sections/');
      setSections(unwrapList<PageSection>(res));
    } catch (err) {
      error((err as Error).message || 'Failed to load website sections registry');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleToggleSection = async (sec: PageSection) => {
    try {
      await api.patch(`/cms/sections/${sec.id}/`, { is_enabled: !sec.is_enabled });
      success(`Section "${sec.label}" is now ${!sec.is_enabled ? 'enabled' : 'disabled'}.`);
      await fetchSections();
      await refreshPublicCms();
    } catch (err) {
      error((err as Error).message || 'Failed to toggle section status');
    }
  };

  return (
    <div className="space-y-6 font-body max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
          Website Sections Registry
        </h2>
        <p className="text-xs text-surface-steel/70">
          Enable or disable sections, inspect their anchors, and jump directly into section editors.
        </p>
      </div>

      <div className="rounded-2xl bg-[#0F2137] border border-white/10 overflow-hidden shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-surface-steel/60">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
          </div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center text-xs text-surface-steel/60">
            <Layers className="w-10 h-10 mx-auto text-surface-steel/30 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">No sections registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#07111E] text-surface-steel/70 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Section Name</th>
                  <th className="py-3 px-4">Key / Anchor</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sections.map((sec) => {
                  const targetRoute = SECTION_ROUTES[sec.key] || '/admin/settings';
                  return (
                    <tr key={sec.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="p-2 rounded-xl bg-brand-navy border border-white/10 text-brand-blue-light">
                            {renderLucideIcon(sec.icon || 'Layers', 'w-4 h-4')}
                          </span>
                          <div>
                            <p className="font-heading font-bold text-white text-sm">{sec.label}</p>
                            <p className="text-surface-steel/60 text-[11px] line-clamp-1">
                              {sec.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-surface-steel/70 text-[11px]">
                        #{sec.key}
                      </td>
                      <td className="py-3 px-4 font-mono text-surface-steel/70">
                        {sec.display_order}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleSection(sec)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                            sec.is_enabled
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                              : 'bg-white/10 text-surface-steel/50'
                          }`}
                        >
                          {sec.is_enabled ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Enabled</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={targetRoute}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light hover:text-white text-xs font-semibold transition-all"
                        >
                          <span>Edit Section</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
