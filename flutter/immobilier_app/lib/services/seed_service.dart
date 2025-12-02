import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';

class SeedService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final _rand = Random();

  List<String> _titles = [
    'Appartement moderne',
    'Maison familiale',
    'Studio cosy',
    'Villa avec jardin',
    'Terrain à bâtir',
    'Commerce centre-ville',
    'Loft lumineux',
    'T2 rénové',
    'Penthouse',
    'Maison de campagne',
  ];

  List<String> _locations = [
    'Quartier du Parc',
    'Centre-ville',
    'La Plaine',
    'Les Rives',
    'Vieux Port',
    'Les Hauteurs',
    'Belleville',
    'Mont-Rose',
    'Saint-Martin',
    'Les Près',
  ];

  Future<void> seedDemoProperties({int count = 20}) async {
    final ref = _db.collection('properties');
    final snapshot = await ref.limit(1).get();
    if (snapshot.docs.isNotEmpty) {
      // If there is already data, do not seed automatically
      return;
    }

    for (var i = 0; i < count; i++) {
      final title = _titles[_rand.nextInt(_titles.length)];
      final location = _locations[_rand.nextInt(_locations.length)];
      final price = (_rand.nextInt(900) + 50) * 1000; // 50k - 950k
      final surface = (_rand.nextInt(200) + 20).toDouble();
      final rooms = _rand.nextInt(6) + 1;
      final type = _rand.nextBool() ? 'Appartement' : 'Maison';
      final images = <String>[]; // empty images for demo (can be extended)

      final data = {
        'title': '$title ${i + 1}',
        'description': 'Belle propriété $title située à $location. Idéal pour famille ou investissement.',
        'price': price,
        'surface': surface,
        'type': type,
        'rooms': rooms,
        'location': location,
        'userId': 'seed',
        'latitude': 0.0,
        'longitude': 0.0,
        'images': images,
        'isFeatured': i % 7 == 0,
        'createdAt': FieldValue.serverTimestamp(),
      };

      await ref.add(data);
    }
  }
}
