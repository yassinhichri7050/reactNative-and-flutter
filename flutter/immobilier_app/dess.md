# Spécifications complètes de l’application Gold Meuble

Ce fichier résume tout ce qui a été mis en place dans l’application **Gold Meuble** : design global, écrans, logique métier, Firestore, messagerie, promotions, cartes, images par défaut, interface admin, etc.

Tu peux le donner à un développeur ou à un agent IA pour (re)implémenter ou maintenir l’application.

---

## 0. Fondations globales

### 0.1. Thème global & couleurs

- Couleur or principale : `Color(0xFFD4AF37)`  
- Couleur de fond claire (beige/crème) pour tout le reste.
- Texte principal : presque noir (`Colors.black87`).
- AppBar sur les écrans principaux : fond or + texte blanc centré.

**Fichiers/Widgets concernés :**

- `lib/main.dart`
- `lib/themes/app_theme.dart` (ou équivalent)
- `ThemeProvider` (gestion clair/sombre/vert)

**Exemple :**

```dart
final kGoldColor = const Color(0xFFD4AF37);

ThemeData buildLightTheme() {
  return ThemeData(
    scaffoldBackgroundColor: const Color(0xFFF8F3E9),
    primaryColor: kGoldColor,
    colorScheme: ColorScheme.fromSeed(
      seedColor: kGoldColor,
      primary: kGoldColor,
      secondary: kGoldColor,
      brightness: Brightness.light,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFFD4AF37),
      foregroundColor: Colors.white,
      centerTitle: true,
      elevation: 0,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: Color(0xFFD4AF37),
      unselectedItemColor: Colors.grey,
      type: BottomNavigationBarType.fixed,
      showUnselectedLabels: true,
    ),
  );
}
```

---

### 0.2. Image par défaut

**But :** aucune carte / détail ne doit afficher une image cassée.

**Constante :** `lib/constants.dart`

```dart
const String kDefaultPropertyImage =
    'https://via.placeholder.com/500x400?text=Property+Image';
```

Utilisation type :

```dart
final imageUrl = property.images.isNotEmpty
    ? property.images.first
    : kDefaultPropertyImage;
```

---

### 0.3. Modèle de données & création d’annonce

**Fichier :** `lib/models/property_model.dart`

Champs importants (adapter aux vrais noms) :

```dart
class PropertyModel {
  final String id;
  final String title;
  final String description;
  final double price;
  final String type;      // "Maison", "Appartement", ...
  final String purpose;   // "rent" ou "sale"
  final double? surface;
  final String? location;
  final double? latitude;
  final double? longitude;
  final List<String> images;
  final String userId;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int? rooms;
  final bool isFeatured;
  final bool isPromo;
  final double? promoPrice;
  final String status;        // pending, approved, rejected
  final Timestamp? submittedAt;
  final String? reviewedBy;
  final Timestamp? reviewedAt;
  // ...
}
```

`fromMap` doit être robuste (`??`, cast `as num`, etc.)

**Création Firestore :** `lib/services/firestore_service.dart`

- si aucune image → `[kDefaultPropertyImage]`
- `status = 'pending'`
- timestamps via `FieldValue.serverTimestamp()`.

```dart
Future<DocumentReference> addProperty(Map<String, dynamic> data) async {
  final List<String> images = (data['images'] != null && (data['images'] as List).isNotEmpty)
      ? List<String>.from(data['images'] as List)
      : [kDefaultPropertyImage];

  final safeData = <String, dynamic>{
    'title': data['title'] ?? '',
    'description': data['description'] ?? '',
    'price': (data['price'] ?? 0.0),
    'type': data['type'] ?? 'Appartement',
    'purpose': data['purpose'] ?? 'sale',
    'surface': data['surface'],
    'location': data['location'],
    'latitude': data['latitude'],
    'longitude': data['longitude'],
    'images': images,
    'userId': data['userId'] ?? '',
    'rooms': data['rooms'],
    'isFeatured': data['isFeatured'] ?? false,
    'isPromo': data['isPromo'] ?? false,
    'promoPrice': data['promoPrice'],
    'status': 'pending',
    'createdAt': FieldValue.serverTimestamp(),
    'submittedAt': FieldValue.serverTimestamp(),
    'reviewedBy': null,
    'reviewedAt': null,
  };

  return await propertiesRef.add(safeData);
}
```

---

## 1. Navigation & structure globale

