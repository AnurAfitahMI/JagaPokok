import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

export default function LoginScreen() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    if (name.trim().length === 0) {
      alert('Please enter your name first');
      return;
    }
    
    // Save name locally (we'll implement proper auth later)
    // For now, just navigate to home
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Logo (low opacity) */}
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
        <Text style={styles.loginTitle}>Login</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
  backgroundLogo: {
    position: 'absolute',
    width: 500,
    height: 500,
    opacity: 0.08,
    top: '30%',
    alignSelf: 'center',
  },
  greetingContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  greetingLine: {
    fontSize: 56,
    fontWeight: '700',
    color: '#555',
    lineHeight: 64,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 100,
    width: '85%',
    alignSelf: 'center',
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
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
    marginBottom: 25,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});