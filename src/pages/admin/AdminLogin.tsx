import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Logo from '@/components/Logo';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Building2,
  Layers,
} from 'lucide-react';

export default function AdminLogin() {
  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const destination = (location.state as { from?: string })?.from || '/admin';

  if (!authLoading && isAuthenticated) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const identifier = usernameOrEmail.trim();
    if (!identifier) {
      setFormError('Please enter your email or username.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login({
        username_or_email: identifier,
        password,
        remember_me: rememberMe,
      });
      success(`Welcome back, ${user.full_name || user.username}!`, 'Signed In');
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        'Unable to sign in. Please verify your credentials and try again.';
      setFormError(msg);
      toastError(msg, 'Authentication Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111E] text-white flex flex-col justify-center relative overflow-hidden font-body">
      {/* Blueprint City Decorative Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center mix-blend-screen"
        style={{ backgroundImage: `url('/images/jobale-blueprint-city.png')` }}
      />

      {/* Subtle architectural grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(8, 107, 183, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(8, 107, 183, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-white/10 shadow-elevated bg-[#0F2137]/90 backdrop-blur-xl">
          {/* Left Column: Architectural Branding */}
          <div className="lg:col-span-6 p-8 sm:p-12 bg-gradient-to-br from-[#082C4C] to-[#07111E] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
            {/* Fine blueprint decorative line graphic */}
            <div className="absolute top-0 right-0 w-64 h-64 border border-brand-blue/20 rounded-full translate-x-20 -translate-y-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 border border-brand-blue/15 rounded-full -translate-x-32 translate-y-32 pointer-events-none" />

            {/* Top brand */}
            <div className="relative z-10">
              <div className="inline-block bg-white p-3 rounded-2xl shadow-md mb-8">
                <Logo className="h-10 w-auto" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/20 border border-brand-blue/40 text-brand-blue-light text-xs font-mono mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrative Portal</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white leading-tight mb-4">
                Welcome to Your Website Control Center
              </h1>

              <p className="text-sm text-surface-steel/80 leading-relaxed max-w-md">
                Manage every aspect of the Jobale Engineering PLC public website — from project portfolios and engineering services to section imagery, quality standards, and contact details.
              </p>
            </div>

            {/* Architectural Wireframe Graphic / Feature points */}
            <div className="my-8 relative z-10 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-surface-steel">
                <Building2 className="w-4 h-4 text-brand-blue-light shrink-0" />
                <span>Synchronized live with SQLite database</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-surface-steel">
                <Layers className="w-4 h-4 text-brand-blue-light shrink-0" />
                <span>Draft staging with live preview before publishing</span>
              </div>
            </div>

            {/* Company Slogan */}
            <div className="pt-6 border-t border-white/10 relative z-10">
              <p className="text-xs font-heading font-semibold text-brand-blue-light tracking-wider uppercase mb-1">
                Jobale Engineering PLC
              </p>
              <p className="text-sm font-heading font-medium text-white italic">
                “Building Excellence, Delivering Trust.”
              </p>
            </div>
          </div>

          {/* Right Column: Clean Login Card */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-[#0F2137]">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mb-2">
                  Sign In to Control Center
                </h2>
                <p className="text-xs text-surface-steel/70">
                  Enter your administrative credentials to manage website content.
                </p>
              </div>

              {/* Error Alert */}
              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs leading-relaxed flex items-start gap-3">
                  <span className="p-1 rounded bg-rose-500/20 text-rose-300 shrink-0 font-bold">!</span>
                  <div>
                    <p className="font-semibold text-rose-100 mb-0.5">Authentication error</p>
                    <p>{formError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username or Email */}
                <div>
                  <label className="block text-xs font-semibold text-surface-steel/90 mb-1.5 uppercase tracking-wider">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-steel/50 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="username"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="e.g. admin or owner@jobaleengineering.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#07111E]/80 border border-white/15 text-white placeholder-surface-steel/40 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue-light"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-surface-steel/90 uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-steel/50 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#07111E]/80 border border-white/15 text-white placeholder-surface-steel/40 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue-light"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-steel/50 hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#07111E] border-white/20 text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="text-xs text-surface-steel/80">
                      Keep me signed in on this computer
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-heading font-bold text-sm tracking-wide shadow-lg hover:shadow-brand-blue/30 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Control Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <a
                  href="/"
                  className="text-xs text-surface-steel/70 hover:text-brand-blue-light transition-colors"
                >
                  ← Return to Jobale Engineering PLC Public Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
