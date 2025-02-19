import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const WhyChooseUs = () => {
  const benefits = [
    {
      icon: <MaterialIcons name="event" size={40} color="#4299e1" />, // Icône pour "Événements pour tous"
      title: "Événements pour tous",
      description:
        "Découvrez des événements adaptés à vos centres d'intérêt : Musicaux, Sportifs, Culturels et plus encore.",
    },
    {
      icon: <MaterialIcons name="people" size={40} color="#48bb78" />, // Icône pour "Communauté engagée"
      title: "Communauté engagée",
      description:
        "Rejoignez une communauté dynamique où vous pouvez partager vos expériences et interagir avec d'autres participants.",
    },
    {
      icon: <MaterialIcons name="star" size={40} color="#ecc94b" />, // Icône pour "Évaluations authentiques"
      title: "Évaluations authentiques",
      description:
        "Accédez aux avis et commentaires de vrais utilisateurs pour choisir les meilleurs événements.",
    },
    {
      icon: <MaterialIcons name="shield" size={40} color="#9f7aea" />, // Icône pour "Plateforme sécurisée"
      title: "Plateforme sécurisée",
      description:
        "Inscrivez-vous en toute confiance grâce à notre système de sécurité avancé et à la protection de vos données.",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pourquoi choisir notre plateforme ?</Text>
        <Text style={styles.description}>
          Une expérience unique pour organiser, découvrir et participer à des événements qui vous ressemblent.
        </Text>
      </View>

      <View style={styles.benefitsContainer}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconContainer}>{benefit.icon}</View>
            <Text style={styles.cardTitle}>{benefit.title}</Text>
            <Text style={styles.cardDescription}>{benefit.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});

export default WhyChooseUs;
