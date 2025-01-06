import { AuthService } from './AuthService';
import { AlertService } from './AlertService';

class ApiService {
  private static readonly API_URL = 'https://api.lovehotel.io';

  private static async getHeaders(customHeaders?: Record<string, string>): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    });

    const token = AuthService.getToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
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
          // Token expiré ou invalide
          AuthService.removeToken();
          await AuthService.login();
          // Réessayer la requête
          return this.get(endpoint, customHeaders);
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
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
          await AuthService.login();
          return this.post(endpoint, data, customHeaders);
        }
        throw new Error(`Erreur HTTP: ${response.status}`);
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