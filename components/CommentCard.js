import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StarRating = ({ note }) => {
  const stars = Array(5)
    .fill(0)
    .map((_, index) => (
      <Text
        key={index}
        style={{
          color: index < note ? '#fbbf24' : '#d1d5db', // Jaune pour les étoiles actives, gris pour les inactives
          fontSize: 16,
        }}
      >
        ★
      </Text>
    ));
  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

const CommentCard = ({ name, note, comment, eventId, parent }) => {
  const { user, dispatch } = useAuthContext();
  const navigation = useNavigation();

  const showTrashIcon = parent === 'UserComments';

  const handleDeleteComment = async () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer ce commentaire ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: async () => {
            try {
              const storedUser = await AsyncStorage.getItem('user');
              if (!storedUser) {
                throw new Error('Données utilisateur non trouvées');
              }

              const currentUser = JSON.parse(storedUser);

              const eventResponse = await fetch(`http://10.0.2.2:4000/api/events/${eventId}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${currentUser.token}`,
                },
              });

              if (eventResponse.status === 404) {
                await fetch("http://10.0.2.2:4000/api/user/remove-comment", {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentUser.token}`,
                  },
                  body: JSON.stringify({ eventId }),
                });
                Alert.alert("Information", "L'événement a déjà été supprimé. ID retiré de vos commentaires.");
              } else if (eventResponse.ok) {
                const deleteResponse = await fetch(`http://10.0.2.2:4000/api/events/remove-evaluate`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentUser.token}`,
                  },
                  body: JSON.stringify({ eventId }),
                });

                if (!deleteResponse.ok) {
                  const errorData = await deleteResponse.json();
                  throw new Error(errorData.error || "Erreur lors de la suppression.");
                }

                // Mettre à jour user.commented dans le backend
                const userResponse = await fetch("http://10.0.2.2:4000/api/user/remove-comment", {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentUser.token}`,
                  },
                  body: JSON.stringify({ eventId }),
                });

                if (!userResponse.ok) {
                  throw new Error("Erreur lors de la mise à jour des commentaires");
                }

                // Mettre à jour l'AsyncStorage
                const updatedCommented = currentUser.commented.filter(id => id !== eventId);
                const updatedUser = {
                  ...currentUser,
                  commented: updatedCommented
                };

                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                dispatch({ type: 'LOGIN', payload: updatedUser });

                Alert.alert("Succès", "Commentaire supprimé avec succès.");
                navigation.navigate("ParticipatingEvents");
              } else {
                throw new Error("Erreur lors de la vérification de l'événement.");
              }
            } catch (err) {
              Alert.alert("Erreur", `Erreur : ${err.message}`);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.nameText}>{name}</Text>
      <View style={styles.ratingContainer}>
        <StarRating note={note} />
        <Text style={styles.ratingText}>{note} / 5</Text>
      </View>
      <Text style={styles.commentText}>
        {comment || "Pas de commentaire"}
      </Text>

      {showTrashIcon && (
        <TouchableOpacity
          onPress={handleDeleteComment}
          style={styles.deleteButton}
          accessibilityLabel="Supprimer le commentaire"
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    position: "relative",
  },
  nameText: {
    fontWeight: "bold",
    color: "#374151",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 8,
    color: "#6b7280",
  },
  commentText: {
    marginTop: 8,
    color: "#4b5563",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
  },
  deleteIcon: {
    color: '#f43f5e',
    fontSize: 20,
  },
});

export default CommentCard;
