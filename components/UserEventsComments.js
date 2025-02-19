import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { useAuthContext } from '../hooks/useAuthContext';
import CommentCard from './CommentCard';

const UserEventsComments = () => {
  const { user } = useAuthContext();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch('http://10.0.2.2:4000/api/events', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Échec de la récupération des événements.');
        }

        const data = await response.json();

        // Filtrer les événements par ceux auxquels l'utilisateur a participé
        const userEvents = data.filter((event) => user.events.includes(event._id));

        setEvents(userEvents);

        // Calculer la note moyenne des événements de l'utilisateur
        const allRatings = userEvents
          .map((event) => event.evaluations)
          .flat()
          .map((evaluation) => evaluation.note);

        if (allRatings.length > 0) {
          const totalRating = allRatings.reduce((acc, note) => acc + note, 0);
          setAverageRating((totalRating / allRatings.length).toFixed(1));
        } else {
          setAverageRating(0);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.notConnectedContainer}>
        <Text style={styles.notConnectedText}>
          Vous devez être connecté pour voir vos commentaires d'événements.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Vous n'avez encore aucun événement avec des commentaires.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Commentaires sur vos événements</Text>

      {averageRating !== null && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>Note moyenne de vos événements</Text>
          <View style={styles.ratingValueContainer}>
            <Text style={styles.ratingValue}>{averageRating}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.eventContainer}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            {item.evaluations.length === 0 ? (
              <Text style={styles.noCommentsText}>Aucun commentaire pour cet événement.</Text>
            ) : (
              <FlatList
                data={item.evaluations}
                keyExtractor={(evaluation) => evaluation._id}
                renderItem={({ item: evaluation }) => (
                  <CommentCard
                    name={evaluation.name}
                    note={evaluation.note}
                    comment={evaluation.comment}
                    eventId={item._id}
                  />
                )}
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  notConnectedText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
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
    fontSize: 16,
    color: 'red',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#e53e3e',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    color: '#555',
  },
  ratingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e53e3e',
  },
  eventContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  noCommentsText: {
    fontSize: 14,
    color: '#777',
  },
});

export default UserEventsComments;
