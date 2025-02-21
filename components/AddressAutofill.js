import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AddressAutofill = ({ onAddressSelect, initialAddress, initialCity, initialPostcode, readOnly = false }) => {
  const [query, setQuery] = useState(initialAddress || '');
  const [city, setCity] = useState(initialCity || '');
  const [postcode, setPostcode] = useState(initialPostcode || '');
  const [suggestions, setSuggestions] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

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

    if (query.length > 2 && query.toLowerCase() !== initialAddress.toLowerCase()) {
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
    setShowSuggestions(false);
    onAddressSelect({
      name: suggestion.name,
      postcode: suggestion.postcode,
      city: suggestion.city,
    });
  };

  const handleBlur = () => {
    setTimeout(() => {
      onAddressSelect({
        name: query,
        postcode: postcode,
        city: city,
      });
    }, 200);
  };

  const handleCloseSuggestions = () => {
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleCityChange = (value) => {
    setCity(value);
    onAddressSelect({
      name: query,
      postcode: postcode,
      city: value,
    });
  };

  const handlePostcodeChange = (value) => {
    // Permet uniquement les chiffres
    const numericValue = value.replace(/[^0-9]/g, '');
    setPostcode(numericValue);
    onAddressSelect({
      name: query,
      postcode: numericValue,
      city: city,
    });
  };

  return (
    <View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, readOnly && styles.readOnlyInput]}
          placeholder="Saisissez votre adresse"
          value={query}
          onChangeText={setQuery}
          onBlur={handleBlur}
          onFocus={handleFocus}
          editable={!readOnly}
        />
        {suggestions.length > 0 && showSuggestions && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseSuggestions}
          >
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <TextInput
            style={[styles.input, readOnly && styles.readOnlyInput]}
            placeholder="Code postal"
            value={postcode}
            onChangeText={handlePostcodeChange}
            keyboardType="numeric"
            maxLength={5} // Limite à 5 chiffres pour les codes postaux français
            editable={!readOnly}
          />
        </View>
        <View style={styles.halfWidth}>
          <TextInput
            style={[styles.input, readOnly && styles.readOnlyInput]}
            placeholder="Ville"
            value={city}
            onChangeText={handleCityChange}
            editable={!readOnly}
          />
        </View>
      </View>

      {!readOnly && suggestions.length > 0 && showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>Suggestions</Text>
            <TouchableOpacity 
              style={styles.hideButton}
              onPress={handleCloseSuggestions}
            >
              <Text style={styles.hideButtonText}>Masquer les suggestions</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={suggestions}
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
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    color: '#333',
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  hideButton: {
    padding: 4,
  },
  hideButtonText: {
    color: '#e53e3e',
    fontSize: 12,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  suggestion: {
    color: '#333',
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
  },
});

export default AddressAutofill;
