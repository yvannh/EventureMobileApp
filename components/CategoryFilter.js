import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

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

export default function CategoryFilter({ selectedCategory, onSelectCategory, readOnly = false }) {
  const scrollRef = useRef(null);

  const handleSelectAll = () => {
    onSelectCategory(""); // Réinitialiser la sélection
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: direction === "left" ? -200 : 200,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>

      {/* Boutons de défilement */}
      {!readOnly && (
        <View style={styles.scrollButtons}>
          <TouchableOpacity
            onPress={() => scroll("left")}
            style={[styles.scrollButton, styles.leftButton]}
          >
            <Icon name="chevron-left" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => scroll("right")}
            style={[styles.scrollButton, styles.rightButton]}
          >
            <Icon name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Conteneur des catégories */}
      <View style={styles.categoriesContainer}>
        {!readOnly && (
          <TouchableOpacity
            onPress={handleSelectAll}
            style={[
              styles.categoryButton,
              selectedCategory === "" && styles.selectedButton,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === "" && styles.selectedText,
              ]}
            >
              Toutes les catégories
            </Text>
          </TouchableOpacity>
        )}

        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            onPress={() => !readOnly && onSelectCategory(selectedCategory === category.name ? "" : category.name)}
            style={[
              styles.categoryButton,
              selectedCategory === category.name && styles.selectedButton,
              readOnly && styles.readOnlyButton,
            ]}
          >
            <Icon
              name={category.icon}
              size={20}
              color={selectedCategory === category.name ? "#F43F5E" : "#6B7280"}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name && styles.selectedText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "white",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  scrollButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  scrollButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 5,
    elevation: 3,
  },
  leftButton: {
    position: "absolute",
    left: 10,
  },
  rightButton: {
    position: "absolute",
    right: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    gap: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
    textAlign: "center",
  },
  selectedButton: {
    borderColor: "#F43F5E",
    backgroundColor: "#FDE8E8",
  },
  selectedText: {
    color: "#F43F5E",
  },
  readOnlyButton: {
    backgroundColor: "#E5E7EB",
    borderColor: "#E5E7EB",
  },
});
