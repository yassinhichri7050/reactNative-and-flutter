import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';
import '../services/firestore_service.dart';

class UserProvider extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirestoreService _fs = FirestoreService();

  UserModel? _user;
  UserModel? get user => _user;

  UserProvider() {
    _auth.authStateChanges().listen((u) async {
      if (u == null) {
        _user = null;
        notifyListeners();
        return;
      }
      final snap = await _fs.getUser(u.uid);
      if (snap.exists) {
        final data = snap.data() as Map<String, dynamic>;
        _user = UserModel.fromMap(data, u.uid);
      } else {
        _user = UserModel(
          id: u.uid,
          email: u.email ?? '',
          displayName: u.displayName ?? '',
          phone: '',
          location: '',
          createdAt: DateTime.now(),
        );
      }
      notifyListeners();
    });
  }

  Future<void> refresh() async {
    final u = _auth.currentUser;
    if (u == null) return;
    final snap = await _fs.getUser(u.uid);
    if (snap.exists) {
      final data = snap.data() as Map<String, dynamic>;
      _user = UserModel.fromMap(data, u.uid);
      notifyListeners();
    }
  }
}

