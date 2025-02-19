import { useAuthContext } from './useAuthContext'
import { useEventsContext } from './useEventsContext'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useLogout = () => {
  const { dispatch } = useAuthContext()
  const { dispatch: dispatchWorkouts } = useEventsContext()

  const logout = async () => {
    // remove user from storage
    await AsyncStorage.removeItem('user')

    // dispatch logout action
    dispatch({ type: 'LOGOUT' })
    dispatchWorkouts({ type: 'SET_EVENTS', payload: null })
  }

  return { logout }
}