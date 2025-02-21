import React from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import EventListUser from '../components/EventListUser';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MyEvents = () => {
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefreshKey(prev => prev + 1);
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Veuillez vous connecter pour voir vos événements.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={20} color="gray" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes Événements</Text>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('CreateEvent')}
        style={styles.createButton}
      >
        <MaterialIcons name="add-circle" size={20} color="white" />
        <Text style={styles.buttonText}>Créer un événement</Text>
      </TouchableOpacity>

      <EventListUser key={refreshKey} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53e3e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#718096',
  },
});

export default MyEvents;
