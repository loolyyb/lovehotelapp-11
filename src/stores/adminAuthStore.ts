
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminAuthState {
  isAdminAuthenticated: boolean;
  setAdminAuthenticated: (state: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAdminAuthenticated: false,
      setAdminAuthenticated: (state) => {
        console.log("Setting admin authentication state to:", state);
        set({ isAdminAuthenticated: state });
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);
