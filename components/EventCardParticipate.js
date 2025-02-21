import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Calendar, MapPin, Users, Star, CheckCircle } from "lucide-react-native";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "../hooks/useAuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageBlob from "./ImageBlob";

const EventCardParticipate = ({ event }) => {
  const navigation = useNavigation();
  const numberOfAttendees = event.attendees?.length || 0;
  const maxAttendees = event.maxAttendees || 0;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAlreadyCommented, setHasAlreadyCommented] = useState(false);
  const { user } = useAuthContext();
  
  const formattedDate = event.date
    ? format(new Date(event.date), "dd/MM/yyyy | HH:mm")
    : "Date non définie";

  const eventDate = new Date(event.date);
  const isEventPassed = eventDate < new Date();

  const evaluations = event.evaluations || [];
  const averageRating = evaluations.length > 0
    ? (evaluations
        .map(evaluation => evaluation.note)
        .reduce((sum, note) => sum + note, 0) / evaluations.length
      ).toFixed(1)
    : null;

  useEffect(() => {
    const checkCommentStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          const hasCommented = parsedUser.commented?.includes(event._id);
          setHasAlreadyCommented(hasCommented);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut de commentaire:", error);
      }
    };

    checkCommentStatus();
  }, [event._id]);

  const handleNavigate = () => {
    navigation.navigate("EventDetails", { eventId: event._id });
  };

  const handleEvaluate = () => {
    if (!hasAlreadyCommented) {
      navigation.navigate('EvaluateEvent', { eventId: event._id });
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleNavigate}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {event.url_api ? (
          <Image
            source={{ uri: event.url_cover }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <ImageBlob imageUrl={event.url_cover} />
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        {averageRating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{averageRating} ★</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
          {maxAttendees > 0 && (
            <View style={styles.attendeesContainer}>
              <Text style={styles.attendeesText}>
                {numberOfAttendees} / {maxAttendees}
              </Text>
              <Users size={16} color="#6B7280" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={1}>{event.address}</Text>
          </View>
        </View>

        {isEventPassed && (
          <View style={styles.evaluationContainer}>
            <TouchableOpacity 
              style={[
                styles.evaluateButton,
                hasAlreadyCommented && styles.disabledButton
              ]}
              onPress={handleEvaluate}
              disabled={hasAlreadyCommented}
            >
              <Text style={styles.evaluateButtonText}>
                {hasAlreadyCommented ? 'Déjà évalué' : 'Évaluer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  imageContainer: {
    aspectRatio: 4/3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F59E0B',
  },
  content: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeesText: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoContainer: {
    marginTop: 8,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  evaluationContainer: {
    marginTop: 16,
  },
  evaluateButton: {
    backgroundColor: '#e53e3e',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  evaluateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EventCardParticipate;
