import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import CommentCard from './CommentCard';

const EventComments = () => {
  const route = useRoute(); // Récupérer les paramètres de la route
  const { id } = route.params || {}; // Récupère l'ID de l'événement
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await fetch(`https://votre-api.com/api/events/${id}`, {
          method: 'GET',
          headers: {
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Récupérer les évaluations depuis le champ evaluate
          setEvaluations(data.evaluations || []);
        } else {
          throw new Error(data.error || "Erreur lors de la récupération des évaluations.");
        }
      } catch (err) {
        setError(err.message || "Une erreur s'est produite.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [id, user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53e3e" />
        <Text style={styles.loadingText}>Chargement des évaluations...</Text>
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

  if (!evaluations.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Avis sur cet événement</Text>
        <Text style={styles.noCommentsText}>
          Il n'y a pas encore d'avis pour cet événement.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avis sur cet événement</Text>
      <FlatList
        data={evaluations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <CommentCard
              name={item.name}
              note={item.note}
              comment={item.comment}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7f7f7',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  noCommentsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
  },
  commentContainer: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  list: {
    paddingBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#555',
    fontSize: 16,
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EventComments;
