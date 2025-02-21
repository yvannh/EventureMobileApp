import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import CommentCard from './CommentCard';

const EventComments = ({ eventId }) => {
  const route = useRoute();
  const { id } = route.params || {};
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  const fetchEvaluations = useCallback(async () => {
    if (!eventId || !user?.token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://10.0.2.2:4000/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setEvaluations(data.evaluations || []);
      } else {
        throw new Error(data.error || "Erreur lors de la récupération des évaluations.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.token]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

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
      {evaluations.map((item, index) => (
        <View key={index} style={styles.commentContainer}>
          <CommentCard
            name={item.name}
            note={item.note}
            comment={item.comment}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  centered: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
