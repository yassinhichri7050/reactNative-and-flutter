# Architecture C4 - Application Immobilier

## Niveau 1 : Diagramme de Contexte (Context)

```
┌─────────────────────────────────────────────────────────────┐
│                     Système Immobilier                       │
│                                                              │
│  Application mobile/web pour la gestion et la recherche     │
│  de biens immobiliers avec messagerie intégrée              │
└─────────────────────────────────────────────────────────────┘
                          ▲          ▲
                          │          │
                          │          │
                ┌─────────┴──┐   ┌──┴──────────┐
                │ Utilisateur │   │ Propriétaire│
                │   Final     │   │  / Vendeur  │
                └─────────────┘   └─────────────┘
                          │          │
                          ▼          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Services Externes                          │
├─────────────────────────────────────────────────────────────┤
│  - Firebase Authentication                                   │
│  - Cloud Firestore (Base de données)                        │
│  - Firebase Storage (Images)                                │
│  - Firebase Cloud Messaging (Notifications)                 │
└─────────────────────────────────────────────────────────────┘
```

### Acteurs
- **Utilisateur Final**: Recherche, consulte et ajoute des propriétés en favoris
- **Propriétaire/Vendeur**: Publie et gère ses annonces immobilières
- **Système Firebase**: Gère l'authentification, le stockage et les notifications

---

## Niveau 2 : Diagramme des Conteneurs (Containers)

```
┌───────────────────────────────────────────────────────────────────┐
│                    Application Flutter                            │
│                   (Mobile & Web Client)                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │   UI Layer      │  │  Business Logic  │  │   Data Layer    │ │
│  │   (Screens)     │◄─┤   (Providers)    │◄─┤   (Services)    │ │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘ │
│         │                      │                      │          │
└─────────┼──────────────────────┼──────────────────────┼──────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Backend Services                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Firestore DB │  │   Storage    │  │     Auth     │         │
│  │ (NoSQL)      │  │  (Images)    │  │  (Firebase)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │     FCM      │  │   Firestore  │                            │
│  │(Notifications)│  │    Rules     │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### Conteneurs Principaux

1. **Application Flutter Client**
   - Type: Application mobile/web
   - Technologie: Flutter/Dart
   - Responsabilité: Interface utilisateur et logique métier client

2. **Firebase Backend**
   - Type: Backend as a Service (BaaS)
   - Technologie: Firebase (Google Cloud)
   - Responsabilité: Stockage, authentification, notifications

---

## Niveau 3 : Diagramme des Composants (Components)

### Architecture de l'Application Flutter

```
┌──────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📱 Screens (UI Components)                                      │
│  ├── auth/                                                       │
│  │   ├── LoginScreen                                            │
│  │   ├── RegisterScreen                                         │
│  │   └── OnboardingScreen                                       │
│  │                                                               │
│  ├── home/                                                       │
│  │   ├── HomeScreen                                             │
│  │   └── PropertyDetailsScreen                                  │
│  │                                                               │
│  ├── property/                                                   │
│  │   ├── AddPropertyScreen                                      │
│  │   └── PropertyDetailScreen                                   │
│  │                                                               │
│  ├── chat/                                                       │
│  │   ├── ChatScreen                                             │
│  │   └── ChatConversationScreen                                 │
│  │                                                               │
│  ├── profile/                                                    │
│  │   ├── ProfileScreen                                          │
│  │   └── AboutPage                                              │
│  │                                                               │
│  └── favorites/                                                  │
│      └── FavoritesPage                                          │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT LAYER                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🔄 Providers (State Management)                                 │
│  ├── UserProvider          → Gère l'état de l'utilisateur       │
│  ├── ThemeProvider         → Gère le thème de l'app             │
│  └── [Autres providers]                                         │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🎯 Services (Business Logic)                                    │
│  ├── AuthService           → Authentification utilisateur       │
│  ├── FirestoreService      → CRUD Firestore                     │
│  ├── StorageService        → Upload/téléchargement images       │
│  ├── MessagingService      → Gestion des messages               │
│  ├── FCMService            → Notifications push                 │
│  └── SeedService           → Initialisation données             │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📦 Models (Data Structures)                                     │
│  ├── PropertyModel         → Modèle de propriété                │
│  ├── UserModel             → Modèle d'utilisateur               │
│  └── MessageModel          → Modèle de message                  │
│                                                                   │
│  🎨 Themes                                                        │
│  └── AppTheme              → Configuration du thème             │
│                                                                   │
│  ⚙️ Configuration                                                │
│  ├── constants.dart        → Constantes de l'app                │
│  └── firebase_options.dart → Configuration Firebase             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Niveau 4 : Diagramme de Code (Code)

