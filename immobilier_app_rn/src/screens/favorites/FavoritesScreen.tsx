import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Property } from '../../models/Property';
import { getUserFavorites } from '../../services/firestore.service';
import PropertyCardModern from '../../components/PropertyCardModern';

/**
 * FavoritesScreen - Liste des propriétés favorites
 */
export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Recharger à chaque fois que l'écran prend le focus
  useFocusEffect(
    React.useCallback(() => {
      if (firebaseUser) {
        loadFavorites();
      }
    }, [firebaseUser])
  );

  const loadFavorites = async () => {
    if (!firebaseUser) return;
    try {
      console.log('❤️ Chargement des favoris pour:', firebaseUser.uid);
      const data = await getUserFavorites(firebaseUser.uid);
      console.log(`✅ ${data.length} favoris récupérés`);
      setFavorites(data);
    } catch (error) {
      console.error('❌ Erreur chargement favoris:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <PropertyCardModern
      property={item}
      onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={favorites}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucun favori
            </Text>
            <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
              Ajoutez des propriétés à vos favoris pour les retrouver ici
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
