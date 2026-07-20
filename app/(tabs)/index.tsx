import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { auth, db } from '../../services/firebase';

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsername();
  }, []);

  const fetchUsername = async () => {
    try {
      // FIRST: Try to get username from AsyncStorage (from login)
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) {
        setUsername(storedName);
        setLoading(false);
        return;
      }
      // SECOND: Try to get from Firebase using device-based user ID
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      const userDoc = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUsername(userData.name || 'User');
        setLoading(false);
        return;
      }
    }
      // THIRD: Fallback to Firebase auth (for backward compatibility)
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDoc);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUsername(userData.name || 'User');
        }
      }
    } catch (error) {
      console.error('Error fetching username:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Plants - No circular frames */}
      <Image 
        source={require('../../assets/images/plant1.png')} 
        style={styles.plant1}
        resizeMode="contain"
      />
      <Image 
        source={require('../../assets/images/plant2.png')} 
        style={styles.plant2}
        resizeMode="contain"
      />
      <Image 
        source={require('../../assets/images/plant3.png')} 
        style={styles.plant3}
        resizeMode="contain"
      />

      {/* Background Plants - 20% opacity */}
      <Image 
        source={require('../../assets/images/plant4.png')} 
        style={styles.plant4}
        resizeMode="contain"
      />
      <Image 
        source={require('../../assets/images/plant5.png')} 
        style={styles.plant5}
        resizeMode="contain"
      />

      {/* GREETING TEXT */}
      <View style={styles.textContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#004B3A" />
        ) : (
          <>
            <Text style={styles.title}>Welcome! Hi {username}!</Text>
            <Text style={styles.subtitle}>Ready to care for your plants?</Text>
          </>
        )}
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.buttonIcon}>🔍</Text>
          <Text style={styles.buttonText}>Search by name</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/snap')}
        >
          <Text style={styles.buttonIcon}>📷</Text>
          <Text style={styles.buttonText}>Snap to identify</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/mypokok')}
        >
          <Text style={styles.buttonIcon}>🌱</Text>
          <Text style={styles.buttonText}>MyPokok</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/community')}
        >
          <Text style={styles.buttonIcon}>👥</Text>
          <Text style={styles.buttonText}>Community Sharing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  
  // Top Plants - Just images, no frames
  plant1: { // top left - 2x bigger
    position: 'absolute',
    top: -10,
    left: -110,
    width: 350,
    height: 350,
  },
  plant2: { // center - original size
    position: 'absolute',
    width: 350,
    height: 350,
    top: -50,
    right: -100,
  },
  plant3: { // top right - original size
    position: 'absolute',
    top: 80,
    right: 20,
    width: 350,
    height: 350,
  },
  
  // Background Plants - 20% opacity, 4x bigger
  plant4: { // bottom left
    position: 'absolute',
    bottom: -75,
    left: -225,
    width: 460,
    height: 460,
    opacity: 0.3,
    zIndex: 0,
  },
  plant5: { // bottom right
    position: 'absolute',
    bottom: -30,
    right: -215,
    width: 520,
    height: 520,
    opacity: 0.3,
    zIndex: 0,
  },
  
  textContainer: {
    alignItems: 'center',
    marginTop: 275,
    marginBottom: 30,
    zIndex: 1,
  },
  title: {
    fontSize: 25,
    color: '#004B3A',
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#004B3A',
    marginTop: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '80%',
    zIndex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 15,
    paddingHorizontal: 40,
    width: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    justifyContent: 'flex-start',
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    color: '#004B3A',
    fontWeight: '600',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
});