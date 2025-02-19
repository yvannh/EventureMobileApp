import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import { Calendar, MapPin, Users, XCircle, PlusCircle, MinusCircle } from 'react-native-feather';
import LeafletMapEvent from './LeafletMapEvent';

const EventDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuthContext();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAlreadyParticipated, setHasAlreadyParticipated] = useState(false);

  const eventId = route.params?.eventId;

  useEffect(() => {
    const fetchEventAndParticipation = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:4000/api/events/${eventId}`, {
          method: 'GET',
          headers: {
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });

        const data = await response.json();

        if (response.ok) {
          setEvent(data);
        } else {
          throw new Error(data.error || "Échec de la récupération de l'événement");
        }

        const participateResponse = await fetch(`http://10.0.2.2:4000/api/user/participate`, {
          method: 'GET',
          headers: {
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });

        const participateData = await participateResponse.json();
        if (participateResponse.ok) {
          setHasAlreadyParticipated(
            participateData.participate?.some((id) => id === eventId) || false
          );
        } else {
          throw new Error(
            participateData.error || 'Échec de la récupération des participations.'
          );
        }
      } catch (err) {
        setError(err.message || 'Une erreur est survenue.');
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndParticipation();
  }, [eventId, user]);

  const handleParticipate = async () => {
    try {
      if (!eventId || !user?.token) {
        throw new Error("Données manquantes pour la participation");
      }

      const requests = [
        fetch(`http://10.0.2.2:4000/api/user/add-event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ eventId }),
        }),
        fetch(`http://10.0.2.2:4000/api/events/attend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ eventId }),
        }),
      ];

      const [userResponse, eventResponse] = await Promise.all(requests);
      
      if (!userResponse.ok || !eventResponse.ok) {
        const errors = await Promise.all([
          userResponse.json().catch(() => ({})),
          eventResponse.json().catch(() => ({})),
        ]);
        throw new Error(errors[0].error || errors[1].error || "Erreur lors de la participation");
      }

      // Rafraîchissement des données
      const updatedEvent = await fetchEventData();
      setEvent(updatedEvent);
      setHasAlreadyParticipated(true);
      Alert.alert('Succès', 'Votre participation est confirmée !');

    } catch (err) {
      Alert.alert('Erreur', err.message);
      console.error("Erreur participation:", err);
    }
  };

  const handleUnparticipate = async () => {
    try {
      if (!eventId || !user?.token) {
        throw new Error("Données manquantes pour l'annulation");
      }

      const requests = [
        fetch(`http://10.0.2.2:4000/api/user/remove-event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ eventId }),
        }),
        fetch(`http://10.0.2.2:4000/api/events/remove-attendee`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ eventId }),
        }),
      ];

      const [userResponse, eventResponse] = await Promise.all(requests);
      
      if (!userResponse.ok || !eventResponse.ok) {
        const errors = await Promise.all([
          userResponse.json().catch(() => ({})),
          eventResponse.json().catch(() => ({})),
        ]);
        throw new Error(errors[0].error || errors[1].error || "Erreur lors de la désinscription");
      }

      // Rafraîchissement des données
      const updatedEvent = await fetchEventData();
      setEvent(updatedEvent);
      setHasAlreadyParticipated(false);
      Alert.alert('Succès', 'Désinscription confirmée');

    } catch (err) {
      Alert.alert('Erreur', err.message);
      console.error("Erreur désinscription:", err);
    }
  };

  const fetchEventData = async () => {
    const response = await fetch(`http://10.0.2.2:4000/api/events/${eventId}`);
    if (!response.ok) throw new Error("Échec de la mise à jour des données");
    return response.json();
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
    <FlatList
      data={[event]}
      keyExtractor={(item) => item._id}
      renderItem={() => (
        <View style={styles.container}>
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
              {numberOfAttendees} / {event.maxAttendees} participants
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {hasAlreadyParticipated ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleUnparticipate}>
                <MinusCircle color="#fff" />
                <Text style={styles.buttonText}>Me désinscrire</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={handleParticipate}>
                <PlusCircle color="#fff" />
                <Text style={styles.buttonText}>Participer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      ListHeaderComponent={<Text style={styles.header}>Détails de l'événement</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f7f7f7' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateText: { marginLeft: 8, fontSize: 16, color: '#e53e3e' },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, color: '#555', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 8, fontSize: 16, color: '#555' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53e3e',
    padding: 12,
    borderRadius: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: { marginLeft: 8, fontSize: 16, color: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16, color: '#555' },
  errorText: { fontSize: 16, color: '#e53e3e' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 },
});

export default EventDetails;
