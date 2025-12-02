import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../constants.dart';
import '../../models/property_model.dart';
import '../../services/firestore_service.dart';
import '../chat/chat_page.dart';
import '../add_property/edit_property_page.dart';

class PropertyDetailPage extends StatefulWidget {
  const PropertyDetailPage({super.key});

  @override
  State<PropertyDetailPage> createState() => _PropertyDetailPageState();
}

class _PropertyDetailPageState extends State<PropertyDetailPage> {
  PropertyModel? property;
  bool _isFavorite = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is PropertyModel) {
      property = args;
      _checkFavorite();
    }
  }

  Future<void> _checkFavorite() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null || property == null) return;
    final fs = FirestoreService();
    final isFav = await fs.isFavorite(uid, property!.id);
    if (!mounted) return;
    setState(() => _isFavorite = isFav);
  }

  @override
  Widget build(BuildContext context) {
    final p = property;
    final colorScheme = Theme.of(context).colorScheme;
    final currentUserId = FirebaseAuth.instance.currentUser?.uid;
    final isOwner = currentUserId != null && currentUserId == p?.userId;

    if (p == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Hero(
                tag: 'property-image-${p.id}',
                child: PageView.builder(
                  itemCount: p.images.isEmpty ? 1 : p.images.length,
                  itemBuilder: (context, index) {
                    final imageUrl = _resolveImageUrl(
                      p.images.isEmpty ? null : p.images[index],
                    );
                    return Container(
                      color: Colors.grey[300],
                      child: _buildDetailImage(imageUrl),
                    );
                  },
                ),
              ),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.all(8),
                    child: CircleAvatar(
                  backgroundColor: Colors.white,
                  child: IconButton(
                    icon: Icon(
                      _isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: _isFavorite ? colorScheme.secondary : Colors.grey,
                    ),
                    onPressed: () async {
                      final uid = FirebaseAuth.instance.currentUser?.uid;
                      if (uid == null) {
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Veuillez vous connecter')),
                        );
                        return;
                      }
                      final fs = FirestoreService();
                      if (_isFavorite) {
                        await fs.removeFavorite(uid, p.id);
                      } else {
                        await fs.addFavorite(uid, p.id);
                      }
                      if (!mounted) return;
                      setState(() => _isFavorite = !_isFavorite);
                    },
                  ),
                ),
              ),
            ],
          ),

          // Détails
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Titre + localisation + prix
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context)
                                  .textTheme
                                  .titleLarge
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(
                                  Icons.location_on,
                                  size: 16,
                                  color: Colors.grey[600],
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    p.location ?? 'Non spécifié',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.copyWith(color: Colors.grey[700]),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          if (p.isPromo && p.promoPrice != null) ...[
                            Text(
                              '${NumberFormat.decimalPattern('fr_FR').format(p.price)} DT',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    decoration: TextDecoration.lineThrough,
                                    color: Colors.grey[600],
                                  ),
                            ),
                            const SizedBox(height: 4),
                          ],
                          TweenAnimationBuilder<double>(
                            tween: Tween(begin: 0.98, end: 1.0),
                            duration: const Duration(milliseconds: 360),
                            builder: (context, scale, child) => Transform.scale(
                              scale: scale,
                              child: child,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (p.isPromo)
                                  Container(
                                    margin: const EdgeInsets.only(right: 8),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).colorScheme.secondary,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      'PROMO',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                Text(
                                  '${NumberFormat.decimalPattern('fr_FR').format(p.displayPrice)} DT',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: colorScheme.secondary,
                                      ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Infos clés
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildInfoChip(
                        context,
                        Icons.door_front_door,
                        '${p.rooms} pièces',
                      ),
                      _buildInfoChip(
                        context,
                        Icons.square_foot,
                        '${p.surface?.toStringAsFixed(0) ?? '0'} m²',
                      ),
                      _buildInfoChip(
                        context,
                        Icons.home,
                        p.type,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Description
                  Text(
                    'Description',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    p.description.isNotEmpty
                        ? p.description
                        : 'Aucune description',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),

                  // Carte (Map)
                  Text(
                    'Localisation',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  _buildMapSection(p),
                  const SizedBox(height: 24),

                  // Boutons pour le propriétaire
                  if (isOwner) ...[
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () async {
                              final updated = await Navigator.push<bool>(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => EditPropertyPage(property: p),
                                ),
                              );
                              if (updated == true) {
                                // Recharger la propriété à partir de Firestore
                                final latest = await FirestoreService().getPropertyById(p.id);
                                if (!mounted) return;
                                setState(() => property = latest);
                              }
                            },
                            icon: const Icon(Icons.edit),
                            label: const Text('Modifier'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: colorScheme.error,
                            ),
                            onPressed: () async {
                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (c) => AlertDialog(
                                  title: const Text('Supprimer l\'annonce'),
                                  content: const Text('Voulez-vous vraiment supprimer cette annonce ?'),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(c, false),
                                      child: const Text('Annuler'),
                                    ),
                                    TextButton(
                                      onPressed: () => Navigator.pop(c, true),
                                      child: const Text('Supprimer'),
                                    ),
                                  ],
                                ),
                              );
                              if (confirm != true) return;
                              await FirestoreService().deleteProperty(p.id);
                              if (!mounted) return;
                              Navigator.pop(context);
                            },
                            icon: const Icon(Icons.delete),
                            label: const Text('Supprimer'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Promotion button
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        style: FilledButton.styleFrom(
                          backgroundColor: p.isPromo 
                              ? colorScheme.secondary.withOpacity(0.9)
                              : colorScheme.secondary,
                        ),
                        onPressed: () => _showPromotionDialog(p),
                        icon: Icon(p.isPromo ? Icons.edit : Icons.local_offer_rounded),
                        label: Text(p.isPromo ? 'Modifier la promotion' : 'Mettre en promotion'),
                      ),
                    ),
                  ] else ...[const SizedBox(height: 24),
                    // Bouton contact (uniquement pour non-propriétaires)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () async {
                          final currentUserId =
                              FirebaseAuth.instance.currentUser?.uid;
                          if (currentUserId == null) {
                            if (!mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                  content: Text('Veuillez vous connecter')),
                            );
                            return;
                          }
                          if (currentUserId == p.userId) return;

                          final fs = FirestoreService();
                          final chatId = await fs.getOrCreateChatForProperty(
                            currentUserId,
                            p.userId,
                            p.id,
                          );

                          if (!mounted) return;
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (c) => ChatConversationPage(
                                currentUserId: currentUserId,
                                otherUserId: p.userId,
                                propertyId: p.id,
                                chatId: chatId,
                              ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.chat),
                        label: const Text('Contacter le vendeur'),
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Show promotion dialog for property owner
  Future<void> _showPromotionDialog(PropertyModel p) async {
    final priceController = TextEditingController(
      text: (p.promoPrice ?? p.price).toStringAsFixed(0),
    );

    final result = await showDialog<String>(
      context: context,
      barrierDismissible: false, // Prevent accidental dismissal
      builder: (dialogContext) => AlertDialog(
        title: Text(p.isPromo ? 'Modifier la promotion' : 'Mettre en promotion'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Prix actuel: ${NumberFormat.decimalPattern('fr_FR').format(p.price)} DT',
              style: Theme.of(dialogContext).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: priceController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Prix promotionnel (DT)',
                hintText: 'Entrez le prix en promotion',
                prefixIcon: const Icon(Icons.local_offer_rounded),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              autofocus: true,
            ),
            if (p.isPromo) ...[
              const SizedBox(height: 16),
              Text(
                'Ou retirez la promotion',
                style: Theme.of(dialogContext).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ],
          ],
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        actions: [
          if (p.isPromo)
            TextButton.icon(
              onPressed: () => Navigator.pop(dialogContext, 'remove'),
              icon: const Icon(Icons.remove_circle_outline),
              label: const Text('Retirer la promotion'),
              style: TextButton.styleFrom(
                foregroundColor: Colors.red,
              ),
            ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, null),
            child: const Text('Annuler'),
          ),
          FilledButton(
            onPressed: () {
              final value = priceController.text.trim();
              Navigator.pop(dialogContext, value);
            },
            child: const Text('Valider'),
          ),
        ],
      ),
    );

    if (result == null) return;

    // Remove promotion
    if (result == 'remove') {
      await FirestoreService().updateProperty(p.id, {
        'isPromo': false,
        'promoPrice': null,
      });
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Promotion retirée avec succès'),
          backgroundColor: Colors.green,
        ),
      );
      
      // Refresh property
      final latest = await FirestoreService().getPropertyById(p.id);
      if (!mounted) return;
      setState(() => property = latest);
      return;
    }

    // Set/Update promotion
    final promoPrice = double.tryParse(result);
    if (promoPrice == null || promoPrice <= 0) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez entrer un prix valide'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Validate that promo price is less than normal price
    if (promoPrice >= p.price) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Le prix promotionnel doit être inférieur au prix normal'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    await FirestoreService().updateProperty(p.id, {
      'isPromo': true,
      'promoPrice': promoPrice,
    });

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(p.isPromo 
            ? 'Promotion modifiée avec succès' 
            : 'Promotion ajoutée avec succès'),
        backgroundColor: Colors.green,
      ),
    );

    // Refresh property
    final latest = await FirestoreService().getPropertyById(p.id);
    if (!mounted) return;
    setState(() => property = latest);
  }

  Widget _buildInfoChip(BuildContext context, IconData icon, String label) {
    final colorScheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: colorScheme.primary.withOpacity(0.08),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: colorScheme.primary,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _buildMapSection(PropertyModel p) {
    final lat = p.latitude;
    final lng = p.longitude;
    final addressCard = _buildAddressInfo(p);
    
    // Si pas de coordonnées GPS, afficher uniquement l'adresse avec un message
    if (lat == null || lng == null || lat == 0.0 || lng == 0.0) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            height: 250,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.map_outlined,
                  size: 80,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 12),
                Text(
                  'Carte non disponible',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Coordonnées GPS non renseignées',
                  style: TextStyle(
                    color: Colors.grey[500],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          addressCard,
        ],
      );
    }

    // Afficher la carte OpenStreetMap si coordonnées disponibles
    final position = LatLng(lat, lng);
    final mapWidget = SizedBox(
      height: 250,
      child: FlutterMap(
        options: MapOptions(
          initialCenter: position,
          initialZoom: 15.0,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            subdomains: const ['a', 'b', 'c'],
            userAgentPackageName: 'com.example.immobilier_app',
          ),
          MarkerLayer(
            markers: [
              Marker(
                point: position,
                width: 50,
                height: 50,
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Text(
                        p.title,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const Icon(
                      Icons.location_on,
                      size: 40,
                      color: Colors.red,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );

    final mapCard = Card(
      margin: EdgeInsets.zero,
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: mapWidget,
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        mapCard,
        const SizedBox(height: 12),
        addressCard,
      ],
    );
  }

  Widget _buildAddressInfo(PropertyModel p) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        children: [
          Icon(
            Icons.location_on,
            size: 40,
            color: Theme.of(context).colorScheme.secondary,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Adresse',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  p.location ?? 'Non spécifié',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailImage(String url) {
    return Image.network(
      url,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        if (url == kDefaultPropertyImage) {
          return const Icon(Icons.home, size: 80);
        }
        return _buildDetailImage(kDefaultPropertyImage);
      },
    );
  }

  String _resolveImageUrl(String? rawUrl) {
    final sanitized = _sanitizeUrl(rawUrl);
    return sanitized ?? kDefaultPropertyImage;
  }

  String? _sanitizeUrl(String? url) {
    final trimmed = url?.trim();
    if (trimmed == null || trimmed.isEmpty) return null;
    final uri = Uri.tryParse(trimmed);
    if (uri == null) return null;
    final scheme = uri.scheme.toLowerCase();
    if (scheme != 'http' && scheme != 'https') {
      return null;
    }
    return trimmed;
  }
}
