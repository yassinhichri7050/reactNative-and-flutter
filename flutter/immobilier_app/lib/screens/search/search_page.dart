import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/property_model.dart';
import '../../services/firestore_service.dart';
import '../../widgets/property_card.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final _searchController = TextEditingController();
  double? _minPrice;
  double? _maxPrice;
  double? _minSurface;
  double? _maxSurface;
  int? _minRooms;
  String? _selectedType;
  String? _location;
  bool _showFilters = false;

  final List<String> _propertyTypes = [
    'Tous',
    'Maison',
    'Appartement',
    'Terrain',
    'Commerce'
  ];

  bool get _hasActiveFilters =>
      _selectedType != null ||
      _minPrice != null ||
      _maxPrice != null ||
      _minSurface != null ||
      _maxSurface != null ||
      _minRooms != null ||
      _location != null ||
      _searchController.text.isNotEmpty;

  void _resetFilters() {
    setState(() {
      _searchController.clear();
      _minPrice = null;
      _maxPrice = null;
      _minSurface = null;
      _maxSurface = null;
      _minRooms = null;
      _selectedType = null;
      _location = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final fs = FirestoreService();

    return Column(
      children: [
        SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_hasActiveFilters)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.secondary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.filter_alt,
                            color: Colors.white, size: 16),
                        SizedBox(width: 4),
                        Text(
                          'Filtres actifs',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Mot-clé ou localisation',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              setState(() {});
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  onChanged: (v) => setState(() {}),
                ),
                const SizedBox(height: 12),

                GestureDetector(
                  onTap: () => setState(() => _showFilters = !_showFilters),
                  child: Row(
                    children: [
                      Icon(
                        _showFilters ? Icons.expand_less : Icons.expand_more,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Filtres avancés',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Theme.of(context).colorScheme.secondary,
                          fontSize: 14,
                        ),
                      ),
                      const Spacer(),
                      if (_hasActiveFilters)
                        TextButton(
                          onPressed: _resetFilters,
                          child: const Text(
                            'Réinitialiser',
                            style: TextStyle(fontSize: 12),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                if (_showFilters) ...[
                  Text(
                    'Type de bien',
                    style: Theme.of(context).textTheme.labelLarge,
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: _propertyTypes
                        .map((type) => FilterChip(
                              label: Text(type),
                              selected: _selectedType == type,
                              onSelected: (selected) => setState(
                                  () => _selectedType = selected ? type : null),
                            ))
                        .toList(),
                  ),
                  const SizedBox(height: 16),

                  Text(
                    'Plage de prix (DT)',
                    style: Theme.of(context).textTheme.labelLarge,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            labelText: 'Min',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            prefixText: 'DT ',
                          ),
                          keyboardType: TextInputType.number,
                          onChanged: (v) =>
                              setState(() => _minPrice = double.tryParse(v)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            labelText: 'Max',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            prefixText: 'DT ',
                          ),
                          keyboardType: TextInputType.number,
                          onChanged: (v) =>
                              setState(() => _maxPrice = double.tryParse(v)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  Text(
                    'Surface (m²)',
                    style: Theme.of(context).textTheme.labelLarge,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            labelText: 'Min',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            suffixText: 'm²',
                          ),
                          keyboardType: TextInputType.number,
                          onChanged: (v) =>
                              setState(() => _minSurface = double.tryParse(v)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            labelText: 'Max',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            suffixText: 'm²',
                          ),
                          keyboardType: TextInputType.number,
                          onChanged: (v) =>
                              setState(() => _maxSurface = double.tryParse(v)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  Text(
                    'Nombre de pièces',
                    style: Theme.of(context).textTheme.labelLarge,
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    decoration: InputDecoration(
                      labelText: 'Minimum',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                    keyboardType: TextInputType.number,
                    onChanged: (v) =>
                        setState(() => _minRooms = int.tryParse(v)),
                  ),
                  const SizedBox(height: 12),
                ],
              ],
            ),
          ),
        ),
        const Divider(height: 0),

        // RESULTS
        Expanded(
          child: StreamBuilder<QuerySnapshot>(
            stream: fs.streamPropertiesFiltered(
              keyword: _searchController.text,
              type: _selectedType,
              minPrice: _minPrice,
              maxPrice: _maxPrice,
              minSurface: _minSurface,
            ),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                return _buildEmptyState();
              }

              var properties = snapshot.data!.docs
                  .map((doc) => PropertyModel.fromMap(
                        doc.data() as Map<String, dynamic>,
                        doc.id,
                      ))
                  // نخلي approved واللي ما عندوش status (legacy)
                  .where((prop) =>
                      prop.status == 'approved' ||
                      prop.status.isEmpty ||
                      prop.status == '')
                  .toList();

              final keyword = _searchController.text.trim().toLowerCase();
              if (keyword.isNotEmpty) {
                properties = properties
                    .where((prop) {
                      final haystack =
                          '${prop.title} ${prop.description} ${prop.location ?? ''}'
                              .toLowerCase();
                      return haystack.contains(keyword);
                    })
                    .toList();
              }

              if (_minSurface != null) {
                properties = properties
                    .where((prop) => (prop.surface ?? 0) >= _minSurface!)
                    .toList();
              }

              if (_maxSurface != null) {
                properties = properties
                    .where((prop) => (prop.surface ?? 0) <= _maxSurface!)
                    .toList();
              }

              if (_minRooms != null) {
                properties = properties
                    .where((prop) => (prop.rooms ?? 0) >= _minRooms!)
                    .toList();
              }

              if (properties.isEmpty) {
                return _buildEmptyState();
              }

              return ListView.builder(
                itemCount: properties.length,
                padding: const EdgeInsets.all(16),
                itemBuilder: (context, index) {
                  final prop = properties[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: GestureDetector(
                      onTap: () => Navigator.pushNamed(
                        context,
                        '/property_detail',
                        arguments: prop,
                      ),
                      child:
                          PropertyCard(property: prop, horizontal: true),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Aucun résultat',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Essayez d\'autres critères',
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _resetFilters,
            icon: const Icon(Icons.refresh),
            label: const Text('Réinitialiser les filtres'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
