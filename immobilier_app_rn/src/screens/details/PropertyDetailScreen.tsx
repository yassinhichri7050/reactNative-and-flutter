import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Property } from '../../models/Property';
import { getPropertyById, toggleFavorite, isFavorite, deleteProperty, updateProperty } from '../../services/firestore.service';
import { formatPriceDT } from '../../utils/helpers';

const { width, height } = Dimensions.get('window');

// Chargement conditionnel de react-native-maps (uniquement sur mobile)
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
  } catch (error) {
    console.warn('react-native-maps non disponible');
  }
}

/**
 * PropertyDetailScreen - Détails d'une propriété
 * Protection contre les données manquantes
 */
export default function PropertyDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoOldPrice, setPromoOldPrice] = useState('');

  const propertyId = route.params?.propertyId;

  useEffect(() => {
    if (propertyId) {
      loadProperty();
      checkFavorite();
    } else {
      console.error('❌ PropertyDetailScreen: Aucun propertyId fourni');
      setLoading(false);
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      console.log('🔍 Chargement propriété:', propertyId);
      setLoading(true);
      const data = await getPropertyById(propertyId);
      if (data) {
        console.log('✅ Propriété chargée:', data.title);
        setProperty(data);
      } else {
        console.log('⚠️ Propriété introuvable:', propertyId);
        setProperty(null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement propriété:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!firebaseUser) return;
    try {
      const favStatus = await isFavorite(firebaseUser.uid, propertyId);
      setIsFav(favStatus);
    } catch (error) {
      console.error('Erreur vérification favori:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!firebaseUser) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }
    try {
      await toggleFavorite(firebaseUser.uid, propertyId);
      setIsFav(!isFav);
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  };

  const handleCall = () => {
    const phone = property?.ownerPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible');
    }
  };

  const handleDeleteProperty = async () => {
    if (!property) return;
    
    Alert.alert(
      'Supprimer l\'annonce',
      'Êtes-vous sûr de vouloir supprimer cette annonce ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProperty(property.id);
              Alert.alert('Succès', 'Annonce supprimée', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('❌ Erreur suppression annonce:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'annonce');
            }
          },
        },
      ]
    );
  };

  const handleEditProperty = () => {
    if (!property) return;
    Alert.alert('Information', 'Édition disponible prochainement');
  };

  const handlePromoProperty = async () => {
    if (!property) return;
    
    Alert.prompt(
      'Activer la promotion',
      'Entrez l\'ancien prix (avant promo):',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: async (oldPriceInput) => {
            const oldPrice = parseFloat(oldPriceInput || '0');
            if (isNaN(oldPrice) || oldPrice <= property.price) {
              Alert.alert('Erreur', 'L\'ancien prix doit être supérieur au prix actuel');
              return;
            }
            
            try {
              await updateProperty(property.id, {
                isPromo: true,
                oldPrice: oldPrice,
              } as any);
              Alert.alert('Succès', 'Promotion activée');
              loadProperty();
            } catch (error) {
              console.error('❌ Erreur activation promo:', error);
              Alert.alert('Erreur', 'Impossible d\'activer la promotion');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleMessage = () => {
    if (!firebaseUser) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }
    if (!property) return;

    navigation.navigate('Chat', {
      propertyId: property.id,
      ownerId: property.ownerId,
      propertyTitle: property.title,
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.textSecondary, marginTop: 10 }}>Chargement...</Text>
      </View>
    );
  }

  // Property not found
  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
            Propriété introuvable
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Cette annonce n'existe pas ou a été supprimée.
          </Text>
          <TouchableOpacity
            style={[styles.backToHomeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToHomeButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Protections contre les données manquantes
  const safeImages = property.images && Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : ['https://placehold.co/400x300/e0e0e0/757575/png?text=Pas+d%27image'];
  const safeDescription = property.description || 'Aucune description disponible';
  const hasLocation = property.latitude && property.longitude && property.latitude !== 0 && property.longitude !== 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Images Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const index = Math.round(x / width);
              setActiveImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {safeImages.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.image} />
            ))}
          </ScrollView>

          {/* Image Dots */}
          {safeImages.length > 1 && (
            <View style={styles.dotsContainer}>
              {safeImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: index === activeImageIndex ? '#FFF' : 'rgba(255,255,255,0.4)' },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Header Overlay */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            {firebaseUser && (
              <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
                <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color="#EF5350" />
              </TouchableOpacity>
            )}
          </View>

          {/* Promo Badge */}
          {property.isPromo && property.oldPrice && (
            <View style={styles.promoBadge}>
              <Text style={styles.promoText}>PROMO</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          {/* Title & Price */}
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{property.title}</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.colors.primary }]}>
              {formatPriceDT(property.price)}
            </Text>
            {property.isPromo && property.oldPrice && (
              <Text style={[styles.oldPrice, { color: theme.colors.textSecondary }]}>
                {formatPriceDT(property.oldPrice)}
              </Text>
            )}
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {property.location || 'Localisation non disponible'}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresRow}>
            <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="bed-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.textPrimary }]}>
                {property.rooms || 0} pièces
              </Text>
            </View>
            <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="resize-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.textPrimary }]}>
                {property.surface || 0} m²
              </Text>
            </View>
            <View style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="home-outline" size={24} color={theme.colors.primary} />
              <Text style={[styles.featureText, { color: theme.colors.textPrimary }]}>
                {property.type || 'Type'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {safeDescription}
          </Text>

          {/* Map */}
          {hasLocation && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                Localisation
              </Text>
              {Platform.OS !== 'web' && MapView ? (
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: property.latitude,
                      longitude: property.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: property.latitude,
                        longitude: property.longitude,
                      }}
                      title={property.title}
                    />
                  </MapView>
                </View>
              ) : (
                <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surface }]}>
                  <Text style={{ color: theme.colors.textSecondary }}>
                    Carte disponible uniquement sur mobile
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Owner Info */}
          {property.ownerName && (
            <View style={[styles.ownerCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerInitial}>
                  {(property.ownerName || 'P').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.ownerInfo}>
                <Text style={[styles.ownerName, { color: theme.colors.textPrimary }]}>
                  {property.ownerName}
                </Text>
                <Text style={[styles.ownerLabel, { color: theme.colors.textSecondary }]}>
                  Propriétaire
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Owner Actions - Only for properties owned by current user */}
      {firebaseUser && property && (property.ownerId === firebaseUser.uid || (property as any).userId === firebaseUser.uid) && (
        <View style={[styles.ownerActionsContainer, { backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.ownerActionButton, { backgroundColor: '#EF5350' }]}
            onPress={handleDeleteProperty}
          >
            <Ionicons name="trash-outline" size={20} color="#FFF" />
            <Text style={styles.ownerActionText}>Supprimer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ownerActionButton, { backgroundColor: '#FF9800' }]}
            onPress={handleEditProperty}
          >
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={styles.ownerActionText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ownerActionButton, { backgroundColor: '#4CAF50' }]}
            onPress={handlePromoProperty}
          >
            <Ionicons name="pricetag-outline" size={20} color="#FFF" />
            <Text style={styles.ownerActionText}>Promo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View style={[styles.actionsContainer, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 1 }]}
          onPress={handleCall}
        >
          <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Appeler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleMessage}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
          <Text style={[styles.actionButtonText, { color: '#FFF' }]}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width,
    height: height * 0.35,
  },
  image: {
    width,
    height: height * 0.35,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBadge: {
    position: 'absolute',
    top: 100,
    right: 16,
    backgroundColor: '#EF5350',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  promoText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  oldPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  infoText: {
    fontSize: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  featureCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ownerCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#42A5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInitial: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ownerLabel: {
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  ownerActionsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  ownerActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  ownerActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backToHomeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToHomeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
