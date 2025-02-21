import React, { useEffect, useState, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../hooks/useAuthContext';
import EventDetails from '../components/EventDetails';
import EventComments from '../components/EventComments';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RelatedEvents from '../components/RelatedEvents';

const PageEvent = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};
  const { user } = useAuthContext();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchEvent = useCallback(async () => {
    if (!eventId || !user?.token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://10.0.2.2:4000/api/events/${eventId}?ts=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setEvent(data);
      } else {
        setError(data.error || "Erreur lors de la récupération de l'événement");
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError("Erreur lors de la récupération de l'événement");
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.token]);

  useEffect(() => {
    let isMounted = true;

    const loadEvent = async () => {
      if (isMounted) {
        await fetchEvent();
      }
    };

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [fetchEvent]);

  const handleEventUpdate = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
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

  if (!eventId) {
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

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.errorHeader}>
          <Text style={styles.errorTitle}>Erreur</Text>
        </View>
        <Text style={styles.errorMessage}>{error}</Text>
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
        {event && (
          <EventDetails 
            event={event} 
            onEventUpdate={handleEventUpdate}
            setEvent={setEvent}
          />
        )}
        {event && (
          <>
            <EventComments eventId={event._id} />
            {event.category && (
              <RelatedEvents 
                category={event.category} 
                currentEventId={event._id} 
              />
            )}
          </>
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
    backgroundColor: 'white',
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
