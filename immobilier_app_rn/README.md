# 🏠 Gold Meuble - Application Immobilière React Native

Application mobile React Native + Expo + TypeScript pour la gestion immobilière en Tunisie.

## ✨ Fonctionnalités Complètes

### 🔐 Authentification
- ✅ Inscription / Connexion (Firebase Auth)
- ✅ Récupération mot de passe par email
- ✅ Changement de mot de passe sécurisé
- ✅ Gestion de profil utilisateur

### 🏘️ Propriétés
- ✅ Grille 2 colonnes avec PropertyCardModern
- ✅ Détails avec carte OpenStreetMap
- ✅ Upload d'images (max 5)
- ✅ LocationPicker GPS interactif
- ✅ Filtres (Type, Prix, Purpose)
- ✅ Recherche avancée
- ✅ Système de favoris

### 💬 Messagerie
- ✅ Chat temps réel avec Firebase
- ✅ Déduplication automatique des conversations
- ✅ Indicateurs de messages non lus
- ✅ Bulles de messages stylisées

### 👤 Profil & Admin
- ✅ "Mes annonces" dans le profil
- ✅ Validation admin (pending → approved)
- ✅ 3 thèmes (Gold Light, Gold Dark, Green Nature)
- ✅ Toggle thème avec AsyncStorage

### 📱 18 Écrans
1. SplashScreen, 2. OnboardingScreen, 3. LoginScreen, 4. RegisterScreen, 5. ForgotPasswordScreen, 6. HomeScreen, 7. PropertyDetailScreen, 8. AddPropertyScreen, 9. EditPropertyScreen, 10. SearchScreen, 11. FavoritesScreen, 12. MessagesScreen, 13. ChatScreen, 14. ProfileScreen, 15. EditProfileScreen, 16. ChangePasswordScreen, 17. AboutScreen, 18. AdminScreen

## 🚀 Installation Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer Firebase (voir section Configuration)

# 3. Lancer l'application
npx expo start
```

## 🔥 Configuration Firebase Requise

Créez `src/config/firebase.ts` :

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## 🎨 3 Thèmes Disponibles

**Gold Light** (Défaut) - Primary: #D4AF37  
**Gold Dark** - Primary: #D4AF37, Background: #121212  
**Green Nature** - Primary: #4CAF50

## 📦 Structure

```
src/
├── models/           # Property, User, Message
├── services/         # Firebase services
├── contexts/         # Theme, Auth
├── components/       # PropertyCardModern, LocationPicker
├── screens/          # 18 écrans complets
├── navigation/       # Stack + BottomTabs
├── theme/            # 3 thèmes
└── utils/            # Helpers
```

## 🗺️ OpenStreetMap

- PropertyDetailScreen : Carte avec marker
- LocationPicker : Sélection GPS interactive

## 📝 Collections Firestore

- `properties` - Status: pending/approved/rejected
- `users` - Role: user/admin
- `users/{uid}/favorites` - Favoris utilisateur
- `chats` - Conversations déduplicées
- `chats/{chatId}/messages` - Messages temps réel

## 🧪 Tests

```bash
npx expo start --android  # Android
npx expo start --ios      # iOS
npx expo start --web      # Web
```

## 🎯 Prochaines Étapes

1. Configurez Firebase (firebase.ts)
2. Ajoutez des images dans `assets/`
3. Lancez `npx expo start`
4. Testez tous les 18 écrans
5. Créez un compte admin pour tester AdminScreen

---

**Version:** 2.0.0 | **Stack:** React Native + Expo + TypeScript + Firebase  
© 2025 Gold Meuble
