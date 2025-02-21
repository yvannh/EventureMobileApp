import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useAuthContext } from '../hooks/useAuthContext';
import CommentCard from './CommentCard';

const UserComments = () => {
  const [comments, setComments] = useState([]); // Pour stocker les commentaires
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const getUserComments = async () => {
      try {
        const commentsResponse = await fetch('http://10.0.2.2:4000/api/user/user-comments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });

        const commentsData = await commentsResponse.json();
        if (commentsResponse.ok) {
          const updatedComments = await Promise.all(
            commentsData.eventsWithUserComments.map(async (event) => {
              const eventResponse = await fetch(
                `http://10.0.2.2:4000/api/events/${event.eventId}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                  },
                }
              );

              if (eventResponse.status === 404) {
                await fetch('http://10.0.2.2:4000/api/user/remove-comment', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                  },
                  body: JSON.stringify({ eventId: event.eventId }),
                });
                Alert.alert(
                  'Information',
                  `L'événement "${event.eventTitle}" a été supprimé. Votre commentaire a été retiré.`
                );
                return null; // Exclure l'événement supprimé
              } else if (eventResponse.ok) {
                return event; // Si l'événement existe encore, le garder
              }
            })
          );

          // Filtrer les événements invalides (nuls)
          setComments(updatedComments.filter((event) => event !== null));
        } else {
          setError(
            commentsData.error ||
              "Échec de la récupération des commentaires de l'utilisateur."
          );
        }
      } catch (err) {
        setError(
          err.message ||
            "Une erreur s'est produite lors de la récupération des données."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      getUserComments();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53e3e" />
        <Text style={styles.loadingText}>Chargement des commentaires...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mes Commentaires</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (comments.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mes Commentaires</Text>
        <Text style={styles.emptyText}>Vous n'avez encore commenté aucun événement.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Commentaires</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.eventId}
        renderItem={({ item }) => (
          <View style={styles.eventContainer}>
            <Text style={styles.eventTitle}>{item.eventTitle}</Text>
            {item.evaluations.map((evaluation) => (
              <CommentCard
                key={evaluation._id}
                name={evaluation.name}
                note={evaluation.note}
                comment={evaluation.comment}
                eventId={evaluation.eventId}
                parent="UserComments"
              />
            ))}
          </View>
        )}
        contentContainerStyle={styles.commentsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  eventContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
  },
  commentsList: {
    paddingBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default UserComments;
