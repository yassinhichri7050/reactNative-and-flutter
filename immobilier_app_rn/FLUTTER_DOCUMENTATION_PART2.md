# 📱 DOCUMENTATION FLUTTER - PARTIE 2/4
## Application Immobilière - Code Source des Écrans

---

## 📋 TABLE DES MATIÈRES

1. [Authentification](#authentification)
2. [Page d'Accueil](#page-daccueil)
3. [Détails Propriété](#détails-propriété)
4. [Ajout/Modification Propriété](#ajoutmodification-propriété)
5. [Favoris](#favoris)
6. [Messagerie](#messagerie)
7. [Profil](#profil)
8. [Administration](#administration)

---

## 🔐 AUTHENTIFICATION

### LoginPage (`auth/login_page.dart`)

**Concepts clés**:
- StatefulWidget avec controllers (email, password)
- Toggle visibilité mot de passe
- Provider.of<AuthService> pour connexion
- Navigation vers Register/ForgotPassword

**Code React Native équivalent**:
```typescript
// Utilisez React Navigation, useState, TextInput, TouchableOpacity
// Service d'auth: Firebase Auth JS SDK (signInWithEmailAndPassword)
```

**Fichier Flutter complet**: `lib/screens/auth/login_page.dart` (219 lignes)

---

### RegisterPage (`auth/register_page.dart`)

**Fonctionnalités**:
- Inscription avec: nom, email, téléphone, mot de passe
- Validation des champs
- Création compte Firebase Auth + document Firestore users

**Structure**:
```dart
class RegisterPage extends StatefulWidget {
  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _showPassword = false;

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Créer un compte')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: ListView(
            children: [
              // Champ Nom complet
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Nom complet',
                  prefixIcon: const Icon(Icons.person),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              
              // Champ Email
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  prefixIcon: const Icon(Icons.email),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              
              // Champ Téléphone
              TextField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: 'Téléphone',
                  prefixIcon: const Icon(Icons.phone),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              
              // Champ Mot de passe avec toggle visibilité
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Mot de passe',
                  prefixIcon: const Icon(Icons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(_showPassword ? Icons.visibility : Icons.visibility_off),
                    onPressed: () => setState(() => _showPassword = !_showPassword),
                  ),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                obscureText: !_showPassword,
              ),
              const SizedBox(height: 24),
              
              // Bouton Inscription
              _loading
                  ? const CircularProgressIndicator()
                  : SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          // Validation des champs
                          if (_nameController.text.isEmpty ||
                              _emailController.text.isEmpty ||
                              _passwordController.text.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Veuillez remplir tous les champs')),
                            );
                            return;
                          }
                          
                          setState(() => _loading = true);
                          try {
                            // Appel au service d'authentification
                            await auth.signUpWithEmail(
                              _emailController.text.trim(),
                              _passwordController.text.trim(),
                              displayName: _nameController.text.trim(),
                              phone: _phoneController.text.trim(),
                            );
                            
                            // Redirection vers HomePage après inscription
                            if (mounted) Navigator.pushReplacementNamed(context, '/home');
                          } catch (e) {
                            // Affichage erreur
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Erreur: ${e.toString()}')),
                              );
                            }
                          } finally {
                            if (mounted) setState(() => _loading = false);
                          }
                        },
                        child: const Text('S\'inscrire'),
                      ),
                    ),
              
              // Lien vers LoginPage
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Déjà un compte ? Se connecter'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

**Services utilisés**:
- `AuthService.signUpWithEmail()` - Crée compte Firebase Auth + document Firestore users

---

### ForgotPasswordPage (`auth/forgot_password_page.dart`)

**Fonctionnalités**:
- Champ email
- Envoi email de réinitialisation via Firebase Auth
- Message de confirmation

**Structure simplifiée**:
```dart
class ForgotPasswordPage extends StatefulWidget {
  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _emailController = TextEditingController();
  bool _loading = false;

  Future<void> _sendResetEmail() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez entrer votre email')),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      await FirebaseAuth.instance.sendPasswordResetEmail(email: email);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Email de réinitialisation envoyé')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mot de passe oublié')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                prefixIcon: const Icon(Icons.email),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _sendResetEmail,
              child: _loading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Envoyer'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 🏠 PAGE D'ACCUEIL

### HomePage (`home/home_page.dart`)

**Design**: Inspiré de ScoutCar (grille 2 colonnes)

**Fonctionnalités clés**:
- Barre de recherche cliquable → NavigateTo('/search')
- 4 boutons filtres: Type, Prix, But (Louer/Vendre), Tous
- Compteur "X annonces"
- Grille 2 colonnes avec PropertyCardModern
- StreamBuilder pour data temps réel
- Pull-to-refresh
- Toggle favoris sur chaque carte

**Structure complète**: Voir fichier `lib/screens/home/home_page.dart` (587 lignes)

**Points importants pour React Native**:
```typescript
// Équivalents React Native:
// - CustomScrollView → FlatList avec numColumns={2}
// - SliverGrid → FlatList avec numColumns={2}
// - StreamBuilder → useEffect + onSnapshot (Firestore)
// - RefreshIndicator → RefreshControl
// - PropertyCardModern → Component React Native personnalisé
```

**Filtres implémentés**:
```dart
// État des filtres
String _selectedPurpose = 'all'; // 'all', 'rent', 'sale'
String _selectedType = 'all'; // 'all', 'Maison', 'Appartement', 'Terrain', 'Commerce'
Set<String> _favoriteIds = {};

// Filtre StreamBuilder
StreamBuilder<QuerySnapshot>(
  stream: _selectedPurpose == 'all'
      ? _fs.propertiesRef.where('status', isEqualTo: 'approved').snapshots()
      : _fs.propertiesRef
          .where('status', isEqualTo: 'approved')
          .where('purpose', isEqualTo: _selectedPurpose)
          .snapshots(),
  builder: (context, snapshot) {
    // Filtre côté client pour le type
    final allProperties = snapshot.data?.docs.map((doc) {
      return PropertyModel.fromMap(doc.data() as Map<String, dynamic>, doc.id);
    }).toList() ?? [];
    
    final filteredProperties = _selectedType == 'all'
        ? allProperties
        : allProperties.where((p) => p.type == _selectedType).toList();
    
    return SliverGrid(...);
  },
)
```

**Bottom Sheets pour filtres**:
```dart
void _showTypeFilter() {
  showModalBottomSheet(
    context: context,
    builder: (context) {
      return Column(
        children: [
          ListTile(
            title: const Text('Tous les types'),
            onTap: () {
              setState(() => _selectedType = 'all');
              Navigator.pop(context);
            },
          ),
          ListTile(
            title: const Text('Maison'),
            onTap: () {
              setState(() => _selectedType = 'Maison');
              Navigator.pop(context);
            },
          ),
          // ... autres types
        ],
      );
    },
  );
}
```

---

## 📄 DÉTAILS PROPRIÉTÉ

### PropertyDetailPage (`details/property_detail_page.dart`)

**Fonctionnalités**:
- Hero animation sur image
- Carrousel d'images (PageView)
- Carte OpenStreetMap interactive (FlutterMap)
- Bouton favoris
- Bouton "Contacter le vendeur" → Crée/ouvre chat
- Informations complètes: titre, prix, description, surface, pièces, localisation

**Structure (772 lignes totales)**:
```dart
class PropertyDetailPage extends StatefulWidget {
  @override
  State<PropertyDetailPage> createState() => _PropertyDetailPageState();
}

class _PropertyDetailPageState extends State<PropertyDetailPage> {
  PropertyModel? property;
  bool _isFavorite = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Récupération de l'argument de navigation
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is PropertyModel) {
      property = args;
      _checkFavorite();
    }
  }

  Future<void> _checkFavorite() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null || property == null) return;
    final fs = FirestoreService();
    final isFav = await fs.isFavorite(uid, property!.id);
    if (!mounted) return;
    setState(() => _isFavorite = isFav);
  }

  @override
  Widget build(BuildContext context) {
    final p = property;
    if (p == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // AppBar avec image en fond (Hero animation)
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Hero(
                tag: 'property-image-${p.id}',
                child: PageView.builder(
                  itemCount: p.images.isEmpty ? 1 : p.images.length,
                  itemBuilder: (context, index) {
                    final imageUrl = p.images.isEmpty 
                        ? kDefaultPropertyImage 
                        : p.images[index];
                    return Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Image.asset(
                        kDefaultPropertyImage,
                        fit: BoxFit.cover,
                      ),
                    );
                  },
                ),
              ),
            ),
            actions: [
              // Bouton favoris
              CircleAvatar(
                backgroundColor: Colors.white,
                child: IconButton(
                  icon: Icon(
                    _isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: _isFavorite ? Colors.red : Colors.grey,
                  ),
                  onPressed: () async {
                    final uid = FirebaseAuth.instance.currentUser?.uid;
                    if (uid == null) return;
                    
                    final fs = FirestoreService();
                    if (_isFavorite) {
                      await fs.removeFavorite(uid, p.id);
                    } else {
                      await fs.addFavorite(uid, p.id);
                    }
                    setState(() => _isFavorite = !_isFavorite);
                  },
                ),
              ),
            ],
          ),

          // Détails de la propriété
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Titre
                  Text(
                    p.title,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Localisation
                  Row(
                    children: [
                      Icon(Icons.location_on, color: Colors.grey[600]),
                      const SizedBox(width: 4),
                      Text(p.location),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Prix
                  Text(
                    '${p.displayPrice} TND',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Statistiques (surface, pièces, type)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildStatChip(Icons.square_foot, '${p.surface} m²'),
                      _buildStatChip(Icons.bed, '${p.rooms} pièces'),
                      _buildStatChip(Icons.home_work, p.type),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  // Description
                  Text(
                    'Description',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(p.description),
                  const SizedBox(height: 24),
                  
                  // Carte OpenStreetMap
                  if (p.latitude != null && p.longitude != null) ...[
                    Text(
                      'Localisation',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 250,
                      child: FlutterMap(
                        options: MapOptions(
                          initialCenter: LatLng(p.latitude!, p.longitude!),
                          initialZoom: 15,
                        ),
                        children: [
                          TileLayer(
                            urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            subdomains: const ['a', 'b', 'c'],
                          ),
                          MarkerLayer(
                            markers: [
                              Marker(
                                point: LatLng(p.latitude!, p.longitude!),
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
                  ],
                  const SizedBox(height: 80), // Espace pour bouton flottant
                ],
              ),
            ),
          ),
        ],
      ),
      
      // Bouton "Contacter le vendeur"
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final currentUserId = FirebaseAuth.instance.currentUser?.uid;
          if (currentUserId == null) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Veuillez vous connecter')),
            );
            return;
          }
          
          // Créer ou récupérer le chat
          final fs = FirestoreService();
          final chatId = await fs.getOrCreateChatForProperty(
            propertyId: p.id,
            buyerId: currentUserId,
            sellerId: p.userId,
          );
          
          // Navigation vers ChatPage
          Navigator.pushNamed(context, '/chat', arguments: chatId);
        },
        icon: const Icon(Icons.message),
        label: const Text('Contacter'),
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String label) {
    return Chip(
      avatar: Icon(icon, size: 18),
      label: Text(label),
    );
  }
}
```

**Pour React Native**:
- Hero animation → Shared Element Transition (react-native-shared-element)
- FlutterMap → react-native-maps (avec provider OpenStreetMap)
- PageView → ScrollView horizontal avec pagination

---

## ➕ AJOUT/MODIFICATION PROPRIÉTÉ

### AddPropertyPage (`add_property/add_property_page.dart`)

**Fonctionnalités**:
- Formulaire complet: titre, description, prix, type, purpose (louer/vendre), surface, pièces, localisation
- Sélecteur GPS avec LocationPicker (carte interactive)
- Upload multiple d'images (jusqu'à 5)
- Validation admin obligatoire (status = 'pending')

**Structure (488 lignes totales)**:
```dart
class AddPropertyPage extends StatefulWidget {
  @override
  State<AddPropertyPage> createState() => _AddPropertyPageState();
}

class _AddPropertyPageState extends State<AddPropertyPage> {
  // Controllers pour tous les champs
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _surfaceController = TextEditingController();
  final _roomsController = TextEditingController();
  final _locationController = TextEditingController();
  final List<TextEditingController> _imageUrlControllers = [TextEditingController()];

  String _selectedType = 'Appartement';
  String _selectedPurpose = 'sale'; // 'rent' ou 'sale'
  bool _loading = false;
  double? _selectedLatitude;
  double? _selectedLongitude;

  final List<String> _propertyTypes = ['Maison', 'Appartement', 'Terrain', 'Commerce'];

  Future<void> _submit() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;

    final title = _titleController.text.trim();
    final priceText = _priceController.text.trim();
    
    // Validation
    if (title.isEmpty || priceText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez remplir le titre et le prix')),
      );
      return;
    }

    final price = double.tryParse(priceText);
    if (price == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Prix invalide')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      // Collecter toutes les URLs d'images
      final imageUrls = _imageUrlControllers
          .map((c) => c.text.trim())
          .where((url) => url.isNotEmpty)
          .toList();

      if (imageUrls.isEmpty) {
        imageUrls.add(kDefaultPropertyImage);
      }

      // Données de la propriété
      final data = {
        'title': title,
        'description': _descriptionController.text.trim(),
        'price': price,
        'surface': double.tryParse(_surfaceController.text.trim()) ?? 0.0,
        'type': _selectedType,
        'purpose': _selectedPurpose,
        'rooms': int.tryParse(_roomsController.text.trim()) ?? 0,
        'location': _locationController.text.trim(),
        'userId': uid,
        'latitude': _selectedLatitude,
        'longitude': _selectedLongitude,
        'images': imageUrls,
        'isFeatured': false,
        'status': 'pending', // En attente de validation admin
      };

      // Ajout dans Firestore
      await FirestoreService().addProperty(data);

      if (!mounted) return;
      
      // Dialog de confirmation
      await showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Votre demande est en cours de traitement'),
          content: const Text(
            'Votre annonce sera publiée après validation par un administrateur.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Fermer'),
            ),
          ],
        ),
      );

      if (!mounted) return;
      Navigator.pop(context); // Retour à HomePage
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajouter une annonce')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Champ Titre
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(
              labelText: 'Titre',
              prefixIcon: Icon(Icons.title),
            ),
          ),
          const SizedBox(height: 16),
          
          // Champ Description
          TextField(
            controller: _descriptionController,
            decoration: const InputDecoration(
              labelText: 'Description',
              prefixIcon: Icon(Icons.description),
            ),
            maxLines: 4,
          ),
          const SizedBox(height: 16),
          
          // Dropdown Type
          DropdownButtonFormField<String>(
            value: _selectedType,
            decoration: const InputDecoration(
              labelText: 'Type',
              prefixIcon: Icon(Icons.category),
            ),
            items: _propertyTypes.map((type) {
              return DropdownMenuItem(value: type, child: Text(type));
            }).toList(),
            onChanged: (val) => setState(() => _selectedType = val!),
          ),
          const SizedBox(height: 16),
          
          // Dropdown Purpose (Louer/Vendre)
          DropdownButtonFormField<String>(
            value: _selectedPurpose,
            decoration: const InputDecoration(
              labelText: 'But',
              prefixIcon: Icon(Icons.real_estate_agent),
            ),
            items: const [
              DropdownMenuItem(value: 'rent', child: Text('À louer')),
              DropdownMenuItem(value: 'sale', child: Text('À vendre')),
            ],
            onChanged: (val) => setState(() => _selectedPurpose = val!),
          ),
          const SizedBox(height: 16),
          
          // Champ Prix
          TextField(
            controller: _priceController,
            decoration: const InputDecoration(
              labelText: 'Prix (TND)',
              prefixIcon: Icon(Icons.attach_money),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          
          // Champ Surface
          TextField(
            controller: _surfaceController,
            decoration: const InputDecoration(
              labelText: 'Surface (m²)',
              prefixIcon: Icon(Icons.square_foot),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          
          // Champ Pièces
          TextField(
            controller: _roomsController,
            decoration: const InputDecoration(
              labelText: 'Nombre de pièces',
              prefixIcon: Icon(Icons.bed),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          
          // Champ Localisation
          TextField(
            controller: _locationController,
            decoration: const InputDecoration(
              labelText: 'Adresse',
              prefixIcon: Icon(Icons.location_on),
            ),
          ),
          const SizedBox(height: 16),
          
          // Bouton Sélectionner GPS
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
          ),
          
          if (_selectedLatitude != null && _selectedLongitude != null) ...[
            const SizedBox(height: 8),
            Text(
              'Position: ${_selectedLatitude!.toStringAsFixed(6)}, ${_selectedLongitude!.toStringAsFixed(6)}',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
          
          const SizedBox(height: 24),
          
          // Section Images
          const Text(
            'Images (URLs)',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          
          ...List.generate(_imageUrlControllers.length, (index) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: TextField(
                controller: _imageUrlControllers[index],
                decoration: InputDecoration(
                  labelText: 'URL Image ${index + 1}',
                  prefixIcon: const Icon(Icons.image),
                ),
              ),
            );
          }),
          
          // Bouton Ajouter Image
          if (_imageUrlControllers.length < 5)
            TextButton.icon(
              onPressed: () {
                setState(() {
                  _imageUrlControllers.add(TextEditingController());
                });
              },
              icon: const Icon(Icons.add),
              label: const Text('Ajouter une image'),
            ),
          
          const SizedBox(height: 24),
          
          // Bouton Soumettre
          ElevatedButton(
            onPressed: _loading ? null : _submit,
            child: _loading
                ? const CircularProgressIndicator()
                : const Text('Publier l\'annonce'),
          ),
        ],
      ),
    );
  }
}
```

---

## ⭐ FAVORIS

### FavoritesPage (`favorites/favorites_page.dart`)

**Fonctionnalités**:
- Liste des propriétés favorites de l'utilisateur
- StreamBuilder sur `users/{uid}/favorites`
- Chaque favori charge PropertyModel depuis Firestore
- Empty state si aucun favori

**Structure (149 lignes totales)**:
```dart
class FavoritesPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) {
      return const Center(child: Text('Veuillez vous connecter'));
    }

    final fs = FirestoreService();

    return StreamBuilder<QuerySnapshot>(
      stream: fs.streamFavorites(uid),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 80, color: Colors.red),
                const SizedBox(height: 16),
                Text('Erreur: ${snapshot.error}'),
              ],
            ),
          );
        }

        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.favorite_border, size: 80, color: Colors.grey),
                SizedBox(height: 16),
                Text('Aucun favori'),
              ],
            ),
          );
        }

        final favDocs = snapshot.data!.docs;

        // FutureBuilder pour charger les propriétés
        return FutureBuilder<List<PropertyModel?>>(
          future: Future.wait(
            favDocs.map((fav) async {
              final favData = fav.data() as Map<String, dynamic>?;
              final propId = favData?['propertyId'] as String?;
              if (propId == null) return null;
              
              final propDoc = await fs.propertiesRef.doc(propId).get();
              final data = propDoc.data() as Map<String, dynamic>?;
              if (data == null) return null;
              
              return PropertyModel.fromMap(data, propId);
            }),
          ),
          builder: (context, propSnapshot) {
            if (propSnapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (propSnapshot.hasError) {
              return Center(child: Text('Erreur: ${propSnapshot.error}'));
            }

            final properties = propSnapshot.data
                ?.where((p) => p != null)
                .cast<PropertyModel>()
                .toList() ?? [];

            if (properties.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.favorite_border, size: 80, color: Colors.grey),
                    SizedBox(height: 16),
                    Text('Aucun favori'),
                  ],
                ),
              );
            }

            // Liste des propriétés favorites
            return ListView.builder(
              itemCount: properties.length,
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                return PropertyCard(
                  property: properties[index],
                  onTap: () {
                    Navigator.pushNamed(
                      context,
                      '/property_detail',
                      arguments: properties[index],
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  }
}
```

---

## 💬 MESSAGERIE

### MessagesPage (`messages/messages_page.dart`)

**Fonctionnalités**:
- Liste des conversations
- StreamBuilder sur `chats` where participants contains currentUserId
- Déduplication par utilisateur (garde la plus récente)
- Affiche: avatar, nom, dernier message, timestamp
- Badge "Commencer la conversation" si chat vide

**Structure (273 lignes totales)** - Voir fichier complet

**Points clés**:
```dart
// Déduplication des conversations
final Map<String, QueryDocumentSnapshot> uniqueChats = {};
for (final chat in chats) {
  final chatData = chat.data() as Map<String, dynamic>;
  final participants = List<String>.from(chatData['participants'] ?? []);
  final otherUserId = participants.firstWhere(
    (id) => id != currentUserId,
    orElse: () => '',
  );
  
  if (otherUserId.isNotEmpty && !uniqueChats.containsKey(otherUserId)) {
    uniqueChats[otherUserId] = chat;
  }
}

// Affichage avec timeago
timeago.setLocaleMessages('fr', timeago.FrMessages());
final timeAgo = timeago.format(lastMessageTime.toDate(), locale: 'fr');
```

---

### ChatPage (`chat/chat_page.dart`)

**Fonctionnalités**:
- Conversation individuelle
- StreamBuilder sur `chats/{chatId}/messages`
- Bulles de messages (sender à droite, receiver à gauche)
- Champ de saisie + bouton envoi
- Auto-scroll vers dernier message
- Empty state avec icône

**Structure (430 lignes totales)** - Voir fichier complet

**Points clés**:
```dart
// StreamBuilder pour messages
StreamBuilder<QuerySnapshot>(
  stream: FirebaseFirestore.instance
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', descending: true)
      .snapshots(),
  builder: (context, snapshot) {
    final messages = snapshot.data?.docs ?? [];
    
    return ListView.builder(
      reverse: true, // Derniers messages en bas
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final msg = messages[index].data() as Map<String, dynamic>;
        final isSender = msg['senderId'] == currentUserId;
        
        return Align(
          alignment: isSender ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSender ? Colors.blue : Colors.grey[300],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              msg['text'] ?? '',
              style: TextStyle(
                color: isSender ? Colors.white : Colors.black,
              ),
            ),
          ),
        );
      },
    );
  },
)

// Envoi de message
Future<void> _sendMessage() async {
  final text = _messageController.text.trim();
  if (text.isEmpty) return;
  
  await FirestoreService().sendMessage(
    chatId: chatId,
    senderId: currentUserId,
    receiverId: otherUserId,
    text: text,
  );
  
  _messageController.clear();
}
```

---

## 👤 PROFIL

### ProfilePage (`profile/profile_page.dart`)

**Fonctionnalités**:
- Header: avatar, nom, email, téléphone
- Bouton changement de thème (3 thèmes)
- Section "Mes annonces" (StreamBuilder)
- Bouton "Administration" (si isAdmin = true)
- Boutons: Modifier profil, Changer mot de passe, À propos

**Structure (283 lignes totales)** - Voir fichier complet

---

## 👔 ADMINISTRATION

### AdminPage (`admin/admin_page.dart`)

**Fonctionnalités**:
- TabBar: Utilisateurs, En attente, Annonces
- Liste des propriétés en attente (status = 'pending')
- Boutons: Approuver, Rejeter, Supprimer
- Statistiques: Total propriétés, En attente, Approuvés

**Structure (619 lignes totales)** - Voir fichier complet

**Points clés**:
```dart
// Onglet "En attente"
StreamBuilder<QuerySnapshot>(
  stream: FirebaseFirestore.instance
      .collection('properties')
      .where('status', isEqualTo: 'pending')
      .snapshots(),
  builder: (context, snapshot) {
    final properties = snapshot.data?.docs ?? [];
    
    return ListView.builder(
      itemCount: properties.length,
      itemBuilder: (context, index) {
        final property = properties[index];
        
        return Card(
          child: ListTile(
            title: Text(property['title']),
            subtitle: Text('${property['price']} TND'),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Bouton Approuver
                IconButton(
                  icon: const Icon(Icons.check, color: Colors.green),
                  onPressed: () async {
                    await FirestoreService().updatePropertyStatus(
                      property.id,
                      'approved',
                    );
                  },
                ),
                // Bouton Rejeter
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.red),
                  onPressed: () async {
                    await FirestoreService().updatePropertyStatus(
                      property.id,
                      'rejected',
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  },
)
```

---

**📄 Continuer avec**: 
- [PARTIE 1: Structure & Navigation](./FLUTTER_DOCUMENTATION_PART1.md)
- [PARTIE 3: Code Source Widgets & Services](./FLUTTER_DOCUMENTATION_PART3.md)
- [PARTIE 4: Modèles, Firebase, Design System](./FLUTTER_DOCUMENTATION_PART4.md)
