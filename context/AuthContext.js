import { createContext, useReducer, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Création du contexte d'authentification
export const AuthContext = createContext();

// Reducer pour gérer l'état d'authentification
export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload };
    case 'LOGOUT':
      return { user: null };
    default:
      return state;
  }
};

// Provider du contexte d'authentification
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });
  const [loading, setLoading] = useState(true); // État de chargement

  // Vérifie si un utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    const checkUser = async () => {
      const userJSON = await AsyncStorage.getItem('user'); // Récupère l'utilisateur depuis AsyncStorage
      if (userJSON) {
        const user = JSON.parse(userJSON);
        dispatch({ type: 'LOGIN', payload: user });
      }
    };

    checkUser();
  }, []);

  // Charger l'utilisateur depuis AsyncStorage au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          dispatch({ type: 'LOGIN', payload: JSON.parse(storedUser) });
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur :", error);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Fonction de déconnexion
  const logout = () => {
    AsyncStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  // Attendre que l'utilisateur soit chargé avant d'afficher l'application
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch, logout }}>
      {children}
    </AuthContext.Provider>
  );
};