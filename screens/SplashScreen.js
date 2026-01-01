import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to login after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>flourish with</Text>
      <Text style={styles.appName}>JagaPokok</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    color: Colors.text,
    fontStyle: 'italic',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
});