
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminAuthState {
  isAdminAuthenticated: boolean;
  lastAuthTime: number | null;
  sessionExpiry: number; // session expiry in milliseconds (4 hours)
  lastCheckedAt: number | null; // Track when we last checked authentication
  setAdminAuthenticated: (state: boolean) => void;
  checkSessionValidity: () => boolean;
  clearSession: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      lastAuthTime: null,
      lastCheckedAt: null,
      sessionExpiry: 4 * 60 * 60 * 1000, // 4 hours
      
      setAdminAuthenticated: (state) => {
        // Only update state if it's actually changing to prevent refresh loops
        const current = get().isAdminAuthenticated;
        if (current !== state) {
          console.log("Setting admin authentication state to:", state);
          set({ 
            isAdminAuthenticated: state,
            lastAuthTime: state ? Date.now() : null,
            lastCheckedAt: Date.now()
          });
        }
      },
      
      checkSessionValidity: () => {
        const { isAdminAuthenticated, lastAuthTime, sessionExpiry, lastCheckedAt } = get();
        
        // Reduce frequency of checks to prevent render loops
        const now = Date.now();
        if (lastCheckedAt && now - lastCheckedAt < 1000) {
          return isAdminAuthenticated; // Return cached result if checked recently
        }
        
        // Update last checked time
        set({ lastCheckedAt: now });
        
        // Log only when needed to prevent console spam
        if (isAdminAuthenticated) {
          console.log("Checking admin session validity:", { 
            isAdminAuthenticated, 
            lastAuthTime, 
            sessionExpiry,
            now,
            timeSinceAuth: lastAuthTime ? (now - lastAuthTime) : null,
            isExpired: lastAuthTime ? (now - lastAuthTime > sessionExpiry) : true,
            hostname: window.location.hostname,
            isPreview: window.location.hostname.includes('preview--')
          });
        }
        
        // Skip session checks in preview environments
        if (window.location.hostname.includes('preview--') && 
            window.location.hostname.endsWith('.lovable.app')) {
          console.log("Preview environment detected - bypassing admin auth check");
          return true;
        }
        
        if (!isAdminAuthenticated || !lastAuthTime) return false;
        
        const isValid = now - lastAuthTime < sessionExpiry;
        
        if (!isValid) {
          // Auto clear expired session
          console.log("Admin session has expired, clearing");
          set({ isAdminAuthenticated: false, lastAuthTime: null });
        }
        
        return isValid;
      },
      
      clearSession: () => {
        console.log("Clearing admin session");
        set({ isAdminAuthenticated: false, lastAuthTime: null });
      }
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
