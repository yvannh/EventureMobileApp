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
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEventsContext } from '../hooks/useEventsContext';
import { launchImageLibrary } from 'react-native-image-picker';
import AddressAutofill from "./AddressAutofill";
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/Feather";
import { Picker } from '@react-native-picker/picker';

const EventForm = ({ initialData = null, user, readOnly = false, customButtons = null, isRemake = false }) => {
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if (initialData) {
      const formattedDate = formatDate(initialData.date);
      const formattedTime = formatTime(initialData.date);
      setFormData({ 
        ...initialData, 
        date: formattedDate,
        time: formattedTime,
        maxAttendees: String(initialData.maxAttendees)
      });
      setDate(new Date(initialData.date));
      setTime(new Date(initialData.date));
      setImageUri(initialData.url_cover);
    }
  }, [initialData]);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setFormData({ ...formData, date: formatDate(currentDate) });
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
    setFormData({ ...formData, time: formatTime(currentTime) });
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

  const formatDateForSubmission = (dateString, timeString) => {
    const [day, month, year] = dateString.split('/');
    const [hours, minutes] = timeString.split(':');

    const formattedDate = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    ));

    return formattedDate.toISOString();
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

    let uploadedImageUrl = imageUri || '';
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

    const event = {
      ...formData,
      maxAttendees: attendees,
      url_cover: uploadedImageUrl,
      date: formatDateForSubmission(formData.date, formData.time),
    };

    try {
      const method = isRemake ? 'POST' : (initialData ? 'PATCH' : 'POST');
      const url = isRemake 
        ? 'http://10.0.2.2:4000/api/events'
        : (initialData ? `http://10.0.2.2:4000/api/events/${initialData._id}` : 'http://10.0.2.2:4000/api/events');

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
        const actionType = isRemake ? 'CREATE_EVENT' : (initialData ? 'UPDATE_EVENT' : 'CREATE_EVENT');
        dispatch({ type: actionType, payload: json });
        const message = isRemake ? 'Événement recréé avec succès.' : (initialData ? 'Événement modifié avec succès.' : 'Événement créé avec succès.');
        Alert.alert('Succès', message);
        navigation.navigate('MyEvents');
      }
    } catch (err) {
      setError('Une erreur est survenue.');
      console.error('Erreur lors de la soumission :', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre de l'événement</Text>
            <TextInput
              style={[styles.input, readOnly && styles.readOnlyInput]}
              value={formData.title}
              onChangeText={(text) => handleChange('title', text)}
              editable={!readOnly}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea, readOnly && styles.readOnlyInput]}
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              multiline
              editable={!readOnly}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => !readOnly && handleCategorySelect(category.name)}
                  style={[
                    styles.categoryButton,
                    formData.category === category.name && styles.categoryButtonSelected,
                    readOnly && styles.categoryButtonReadOnly
                  ]}
                  disabled={readOnly}
                >
                  <Icon 
                    name={category.icon} 
                    size={20} 
                    color={formData.category === category.name ? "#F43F5E" : "#6B7280"} 
                  />
                  <Text style={[
                    styles.categoryText,
                    formData.category === category.name && styles.categoryTextSelected,
                    readOnly && styles.categoryTextReadOnly
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.label}>Date (JJ/MM/AAAA)</Text>
              {readOnly ? (
                <Text style={[styles.input, readOnly && styles.readOnlyInput]}>{formData.date}</Text>
              ) : (
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                  <Text>{formData.date || 'Sélectionner une date'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {!readOnly && showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.timeContainer}>
              <Text style={styles.label}>Heure (HH:MM)</Text>
              {readOnly ? (
                <Text style={[styles.input, readOnly && styles.readOnlyInput]}>{formData.time}</Text>
              ) : (
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
                  <Text>{formData.time || 'Sélectionner une heure'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {!readOnly && showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                is24Hour={true}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
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
              readOnly={readOnly}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre maximum de participants</Text>
            <TextInput
              style={[styles.input, readOnly && styles.readOnlyInput]}
              value={formData.maxAttendees}
              onChangeText={(text) => handleChange('maxAttendees', text)}
              keyboardType="numeric"
              editable={!readOnly}
            />
          </View>

          <Text style={styles.label}>Image de l'événement</Text>
          <View style={styles.imageContainer}>
            {imageUri ? (
              <View>
                <Image source={{ uri: imageUri }} style={styles.image} />
                {!readOnly && (
                  <TouchableOpacity onPress={handleImageRemove} style={styles.removeImageButton}>
                    <Text style={styles.removeImageText}>Supprimer l'image</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              !readOnly && (
                <TouchableOpacity onPress={handleImageSelect} style={styles.imagePicker}>
                  <Text style={[styles.imagePlaceholder, readOnly && styles.readOnlyInput]}>Appuyez pour sélectionner une image</Text>
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Afficher les boutons personnalisés si fournis (cas de suppression) */}
          {customButtons && (
            <View style={styles.buttonContainer}>
              {customButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'deleteButton' ? styles.submitButton : styles.cancelButton
                  ]}
                  onPress={button.onPress}
                >
                  <Text style={button.style === 'deleteButton' ? styles.buttonText : styles.cancelButtonText}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Afficher les boutons standard si pas de boutons personnalisés et pas en lecture seule */}
          {!customButtons && !readOnly && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isRemake ? 'Recréer' : (initialData ? 'Modifier' : 'Créer')}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53e3e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 24,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#555',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    color: '#555',
    height: 80,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  loadingText: {
    color: '#555',
    fontSize: 16,
    marginTop: 8,
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
  categoryButtonSelected: {
    borderColor: "#F43F5E",
    backgroundColor: "#FDE8E8",
  },
  categoryButtonReadOnly: {
    opacity: 0.7,
    backgroundColor: '#f0f0f0',
  },
  categoryText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
    textAlign: "center",
  },
  categoryTextSelected: {
    color: "#F43F5E",
  },
  categoryTextReadOnly: {
    color: '#888',
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imagePlaceholder: {
    color: '#555',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#e53e3e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#f5a5a5',
  },
  formContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#e53e3e',
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
});

export default EventForm;
