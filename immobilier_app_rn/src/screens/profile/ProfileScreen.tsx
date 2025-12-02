import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Property } from '../../models/Property';
import { getUserProperties } from '../../services/firestore.service';
import PropertyCardModern from '../../components/PropertyCardModern';

/**
 * ProfileScreen - Profil utilisateur avec "Mes annonces" et toggle thèmes
 */
export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { theme, toggleTheme } = useTheme();
  const { firebaseUser, userData, logout } = useAuth();
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebaseUser) {
      loadMyProperties();
    }
  }, [firebaseUser]);

  const loadMyProperties = async () => {
    if (!firebaseUser) return;
    try {
      console.log('📋 Profil - Chargement des annonces pour:', firebaseUser.uid);
      console.log('🔍 DEBUG Profile - firebaseUser.uid =', firebaseUser.uid);
      const data = await getUserProperties(firebaseUser.uid);
      console.log(`✅ Profil - ${data.length} annonces trouvées`);
      console.log('🔍 DEBUG Profile - Mes annonces pour', firebaseUser.uid, ':', data.length);
      setMyProperties(data);
    } catch (error) {
      console.error('❌ Erreur chargement annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <PropertyCardModern
      property={item}
      onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
    />
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>
            {userData?.displayName?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
          {userData?.displayName || 'Utilisateur'}
        </Text>
        <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
          {firebaseUser?.email}
        </Text>
        {userData?.phone && (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.userPhone, { color: theme.colors.textSecondary }]}>
              {userData.phone}
            </Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {/* Edit Profile */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
            Modifier le profil
          </Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
            Changer le mot de passe
          </Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
          onPress={toggleTheme}
        >
          <Ionicons name="color-palette-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
            Changer le thème
          </Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* About */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.navigate('About')}
        >
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
            À propos
          </Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {/* Admin (if admin) */}
        {(userData?.role === 'admin' || userData?.isAdmin) && (
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('Admin')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuText, { color: theme.colors.textPrimary }]}>
              Administration
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF5350" />
          <Text style={[styles.menuText, { color: '#EF5350' }]}>
            Déconnexion
          </Text>
        </TouchableOpacity>
      </View>

      {/* My Properties */}
      <View style={styles.myPropertiesSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Mes annonces ({myProperties.length})
        </Text>
        <FlatList
          data={myProperties}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={60} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Aucune annonce publiée
              </Text>
            </View>
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPhone: {
    fontSize: 14,
    marginLeft: 4,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '600',
  },
  myPropertiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});
