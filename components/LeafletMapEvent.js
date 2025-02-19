import React from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View } from "react-native";

const LeafletMapEvent = ({ event }) => {
  const position = event.coordinates || { latitude: 48.8566, longitude: 2.3522 }; // Par défaut Paris

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={position}
          title={event.title}
          description={event.address}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default LeafletMapEvent;
