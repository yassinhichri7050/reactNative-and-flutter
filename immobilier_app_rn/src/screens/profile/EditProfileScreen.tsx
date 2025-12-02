import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/firestore.service';

/**
 * EditProfileScreen - Modifier les informations du profil
 */
export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { firebaseUser, userData, refreshUserData } = useAuth();

  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [location, setLocation] = useState(userData?.location || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!firebaseUser) return;

    if (!displayName.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }

    setLoading(true);

    try {
      await updateUserProfile(firebaseUser.uid, {
        displayName: displayName.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      });

      await refreshUserData();

      Alert.alert('Succès', 'Profil mis à jour', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        Modifier le profil
      </Text>

      {/* Display Name */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        Nom complet *
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          placeholder="Jean Dupont"
          placeholderTextColor={theme.colors.textSecondary}
          value={displayName}
          onChangeText={setDisplayName}
        />
      </View>

      {/* Email (read-only) */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        Email (non modifiable)
      </Text>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.surface, opacity: 0.6 },
        ]}
      >
        <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          value={firebaseUser?.email || ''}
          editable={false}
        />
      </View>

      {/* Phone */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        Téléphone
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          placeholder="99999999"
          placeholderTextColor={theme.colors.textSecondary}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* Location */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        Localisation
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          placeholder="Tunis, Tunisie"
          placeholderTextColor={theme.colors.textSecondary}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: theme.colors.primary },
          loading && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
