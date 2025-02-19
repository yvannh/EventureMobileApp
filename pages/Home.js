import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EventFilterAndList from '../components/EventFilterAndList'

const Home = () => {
  const { user, logout } = useAuthContext()
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login')
    }
  }, [user, navigation])

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenue sur Eventure</Text>
      </View>

      <Text style={styles.subtitle}>
        Découvrez et participez à des événements passionnants !
      </Text>

      <EventFilterAndList />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e53e3e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 8,
  },
})

export default Home
