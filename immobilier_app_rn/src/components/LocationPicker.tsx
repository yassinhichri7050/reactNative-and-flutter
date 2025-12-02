import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { DEFAULT_LOCATION } from '../utils/constants';

const { width, height } = Dimensions.get('window');

// Chargement conditionnel de react-native-maps
let MapView: any = null;
let Marker: any = null;
let MapPressEvent: any = null;
let Region: any = null;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    MapPressEvent = maps.MapPressEvent;
    Region = maps.Region;
  } catch (error) {
    console.warn('react-native-maps non disponible');
  }
}

interface LocationPickerProps {
  visible: boolean;
  initialLocation?: { latitude: number; longitude: number };
  onLocationSelected: (latitude: number, longitude: number) => void;
  onClose: () => void;
}

/**
 * Sélecteur de localisation GPS avec carte interactive
 */
const LocationPicker: React.FC<LocationPickerProps> = ({
  visible,
  initialLocation,
  onLocationSelected,
  onClose,
}) => {
  const { theme } = useTheme();
  const [selectedPosition, setSelectedPosition] = useState(
    initialLocation || DEFAULT_LOCATION
  );

  const [region, setRegion] = useState<any>({
    ...DEFAULT_LOCATION,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    ...(initialLocation || {}),
  });

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedPosition({ latitude, longitude });
  };

  const handleConfirm = () => {
    onLocationSelected(selectedPosition.latitude, selectedPosition.longitude);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={28} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.white }]}>
            Choisir sur carte
          </Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
            <Ionicons name="checkmark" size={28} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Map */}
        {Platform.OS !== 'web' && MapView && Marker ? (
          <MapView
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={selectedPosition}
              draggable
              onDragEnd={(e: any) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setSelectedPosition({ latitude, longitude });
              }}
            />
          </MapView>
        ) : (
          <View style={[styles.map, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface }]}>
            <Ionicons name="map-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.webMessage, { color: theme.colors.textSecondary }]}>
              Sélecteur de carte disponible uniquement sur mobile
            </Text>
          </View>
        )}

        {/* Info container */}
        <View style={[styles.infoContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Position GPS sélectionnée
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>
                {selectedPosition.latitude.toFixed(6)}, {selectedPosition.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Appuyez sur la carte pour sélectionner une position
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  webMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  infoContainer: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LocationPicker;
