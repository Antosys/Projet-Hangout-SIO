import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { saveToken, saveUser, getToken, getUser, clearAllStorage } from '../utils/storage';
import { navigationRef } from '../navigation/AppNavigator';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await getToken();
        const user = await getUser();
        if (token) {
          setState({
            isLoading: false,
            isSignout: false,
            userToken: token,
            user: user,
          });
        } else {
          setState({
            isLoading: false,
            isSignout: false,
            userToken: null,
            user: null,
          });
        }
      } catch (e) {
        console.error('Erreur lors du bootstrap:', e);
        setState({
          isLoading: false,
          isSignout: false,
          userToken: null,
          user: null,
        });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    login: async (email, password) => {
      try {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        await saveToken(token);
        await saveUser(user);
        setState({
          isLoading: false,
          isSignout: false,
          userToken: token,
          user: user,
        });
        return { success: true };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Erreur de connexion';
        return { success: false, error: errorMessage };
      }
    },

    // REGISTER ne stocke pas de token ni user
    register: async (prenom, nom, username, email, password) => {
      try {
        await api.post('/auth/register', { prenom, nom, username, email, password });
        return { success: true };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
        return { success: false, error: errorMessage };
      }
    },

    logout: async () => {
      try {
        await clearAllStorage();
        setState({
          isLoading: false,
          isSignout: true,
          userToken: null,
          user: null,
        });
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    },
  };

  // Fonction globale pour gérer la déconnexion et navigation en cas d'erreur 401
  const handleUnauthorized = async () => {
    try {
      await clearAllStorage();
      setState({
        isLoading: false,
        isSignout: true,
        userToken: null,
        user: null,
      });
      // Rediriger vers la page d'accueil de l'auth flow
      setTimeout(() => {
        if (navigationRef.current && navigationRef.current.isReady()) {
          navigationRef.current.resetRoot({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        }
      }, 0);
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'erreur 401:', error);
    }
  };

  // Exporter la fonction globale
  React.useEffect(() => {
    global.handleUnauthorized = handleUnauthorized;

    return () => {
      if (global.handleUnauthorized === handleUnauthorized) {
        delete global.handleUnauthorized;
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ state, ...authContext }}>
      {children}
    </AuthContext.Provider>
  );
}