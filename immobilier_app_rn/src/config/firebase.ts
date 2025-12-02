import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Configuration Firebase
 */
const firebaseConfig = {
  apiKey: "AIzaSyDDLJJyfeva9GayE15SA9PIUyW-tYSlGp0",
  authDomain: "immobilierapp-fd8a0.firebaseapp.com",
  projectId: "immobilierapp-fd8a0",
  storageBucket: "immobilierapp-fd8a0.firebasestorage.app",
  messagingSenderId: "435419844533",
  appId: "1:435419844533:web:b2d542ce1dab2c99a693fc",
  measurementId: "G-ZPBN6S3SF3"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase avec AsyncStorage pour la persistance de l'authentification
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
