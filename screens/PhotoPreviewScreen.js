import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const PhotoPreviewScreen = ({ route, navigation }) => {
  const { photoUri } = route.params || {};
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock identified plant data (replace with real model later)
  const mockPlantData = {
    name: 'Snake Plant',
    scientificName: 'Dracaena trifasciata',
    family: 'Asparagaceae',
    image: require('../../assets/plants/snake_plant.jpeg'),
    features: [
      { label: 'Toxic to ingest', icon: 'warning-outline' },
      { label: "I’m easy", icon: 'leaf-outline' },
      { label: '3 years', icon: 'time-outline' },
      { label: 'Low water', icon: 'water-outline' },
      { label: 'Every 6 month', icon: 'repeat-outline' },
      { label: 'Up to 18” H', icon: 'sunny-outline' },
    ],
    benefits: [
      'Excellent air purifier that cleanses indoor air from toxins',
      'Lucky plant in Feng Shui',
      'One of the best easy-care houseplants',
      'Tolerates low light',
      'Beautiful variegated leaves with a yellow stripe',
    ],
    companions: [
      require('../../assets/plants/peace_lily.jpeg'),
      require('../../assets/plants/money_tree.jpeg'),
      require('../../assets/plants/zzplant.jpeg'),
    ],
  };

  // Handle missing photo case
  if (!photoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No photo found.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Simulate AI recognition delay
  const handleUsePhoto = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('PlantDetailsScreen', { plant: mockPlantData });
    }, 2500);
  };

  return (
    <View style={styles.container}>
      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Identifying your plant...</Text>
        </View>
      ) : (
        <>
          {/* Photo Preview */}
          <Image
            source={{ uri: photoUri }}
            style={styles.previewImage}
            resizeMode="contain"
          />

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            {/* Retake */}
            <TouchableOpacity
              style={[styles.button, { borderColor: '#E57373' }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.buttonText, { color: '#E57373' }]}>
                Retake
              </Text>
            </TouchableOpacity>

            {/* Use Photo */}
            <TouchableOpacity
              style={[styles.button, { borderColor: '#4CAF50' }]}
              onPress={handleUsePhoto}
            >
              <Text style={[styles.buttonText, { color: '#4CAF50' }]}>
                Use Photo
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default PhotoPreviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    bottom: 50,
  },
  button: {
    borderWidth: 2,
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#39A96B',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
});
