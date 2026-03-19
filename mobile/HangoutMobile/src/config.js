// Configuration de l'API
// Résolution automatique de l'hôte API depuis Expo quand possible.
// Tu peux forcer une IP fixe avec API_HOST_OVERRIDE si nécessaire.

import Constants from 'expo-constants';

const API_HOST_OVERRIDE = null;

const resolveApiHost = () => {
  if (API_HOST_OVERRIDE) {
    return API_HOST_OVERRIDE;
  }

  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoClient?.hostUri ||
    Constants?.manifest?.debuggerHost ||
    '';

  const host = hostUri.split(':')[0];
  if (host) {
    return `http://${host}:5000`;
  }

  return 'http://172.20.10.4:5000';
};

const API_HOST = resolveApiHost();

export const API_CONFIG = {
  HOST: API_HOST,
  BASE_URL: `${API_HOST}/api`,
  TIMEOUT: 10000,
};

export const buildUploadUrl = (filename) => {
  if (!filename) {
    return null;
  }
  return `${API_CONFIG.HOST}/uploads/${filename}`;
};

export default API_CONFIG;
