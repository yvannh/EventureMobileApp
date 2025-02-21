import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EventCardParticipate from '../components/EventCardParticipate';
import { useAuthContext } from '../hooks/useAuthContext';

const ParticipatingEvents = () => {
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchParticipatingEvents = useCallback(async () => {
    try {
      if (!user) {
        setError('Veuillez vous connecter');
        setLoading(false);
        return;
      }

      if (!user.participate || user.participate.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const validEvents = [];
      
      for (const eventId of user.participate) {
        try {
          const response = await fetch(`http://10.0.2.2:4000/api/events/${eventId}`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });

          if (response.ok) {
            const eventData = await response.json();
            validEvents.push(eventData);
          } else {
            console.log(`Événement ${eventId} non trouvé ou inaccessible`);
          }
        } catch (err) {
          console.error(`Erreur pour l'événement ${eventId}:`, err);
        }
      }

      setEvents(validEvents);
    } catch (err) {
      console.error('Erreur générale:', err);
      setError("Une erreur est survenue lors du chargement des événements");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchParticipatingEvents();
    }, [fetchParticipatingEvents])
  );

  const handleGoBack = () => {
    navigation.navigate('Home');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#e53e3e" />
          <Text style={styles.loadingText}>Chargement des événements...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (events.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.noEventsText}>
            Vous ne participez à aucun événement pour le moment.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <EventCardParticipate event={item} />}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={20} color="gray" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes Participations</Text>
      </View>

      {renderContent()}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e53e3e',
    textAlign: 'center',
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
});

export default ParticipatingEvents;
