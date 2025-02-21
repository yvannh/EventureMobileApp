import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import { 
  Calendar, 
  MapPin, 
  Users, 
  PlusCircle, 
  MinusCircle,
  ExternalLink
} from 'react-native-feather';
import LeafletMapEvent from './LeafletMapEvent';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventDetails = ({ event, onEventUpdate, setEvent }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, dispatch } = useAuthContext();
  const eventId = route.params?.eventId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAlreadyParticipated, setHasAlreadyParticipated] = useState(false);
  const EXTERNAL_CREATOR_ID = "676015c9b24d4d5bab7a26fa";

  const isEventPassed = new Date(event?.date) < new Date();

  useEffect(() => {
    if (event && user) {
      if (event?.user_id === EXTERNAL_CREATOR_ID) {
        const isFollowing = user.participate?.some(
          (eventId) => eventId === event._id
          );
        setHasAlreadyParticipated(isFollowing);
      } else {
        const tokenParts = user.token.split('.');
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        const userId = tokenPayload._id;
        const isParticipating = event.attendees?.some(
          (attendeeId) => attendeeId === userId
        );
        setHasAlreadyParticipated(isParticipating);
      }
    }
  }, [event, user]);

  const handleParticipate = async () => {
    try {
      if (!event?._id || !user?.token) {
        throw new Error("Données manquantes pour la participation");
      }

      const tokenParts = user.token.split('.');
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId = tokenPayload._id;

      setHasAlreadyParticipated(true);

      if (event.user_id === EXTERNAL_CREATOR_ID) {
        const userResponse = await fetch(`http://10.0.2.2:4000/api/user/add-event`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ eventId: event._id }),
        });

        if (!userResponse.ok) {
          setHasAlreadyParticipated(false);
          throw new Error("Erreur lors du suivi de l'événement");
        }

        const userJson = await userResponse.json();
        const updatedUser = {
          ...user,
          participate: userJson.participate
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'LOGIN', payload: updatedUser });
      } else {
        const optimisticEvent = {
          ...event,
          attendees: [...event.attendees, userId]
        };
        setEvent(optimisticEvent);

        const [userResponse, eventResponse] = await Promise.all([
          fetch(`http://10.0.2.2:4000/api/user/add-event`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ eventId: event._id }),
          }),
          fetch(`http://10.0.2.2:4000/api/events/attend`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ eventId: event._id }),
          }),
        ]);

        if (!userResponse.ok || !eventResponse.ok) {
          setEvent(event);
          setHasAlreadyParticipated(false);
          throw new Error("Erreur lors de l'inscription");
        }

        const userJson = await userResponse.json();
        const updatedUser = {
          ...user,
          participate: userJson.participate
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'LOGIN', payload: updatedUser });
      }

      if (onEventUpdate) {
        onEventUpdate();
      }

      navigation.setParams({ refresh: Date.now() });
    } catch (err) {
      Alert.alert('Erreur', err.message);
      console.error("Erreur participation:", err);
    }
  };

  const handleUnparticipate = async () => {
    try {
      if (!event?._id || !user?.token) {
        throw new Error("Données manquantes pour l'annulation");
      }

      setHasAlreadyParticipated(false);

      if (event.user_id === EXTERNAL_CREATOR_ID) {
        const userResponse = await fetch(`http://10.0.2.2:4000/api/user/remove-event`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ eventId: event._id }),
        });

        if (!userResponse.ok) {
          setHasAlreadyParticipated(true);
          throw new Error("Erreur lors du retrait du suivi");
        }

        const userJson = await userResponse.json();
        const updatedUser = {
          ...user,
          participate: userJson.participate
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'LOGIN', payload: updatedUser });
      } else {
        const tokenParts = user.token.split('.');
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        const userId = tokenPayload._id;

        const optimisticEvent = {
          ...event,
          attendees: event.attendees.filter(id => id !== userId)
        };
        setEvent(optimisticEvent);

        const [userResponse, eventResponse] = await Promise.all([
          fetch(`http://10.0.2.2:4000/api/user/remove-event`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ eventId: event._id }),
          }),
          fetch(`http://10.0.2.2:4000/api/events/remove-attendee`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ eventId: event._id }),
          }),
        ]);

        if (!userResponse.ok || !eventResponse.ok) {
          setEvent(event);
          setHasAlreadyParticipated(true);
          throw new Error("Erreur lors de la désinscription");
        }

        const userJson = await userResponse.json();
        const updatedUser = {
          ...user,
          participate: userJson.participate
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'LOGIN', payload: updatedUser });
      }

      if (onEventUpdate) {
        onEventUpdate();
      }

      navigation.setParams({ refresh: Date.now() });
    } catch (err) {
      console.error("Erreur détaillée:", err);
      Alert.alert('Erreur', err.message);
    }
  };

  const handleOpenWebLink = async () => {
    if (event.url_api) {
      try {
        const url = event.url_api.startsWith('http') ? 
          event.url_api : 
          `https://${event.url_api}`;

        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Erreur", "Impossible d'ouvrir ce lien");
        }
      } catch (error) {
        Alert.alert("Erreur", "Une erreur est survenue lors de l'ouverture du lien");
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53e3e" />
        <Text style={styles.loadingText}>Chargement...</Text>
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

  const formattedDate = event.date
    ? new Date(event.date).toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })
    : 'Date non définie';

  const numberOfAttendees = event.attendees ? event.attendees.length : 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>      
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.dateContainer}>
          <Calendar color="#e53e3e" />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <Image source={{ uri: event.url_cover }} style={styles.image} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.infoRow}>
          <MapPin color="#6b7280" />
          <Text style={styles.infoText}>
            {event.address}, {event.city}, {event.postalCode}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Users color="#6b7280" />
          <Text style={styles.infoText}>
            {event.maxAttendees === 0 ? 
              "Inscription externe requise" : 
              `${numberOfAttendees} / ${event.maxAttendees} participants`
            }
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {event.user_id === EXTERNAL_CREATOR_ID ? (
            <>
              {event.url_api && (
                <TouchableOpacity 
                  style={[styles.button, styles.webLinkButton]} 
                  onPress={handleOpenWebLink}
                >
                  <ExternalLink color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Consulter le site</Text>
                </TouchableOpacity>
              )}
              
              {!isEventPassed && (
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    hasAlreadyParticipated ? styles.secondaryButton : styles.primaryButton
                  ]} 
                  onPress={hasAlreadyParticipated ? handleUnparticipate : handleParticipate}
                >
                  {hasAlreadyParticipated ? (
                    <>
                      <MinusCircle color="#fff" />
                      <Text style={styles.buttonText}>Ne plus suivre</Text>
                    </>
                  ) : (
                    <>
                      <PlusCircle color="#fff" />
                      <Text style={styles.buttonText}>Suivre l'événement</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            !isEventPassed && (
              <TouchableOpacity 
                style={[
                  styles.button, 
                  hasAlreadyParticipated ? styles.secondaryButton : styles.primaryButton
                ]} 
                onPress={hasAlreadyParticipated ? handleUnparticipate : handleParticipate}
              >
                {hasAlreadyParticipated ? (
                  <>
                    <MinusCircle color="#fff" />
                    <Text style={styles.buttonText}>Se désinscrire</Text>
                  </>
                ) : (
                  <>
                    <PlusCircle color="#fff" />
                    <Text style={styles.buttonText}>S'inscrire</Text>
                  </>
                )}
              </TouchableOpacity>
            )
          )}
          
          {isEventPassed && (
            <View style={[styles.button, styles.disabledButton]}>
              <Text style={styles.buttonText}>Événement terminé</Text>
            </View>
          )}
        </View>
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateText: { marginLeft: 8, fontSize: 16, color: '#e53e3e' },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#555', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 8, fontSize: 16, color: '#555' },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    gap: 8,
  },
  webLinkButton: {
    backgroundColor: '#4a5568',
  },
  primaryButton: {
    backgroundColor: '#e53e3e',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
  },
  buttonIcon: {
    marginRight: 8,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16, color: '#555' },
  errorText: { fontSize: 16, color: '#e53e3e' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  content: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#9ca3af', // Gris clair
    opacity: 0.7,
  },
});

export default EventDetails;
