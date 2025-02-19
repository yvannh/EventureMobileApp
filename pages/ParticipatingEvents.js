import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EventListParticipate from '../components/EventListParticipate';

const ParticipatingEvents = () => {
  const navigation = useNavigation(); // Hook pour naviguer

  const handleGoBack = () => {
    navigation.navigate('Home'); // Retour à la page d'accueil
  };

  return (
    <View style={styles.container}>
      {/* Conteneur du bouton et titre alignés horizontalement */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={20} color="gray" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes Participations</Text>
      </View>

      {/* Liste des événements */}
      <EventListParticipate />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: 'gray',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
});

export default ParticipatingEvents;
