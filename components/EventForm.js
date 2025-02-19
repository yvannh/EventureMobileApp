import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEventsContext } from '../hooks/useEventsContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import AddressAutofill from "./AddressAutofill";

const EventForm = ({ initialData = null, user }) => {
  const { dispatch } = useEventsContext();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    postalCode: '',
    city: '',
    maxAttendees: '',
    category: '',
    date: '',
    time: '',
    url_cover: '',
  });

  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const categories = [
    { name: 'Musique', icon: 'music-note' },
    { name: 'Gastronomie', icon: 'restaurant' },
    { name: 'Art', icon: 'palette' },
    { name: 'Jeux', icon: 'sports-esports' },
    { name: 'Sport', icon: 'directions-bike' },
    { name: 'Culture', icon: 'book' },
    { name: 'Fêtes', icon: 'celebration' },
    { name: 'Bien-être', icon: 'fitness-center' },
    { name: 'Autres', icon: 'more-horiz' },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (initialData) {
      const formattedDate = formatDate(initialData.date);
      const time = `${new Date(initialData.date).getHours()}:${new Date(initialData.date).getMinutes()}`;
      setFormData({ ...initialData, date: formattedDate, time, maxAttendees: initialData.maxAttendees || '' });
      setImageUri(initialData.url_cover);
      
    }
  }, [initialData]);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleDateChange = (value) => {
    const formattedValue = value.replace(/[^0-9/]/g, '');
    if (formattedValue.length === 2 || formattedValue.length === 5) {
      setFormData({ ...formData, date: formattedValue + '/' });
    } else {
      setFormData({ ...formData, date: formattedValue });
    }
  };

  const handleTimeChange = (value) => {
    const formattedValue = value.replace(/[^0-9:]/g, '');
    if (formattedValue.length === 2) {
      setFormData({ ...formData, time: formattedValue + ':' });
    } else {
      setFormData({ ...formData, time: formattedValue });
    }
  };

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category });
  };

  const handleImageSelect = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('L\'utilisateur a annulé la sélection d\'image');
      } else if (response.error) {
        console.log('Erreur de sélection d\'image : ', response.error);
      } else {
        setImageUri(response.assets[0].uri);
        setImageFile(response.assets[0]);
      }
    });
  };

  const handleImageRemove = () => {
    setImageUri(null);
    setImageFile(null);
  };

  const handleCancel = () => {
    navigation.navigate('MyEvents');
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour créer un événement.');
      return;
    }

    const requiredFields = [
      'title',
      'description',
      'address',
      'postalCode',
      'city',
      'category',
      'date',
      'time',
      'maxAttendees',
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setError('Tous les champs ne sont pas renseignés.');
      setEmptyFields(missingFields);
      return;
    }

    const attendees = Number(formData.maxAttendees);
    if (formData.maxAttendees && isNaN(attendees)) {
      Alert.alert('Erreur', 'Le nombre maximum de participants doit être un nombre valide.');
      return;
    }

    setIsLoading(true);

    let uploadedImageUrl = '';
    if (imageFile) {
      const formDataImage = new FormData();
      
      formDataImage.append('file', {
        uri: imageFile.uri,
        type: 'image/jpeg',
        name: imageFile.fileName || 'image.jpg',
      });

      try {
        const uploadResponse = await fetch('http://10.0.2.2:4000/api/cloudinary/upload?plateform=android', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          body: formDataImage,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Erreur upload:', errorText);
          throw new Error(errorText);
        }

        const uploadData = await uploadResponse.json();
        uploadedImageUrl = uploadData.url;
      } catch (err) {
        console.error('Erreur lors de l\'upload de l\'image:', err);
        setError('Erreur lors de l\'upload de l\'image');
        setIsLoading(false);
        return;
      }
    }

    const event = { ...formData, maxAttendees: attendees, url_cover: uploadedImageUrl };

    try {
      const method = initialData ? 'PATCH' : 'POST';
      const url = initialData
        ? `http://10.0.2.2:4000/api/events/${initialData._id}`
        : 'http://10.0.2.2:4000/api/events';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(event),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || 'Une erreur est survenue.');
      } else {
        dispatch({ type: initialData ? 'UPDATE_EVENT' : 'CREATE_EVENT', payload: json });
        Alert.alert('Succès', initialData ? 'Événement modifié avec succès.' : 'Événement créé avec succès.');
        navigation.navigate('MyEvents');
      }
    } catch (err) {
      setError('Une erreur est survenue.');
      console.error('Erreur lors de la soumission :', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxAttendeesChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, maxAttendees: numericValue });
  };

  return (
    <FlatList
      data={[{}]}
      keyExtractor={(item, index) => index.toString()}
      renderItem={() => (
        <View style={styles.container}>
          <Text style={styles.label}>Titre de l'événement</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            multiline
          />

          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.categories}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[styles.categoryButton, formData.category === cat.name && styles.categoryButtonSelected]}
                onPress={() => handleCategorySelect(cat.name)}
              >
                <MaterialIcons
                  name={cat.icon}
                  size={24}
                  color={formData.category === cat.name ? '#e53e3e' : '#555'}
                />
                <Text style={[styles.categoryText, formData.category === cat.name && styles.categoryTextSelected]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.label}>Date (JJ/MM/AAAA)</Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={handleDateChange}
                placeholder="JJ/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.timeContainer}>
              <Text style={styles.label}>Heure (HH:MM)</Text>
              <TextInput
                style={styles.input}
                value={formData.time}
                onChangeText={handleTimeChange}
                placeholder="HH:MM"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          <Text style={styles.label}>Lieu</Text>
          <AddressAutofill
            onAddressSelect={(selectedAddress) => {
              setFormData({
                ...formData,
                address: selectedAddress.name,
                postalCode: selectedAddress.postcode,
                city: selectedAddress.city,
              });
            }}
            initialAddress={formData.address}
            initialCity={formData.city}
            initialPostcode={formData.postalCode}
          />

          <Text style={styles.label}>Nombre maximum de participants</Text>
          <TextInput
            style={styles.input}
            value={formData.maxAttendees}
            onChangeText={handleMaxAttendeesChange}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Sélectionner une image</Text>
          <TouchableOpacity onPress={handleImageSelect} style={styles.imagePicker}>
            {imageUri ? (
              <View>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity onPress={handleImageRemove} style={styles.removeImageButton}>
                  <Text style={styles.removeImageText}>Supprimer l'image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.imagePlaceholder}>Appuyez pour sélectionner une image</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    color: '#333',
    marginBottom: 16,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
  },
  categoryButtonSelected: {
    borderColor: '#e53e3e',
    backgroundColor: '#ffe5e5',
  },
  categoryText: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
  categoryTextSelected: {
    color: '#e53e3e',
  },
  button: {
    backgroundColor: '#e53e3e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#f5a5a5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#e53e3e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imagePlaceholder: {
    color: '#888',
  },
  removeImageButton: {
    marginTop: 8,
    alignItems: 'center',
  },
  removeImageText: {
    color: '#e53e3e',
    fontSize: 14,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    flex: 1,
  },
});

export default EventForm;
