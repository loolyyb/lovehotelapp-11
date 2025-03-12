
import { AlertService } from './AlertService';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

interface LoginResponse {
  token: string;
}

class AuthService {
  private static readonly TOKEN_KEY = 'love_hotel_jwt';
  private static readonly API_URL = 'https://api.lovehotel.io';
  private static readonly TOKEN_EXPIRY_KEY = 'love_hotel_token_expiry';

  static async login(): Promise<string | null> {
    try {
      console.log("Attempting to login to admin API");
      
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
      AlertService.captureException(error as Error, {
        context: 'AuthService.login',
      });
      return null;
    }
  }

  static getToken(): string | null {
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
    const token = this.getToken();
    if (!token) return false;

    // Check token expiry from our own storage
    const expiryTimeStr = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (expiryTimeStr) {
      const expiryTime = parseInt(expiryTimeStr, 10);
      const isExpired = Date.now() > expiryTime;
      
      console.log("Admin token expiry check:", {
        isExpired,
        expiryTime: new Date(expiryTime).toISOString(),
        now: new Date().toISOString()
      });
      
      if (isExpired) {
        this.removeToken();
        return false;
      }
      
      return true;
    }

    // Fallback to JWT expiry check
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isValid = payload.exp * 1000 > Date.now();
      
      if (!isValid) {
        this.removeToken();
      }
      
      return isValid;
    } catch (error) {
      console.error("Error parsing JWT:", error);
      this.removeToken();
      return false;
    }
  }
}

export { AuthService };
