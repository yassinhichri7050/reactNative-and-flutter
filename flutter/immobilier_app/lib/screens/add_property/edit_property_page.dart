import 'package:flutter/material.dart';

import '../../models/property_model.dart';
import '../../services/firestore_service.dart';

class EditPropertyPage extends StatefulWidget {
  final PropertyModel property;

  const EditPropertyPage({
    super.key,
    required this.property,
  });

  @override
  State<EditPropertyPage> createState() => _EditPropertyPageState();
}

class _EditPropertyPageState extends State<EditPropertyPage> {
  late final TextEditingController _titleController;
  late final TextEditingController _descriptionController;
  late final TextEditingController _priceController;
  late final TextEditingController _surfaceController;
  late final TextEditingController _roomsController;
  late final TextEditingController _locationController;
  late final List<TextEditingController> _imageUrlControllers;

  late String _selectedType;
  late String _selectedPurpose; // New: rent or sale
  bool _loading = false;

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
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.property.title);
    _descriptionController = TextEditingController(text: widget.property.description);
    _priceController = TextEditingController(text: widget.property.price.toStringAsFixed(0));
    _surfaceController = TextEditingController(text: widget.property.surface?.toStringAsFixed(0) ?? '0');
    _roomsController = TextEditingController(text: widget.property.rooms?.toString() ?? '0');
    _locationController = TextEditingController(text: widget.property.location ?? '');
    _selectedType = widget.property.type;
    _selectedPurpose = widget.property.purpose; // Initialize with existing purpose

    // Initialize image URL controllers with existing images
    _imageUrlControllers = widget.property.images
        .map((url) => TextEditingController(text: url))
        .toList();
    // Add one empty controller if there are no images
    if (_imageUrlControllers.isEmpty) {
      _imageUrlControllers.add(TextEditingController());
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _surfaceController.dispose();
    _roomsController.dispose();
    _locationController.dispose();
    for (final c in _imageUrlControllers) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
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
      // Collect all non-empty image URLs
      final List<String> imageUrls = _imageUrlControllers
          .map((c) => c.text.trim())
          .where((url) => url.isNotEmpty)
          .toList();

      final updatedData = {
        'title': title,
        'description': _descriptionController.text.trim(),
        'price': price,
        'surface': surface,
        'type': _selectedType,
        'purpose': _selectedPurpose, // New: add purpose field
        'rooms': rooms,
        'location': _locationController.text.trim(),
        'images': imageUrls,
      };

      await FirestoreService().updateProperty(widget.property.id, updatedData);

      if (!mounted) return;
      Navigator.pop(context, true); // Return true to indicate successful update
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Annonce mise à jour', style: TextStyle(color: Theme.of(context).colorScheme.onSecondary)),
          duration: const Duration(seconds: 2),
          backgroundColor: Theme.of(context).colorScheme.secondary,
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la mise à jour: $e', style: TextStyle(color: Theme.of(context).colorScheme.onSecondary)),
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
    return Scaffold(
      appBar: AppBar(title: const Text('Modifier l\'annonce')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ListView(
            children: [
              TextField(
                controller: _titleController,
                decoration: InputDecoration(
                  labelText: 'Titre',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                maxLines: 4,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _selectedType,
                items: _propertyTypes
                    .map(
                      (type) => DropdownMenuItem(value: type, child: Text(type)),
                    )
                    .toList(),
                onChanged: (value) =>
                    setState(() => _selectedType = value ?? _selectedType),
                decoration: InputDecoration(
                  labelText: 'Type',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              // New: Purpose dropdown (rent or sale)
              DropdownButtonFormField<String>(
                value: _selectedPurpose,
                items: _purposeOptions.entries
                    .map(
                      (entry) => DropdownMenuItem(value: entry.key, child: Text(entry.value)),
                    )
                    .toList(),
                onChanged: (value) =>
                    setState(() => _selectedPurpose = value ?? _selectedPurpose),
                decoration: InputDecoration(
                  labelText: 'Type d\'annonce',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
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
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
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
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            ),
                            SizedBox(width: 12),
                            Text('Mise à jour...'),
                          ],
                        )
                      : const Text('Enregistrer les modifications', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
