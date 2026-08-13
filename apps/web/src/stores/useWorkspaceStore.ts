import { create } from 'zustand';
import { WorkspaceScope, ModuleId } from '../types';

interface WorkspaceState {
  scope: WorkspaceScope;
  activeModule: ModuleId;
  isSearchOpen: boolean;
  isOfflineMode: boolean;
  activeCourseId: string;
  setScope: (scope: WorkspaceScope) => void;
  setActiveModule: (module: ModuleId) => void;
  setSearchOpen: (isOpen: boolean) => void;
  setOfflineMode: (isOffline: boolean) => void;
  setActiveCourseId: (courseId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  scope: 'personal',
  activeModule: 'personal-dashboard',
  isSearchOpen: false,
  isOfflineMode: false,
  activeCourseId: 'course-101',

  setScope: (scope) =>
    set({
      scope,
      activeModule: scope === 'personal' ? 'personal-dashboard' : 'org-dashboard',
    }),

  setActiveModule: (activeModule) => set({ activeModule }),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  setOfflineMode: (isOfflineMode) => set({ isOfflineMode }),
  setActiveCourseId: (activeCourseId) => set({ activeCourseId }),
}));
