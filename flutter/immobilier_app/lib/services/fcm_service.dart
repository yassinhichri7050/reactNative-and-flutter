import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

class FCMService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  /// Initialize FCM and set up message handlers
  static Future<void> initialize() async {
    try {
      await _messaging.requestPermission(
        alert: true,
        announcement: true,
        badge: true,
        // carryForward: true,  // لا ترجعو
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      final token = await _messaging.getToken();
      debugPrint('[FCM] Device token: $token');

      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('[FCM] Message received in foreground:');
        debugPrint('  Title: ${message.notification?.title}');
        debugPrint('  Body: ${message.notification?.body}');
        debugPrint('  Data: ${message.data}');
      });

      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('[FCM] Message opened from notification:');
        debugPrint('  Title: ${message.notification?.title}');
        debugPrint('  Data: ${message.data}');
        _handleNotificationTap(message);
      });

      FirebaseMessaging.onBackgroundMessage(
        _firebaseMessagingBackgroundHandler,
      );
    } catch (e) {
      debugPrint('[FCM] Initialization error: $e');
    }
  }

  static Future<void> subscribeToTopic(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
      debugPrint('[FCM] Subscribed to topic: $topic');
    } catch (e) {
      debugPrint('[FCM] Error subscribing to topic $topic: $e');
    }
  }

  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
      debugPrint('[FCM] Unsubscribed from topic: $topic');
    } catch (e) {
      debugPrint('[FCM] Error unsubscribing from topic $topic: $e');
    }
  }

  static Future<void> subscribeUserTopics(String userId) async {
    try {
      await subscribeToTopic('user_$userId');
      await subscribeToTopic('new_properties');
      debugPrint('[FCM] User $userId subscribed to topics');
    } catch (e) {
      debugPrint('[FCM] Error subscribing user topics: $e');
    }
  }

  static Future<void> unsubscribeUserTopics(String userId) async {
    try {
      await unsubscribeFromTopic('user_$userId');
      await unsubscribeFromTopic('new_properties');
      debugPrint('[FCM] User $userId unsubscribed from topics');
    } catch (e) {
      debugPrint('[FCM] Error unsubscribing user topics: $e');
    }
  }

  static void _handleNotificationTap(RemoteMessage message) {
    final data = message.data;
    final type = data['type'] ?? '';
    debugPrint('[FCM] Handling notification tap: type=$type');

    switch (type) {
      case 'message':
        final chatId = data['chatId'];
        if (chatId != null) {
          debugPrint('[FCM] Navigating to chat: $chatId');
          // TODO: navigation vers ChatConversationPage
        }
        break;
      case 'property':
        final propertyId = data['propertyId'];
        if (propertyId != null) {
          debugPrint('[FCM] Navigating to property: $propertyId');
          // TODO: navigation vers PropertyDetailPage
        }
        break;
      default:
        debugPrint('[FCM] Unknown notification type: $type');
    }
  }
}

Future<void> _firebaseMessagingBackgroundHandler(
  RemoteMessage message,
) async {
  debugPrint('[FCM] Background message received:');
  debugPrint('  Title: ${message.notification?.title}');
  debugPrint('  Body: ${message.notification?.body}');
  debugPrint('  Data: ${message.data}');
}
