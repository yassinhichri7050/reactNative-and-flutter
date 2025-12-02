import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../models/property_model.dart';
import '../../services/firestore_service.dart';
import '../../widgets/property_card.dart';

class FavoritesPage extends StatelessWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) {
      return const Center(
        child: Text('Veuillez vous connecter'),
      );
    }

    final fs = FirestoreService();

    return StreamBuilder<QuerySnapshot>(
        stream: fs.streamFavorites(uid),
        builder: (context, snapshot) {
          debugPrint('[FavoritesPage] connectionState: ${snapshot.connectionState}');
          debugPrint('[FavoritesPage] hasData: ${snapshot.hasData}');
          debugPrint('[FavoritesPage] hasError: ${snapshot.hasError}');
          if (snapshot.hasError) {
            debugPrint('[FavoritesPage] error: ${snapshot.error}');
          }
          if (snapshot.hasData) {
            debugPrint('[FavoritesPage] docs count: ${snapshot.data!.docs.length}');
          }

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
          debugPrint('[FavoritesPage] fetching ${favDocs.length} favorite properties');

          return FutureBuilder<List<PropertyModel?>>(
            future: Future.wait(
              favDocs.map((fav) async {
                final favData = fav.data() as Map<String, dynamic>?;
                final propId = favData?['propertyId'] as String?;
                debugPrint('[FavoritesPage] fetching property: $propId');
                if (propId == null) {
                  debugPrint('[FavoritesPage] favorite doc has no propertyId');
                  return null;
                }
                final propDoc = await fs.propertiesRef.doc(propId).get();
                final data = propDoc.data() as Map<String, dynamic>?;
                if (data == null) {
                  debugPrint('[FavoritesPage] property $propId not found');
                  return null;
                }
                debugPrint('[FavoritesPage] loaded property: ${data['title']}');
                final property = PropertyModel.fromMap(data, propId);
                // Show all properties in favorites (approved, pending, or legacy)
                return property;
              }),
            ),
            builder: (context, propSnapshot) {
              debugPrint('[FavoritesPage] FutureBuilder state: ${propSnapshot.connectionState}');
              debugPrint('[FavoritesPage] FutureBuilder hasData: ${propSnapshot.hasData}');
              debugPrint('[FavoritesPage] FutureBuilder hasError: ${propSnapshot.hasError}');

              if (propSnapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (propSnapshot.hasError) {
                debugPrint('[FavoritesPage] FutureBuilder error: ${propSnapshot.error}');
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 80, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('Erreur: ${propSnapshot.error}'),
                    ],
                  ),
                );
              }

              if (!propSnapshot.hasData) {
                debugPrint('[FavoritesPage] FutureBuilder has no data');
                return const Center(child: Text('Aucun favori disponible pour le moment.'));
              }

              final properties = propSnapshot.data!
                  .whereType<PropertyModel>()
                  .toList();
              debugPrint('[FavoritesPage] filtered properties count: ${properties.length}');

              if (properties.isEmpty) {
                return const Center(
                  child: Text('Aucun favori disponible pour le moment.'),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: properties.length,
                itemBuilder: (context, index) {
                  final prop = properties[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: GestureDetector(
                      onTap: () => Navigator.pushNamed(context, '/property_detail',
                          arguments: prop),
                      child: PropertyCard(property: prop, horizontal: true),
                    ),
                  );
                },
              );
            },
          );
        },
      );
  }
}
