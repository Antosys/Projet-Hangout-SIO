import { apiRequest } from './api';

// Upload pour la création d'événément
export const uploadService = {
  uploadPhotos: async (formData: FormData): Promise<Response> => {
    return apiRequest('/images/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Upload pour la modif d'événement
  uploadImage: async (formData: FormData): Promise<Response> => {
    return apiRequest('/images/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