### 1. Modèle de Données - PropertyModel

```dart
class PropertyModel {
  // Identifiants
  final String id;
  final String userId;        // Propriétaire
  
  // Informations de base
  final String title;
  final String description;
  final String type;          // appartement, maison, terrain
  final String status;        // à vendre, à louer
  
  // Détails financiers
  final double price;
  final String currency;
  
  // Localisation
  final String address;
  final String city;
  final String governorate;
  final GeoPoint? location;
  
  // Caractéristiques
  final int bedrooms;
  final int bathrooms;
  final double surface;
  
  // Médias
  final List<String> images;
  final String? videoUrl;
  
  // Métadonnées
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isActive;
  final int views;
  
  // Méthodes
  factory PropertyModel.fromFirestore(DocumentSnapshot doc);
  Map<String, dynamic> toFirestore();
}
```

### 2. Service - FirestoreService

```dart
class FirestoreService {
  final FirebaseFirestore _firestore;
  
  // Collections
  static const String PROPERTIES = 'properties';
  static const String USERS = 'users';
  static const String MESSAGES = 'messages';
  static const String FAVORITES = 'favorites';
  
  // CRUD Operations
  Future<void> addProperty(PropertyModel property);
  Future<void> updateProperty(String id, Map<String, dynamic> data);
  Future<void> deleteProperty(String id);
  Future<PropertyModel?> getProperty(String id);
  Stream<List<PropertyModel>> getProperties();
  
  // Recherche et filtres
  Stream<List<PropertyModel>> searchProperties({
    String? type,
    String? city,
    double? minPrice,
    double? maxPrice,
  });
  
  // Favoris
  Future<void> addToFavorites(String userId, String propertyId);
  Future<void> removeFromFavorites(String userId, String propertyId);
  Stream<List<PropertyModel>> getFavorites(String userId);
}
```

### 3. Architecture des Écrans - HomeScreen

```dart
class HomeScreen extends StatefulWidget {
  // State
  - _searchController: TextEditingController
  - _selectedType: String?
  - _selectedCity: String?
  
  // Lifecycle
  + build(BuildContext context): Widget
  + initState(): void
  + dispose(): void
  
  // Méthodes privées
  - _buildSearchBar(): Widget
  - _buildFilters(): Widget
  - _buildPropertyList(): Widget
  - _buildPropertyCard(PropertyModel): Widget
  
  // Handlers
  - _onSearch(String query): void
  - _onFilterChanged(): void
  - _onPropertyTap(PropertyModel): void
}
```

---

## Flux de Données

### 1. Ajout d'une Propriété

```
Utilisateur → AddPropertyScreen
    ↓
    Formulaire de saisie
    ↓
Validation des données
    ↓
StorageService.uploadImages() → Firebase Storage
    ↓
FirestoreService.addProperty() → Firestore DB
    ↓
Mise à jour UI & Navigation
    ↓
FCMService.notifyNewProperty() → Notification
```

### 2. Authentification

```
Utilisateur → LoginScreen
    ↓
AuthService.signIn(email, password)
    ↓
Firebase Authentication
    ↓
UserProvider.setUser(UserModel)
    ↓
Navigation → HomeScreen
```

### 3. Messagerie en Temps Réel

```
User A → ChatConversationScreen
    ↓
MessagingService.sendMessage()
    ↓
Firestore → Collection 'messages'
    ↓
Stream → User B ChatScreen
    ↓
FCMService → Push Notification
```

---

## Structure de la Base de Données Firestore

### Collections Principales

