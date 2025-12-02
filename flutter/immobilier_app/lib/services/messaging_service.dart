import 'package:firebase_messaging/firebase_messaging.dart';

class MessagingService {
  final FirebaseMessaging _fm = FirebaseMessaging.instance;

  Future<String?> getToken() async {
    return await _fm.getToken();
  }

  Future<void> requestPermission() async {
    await _fm.requestPermission();
  }
}
