# 📱 DOCUMENTATION FLUTTER - PARTIE 3/4
## Application Immobilière - Widgets & Services

---

## 📋 TABLE DES MATIÈRES

1. [Widgets Réutilisables](#widgets-réutilisables)
2. [Services Métier](#services-métier)
3. [Providers](#providers)

---

## 🧩 WIDGETS RÉUTILISABLES

### PropertyCardModern (`widgets/property_card_modern.dart`)

**Design**: Carte moderne pour grille 2 colonnes (HomePage)

**Fonctionnalités**:
- Image avec gradient overlay
- Badges: PROMO, À LOUER, À VENDRE
- Bouton favoris
- Prix avec strikethrough si promo
- Chips: surface, pièces, type
- **PAS de mini-map** (optimisé pour grille)

**Structure complète (335 lignes)**:
```dart
class PropertyCardModern extends StatelessWidget {
  final PropertyModel property;
  final VoidCallback? onTap;
  final bool isFavorite;
  final VoidCallback? onFavoriteToggle;

  const PropertyCardModern({
    super.key,
    required this.property,
    this.onTap,
    this.isFavorite = false,
    this.onFavoriteToggle,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final p = property;

    // Résolution de l'image (avec fallback)
    final imageUrl = p.images.isEmpty ? kDefaultPropertyImage : p.images[0];

    return GestureDetector(
      onTap: onTap,
      child: Card(
        margin: const EdgeInsets.all(4),
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 2,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image avec overlay
            Expanded(
              flex: 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Image de la propriété
                  Hero(
                    tag: 'property-image-${p.id}',
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Image.asset(
                          kDefaultPropertyImage,
                          fit: BoxFit.cover,
                        );
                      },
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Container(
                          color: Colors.grey[300],
                          child: const Center(
                            child: CircularProgressIndicator(),
                          ),
                        );
                      },
                    ),
                  ),

                  // Gradient overlay
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.7),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Badge PROMO (si isPromo = true)
                  if (p.isPromo)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'PROMO',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ),

                  // Badge Purpose (À LOUER / À VENDRE)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: p.purpose == 'rent'
                            ? Colors.blue
                            : colorScheme.secondary,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        p.purpose == 'rent' ? 'À LOUER' : 'À VENDRE',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ),

                  // Bouton Favoris
                  Positioned(
                    bottom: 8,
                    right: 8,
                    child: CircleAvatar(
                      backgroundColor: Colors.white,
                      radius: 16,
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        iconSize: 18,
                        icon: Icon(
                          isFavorite ? Icons.favorite : Icons.favorite_border,
                          color: isFavorite ? Colors.red : Colors.grey,
                        ),
                        onPressed: onFavoriteToggle,
                      ),
                    ),
                  ),

                  // Prix en overlay (en bas à gauche)
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Prix barré si promo
                        if (p.isPromo && p.promoPrice != null)
                          Text(
                            '${p.price.toStringAsFixed(0)} TND',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 10,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        // Prix affiché (promoPrice si promo, sinon price)
                        Text(
                          '${p.displayPrice.toStringAsFixed(0)} TND',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Informations textuelles
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Titre
                    Text(
                      p.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),

                    // Localisation
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 12,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 2),
                        Expanded(
                          child: Text(
                            p.location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey[600],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),

                    // Chips statistiques (surface, pièces, type)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Surface
                        _buildStatChip(
                          Icons.square_foot,
                          '${p.surface.toStringAsFixed(0)} m²',
                        ),
                        // Pièces
                        _buildStatChip(
                          Icons.bed,
                          '${p.rooms}',
                        ),
                        // Type
                        _buildStatChip(
                          Icons.home_work,
                          p.type,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 10, color: Colors.grey[600]),
        const SizedBox(width: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 9,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}
```

**Pour React Native**:
- Card → View avec style (borderRadius, elevation/shadowOffset)
- Stack → View avec position: 'absolute'
- Hero → Shared Element Transition
- LinearGradient → react-native-linear-gradient

---

### PropertyCard (`widgets/property_card.dart`)

**Design**: Carte classique horizontale/verticale (ProfilePage, FavoritesPage)

**Fonctionnalités**:
- 2 layouts: horizontal (120px) et vertical (largeur complète)
- Image, titre, prix, localisation, surface, pièces, type
- **PAS de mini-map** (optimisé pour listes)
- Bouton favoris

**Structure simplifiée**:
```dart
class PropertyCard extends StatelessWidget {
  final PropertyModel property;
  final VoidCallback? onTap;
  final bool isHorizontal;

  const PropertyCard({
    super.key,
    required this.property,
    this.onTap,
    this.isHorizontal = true,
  });

  @override
  Widget build(BuildContext context) {
    if (isHorizontal) {
      return _buildHorizontalCard(context);
    } else {
      return _buildVerticalCard(context);
    }
  }

  Widget _buildHorizontalCard(BuildContext context) {
    final p = property;
    final imageUrl = p.images.isEmpty ? kDefaultPropertyImage : p.images[0];

    return GestureDetector(
      onTap: onTap,
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            // Image (largeur fixe 120px)
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(
                left: Radius.circular(8),
              ),
              child: Image.network(
                imageUrl,
                width: 120,
                height: 120,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Image.asset(
                  kDefaultPropertyImage,
                  width: 120,
                  height: 120,
                  fit: BoxFit.cover,
                ),
              ),
            ),

            // Informations
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Titre
                    Text(
                      p.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),

                    // Localisation
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            p.location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Prix
                    Text(
                      '${p.displayPrice.toStringAsFixed(0)} TND',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Stats
                    Row(
                      children: [
                        Icon(Icons.square_foot, size: 14, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text('${p.surface.toStringAsFixed(0)} m²'),
                        const SizedBox(width: 12),
                        Icon(Icons.bed, size: 14, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text('${p.rooms}'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVerticalCard(BuildContext context) {
    // Similaire au layout horizontal mais empilé verticalement
    // Image en haut, infos en dessous
    // ...
  }
}
```

---

### LocationPicker (`widgets/location_picker.dart`)

**Fonctionnalités**:
- Carte interactive FlutterMap (OpenStreetMap)
- Sélection GPS par tap sur la carte
- Affichage des coordonnées (latitude, longitude)
- Bouton "Confirmer" pour retourner les coordonnées

**Structure complète (152 lignes)**:
```dart
class LocationPicker extends StatefulWidget {
  final double? initialLatitude;
  final double? initialLongitude;
  final Function(double latitude, double longitude) onLocationSelected;

  const LocationPicker({
    super.key,
    this.initialLatitude,
    this.initialLongitude,
    required this.onLocationSelected,
  });

  @override
  State<LocationPicker> createState() => _LocationPickerState();
}

class _LocationPickerState extends State<LocationPicker> {
  late LatLng _selectedPosition;
  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    // Position par défaut : Tunis, Tunisie
    _selectedPosition = LatLng(
      widget.initialLatitude ?? 36.8065,
      widget.initialLongitude ?? 10.1815,
    );
  }

  void _onMapTapped(TapPosition tapPosition, LatLng position) {
    setState(() {
      _selectedPosition = position;
    });
  }

  void _confirmSelection() {
    widget.onLocationSelected(
      _selectedPosition.latitude,
      _selectedPosition.longitude,
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Choisir la localisation'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: _confirmSelection,
            tooltip: 'Confirmer',
          ),
        ],
      ),
      body: Column(
        children: [
          // Informations de position
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[100],
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Touchez la carte pour définir la position',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 16, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Lat: ${_selectedPosition.latitude.toStringAsFixed(6)}, '
                        'Lng: ${_selectedPosition.longitude.toStringAsFixed(6)}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[700],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Carte OpenStreetMap avec flutter_map
          Expanded(
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _selectedPosition,
                initialZoom: 13.0,
                onTap: _onMapTapped,
              ),
              children: [
                // Tuiles OpenStreetMap
                TileLayer(
                  urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                  subdomains: const ['a', 'b', 'c'],
                  userAgentPackageName: 'com.example.immobilier_app',
                ),

                // Marqueur de la position sélectionnée
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _selectedPosition,
                      width: 40,
                      height: 40,
                      child: const Icon(
                        Icons.location_on,
                        color: Colors.red,
                        size: 40,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Bouton Confirmer
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _confirmSelection,
                child: const Text('Confirmer la position'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

**Pour React Native**:
- FlutterMap → react-native-maps (avec MapView)
- TileLayer → UrlTile avec provider OpenStreetMap
- Marker → Marker component
- onTap → onPress sur MapView

**Utilisation dans AddPropertyPage**:
```dart
ElevatedButton.icon(
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LocationPicker(
          initialLatitude: _selectedLatitude,
          initialLongitude: _selectedLongitude,
          onLocationSelected: (lat, lng) {
            setState(() {
              _selectedLatitude = lat;
              _selectedLongitude = lng;
            });
          },
        ),
      ),
    );
  },
  icon: const Icon(Icons.map),
  label: const Text('Choisir sur la carte'),
)
```

---

### CustomBottomNav (`widgets/custom_bottom_nav.dart`)

**Fonctionnalités**:
- Bottom navigation bar avec 5 items
- FloatingActionButton central avec gradient
- Couleurs dynamiques selon le thème

**Structure**:
```dart
class CustomBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final VoidCallback onAddPressed;

  const CustomBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.onAddPressed,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.topCenter,
      children: [
        // BottomNavigationBar
        BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: onTap,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: colorScheme.secondary,
          unselectedItemColor: Colors.grey,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: 'Accueil',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.favorite),
              label: 'Favoris',
            ),
            BottomNavigationBarItem(
              icon: SizedBox.shrink(), // Espace pour FAB
              label: '',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.message),
              label: 'Messages',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person),
              label: 'Profil',
            ),
          ],
        ),

        // FloatingActionButton central
        Positioned(
          top: -28,
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  colorScheme.secondary,
                  colorScheme.secondary.withOpacity(0.7),
                ],
              ),
            ),
            child: FloatingActionButton(
              onPressed: onAddPressed,
              backgroundColor: Colors.transparent,
              elevation: 0,
              child: const Icon(Icons.add, size: 32),
            ),
          ),
        ),
      ],
    );
  }
}
```

---

## ⚙️ SERVICES MÉTIER

### FirestoreService (`services/firestore_service.dart`)

**Rôle**: CRUD Firestore pour toutes les collections

**Collections gérées**:
- `properties`: Propriétés immobilières
- `users`: Utilisateurs
- `users/{uid}/favorites`: Favoris
- `chats`: Conversations
- `chats/{chatId}/messages`: Messages

**Méthodes complètes**:
```dart
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  
  // Référence aux collections
  CollectionReference get propertiesRef => _db.collection('properties');
  CollectionReference get usersRef => _db.collection('users');

  // ============ PROPERTIES ============
  
  // Ajouter une propriété (status = 'pending' par défaut)
  Future<void> addProperty(Map<String, dynamic> data) async {
    data['status'] = data['status'] ?? 'pending';
    data['createdAt'] = FieldValue.serverTimestamp();
    await propertiesRef.add(data);
  }

  // Modifier une propriété
  Future<void> updateProperty(String id, Map<String, dynamic> data) async {
    await propertiesRef.doc(id).update(data);
  }

  // Supprimer une propriété
  Future<void> deleteProperty(String id) async {
    await propertiesRef.doc(id).delete();
  }

  // Changer le statut d'une propriété (pending, approved, rejected)
  Future<void> updatePropertyStatus(String id, String status) async {
    await propertiesRef.doc(id).update({'status': status});
  }

  // Stream toutes les propriétés approuvées
  Stream<QuerySnapshot> streamProperties() {
    return propertiesRef
        .where('status', isEqualTo: 'approved')
        .snapshots();
  }

  // Stream propriétés par utilisateur
  Stream<QuerySnapshot> streamUserProperties(String userId) {
    return propertiesRef
        .where('userId', isEqualTo: userId)
        .snapshots();
  }

  // ============ FAVORITES ============
  
  // Ajouter aux favoris
  Future<void> addFavorite(String userId, String propertyId) async {
    await usersRef
        .doc(userId)
        .collection('favorites')
        .doc(propertyId)
        .set({
      'propertyId': propertyId,
      'addedAt': FieldValue.serverTimestamp(),
    });
  }

  // Retirer des favoris
  Future<void> removeFavorite(String userId, String propertyId) async {
    await usersRef
        .doc(userId)
        .collection('favorites')
        .doc(propertyId)
        .delete();
  }

  // Vérifier si propriété est favorite
  Future<bool> isFavorite(String userId, String propertyId) async {
    final doc = await usersRef
        .doc(userId)
        .collection('favorites')
        .doc(propertyId)
        .get();
    return doc.exists;
  }

  // Stream des favoris
  Stream<QuerySnapshot> streamFavorites(String userId) {
    return usersRef
        .doc(userId)
        .collection('favorites')
        .snapshots();
  }

  // ============ CHAT ============
  
  // Créer ou récupérer un chat pour une propriété
  Future<String> getOrCreateChatForProperty({
    required String propertyId,
    required String buyerId,
    required String sellerId,
  }) async {
    // Chercher chat existant
    final existingChat = await _db
        .collection('chats')
        .where('propertyId', isEqualTo: propertyId)
        .where('participants', arrayContains: buyerId)
        .get();

    if (existingChat.docs.isNotEmpty) {
      return existingChat.docs.first.id;
    }

    // Créer nouveau chat
    final chatRef = await _db.collection('chats').add({
      'propertyId': propertyId,
      'participants': [buyerId, sellerId],
      'createdAt': FieldValue.serverTimestamp(),
      'lastMessage': '',
      'lastMessageTime': FieldValue.serverTimestamp(),
    });

    return chatRef.id;
  }

  // Envoyer un message
  Future<void> sendMessage({
    required String chatId,
    required String senderId,
    required String receiverId,
    required String text,
  }) async {
    // Ajouter message dans subcollection
    await _db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
      'senderId': senderId,
      'receiverId': receiverId,
      'text': text,
      'timestamp': FieldValue.serverTimestamp(),
    });

    // Mettre à jour lastMessage du chat
    await _db.collection('chats').doc(chatId).update({
      'lastMessage': text,
      'lastMessageTime': FieldValue.serverTimestamp(),
    });
  }

  // Stream des messages d'un chat
  Stream<QuerySnapshot> streamChatMessages(String chatId) {
    return _db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', descending: true)
        .snapshots();
  }

  // ============ USERS ============
  
  // Créer un utilisateur
  Future<void> createUser({
    required String uid,
    required String email,
    String? displayName,
    String? phone,
  }) async {
    await usersRef.doc(uid).set({
      'email': email,
      'displayName': displayName ?? '',
      'phone': phone ?? '',
      'isAdmin': false,
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  // Récupérer un utilisateur
  Future<DocumentSnapshot> getUser(String uid) async {
    return await usersRef.doc(uid).get();
  }

  // Mettre à jour un utilisateur
  Future<void> updateUser(String uid, Map<String, dynamic> data) async {
    await usersRef.doc(uid).update(data);
  }

  // Vérifier si utilisateur est admin
  Future<bool> isAdmin(String uid) async {
    final doc = await usersRef.doc(uid).get();
    final data = doc.data() as Map<String, dynamic>?;
    return data?['isAdmin'] ?? false;
  }
}
```

**Pour React Native**:
- Utiliser Firebase JS SDK v9+ (modular)
- Firestore: `collection()`, `doc()`, `addDoc()`, `setDoc()`, `updateDoc()`, `deleteDoc()`
- Queries: `query()`, `where()`, `orderBy()`, `limit()`
- Real-time: `onSnapshot()`

---

### AuthService (`services/auth_service.dart`)

**Rôle**: Authentification Firebase + gestion FCM

**Structure (ChangeNotifier pour Provider)**:
```dart
class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirestoreService _fs = FirestoreService();
  final FCMService _fcm = FCMService();

  User? _currentUser;
  User? get currentUser => _currentUser;
  bool get isSignedIn => _currentUser != null;

  AuthService() {
    _auth.authStateChanges().listen((user) {
      _currentUser = user;
      notifyListeners();
    });
  }

  // Connexion avec email/password
  Future<void> signInWithEmail(String email, String password) async {
    try {
      final cred = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      // Souscrire aux notifications FCM
      if (cred.user != null) {
        await _fcm.subscribeToTopic('all_users');
      }
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  // Inscription avec email/password
  Future<void> signUpWithEmail(
    String email,
    String password, {
    String? displayName,
    String? phone,
  }) async {
    try {
      final cred = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (cred.user != null) {
        // Créer document Firestore users
        await _fs.createUser(
          uid: cred.user!.uid,
          email: email,
          displayName: displayName,
          phone: phone,
        );

        // Mettre à jour displayName dans Firebase Auth
        if (displayName != null) {
          await cred.user!.updateDisplayName(displayName);
        }

        // Souscrire aux notifications
        await _fcm.subscribeToTopic('all_users');
      }
    } on FirebaseAuthException catch (e) {
      throw _handleAuthException(e);
    }
  }

  // Déconnexion
  Future<void> signOut() async {
    // Désabonnement FCM
    await _fcm.unsubscribeFromTopic('all_users');
    await _auth.signOut();
  }

  // Réinitialisation mot de passe
  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  // Changer mot de passe
  Future<void> updatePassword(String newPassword) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('Utilisateur non connecté');
    await user.updatePassword(newPassword);
  }

  // Gestion des erreurs Firebase Auth
  String _handleAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'Aucun utilisateur trouvé avec cet email';
      case 'wrong-password':
        return 'Mot de passe incorrect';
      case 'email-already-in-use':
        return 'Cet email est déjà utilisé';
      case 'weak-password':
        return 'Mot de passe trop faible';
      case 'invalid-email':
        return 'Email invalide';
      default:
        return 'Erreur: ${e.message}';
    }
  }
}
```

---

### StorageService (`services/storage_service.dart`)

**Rôle**: Upload images vers Firebase Storage

**Structure (145 lignes)**:
```dart
class StorageService {
  final FirebaseStorage _storage = FirebaseStorage.instance;

