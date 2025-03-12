
import { AlertService } from './AlertService';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

interface LoginResponse {
  token: string;
}

class AuthService {
  private static readonly TOKEN_KEY = 'love_hotel_jwt';
  private static readonly API_URL = 'https://api.lovehotel.io';
  private static readonly TOKEN_EXPIRY_KEY = 'love_hotel_token_expiry';
  // Add a flag to prevent multiple simultaneous auth checks
  private static isCheckingAuth = false;
  private static lastCheckTime = 0;
  private static checkResult = true;

  static async login(): Promise<string | null> {
    try {
      console.log("Attempting to login to admin API");
      
      // In preview environments, use a mock token
      if (window.location.hostname.includes('preview--') && 
          window.location.hostname.endsWith('.lovable.app')) {
        console.log("Preview environment detected - using mock admin token");
        const mockToken = "preview-mock-token-" + Date.now();
        this.setToken(mockToken);
        
        const adminAuthStore = useAdminAuthStore.getState();
        adminAuthStore.setAdminAuthenticated(true);
        
        return mockToken;
      }
      
      const response = await fetch(`${this.API_URL}/login_check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'reservation.lovehotelaparis@gmail.com',
          password: 'lovehotel88',
        }),
      });

      if (!response.ok) {
        throw new Error('Échec de l\'authentification');
      }

      const data: LoginResponse = await response.json();
      this.setToken(data.token);
      
      // Set admin authenticated in the store
      const adminAuthStore = useAdminAuthStore.getState();
      adminAuthStore.setAdminAuthenticated(true);
      
      console.log("Admin login successful, token stored");
      return data.token;
    } catch (error) {
      console.error("Admin login failed:", error);
      
      // In preview env, we don't want to capture this exception
      if (!(window.location.hostname.includes('preview--') && 
          window.location.hostname.endsWith('.lovable.app'))) {
        AlertService.captureException(error as Error, {
          context: 'AuthService.login',
        });
      }
      
      return null;
    }
  }

  static getToken(): string | null {
    // For preview environments, always provide a mock token if needed
    if (window.location.hostname.includes('preview--') && 
        window.location.hostname.endsWith('.lovable.app')) {
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      if (!storedToken) {
        const mockToken = "preview-mock-token-" + Date.now();
        this.setToken(mockToken);
        return mockToken;
      }
      return storedToken;
    }
    
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    
    // Set token expiry (24 hours from now)
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    
    console.log("Admin token set with expiry:", new Date(expiryTime).toISOString());
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    
    // Also clear admin auth state
    const adminAuthStore = useAdminAuthStore.getState();
    adminAuthStore.clearSession();
    
    console.log("Admin token removed and session cleared");
  }

  static isAuthenticated(): boolean {
    // Throttle checks to prevent refresh loops
    const now = Date.now();
    if (now - this.lastCheckTime < 1000) {
      return this.checkResult;
    }
    
    // Prevent multiple simultaneous checks
    if (this.isCheckingAuth) {
      return this.checkResult; // Return previous result temporarily
    }
    
    this.isCheckingAuth = true;
    
    try {
      // For preview environments, always return true
      if (window.location.hostname.includes('preview--') && 
          window.location.hostname.endsWith('.lovable.app')) {
        this.checkResult = true;
        return true;
      }
      
      const token = this.getToken();
      if (!token) {
        this.checkResult = false;
        return false;
      }

      // Check token expiry from our own storage
      const expiryTimeStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (expiryTimeStr) {
        const expiryTime = parseInt(expiryTimeStr, 10);
        const isExpired = now > expiryTime;
        
        if (isExpired) {
          this.removeToken();
          this.checkResult = false;
          return false;
        }
        
        this.checkResult = true;
        return true;
      }

      // Fallback to JWT expiry check
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isValid = payload.exp * 1000 > now;
        
        if (!isValid) {
          this.removeToken();
          this.checkResult = false;
        } else {
          this.checkResult = true;
        }
        
        return isValid;
      } catch (error) {
        console.error("Error parsing JWT:", error);
        this.removeToken();
        this.checkResult = false;
        return false;
      }
    } finally {
      // Update last check time
      this.lastCheckTime = now;
      
      // Reset the flag after check is complete with a small delay
      setTimeout(() => {
        this.isCheckingAuth = false;
      }, 100);
    }
  }
}

export { AuthService };
