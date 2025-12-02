import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import '../constants.dart';
import '../models/property_model.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Collection refs
  CollectionReference get propertiesRef => _db.collection('properties');
  CollectionReference get usersRef => _db.collection('users');
  CollectionReference get chatsRef => _db.collection('chats');

  // Properties
  Future<DocumentReference> addProperty(Map<String, dynamic> data) async {
    // Ensure images is a non-empty list
    final List<String> images = (data['images'] != null && (data['images'] as List).isNotEmpty)
        ? List<String>.from(data['images'] as List)
        : [kDefaultPropertyImage];
    
    // Build a complete, safe map with all required fields
    final safeData = <String, dynamic>{
      'title': data['title'] ?? '',
      'description': data['description'] ?? '',
      'price': (data['price'] ?? 0.0),
      'type': data['type'] ?? 'Appartement',
      'purpose': data['purpose'] ?? 'sale',
      'surface': data['surface'],
      'location': data['location'],
      'latitude': data['latitude'],
      'longitude': data['longitude'],
      'images': images,
      'userId': data['userId'] ?? '',
      'rooms': data['rooms'],
      'isFeatured': data['isFeatured'] ?? false,
      'isPromo': data['isPromo'] ?? false,
      'promoPrice': data['promoPrice'],
      'status': 'pending',
      'createdAt': FieldValue.serverTimestamp(),
      'submittedAt': FieldValue.serverTimestamp(),
      'reviewedBy': null,
      'reviewedAt': null,
    };
    
    return await propertiesRef.add(safeData);
  }

  Future<void> updateProperty(String id, Map<String, dynamic> data) async {
    data['updatedAt'] = FieldValue.serverTimestamp();
    await propertiesRef.doc(id).update(data);
  }

  Future<void> deleteProperty(String id) async {
    await propertiesRef.doc(id).delete();
  }

  Future<PropertyModel?> getPropertyById(String id) async {
    try {
      final doc = await propertiesRef.doc(id).get();
      if (!doc.exists) return null;
      return PropertyModel.fromMap(
        doc.data() as Map<String, dynamic>,
        doc.id,
      );
    } catch (e) {
      debugPrint('Error fetching property by ID: $e');
      return null;
    }
  }

  Stream<QuerySnapshot> streamProperties() {
    return propertiesRef
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  Stream<QuerySnapshot> streamPropertiesRecent({int limit = 10}) {
    return propertiesRef
        .orderBy('createdAt', descending: true)
        .limit(limit)
        .snapshots();
  }

  Stream<QuerySnapshot> streamPropertiesFeatured() {
    return propertiesRef
        .where('isFeatured', isEqualTo: true)
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  // New: Stream properties with active promotions
  Stream<QuerySnapshot> streamPropertiesPromoted() {
    return propertiesRef
        .where('isPromo', isEqualTo: true)
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  Stream<QuerySnapshot> streamPropertiesByUser(String userId) {
    return propertiesRef
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  Stream<QuerySnapshot> streamPropertiesFiltered({
    String? keyword,
    String? type,
    double? minPrice,
    double? maxPrice,
    double? minSurface,
  }) {
    Query query = propertiesRef;
    final hasKeyword = keyword != null && keyword.trim().isNotEmpty;

    final bool hasFilters = (type != null && type != 'Tous') ||
        minPrice != null ||
        maxPrice != null ||
        minSurface != null ||
        hasKeyword;

    if (!hasFilters) {
      return propertiesRef
          .orderBy('createdAt', descending: true)
          .limit(30)
          .snapshots();
    }

    if (type != null && type != 'Tous') {
      query = query.where('type', isEqualTo: type);
    }
    if (minPrice != null) {
      query = query.where('price', isGreaterThanOrEqualTo: minPrice);
    }
    if (maxPrice != null) {
      query = query.where('price', isLessThanOrEqualTo: maxPrice);
    }
    if (minSurface != null) {
      query = query.where('surface', isGreaterThanOrEqualTo: minSurface);
    }

    return (query as Query<Map<String, dynamic>>)
        .orderBy('createdAt', descending: true)
        .limit(30)
        .snapshots();
  }

  Stream<QuerySnapshot> streamPendingProperties() {
    return propertiesRef
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  Future<void> updatePropertyStatus(String id, String status, String adminId) async {
    await propertiesRef.doc(id).update({
      'status': status,
      'reviewedBy': adminId,
      'reviewedAt': FieldValue.serverTimestamp(),
    });
  }

  // User helpers
  Future<void> setUser(String uid, Map<String, dynamic> data) async {
    await usersRef.doc(uid).set({...data, 'updatedAt': FieldValue.serverTimestamp()},
        SetOptions(merge: true));
  }

  Future<DocumentSnapshot> getUser(String uid) async {
    return await usersRef.doc(uid).get();
  }

  // Favorites
  Future<void> addFavorite(String uid, String propertyId) async {
    final ref = usersRef.doc(uid).collection('favorites');
    await ref
        .doc(propertyId)
        .set({'propertyId': propertyId, 'addedAt': FieldValue.serverTimestamp()});
  }

  Future<void> removeFavorite(String uid, String propertyId) async {
    final ref = usersRef.doc(uid).collection('favorites');
    await ref.doc(propertyId).delete();
  }

  Future<bool> isFavorite(String uid, String propertyId) async {
    final doc =
        await usersRef.doc(uid).collection('favorites').doc(propertyId).get();
    return doc.exists;
  }

  Stream<QuerySnapshot> streamFavorites(String uid) {
    return usersRef
        .doc(uid)
        .collection('favorites')
        .orderBy('addedAt', descending: true)
        .snapshots();
  }

  // Chat
  Future<String> getOrCreateChat(String userId1, String userId2) async {
    final participants = [userId1, userId2]..sort();
    final chatId = '${participants[0]}_${participants[1]}';
    
    final doc = await chatsRef.doc(chatId).get();
    if (!doc.exists) {
      await chatsRef.doc(chatId).set({
        'participants': participants,
        'createdAt': FieldValue.serverTimestamp(),
        'lastMessage': '',
        'lastMessageTime': FieldValue.serverTimestamp(),
      });
    }
    return chatId;
  }

  /// Get or create a chat specific to a property and two participants.
  /// Ensures only one chat exists per (propertyId, participant pair).
  Future<String> getOrCreateChatForProperty(String userId1, String userId2, String propertyId) async {
    final participants = [userId1, userId2]..sort();
    final chatId = '${propertyId}_${participants[0]}_${participants[1]}';

    final doc = await chatsRef.doc(chatId).get();
    if (!doc.exists) {
      await chatsRef.doc(chatId).set({
        'propertyId': propertyId,
        'participants': participants,
        'createdAt': FieldValue.serverTimestamp(),
        'lastMessage': '',
        'lastMessageFrom': '',
        'lastMessageTime': FieldValue.serverTimestamp(),
      });
    }
    return chatId;
  }

  Stream<QuerySnapshot> streamChatMessages(String chatId) {
    return chatsRef
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', descending: true)
        .snapshots();
  }

  Future<void> sendMessage(String chatId, String fromId, String toId, String text) async {
    await chatsRef.doc(chatId).collection('messages').add({
      'fromId': fromId,
      'toId': toId,
      'text': text,
      'timestamp': FieldValue.serverTimestamp(),
      'isRead': false,
    });

    await chatsRef.doc(chatId).update({
      'lastMessage': text,
      'lastMessageTime': FieldValue.serverTimestamp(),
      'lastMessageFrom': fromId,
    });
  }

  Stream<QuerySnapshot> streamChats(String userId, {String? targetUserId}) {
    Query query = chatsRef.where('participants', arrayContains: userId);

    // Only apply a second filter if a specific target user id is provided
    if (targetUserId != null && targetUserId.isNotEmpty) {
      query = query.where('participants', arrayContains: targetUserId);
    }

    return (query as Query<Map<String, dynamic>>)
        .orderBy('lastMessageTime', descending: true)
        .snapshots();
  }
}

