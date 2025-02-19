import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLogin } from '../hooks/useLogin';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useLogin();
  const navigation = useNavigation();

  const handleSubmit = async () => {
    await login(email, password);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Se connecter</Text>

        {/* Adresse email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adresse email</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}
          />
        </View>

        {/* Mot de passe */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Bouton Se connecter */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        {/* Affichage des erreurs */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Lien pour s'inscrire */}
        <Text style={styles.footerText}>
          Pas encore de compte ?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Signup')}
          >
            Créer un compte
          </Text>
        </Text>
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
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
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
    marginTop: 10,
    textAlign: 'center',
  },
  footerText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
  link: {
    color: '#e53e3e',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default Login;
