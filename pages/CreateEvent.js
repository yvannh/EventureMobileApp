import React from 'react';
import { View, Text } from 'react-native';
import EventForm from '../components/EventForm';
import { useAuthContext } from "../hooks/useAuthContext";

const CreateEvent = () => {
  const { user } = useAuthContext();

  return (
    <View style={{ padding: 16, maxWidth: 800, alignSelf: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Créer un événement
      </Text>
      <EventForm user={user} />
    </View>
  );
};

export default CreateEvent;
