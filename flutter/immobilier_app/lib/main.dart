import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';

import 'firebase_options.dart';
import 'services/auth_service.dart';
import 'providers/user_provider.dart';
import 'providers/theme_provider.dart';
import 'themes/app_theme.dart';
import 'services/fcm_service.dart';

import 'screens/splash_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/auth/login_page.dart';
import 'screens/auth/register_page.dart';
import 'screens/auth/forgot_password_page.dart';
import 'screens/main_page_wrapper.dart';
import 'screens/details/property_detail_page.dart';
import 'screens/search/search_page.dart';
import 'screens/chat/chat_page.dart';
import 'screens/profile/edit_profile_page.dart';
import 'screens/profile/change_password_page.dart';
import 'screens/about_page.dart';
import 'screens/admin/admin_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Initialize Firebase Cloud Messaging
  await FCMService.initialize();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, _) {
          ThemeData selectedTheme;
          switch (themeProvider.themeMode) {
            case AppThemeMode.dark:
              selectedTheme = AppTheme.darkTheme();
              break;
            case AppThemeMode.green:
              selectedTheme = AppTheme.greenTheme();
              break;
            case AppThemeMode.light:
              selectedTheme = AppTheme.lightTheme();
          }

          return MaterialApp(
            debugShowCheckedModeBanner: false,
            title: 'Gold Immobilier',
            theme: selectedTheme,
            initialRoute: '/splash',
            routes: {
              '/splash': (_) => const SplashScreen(),
              '/onboarding': (_) => const OnboardingScreen(),
              '/': (_) => const AuthWrapper(),
              '/login': (_) => const LoginPage(),
              '/register': (_) => const RegisterPage(),
              '/forgot_password': (_) => const ForgotPasswordPage(),
              '/home': (_) => const MainPageWrapper(),
              '/property_detail': (_) => const PropertyDetailPage(),
              '/search': (_) => Scaffold(
                appBar: AppBar(
                  backgroundColor: Theme.of(context).colorScheme.secondary,
                  foregroundColor: Colors.white,
                  title: const Text('Rechercher'),
                  centerTitle: true,
                ),
                body: const SearchPage(),
              ),
              '/chat': (_) => const ChatPage(),
              '/edit_profile': (_) => const EditProfilePage(),
              '/change_password': (_) => const ChangePasswordPage(),
              '/about': (_) => const AboutPage(),
              '/admin': (_) => const AdminPage(),
            },
          );
        },
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthService>(context);
    if (auth.isSignedIn) {
      return const MainPageWrapper();
    }
    return const LoginPage();
  }
}
