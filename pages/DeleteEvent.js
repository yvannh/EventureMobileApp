import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import { format } from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DeleteEventPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};
  const { user } = useAuthContext();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    postalCode: '',
    city: '',
    maxAttendees: '',
    category: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    if (!user || !eventId) return;

    const fetchEvent = async () => {
      console.log(eventId);
      try {
        const response = await fetch(`https://10.0.2.2:4000/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!response.ok) {
          throw new Error('Impossible de récupérer les détails de l’événement.');
        }

        const data = await response.json();
        setEvent(data);
        setFormData({
          title: data.title,
          description: data.description,
          address: data.address,
          postalCode: data.postalCode,
          city: data.city,
          maxAttendees: data.maxAttendees,
          category: data.category,
          date: format(new Date(data.date), 'yyyy-MM-dd'),
          time: format(new Date(data.date), 'HH:mm'),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user]);

  const handleDelete = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cet événement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`https://10.0.2.2:4000/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Échec de la suppression de l'événement.");
              }

              Alert.alert('Succès', 'Événement supprimé avec succès.');
              navigation.navigate('MyEvents');
            } catch (err) {
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53e3e" />
        <Text style={styles.loadingText}>Chargement des détails de l'événement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suppression de cet événement</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={20} color="white" />
          <Text style={styles.buttonText}>Supprimer l'événement</Text>
        </TouchableOpacity>
      </View>

      {/* Détails de l'événement */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Titre de l'événement</Text>
          <TextInput style={styles.input} value={formData.title} editable={false} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput style={styles.textarea} value={formData.description} editable={false} multiline />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput style={styles.input} value={formData.date} editable={false} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Heure</Text>
          <TextInput style={styles.input} value={formData.time} editable={false} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lieu</Text>
          <TextInput style={styles.input} value={`${formData.address}, ${formData.city}`} editable={false} />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('MyEvents')}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53e3e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    color: '#555',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    color: '#555',
    height: 80,
  },
  cancelButton: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  loadingText: {
    color: '#555',
    fontSize: 16,
    marginTop: 8,
  },
});

export default DeleteEventPage;
