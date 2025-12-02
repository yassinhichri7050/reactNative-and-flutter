import 'package:flutter/material.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFD4AF37),
        foregroundColor: Colors.white,
        title: const Text('Profil'),
        centerTitle: true,
      ),
      body: const Center(child: Text('Gérer profil (photo, email, mes annonces, favoris)')),
    );
  }
}
