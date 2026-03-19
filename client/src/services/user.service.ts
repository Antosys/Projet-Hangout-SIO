import { apiRequest } from './api';
import { UserProfile, ChangePasswordData } from '@/types';

export const userService = {
  getProfile: async (): Promise<Response> => {
    return apiRequest('/user/profile', { method: 'GET' });
  },

  updateProfile: async (profileData: Partial<UserProfile>): Promise<Response> => {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (passwordData: ChangePasswordData): Promise<Response> => {
    return apiRequest('/user/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  deleteAccount: async (): Promise<Response> => {
    return apiRequest('/user/profile', { method: 'DELETE' });
  },
};
