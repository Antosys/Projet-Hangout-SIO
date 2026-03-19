import { apiRequest } from './api';

export const locationService = {
  getLocations: async (search?: string): Promise<Response> => {
    const query = search ? `?search=${search}` : '';
    return apiRequest(`/localisations${query}`, { method: 'GET' });
  },
};
