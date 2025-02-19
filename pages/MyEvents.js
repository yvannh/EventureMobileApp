import React from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import EventListUser from '../components/EventListUser';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MyEvents = () => {
  const navigation = useNavigation(); // Hook pour naviguer
  const { user } = useAuthContext();

  // Fonction pour naviguer vers la page précédente
  const handleGoBack = () => {
    navigation.navigate('Home'); // Retour à la page d'accueil
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Veuillez vous connecter pour voir vos événements.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Événements</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateEvent')}
          style={styles.createButton}
        >
          <MaterialIcons name="add-circle" size={20} color="white" />
          <Text style={styles.buttonText}>Créer un événement</Text>
        </TouchableOpacity>
      </View>

      <EventListUser />
    </View>
  );
};

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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53e3e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#718096',
  },
});

export default MyEvents;
