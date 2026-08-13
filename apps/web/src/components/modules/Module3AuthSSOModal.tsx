import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '../../types';
import { Sparkles, Shield, Lock, ArrowRight, Github, Mail, Building2, CheckCircle2 } from 'lucide-react';

export const Module3AuthSSOModal: React.FC = () => {
  const { login, user } = useAuthStore();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'sso'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'Student');
  const [email, setEmail] = useState('alex.vance@synapse.ai');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 p-6 rounded-3xl glass-panel border border-cyan-500/30 glow-cyan grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeIn">
      {/* Left Branding & Particle Aesthetics */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Multi-Tenant Authentication & SSO
        </div>
        <h2 className="text-3xl font-heading font-extrabold text-slate-100 leading-tight">
          Access Your Next-Gen <span className="text-cyan-400">Media & AI OS</span>
        </h2>
        <p className="text-sm text-slate-300">
          Quantum-encrypted single sign-on with role-based workspace permissions for Students, Instructors, and Enterprise Admins.
        </p>

        {/* Role Selector Pill */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Workspace Role</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Student', 'Instructor', 'Admin'] as UserRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  selectedRole === role
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {selectedRole === role && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                <span>{role}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>SAML 2.0 & OIDC Ready • Zero Trust End-to-End Encryption</span>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
        {/* Toggle Mode */}
        <div className="flex border-b border-slate-800 pb-3">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 text-center text-xs font-bold pb-1 border-b-2 transition ${
              authMode === 'login' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct Login
          </button>
          <button
            onClick={() => setAuthMode('sso')}
            className={`flex-1 text-center text-xs font-bold pb-1 border-b-2 transition ${
              authMode === 'sso' ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Enterprise SSO
          </button>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Passcode / Token</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition"
            >
              Sign In as {selectedRole} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => login(selectedRole)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 flex items-center justify-center gap-2 transition"
            >
              <Github className="w-4 h-4 text-slate-200" /> Continue with GitHub Enterprise
            </button>
            <button
              onClick={() => login(selectedRole)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 flex items-center justify-center gap-2 transition"
            >
              <Mail className="w-4 h-4 text-rose-400" /> Continue with Google Workspace
            </button>
            <button
              onClick={() => login(selectedRole)}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-xs font-semibold text-purple-200 flex items-center justify-center gap-2 transition"
            >
              <Building2 className="w-4 h-4 text-purple-400" /> SAML 2.0 Corporate Identity
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
