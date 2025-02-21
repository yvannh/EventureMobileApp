import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useSignup = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { dispatch } = useAuthContext()

  const signup = async (nom, email, password, participate, commented) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://10.0.2.2:4000/api/user/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nom, email, password, participate, commented})
      })
      const json = await response.json()

      if (!response.ok) {
        setIsLoading(false)
        setError(json.error)
        return { error: json.error }
      }

      await AsyncStorage.setItem('user', JSON.stringify(json))
      dispatch({type: 'LOGIN', payload: json})
      setIsLoading(false)
      return { success: true }
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
      return { error: err.message }
    }
  }

  return { signup, isLoading, error }
}
