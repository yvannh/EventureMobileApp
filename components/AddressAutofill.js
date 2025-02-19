import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const AddressAutofill = ({ onAddressSelect, initialAddress, initialCity, initialPostcode }) => {
  const [query, setQuery] = useState(initialAddress || '');
  const [city, setCity] = useState(initialCity || '');
  const [postcode, setPostcode] = useState(initialPostcode || '');
  const [suggestions, setSuggestions] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    // Mettre à jour les champs si les props initiales changent
    setQuery(initialAddress || '');
    setCity(initialCity || '');
    setPostcode(initialPostcode || '');
  }, [initialAddress, initialCity, initialPostcode]);

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Afficher les suggestions uniquement si l'utilisateur a saisi quelque chose
    if (query.length > 2 && !initialAddress) {
      const timeout = setTimeout(() => {
        fetchSuggestions(query);
      }, 1000);

      setDebounceTimeout(timeout);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [query]);

  const fetchSuggestions = async (searchQuery) => {
    try {
      const response = await fetch(`http://10.0.2.2:4000/api/address/upload?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        const validSuggestions = data.filter(item => item.label !== undefined);
        setSuggestions(validSuggestions);
      } else {
        console.error("Erreur lors de la récupération des suggestions :", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions :", error);
    }
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    setCity(suggestion.city);
    setPostcode(suggestion.postcode);
    setSuggestions([]);
    onAddressSelect({
      name: suggestion.name,
      postcode: suggestion.postcode,
      city: suggestion.city,
    });
  };

  // Filtrer les suggestions pour éviter les doublons, mais garder la suggestion sélectionnée
  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.name.toLowerCase() !== query.toLowerCase() || suggestion.name.toLowerCase() === query.toLowerCase()
  );

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Saisissez votre adresse"
        value={query}
        onChangeText={setQuery}
      />
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <TextInput
            style={styles.input}
            placeholder="Code postal"
            value={postcode}
            editable={false}
          />
        </View>
        <View style={styles.halfWidth}>
          <TextInput
            style={styles.input}
            placeholder="Ville"
            value={city}
            editable={false}
          />
        </View>
      </View>
      {filteredSuggestions.length > 0 && (
        <FlatList
          data={filteredSuggestions}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.suggestionItem} 
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.suggestion}>{item.label}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    color: '#333',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  suggestionsList: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  suggestion: {
    color: '#333',
  },
});

export default AddressAutofill;