```
firestore/
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── name: string
│       ├── phone: string
│       ├── photoUrl: string
│       ├── role: string (user/admin)
│       ├── createdAt: timestamp
│       └── fcmToken: string
│
├── properties/
│   └── {propertyId}/
│       ├── userId: string (ref)
│       ├── title: string
│       ├── description: string
│       ├── type: string
│       ├── price: number
│       ├── address: string
│       ├── city: string
│       ├── images: array<string>
│       ├── bedrooms: number
│       ├── bathrooms: number
│       ├── surface: number
│       ├── location: geopoint
│       ├── createdAt: timestamp
│       └── isActive: boolean
│
├── favorites/
│   └── {favoriteId}/
│       ├── userId: string (ref)
│       ├── propertyId: string (ref)
│       └── createdAt: timestamp
│
└── messages/
    └── {conversationId}/
        └── messages/
            └── {messageId}/
                ├── senderId: string (ref)
                ├── receiverId: string (ref)
                ├── text: string
                ├── imageUrl: string
                ├── createdAt: timestamp
                └── isRead: boolean
```

---

## Règles de Sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Properties
    match /properties/{propertyId} {
      allow read: if true; // Public
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Favorites
    match /favorites/{favoriteId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Messages
    match /messages/{conversationId}/messages/{messageId} {
      allow read: if request.auth.uid in [
        resource.data.senderId,
        resource.data.receiverId
      ];
      allow create: if request.auth.uid == request.resource.data.senderId;
    }
  }
}
```

---

## Dépendances Principales

### pubspec.yaml

```yaml
dependencies:
  # Framework
  flutter: sdk: flutter
  
  # State Management
  provider: ^6.1.1
  
  # Firebase
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  cloud_firestore: ^4.13.6
  firebase_storage: ^11.5.6
  firebase_messaging: ^14.7.10
  
  # UI/UX
  google_fonts: ^6.1.0
  
  # Utilitaires
  image_picker: ^1.0.7
  intl: ^0.18.1
```

---

## Patterns et Principes

### Design Patterns Utilisés

1. **Provider Pattern**
   - Gestion d'état réactive
   - Séparation des préoccupations

2. **Repository Pattern**
   - Services abstrait l'accès aux données
   - Facilite les tests unitaires

3. **Factory Pattern**
   - Création de modèles depuis Firestore
   - Sérialisation/Désérialisation

4. **Observer Pattern**
   - Streams Firestore
   - Mise à jour en temps réel

### Principes SOLID

- **S**: Chaque service a une responsabilité unique
- **O**: Extensions possibles sans modification
- **L**: Les modèles respectent les contrats
- **I**: Interfaces ségrégées par fonctionnalité
- **D**: Dépendance aux abstractions (Provider)

---

## Flux Utilisateur Principaux

### 1. Parcours d'Inscription

```
SplashScreen → OnboardingScreen → RegisterScreen → HomeScreen
```

### 2. Recherche de Propriété

```
HomeScreen → [Filtres] → PropertyList → PropertyDetailScreen → [Contact/Favoris]
```

### 3. Publication d'Annonce

```
HomeScreen → AddPropertyScreen → [Images + Formulaire] → FirestoreService → HomeScreen
```

### 4. Messagerie

```
PropertyDetailScreen → ChatScreen → ConversationList → ChatConversationScreen
```

---

## Déploiement et Configuration

### Environnements

- **Development**: Firebase Project (Dev)
- **Production**: Firebase Project (Prod)

### Plateformes Supportées

- ✅ Web (Chrome, Edge)
- ✅ Android
- ✅ iOS
- ✅ Windows Desktop
- ✅ macOS
- ✅ Linux

---

## Métriques et Performances

### Optimisations

1. **Chargement paresseux** des images
2. **Pagination** des listes de propriétés
3. **Cache** Firestore pour mode hors ligne
4. **Indexation** Firestore pour recherches rapides
5. **Compression** des images avant upload

---

## Sécurité

### Mesures Implémentées

1. **Authentification** Firebase
2. **Règles Firestore** strictes
3. **Validation** côté client et serveur
4. **Token FCM** sécurisés
5. **HTTPS** obligatoire

---

## Évolutions Futures

1. **Géolocalisation** avec cartes interactives
2. **Paiement en ligne** intégré
3. **Système de notation** des propriétaires
4. **Visites virtuelles** 360°
5. **IA** pour recommandations personnalisées

---

*Document généré le 3 décembre 2025*
*Version de l'application: 1.0.0*
