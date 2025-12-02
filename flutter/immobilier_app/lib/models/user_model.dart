import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String id;
  final String email;
  final String displayName;
  final String phone;
  final String? photoUrl;
  final String location;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final bool isOnline;

  UserModel({
    required this.id,
    required this.email,
    required this.displayName,
    required this.phone,
    this.photoUrl,
    required this.location,
    required this.createdAt,
    this.updatedAt,
    this.isOnline = false,
  });

  factory UserModel.fromMap(Map<String, dynamic> map, String id) {
    return UserModel(
      id: id,
      email: map['email'] ?? '',
      displayName: map['displayName'] ?? '',
      phone: map['phone'] ?? '',
      photoUrl: map['photoUrl'],
      location: map['location'] ?? '',
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate(),
      isOnline: map['isOnline'] ?? false,
    );
  }

  Map<String, dynamic> toMap() => {
        'email': email,
        'displayName': displayName,
        'phone': phone,
        'photoUrl': photoUrl,
        'location': location,
        'createdAt': createdAt,
        'updatedAt': updatedAt,
        'isOnline': isOnline,
      };
}
