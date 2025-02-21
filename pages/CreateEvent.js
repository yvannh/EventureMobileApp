import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EventForm from '../components/EventForm';
import { useAuthContext } from "../hooks/useAuthContext";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CreateEvent = () => {
  const { user } = useAuthContext();
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Redirection si non authentifié
  if (!user) {
    navigation.replace('Login');
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={20} color="gray" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Créer un événement</Text>
      </View>
      <View style={styles.eventFormContainer}>
        <EventForm user={user} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
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
    color: '#2d3748',
  },
  eventFormContainer: {
    flex: 1,
    maxWidth: 600,
    width: '90%',
    alignSelf: 'center',
    paddingBottom: 20,
  },
});

export default CreateEvent;
