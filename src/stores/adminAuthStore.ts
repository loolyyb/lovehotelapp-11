
import { create } from 'zustand';

interface AdminAuthState {
  isAdminAuthenticated: boolean;
  setAdminAuthenticated: (state: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()((set) => ({
  isAdminAuthenticated: false,
  setAdminAuthenticated: (state) => {
    console.log("Setting admin authentication state to:", state);
    set({ isAdminAuthenticated: state });
  },
}));
