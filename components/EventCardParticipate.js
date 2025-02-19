import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Calendar, MapPin, Users, Star, CheckCircle } from "lucide-react-native";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "../hooks/useAuthContext";
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
    const checkIfCommented = async () => {
      try {
        const commentedResponse = await fetch("/api/user/commented", {
          method: "GET",
          headers: {
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });

        const commentedData = await commentedResponse.json();

        if (commentedResponse.ok) {
          const hasCommented = commentedData.commented?.some(
            (eventId) => eventId === event._id
          );
          setHasAlreadyCommented(hasCommented);
        } else {
          setError(commentedData.error || "Échec de la récupération des participations.");
        }
      } catch (err) {
        setError(err.message || "Une erreur s'est produite lors de la récupération des données.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkIfCommented();
    }
  }, [user, event._id]);

  const handleNavigate = () => {
    navigation.navigate("EventDetails", { eventId: event._id });
  };

  const handleEvaluateNavigate = () => {
    navigation.navigate("EvaluateEvent", { eventId: event._id });
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
            {!hasAlreadyCommented ? (
              <TouchableOpacity
                style={styles.evaluateButton}
                onPress={handleEvaluateNavigate}
              >
                <Star size={20} color="#FFFFFF" />
                <Text style={styles.evaluateButtonText}>Evaluer</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.evaluatedBadge}>
                <CheckCircle size={20} color="#F43F5E" />
                <Text style={styles.evaluatedText}>évalué</Text>
              </View>
            )}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F43F5E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 8,
  },
  evaluateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  evaluatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F43F5E',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 8,
    alignSelf: 'flex-start',
  },
  evaluatedText: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EventCardParticipate;
