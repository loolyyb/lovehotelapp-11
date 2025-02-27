
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      name: 'admin-auth-storage', // nom unique pour le stockage
      storage: createJSONStorage(() => localStorage), // adapter le localStorage pour Zustand
    }
  )
);
