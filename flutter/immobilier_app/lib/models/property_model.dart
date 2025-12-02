// Updated to support promotion prices, purpose (rent/sale), and DT currency
import 'package:cloud_firestore/cloud_firestore.dart';

class PropertyModel {
  final String id;
  final String title;
  final String description;
  final double price;
  final String type; // "Maison", "Appartement", "Terrain", "Commerce"
  final String purpose; // "rent" or "sale" (Maison à louer / Maison à vendre)
  final double? surface;
  final String? location;
  final double? latitude;
  final double? longitude;
  final List<String> images;
  final String userId;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int? rooms;
  final bool isFeatured;
  final bool isPromo; // New: indicates if property has promotion
  final double? promoPrice; // New: promotional price if isPromo is true
  final String status; // pending, approved, rejected
  final Timestamp? submittedAt;
  final String? reviewedBy;
  final Timestamp? reviewedAt;

  PropertyModel({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.type,
    this.purpose = 'sale', // Default to sale
    this.surface,
    this.location,
    this.latitude,
    this.longitude,
    required this.images,
    required this.userId,
    this.createdAt,
    this.updatedAt,
    this.rooms,
    this.isFeatured = false,
    this.isPromo = false,
    this.promoPrice,
    this.status = 'pending',
    this.submittedAt,
    this.reviewedBy,
    this.reviewedAt,
  });

  factory PropertyModel.fromMap(Map<String, dynamic> map, String id) {
    return PropertyModel(
      id: id,
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      price: (map['price'] != null) ? (map['price'] as num).toDouble() : 0.0,
      type: map['type'] ?? 'Appartement',
      purpose: map['purpose'] ?? 'sale', // Default to sale for backward compatibility
      surface: (map['surface'] != null) ? (map['surface'] as num).toDouble() : null,
      location: map['location'] as String?,
      latitude: (map['latitude'] != null) ? (map['latitude'] as num).toDouble() : null,
      longitude: (map['longitude'] != null) ? (map['longitude'] as num).toDouble() : null,
      images: (map['images'] != null) ? List<String>.from(map['images'] as List) : <String>[],
      userId: map['userId'] ?? '',
      createdAt: (map['createdAt'] as Timestamp?)?.toDate(),
      updatedAt: (map['updatedAt'] as Timestamp?)?.toDate(),
      rooms: map['rooms'] as int?,
      isFeatured: map['isFeatured'] ?? false,
      isPromo: map['isPromo'] ?? false,
      promoPrice: (map['promoPrice'] != null) ? (map['promoPrice'] as num).toDouble() : null,
      status: map['status'] ?? 'approved',
      submittedAt: map['submittedAt'] as Timestamp?,
      reviewedBy: map['reviewedBy'] as String?,
      reviewedAt: map['reviewedAt'] as Timestamp?,
    );
  }

  Map<String, dynamic> toMap() {
    final map = <String, dynamic>{
      'title': title,
      'description': description,
      'price': price,
      'type': type,
      'purpose': purpose,
      'surface': surface,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'images': images,
      'userId': userId,
      'rooms': rooms,
      'isFeatured': isFeatured,
      'isPromo': isPromo,
      'promoPrice': promoPrice,
      'status': status,
      'submittedAt': submittedAt,
      'reviewedBy': reviewedBy,
      'reviewedAt': reviewedAt,
    };
    
    // Only include createdAt/updatedAt if they exist as Timestamps
    if (createdAt != null) {
      map['createdAt'] = Timestamp.fromDate(createdAt!);
    }
    if (updatedAt != null) {
      map['updatedAt'] = Timestamp.fromDate(updatedAt!);
    }
    
    return map;
  }
  
  // Helper method to get the display price (promo if available, regular otherwise)
  double get displayPrice => isPromo && promoPrice != null ? promoPrice! : price;
  
  // Helper method to check if property is for rent
  bool get isForRent => purpose == 'rent';
  
  // Helper method to get purpose label in French
  String get purposeLabel => purpose == 'rent' ? 'Maison à louer' : 'Maison à vendre';
}
