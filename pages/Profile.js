import React from 'react';
import { View, StyleSheet } from 'react-native';
import UserComments from '../components/UserComments';
import ProfilSection from '../components/ProfilSection';

const Profile = () => {
  return (
    <View style={styles.container}>
      <ProfilSection />
      <UserComments />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default Profile;
