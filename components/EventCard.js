import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";

const EventCard = ({ event }) => {
  const navigation = useNavigation();
  const numberOfAttendees = event.attendees ? event.attendees.length : 0;
  const maxAttendees = event.maxAttendees || 0;
  const formattedDate = event.date
    ? format(new Date(event.date), "dd/MM/yyyy | HH:mm")
    : "Date non définie";

  const evaluations = event.evaluations || [];
  const averageRating =
    evaluations.length > 0
      ? (
          evaluations.reduce((sum, evaluation) => sum + evaluation.note, 0) /
          evaluations.length
        ).toFixed(1)
      : null;

  const handleNavigate = () => {
    navigation.navigate("EventDetails", { eventId: event._id });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleNavigate}>
      <View style={styles.imageContainer}>
        {event.url_api ? (
          <Image source={{ uri: event.url_cover }} style={styles.image} />
        ) : (
          <Image source={{ uri: event.url_cover }} style={styles.image} />
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        {averageRating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {averageRating} <Icon name="star" size={12} color="#FBBF24" />
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          {maxAttendees > 0 && (
            <View style={styles.attendees}>
              <Text style={styles.attendeesText}>
                {numberOfAttendees} / {maxAttendees}
              </Text>
              <Icon name="users" size={14} color="#6B7280" />
            </View>
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={14} color="#6B7280" />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="map-pin" size={14} color="#6B7280" />
            <Text style={styles.detailText} numberOfLines={1}>
              {event.address}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8,
  },
  imageContainer: {
    position: "relative",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#F43F5E",
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FBBF24",
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  attendees: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeesText: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 4,
  },
  details: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
});

export default EventCard;
