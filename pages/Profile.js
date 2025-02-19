import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthContext } from '../hooks/useAuthContext';
import ProfileSection from '../components/ProfilSection';
import UserComments from '../components/UserComments';
import UserEventsComments from '../components/UserEventsComments';

const Profile = () => {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <View style={styles.notConnectedContainer}>
        <Text style={styles.notConnectedText}>
          Vous devez être connecté pour voir votre profil.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ProfileSection />
      <UserComments />
      <UserEventsComments />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  notConnectedText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default Profile;
