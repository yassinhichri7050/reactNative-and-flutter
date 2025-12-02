import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 900), () {
      if (!mounted) return;
      // Detect if running on Expo Go
      final isExpo = kIsWeb == false && !kDebugMode; // rough heuristic
      if (isExpo) {
        // For Expo Go, show a demo info page
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🚀 Mode Expo Go: Firebase nécessite une build native'),
            duration: Duration(seconds: 3),
          ),
        );
      }
      Navigator.pushReplacementNamed(context, '/');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: const [
          Icon(Icons.home_filled, size: 96, color: Color(0xFF8B5E3C)),
          SizedBox(height: 12),
          Text('ImmobilierApp', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          SizedBox(height: 8),
          Text('Version 1.0.0', style: TextStyle(fontSize: 12, color: Colors.grey)),
        ]),
      ),
    );
  }
}
