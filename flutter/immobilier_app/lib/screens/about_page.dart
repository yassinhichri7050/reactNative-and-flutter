import 'package:flutter/material.dart';
import '../services/seed_service.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('À propos')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('ImmobilierApp', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Version 1.0.0'),
            const SizedBox(height: 16),
            const Text('Description:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Application de gestion d\'annonces immobilières, avec recherche, favoris, messagerie et profil utilisateur.'),
            const SizedBox(height: 16),
            const Text('Contact:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('support@immobilierapp.local'),
            const SizedBox(height: 24),
            // Debug seed data button (manual action only)
            ElevatedButton(
              onPressed: () async {
                final seed = SeedService();
                try {
                  await seed.seedDemoProperties(count: 25);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Seed: propriétés de démonstration ajoutées (si la collection était vide)')));
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur seed: $e')));
                }
              },
              child: const Text('Générer des données de démonstration'),
            ),
          ],
        ),
      ),
    );
  }
}
