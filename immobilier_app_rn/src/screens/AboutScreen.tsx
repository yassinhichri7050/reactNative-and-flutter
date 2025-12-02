import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

/**
 * AboutScreen - Informations sur l'application Gold Meuble
 */
export default function AboutScreen() {
  const { theme } = useTheme();

  const handleContact = (type: 'email' | 'phone' | 'website') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:contact@goldmeuble.tn');
        break;
      case 'phone':
        Linking.openURL('tel:+21612345678');
        break;
      case 'website':
        Linking.openURL('https://goldmeuble.tn');
        break;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Logo */}
      <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
        <Ionicons name="home" size={60} color="#FFF" />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        Gold Meuble
      </Text>
      <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
        Version 2.0.0
      </Text>

      {/* Description */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          À propos
        </Text>
        <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
          Gold Meuble est votre application de référence pour trouver la propriété immobilière
          idéale en Tunisie. Parcourez des milliers d'annonces, contactez directement les
          propriétaires et trouvez votre prochain chez-vous.
        </Text>
      </View>

      {/* Features */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Fonctionnalités
        </Text>
        <View style={styles.featureItem}>
          <Ionicons name="search-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            Recherche avancée par type, prix, localisation
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            Géolocalisation des propriétés sur carte
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="chatbubbles-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            Messagerie instantanée avec les propriétaires
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="heart-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            Sauvegarde de vos propriétés favorites
          </Text>
        </View>
      </View>

      {/* Contact */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Contact
        </Text>
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => handleContact('email')}
        >
          <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.contactText, { color: theme.colors.textPrimary }]}>
            contact@goldmeuble.tn
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => handleContact('phone')}
        >
          <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.contactText, { color: theme.colors.textPrimary }]}>
            +216 12 345 678
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => handleContact('website')}
        >
          <Ionicons name="globe-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.contactText, { color: theme.colors.textPrimary }]}>
            www.goldmeuble.tn
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legal */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Mentions légales
        </Text>
        <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
          © 2025 Gold Meuble. Tous droits réservés.{'\n\n'}
          Cette application est protégée par les lois sur le droit d'auteur et les traités
          internationaux.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contactText: {
    fontSize: 16,
    marginLeft: 12,
  },
});
