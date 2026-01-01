import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application'; // FIXED IMPORT
import { useRouter } from 'expo-router';
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/Colors';
import { auth, db } from '../services/firebase';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingExistingUser, setCheckingExistingUser] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkExistingUser();
  }, []);

  // Get device ID using expo-application
  const getDeviceId = async (): Promise<string> => {
    try {
      let deviceId: string | null = null;
      
      if (Platform.OS === 'ios') {
        deviceId = await Application.getIosIdForVendorAsync();
      } else {
        deviceId = Application.androidId;
      }
      
      // Fallback if device ID is null
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      // Fallback to a random ID
      return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  const checkExistingUser = async () => {
    try {
      // Check if user already logged in
      const savedUserId = await AsyncStorage.getItem('userId');
      const savedUserName = await AsyncStorage.getItem('userName');
      
      if (savedUserId && savedUserName) {
        // Auto-fill name
        setName(savedUserName);
        
        // Optional: Auto-navigate after a short delay
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1500);
      }
      
      setCheckingExistingUser(false);
    } catch (error) {
      console.error('Error checking existing user:', error);
      setCheckingExistingUser(false);
    }
  };

  const handleContinue = async () => {
    if (name.trim().length === 0) {
      Alert.alert('Name Required', 'Please enter your name first');
      return;
    }

    setLoading(true);

    try {
      // Get device ID for persistent user identification
      const deviceId = await getDeviceId();
      const userId = `user_${deviceId}`;
      
      console.log('Using device-based user ID:', userId);

      // Save user ID and name locally
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('userName', name.trim());

      // Sign in anonymously with Firebase (for other Firebase features)
      try {
        await signInAnonymously(auth);
        console.log('Firebase anonymous auth completed');
      } catch (authError) {
        console.warn('Firebase auth failed:', authError);
        // Continue anyway - we have our device-based ID
      }

      // Save user profile to Firestore
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      const userData = {
        name: name.trim(),
        deviceId: deviceId,
        platform: Platform.OS,
        appVersion: '1.0.0',
        updatedAt: new Date().toISOString(),
      };

      if (!userDoc.exists()) {
        // Create new user
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date().toISOString(),
        });
        console.log('Created new user profile in Firestore');
      } else {
        // Update existing user
        await setDoc(userRef, userData, { merge: true });
        console.log('Updated user profile in Firestore');
      }

      // Navigate to home
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('Error in login process:', error);
      Alert.alert(
        'Error', 
        'Failed to save your profile. Please try again.'
      );
      setLoading(false);
    }
  };

  // Show loading while checking for existing user
  if (checkingExistingUser) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.backgroundLogo}
        resizeMode="contain"
      />

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingLine}>Let's</Text>
        <Text style={styles.greetingLine}>Grow</Text>
        <Text style={styles.greetingLine}>Some</Text>
        <Text style={styles.greetingLine}>Pokok</Text>
      </View>

      {/* Login Form */}
      <View style={styles.contentContainer}>
        <Text style={styles.loginTitle}>Welcome to JagaPokok!</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#565756"
          value={name}
          onChangeText={setName}
          autoFocus={!name}
        />

        <Text style={styles.infoText}>
          Your data will be saved to this device using a unique device ID.
        </Text>

        <TouchableOpacity 
          style={[styles.button, (loading || !name.trim()) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading || !name.trim()}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundLogo: {
    position: 'absolute',
    width: 550,
    height: 550,
    opacity: 0.08,
    top: '55%',
    alignSelf: 'center',
    marginTop: -300,
  },
  greetingContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  greetingLine: {
    fontSize: 56,
    fontWeight: '700',
    color: '#004B3A',
    lineHeight: 64,
  },
  contentContainer: {
    position: 'absolute',
    top: '50%',
    marginTop: -60,
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004B3A',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#41a86b',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 60,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#f7f9f7',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text,
  },
});