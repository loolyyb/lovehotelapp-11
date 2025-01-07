import { AuthService } from './AuthService';
import { AlertService } from './AlertService';

class ApiService {
  private static readonly API_URL = 'https://api.lovehotel.io';

  private static async getHeaders(customHeaders?: Record<string, string>): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    });

    let token = AuthService.getToken();
    
    // If no token or token is expired, try to get a new one
    if (!token || ApiService.isTokenExpired(token)) {
      token = await AuthService.login();
      if (!token) {
        throw new Error('Unable to authenticate with the API');
      }
    }

    headers.append('Authorization', `Bearer ${token}`);
    return headers;
  }

  private static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check if token is expired with 5 minutes buffer
      return payload.exp * 1000 < Date.now() + (5 * 60 * 1000);
    } catch {
      return true;
    }
  }

  static async get<T>(endpoint: string, customHeaders?: Record<string, string>): Promise<T> {
    try {
      const headers = await this.getHeaders(customHeaders);
      const response = await fetch(`${this.API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Force token refresh and retry
          AuthService.removeToken();
          const newToken = await AuthService.login();
          if (newToken) {
            return this.get(endpoint, customHeaders);
          }
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      AlertService.captureException(error as Error, {
        context: 'ApiService.get',
        endpoint,
      });
      throw error;
    }
  }

  static async post<T>(endpoint: string, data: any, customHeaders?: Record<string, string>): Promise<T> {
    try {
      const headers = await this.getHeaders(customHeaders);
      const response = await fetch(`${this.API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          AuthService.removeToken();
          const newToken = await AuthService.login();
          if (newToken) {
            return this.post(endpoint, data, customHeaders);
          }
        }
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      AlertService.captureException(error as Error, {
        context: 'ApiService.post',
        endpoint,
        data,
      });
      throw error;
    }
  }
}

export { ApiService };