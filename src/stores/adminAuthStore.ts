
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminAuthState {
  isAdminAuthenticated: boolean;
  lastAuthTime: number | null;
  sessionExpiry: number; // session expiry in milliseconds (4 hours)
  setAdminAuthenticated: (state: boolean) => void;
  checkSessionValidity: () => boolean;
  clearSession: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      lastAuthTime: null,
      sessionExpiry: 4 * 60 * 60 * 1000, // 4 hours
      
      setAdminAuthenticated: (state) => {
        console.log("Setting admin authentication state to:", state);
        set({ 
          isAdminAuthenticated: state,
          lastAuthTime: state ? Date.now() : null
        });
      },
      
      checkSessionValidity: () => {
        const { isAdminAuthenticated, lastAuthTime, sessionExpiry } = get();
        if (!isAdminAuthenticated || !lastAuthTime) return false;
        
        const now = Date.now();
        const isValid = now - lastAuthTime < sessionExpiry;
        
        if (!isValid) {
          // Auto clear expired session
          set({ isAdminAuthenticated: false, lastAuthTime: null });
        }
        
        return isValid;
      },
      
      clearSession: () => {
        set({ isAdminAuthenticated: false, lastAuthTime: null });
      }
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
