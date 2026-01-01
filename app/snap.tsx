import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BackButton from '../components/BackButton';
import { Colors } from '../constants/Colors';

export default function SnapScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const [identifying, setIdentifying] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.'
      );
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Gallery permission is required to select photos.'
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const identifyPlant = () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please take a photo or choose from gallery first.');
      return;
    }

    setIdentifying(true);
    
    setTimeout(() => {
      setIdentifying(false);
      
      Alert.alert(
        'Plant Identified!',
        'This looks like a Snake Plant!',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'View Details', 
            onPress: () => router.push('/plant-detail?id=snakePlant')
          }
        ]
      );
    }, 2000);
  };

  const retakePhoto = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Snap to Identify</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Camera Preview or Instructions */}
      <View style={styles.previewContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.instructionsContainer}>
            <MaterialCommunityIcons name="camera" size={80} color={Colors.primary} />
            <Text style={styles.instructionsTitle}>
              Take a Photo or Choose from Gallery
            </Text>
            <Text style={styles.instructionsText}>
              Point your camera at a plant leaf or choose a photo from your gallery to identify it
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        {selectedImage ? (
          <>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={retakePhoto}
            >
              <MaterialCommunityIcons name="camera-retake" size={24} color={Colors.text} />
              <Text style={styles.actionButtonText}>Retake Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={identifyPlant}
              disabled={identifying}
            >
              <MaterialCommunityIcons name="magnify" size={24} color={Colors.white} />
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                {identifying ? 'Identifying...' : 'Identify Plant'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={pickFromGallery}
            >
              <MaterialCommunityIcons name="image" size={24} color={Colors.text} />
              <Text style={styles.actionButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={takePhoto}
            >
              <MaterialCommunityIcons name="camera" size={24} color={Colors.white} />
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Take Photo
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Note */}
      <View style={styles.noteContainer}>
        <MaterialCommunityIcons name="lightbulb-on" size={16} color={Colors.textSecondary} />
        <Text style={styles.note}>
          Make sure the plant is well-lit and in focus for best results
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  previewContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  primaryButtonText: {
    color: Colors.white,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 8,
  },
  note: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
});