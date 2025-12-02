import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppThemeMode { light, dark, green }

class ThemeProvider extends ChangeNotifier {
  static const _key = 'appThemeMode';
  AppThemeMode _themeMode = AppThemeMode.light;

  AppThemeMode get themeMode => _themeMode;
  bool get isDark => _themeMode == AppThemeMode.dark;

  ThemeProvider() {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final savedIndex = prefs.getInt(_key) ?? 0;
    _themeMode = AppThemeMode.values[savedIndex];
    notifyListeners();
  }

  Future<void> setTheme(AppThemeMode mode) async {
    _themeMode = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_key, mode.index);
    notifyListeners();
  }

  // Legacy compatibility
  Future<void> toggle() async {
    final nextMode = _themeMode == AppThemeMode.light 
        ? AppThemeMode.dark 
        : AppThemeMode.light;
    await setTheme(nextMode);
  }
}
