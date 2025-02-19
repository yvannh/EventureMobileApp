import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

const ImageBlob = ({ imageUrl }) => {
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImageBlob = async () => {
      try {
        setIsLoading(true);
        const response = await RNFetchBlob.fetch('GET', imageUrl);
        const base64Image = `data:image/jpeg;base64,${response.base64()}`;
        setImageData(base64Image);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (imageUrl) {
      fetchImageBlob();
    }
  }, [imageUrl]);

  return (
    <View style={styles.container}>
      {imageData ? (
        <Image
          source={{ uri: imageData }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F43F5E" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ImageBlob;