  // Upload fichier (File pour mobile)
  Future<String> uploadFile(File file, String path) async {
    try {
      final ref = _storage.ref().child(path);
      final uploadTask = ref.putFile(file);
      
      // Attendre la fin de l'upload (timeout 120s)
      final snapshot = await uploadTask.timeout(
        const Duration(seconds: 120),
        onTimeout: () => throw TimeoutException('Upload timeout'),
      );

      // Récupérer l'URL de téléchargement
      final downloadUrl = await snapshot.ref.getDownloadURL();
      return downloadUrl;
    } catch (e) {
      throw Exception('Erreur upload: $e');
    }
  }

  // Upload XFile (cross-platform)
  Future<String> uploadXFile(XFile file, String path) async {
    try {
      final bytes = await file.readAsBytes();
      final ref = _storage.ref().child(path);
      final uploadTask = ref.putData(bytes);
      
      final snapshot = await uploadTask.timeout(
        const Duration(seconds: 120),
      );

      final downloadUrl = await snapshot.ref.getDownloadURL();
      return downloadUrl;
    } catch (e) {
      throw Exception('Erreur upload: $e');
    }
  }

  // Upload bytes (web)
  Future<String> uploadBytes(Uint8List bytes, String path) async {
    try {
      final ref = _storage.ref().child(path);
      final uploadTask = ref.putData(bytes);
      
      final snapshot = await uploadTask.timeout(
        const Duration(seconds: 120),
      );

      final downloadUrl = await snapshot.ref.getDownloadURL();
      return downloadUrl;
    } catch (e) {
      throw Exception('Erreur upload: $e');
    }
  }

