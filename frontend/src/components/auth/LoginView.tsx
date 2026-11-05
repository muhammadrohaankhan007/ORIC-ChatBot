'use client';

import React, { useState } from 'react';
import { AuthUser } from '@/config/auth';
import { loginUser } from '@/services/api';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  KeyRound,
  ArrowRight
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your Username / Registration ID and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(username, password);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Access Denied: Invalid credentials.');
      }
    } catch (err: any) {
      setErrorMessage('An unexpected error occurred during authentication. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-xl shadow-md">
            <img
              src="/shu-logo.png"
              alt="Salim Habib University"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              <span>Salim Habib University</span>
              <span className="text-[10px] uppercase font-bold bg-red-600/30 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                ORIC Portal
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 hidden sm:block">
              Office of Research, Innovation & Commercialization
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-[11px] text-zinc-300 hidden sm:inline">Restricted Institutional Access</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="bg-zinc-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative">
          {/* Card Top Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Sign In to ORIC
            </h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Institutional portal for executive governance, research portfolios, and AI intelligence.
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Username / Registration ID</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. azharrizvi001"
                  autoComplete="username"
                  required
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-inner font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Password</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-zinc-950 border border-white/15 rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition shadow-inner font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Institutional Security Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center z-10 py-3 text-xs text-zinc-500 space-y-1">
        <div className="flex items-center justify-center gap-1.5 font-medium text-zinc-400">
          <GraduationCap className="w-4 h-4 text-red-500" />
          <span>Salim Habib University • Higher Education Commission (HEC) Recognized Tier-1 ORIC</span>
        </div>
        <p className="text-[11px] text-zinc-600">
          Karachi, Sindh, Pakistan • Unauthorized access or data scraping is strictly prohibited.
        </p>
      </footer>
    </div>
  );
}

