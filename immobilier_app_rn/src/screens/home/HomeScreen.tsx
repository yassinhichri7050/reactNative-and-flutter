import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Property, PropertyType, PropertyPurpose } from '../../models/Property';
import { getApprovedProperties } from '../../services/firestore.service';
import PropertyCardModern from '../../components/PropertyCardModern';

const { width } = Dimensions.get('window');

/**
 * HomeScreen - Page d'accueil avec grille 2 colonnes
 * Affiche toutes les propriétés approuvées avec filtres
 */
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { firebaseUser, userData } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filtres
  const [selectedType, setSelectedType] = useState<PropertyType | 'Tous'>('Tous');
  const [selectedPurpose, setSelectedPurpose] = useState<PropertyPurpose | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, selectedType, selectedPurpose]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await getApprovedProperties();
      setProperties(data);
    } catch (error) {
      console.error('Erreur chargement propriétés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...properties];

    if (selectedType !== 'Tous') {
      filtered = filtered.filter((p) => p.type === selectedType);
    }

    if (selectedPurpose !== 'all') {
      filtered = filtered.filter((p) => p.purpose === selectedPurpose);
    }

    setFilteredProperties(filtered);
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <PropertyCardModern
      property={item}
      onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title */}
      <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
        Gold Meuble
      </Text>

      {/* Filters Toggle */}
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Ionicons name="options-outline" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Search Button */}
      <TouchableOpacity
        style={[styles.searchButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search-outline" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.colors.surface }]}>
          {/* Type Filter */}
          <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>
            Type
          </Text>
          <FlatList
            data={['Tous', 'Appartement', 'Maison', 'Villa', 'Studio', 'Terrain']}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedType === item ? theme.colors.primary : theme.colors.background,
                  },
                ]}
                onPress={() => setSelectedType(item as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: selectedType === item ? '#FFF' : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Purpose Filter */}
          <Text style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>
            Annonce
          </Text>
          <View style={styles.purposeContainer}>
            {[
              { value: 'all', label: 'Tous' },
              { value: 'rent', label: 'À louer' },
              { value: 'sale', label: 'À vendre' },
            ].map((purpose) => (
              <TouchableOpacity
                key={purpose.value}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedPurpose === purpose.value
                        ? theme.colors.primary
                        : theme.colors.background,
                  },
                ]}
                onPress={() => setSelectedPurpose(purpose.value as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color:
                        selectedPurpose === purpose.value ? '#FFF' : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {purpose.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results Count */}
      <Text style={[styles.resultsCount, { color: theme.colors.textSecondary }]}>
        {filteredProperties.length} propriété{filteredProperties.length > 1 ? 's' : ''} trouvée
        {filteredProperties.length > 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={80} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucune propriété disponible
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  purposeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resultsCount: {
    fontSize: 14,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
