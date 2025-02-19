import { useState } from 'react'
import { useAuthContext } from './useAuthContext'

export const useSignup = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { dispatch } = useAuthContext()

  const signup = async (nom, email, password, participate, commented) => {
    setIsLoading(true)
    setError(null)

    const response = await fetch('/api/user/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ nom, email, password, participate, commented})
    })
    const json = await response.json()

    if (!response.ok) {
      setIsLoading(false)
      setError(json.error)
    }
    if (response.ok) {
      // Sauvegarder l'utilisateur dans le localStorage
      localStorage.setItem('user', JSON.stringify(json))

      // Mettre à jour le contexte d'authentification
      dispatch({type: 'LOGIN', payload: json})

      // Mise à jour de l'état de chargement
      setIsLoading(false)
    }
  }

  return { signup, isLoading, error }
}
