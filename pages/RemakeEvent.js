import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import EventForm from '../components/EventForm';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RemakeEventPage = () => {
  const route = useRoute();
  const { eventId } = route.params || {};
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!user || !user.token) {
          throw new Error('Token manquant. Veuillez vous reconnecter.');
        }

        const response = await fetch(`http://10.0.2.2:4000/api/events/${eventId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Échec du chargement des données');
        }

        const data = await response.json();
        // Réinitialiser certains champs pour le nouvel événement
        const newEventData = {
          ...data,
          _id: null, // Forcer la création d'un nouvel ID
          attendees: [], // Réinitialiser les participants
          evaluations: [], // Réinitialiser les évaluations
          date: '', // Réinitialiser la date
          time: '', // Réinitialiser l'heure
        };
        setEventData(newEventData);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      }
    };

    fetchEvent();
  }, [eventId, user]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  if (!eventData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53e3e" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={20} color="gray" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recréer l'événement</Text>
      </View>
      <EventForm 
        initialData={eventData} 
        user={user} 
        isRemake={true} // Nouveau prop pour indiquer qu'il s'agit d'une recréation
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    color: '#555',
    fontSize: 16,
    marginTop: 8,
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
    color: 'gray',
    fontSize: 16,
  },
});

export default RemakeEventPage;