### 1.1. Bottom bar personnalisée

- 4 onglets + bouton central :
  - Accueil
  - Favoris
  - Messages
  - Profil
  - Bouton central `+` pour Publier

**Fichiers :**

- `lib/screens/main_page_wrapper.dart`
- `lib/widgets/custom_bottom_nav.dart`

```dart
class MainPageWrapper extends StatefulWidget {
  const MainPageWrapper({super.key});

  @override
  State<MainPageWrapper> createState() => _MainPageWrapperState();
}

class _MainPageWrapperState extends State<MainPageWrapper> {
  int _currentIndex = 0;

  final _pages = const [
    HomePage(),
    FavoritesPage(),
    MessagesPage(),
    ProfilePage(),
  ];

  void _onTabSelected(int index) {
    setState(() => _currentIndex = index);
  }

  void _onCentralAction() {
    Navigator.pushNamed(context, '/add_property');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: CustomBottomNavBar(
        currentIndex: _currentIndex,
        onTabSelected: _onTabSelected,
        onCentralAction: _onCentralAction,
      ),
    );
  }
}
```

La `CustomBottomNavBar` contient la forme arrondie + bouton central flottant.

---

## 2. Accueil (HomePage)

**Fichier :** `lib/screens/home/home_page.dart`

### 2.1. Design

- AppBar or, texte blanc centré "Accueil".
- Fond : beige / crème (ou vert clair selon thème).
- Sections :
  - Filtres rapides (chips : Tous, À louer, À vendre, etc.).
  - **Promotions** (carrousel horizontal `PropertyCardModern`).
  - **Nouveaux biens** (carrousel horizontal des plus récents).

### 2.2. Query Promotions

```dart
Stream<QuerySnapshot> _promoStream() {
  return FirebaseFirestore.instance
      .collection('properties')
      .where('isPromo', isEqualTo: true)
      .orderBy('createdAt', descending: true)
      .snapshots();
}
```

Filtrer encore en Dart si nécessaire (`status == 'approved'`).

### 2.3. Query Nouveaux biens

```dart
Stream<QuerySnapshot> _buildFilteredStream() {
  Query query = FirebaseFirestore.instance.collection('properties');

  if (_selectedPurpose != 'all') {
    query = query.where('purpose', isEqualTo: _selectedPurpose);
  }
  if (_selectedType != 'all') {
    query = query.where('type', isEqualTo: _selectedType);
  }

  query = query.orderBy('createdAt', descending: true).limit(10);
  return query.snapshots();
}
```

Dans le builder :

```dart
var properties = snapshot.data!.docs
    .map((doc) => PropertyModel.fromMap(
          doc.data() as Map<String, dynamic>,
          doc.id,
        ))
    .where((prop) =>
        prop.status == 'approved' ||
        prop.status.trim().isEmpty)
    .toList();
```

### 2.4. Barre de recherche → SearchPage

```dart
TextField(
  readOnly: true,
  onTap: () => Navigator.pushNamed(context, '/search'),
  decoration: InputDecoration(
    hintText: 'Mot-clé ou localisation',
    prefixIcon: const Icon(Icons.search),
  ),
),
```

---

## 3. Recherche (Search)

**Fichiers :**

- `lib/screens/search/search_page.dart`
- route `/search` dans `lib/main.dart`

### 3.1. Route

```dart
routes: {
  '/search': (context) => const SearchScreen(),
  // ...
},
```

`SearchScreen` : `Scaffold` avec AppBar "Rechercher" et corps `SearchPage`.

### 3.2. FirestoreService.streamPropertiesFiltered

**Fichier :** `lib/services/firestore_service.dart`

```dart
Stream<QuerySnapshot> streamPropertiesFiltered({
  String? keyword,
  String? type,
  double? minPrice,
  double? maxPrice,
  double? minSurface,
}) {
  Query query = propertiesRef;
  final hasKeyword = keyword != null && keyword.trim().isNotEmpty;

  final bool hasFilters = (type != null && type != 'Tous') ||
      minPrice != null ||
      maxPrice != null ||
      minSurface != null ||
      hasKeyword;

  if (!hasFilters) {
    return propertiesRef
        .orderBy('createdAt', descending: true)
        .limit(30)
        .snapshots();
  }

  if (type != null && type != 'Tous') {
    query = query.where('type', isEqualTo: type);
  }
  if (minPrice != null) {
    query = query.where('price', isGreaterThanOrEqualTo: minPrice);
  }
  if (maxPrice != null) {
    query = query.where('price', isLessThanOrEqualTo: maxPrice);
  }
  if (minSurface != null) {
    query = query.where('surface', isGreaterThanOrEqualTo: minSurface);
  }

  return (query as Query<Map<String, dynamic>>)
      .orderBy('createdAt', descending: true)
      .limit(30)
      .snapshots();
}
```

