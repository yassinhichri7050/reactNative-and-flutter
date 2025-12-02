import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Property } from '../models/Property';
import { useTheme } from '../contexts/ThemeContext';
import { formatPrice } from '../utils/helpers';
import { PURPOSE_LABELS } from '../utils/constants';
import { FirestoreService } from '../services/firestore.service';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface PropertyCardModernProps {
  property: Property;
  onPress: () => void;
}

/**
 * Carte moderne de propriété - Design 2 colonnes exact Flutter
 */
export const PropertyCardModern: React.FC<PropertyCardModernProps> = ({
  property,
  onPress,
}) => {
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (firebaseUser) {
      checkFavorite();
    }
  }, [firebaseUser, property.id]);

  const checkFavorite = async () => {
    if (firebaseUser) {
      const favorite = await FirestoreService.isFavorite(firebaseUser.uid, property.id);
      setIsFavorite(favorite);
    }
  };

  const toggleFavorite = async () => {
    if (!firebaseUser) return;

    try {
      if (isFavorite) {
        await FirestoreService.removeFromFavorites(firebaseUser.uid, property.id);
        setIsFavorite(false);
      } else {
        await FirestoreService.addToFavorites(firebaseUser.uid, property.id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erreur favori:', error);
    }
  };

  // Image par défaut grise si pas d'images
  const imageUrl = (property.images && property.images.length > 0) 
    ? property.images[0] 
    : 'https://placehold.co/400x300/e0e0e0/757575/png?text=Pas+d%27image';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image avec gradient overlay */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />

        {/* Badge PROMO (rouge, top-left) */}
        {property.isPromo && (
          <View style={[styles.badge, styles.badgePromo]}>
            <Text style={styles.badgeText}>PROMO</Text>
          </View>
        )}

        {/* Badge PURPOSE (bleu/gold, top-right) */}
        <View
          style={[
            styles.badge,
            styles.badgePurpose,
            {
              backgroundColor:
                property.purpose === 'rent' ? '#2196F3' : theme.colors.secondary,
            },
          ]}
        >
          <Text style={styles.badgeText}>{PURPOSE_LABELS[property.purpose]}</Text>
        </View>

        {/* Prix overlay (bottom-left) */}
        <View style={styles.priceOverlay}>
          {property.isPromo && property.oldPrice && (
            <Text style={styles.oldPrice}>{formatPrice(property.oldPrice)}</Text>
          )}
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
        </View>

        {/* Bouton favori (bottom-right, cercle blanc) */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#EF5350' : '#757575'}
          />
        </TouchableOpacity>
      </View>

      {/* Info section */}
      <View style={styles.infoContainer}>
        {/* Titre */}
        <Text
          style={[
            styles.title,
            { color: theme.colors.textPrimary },
            theme.typography.titleMedium,
          ]}
          numberOfLines={1}
        >
          {property.title}
        </Text>

        {/* Location row */}
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.location, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {property.location}
          </Text>
        </View>

        {/* Chips row */}
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: theme.colors.background }]}>
            <Text
              style={[styles.chipText, { color: theme.colors.textSecondary }]}
            >
              {property.surface}m²
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: theme.colors.background }]}>
            <Text
              style={[styles.chipText, { color: theme.colors.textSecondary }]}
            >
              {property.rooms} ch
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: theme.colors.background }]}>
            <Text
              style={[styles.chipText, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
            >
              {property.type}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  badge: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgePromo: {
    top: 8,
    left: 8,
    backgroundColor: '#EF5350',
  },
  badgePurpose: {
    top: 8,
    right: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  price: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  oldPrice: {
    color: '#B3B3B3',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 4,
    fontSize: 12,
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 10,
  },
});

export default PropertyCardModern;
