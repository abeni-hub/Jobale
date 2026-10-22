import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { DashboardSummary, ActivityItem } from '@/lib/types';
import {
  FolderGit2,
  Wrench,
  Image as ImageIcon,
  Layers,
  Sparkles,
  PhoneCall,
  Clock,
  ExternalLink,
  Plus,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Building,
  Info,
  ShieldCheck,
  Quote,
  Compass,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { error } = useToast();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, actRes] = await Promise.all([
        api.get<DashboardSummary>('/cms/summary/'),
        api.get<ActivityItem[]>('/cms/activity/?limit=8'),
      ]);
      setSummary(sumRes);
      setActivity(Array.isArray(actRes) ? actRes : []);
    } catch (err) {
      error((err as Error).message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const ownerName = user?.full_name || user?.first_name || user?.username || 'Owner';

  const sectionsOverview = [
    { title: 'Hero Section', to: '/admin/hero', icon: <Sparkles className="w-4 h-4 text-brand-blue-light" />, desc: 'Headlines, CTAs, blueprint visuals & images' },
    { title: 'Company Profile', to: '/admin/settings', icon: <Building className="w-4 h-4 text-brand-blue-light" />, desc: 'Company name, logos, brand colors, copyright' },
    { title: 'About Us', to: '/admin/about', icon: <Info className="w-4 h-4 text-brand-blue-light" />, desc: 'Overview, mission, vision, values & statistics' },
    { title: 'Services Catalog', to: '/admin/services', icon: <Wrench className="w-4 h-4 text-brand-blue-light" />, desc: `${summary?.active_services || 0} active civil & building services` },
    { title: 'Projects Portfolio', to: '/admin/projects', icon: <FolderGit2 className="w-4 h-4 text-brand-blue-light" />, desc: `${summary?.published_projects || 0} published engineering projects` },
    { title: 'Quality & Safety', to: '/admin/quality-safety', icon: <ShieldCheck className="w-4 h-4 text-brand-blue-light" />, desc: 'QA standards, certifications & safety practices' },
    { title: 'Clients & References', to: '/admin/clients', icon: <Building className="w-4 h-4 text-brand-blue-light" />, desc: `${summary?.published_clients || 0} verified client associations` },
    { title: 'Client Testimonials', to: '/admin/testimonials', icon: <Quote className="w-4 h-4 text-brand-blue-light" />, desc: `${summary?.published_testimonials || 0} verified reviews` },
    { title: 'Contact Information', to: '/admin/contact', icon: <PhoneCall className="w-4 h-4 text-brand-blue-light" />, desc: 'Office address, phone, email & inquiries' },
    { title: 'Navigation & Footer', to: '/admin/navigation', icon: <Compass className="w-4 h-4 text-brand-blue-light" />, desc: 'Menu links, display order & footer content' },
  ];

  return (
    <div className="space-y-8 font-body">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#082C4C] via-[#0F3D63] to-[#086BB7] border border-white/10 shadow-elevated text-white overflow-hidden">
        {/* Fine background grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-medium text-surface-steel mb-3">
              Jobale Engineering Control Center
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Welcome back, {ownerName}
            </h2>
            <p className="mt-2 text-sm text-surface-steel/90 leading-relaxed">
              Manage your engineering company portfolio, update services, stage draft changes, and publish real-time updates directly to your live corporate website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/hero"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-navy hover:bg-surface-offwhite font-heading font-semibold text-xs tracking-wide shadow-md transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-brand-blue" />
              <span>Edit Homepage</span>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-heading font-semibold text-xs tracking-wide transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Public Site</span>
            </a>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
            Website Overview
          </h3>
          {summary?.last_content_update && (
            <span className="text-xs text-surface-steel/60 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Updated: {new Date(summary.last_content_update).toLocaleDateString()}</span>
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Published Projects */}
            <Link
              to="/admin/projects"
              className="group p-5 rounded-2xl bg-[#0F2137] border border-white/10 hover:border-brand-blue-light/50 transition-all shadow-card hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-brand-blue/20 text-brand-blue-light group-hover:scale-110 transition-transform">
                  <FolderGit2 className="w-5 h-5" />
                </span>
                <span className="text-[11px] text-surface-steel/50 font-mono">Projects</span>
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                {summary?.published_projects || 0}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-surface-steel/70">
                <span>Published projects</span>
                {summary?.draft_projects ? (
                  <span className="text-amber-400 font-medium">({summary.draft_projects} draft)</span>
                ) : null}
              </div>
            </Link>

            {/* Card 2: Active Services */}
            <Link
              to="/admin/services"
              className="group p-5 rounded-2xl bg-[#0F2137] border border-white/10 hover:border-brand-blue-light/50 transition-all shadow-card hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-brand-blue/20 text-brand-blue-light group-hover:scale-110 transition-transform">
                  <Wrench className="w-5 h-5" />
                </span>
                <span className="text-[11px] text-surface-steel/50 font-mono">Services</span>
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                {summary?.active_services || 0}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-surface-steel/70">
                <span>Active services</span>
                {summary?.draft_services ? (
                  <span className="text-amber-400 font-medium">({summary.draft_services} draft)</span>
                ) : null}
              </div>
            </Link>

            {/* Card 3: Draft Changes */}
            <div className="p-5 rounded-2xl bg-[#0F2137] border border-white/10 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2 rounded-xl ${summary?.draft_changes ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {summary?.draft_changes ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </span>
                <span className="text-[11px] text-surface-steel/50 font-mono">Drafts</span>
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                {summary?.draft_changes || 0}
              </div>
              <div className="mt-1 text-xs text-surface-steel/70">
                {summary?.draft_changes ? 'Unpublished changes pending' : 'All content published'}
              </div>
            </div>

            {/* Card 4: Uploaded Media */}
            <Link
              to="/admin/media"
              className="group p-5 rounded-2xl bg-[#0F2137] border border-white/10 hover:border-brand-blue-light/50 transition-all shadow-card hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-brand-blue/20 text-brand-blue-light group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <span className="text-[11px] text-surface-steel/50 font-mono">Media</span>
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                {summary?.media_assets || 0}
              </div>
              <div className="mt-1 text-xs text-surface-steel/70">
                Stored assets in library
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div>
        <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider mb-3">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/admin/projects"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0F2137] border border-white/10 hover:border-brand-blue-light/50 hover:bg-white/5 transition-all text-xs font-semibold text-white"
          >
            <span className="p-1.5 rounded-lg bg-brand-blue text-white">
              <Plus className="w-4 h-4" />
            </span>
            <span>Add New Project</span>
          </Link>

          <Link
            to="/admin/services"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0F2137] border border-white/10 hover:border-brand-blue-light/50 hover:bg-white/5 transition-all text-xs font-semibold text-white"
          >
            <span className="p-1.5 rounded-lg bg-brand-blue text-white">
              <Plus className="w-4 h-4" />
            </span>
            <span>Add New Service</span>
          </Link>

          <Link
            to="/admin/contact"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0F2137] border border-white/10 hover:border-brand-blue-light/50 hover:bg-white/5 transition-all text-xs font-semibold text-white"
          >
            <span className="p-1.5 rounded-lg bg-brand-navy-light text-brand-blue-light">
              <PhoneCall className="w-4 h-4" />
            </span>
            <span>Update Contact Info</span>
          </Link>

          <Link
            to="/admin/media"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0F2137] border border-white/10 hover:border-brand-blue-light/50 hover:bg-white/5 transition-all text-xs font-semibold text-white"
          >
            <span className="p-1.5 rounded-lg bg-brand-navy-light text-brand-blue-light">
              <ImageIcon className="w-4 h-4" />
            </span>
            <span>Upload Media Assets</span>
          </Link>
        </div>
      </div>

      {/* Grid: Website Sections & Recent Content Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sections Overview (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-blue-light" />
              <span>Website Sections Control</span>
            </h3>
            <span className="text-xs text-surface-steel/60">
              {sectionsOverview.length} Manageable Sections
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sectionsOverview.map((sec) => (
              <Link
                key={sec.title}
                to={sec.to}
                className="group p-4 rounded-xl bg-[#0F2137] border border-white/10 hover:border-brand-blue-light/50 transition-all flex items-start gap-3.5"
              >
                <div className="p-2 rounded-lg bg-brand-navy border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                  {sec.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-heading font-bold text-white group-hover:text-brand-blue-light transition-colors truncate">
                      {sec.title}
                    </h4>
                    <ArrowRight className="w-3.5 h-3.5 text-surface-steel/40 group-hover:text-brand-blue-light group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-surface-steel/65 line-clamp-1 mt-0.5">
                    {sec.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Content Activity Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-blue-light" />
              <span>Recent Activity</span>
            </h3>
            <span className="text-xs text-surface-steel/60">Audit Trail</span>
          </div>

          <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-surface-steel/60">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : activity.length === 0 ? (
              <div className="py-8 text-center text-xs text-surface-steel/60">
                <FileText className="w-8 h-8 mx-auto text-surface-steel/30 mb-2" />
                <p>No recent activity recorded yet.</p>
                <p className="text-[10px] text-surface-steel/40 mt-1">
                  Actions you perform in the CMS will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-b-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand-blue-light mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {item.section}
                        </span>
                        <span className="text-[10px] text-surface-steel/50 font-mono shrink-0">
                          {new Date(item.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-surface-steel/80 mt-0.5 break-words">
                        {item.summary}
                      </p>
                      <span className="text-[10px] text-brand-blue-light/80 block mt-0.5">
                        by {item.actor || 'Administrator'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