  // Supprimer un fichier
  Future<void> deleteFile(String path) async {
    try {
      await _storage.ref().child(path).delete();
    } catch (e) {
      throw Exception('Erreur suppression: $e');
    }
  }

  // Générer un path unique pour image
  String generateImagePath(String userId, String filename) {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return 'properties/$userId/${timestamp}_$filename';
  }
}
```

**Pour React Native**:
- Firebase Storage JS SDK
- react-native-image-picker pour sélection d'image
- Upload avec `ref.put()` ou `ref.putString()` (base64)

---

### FCMService (`services/fcm_service.dart`)

**Rôle**: Notifications push Firebase Cloud Messaging

**Structure simplifiée**:
```dart
class FCMService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  // Initialiser FCM
  Future<void> initialize() async {
    // Demander permission (iOS)
    await _fcm.requestPermission();

    // Récupérer token FCM
    final token = await _fcm.getToken();
    debugPrint('FCM Token: $token');

    // Écouter les messages foreground
    FirebaseMessaging.onMessage.listen((message) {
      debugPrint('Message reçu: ${message.notification?.title}');
      // Afficher notification locale
    });

    // Message cliqué (app en background)
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      debugPrint('Message cliqué: ${message.notification?.title}');
      // Navigation vers l'écran approprié
    });
  }

  // S'abonner à un topic
  Future<void> subscribeToTopic(String topic) async {
    await _fcm.subscribeToTopic(topic);
  }

  // Se désabonner d'un topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _fcm.unsubscribeFromTopic(topic);
  }
}
```

---

## 🔄 PROVIDERS

### ThemeProvider (`providers/theme_provider.dart`)

**Rôle**: Gestion du thème (clair, sombre, vert)

```dart
enum AppThemeMode { light, dark, green }

