import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Building,
  Sparkles,
  Info,
  Wrench,
  FolderGit2,
  Users2,
  ShieldCheck,
  Quote,
  PhoneCall,
  Compass,
  Image as ImageIcon,
  UserCog,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
} from 'lucide-react';
import Logo from '@/components/Logo';

export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Overview',
    to: '/admin',
    icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'sections',
    label: 'Website Sections',
    to: '/admin/sections',
    icon: <Layers className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'settings',
    label: 'Company Profile',
    to: '/admin/settings',
    icon: <Building className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'hero',
    label: 'Hero Section',
    to: '/admin/hero',
    icon: <Sparkles className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'about',
    label: 'About Us',
    to: '/admin/about',
    icon: <Info className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'services',
    label: 'Services',
    to: '/admin/services',
    icon: <Wrench className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'projects',
    label: 'Projects & Portfolio',
    to: '/admin/projects',
    icon: <FolderGit2 className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'clients',
    label: 'Clients & References',
    to: '/admin/clients',
    icon: <Users2 className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'quality-safety',
    label: 'Quality & Safety',
    to: '/admin/quality-safety',
    icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    to: '/admin/testimonials',
    icon: <Quote className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'contact',
    label: 'Contact Information',
    to: '/admin/contact',
    icon: <PhoneCall className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'navigation',
    label: 'Navigation & Footer',
    to: '/admin/navigation',
    icon: <Compass className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'media',
    label: 'Media Library',
    to: '/admin/media',
    icon: <ImageIcon className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'account',
    label: 'Account & Settings',
    to: '/admin/account',
    icon: <UserCog className="w-4 h-4 shrink-0" />,
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#07111E] border-r border-white/10 select-none">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white p-1 rounded-md shrink-0">
              <Logo className="h-6 w-auto" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-heading font-bold text-white tracking-wider block truncate">
                JOBALE CMS
              </span>
              <span className="text-[10px] text-brand-blue-light font-mono block truncate">
                Control Center
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white p-1 rounded-md mx-auto">
            <Logo className="h-6 w-auto" variant="mark" />
          </div>
        )}

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden text-surface-steel/60 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex text-surface-steel/60 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        <div className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-surface-steel/40 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? 'CMS' : 'Website Management'}
        </div>

        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to === '/admin'}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-brand-blue text-white shadow-md font-semibold'
                  : 'text-surface-steel/70 hover:bg-white/5 hover:text-white'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate flex-1">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Footer: Live site shortcut */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-surface-steel hover:text-white text-xs transition-colors ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title="Open Public Website in new tab"
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-brand-blue-light" />
          {!collapsed && <span className="truncate font-medium">View Public Site</span>}
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-brand-navy-dark/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="fixed top-0 bottom-0 left-0 w-72 z-50 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
