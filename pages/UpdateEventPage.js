import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import EventForm from '../components/EventForm';

const UpdateEventPage = () => {
  const route = useRoute();
  const { eventId } = route.params || {};
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!user || !user.token) {
          throw new Error('Token manquant. Veuillez vous reconnecter.');
        }

        if (!eventId) {
          throw new Error("L'ID de l'événement est requis.");
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
        setEventData(data);
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
      <Text style={styles.title}>Modifier l'événement</Text>
      <EventForm initialData={eventData} user={user} />
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
});

export default UpdateEventPage;
