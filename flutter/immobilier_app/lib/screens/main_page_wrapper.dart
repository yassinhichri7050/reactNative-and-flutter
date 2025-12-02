// Modern 2026 navigation with floating transparent bottom bar
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../services/auth_service.dart';
import '../services/fcm_service.dart';
import '../screens/home/home_page.dart';
import '../screens/add_property/add_property_page.dart';
import '../screens/favorites/favorites_page.dart';
import '../screens/profile/profile_page.dart';
import '../screens/messages/messages_page.dart';
import '../widgets/custom_bottom_nav.dart';

class MainPageWrapper extends StatefulWidget {
  const MainPageWrapper({super.key});

  @override
  State<MainPageWrapper> createState() => _MainPageWrapperState();
}

class _MainPageWrapperState extends State<MainPageWrapper> {
  int _selectedIndex = 0;
  bool _notificationsEnabled = true; // Default to enabled

  final List<Widget> _pages = const [
    HomePage(),
    FavoritesPage(),
    MessagesPage(),
    ProfilePage(),
    AddPropertyPage(), // Index 4 - opened by floating button
  ];

  @override
  void initState() {
    super.initState();
    _loadNotificationPreference();
  }

  Future<void> _loadNotificationPreference() async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final uid = auth.currentUser?.uid;
    if (uid == null) return;

    try {
      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(uid)
          .get();
      if (!mounted) return;
      setState(() {
        _notificationsEnabled = userDoc.data()?['notificationsEnabled'] ?? true;
      });
    } catch (e) {
      debugPrint('[MainPageWrapper] Error loading notification preference: $e');
    }
  }

  Future<void> _toggleNotifications() async {
    final auth = Provider.of<AuthService>(context, listen: false);
    final uid = auth.currentUser?.uid;
    if (uid == null) return;

    final newValue = !_notificationsEnabled;

    try {
      if (newValue) {
        // Enable notifications: subscribe to topics
        await FCMService.subscribeUserTopics(uid);
      } else {
        // Disable notifications: unsubscribe from topics
        await FCMService.unsubscribeUserTopics(uid);
      }

      // Update user preference in Firestore
      await FirebaseFirestore.instance.collection('users').doc(uid).update({
        'notificationsEnabled': newValue,
      });

      if (!mounted) return;
      setState(() => _notificationsEnabled = newValue);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context, listen: false);
    final titles = [
      'Accueil',
      'Favoris',
      'Messages',
      'Profil',
      'Publier',
    ];

    return Scaffold(
      extendBody: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        centerTitle: true,
        title: Text(
          titles[_selectedIndex],
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: Theme.of(context).colorScheme.secondary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          // Show logout button only when on Profile tab
          if (_selectedIndex == 3)
            IconButton(
              icon: const Icon(Icons.logout_rounded, color: Colors.white),
              onPressed: () async {
                final shouldLogout = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Se déconnecter'),
                    content: const Text('Êtes-vous sûr de vouloir vous déconnecter?'),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        child: const Text('Annuler'),
                      ),
                      FilledButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text('Se déconnecter'),
                      ),
                    ],
                  ),
                );
                
                if (shouldLogout == true && mounted) {
                  await authService.signOut();
                  if (mounted) {
                    Navigator.of(context).pushReplacementNamed('/login');
                  }
                }
              },
              tooltip: 'Se déconnecter',
            ),
          IconButton(
            icon: Icon(
              _notificationsEnabled
                  ? Icons.notifications_active_rounded
                  : Icons.notifications_off_rounded,
              color: Colors.white,
            ),
            onPressed: _toggleNotifications,
            tooltip: _notificationsEnabled
                ? 'Désactiver les notifications'
                : 'Activer les notifications',
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: CustomBottomNav(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
      ),
    );
  }
}
