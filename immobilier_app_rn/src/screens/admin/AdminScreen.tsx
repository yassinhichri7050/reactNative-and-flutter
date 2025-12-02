import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Property } from '../../models/Property';
import { User } from '../../models/User';
import {
  getPendingProperties,
  getAllProperties,
  getAllUsers,
  deleteUser,
  approveProperty,
  rejectProperty,
} from '../../services/firestore.service';
import { formatPriceDT } from '../../utils/helpers';

/**
 * AdminScreen - Validation des annonces (pending → approved/rejected)
 */
export default function AdminScreen() {
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();
  const navigation = useNavigation<any>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'users' | 'all'>('pending');

  useEffect(() => {
    loadProperties();
  }, [tab]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      console.log('🛠 Admin - Chargement onglet:', tab);
      
      if (tab === 'pending') {
        const data = await getPendingProperties();
        console.log('🛠 Admin - pending count:', data.length);
        setProperties(data);
      } else if (tab === 'all') {
        const data = await getAllProperties();
        console.log('🛠 Admin - all properties count:', data.length);
        setProperties(data);
      } else if (tab === 'users') {
        const data = await getAllUsers();
        console.log('🛠 Admin - users count:', data.length);
        setUsers(data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (propertyId: string) => {
    try {
      await approveProperty(propertyId);
      setProperties(properties.filter((p) => p.id !== propertyId));
      Alert.alert('Succès', 'Annonce approuvée');
    } catch (error) {
      console.error('Erreur approbation:', error);
      Alert.alert('Erreur', 'Impossible d\'approuver l\'annonce');
    }
  };

  const handleReject = async (propertyId: string) => {
    Alert.alert(
      'Rejeter l\'annonce',
      'Voulez-vous vraiment rejeter cette annonce ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectProperty(propertyId);
              setProperties(properties.filter((p) => p.id !== propertyId));
              Alert.alert('Succès', 'Annonce rejetée');
            } catch (error) {
              console.error('Erreur rejet:', error);
              Alert.alert('Erreur', 'Impossible de rejeter l\'annonce');
            }
          },
        },
      ]
    );
  };

  const handleDeleteProperty = async (propertyId: string) => {
    Alert.alert(
      'Supprimer l\'annonce',
      'Voulez-vous vraiment supprimer cette annonce définitivement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProperty(propertyId);
              setProperties(properties.filter((p) => p.id !== propertyId));
              Alert.alert('Succès', 'Annonce supprimée');
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'annonce');
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (userId: string) => {
    // Empêcher de supprimer son propre compte
    if (firebaseUser && userId === firebaseUser.uid) {
      Alert.alert('Erreur', 'Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    Alert.alert(
      'Supprimer l\'utilisateur',
      'Voulez-vous vraiment supprimer cet utilisateur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              setUsers(users.filter((u) => u.uid !== userId));
              Alert.alert('Succès', 'Utilisateur supprimé');
            } catch (error) {
              console.error('Erreur suppression utilisateur:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur');
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={[styles.userCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
          {item.displayName || 'Utilisateur'}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {item.email}
        </Text>
        <View style={styles.userDetails}>
          <Text style={[styles.userDetailText, { color: theme.colors.textSecondary }]}>
            {item.phone || 'Pas de téléphone'}
          </Text>
          {(item.role === 'admin' || (item as any).isAdmin) && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>ADMIN</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Delete button - only if not current user */}
      {firebaseUser && item.uid !== firebaseUser.uid && (
        <TouchableOpacity
          style={[styles.deleteUserButton, { backgroundColor: '#EF5350' }]}
          onPress={() => handleDeleteUser(item.uid)}
        >
          <Ionicons name="trash-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderProperty = ({ item }: { item: Property }) => (
    <TouchableOpacity
      style={[styles.propertyCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id, fromAdmin: true })}
      activeOpacity={0.9}
    >
      {/* Image */}
      <Image
        source={{ uri: (item.images && item.images.length > 0) ? item.images[0] : 'https://placehold.co/400x300/e0e0e0/757575/png?text=Pas+d%27image' }}
        style={styles.propertyImage}
        resizeMode="cover"
      />

      {/* Info */}
      <View style={styles.propertyInfo}>
        <Text style={[styles.propertyTitle, { color: theme.colors.textPrimary }]}>
          {item.title}
        </Text>
        <View style={styles.propertyDetails}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.propertyLocation, { color: theme.colors.textSecondary }]}>
            {item.location}
          </Text>
        </View>
        <Text style={[styles.propertyPrice, { color: theme.colors.primary }]}>
          {formatPriceDT(item.price)}
        </Text>

        {/* Badges */}
        <View style={styles.badges}>
          {item.isPromo && (
            <View style={[styles.badge, { backgroundColor: '#EF5350' }]}>
              <Text style={styles.badgeText}>PROMO</Text>
            </View>
          )}
          {/* Badge PENDING uniquement pour status pending */}
          {item.status === 'pending' && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>PENDING</Text>
            </View>
          )}
        </View>

        {/* Actions - Pending: Approve/Reject, Others: Delete only */}
        {item.status === 'pending' ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleApprove(item.id)}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Approuver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EF5350' }]}
              onPress={() => handleReject(item.id)}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Rejeter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EF5350', flex: 1 }]}
              onPress={() => handleDeleteProperty(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: tab === 'pending' ? theme.colors.primary : theme.colors.surface,
            },
          ]}
          onPress={() => setTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              { color: tab === 'pending' ? '#FFF' : theme.colors.textPrimary },
            ]}
          >
            En attente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: tab === 'users' ? theme.colors.primary : theme.colors.surface,
            },
          ]}
          onPress={() => setTab('users')}
        >
          <Text
            style={[
              styles.tabText,
              { color: tab === 'users' ? '#FFF' : theme.colors.textPrimary },
            ]}
          >
            Utilisateurs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: tab === 'all' ? theme.colors.primary : theme.colors.surface,
            },
          ]}
          onPress={() => setTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              { color: tab === 'all' ? '#FFF' : theme.colors.textPrimary },
            ]}
          >
            Toutes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content - Properties or Users */}
      {tab === 'users' ? (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={80}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Aucun utilisateur
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={80}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {tab === 'pending' && 'Aucune annonce en attente'}
                {tab === 'all' && 'Aucune annonce dans la base'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  propertyCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  propertyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyLocation: {
    fontSize: 14,
    marginLeft: 4,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  userCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userDetailText: {
    fontSize: 12,
  },
  deleteUserButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
