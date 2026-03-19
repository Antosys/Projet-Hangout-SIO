import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarde le token JWT
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token:', error);
  }
};

// Récupère le token JWT
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Erreur lors de la lecture du token:', error);
    return null;
  }
};

// Supprime le token JWT
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error('Erreur lors de la suppression du token:', error);
  }
};

// Sauvegarde les informations utilisateur
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
  }
};

// Récupère les informations utilisateur
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'utilisateur:', error);
    return null;
  }
};

// Supprime les informations utilisateur
export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
  }
};

// Vide tout le stockage (déconnexion)
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.multiRemove(['userToken', 'user']);
  } catch (error) {
    console.error('Erreur lors de la suppression du stockage:', error);
  }
};
