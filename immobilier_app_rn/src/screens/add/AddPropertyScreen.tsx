import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { PropertyFormData, PropertyType, PropertyPurpose } from '../../models/Property';
import { addProperty } from '../../services/firestore.service';
import LocationPicker from '../../components/LocationPicker';

const PROPERTY_TYPES: PropertyType[] = ['Appartement', 'Maison', 'Villa', 'Studio', 'Terrain', 'Autre'];

/**
 * AddPropertyScreen - Ajouter une nouvelle propriété
 * Upload d'images (max 5) + LocationPicker GPS
 */
export default function AddPropertyScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { firebaseUser, userData } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [surface, setSurface] = useState('');
  const [rooms, setRooms] = useState('');
  const [type, setType] = useState<PropertyType>('Appartement');
  const [purpose, setPurpose] = useState<PropertyPurpose>('rent');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState(''); // URL d'image externe
  const [isPromo, setIsPromo] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleLocationSelected = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setShowLocationPicker(false);
  };

  const handleSubmit = async () => {
    if (!firebaseUser) {
      Alert.alert('Erreur', 'Vous devez être connecté');
      return;
    }

    // Validation: seuls title, description, price, surface, rooms, location sont obligatoires
    console.log('📋 Validation - title:', title);
    console.log('📋 Validation - description:', description);
    console.log('📋 Validation - price:', price);
    console.log('📋 Validation - surface:', surface);
    console.log('📋 Validation - rooms:', rooms);
    console.log('📋 Validation - location:', location);
    console.log('📋 Validation - type:', type);
    console.log('📋 Validation - purpose:', purpose);

    // Validation des champs obligatoires
    if (!title?.trim() || !description?.trim() || !price || !surface || !location?.trim()) {
      console.error('❌ Validation échouée - champs manquants');
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (titre, description, prix, surface, localisation)');
      return;
    }

    // Validation spécifique du champ pièces
    const roomsNumber = Number(rooms);
    if (!rooms || isNaN(roomsNumber) || roomsNumber <= 0) {
      console.error('❌ Validation échouée - pièces invalide');
      Alert.alert('Erreur', 'Le champ pièces doit être un nombre valide.');
      return;
    }

    // Les images ne sont plus obligatoires
    // Si imageUrl est fourni, l'ajouter aux images
    const finalImages = imageUrl ? [imageUrl, ...images] : images;

    const formData: PropertyFormData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
      surface: parseFloat(surface),
      rooms: roomsNumber,
      type,
      purpose,
      location: location.trim(),
      latitude: latitude || 0,
      longitude: longitude || 0,
      images: finalImages,
      isPromo,
    };

    console.log('📋 Données formulaire avant envoi:', formData);
    setLoading(true);

    try {
      await addProperty(formData, firebaseUser.uid, userData?.displayName || 'Utilisateur', userData?.phone);
      Alert.alert('Succès', 'Votre annonce a été soumise et est en attente de validation', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Erreur ajout propriété:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la propriété');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Publier une annonce
        </Text>

        {/* Images */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Image (optionnel)
        </Text>
        
        {/* URL d'image externe */}
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, marginBottom: 20 }]}
          placeholder="URL d'image (ex: https://example.com/image.jpg)"
          placeholderTextColor={theme.colors.textSecondary}
          value={imageUrl}
          onChangeText={setImageUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Title */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Titre *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]}
          placeholder="Ex: Appartement moderne proche centre-ville"
          placeholderTextColor={theme.colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Description *</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]}
          placeholder="Décrivez votre propriété..."
          placeholderTextColor={theme.colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Type */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROPERTY_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.chip,
                {
                  backgroundColor: type === t ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: type === t ? '#FFF' : theme.colors.textPrimary },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Purpose */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type d'annonce *</Text>
        <View style={styles.purposeRow}>
          <TouchableOpacity
            style={[
              styles.purposeButton,
              {
                backgroundColor: purpose === 'rent' ? theme.colors.primary : theme.colors.surface,
              },
            ]}
            onPress={() => setPurpose('rent')}
          >
            <Text
              style={[
                styles.purposeButtonText,
                { color: purpose === 'rent' ? '#FFF' : theme.colors.textPrimary },
              ]}
            >
              À louer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.purposeButton,
              {
                backgroundColor: purpose === 'sale' ? theme.colors.primary : theme.colors.surface,
              },
            ]}
            onPress={() => setPurpose('sale')}
          >
            <Text
              style={[
                styles.purposeButtonText,
                { color: purpose === 'sale' ? '#FFF' : theme.colors.textPrimary },
              ]}
            >
              À vendre
            </Text>
          </TouchableOpacity>
        </View>

        {/* Price */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Prix (DT) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]}
              placeholder="700"
              placeholderTextColor={theme.colors.textSecondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Ancien prix (optionnel)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]}
              placeholder="900"
              placeholderTextColor={theme.colors.textSecondary}
              value={oldPrice}
              onChangeText={setOldPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Surface & Rooms */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Surface (m²) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]}
              placeholder="120"
              placeholderTextColor={theme.colors.textSecondary}
              value={surface}
              onChangeText={setSurface}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Pièces *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]}
              placeholder="3"
              placeholderTextColor={theme.colors.textSecondary}
              value={rooms}
              onChangeText={setRooms}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Location */}
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Localisation *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]}
          placeholder="Ex: Tunis, Centre-ville"
          placeholderTextColor={theme.colors.textSecondary}
          value={location}
          onChangeText={setLocation}
        />

        {/* GPS Location */}
        <TouchableOpacity
          style={[styles.gpsButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowLocationPicker(true)}
        >
          <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.gpsButtonText, { color: theme.colors.textPrimary }]}>
            {latitude && longitude
              ? `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              : '📍 Choisir sur carte (optionnel - non bloquant)'}
          </Text>
        </TouchableOpacity>

        {/* Promo Toggle */}
        <TouchableOpacity
          style={styles.promoToggle}
          onPress={() => setIsPromo(!isPromo)}
        >
          <Ionicons
            name={isPromo ? 'checkbox' : 'square-outline'}
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.promoText, { color: theme.colors.textPrimary }]}>
            Promotion (afficher l'ancien prix)
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Publication...' : 'Publier'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        onLocationSelected={handleLocationSelected}
        onClose={() => setShowLocationPicker(false)}
        initialLocation={
          latitude && longitude ? { latitude, longitude } : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CCC',
    borderStyle: 'dashed',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  purposeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  purposeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  purposeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  gpsButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  promoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  promoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
