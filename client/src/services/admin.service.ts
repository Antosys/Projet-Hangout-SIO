import { apiRequest } from './api';

export const adminService = {
  getOverview: async (): Promise<Response> => apiRequest('/admin/overview', { method: 'GET' }),

  getUsers: async (params: URLSearchParams): Promise<Response> => {
    return apiRequest(`/admin/users?${params.toString()}`, { method: 'GET' });
  },

  updateUserRole: async (id: number, role: 'admin' | 'organisateur' | 'participant'): Promise<Response> => {
    return apiRequest(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  deleteUser: async (id: number): Promise<Response> => {
    return apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
  },

  getEvents: async (params: URLSearchParams): Promise<Response> => {
    return apiRequest(`/admin/events?${params.toString()}`, { method: 'GET' });
  },

  deleteEvent: async (id: number): Promise<Response> => {
    return apiRequest(`/admin/events/${id}`, { method: 'DELETE' });
  },

  getInscriptions: async (params: URLSearchParams): Promise<Response> => {
    return apiRequest(`/admin/inscriptions?${params.toString()}`, { method: 'GET' });
  },

  deleteInscription: async (id: number): Promise<Response> => {
    return apiRequest(`/admin/inscriptions/${id}`, { method: 'DELETE' });
  },

  createUser: async (data: {
    nom: string;
    prenom: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<Response> => {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createLocalisation: async (data: {
    address: string;
    city: string;
    postal_code: string;
  }): Promise<Response> => {
    return apiRequest('/admin/localisations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};