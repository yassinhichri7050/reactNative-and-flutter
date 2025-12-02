import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * SplashScreen - Écran de démarrage avec logo Gold Meuble
 * Vérifie si l'utilisateur a vu l'onboarding et redirige automatiquement
 */
export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const { firebaseUser } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      // Attendre 2 secondes pour l'animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier si l'utilisateur a déjà vu l'onboarding
      const hasSeenOnboarding = await AsyncStorage.getItem('@immobilier_app:onboarding_shown');

      if (!hasSeenOnboarding) {
        // Première visite → Onboarding
        navigation.replace('Onboarding');
      } else if (firebaseUser) {
        // Utilisateur connecté → MainTabs
        navigation.replace('MainTabs');
      } else {
        // Utilisateur non connecté → Login
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification initiale:', error);
      navigation.replace('Login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {/* Logo Gold Meuble */}
      <View style={[styles.logoContainer, { backgroundColor: '#FFF' }]}>
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Indicateur de chargement */}
      <ActivityIndicator 
        size="large" 
        color="#FFF" 
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  loader: {
    marginTop: 32,
  },
});
