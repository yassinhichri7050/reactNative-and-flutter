import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:provider/provider.dart';
import '../../models/property_model.dart';
import '../../services/firestore_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/property_card_modern.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late FirestoreService fs;
  String _selectedPurpose = 'all'; // 'all', 'rent', 'sale'
  String _selectedType = 'all'; // 'all', 'Maison', 'Appartement', etc.
  Set<String> _favoriteIds = {};

  @override
  void initState() {
    super.initState();
    fs = FirestoreService();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final userId = auth.currentUser?.uid;
    if (userId == null) return;

    final snapshot = await FirebaseFirestore.instance
        .collection('users')
        .doc(userId)
        .collection('favorites')
        .get();

    if (mounted) {
      setState(() {
        _favoriteIds = snapshot.docs.map((doc) => doc.id).toSet();
      });
    }
  }

  Future<void> _toggleFavorite(PropertyModel property) async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final userId = auth.currentUser?.uid;
    if (userId == null) return;

    final favRef = FirebaseFirestore.instance
        .collection('users')
        .doc(userId)
        .collection('favorites')
        .doc(property.id);

    if (_favoriteIds.contains(property.id)) {
      await favRef.delete();
      if (mounted) {
        setState(() => _favoriteIds.remove(property.id));
      }
    } else {
      await favRef.set({'addedAt': FieldValue.serverTimestamp()});
      if (mounted) {
        setState(() => _favoriteIds.add(property.id));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        setState(() {});
        await _loadFavorites();
        await Future.delayed(const Duration(milliseconds: 500));
      },
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // Search Bar with Location
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: Column(
                children: [
                  // Search field
                  GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/search'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.search, color: Colors.grey[600], size: 22),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Recherche par localisation',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 15,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Filter buttons
                  Row(
                    children: [
                      Expanded(
                        child: _buildFilterButton(
                          'Type',
                          _selectedType == 'all' ? null : _selectedType,
                          Icons.home_outlined,
                          () => _showTypeFilter(context),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildFilterButton(
                          'Prix',
                          null,
                          Icons.attach_money,
                          () => _showPriceFilter(context),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildFilterButton(
                          _selectedPurpose == 'all' 
                              ? 'But'
                              : (_selectedPurpose == 'rent' ? 'Louer' : 'Vendre'),
                          null,
                          Icons.category_outlined,
                          () => _showPurposeFilter(context),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        height: 46,
                        width: 46,
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.secondary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.tune, color: Colors.white, size: 22),
                          onPressed: () => _showAllFilters(context),
                          padding: EdgeInsets.zero,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Properties count header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
              child: StreamBuilder<QuerySnapshot>(
                stream: _buildFilteredStream(),
                builder: (context, snapshot) {
                  final count = snapshot.hasData ? snapshot.data!.docs.length : 0;
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Liste des annonces',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      Text(
                        '$count annonces',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 14,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),

          // Properties Grid
          StreamBuilder<QuerySnapshot>(
            stream: _buildFilteredStream(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.75,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => Container(
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      childCount: 6,
                    ),
                  ),
                );
              }

              if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                return SliverFillRemaining(
                  child: _buildEmptyState(context, 'Annonces'),
                );
              }

              var properties = snapshot.data!.docs
                  .map((doc) => PropertyModel.fromMap(
                        doc.data() as Map<String, dynamic>,
                        doc.id,
                      ))
                  .where((prop) =>
                      prop.status == 'approved' ||
                      prop.status.isEmpty ||
                      prop.status == '')
                  .toList();

              properties.sort((a, b) =>
                  (b.createdAt ?? DateTime.now())
                      .compareTo(a.createdAt ?? DateTime.now()));

              if (properties.isEmpty) {
                return SliverFillRemaining(
                  child: _buildEmptyState(context, 'Annonces'),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.75,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final prop = properties[index];
                      return PropertyCardModern(
                        property: prop,
                        onTap: () => Navigator.pushNamed(
                          context,
                          '/property_detail',
                          arguments: prop,
                        ),
                        onFavoriteToggle: () => _toggleFavorite(prop),
                        isFavorite: _favoriteIds.contains(prop.id),
                      );
                    },
                    childCount: properties.length,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  // Build filtered stream based on selected filters
  Stream<QuerySnapshot> _buildFilteredStream() {
    Query query = FirebaseFirestore.instance
        .collection('properties');

    if (_selectedPurpose != 'all') {
      query = query.where('purpose', isEqualTo: _selectedPurpose);
    }

    if (_selectedType != 'all') {
      query = query.where('type', isEqualTo: _selectedType);
    }

    return query
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  // Filter button widget
  Widget _buildFilterButton(String label, String? value, IconData icon, VoidCallback onTap) {
    final hasValue = value != null && value.isNotEmpty;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: hasValue 
                ? Theme.of(context).colorScheme.secondary 
                : Colors.grey[300]!,
            width: hasValue ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: hasValue 
                  ? Theme.of(context).colorScheme.secondary 
                  : Colors.grey[700],
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                hasValue ? value : label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: hasValue ? FontWeight.w600 : FontWeight.w500,
                  color: hasValue 
                      ? Theme.of(context).colorScheme.secondary 
                      : Colors.grey[800],
                ),
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
              ),
            ),
            Icon(
              Icons.keyboard_arrow_down,
              size: 18,
              color: Colors.grey[600],
            ),
          ],
        ),
      ),
    );
  }

  // Show type filter dialog
  void _showTypeFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Type de bien',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            _buildFilterOption('Tous types', _selectedType == 'all', () {
              setState(() => _selectedType = 'all');
              Navigator.pop(context);
            }),
            _buildFilterOption('Maison', _selectedType == 'Maison', () {
              setState(() => _selectedType = 'Maison');
              Navigator.pop(context);
            }),
            _buildFilterOption('Appartement', _selectedType == 'Appartement', () {
              setState(() => _selectedType = 'Appartement');
              Navigator.pop(context);
            }),
            _buildFilterOption('Terrain', _selectedType == 'Terrain', () {
              setState(() => _selectedType = 'Terrain');
              Navigator.pop(context);
            }),
            _buildFilterOption('Commerce', _selectedType == 'Commerce', () {
              setState(() => _selectedType = 'Commerce');
              Navigator.pop(context);
            }),
          ],
        ),
      ),
    );
  }

  // Show purpose filter dialog
  void _showPurposeFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Type d\'annonce',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            _buildFilterOption('Tous', _selectedPurpose == 'all', () {
              setState(() => _selectedPurpose = 'all');
              Navigator.pop(context);
            }),
            _buildFilterOption('À louer', _selectedPurpose == 'rent', () {
              setState(() => _selectedPurpose = 'rent');
              Navigator.pop(context);
            }),
            _buildFilterOption('À vendre', _selectedPurpose == 'sale', () {
              setState(() => _selectedPurpose = 'sale');
              Navigator.pop(context);
            }),
          ],
        ),
      ),
    );
  }

  // Show price filter dialog (placeholder)
  void _showPriceFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Filtre par prix',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            Text(
              'Filtre de prix disponible prochainement',
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Fermer'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Show all filters dialog (placeholder)
  void _showAllFilters(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Tous les filtres',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  child: Text(
                    'Filtres avancés disponibles prochainement',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Fermer'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Filter option widget
  Widget _buildFilterOption(String label, bool selected, VoidCallback onTap) {
    return ListTile(
      title: Text(
        label,
        style: TextStyle(
          fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          color: selected ? Theme.of(context).colorScheme.secondary : null,
        ),
      ),
      trailing: selected
          ? Icon(
              Icons.check_circle,
              color: Theme.of(context).colorScheme.secondary,
            )
          : null,
      onTap: onTap,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
    );
  }

  // Empty state
  Widget _buildEmptyState(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.all(48),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.home_work_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Aucun bien trouvé',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Essayez de modifier vos filtres',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[500],
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
