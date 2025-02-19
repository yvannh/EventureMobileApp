import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../hooks/useAuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LogoEventure from '../assets/Logo_Eventure.png';

const { height } = Dimensions.get('window');

const Navbar = () => {
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleProtectedRoute = (path) => {
    if (!user) {
      navigation.navigate('Login');
    } else {
      navigation.navigate(path);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.logoContainer}>
          <Image source={LogoEventure} style={styles.logo} resizeMode="contain" />
          <Text style={styles.logoText}>Eventure</Text>
        </TouchableOpacity>

        {user && (
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>

      {isMenuOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={() => setIsMenuOpen(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsMenuOpen(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleProtectedRoute('Home')} style={styles.menuItem}>
              <Text style={styles.menuText}>Accueil</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleProtectedRoute('CreateEvent')} style={styles.menuItem}>
              <Text style={styles.menuText}>Créer un événement</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleProtectedRoute('ParticipatingEvents')} style={styles.menuItem}>
              <Text style={styles.menuText}>Mes participations</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleProtectedRoute('MyEvents')} style={styles.menuItem}>
              <Text style={styles.menuText}>Mes événements</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleProtectedRoute('Profile')} style={styles.menuItem}>
              <Text style={styles.menuText}>Profil</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53e3e',
    paddingLeft: 5,
  },
  menuButton: {
    padding: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80%',
    height: height,
    backgroundColor: 'white',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Navbar;
