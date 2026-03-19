import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';

const isAuthRequest = (url = '') => {
  const normalizedUrl = String(url).toLowerCase();
  return normalizedUrl.includes('/auth/login') || normalizedUrl.includes('/auth/register');
};

export const isUnauthorizedError = (error) => {
  return error?.isUnauthorized === true || error?.response?.status === 401;
};

export const isNetworkError = (error) => {
  if (!error) {
    return false;
  }

  return (
    !error.response &&
    (error.code === 'ERR_NETWORK' || /network error/i.test(error.message || ''))
  );
};

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête : ajoute le token JWT automatiquement
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : gère les erreurs communes
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401 && !isAuthRequest(error.config?.url)) {
      error.isUnauthorized = true;

      // Token expiré ou invalide - déconnexion globale et redirection
      if (!global.__isHandlingUnauthorized) {
        global.__isHandlingUnauthorized = true;
        try {
          if (global.handleUnauthorized) {
            await global.handleUnauthorized();
          } else {
            // Fallback si la fonction globale n'est pas disponible
            await AsyncStorage.multiRemove(['userToken', 'user']);
          }
        } finally {
          global.__isHandlingUnauthorized = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
