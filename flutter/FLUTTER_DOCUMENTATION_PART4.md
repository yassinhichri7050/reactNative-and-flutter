# 📱 DOCUMENTATION FLUTTER - PARTIE 4/4
## Application Immobilière - Modèles, Firebase, Design System

---

## 📋 TABLE DES MATIÈRES

1. [Modèles de Données](#modèles-de-données)
2. [Structure Firebase](#structure-firebase)
3. [Configuration Firebase](#configuration-firebase)
4. [Dépendances (pubspec.yaml)](#dépendances-pubspecyaml)
5. [Design System & Thèmes](#design-system--thèmes)
6. [Constantes](#constantes)
7. [Guide Migration React Native](#guide-migration-react-native)

---

## 📦 MODÈLES DE DONNÉES

### PropertyModel (`models/property_model.dart`)

**Champs**:
```dart
class PropertyModel {
  final String id;                  // ID Firestore
  final String title;               // Titre de la propriété
  final String description;         // Description détaillée
  final double price;               // Prix original
  final String type;                // "Maison", "Appartement", "Terrain", "Commerce"
  final String purpose;             // "rent" ou "sale" (À louer / À vendre)
  final double? surface;            // Surface en m²
  final String? location;           // Adresse textuelle
  final double? latitude;           // Coordonnée GPS latitude
  final double? longitude;          // Coordonnée GPS longitude
  final List<String> images;        // URLs des images
  final String userId;              // ID du propriétaire
  final DateTime? createdAt;        // Date de création
  final DateTime? updatedAt;        // Date de modification
  final int? rooms;                 // Nombre de pièces
  final bool isFeatured;            // Annonce mise en avant
  final bool isPromo;               // Promotion active
  final double? promoPrice;         // Prix promotionnel (si isPromo = true)
  final String status;              // "pending", "approved", "rejected"
  final Timestamp? submittedAt;     // Date de soumission
  final String? reviewedBy;         // ID de l'admin qui a validé
  final Timestamp? reviewedAt;      // Date de validation

  // Getter: retourne promoPrice si promo, sinon price
  double get displayPrice => isPromo && promoPrice != null ? promoPrice! : price;
}
```

**Méthodes**:
```dart
// Créer PropertyModel depuis Firestore
factory PropertyModel.fromMap(Map<String, dynamic> map, String id) {
  return PropertyModel(
    id: id,
    title: map['title'] ?? '',
    description: map['description'] ?? '',
    price: (map['price'] ?? 0).toDouble(),
    type: map['type'] ?? '',
    purpose: map['purpose'] ?? 'sale',
    surface: map['surface']?.toDouble(),
    location: map['location'],
    latitude: map['latitude']?.toDouble(),
    longitude: map['longitude']?.toDouble(),
    images: List<String>.from(map['images'] ?? []),
    userId: map['userId'] ?? '',
    createdAt: (map['createdAt'] as Timestamp?)?.toDate(),
    updatedAt: (map['updatedAt'] as Timestamp?)?.toDate(),
    rooms: map['rooms'],
    isFeatured: map['isFeatured'] ?? false,
    isPromo: map['isPromo'] ?? false,
    promoPrice: map['promoPrice']?.toDouble(),
    status: map['status'] ?? 'pending',
    submittedAt: map['submittedAt'] as Timestamp?,
    reviewedBy: map['reviewedBy'],
    reviewedAt: map['reviewedAt'] as Timestamp?,
  );
}

// Convertir PropertyModel vers Map pour Firestore
Map<String, dynamic> toMap() => {
  'title': title,
  'description': description,
  'price': price,
  'type': type,
  'purpose': purpose,
  'surface': surface,
  'location': location,
  'latitude': latitude,
  'longitude': longitude,
  'images': images,
  'userId': userId,
  'createdAt': createdAt,
  'updatedAt': updatedAt,
  'rooms': rooms,
  'isFeatured': isFeatured,
  'isPromo': isPromo,
  'promoPrice': promoPrice,
  'status': status,
  'submittedAt': submittedAt,
  'reviewedBy': reviewedBy,
  'reviewedAt': reviewedAt,
};
```

**Pour React Native**:
```typescript
interface PropertyModel {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'Maison' | 'Appartement' | 'Terrain' | 'Commerce';
  purpose: 'rent' | 'sale';
  surface?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  rooms?: number;
  isFeatured: boolean;
  isPromo: boolean;
  promoPrice?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// Getter
const displayPrice = (property: PropertyModel) => 
  property.isPromo && property.promoPrice 
    ? property.promoPrice 
    : property.price;
```

---

### UserModel (`models/user_model.dart`)

**Champs**:
```dart
class UserModel {
  final String id;              // UID Firebase Auth
  final String email;           // Email
  final String displayName;     // Nom d'affichage
  final String phone;           // Numéro de téléphone
  final String? photoUrl;       // URL photo de profil
  final String location;        // Localisation de l'utilisateur
  final DateTime createdAt;     // Date de création
  final DateTime? updatedAt;    // Date de modification
  final bool isOnline;          // Statut en ligne
}
```

**Méthodes**:
```dart
// Créer UserModel depuis Firestore
factory UserModel.fromMap(Map<String, dynamic> map, String id) {
  return UserModel(
    id: id,
    email: map['email'] ?? '',
    displayName: map['displayName'] ?? '',
    phone: map['phone'] ?? '',
    photoUrl: map['photoUrl'],
    location: map['location'] ?? '',
    createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    updatedAt: (map['updatedAt'] as Timestamp?)?.toDate(),
    isOnline: map['isOnline'] ?? false,
  );
}

// Convertir UserModel vers Map
Map<String, dynamic> toMap() => {
  'email': email,
  'displayName': displayName,
  'phone': phone,
  'photoUrl': photoUrl,
  'location': location,
  'createdAt': createdAt,
  'updatedAt': updatedAt,
  'isOnline': isOnline,
};
```

**Pour React Native**:
```typescript
interface UserModel {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  photoUrl?: string;
  location: string;
  createdAt: Date;
  updatedAt?: Date;
  isOnline: boolean;
}
```

---

### MessageModel (`models/message_model.dart`)

**Champs**:
```dart
class MessageModel {
  final String id;              // ID Firestore
  final String senderId;        // ID de l'expéditeur
  final String receiverId;      // ID du destinataire
  final String text;            // Contenu du message
  final DateTime timestamp;     // Date d'envoi
  final bool isRead;            // Message lu ou non
}
```

**Méthodes**:
```dart
factory MessageModel.fromMap(Map<String, dynamic> map, String id) {
  return MessageModel(
    id: id,
    senderId: map['senderId'] ?? '',
    receiverId: map['receiverId'] ?? '',
    text: map['text'] ?? '',
    timestamp: (map['timestamp'] as Timestamp?)?.toDate() ?? DateTime.now(),
    isRead: map['isRead'] ?? false,
  );
}

Map<String, dynamic> toMap() => {
  'senderId': senderId,
  'receiverId': receiverId,
  'text': text,
  'timestamp': timestamp,
  'isRead': isRead,
};
```

---

## 🔥 STRUCTURE FIREBASE

### Collections Firestore

#### 1. **properties** (Collection racine)
```
properties/
  {propertyId}/
    - title: string
    - description: string
    - price: number
    - type: string ('Maison', 'Appartement', 'Terrain', 'Commerce')
    - purpose: string ('rent', 'sale')
    - surface: number
    - location: string
    - latitude: number
    - longitude: number
    - images: array<string> (URLs)
    - userId: string (référence vers users)
    - createdAt: timestamp
    - updatedAt: timestamp
    - rooms: number
    - isFeatured: boolean
    - isPromo: boolean
    - promoPrice: number (optionnel)
    - status: string ('pending', 'approved', 'rejected')
    - submittedAt: timestamp
    - reviewedBy: string (optionnel)
    - reviewedAt: timestamp (optionnel)
```

**Indices Firestore**:
```
- status (ASC) + createdAt (DESC)
- userId (ASC) + createdAt (DESC)
- purpose (ASC) + status (ASC)
- type (ASC) + status (ASC)
```

---

#### 2. **users** (Collection racine)
```
users/
  {userId}/
    - email: string
    - displayName: string
    - phone: string
    - photoUrl: string (optionnel)
    - location: string
    - createdAt: timestamp
    - updatedAt: timestamp
    - isOnline: boolean
    - isAdmin: boolean (pour accès AdminPage)
    - fcmToken: string (optionnel, pour notifications)
    
    favorites/ (Subcollection)
      {propertyId}/
        - propertyId: string (référence vers properties)
        - addedAt: timestamp
```

---

#### 3. **chats** (Collection racine)
```
chats/
  {chatId}/
    - propertyId: string (référence vers la propriété concernée)
    - participants: array<string> (UIDs des 2 utilisateurs)
    - createdAt: timestamp
    - lastMessage: string
    - lastMessageTime: timestamp
    - unreadCount_{userId}: number (pour chaque participant)
    
    messages/ (Subcollection)
      {messageId}/
        - senderId: string
        - receiverId: string
        - text: string
        - timestamp: timestamp
        - isRead: boolean
```

**Indices Firestore**:
```
chats:
- participants (ARRAY_CONTAINS) + lastMessageTime (DESC)

messages (subcollection):
- timestamp (DESC)
```

---

### Firebase Storage

**Structure**:
```
gs://immobilier-app.appspot.com/
  properties/
    {userId}/
      {timestamp}_{filename}.jpg
      {timestamp}_{filename}.png
  
  users/
    {userId}/
      profile.jpg
```

---

### Firebase Cloud Messaging (FCM)

**Topics**:
- `all_users`: Tous les utilisateurs connectés
- `new_properties`: Notifications pour nouvelles annonces
- `admin_alerts`: Notifications pour admins

---

## ⚙️ CONFIGURATION FIREBASE

### firebase.json (racine du projet)
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

---

### firestore.rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Propriétés
    match /properties/{propertyId} {
      // Lecture: tous les utilisateurs (seulement annonces approuvées)
      allow read: if resource.data.status == 'approved' 
                  || request.auth.uid == resource.data.userId
                  || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      
      // Création: utilisateurs authentifiés
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Modification: propriétaire ou admin
      allow update: if request.auth.uid == resource.data.userId 
                    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      
      // Suppression: propriétaire ou admin
      allow delete: if request.auth.uid == resource.data.userId 
                    || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Utilisateurs
    match /users/{userId} {
      // Lecture: tous les utilisateurs authentifiés
      allow read: if request.auth != null;
      
      // Création/modification: soi-même uniquement
      allow create, update: if request.auth.uid == userId;
      
      // Favoris
      match /favorites/{propertyId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Chats
    match /chats/{chatId} {
      // Lecture/écriture: participants uniquement
      allow read, write: if request.auth.uid in resource.data.participants;
      
      // Messages
      match /messages/{messageId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
```

---

### storage.rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Images de propriétés
    match /properties/{userId}/{filename} {
      allow read: if true; // Public
      allow write: if request.auth.uid == userId 
                   && request.resource.size < 5 * 1024 * 1024 // Max 5MB
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Photos de profil
    match /users/{userId}/{filename} {
      allow read: if true; // Public
      allow write: if request.auth.uid == userId 
                   && request.resource.size < 2 * 1024 * 1024 // Max 2MB
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

### firestore.indexes.json
```json
{
  "indexes": [
    {
      "collectionGroup": "properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "properties",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "purpose", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "chats",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participants", "arrayConfig": "CONTAINS" },
        { "fieldPath": "lastMessageTime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 📦 DÉPENDANCES (pubspec.yaml)

### Complète avec versions
```yaml
name: immobilier_app
description: "Application immobilière Flutter"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: ^3.9.2

dependencies:
  flutter:
    sdk: flutter

  # UI
  cupertino_icons: ^1.0.8
  cached_network_image: ^3.2.3
  
  # State Management
  provider: ^6.0.5
  
  # Firebase
  firebase_core: ^2.32.0
  firebase_auth: ^4.20.0
  cloud_firestore: ^4.17.5
  firebase_storage: ^11.7.7
  firebase_messaging: ^14.9.4
  firebase_app_check: ^0.2.2+7
  
  # Maps (OpenStreetMap)
  flutter_map: ^7.0.2
  latlong2: ^0.9.1
  
  # Images
  image_picker: ^0.8.7+6
  
  # Utilitaires
  shared_preferences: ^2.0.15
  intl: ^0.18.1
  timeago: ^3.7.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
```

---

### Équivalents React Native

| Flutter Package | React Native Équivalent |
|----------------|-------------------------|
| `provider` | Redux, MobX, Zustand, Context API |
| `firebase_core` | `@react-native-firebase/app` |
| `firebase_auth` | `@react-native-firebase/auth` |
| `cloud_firestore` | `@react-native-firebase/firestore` |
| `firebase_storage` | `@react-native-firebase/storage` |
| `firebase_messaging` | `@react-native-firebase/messaging` |
| `flutter_map` | `react-native-maps` (avec provider OpenStreetMap) |
| `image_picker` | `react-native-image-picker` |
| `cached_network_image` | `react-native-fast-image` |
| `shared_preferences` | `@react-native-async-storage/async-storage` |
| `intl` | `date-fns`, `moment.js` |
| `timeago` | `timeago.js`, `date-fns` |

---

## 🎨 DESIGN SYSTEM & THÈMES

### AppTheme (`themes/app_theme.dart`)

**3 thèmes disponibles**:
1. **Light Theme** (Thème clair avec doré)
2. **Dark Theme** (Thème sombre avec doré)
3. **Green Theme** (Thème nature avec vert)

---

#### 1. Light Theme (Doré luxe)

**Couleurs**:
```dart
const _nightBlue = Color(0xFF0B1020);      // Bleu nuit (primary)
const _richGold = Color(0xFFD4AF37);       // Or riche (secondary)
const _warmChampagne = Color(0xFFE8DCC3);  // Champagne chaud
const _ivory = Color(0xFFF7F3E9);          // Ivoire (background)
const _deepCharcoal = Color(0xFF1B2233);   // Charbon profond
const _errorRed = Color(0xFFB3261E);       // Rouge erreur
```

**ColorScheme**:
```dart
ColorScheme.fromSeed(
  seedColor: _richGold,
  primary: _nightBlue,
  onPrimary: Colors.white,
  secondary: _richGold,
  onSecondary: _nightBlue,
  surface: Colors.white,
  onSurface: _nightBlue,
  background: _ivory,
  brightness: Brightness.light,
  error: _errorRed,
)
```

**Composants**:
- **AppBar**: Bleu nuit (`_nightBlue`)
- **ElevatedButton**: Fond or (`_richGold`), texte bleu nuit
- **Card**: Blanc avec ombre subtile
- **FAB**: Dégradé or
- **BottomNavigationBar**: Sélectionné = or

---

#### 2. Dark Theme (Doré élégant)

**Couleurs**:
```dart
const _darkNavy = Color(0xFF0D1B2A);       // Marine sombre (primary)
const _richGold = Color(0xFFD4AF37);       // Or riche (secondary)
const _charcoal = Color(0xFF1B2838);       // Charbon
const _deepGray = Color(0xFF2C3E50);       // Gris profond
const _slate = Color(0xFF34495E);          // Ardoise
```

**ColorScheme**:
```dart
ColorScheme.fromSeed(
  seedColor: _richGold,
  primary: _darkNavy,
  onPrimary: Colors.white,
  secondary: _richGold,
  onSecondary: _darkNavy,
  surface: _charcoal,
  onSurface: Colors.white,
  background: _deepGray,
  brightness: Brightness.dark,
)
```

---

#### 3. Green Theme (Nature moderne)

**Couleurs**:
```dart
const _forestGreen = Color(0xFF27AE60);    // Vert forêt (primary)
const _brightGreen = Color(0xFF27AE60);    // Vert éclatant (secondary)
const _mintCream = Color(0xFFE8F5E9);      // Crème menthe (background)
const _deepGreen = Color(0xFF1E8449);      // Vert profond
const _sage = Color(0xFF8BC34A);           // Sauge
```

**ColorScheme**:
```dart
ColorScheme.fromSeed(
  seedColor: _brightGreen,
  primary: _forestGreen,
  onPrimary: Colors.white,
  secondary: _brightGreen,
  onSecondary: Colors.white,
  surface: Colors.white,
  onSurface: _deepGreen,
  background: _mintCream,
  brightness: Brightness.light,
)
```

---

### Typography (TextTheme)

**Toutes les tailles**:
```dart
TextTheme(
  displayLarge: TextStyle(fontSize: 34, fontWeight: FontWeight.bold),
  displayMedium: TextStyle(fontSize: 30, fontWeight: FontWeight.bold),
  headlineLarge: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
  headlineMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
  titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
  titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
  bodyLarge: TextStyle(fontSize: 16),
  bodyMedium: TextStyle(fontSize: 14),
)
```

---

### Pour React Native

**Créer un fichier `theme.ts`**:
```typescript
export const lightTheme = {
  colors: {
    primary: '#0B1020',      // Night blue
    secondary: '#D4AF37',    // Rich gold
    background: '#F7F3E9',   // Ivory
    surface: '#FFFFFF',
    text: '#1B2233',
    textSecondary: '#6B7280',
    error: '#B3261E',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 24,
  },
  typography: {
    displayLarge: { fontSize: 34, fontWeight: 'bold' },
    headlineMedium: { fontSize: 22, fontWeight: '600' },
    titleLarge: { fontSize: 18, fontWeight: '600' },
    bodyLarge: { fontSize: 16, fontWeight: 'normal' },
    bodyMedium: { fontSize: 14, fontWeight: 'normal' },
  },
};

export const darkTheme = {
  colors: {
    primary: '#0D1B2A',
    secondary: '#D4AF37',
    background: '#2C3E50',
    surface: '#1B2838',
    text: '#FFFFFF',
    textSecondary: '#B0BEC5',
    error: '#EF5350',
  },
  // ... même structure
};

export const greenTheme = {
  colors: {
    primary: '#27AE60',
    secondary: '#27AE60',
    background: '#E8F5E9',
    surface: '#FFFFFF',
    text: '#1E8449',
    textSecondary: '#6B7280',
    error: '#D32F2F',
  },
  // ... même structure
};
```

**Utilisation avec Context API**:
```typescript
import { createContext, useContext } from 'react';

const ThemeContext = createContext(lightTheme);

export const ThemeProvider = ({ children, theme }) => (
  <ThemeContext.Provider value={theme}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
```

---

## 📌 CONSTANTES

### constants.dart
```dart
// Images par défaut
const String kDefaultPropertyImage = 'assets/images/default_property.png';
const String kDefaultUserAvatar = 'assets/images/default_avatar.png';

// URLs OpenStreetMap
const String kOSMTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const List<String> kOSMSubdomains = ['a', 'b', 'c'];

// Position par défaut (Tunis, Tunisie)
const double kDefaultLatitude = 36.8065;
const double kDefaultLongitude = 10.1815;

// Limites upload
const int kMaxImageSize = 5 * 1024 * 1024; // 5MB
const int kMaxImagesPerProperty = 5;

// Timeouts
const Duration kUploadTimeout = Duration(seconds: 120);
const Duration kQueryTimeout = Duration(seconds: 30);
```

---

## 🚀 GUIDE MIGRATION REACT NATIVE

### Étape 1: Setup React Native + Firebase

```bash
# Créer projet React Native avec TypeScript
npx react-native init ImmobilierApp --template react-native-template-typescript

# Installer Firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/storage
npm install @react-native-firebase/messaging

# Installer navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Installer maps
npm install react-native-maps

# Installer autres dépendances
npm install react-native-image-picker
npm install @react-native-async-storage/async-storage
npm install date-fns
npm install react-native-fast-image
```

---

### Étape 2: Structure du Projet React Native

```
ImmobilierApp/
├── src/
│   ├── models/
│   │   ├── Property.ts
│   │   ├── User.ts
│   │   └── Message.ts
│   │
│   ├── services/
│   │   ├── firestore.service.ts
│   │   ├── auth.service.ts
│   │   ├── storage.service.ts
│   │   └── fcm.service.ts
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   │
│   │   ├── details/
│   │   │   └── PropertyDetailScreen.tsx
│   │   │
│   │   ├── favorites/
│   │   │   └── FavoritesScreen.tsx
│   │   │
│   │   ├── messages/
│   │   │   ├── MessagesScreen.tsx
│   │   │   └── ChatScreen.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   └── ChangePasswordScreen.tsx
│   │   │
│   │   └── admin/
│   │       └── AdminScreen.tsx
│   │
│   ├── components/
│   │   ├── PropertyCardModern.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── LocationPicker.tsx
│   │   └── CustomBottomNav.tsx
│   │
│   ├── context/
│   │   ├── ThemeContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── UserContext.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── BottomTabNavigator.tsx
│   │
│   ├── theme/
│   │   └── theme.ts
│   │
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
│
├── android/
├── ios/
├── App.tsx
└── package.json
```

---

### Étape 3: Conversions Clés Flutter → React Native

#### StreamBuilder → useEffect + onSnapshot
```typescript
// Flutter
StreamBuilder<QuerySnapshot>(
  stream: FirebaseFirestore.instance
    .collection('properties')
    .where('status', isEqualTo: 'approved')
    .snapshots(),
  builder: (context, snapshot) {
    final properties = snapshot.data?.docs ?? [];
    return ListView.builder(...);
  },
)

// React Native
const [properties, setProperties] = useState<PropertyModel[]>([]);

useEffect(() => {
  const unsubscribe = firestore()
    .collection('properties')
    .where('status', '==', 'approved')
    .onSnapshot(querySnapshot => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PropertyModel));
      setProperties(data);
    });

  return () => unsubscribe();
}, []);

return <FlatList data={properties} renderItem={...} />;
```

#### Provider → Context API
```typescript
// AuthContext.tsx
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, ... }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

---

### Étape 4: Différences Majeures

| Concept | Flutter | React Native |
|---------|---------|--------------|
| UI | Widgets (StatelessWidget, StatefulWidget) | Components (Function Components) |
| State | setState(), Provider, ChangeNotifier | useState(), Context API, Redux |
| Styling | Theme, TextStyle, BoxDecoration | StyleSheet, Styled Components |
| Navigation | Navigator 1.0/2.0 | React Navigation |
| Async | async/await, Future, Stream | async/await, Promise, Observable |
| Lists | ListView, GridView | FlatList, SectionList |
| Images | Image.network, CachedNetworkImage | Image, FastImage |
| Maps | flutter_map (OpenStreetMap) | react-native-maps |
| Storage | SharedPreferences | AsyncStorage |

---

### Étape 5: Checklist Migration

- [ ] Configurer Firebase dans Android/iOS
- [ ] Créer modèles TypeScript (Property, User, Message)
- [ ] Implémenter services (Firestore, Auth, Storage, FCM)
- [ ] Créer Context Providers (Auth, Theme, User)
- [ ] Configurer React Navigation (Stack + Bottom Tabs)
- [ ] Créer tous les écrans (18 écrans au total)
- [ ] Implémenter composants réutilisables (PropertyCard, LocationPicker)
- [ ] Intégrer react-native-maps avec OpenStreetMap
- [ ] Configurer Firestore Security Rules
- [ ] Tester upload images
- [ ] Tester notifications FCM
- [ ] Implémenter système de thèmes (3 thèmes)
- [ ] Ajouter validation admin pour propriétés
- [ ] Tester messagerie en temps réel
- [ ] Optimiser performances (FlatList, memo, useMemo)

---

## 🎯 RÉSUMÉ TECHNIQUE

### Points Clés de l'Application

1. **Authentification**: Firebase Auth (email/password)
2. **Base de données**: Cloud Firestore (temps réel)
3. **Stockage**: Firebase Storage (images)
4. **Notifications**: FCM (push notifications)
5. **Cartes**: OpenStreetMap (flutter_map / react-native-maps)
6. **State Management**: Provider (Flutter) / Context API (React Native)
7. **Validation**: Workflow admin (pending → approved/rejected)
8. **Messagerie**: Temps réel avec Firestore subcollections
9. **Thèmes**: 3 thèmes (clair doré, sombre doré, vert nature)
10. **Design**: Material 3 (Flutter) / Custom (React Native)

---

### Collections Firestore

| Collection | Documents | Subcollections | Rôle |
|-----------|-----------|----------------|------|
| `properties` | Propriétés | - | Annonces immobilières |
| `users` | Utilisateurs | `favorites` | Profils utilisateurs |
| `chats` | Conversations | `messages` | Messagerie |

---

### Services Principaux

| Service | Méthodes Clés | Responsabilité |
|---------|---------------|----------------|
| `FirestoreService` | addProperty, streamProperties, addFavorite, sendMessage | CRUD Firestore |
| `AuthService` | signInWithEmail, signUpWithEmail, signOut | Authentification |
| `StorageService` | uploadFile, uploadBytes, deleteFile | Upload images |
| `FCMService` | initialize, subscribeToTopic | Notifications push |

---

**FIN DE LA DOCUMENTATION**

📄 **Autres parties**:
- [PARTIE 1: Structure & Navigation](./FLUTTER_DOCUMENTATION_PART1.md)
- [PARTIE 2: Code Source des Écrans](./FLUTTER_DOCUMENTATION_PART2.md)
- [PARTIE 3: Code Source Widgets & Services](./FLUTTER_DOCUMENTATION_PART3.md)

---

**Bonne chance pour votre migration React Native ! 🚀**
