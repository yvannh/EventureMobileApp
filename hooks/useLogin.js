import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLogin = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { dispatch } = useAuthContext()

  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://10.0.2.2:4000/api/user/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion')
      }

      // Vérifiez que les données contiennent les informations sur les événements
      console.log("Données de l'utilisateur après connexion :", data); // Log pour vérifier les données

      // Sauvegarde l'utilisateur dans le localStorage
      await AsyncStorage.setItem('user', JSON.stringify(data))

      // Met à jour l'état d'authentification
      dispatch({ type: 'LOGIN', payload: data })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}