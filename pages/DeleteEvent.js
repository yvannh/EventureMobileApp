import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import EventForm from '../components/EventForm';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeleteEventPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState(null);
  const { user, dispatch } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchEvent = async () => {
      try {
        if (!user || !user.token) {
          navigation.replace('Login');
          return;
        }

        if (!eventId) {
          navigation.replace('MyEvents');
          return;
        }

        const response = await fetch(`http://10.0.2.2:4000/api/events/${eventId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          signal: abortController.signal
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Échec du chargement des données');
        }

        const data = await response.json();
        setEventData(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error(err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();

    return () => {
      abortController.abort();
    };
  }, [eventId, user, navigation]);

  const handleDelete = async () => {
    if (!user || !user.token) {
      Alert.alert('Erreur', 'Vous devez être connecté pour supprimer un événement.');
      navigation.replace('Login');
      return;
    }

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
              setIsLoading(true);

              const deleteResponse = await fetch(`http://10.0.2.2:4000/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              });

              if (!deleteResponse.ok) {
                const errorData = await deleteResponse.json();
                throw new Error(errorData.error || "Échec de la suppression de l'événement.");
              }

              const updateUserResponse = await fetch(`http://10.0.2.2:4000/api/user/remove-event`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ eventId })
              });

              if (!updateUserResponse.ok) {
                throw new Error("Échec de la mise à jour des participations de l'utilisateur.");
              }

              const updatedParticipate = Array.isArray(user.participate) 
                ? user.participate.filter(id => id !== eventId)
                : [];
                
              const updatedUser = { 
                ...user, 
                participate: updatedParticipate 
              };
              
              await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
              dispatch({ type: 'LOGIN', payload: updatedUser });

              navigation.reset({
                index: 0,
                routes: [{ name: 'MyEvents' }],
              });
              
              setTimeout(() => {
                Alert.alert('Succès', 'Événement supprimé avec succès.');
              }, 100);

            } catch (err) {
              console.error('Erreur lors de la suppression:', err);
              Alert.alert('Erreur', err.message || 'Une erreur est survenue lors de la suppression.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53e3e" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </View>
    );
  }

  if (!user || !eventId) {
    return null; // Retourner null pendant que la redirection se fait
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={20} color="gray" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Supprimer l'événement</Text>
      </View>
      <View style={styles.eventFormContainer}>
        <EventForm 
          initialData={eventData} 
          user={user}
          readOnly={true}
          customButtons={[
            {
              text: 'Supprimer',
              onPress: handleDelete,
              style: 'deleteButton'
            },
            {
              text: 'Annuler',
              onPress: () => navigation.navigate('MyEvents'),
              style: 'cancelButton'
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
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
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
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
  eventFormContainer: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    flex: 1,
    paddingBottom: 20,
  },
});

export default DeleteEventPage;
