// utils/ApiHelper.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BASE_URLS } from './ApiConstants';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export class ApiHelper {
  private static instance: AxiosInstance;

  static init(baseURL: string = BASE_URLS.DEFAULT) {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 15000,
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        console.log('[API Request]', config.method?.toUpperCase(), config.url, config.data);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        console.log('[API Response]', response.status, response.config.url, response.data);
        return response;
      },
      (error) => {
        console.error('[API Response Error]', error?.response?.status, error?.response?.data);
        return Promise.reject(error);
      }
    );
  }

  private static mapResponse<T>(json: any, mapper?: (json: any) => T): T {
    if (mapper) return mapper(json);
    return json as T;
  }

  private static extractErrorMessage(error: any): string {
    // If Frappe returns a JSON with message field
    if (error?.response?.data?.message) return error.response.data.message;
    // Fallback to default message
    return error.message || 'Network Error';
  }

  static async post<T>(
    url: string,
    body: any,
    headers: Record<string, string> = {},
    mapper?: (json: any) => T
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post(url, body, { headers });
      return { success: true, data: ApiHelper.mapResponse<T>(response.data, mapper), status: response.status };
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      const status = error?.response?.status;

        console.log('Error message extracted:', message);

      return { success: false, error: message, status };
    }
  }

  static async get<T>(
    url: string,
    headers: Record<string, string> = {},
    mapper?: (json: any) => T
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get(url, { headers });
      return { success: true, data: ApiHelper.mapResponse<T>(response.data, mapper), status: response.status };
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      const status = error?.response?.status;
      return { success: false, error: message, status };
    }
  }
}
