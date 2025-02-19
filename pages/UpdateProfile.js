import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const UpdateProfile = () => {
  const { user } = useAuthContext();
  const [newNom, setNewNom] = useState(user?.nom || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://votre-api.com/api/user/update-user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newNom, newEmail }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error);
        Alert.alert('Erreur', json.error);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        user.nom = newNom;
        user.email = newEmail;
        localStorage.setItem('user', JSON.stringify(user)); // Met à jour localStorage
        setIsLoading(false);
        Alert.alert('Succès', 'Profil mis à jour avec succès');
        navigation.navigate('Profile'); // Redirection vers le profil
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil');
      Alert.alert('Erreur', 'Erreur lors de la mise à jour du profil');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier mon profil</Text>

      <View style={styles.form}>
        {/* Champ de saisie : Nom */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nouveau nom</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre nouveau nom"
            value={newNom}
            onChangeText={setNewNom}
            required
          />
        </View>

        {/* Champ de saisie : Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nouvel email</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre nouvel email"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
        </View>

        {/* Bouton Mettre à jour */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Mettre à jour le profil</Text>
          )}
        </TouchableOpacity>

        {/* Affichage des erreurs */}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#e53e3e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#fbb6ce',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default UpdateProfile;
