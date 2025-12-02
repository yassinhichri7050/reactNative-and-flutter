import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../constants.dart';
import '../../services/firestore_service.dart';
import '../../widgets/location_picker.dart';

class AddPropertyPage extends StatefulWidget {
  const AddPropertyPage({super.key});

  @override
  State<AddPropertyPage> createState() => _AddPropertyPageState();
}

class _AddPropertyPageState extends State<AddPropertyPage> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _surfaceController = TextEditingController();
  final _roomsController = TextEditingController();
  final _locationController = TextEditingController();
  final _latitudeController = TextEditingController();
  final _longitudeController = TextEditingController();
  final List<TextEditingController> _imageUrlControllers = [
    TextEditingController(),
  ];

  String _selectedType = 'Appartement';
  String _selectedPurpose = 'sale'; // New: rent or sale
  bool _loading = false;
  double? _selectedLatitude;
  double? _selectedLongitude;

  final List<String> _propertyTypes = [
    'Maison',
    'Appartement',
    'Terrain',
    'Commerce',
  ];

  final Map<String, String> _purposeOptions = {
    'rent': 'Maison à louer',
    'sale': 'Maison à vendre',
  };

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _surfaceController.dispose();
    _roomsController.dispose();
    _locationController.dispose();
    _latitudeController.dispose();
    _longitudeController.dispose();
    for (final c in _imageUrlControllers) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Veuillez vous connecter')),
        );
      }
      return;
    }

    final title = _titleController.text.trim();
    final priceText = _priceController.text.trim();
    if (title.isEmpty || priceText.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Veuillez remplir le titre et le prix.')),
        );
      }
      return;
    }

    final price = double.tryParse(priceText);
    final surface = double.tryParse(_surfaceController.text.trim()) ?? 0.0;
    final rooms = int.tryParse(_roomsController.text.trim()) ?? 0;
    // Utiliser les coordonnées sélectionnées sur la carte ou les champs manuels
    final latitude = _selectedLatitude ?? double.tryParse(_latitudeController.text.trim());
    final longitude = _selectedLongitude ?? double.tryParse(_longitudeController.text.trim());
    if (price == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Prix invalide')),
        );
      }
      return;
    }

    setState(() => _loading = true);

    try {
      // Collecter toutes les URLs d'images non vides
      final List<String> imageUrls = _imageUrlControllers
          .map((c) => c.text.trim())
          .where((url) => url.isNotEmpty)
          .toList();

      if (imageUrls.isEmpty) {
        imageUrls.add(kDefaultPropertyImage);
      }

      final data = {
        'title': title,
        'description': _descriptionController.text.trim(),
        'price': price,
        'surface': surface,
        'type': _selectedType,
        'purpose': _selectedPurpose, // New: add purpose field
        'rooms': rooms,
        'location': _locationController.text.trim(),
        'userId': uid,
        'latitude': latitude,
        'longitude': longitude,
        'images': imageUrls, // taw URL wla []
        'isFeatured': false,
      };

      await FirestoreService().addProperty(data);

      if (!mounted) return;
      await showDialog<void>(
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
      final messenger = ScaffoldMessenger.of(context);
      final snackBg = Theme.of(context).colorScheme.secondary;
      final snackFg = Theme.of(context).colorScheme.onSecondary;
      Navigator.pop(context);
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            'Annonce envoyée pour validation',
            style: TextStyle(
              color: snackFg,
            ),
          ),
          duration: const Duration(seconds: 2),
          backgroundColor: snackBg,
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la publication: $e', style: TextStyle(color: Theme.of(context).colorScheme.onSecondary)),
            duration: const Duration(seconds: 5),
            backgroundColor: Theme.of(context).colorScheme.secondary,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
            children: [
              TextField(
                controller: _titleController,
                decoration: InputDecoration(
                  labelText: 'Titre',
                  border:
                      OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: 'Description',
                  border:
                      OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                maxLines: 4,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _selectedType,
                items: _propertyTypes
                    .map(
                      (type) =>
                          DropdownMenuItem(value: type, child: Text(type)),
                    )
                    .toList(),
                onChanged: (value) =>
                    setState(() => _selectedType = value ?? _selectedType),
                decoration: InputDecoration(
                  labelText: 'Type',
                  border:
                      OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              // New: Purpose dropdown (rent or sale)
              DropdownButtonFormField<String>(
                value: _selectedPurpose,
                items: _purposeOptions.entries
                    .map(
                      (entry) =>
                          DropdownMenuItem(value: entry.key, child: Text(entry.value)),
                    )
                    .toList(),
                onChanged: (value) =>
                    setState(() => _selectedPurpose = value ?? _selectedPurpose),
                decoration: InputDecoration(
                  labelText: 'Type d\'annonce',
                  border:
                      OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _priceController,
                      decoration: InputDecoration(
                        labelText: 'Prix (DT)',
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _surfaceController,
                      decoration: InputDecoration(
                        labelText: 'Surface (m²)',
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _roomsController,
                      decoration: InputDecoration(
                        labelText: 'Pièces',
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _locationController,
                      decoration: InputDecoration(
                        labelText: 'Localisation',
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Sélecteur de localisation GPS sur carte
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.grey.shade50,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          color: Theme.of(context).colorScheme.secondary,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Position GPS (optionnel)',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (_selectedLatitude != null && _selectedLongitude != null) ...[
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.green.shade200),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.check_circle, color: Colors.green.shade700, size: 16),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Lat: ${_selectedLatitude!.toStringAsFixed(4)}, Lng: ${_selectedLongitude!.toStringAsFixed(4)}',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.green.shade800,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, size: 16),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                              onPressed: () {
                                setState(() {
                                  _selectedLatitude = null;
                                  _selectedLongitude = null;
                                  _latitudeController.clear();
                                  _longitudeController.clear();
                                });
                              },
                              tooltip: 'Supprimer',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 6),
                    ],
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => LocationPicker(
                                initialLatitude: _selectedLatitude,
                                initialLongitude: _selectedLongitude,
                                onLocationSelected: (lat, lng) {
                                  setState(() {
                                    _selectedLatitude = lat;
                                    _selectedLongitude = lng;
                                    _latitudeController.text = lat.toStringAsFixed(6);
                                    _longitudeController.text = lng.toStringAsFixed(6);
                                  });
                                },
                              ),
                            ),
                          );
                        },
                        icon: Icon(
                          _selectedLatitude != null ? Icons.edit_location : Icons.map,
                          size: 18,
                        ),
                        label: Text(
                          _selectedLatitude != null
                              ? 'Modifier'
                              : 'Choisir sur carte',
                          style: const TextStyle(fontSize: 13),
                        ),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Champs URL images multiples
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ...List.generate(_imageUrlControllers.length, (index) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: TextField(
                        controller: _imageUrlControllers[index],
                        decoration: InputDecoration(
                          labelText: 'Lien image ${index + 1} (URL)',
                          hintText: 'https://exemple.com/maison.jpg',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          suffixIcon: _imageUrlControllers.length > 1
                              ? IconButton(
                                  icon: const Icon(Icons.close),
                                  onPressed: () {
                                    setState(() {
                                      _imageUrlControllers.removeAt(index).dispose();
                                    });
                                  },
                                )
                              : null,
                        ),
                      ),
                    );
                  }),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton.icon(
                      onPressed: () {
                        setState(() {
                          _imageUrlControllers.add(TextEditingController());
                        });
                      },
                      icon: const Icon(Icons.add_link),
                      label: const Text('Ajouter une image'),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _loading
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            ),
                            SizedBox(width: 12),
                            Text('Publication...'),
                          ],
                        )
                      : const Text('Publier', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      );
  }
}
