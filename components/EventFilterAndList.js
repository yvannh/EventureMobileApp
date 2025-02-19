import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useAuthContext } from '../hooks/useAuthContext';
import EventCard from './EventCard';
import Icon from "react-native-vector-icons/Feather";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const categories = [
  { name: "Musique", icon: "music" },
  { name: "Gastronomie", icon: "coffee" },
  { name: "Art", icon: "image" },
  { name: "Jeux", icon: "play" },
  { name: "Sport", icon: "activity" },
  { name: "Culture", icon: "book" },
  { name: "Fêtes", icon: "gift" },
  { name: "Bien-être", icon: "heart" },
  { name: "Autres", icon: "more-horizontal" },
];

const EventListAll = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const { user } = useAuthContext();

  // Récupération des événements
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://10.0.2.2:4000/api/events/all', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await response.json();

        if (response.ok) {
          const currentDate = new Date();
          const futureEvents = data.filter(
            (event) => new Date(event.date) > currentDate
          );
          setEvents(futureEvents);
          setFilteredEvents(futureEvents);
        } else {
          Alert.alert('Erreur', data.error || "Échec de la récupération des événements.");
        }
      } catch (error) {
        Alert.alert('Erreur', "Une erreur s'est produite.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Gestion des filtres
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const filtered = category
      ? events.filter((event) => event.category === category)
      : events;
    
    // Appliquer le tri actuel aux événements filtrés
    const sortedFiltered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredEvents(sortedFiltered);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    const sortedEvents = [...filteredEvents].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setFilteredEvents(sortedEvents);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e53e3e" />
        <Text style={styles.loadingText}>Chargement des événements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bouton de filtrage */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          (selectedCategory || sortOrder !== 'asc') && styles.activeFilterButton
        ]}
        onPress={() => {
          setIsFilterVisible(true);
          setImmediate(() => {});
        }}
      >
        <MaterialIcons name="filter-list" size={20} color="#fff" />
        <Text style={styles.filterButtonText}>
          {selectedCategory || sortOrder !== 'asc' ? "Filtre activé" : "Filtrer"}
        </Text>
      </TouchableOpacity>

      {/* Liste des événements */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <EventCard event={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun événement trouvé.</Text>
        }
        contentContainerStyle={styles.eventList}
        scrollEventThrottle={16}
      />

      {/* Modal pour les filtres */}
      <Modal
        visible={isFilterVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Filtres par catégorie */}
            <Text style={styles.filterSectionTitle}>Catégories</Text>
            <View style={styles.categoriesContainer}>
              <TouchableOpacity
                style={[styles.categoryButton, selectedCategory === '' && styles.selectedButton]}
                onPress={() => handleCategorySelect('')}
              >
                <Icon name="grid" size={20} color={selectedCategory === '' ? "#F43F5E" : "#6B7280"} />
                <Text style={[styles.categoryText, selectedCategory === '' && styles.selectedText]}>
                  Toutes
                </Text>
              </TouchableOpacity>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={[styles.categoryButton, selectedCategory === category.name && styles.selectedButton]}
                  onPress={() => handleCategorySelect(category.name)}
                >
                  <Icon
                    name={category.icon}
                    size={20}
                    color={selectedCategory === category.name ? "#F43F5E" : "#6B7280"}
                  />
                  <Text
                    style={[styles.categoryText, selectedCategory === category.name && styles.selectedText]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtres par date */}
            <Text style={styles.filterSectionTitle}>Trier par date</Text>
            <View style={styles.sortButtons}>
              <TouchableOpacity
                style={[styles.sortButton, sortOrder === 'asc' && styles.selectedButton]}
                onPress={() => handleSortChange('asc')}
              >
                <MaterialIcons
                  name="arrow-upward"
                  size={20}
                  color={sortOrder === 'asc' ? "#F43F5E" : "#6B7280"}
                />
                <Text style={[styles.sortButtonText, sortOrder === 'asc' && styles.selectedText]}>
                  + Récent
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortOrder === 'desc' && styles.selectedButton]}
                onPress={() => handleSortChange('desc')}
              >
                <MaterialIcons
                  name="arrow-downward"
                  size={20}
                  color={sortOrder === 'desc' ? "#F43F5E" : "#6B7280"}
                />
                <Text style={[styles.sortButtonText, sortOrder === 'desc' && styles.selectedText]}>
                  + Ancien
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53e3e',
    padding: 6,
    borderRadius: 8,
    margin: 8,
    width: '40%',
    alignSelf: 'center',
    
  },
  activeFilterButton: {
    backgroundColor: '#4caf50',
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    margin: 4,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    width: '31%',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedButton: {
    borderColor: '#F43F5E',
    backgroundColor: '#FDE8E8',
  },
  selectedText: {
    color: '#F43F5E',
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  eventList: {
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#555',
    fontSize: 16,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    margin: 16,
    elevation: 3,
    width: '90%',
  },
});

export default EventListAll;
