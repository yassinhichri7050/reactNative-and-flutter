# 📱 DOCUMENTATION FLUTTER - PARTIE 1/4
## Application Immobilière - Structure & Architecture

---

## 📋 TABLE DES MATIÈRES

1. [Structure du Projet](#structure-du-projet)
2. [Architecture](#architecture)
3. [Liste Complète des Écrans](#liste-complète-des-écrans)
4. [Système de Navigation](#système-de-navigation)

---

## 🏗️ STRUCTURE DU PROJET

### Arborescence Complète de `lib/`

```
lib/
├── main.dart                          # Point d'entrée de l'application
├── constants.dart                     # Constantes globales (images par défaut, etc.)
├── firebase_options.dart              # Configuration Firebase générée automatiquement
│
├── models/                            # Modèles de données
│   ├── property_model.dart           # Modèle des propriétés immobilières
│   ├── user_model.dart               # Modèle utilisateur
│   └── message_model.dart            # Modèle de message (chat)
│
├── providers/                         # State Management avec Provider
│   ├── theme_provider.dart           # Gestion des thèmes (clair, sombre, vert)
│   └── user_provider.dart            # Gestion de l'état utilisateur
│
├── screens/                           # Tous les écrans de l'application
│   ├── splash_screen.dart            # Écran de démarrage
│   ├── onboarding_screen.dart        # Écran d'introduction
│   ├── main_page_wrapper.dart        # Conteneur principal avec bottom navigation
│   │
│   ├── auth/                         # Écrans d'authentification
│   │   ├── login_page.dart
│   │   ├── register_page.dart
│   │   └── forgot_password_page.dart
│   │
│   ├── home/                         # Page d'accueil
│   │   └── home_page.dart
│   │
│   ├── details/                      # Détails des propriétés
│   │   └── property_detail_page.dart
│   │
│   ├── add_property/                 # Ajout/modification de propriétés
│   │   └── add_property_page.dart
│   │
│   ├── favorites/                    # Favoris utilisateur
│   │   └── favorites_page.dart
│   │
│   ├── messages/                     # Liste des conversations
│   │   └── messages_page.dart
│   │
│   ├── chat/                         # Conversation individuelle
│   │   └── chat_page.dart
│   │
│   ├── profile/                      # Profil utilisateur
│   │   ├── profile_page.dart
│   │   ├── edit_profile_page.dart
│   │   └── change_password_page.dart
│   │
│   ├── admin/                        # Panneau administration
│   │   └── admin_page.dart
│   │
│   ├── search/                       # Recherche et filtres
│   │   └── search_page.dart
│   │
│   └── about_page.dart               # À propos de l'application
│
├── services/                          # Services métier
│   ├── auth_service.dart             # Authentification Firebase
│   ├── firestore_service.dart        # CRUD Firestore
│   ├── storage_service.dart          # Upload images Firebase Storage
│   ├── fcm_service.dart              # Notifications push Firebase
│   ├── messaging_service.dart        # Service de messagerie (obsolète)
│   └── seed_service.dart             # Données de test
│
├── widgets/                           # Composants réutilisables
│   ├── property_card.dart            # Carte propriété (ancien design)
│   ├── property_card_modern.dart     # Carte propriété moderne (2 colonnes)
│   ├── custom_bottom_nav.dart        # Bottom navigation personnalisée
│   ├── location_picker.dart          # Sélecteur de localisation avec carte
│   ├── image_picker_widget.dart      # Widget de sélection d'image
│   ├── loader.dart                   # Indicateur de chargement
│   └── bottom_nav.dart               # Navigation bar (obsolète)
│
└── themes/                            # Système de design
    └── app_theme.dart                # Thèmes Material 3 (clair, sombre, vert)
```

---

## 🏛️ ARCHITECTURE

### Pattern Utilisé: **MVVM (Model-View-ViewModel)** avec Provider

#### Couches de l'architecture:

1. **Models (`lib/models/`)**: 
   - Classes de données pures
   - Méthodes `fromMap()` / `toMap()` pour Firestore
   - Logique métier minimale

2. **Services (`lib/services/`)**:
   - Logique métier complexe
   - Communication avec Firebase (Auth, Firestore, Storage, FCM)
   - Isolation des appels API

3. **Providers (`lib/providers/`)**:
   - State management avec ChangeNotifier
   - Réactivité de l'UI aux changements d'état

4. **Screens (`lib/screens/`)**:
   - UI uniquement
   - Consomment les Providers via `Provider.of<T>(context)`
   - StatefulWidget quand état local nécessaire

5. **Widgets (`lib/widgets/`)**:
   - Composants réutilisables
   - Acceptent des callbacks pour communication parent-enfant

---

## 📱 LISTE COMPLÈTE DES ÉCRANS

### 1. **SplashScreen** (`splash_screen.dart`)
- **Type**: StatefulWidget
- **Rôle**: Écran de chargement au démarrage
- **Fonctionnalités**:
  - Affiche le logo de l'application
  - Vérifie l'état d'authentification
  - Redirection automatique après 2 secondes
- **Navigation**:
  - Départ → `SplashScreen`
  - Si première visite → `OnboardingScreen`
  - Si non authentifié → `LoginPage`
  - Si authentifié → `MainPageWrapper`
- **Widgets principaux**: CircularProgressIndicator, Image.asset, Timer

---

### 2. **OnboardingScreen** (`onboarding_screen.dart`)
- **Type**: StatefulWidget
- **Rôle**: Introduction de l'application pour nouveaux utilisateurs
- **Fonctionnalités**:
  - Carrousel de 3 slides explicatifs
  - Bouton "Suivant" / "Passer"
  - Sauvegarde dans SharedPreferences (vue une fois)
- **Navigation**:
  - Départ → `SplashScreen`
  - Arrivée → `LoginPage`
- **Widgets principaux**: PageView, PageIndicator, TextButton

---

### 3. **LoginPage** (`auth/login_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Connexion utilisateur
- **Fonctionnalités**:
  - Champs email/password
  - Validation des champs
  - Affichage/masquage mot de passe
  - Lien "Mot de passe oublié"
  - Lien "S'inscrire"
- **Navigation**:
  - Départ → `SplashScreen` / `OnboardingScreen`
  - Vers → `RegisterPage`, `ForgotPasswordPage`, `MainPageWrapper` (après connexion)
- **Services utilisés**: AuthService
- **Widgets principaux**: TextField, ElevatedButton, CircularProgressIndicator
- **État géré**: Controllers (email, password), loading state

---

### 4. **RegisterPage** (`auth/register_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Inscription nouvel utilisateur
- **Fonctionnalités**:
  - Champs: nom, email, téléphone, mot de passe, confirmation
  - Validation (email valide, mots de passe identiques)
  - Création compte Firebase Auth + document Firestore users
- **Navigation**:
  - Départ → `LoginPage`
  - Arrivée → `MainPageWrapper` (après inscription)
- **Services utilisés**: AuthService, FirestoreService
- **Widgets principaux**: TextField, ElevatedButton, Form, FormValidator

---

### 5. **ForgotPasswordPage** (`auth/forgot_password_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Réinitialisation mot de passe
- **Fonctionnalités**:
  - Champ email
  - Envoi email de réinitialisation Firebase Auth
  - Message de confirmation
- **Navigation**:
  - Départ → `LoginPage`
  - Arrivée → `LoginPage` (après envoi)
- **Services utilisés**: AuthService
- **Widgets principaux**: TextField, ElevatedButton, SnackBar

---

### 6. **MainPageWrapper** (`main_page_wrapper.dart`)
- **Type**: StatefulWidget
- **Rôle**: Conteneur principal avec bottom navigation bar
- **Fonctionnalités**:
  - Navigation entre 5 onglets: Accueil, Favoris, Messages, Profil
  - FloatingActionButton central pour ajouter une propriété
  - AppBar avec titre dynamique selon l'onglet
  - Bouton déconnexion dans onglet Profil
- **Navigation**: Hub central de l'application
- **Services utilisés**: AuthService, FCMService, UserProvider
- **Widgets principaux**: Scaffold, BottomNavigationBar, FloatingActionButton, IndexedStack
- **Pages affichées**:
  - Index 0: HomePage
  - Index 1: FavoritesPage
  - Index 2: MessagesPage
  - Index 3: ProfilePage
  - Index 4: AddPropertyPage (via FAB)

---

### 7. **HomePage** (`home/home_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Page d'accueil avec liste des propriétés
- **Fonctionnalités**:
  - Barre de recherche (cliquable → `/search`)
  - 4 boutons filtres: Type, Prix, But (louer/vendre), Filtres avancés
  - Compteur "X annonces"
  - Grille 2 colonnes de cartes PropertyCardModern
  - Pull-to-refresh
  - Filtres en temps réel (StreamBuilder)
  - Toggle favoris directement sur cartes
- **Navigation**:
  - Départ → `MainPageWrapper` (index 0)
  - Vers → `SearchPage`, `PropertyDetailPage`
- **Services utilisés**: FirestoreService, AuthService
- **Widgets principaux**: CustomScrollView, SliverGrid, StreamBuilder, RefreshIndicator, PropertyCardModern
- **État géré**: 
  - `_selectedPurpose` ('all', 'rent', 'sale')
  - `_selectedType` ('all', 'Maison', 'Appartement', etc.)
  - `_favoriteIds` (Set<String>)

---

### 8. **SearchPage** (`search/search_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Recherche avancée de propriétés
- **Fonctionnalités**:
  - Champ de recherche par mots-clés
  - Filtres: Type, Prix min/max, Surface minimale
  - Liste des résultats en temps réel
  - Pas de résultats → message empty state
- **Navigation**:
  - Départ → `HomePage` (barre recherche)
  - Vers → `PropertyDetailPage`
- **Services utilisés**: FirestoreService
- **Widgets principaux**: TextField, StreamBuilder, ListView, PropertyCard
- **État géré**: Controllers (keyword, minPrice, maxPrice), selectedType

---

### 9. **PropertyDetailPage** (`details/property_detail_page.dart`)
- **Type**: StatelessWidget (reçoit PropertyModel en argument)
- **Rôle**: Page détaillée d'une propriété
- **Fonctionnalités**:
  - Carrousel d'images (PageView)
  - Informations: titre, description, prix, surface, pièces, type, localisation
  - Carte interactive FlutterMap (OpenStreetMap) avec marqueur
  - Bouton "Contacter le vendeur" → Crée/ouvre chat
  - Bouton favoris
  - Bouton partage (futur)
- **Navigation**:
  - Départ → `HomePage`, `SearchPage`, `FavoritesPage`, `ProfilePage`
  - Vers → `ChatPage` (contact vendeur)
- **Services utilisés**: FirestoreService (chat), AuthService
- **Widgets principaux**: PageView, FlutterMap, ElevatedButton, Icon, Hero animation

---

### 10. **AddPropertyPage** (`add_property/add_property_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Ajout/modification d'une propriété
- **Fonctionnalités**:
  - Formulaire complet: titre, description, prix, type, purpose (louer/vendre), surface, pièces, localisation
  - Sélecteur de localisation GPS (LocationPicker avec carte)
  - Upload multiple d'images (jusqu'à 5)
  - Validation admin obligatoire (status = 'pending')
  - Message de confirmation après soumission
- **Navigation**:
  - Départ → `MainPageWrapper` (FAB central)
  - Arrivée → `MainPageWrapper` (après ajout)
- **Services utilisés**: FirestoreService, StorageService, AuthService
- **Widgets principaux**: TextField, DropdownButton, ElevatedButton, LocationPicker, ImagePickerWidget
- **État géré**: Controllers (titre, description, prix...), selectedType, selectedPurpose, images list, loading

---

### 11. **FavoritesPage** (`favorites/favorites_page.dart`)
- **Type**: StatelessWidget
- **Rôle**: Liste des propriétés favorites de l'utilisateur
- **Fonctionnalités**:
  - Liste scrollable des favoris
  - StreamBuilder sur collection users/{uid}/favorites
  - Chaque favori récupère PropertyModel depuis Firestore
  - Bouton pour retirer des favoris
  - Empty state si aucun favori
- **Navigation**:
  - Départ → `MainPageWrapper` (index 1)
  - Vers → `PropertyDetailPage`
- **Services utilisés**: FirestoreService
- **Widgets principaux**: StreamBuilder, ListView, PropertyCard, FutureBuilder
- **Empty state**: "Aucun favori pour le moment"

---

### 12. **MessagesPage** (`messages/messages_page.dart`)
- **Type**: StatelessWidget
- **Rôle**: Liste des conversations (chats)
- **Fonctionnalités**:
  - StreamBuilder sur collection chats (where participants contains currentUserId)
  - Déduplication des conversations par utilisateur (garde la plus récente)
  - Affiche: avatar, nom utilisateur, dernier message, timestamp
  - Badge "Commencer la conversation" si chat vide
  - Tri par lastMessageTime décroissant
- **Navigation**:
  - Départ → `MainPageWrapper` (index 2)
  - Vers → `ChatPage`
- **Services utilisés**: FirestoreService, AuthService
- **Widgets principaux**: StreamBuilder, ListView, ListTile, CircleAvatar, timeago package

---

### 13. **ChatPage** (`chat/chat_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Conversation individuelle avec un utilisateur
- **Fonctionnalités**:
  - Récupère chatId depuis arguments de navigation
  - StreamBuilder sur chats/{chatId}/messages
  - Affichage bulles de messages (sender à droite, receiver à gauche)
  - Champ de saisie avec bouton envoi
  - Auto-scroll vers dernier message
  - Timestamp des messages
  - Empty state avec icône si aucun message
- **Navigation**:
  - Départ → `MessagesPage`, `PropertyDetailPage` (contact vendeur)
  - Retour → Page précédente
- **Services utilisés**: FirestoreService (sendMessage, streamChatMessages)
- **Widgets principaux**: StreamBuilder, ListView, TextField, IconButton, Container (bulles)
- **État géré**: TextEditingController (message), ScrollController

---

### 14. **ProfilePage** (`profile/profile_page.dart`)
- **Type**: StatelessWidget
- **Rôle**: Profil utilisateur
- **Fonctionnalités**:
  - Header avec avatar, nom, email, téléphone
  - Bouton changement de thème (3 thèmes disponibles)
  - Section "Mes annonces" (StreamBuilder sur properties where userId)
  - Liste PropertyCard horizontale (scroll)
  - Bouton "Administration" (si isAdmin = true dans Firestore)
  - Boutons: Modifier profil, Changer mot de passe
  - Lien "À propos"
- **Navigation**:
  - Départ → `MainPageWrapper` (index 3)
  - Vers → `EditProfilePage`, `ChangePasswordPage`, `AboutPage`, `AdminPage`, `PropertyDetailPage`
- **Services utilisés**: FirestoreService, AuthService, UserProvider, ThemeProvider
- **Widgets principaux**: StreamBuilder, ListView, ElevatedButton, CircleAvatar, PropertyCard

---

### 15. **EditProfilePage** (`profile/edit_profile_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Modification des informations du profil
- **Fonctionnalités**:
  - Champs: nom, téléphone, localisation
  - Sauvegarde dans Firestore users/{uid}
  - Message de confirmation
- **Navigation**:
  - Départ → `ProfilePage`
  - Retour → `ProfilePage`
- **Services utilisés**: FirestoreService, UserProvider
- **Widgets principaux**: TextField, ElevatedButton, Form
- **État géré**: Controllers (displayName, phone, location)

---

### 16. **ChangePasswordPage** (`profile/change_password_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Changement du mot de passe
- **Fonctionnalités**:
  - Champs: nouveau mot de passe, confirmation
  - Validation (mots de passe identiques, longueur minimale)
  - Appel Firebase Auth updatePassword
- **Navigation**:
  - Départ → `ProfilePage`
  - Retour → `ProfilePage`
- **Services utilisés**: AuthService
- **Widgets principaux**: TextField, ElevatedButton, Form

---

### 17. **AdminPage** (`admin/admin_page.dart`)
- **Type**: StatefulWidget
- **Rôle**: Panneau d'administration (validation des propriétés)
- **Fonctionnalités**:
  - Liste des propriétés en attente (status = 'pending')
  - Boutons: Approuver, Rejeter, Supprimer
  - Filtres: Tous, En attente, Approuvés, Rejetés
  - Statistiques: Total propriétés, En attente, Approuvés
  - Seuls les admins y ont accès (isAdmin = true dans Firestore)
- **Navigation**:
  - Départ → `ProfilePage` (bouton Admin)
  - Vers → `PropertyDetailPage`
- **Services utilisés**: FirestoreService (updatePropertyStatus, deleteProperty)
- **Widgets principaux**: StreamBuilder, ListView, PropertyCard, Chip, AlertDialog
- **État géré**: selectedFilter, statistics

---

### 18. **AboutPage** (`about_page.dart`)
- **Type**: StatelessWidget
- **Rôle**: Informations sur l'application
- **Fonctionnalités**:
  - Nom de l'application
  - Version
  - Description
  - Lien contact
  - Mentions légales
- **Navigation**:
  - Départ → `ProfilePage`
  - Retour → `ProfilePage`
- **Widgets principaux**: ListTile, Card, Icon

---

## 🧭 SYSTÈME DE NAVIGATION

### Type: **Navigator 1.0** (Routes nommées)

### Configuration dans `main.dart`:

```dart
MaterialApp(
  initialRoute: '/splash',
  routes: {
    '/splash': (_) => const SplashScreen(),
    '/onboarding': (_) => const OnboardingScreen(),
    '/': (_) => const AuthWrapper(),
    '/login': (_) => const LoginPage(),
    '/register': (_) => const RegisterPage(),
    '/forgot_password': (_) => const ForgotPasswordPage(),
    '/home': (_) => const MainPageWrapper(),
    '/property_detail': (_) => const PropertyDetailPage(),
    '/search': (_) => Scaffold(
      appBar: AppBar(title: const Text('Rechercher')),
      body: const SearchPage(),
    ),
    '/chat': (_) => const ChatPage(),
    '/edit_profile': (_) => const EditProfilePage(),
    '/change_password': (_) => const ChangePasswordPage(),
    '/about': (_) => const AboutPage(),
    '/admin': (_) => const AdminPage(),
  },
)
```

### Bottom Navigation (MainPageWrapper):

| Index | Page           | Icon              |
|-------|----------------|-------------------|
| 0     | HomePage       | home              |
| 1     | FavoritesPage  | favorite          |
| 2     | MessagesPage   | message           |
| 3     | ProfilePage    | person            |
| FAB   | AddPropertyPage| add (floating)    |

### Navigation avec arguments:

```dart
// PropertyDetailPage
Navigator.pushNamed(
  context,
  '/property_detail',
  arguments: propertyModel,
);

// ChatPage
Navigator.pushNamed(
  context,
  '/chat',
  arguments: otherUserId,
);
```

### AuthWrapper:

```dart
// Gère la redirection auto selon l'état d'authentification
class AuthWrapper extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);
    if (auth.isSignedIn) {
      return const MainPageWrapper();
    }
    return const LoginPage();
  }
}
```

### Flow de navigation typique:

```
SplashScreen (2s)
   ↓
   ├── Première visite → OnboardingScreen → LoginPage
   │
   ├── Non authentifié → LoginPage
   │   ├── S'inscrire → RegisterPage → MainPageWrapper
   │   ├── Mot de passe oublié → ForgotPasswordPage → LoginPage
   │   └── Connexion réussie → MainPageWrapper
   │
   └── Authentifié → MainPageWrapper
       ├── Tab 0: HomePage
       │   ├── Recherche → SearchPage → PropertyDetailPage
       │   └── Carte propriété → PropertyDetailPage
       │       └── Contacter → ChatPage
       │
       ├── Tab 1: FavoritesPage → PropertyDetailPage
       │
       ├── Tab 2: MessagesPage → ChatPage
       │
       ├── Tab 3: ProfilePage
       │   ├── Modifier profil → EditProfilePage
       │   ├── Changer mot de passe → ChangePasswordPage
       │   ├── Administration (admin) → AdminPage
       │   ├── À propos → AboutPage
       │   └── Mes annonces → PropertyDetailPage
       │
       └── FAB: AddPropertyPage
           └── LocationPicker (sélection GPS)
```

---

## 📊 STATISTIQUES DU PROJET

- **Total écrans**: 18 écrans
- **StatefulWidget**: 12 (gestion d'état local)
- **StatelessWidget**: 6 (UI pure)
- **Routes nommées**: 13 routes
- **Services**: 6 services
- **Modèles**: 3 modèles principaux
- **Widgets réutilisables**: 7 widgets
- **Providers**: 3 providers (AuthService, UserProvider, ThemeProvider)

---

**📄 Continuer avec**: 
- [PARTIE 2: Code Source des Écrans](./FLUTTER_DOCUMENTATION_PART2.md)
- [PARTIE 3: Code Source Widgets & Services](./FLUTTER_DOCUMENTATION_PART3.md)
- [PARTIE 4: Modèles, Firebase, Design System](./FLUTTER_DOCUMENTATION_PART4.md)
