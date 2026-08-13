import { create } from 'zustand';
import { UserProfile, UserRole } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setAuthModalOpen: (isOpen: boolean) => void;
}

const mockUser: UserProfile = {
  id: 'usr_8921',
  name: 'Alex Vance',
  email: 'alex.vance@synapse.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Student',
  orgName: 'Quantum AI Tech Institute',
  title: 'Senior Frontend Architect Candidate',
  streakDays: 14,
  xpPoints: 3450,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUser,
  isAuthenticated: true,
  isAuthModalOpen: false,

  login: (role = 'Student') =>
    set((state) => ({
      isAuthenticated: true,
      user: state.user ? { ...state.user, role } : { ...mockUser, role },
      isAuthModalOpen: false,
    })),

  logout: () => set({ user: null, isAuthenticated: false }),

  setRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),

  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
}));