Dans `SearchPage`, filtrer en plus sur le mot-clé côté Dart.

---

## 4. Publier / Modifier une annonce

**Fichiers :**

- `lib/screens/add_property/add_property_page.dart`
- `lib/screens/add_property/edit_property_page.dart`

### 4.1. Design

Formulaire comprenant :

- Titre (`TextField`)
- Description (`TextField` multi-lignes)
- Type (Dropdown : Maison, Appartement, Terrain, Commerce)
- Purpose (Dropdown : `rent` / `sale`)
- Prix (DT)
- Surface (m²)
- Pièces (int)
- Localisation (ville / quartier)
- Latitude / Longitude (optionnel)
- Liste d’URL d’images (au moins un champ)

Bouton principal : `ElevatedButton` "Publier" avec couleur or.

### 4.2. Logique de soumission

- Vérifie que l’utilisateur est connecté.
- Vérifie que titre + prix sont remplis.
- Compose une liste d’images non vides, ou `[kDefaultPropertyImage]` si vide.
- Appelle `FirestoreService.addProperty` ou `updateProperty`.
- Affiche un `AlertDialog` de confirmation puis un `SnackBar`.

---

## 5. Favoris

**Fichier :** `lib/screens/favorites/favorites_page.dart`

- Affiche les biens favoris de l’utilisateur courant.
- Utilise `PropertyCard` / `PropertyCardModern`.
- Empty state si aucun favori.

Les favoris sont gérés via `FirestoreService.addFavorite/removeFavorite/streamFavorites`.

---

## 6. Messages

**Fichier :** `lib/screens/messages/messages_page.dart`

### 6.1. Design

- AppBar or "Messages".
- Liste de conversations (`ListView.builder`).

### 6.2. StreamBuilder

```dart
return StreamBuilder<QuerySnapshot>(
  stream: FirebaseFirestore.instance
      .collection('chats')
      .where('participants', arrayContains: currentUserId)
      .snapshots(),
  builder: (context, snapshot) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const Center(child: CircularProgressIndicator());
    }
    if (snapshot.hasError) {
      return const Center(child: Text('Une erreur est survenue'));
    }
    if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
      return const Center(
        child: Text("Aucune conversation pour l'instant."),
      );
    }

    final chats = snapshot.data!.docs.toList()
      ..sort((a, b) {
        final aTime = (a['lastMessageTime'] as Timestamp?);
        final bTime = (b['lastMessageTime'] as Timestamp?);
        final aMillis = aTime?.millisecondsSinceEpoch ?? 0;
        final bMillis = bTime?.millisecondsSinceEpoch ?? 0;
        return bMillis.compareTo(aMillis);
      });

    return ListView.builder(
      itemCount: chats.length,
      itemBuilder: (context, index) {
        final chat = chats[index].data() as Map<String, dynamic>;
        // ... affichage nom autre utilisateur, dernier message, heure
      },
    );
  },
);
```

- Jamais d’erreur affichée quand il n’y a simplement "aucune conversation".
- Le nom de l’autre utilisateur est extrait depuis son document `users` (displayName/name/username/email).

---

## 7. Détails d’un bien (PropertyDetailPage)

**Fichier :** `lib/screens/details/property_detail_page.dart`

### 7.1. Design

- `SliverAppBar` avec :
  - Hero image (PageView d’images)
  - Bouton favori
- Sections :
  - Titre, ville, prix, type, pièces, surface
  - Description
  - Localisation (carte + adresse)
  - Boutons propriétaire : Modifier / Supprimer / Mettre en promo
  - Bouton acheteur : "Contacter le vendeur" → ouvre le chat.

### 7.2. Images avec fallback

