import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
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
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        const savedUserId = await AsyncStorage.getItem('userId');
        const savedUserName = await AsyncStorage.getItem('userName');

        if (!active) {
          return;
        }

        if (currentUser && savedUserName) {
          if (savedUserId && savedUserId !== currentUser.uid) {
            await AsyncStorage.setItem('legacyUserId', savedUserId);
          }

          await AsyncStorage.setItem('userId', currentUser.uid);
          setName(savedUserName);
          router.replace('/(tabs)');
          return;
        }

        setCheckingExistingUser(false);
      } catch (error) {
        console.error('Error checking existing user:', error);
        setCheckingExistingUser(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  const handleContinue = async () => {
    if (name.trim().length === 0) {
      Alert.alert('Name Required', 'Please enter your name first');
      return;
    }

    setLoading(true);

    try {
      const previousUserId = await AsyncStorage.getItem('userId');
      const userCredential = auth.currentUser
        ? { user: auth.currentUser }
        : await signInAnonymously(auth);

      const userId = userCredential.user.uid;

      console.log('Using Firebase anonymous UID:', userId);

      if (previousUserId && previousUserId !== userId) {
        await AsyncStorage.setItem('legacyUserId', previousUserId);
      }

      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('userName', name.trim());

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      const userData = {
        name: name.trim(),
        platform: Platform.OS,
        appVersion: '1.0.0',
        updatedAt: new Date().toISOString(),
      };

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date().toISOString(),
        });
        console.log('Created new user profile in Firestore');
      } else {
        await setDoc(userRef, userData, { merge: true });
        console.log('Updated user profile in Firestore');
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error in login process:', error);
      Alert.alert(
        'Error',
        'Failed to sign in or save your profile. Please try again.'
      );
    } finally {
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
          Your plant data will be linked to your JagaPokok profile.
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