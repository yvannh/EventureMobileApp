import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

const EventCardUser = ({ event }) => {
  const navigation = useNavigation();

  const handleNavigate = () => {
    navigation.navigate('EventDetails', { 
      eventId: event._id,
      refresh: Date.now()
    });
  };

  const handleEditNavigate = (e) => {
    e.stopPropagation();
    navigation.navigate('UpdateEventPage', { eventId: event._id });
  };

  const handleRemakeNavigate = (e) => {
    e.stopPropagation();
    navigation.navigate('RemakeEventPage', { eventId: event._id });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    navigation.navigate('DeleteEventPage', { eventId: event._id });
  };

  const formattedDate = event.date
    ? format(new Date(event.date), "dd/MM/yyyy | HH:mm")
    : "Date non définie";

  const numberOfAttendees = event.attendees ? event.attendees.length : 0;
  const maxAttendees = event.maxAttendees || 0;
  const isEventPassed = event.date ? new Date(event.date) < new Date() : false;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleNavigate}
    >
      {/* Tag "passé" visible seulement si l'événement est passé */}
      {isEventPassed && (
        <View style={styles.pastTag}>
          <Text style={styles.pastTagText}>Passé</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.actions}>
            {/* Bouton d'édition conditionnel */}
            {!isEventPassed && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEditNavigate}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#3b82f6" />
              </TouchableOpacity>
            )}

            {isEventPassed && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRemakeNavigate}
              >
                <MaterialCommunityIcons name="restart" size={20} color="#10b981" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {maxAttendees > 0 && (
          <View style={styles.attendees}>
            <Text style={styles.attendeesText}>
              {numberOfAttendees} / {maxAttendees}
            </Text>
            <MaterialCommunityIcons name="account-group" size={16} color="#6b7280" />
          </View>
        )}

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {event.address}, {event.city}, {event.postalCode}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pastTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pastTagText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  attendees: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendeesText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  details: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
});

export default EventCardUser;
