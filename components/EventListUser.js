import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import EventCardUser from './EventCardUser';

const EventListUser = () => {
  const { user } = useAuthContext();
  const [futureEvents, setFutureEvents] = useState([]); // Événements à venir
  const [pastEvents, setPastEvents] = useState([]); // Événements passés
  const [filteredEvents, setFilteredEvents] = useState([]); // Filtrés
  const [activeFilter, setActiveFilter] = useState("all"); // Filtre actif
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch('http://10.0.2.2:4000/api/events', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        const currentDate = new Date();

        const future = data.filter((event) => new Date(event.date) > currentDate);
        const past = data.filter((event) => new Date(event.date) <= currentDate);

        setFutureEvents(future);
        setPastEvents(past);
        setFilteredEvents(data); // Par défaut, afficher tous
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Gère le filtrage des événements
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredEvents([...futureEvents, ...pastEvents]); // Combine tous
    } else if (activeFilter === "upcoming") {
      setFilteredEvents(futureEvents);
    } else if (activeFilter === "past") {
      setFilteredEvents(pastEvents);
    }
  }, [activeFilter, futureEvents, pastEvents]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Vous devez être connecté pour voir vos événements.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
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

  if (futureEvents.length === 0 && pastEvents.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Vous n'avez encore aucun événement.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setActiveFilter("all")}
          style={[
            styles.filterButton,
            activeFilter === "all" && styles.activeFilterButton,
          ]}
        >
          <Text style={styles.filterButtonText}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter("upcoming")}
          style={[
            styles.filterButton,
            activeFilter === "upcoming" && styles.activeFilterButton,
          ]}
        >
          <Text style={styles.filterButtonText}>À venir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter("past")}
          style={[
            styles.filterButton,
            activeFilter === "past" && styles.activeFilterButton,
          ]}
        >
          <Text style={styles.filterButtonText}>Passés</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <EventCardUser event={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#718096',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  activeFilterButton: {
    backgroundColor: '#e53e3e',
  },
  filterButtonText: {
    color: '#000',
  },
});

export default EventListUser;
