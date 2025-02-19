import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';

const EvaluateEvent = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {}; // Récupère l'ID de l'événement depuis les paramètres
  const [note, setNote] = useState(null);
  const [comment, setComment] = useState('');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventResponse = await fetch(`https://votre-api.com/api/events/${id}`, {
          method: 'GET',
          headers: {
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });
        const eventData = await eventResponse.json();
        if (eventResponse.ok) {
          setEvent(eventData);
        } else {
          setError(
            eventData.error || "Échec de la récupération des détails de l'événement.",
          );
        }
      } catch (err) {
        setError(
          err.message || "Une erreur s'est produite lors de la récupération des données.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEventDetails();
    }
  }, [id, user]);

  const handleAddEvaluation = async () => {
    if (note === null || !comment) {
      setError('Note et commentaire sont obligatoires.');
      return;
    }

    try {
      const response = await fetch(`https://votre-api.com/api/events/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ eventId: id, note, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'ajout de l'évaluation.");
      }

      Alert.alert('Succès', 'Évaluation ajoutée avec succès.');
      navigation.navigate('Participations'); // Navigue vers la liste des participations
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53e3e" />
        <Text style={styles.loadingText}>Chargement des détails de l'événement...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Aucun événement trouvé.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Évaluer : {event.title}</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Note */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Note :</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setNote(star)}>
              <Text style={[styles.star, note >= star && styles.selectedStar]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Commentaire */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Commentaire :</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Entrez votre commentaire"
          value={comment}
          onChangeText={setComment}
          multiline
        />
      </View>

      {/* Bouton Ajouter une évaluation */}
      <TouchableOpacity onPress={handleAddEvaluation} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Ajouter une évaluation</Text>
      </TouchableOpacity>
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 32,
    color: '#ddd',
    marginHorizontal: 4,
  },
  selectedStar: {
    color: '#fbb034',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    height: 100,
  },
  submitButton: {
    backgroundColor: '#e53e3e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default EvaluateEvent;
