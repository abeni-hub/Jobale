import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import Logo from '@/components/Logo';
import { Loader2 } from 'lucide-react';

export default function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07111E] flex flex-col items-center justify-center text-white p-4">
        <div className="bg-white p-3 rounded-xl mb-6 shadow-elevated">
          <Logo className="h-10 w-auto" />
        </div>
        <Loader2 className="w-8 h-8 text-brand-blue-light animate-spin mb-3" />
        <h2 className="text-base font-heading font-semibold text-white">
          Loading Control Center...
        </h2>
        <p className="text-xs text-surface-steel/60 mt-1 font-mono">
          Verifying security session
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#0A1626] text-surface-steel flex">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
