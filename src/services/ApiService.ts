import { AuthService } from './AuthService';
import { AlertService } from './AlertService';

interface RequestOptions {
  headers?: Record<string, string>;
}

class ApiService {
  private static readonly API_URL = 'https://api.lovehotel.io';

  private static async getHeaders(customHeaders: Record<string, string> = {}): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/ld+json',
      'Accept': 'application/ld+json',
      ...customHeaders,
    });

    const token = AuthService.getToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  static async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    try {
      const headers = await this.getHeaders(options.headers);
      const response = await fetch(`${this.API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          AuthService.removeToken();
          await AuthService.login();
          return this.get(endpoint, options);
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

  static async post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    try {
      const headers = await this.getHeaders(options.headers);
      const response = await fetch(`${this.API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          AuthService.removeToken();
          await AuthService.login();
          return this.post(endpoint, data, options);
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