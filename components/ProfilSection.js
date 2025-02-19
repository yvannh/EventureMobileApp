import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ProfileSection = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const navigation = useNavigation();

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noProfileText}>
          Vous devez être connecté pour voir votre profil.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mon Profil</Text>

      {/* Profil utilisateur */}
      <View style={styles.profileSection}>
        <MaterialIcons name="person" size={48} color="#e53e3e" />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.nom}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
      </View>

      {/* Boutons Participations et Événements */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate('ParticipatingEvents')}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons name="groups" size={20} color="#e53e3e" />
            <Text style={styles.buttonText}>Participations</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate('MyEvents')}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons name="event" size={20} color="#e53e3e" />
            <Text style={styles.buttonText}>Événements</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Boutons Modifier mon profil et Déconnexion */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('UpdateProfile')}
        >
          <Text style={styles.primaryButtonText}>Modifier mon profil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleLogout}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons name="logout" size={20} color="#fff" />
            <Text style={styles.secondaryButtonText}>Déconnexion</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 16,
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e53e3e',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#e53e3e',
    marginLeft: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#555',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noProfileText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileSection;
