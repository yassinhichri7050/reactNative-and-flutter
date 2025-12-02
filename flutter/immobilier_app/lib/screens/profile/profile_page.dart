import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../services/auth_service.dart';
import '../../providers/user_provider.dart';
import '../../providers/theme_provider.dart';
import '../../services/firestore_service.dart';
import '../../models/property_model.dart';
import '../../widgets/property_card.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    debugPrint('[ProfilePage] build - auth uid: ${Provider.of<AuthService>(context).currentUser?.uid}');
    final auth = Provider.of<AuthService>(context);
    final userProvider = Provider.of<UserProvider>(context);
    final uid = auth.currentUser?.uid;

    return uid == null
        ? const Center(child: Text('Non connecté'))
        : SingleChildScrollView(
              child: Column(
                children: [
                  // Profile header
                  Container(
                    padding: const EdgeInsets.all(24),
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.06),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 40,
                              backgroundColor: Theme.of(context).colorScheme.primary,
                              child: Text(
                                (userProvider.user?.displayName != null && userProvider.user!.displayName.isNotEmpty)
                                    ? userProvider.user!.displayName[0].toUpperCase()
                                    : 'U',
                                style: const TextStyle(
                                  fontSize: 24,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    userProvider.user?.displayName ?? 'Utilisateur',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    userProvider.user?.email ?? '',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ),
                            // Theme switcher button
                            IconButton(
                              icon: const Icon(Icons.palette_outlined),
                              onPressed: () => _showThemeDialog(context),
                              tooltip: 'Changer le thème',
                              iconSize: 28,
                              color: Theme.of(context).colorScheme.secondary,
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (userProvider.user?.phone != null &&
                            userProvider.user!.phone.isNotEmpty)
                          Row(
                            children: [
                              const Icon(Icons.phone, size: 16),
                              const SizedBox(width: 8),
                              Text(userProvider.user!.phone),
                            ],
                          ),
                      ],
                    ),
                  ),

                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // My properties
                        const Text(
                          'Mes annonces',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        StreamBuilder<QuerySnapshot>(
                          // Use a simple equality query without additional ordering to avoid
                          // potential composite index requirements that can hide results.
                          stream: FirestoreService().propertiesRef.where('userId', isEqualTo: uid).snapshots(),
                          builder: (context, snapshot) {
                            if (snapshot.hasError) {
                              return Padding(
                                padding: const EdgeInsets.all(16),
                                child: Text('Erreur chargement annonces: ${snapshot.error}'),
                              );
                            }
                            if (snapshot.connectionState ==
                                ConnectionState.waiting) {
                              return const Padding(
                                padding: EdgeInsets.all(16),
                                child: CircularProgressIndicator(),
                              );
                            }

                            if (!snapshot.hasData ||
                                snapshot.data!.docs.isEmpty) {
                              return const Padding(
                                padding: EdgeInsets.all(16),
                                child: Text('Vous n\'avez aucune annonce'),
                              );
                            }

                            final properties = snapshot.data!.docs
                                .map((doc) => PropertyModel.fromMap(
                                    doc.data() as Map<String, dynamic>,
                                    doc.id))
                                .toList();

                            return ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: properties.length,
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
                                    child: PropertyCard(
                                      property: prop,
                                      horizontal: true,
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                        const SizedBox(height: 24),
                        // Buttons
                        // Admin button (only shown if user is admin)
                        FutureBuilder<DocumentSnapshot>(
                          future: FirebaseFirestore.instance.collection('users').doc(uid).get(),
                          builder: (context, snapshot) {
                            if (snapshot.hasData) {
                              final isAdmin = (snapshot.data!.data() as Map<String, dynamic>?)?['isAdmin'] ?? false;
                              if (isAdmin) {
                                return Column(
                                  children: [
                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Theme.of(context).colorScheme.secondary,
                                          foregroundColor: Theme.of(context).colorScheme.onSecondary,
                                        ),
                                        onPressed: () => Navigator.pushNamed(context, '/admin'),
                                        icon: const Icon(Icons.admin_panel_settings),
                                        label: const Text('Administration'),
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                  ],
                                );
                              }
                            }
                            return const SizedBox.shrink();
                          },
                        ),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () =>
                                Navigator.pushNamed(context, '/edit_profile'),
                            child: const Text('Modifier profil'),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: () => Navigator.pushNamed(context, '/change_password'),
                            child: const Text('Changer le mot de passe'),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Center(
                          child: TextButton(
                            onPressed: () => Navigator.pushNamed(context, '/about'),
                            child: const Text('À propos'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
  }

  void _showThemeDialog(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);
    final colorScheme = Theme.of(context).colorScheme;
    
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.palette_outlined, color: colorScheme.secondary),
            const SizedBox(width: 12),
            const Text('Choisir un thème'),
          ],
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.light_mode, color: Color(0xFFD4AF37)),
              title: const Text('Thème clair (Gold)'),
              trailing: themeProvider.themeMode == AppThemeMode.light
                  ? Icon(Icons.check, color: colorScheme.secondary)
                  : null,
              onTap: () {
                themeProvider.setTheme(AppThemeMode.light);
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.dark_mode, color: Color(0xFF0B1020)),
              title: const Text('Thème sombre (Gold)'),
              trailing: themeProvider.themeMode == AppThemeMode.dark
                  ? Icon(Icons.check, color: colorScheme.secondary)
                  : null,
              onTap: () {
                themeProvider.setTheme(AppThemeMode.dark);
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              leading: const Icon(Icons.nature, color: Color(0xFF27AE60)),
              title: const Text('Thème vert (Nature)'),
              trailing: themeProvider.themeMode == AppThemeMode.green
                  ? Icon(Icons.check, color: colorScheme.secondary)
                  : null,
              onTap: () {
                themeProvider.setTheme(AppThemeMode.green);
                Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }
}
