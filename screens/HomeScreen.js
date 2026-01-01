import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userName } = route.params || { userName: 'User' };

  return (
    <View style={styles.container}>
      {/* Floating Plants */}
      <View style={styles.plantWrapper}>
        <Image source={require('../../assets/home/plant1.png')} style={[styles.plant, styles.plant1]} />
        <Image source={require('../../assets/home/plant2.png')} style={[styles.plant, styles.plant2]} />
        <Image source={require('../../assets/home/plant3.png')} style={[styles.plant, styles.plant3]} />
        <Image source={require('../../assets/home/plant4.png')} style={[styles.plant, styles.plant4]} />
        <Image source={require('../../assets/home/plant5.png')} style={[styles.plant, styles.plant5]} />
      </View>

      {/* Greeting */}
      <Text style={styles.welcomeText}>Welcome! Hi {userName}!</Text>
      <Text style={styles.subText}>Ready to care for your plants?</Text>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SearchScreen')}
      >
        <Ionicons name="search-outline" size={22} color="#1B4332" style={styles.icon} />
        <Text style={styles.buttonText}>Search by name</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Camera')}
      >
        <Ionicons name="camera-outline" size={22} color="#1B4332" style={styles.icon} />
        <Text style={styles.buttonText}>Snap to identify</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MyPokokScreen')}
      >
        <Ionicons name="leaf-outline" size={22} color="#1B4332" style={styles.icon} />
        <Text style={styles.buttonText}>MyPokok</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C9E4CA',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },

  // 🌿 Floating plant layout
  plantWrapper: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 100,
  },

  plant: {
    position: 'absolute',
    borderRadius: 200,
    resizeMode: 'cover',
  },
  plant1: { //top left
    top: -60,
    left: -125,
    width: 400,
    height: 400,
  },
  plant2: { //top right
    top: -80,
    right: -80,
    width: 300,
    height: 300,
  },
  plant3: { //center
    top: 60,
    right: -5,
    width: 350,
    height: 350,
  },
  plant4: { //bottom left
    top: 420,
    right: 150,
    width: 500,
    height: 500,
    opacity: 0.3,
  },
  plant5: { //bottom right
    top: 280,
    left: 60,
    width: 600,
    height: 600,
    opacity: 0.3,
  },

  // 🌼 Greeting text
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1B4332',
    textAlign: 'center',
  },
  subText: {
    fontSize: 18,
    color: '#2D6A4F',
    marginBottom: 20,
    textAlign: 'center',
  },

  // 🌿 Buttons
  button: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '60%',
    alignItems: 'center',
    marginVertical: 8,
    elevation: 3, // soft shadow
  },
  icon: {
    marginRight: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B4332',
  },
});
