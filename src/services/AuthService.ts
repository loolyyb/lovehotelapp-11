import { AlertService } from './AlertService';

interface LoginResponse {
  token: string;
}

class AuthService {
  private static readonly TOKEN_KEY = 'love_hotel_jwt';
  private static readonly API_URL = 'https://api.lovehotel.io';

  static async login(): Promise<string | null> {
    try {
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
      return data.token;
    } catch (error) {
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
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Vérification basique de l'expiration du token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

export { AuthService };