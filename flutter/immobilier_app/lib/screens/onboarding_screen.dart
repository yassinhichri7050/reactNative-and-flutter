import 'package:flutter/material.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        children: [
          _buildPage('Bienvenue', 'Trouvez la maison de vos rêves.'),
          _buildPage('Publier', 'Publiez et gérez vos annonces facilement.'),
          _buildPage('Communiquer', 'Discutez avec les vendeurs et acheteurs.'),
        ],
      ),
      bottomSheet: TextButton(
        onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
        child: const Text('Commencer', style: TextStyle(fontSize: 18)),
      ),
    );
  }

  Widget _buildPage(String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.home_filled, size: 96),
        const SizedBox(height: 20),
        Text(title, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Text(subtitle, textAlign: TextAlign.center),
      ]),
    );
  }
}
