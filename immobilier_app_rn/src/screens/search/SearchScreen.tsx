import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Property } from '../../models/Property';
import { searchProperties } from '../../services/firestore.service';
import PropertyCardModern from '../../components/PropertyCardModern';

/**
 * SearchScreen - Recherche avancée de propriétés
 */
export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const data = await searchProperties(query.trim());
      setResults(data);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <PropertyCardModern
      property={item}
      onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder="Rechercher une propriété..."
          placeholderTextColor={theme.colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {searched ? (
        <FlatList
          data={results}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: theme.colors.textSecondary }]}>
              {results.length} résultat{results.length > 1 ? 's' : ''} trouvé
              {results.length > 1 ? 's' : ''}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={80} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Aucun résultat
              </Text>
              <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
                Essayez avec d'autres mots-clés
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.initialContainer}>
          <Ionicons name="search-outline" size={100} color={theme.colors.textSecondary} />
          <Text style={[styles.initialText, { color: theme.colors.textSecondary }]}>
            Recherchez une propriété
          </Text>
          <Text style={[styles.initialSubText, { color: theme.colors.textSecondary }]}>
            Par titre, localisation, type...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  initialText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
  },
  initialSubText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});
