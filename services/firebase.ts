// services/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDccOGtvpTcAoAHs3FXkDR1qiUTCFrESf4",
  authDomain: "jagapokok3.firebaseapp.com",
  projectId: "jagapokok3",
  storageBucket: "jagapokok3.firebasestorage.app",
  messagingSenderId: "122701542321",
  appId: "1:122701542321:web:cb0a6f9f8922828d6d8390"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const storage = getStorage(app);

export default app;
