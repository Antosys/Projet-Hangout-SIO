import { apiRequest } from './api';
import { LoginCredentials, RegisterData } from '@/types';

export const authService = {
  verifyToken: async (): Promise<Response> => {
    return apiRequest('/auth/verify', { method: 'GET' });
  },

  login: async (credentials: LoginCredentials): Promise<Response> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: RegisterData): Promise<Response> => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};
