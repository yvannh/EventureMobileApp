import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { useAuthContext } from '../hooks/useAuthContext';
import EventCardParticipate from './EventCardParticipate';

const EventListParticipate = () => {
  const { user } = useAuthContext();
  const [futureEvents, setFutureEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipatedEvents = async () => {
      if (!user) {
        setError('Veuillez vous connecter pour accéder à vos événements.');
        setLoading(false);
        return;
      }

      try {
        const eventPromises = user.participate.map(async (eventId) => {
          const response = await fetch(`http://10.0.2.2:4000/api/events/${eventId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
          });

          if (response.status === 404) {
            await removeEvent(eventId);
            await removeCommented(eventId);
            return null;
          }

          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des événements.');
          }

          return response.json();
        });

        const results = await Promise.all(eventPromises);
        const validEvents = results.filter((event) => event !== null);

        // Tri des événements
        const now = new Date();
        const upcoming = validEvents.filter((event) => new Date(event.date) > now);
        const past = validEvents.filter((event) => new Date(event.date) <= now);

        // Mise à jour des états
        setFutureEvents(upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)));
        setPastEvents(past.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.log("Erreur lors de la récupération des événements :", err);
        setError(err.message || 'Erreur lors de la récupération des événements.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchParticipatedEvents();
    }
  }, [user]);

  const removeEvent = async (eventId) => {
    try {
      const removeEventResponse = await fetch('http://10.0.2.2:4000/api/user/remove-event', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      const removeEventData = await removeEventResponse.json();

      if (!removeEventResponse.ok) {
        return;
      }

      user.participate = removeEventData.participate;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      console.error(err);
    }
  };

  const removeCommented = async (eventId) => {
    try {
      const removeCommentResponse = await fetch('http://10.0.2.2:4000/api/user/remove-comment', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      const removeCommentData = await removeCommentResponse.json();

      if (!removeCommentResponse.ok) {
        return;
      }

      user.commented = removeCommentData.commented;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (futureEvents.length === 0 && pastEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Vous ne participez à aucun événement.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[...futureEvents, ...pastEvents]}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <EventCardParticipate
          event={item}
          onRemove={() => removeEvent(item._id)}
        />
      )}
      ListHeaderComponent={
        <View>
          {futureEvents.length > 0 && (
            <Text style={styles.sectionTitle}>Événements à venir</Text>
          )}
          {pastEvents.length > 0 && (
            <Text style={styles.sectionTitle}>Événements passés</Text>
          )}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#e53e3e',
  },
  pastEventsContainer: {
    marginTop: 24,
  },
});

export default EventListParticipate;
