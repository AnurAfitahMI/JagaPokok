import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const CameraScreen = ({ navigation }) => {
  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          const photo = response.assets[0];
          navigation.navigate('PhotoPreviewScreen', {
  photoUri: photo.path || photo.uri,
});

        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snap to Identify</Text>
      <TouchableOpacity style={styles.button} onPress={handlePickImage}>
        <Text style={styles.buttonText}>Choose from Gallery</Text>
      </TouchableOpacity>
      <Text style={styles.note}>📷 (Camera temporarily disabled on emulator)</Text>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C9E4CA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#004B3A',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#39A96B',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  note: {
    marginTop: 20,
    color: '#004B3A',
    fontSize: 14,
  },
});
