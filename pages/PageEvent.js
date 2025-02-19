import React, { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../hooks/useAuthContext';
import EventDetails from '../components/EventDetails';
import EventComments from '../components/EventComments';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RelatedEvents from '../components/RelatedEvents';

const PageEvent = () => {
  const route = useRoute(); // Pour accéder aux paramètres de la route
  const navigation = useNavigation();
  const { id } = route.params || {}; // Récupère l'ID de l'événement depuis les paramètres
  const { user } = useAuthContext();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const response = await fetch(`https://votre-api.com/api/events/${id}`, {
          method: 'GET',
          headers: {
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });
        const data = await response.json();

        if (response.ok) {
          setEvent(data); // Sauvegarde les données de l'événement
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'événement', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleGoBack = () => {
    navigation.goBack(); // Retour à la page précédente
  };

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.errorHeader}>
          <Text style={styles.errorTitle}>Erreur</Text>
        </View>
        <Text style={styles.errorMessage}>
          Vous devez être connecté pour voir les détails de cet événement.
        </Text>
      </View>
    );
  }

  if (!id) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.errorHeader}>
          <Text style={styles.errorTitle}>Erreur</Text>
        </View>
        <Text style={styles.errorMessage}>
          L'ID de l'événement est manquant.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#e53e3e" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={20} color="gray" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Détails de l'événement</Text>
      </View>

      <View style={styles.content}>
        <EventDetails event={event} />
        <EventComments eventId={id} />
        {event?.category && (
          <RelatedEvents category={event.category} eventId={event._id} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    padding: 16,
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
    color: '#333',
  },
  content: {
    marginTop: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  errorHeader: {
    backgroundColor: '#e53e3e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorMessage: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 16,
  },
});

export default PageEvent;
