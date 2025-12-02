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
import { updatePassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ChangePasswordScreen - Changer le mot de passe avec indicateur de force
 */
export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (): {
    strength: 'weak' | 'medium' | 'strong';
    color: string;
    label: string;
  } => {
    if (newPassword.length < 6) {
      return { strength: 'weak', color: '#EF5350', label: 'Trop court' };
    }
    if (newPassword.length < 8) {
      return { strength: 'medium', color: '#FF9800', label: 'Moyen' };
    }
    return { strength: 'strong', color: '#4CAF50', label: 'Fort' };
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      await updatePassword(currentUser, newPassword);

      Alert.alert('Succès', 'Mot de passe modifié avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue';

      switch (error.code) {
        case 'auth/requires-recent-login':
          errorMessage = 'Veuillez vous reconnecter pour modifier votre mot de passe';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe est trop faible';
          break;
        default:
          errorMessage = error.message;
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        Changer le mot de passe
      </Text>

      {/* New Password */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        Nouveau mot de passe
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          placeholder="Minimum 6 caractères"
          placeholderTextColor={theme.colors.textSecondary}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
        />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
          <Ionicons
            name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Password Strength Indicator */}
      {newPassword.length > 0 && (
        <View style={styles.strengthContainer}>
          <View
            style={[
              styles.strengthBar,
              {
                backgroundColor: passwordStrength.color,
                width: passwordStrength.strength === 'weak' ? '33%' : passwordStrength.strength === 'medium' ? '66%' : '100%',
              },
            ]}
          />
          <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
            {passwordStrength.label}
          </Text>
        </View>
      )}

      {/* Confirm Password */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        Confirmer le mot de passe
      </Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          placeholder="Répétez le mot de passe"
          placeholderTextColor={theme.colors.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: theme.colors.primary },
          loading && styles.saveButtonDisabled,
        ]}
        onPress={handleChangePassword}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Modification...' : 'Modifier'}
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
  strengthContainer: {
    marginTop: 12,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
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
