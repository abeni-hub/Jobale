import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCms } from '@/context/CmsContext';
import { useToast } from '@/context/ToastContext';
import {
  Menu,
  ExternalLink,
  LogOut,
  User,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { ADMIN_NAV_ITEMS } from './AdminSidebar';

interface AdminHeaderProps {
  onOpenMobileNav: () => void;
}

export default function AdminHeader({ onOpenMobileNav }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { refresh } = useCms();
  const { success } = useToast();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [revalidating, setRevalidating] = useState(false);

  const currentItem = ADMIN_NAV_ITEMS.find((item) =>
    item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)
  );

  const pageTitle = currentItem ? currentItem.label : 'CMS Management';

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRevalidate = async () => {
    try {
      setRevalidating(true);
      await refresh();
      success('Public website cache refreshed.');
    } finally {
      setRevalidating(false);
    }
  };

  return (
    <header className="h-16 bg-[#07111E]/95 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Left: Mobile nav toggle and Section Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-surface-steel/70 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight flex items-center gap-2">
            {pageTitle}
          </h1>
          <p className="text-[11px] text-surface-steel/50 hidden sm:block">
            Jobale Engineering PLC — Administrative Portal
          </p>
        </div>
      </div>

      {/* Right: Actions and User */}
      <div className="flex items-center gap-3">
        {/* Revalidate button */}
        <button
          type="button"
          onClick={handleRevalidate}
          disabled={revalidating}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-surface-steel hover:text-white transition-colors"
          title="Refresh public website data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand-blue-light ${revalidating ? 'animate-spin' : ''}`} />
          <span>Sync Public Site</span>
        </button>

        {/* View Public Site button */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-blue-light hover:text-white text-xs font-semibold tracking-wide transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">View Public Site</span>
          <span className="sm:hidden">Site</span>
        </a>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10 hidden sm:block" />

        {/* User badge */}
        <Link
          to="/admin/account"
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-white/5 transition-colors"
          title="Manage Account"
        >
          <div className="w-8 h-8 rounded-full bg-brand-blue/30 border border-brand-blue-light/50 flex items-center justify-center text-brand-blue-light font-bold text-xs">
            {user?.first_name ? user.first_name[0].toUpperCase() : user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-medium text-white block leading-tight truncate max-w-[120px]">
              {user?.full_name || user?.username || 'Administrator'}
            </span>
            <span className="text-[10px] text-surface-steel/50 uppercase font-mono block">
              {user?.role_display || (user?.is_owner ? 'Owner' : 'Staff')}
            </span>
          </div>
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="p-2 rounded-lg text-surface-steel/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