```dart
PageView.builder(
  itemCount: p.images.isEmpty ? 1 : p.images.length,
  itemBuilder: (context, index) {
    final hasImages = p.images.isNotEmpty;
    final rawUrl = hasImages ? p.images[index] : '';
    final imageUrl = rawUrl.trim().isNotEmpty
      ? rawUrl
      : kDefaultPropertyImage;

    return Container(
      color: Colors.grey[300],
      child: Image.network(
        imageUrl,
        fit: BoxFit.cover,
        errorBuilder: (c, e, st) =>
            Image.network(kDefaultPropertyImage, fit: BoxFit.cover),
      ),
    );
  },
);
```

### 7.3. Carte Google Maps

```dart
Widget _buildMapSection(PropertyModel p) {
  final lat = p.latitude;
  final lng = p.longitude;
  final hasCoords = lat != null && lng != null && lat != 0.0 && lng != 0.0;

  if (!hasCoords) {
    return _buildAddressInfo(p);
  }

  final position = LatLng(lat!, lng!);

  final mapWidget = SizedBox(
    height: 200,
    child: GoogleMap(
      initialCameraPosition: CameraPosition(
        target: position,
        zoom: 14,
      ),
      markers: {
        Marker(
          markerId: const MarkerId('property'),
          position: position,
        ),
      },
      zoomControlsEnabled: false,
      myLocationButtonEnabled: false,
    ),
  );

  final mapCard = Card(
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    child: ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: mapWidget,
    ),
  );

  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      mapCard,
      const SizedBox(height: 12),
      _buildAddressInfo(p),
    ],
  );
}
```

`_buildAddressInfo` affiche l’icône de localisation + texte de l’adresse.

---

## 8. Profil & changement de thème

**Fichier :** `lib/screens/profile/profile_page.dart`

- Affiche avatar, nom, email.
- Bouton pour ouvrir l’interface admin si l’utilisateur est admin.
- Liste des annonces de l’utilisateur (avec badges "En ligne", "NOUVEAU", etc.).
- Boutons : changer mot de passe, déconnexion.

### 8.1. Sélecteur de thème

```dart
actions: [
  IconButton(
    icon: const Icon(Icons.color_lens),
    onPressed: _showThemeDialog,
  ),
],
```

`_showThemeDialog` ouvre un `AlertDialog` avec les options de thème (clair, sombre, vert), qui appellent `ThemeProvider.setMode(...)`.

---

## 9. Interface Admin

**Fichier :** `lib/screens/admin/admin_page.dart`

### 9.1. Onglets

- Utilisateurs
- En attente (annonces avec `status == 'pending'` ou vide)
- Annonces (toutes les annonces)

AppBar or "Administration" avec `TabBar`.

### 9.2. Liste des annonces en attente

- Utilise `FirestoreService.streamPendingProperties()`.
- Map vers `PropertyModel.fromMap`.
- Filtre en Dart : `status == 'pending' || status.trim().isEmpty`.
- Affiche carte avec image (fallback `kDefaultPropertyImage`), titre, prix, location, boutons "Valider" & "Refuser".

```dart
final pending = snapshot.data!.docs
    .map((doc) => PropertyModel.fromMap(
          doc.data() as Map<String, dynamic>,
          doc.id,
        ))
    .where((prop) =>
        prop.status == 'pending' || prop.status.trim().isEmpty)
    .toList();
```

### 9.3. Actions

- `updatePropertyStatus(id, 'approved', adminId)`
- `updatePropertyStatus(id, 'rejected', adminId)`

---

## 10. Résumé des règles métier

- **Promotions** : `isPromo == true` (optionnellement `status == 'approved'`).
- **Nouveaux biens** : triés par `createdAt desc` et filtrés sur status.
- **Recherche** : accessible depuis Accueil via la barre de recherche.
- **Images** : utiliser `kDefaultPropertyImage` partout si la liste est vide ou si l’URL est invalide.
- **Messages** :
  - Jamais d’écran d’erreur pour simple absence de conversations.
  - Afficher "Aucune conversation pour l'instant." quand il n’y a rien.
  - Trier les conversations par `lastMessageTime` côté client si besoin.
- **Google Maps** :
  - Afficher une carte uniquement si latitude & longitude valides.
  - Sinon afficher seulement l’adresse.
- **Admin** :
  - Peut approuver / refuser les annonces pending.
  - Onglets clairs (Utilisateurs / En attente / Annonces).

Ce fichier `dess.md` sert de script fonctionnel et technique pour l’application Gold Meuble. Copie/colle les sections dont tu as besoin ou mets-le à jour au fur et à mesure de l’évolution de l’app.