class ThemeProvider extends ChangeNotifier {
  AppThemeMode _themeMode = AppThemeMode.light;
  AppThemeMode get themeMode => _themeMode;

  ThemeData get themeData {
    switch (_themeMode) {
      case AppThemeMode.light:
        return AppTheme.lightTheme;
      case AppThemeMode.dark:
        return AppTheme.darkTheme;
      case AppThemeMode.green:
        return AppTheme.greenTheme;
    }
  }

  void setTheme(AppThemeMode mode) {
    _themeMode = mode;
    notifyListeners();
  }
}
```

---

### UserProvider (`providers/user_provider.dart`)

**Rôle**: Gestion de l'état utilisateur

```dart
class UserProvider extends ChangeNotifier {
  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  Future<void> loadUser(String uid) async {
    final fs = FirestoreService();
    final doc = await fs.getUser(uid);
    final data = doc.data() as Map<String, dynamic>?;
    if (data != null) {
      _currentUser = UserModel.fromMap(data, uid);
      notifyListeners();
    }
  }

  void clearUser() {
    _currentUser = null;
    notifyListeners();
  }
}
```

---

**📄 Continuer avec**: 
- [PARTIE 1: Structure & Navigation](./FLUTTER_DOCUMENTATION_PART1.md)
- [PARTIE 2: Code Source des Écrans](./FLUTTER_DOCUMENTATION_PART2.md)
- [PARTIE 4: Modèles, Firebase, Design System](./FLUTTER_DOCUMENTATION_PART4.md)
