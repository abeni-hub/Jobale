import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, API_BASE_URL } from '@/lib/api';
import {
  UserCog,
  Lock,
  Shield,
  KeyRound,
  Server,
  Database,
  CheckCircle2,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function AccountSettings() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      error('Please enter your current and new password.');
      return;
    }
    if (newPassword.length < 10) {
      error('New password must be at least 10 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      success('Your administrator password has been updated securely.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      error((err as Error).message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-body">
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-1">
          Account & System Settings
        </h2>
        <p className="text-xs text-surface-steel/70">
          Manage administrator security credentials and inspect backend configuration diagnostics.
        </p>
      </div>

      <div className="space-y-6">
        {/* User Profile Card */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <UserCog className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Administrator Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <span className="text-surface-steel/60 block mb-1">Username</span>
              <p className="font-heading font-bold text-white text-sm">{user?.username}</p>
            </div>

            <div>
              <span className="text-surface-steel/60 block mb-1">Email Address</span>
              <p className="font-heading font-bold text-white text-sm">{user?.email || '—'}</p>
            </div>

            <div>
              <span className="text-surface-steel/60 block mb-1">Role / Permissions</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-blue/20 border border-brand-blue/40 text-brand-blue-light font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>{user?.role_display || (user?.is_owner ? 'Owner' : 'Staff')}</span>
              </span>
            </div>

            <div>
              <span className="text-surface-steel/60 block mb-1">Account Created</span>
              <p className="font-mono text-surface-steel/80">
                {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <KeyRound className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                Current Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                New Password (Minimum 10 characters) <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-steel/90 mb-1">
                Confirm New Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07111E]/80 border border-white/15 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white text-xs font-bold tracking-wide shadow transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </div>

        {/* System Diagnostics */}
        <div className="rounded-2xl bg-[#0F2137] border border-white/10 p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
            <Server className="w-5 h-5 text-brand-blue-light" />
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              System Diagnostics
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-surface-steel/50 block text-[10px] uppercase">API Endpoint Base</span>
              <span className="text-brand-blue-light font-semibold break-all">{API_BASE_URL}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-surface-steel/50 block text-[10px] uppercase">Database Engine</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <Database className="w-3.5 h-3.5" />
                <span>SQLite (backend/db.sqlite3)</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-surface-steel/50 block text-[10px] uppercase">Backend Framework</span>
              <span className="text-white">Django 5.1 / DRF 3.15</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-surface-steel/50 block text-[10px] uppercase">Authentication</span>
              <span className="text-white">HttpOnly SimpleJWT + Cookie Fallback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
