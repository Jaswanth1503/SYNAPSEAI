import React, { useState } from 'react';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  Search,
  Sun,
  Moon,
  Bell,
  User,
  ShieldCheck,
  ChevronDown,
  Building2,
  Lock,
  Sparkles,
  Wifi,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';
import { mockNotifications } from '../../data/mockData';
import { UserRole } from '../../types';

export const TopNavbar: React.FC = () => {
  const { scope, setScope, setSearchOpen, isOfflineMode, setOfflineMode } = useWorkspaceStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, setRole } = useAuthStore();

  const [isWorkspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isRoleMenuOpen, setRoleMenuOpen] = useState(false);

  const unreadNotifs = mockNotifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 dark:bg-[#070a11]/90 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left Section: Brand Logo & Workspace Switcher */}
      <div className="flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 glow-cyan">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-heading font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              SYNAPSE <span className="text-cyan-400 font-light text-xs uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 ml-1">OS</span>
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Workspace Scope Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 dark:bg-slate-900/60 border border-slate-700/80 dark:border-cyan-500/30 text-xs font-semibold text-slate-200 hover:border-cyan-400 transition"
          >
            {scope === 'personal' ? (
              <>
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Private Workspace</span>
              </>
            ) : (
              <>
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Shared Org Hub</span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-fadeIn">
              <button
                onClick={() => {
                  setScope('personal');
                  setWorkspaceMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                  scope === 'personal' ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Lock className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold">Private Personal</div>
                  <div className="text-[10px] text-slate-400">Notes, sandboxes & audio recordings</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setScope('org');
                  setWorkspaceMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition mt-1 ${
                  scope === 'org' ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-semibold">Quantum AI Institute</div>
                  <div className="text-[10px] text-slate-400">Cohort feeds, courses & live rooms</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Semantic Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-800/40 dark:bg-slate-900/50 border border-slate-700/60 dark:border-slate-800 text-xs text-slate-400 hover:border-cyan-500/40 hover:text-slate-300 transition"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Search transcripts, concepts, code...</span>
          </div>
          <kbd className="px-2 py-0.5 text-[10px] text-slate-400 bg-slate-800/80 border border-slate-700 rounded font-mono">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Offline Sync, Theme Switcher, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Offline Sync Toggle */}
        <button
          onClick={() => setOfflineMode(!isOfflineMode)}
          title={isOfflineMode ? 'Offline Sync Mode Active' : 'Online Mode'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
            isOfflineMode
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              : 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
          }`}
        >
          {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="hidden lg:inline">{isOfflineMode ? 'Offline Sync' : 'Live Sync'}</span>
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-800/50 dark:bg-slate-900/60 border border-slate-700/60 dark:border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition"
          title="Toggle Dark/Light Theme Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl bg-slate-800/50 dark:bg-slate-900/60 border border-slate-700/60 dark:border-slate-800 text-slate-300 hover:text-cyan-400 transition relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse glow-cyan" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {unreadNotifs} New
                </span>
              </div>
              <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className="p-2 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>{notif.title}</span>
                      <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-800" />

        {/* User Profile Badge & Role Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/50 transition"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-cyan-400/40 object-cover"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
              <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>{user?.role}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Switch Active Role</div>
              {(['Student', 'Instructor', 'Admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                    user?.role === r ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{r}</span>
                  {user?.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
