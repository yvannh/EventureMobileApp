import React, { useEffect, useState, useRef } from "react";
import EventCard from "./EventCard";
import { useAuthContext } from "../hooks/useAuthContext";
import Icon from "react-native-vector-icons/Feather";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";

const RelatedEvents = ({ category, eventId }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  const eventsContainerRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!category) return;

      try {
        const response = await fetch(`/api/events/all`, {
          method: "GET",
          headers: {
            ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
          },
        });

        const data = await response.json();

        if (response.ok) {
          const filteredEvents = data.filter(
            (event) =>
              event.category === category &&
              event._id !== eventId &&
              new Date(event.date) > new Date()
          );

          const shuffledEvents = filteredEvents.sort(() => 0.5 - Math.random());
          setEvents(shuffledEvents.slice(0, 10));
        } else {
          setError("Erreur lors de la récupération des événements.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [category, eventId, user?.token]);

  const handleScroll = (direction) => {
    if (eventsContainerRef.current) {
      const scrollAmount = direction === "right" ? 300 : -300;
      eventsContainerRef.current.scrollTo({
        x: eventsContainerRef.current.scrollX + scrollAmount,
        animated: true,
      });
    }
  };

  if (isLoading) {
    return <Text style={{ textAlign: "center", color: "#3b82f6" }}>Chargement des événements...</Text>;
  }

  if (error) {
    return <Text style={{ textAlign: "center", color: "#ef4444" }}>Erreur : {error}</Text>;
  }

  if (events.length === 0) {
    return <Text style={{ textAlign: "center", color: "#6b7280" }}>Aucun événement trouvé dans cette catégorie.</Text>;
  }

  return (
    <View style={{ marginTop: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Événements similaires</Text>
        {events.length > 4 && (
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => handleScroll("left")}
              style={{
                padding: 5,
                borderWidth: 2,
                borderRadius: 5,
                borderColor: "#f43f5e",
                backgroundColor: "#fff",
              }}
            >
              <Icon name="chevron-left" size={30} color="#f43f5e" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleScroll("right")}
              style={{
                padding: 5,
                borderWidth: 2,
                borderRadius: 5,
                borderColor: "#f43f5e",
                backgroundColor: "#fff",
              }}
            >
              <Icon name="chevron-right" size={30} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={eventsContainerRef}
        contentContainerStyle={{ gap: 10 }}
      >
        {events.map((event) => (
          <View key={event._id} style={{ width: 200 }}>
            <EventCard event={event} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default RelatedEvents;
