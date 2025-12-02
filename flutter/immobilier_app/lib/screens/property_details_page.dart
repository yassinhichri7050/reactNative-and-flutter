export 'details/property_detail_page.dart';

/*
  final currentUserId = FirebaseAuth.instance.currentUser?.uid;
    final isOwnProperty = property?.userId == currentUserId;

    return Scaffold(
      appBar: AppBar(title: Text(property?.title ?? 'Détails du bien')),
      body: property == null
          ? const Center(child: Text('Aucune information disponible'))
          : Stack(
              children: [
                // [AMÉLIORATION] Contenu scrollable avec padding inférieur pour le bouton
                SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // [AMÉLIORATION] Image avec meilleure présentation
                      if (property.images.isNotEmpty)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            property.images.first,
                            width: double.infinity,
                            height: 250,
                            fit: BoxFit.cover,
                            errorBuilder: (c, e, st) => Container(
                              width: double.infinity,
                              height: 250,
                              color: Colors.grey[300],
                              child: const Icon(Icons.image_not_supported),
                            ),
                          ),
                        )
                      else
                        Container(
                          width: double.infinity,
                          height: 250,
                          decoration: BoxDecoration(
                            color: Colors.grey[300],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.home, size: 80),
                        ),
                      const SizedBox(height: 16),

                      // [AMÉLIORATION] Titre bien visible
                      Text(
                        property.title,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // [AMÉLIORATION] Type et Prix bien visibles et séparés
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Type de bien',
                                  style: Theme.of(context).textTheme.labelMedium,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  property.type,
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Flexible(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Prix',
                                  style: Theme.of(context).textTheme.labelMedium,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  property.price > 0
                                      ? '${NumberFormat.decimalPattern('fr_FR').format(property.displayPrice)} DT'
                                      : 'Prix sur demande',
                                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                        color: Theme.of(context).colorScheme.secondary,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // [AMÉLIORATION] Caractéristiques du bien (surface, pièces, etc.)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            Column(
                              children: [
                                    Icon(Icons.square_foot, color: Theme.of(context).colorScheme.secondary),
                                const SizedBox(height: 4),
                                Text(
                                  '${property.surface.toStringAsFixed(0)}m²',
                                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              children: [
                                Icon(Icons.door_front_door, color: Theme.of(context).colorScheme.secondary),
                                const SizedBox(height: 4),
                                Text(
                                  '${property.rooms} pièces',
                                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              children: [
                                Icon(Icons.location_on, color: Theme.of(context).colorScheme.secondary),
                                const SizedBox(height: 4),
                                Flexible(
                                  child: Text(
                                    property.location,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context).textTheme.labelSmall,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // [AMÉLIORATION] Description du bien
                      Text(
                        'Description',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        property.description,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 100), // Space for bottom button
                    ],
                  ),
                ),

                // [AMÉLIORATION] Bouton de contact fixe en bas - toujours visible et responsive
                if (property != null && !isOwnProperty && currentUserId != null)
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: SafeArea(
                      child: SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: FilledButton.icon(
                            onPressed: property != null && property.userId.isNotEmpty
                                ? () async {
                                    final currentUserId = FirebaseAuth.instance.currentUser?.uid;
                                    if (currentUserId == null) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Veuillez vous connecter')),
                                      );
                                      return;
                                    }
                                    if (currentUserId == property!.userId) return;
                                    final fs = FirestoreService();
                                    final chatId = await fs.getOrCreateChatForProperty(
                                      currentUserId,
                                      property!.userId,
                                      property!.id,
                                    );
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (c) =>
                                            ChatConversationPage(
                                          currentUserId: currentUserId,
                                          otherUserId: property!.userId,
                                          propertyId: property!.id,
                                          chatId: chatId,
                                        ),
                                      ),
                                    );
                                  }
                                : null,
                          icon: const Icon(Icons.message),
                          label: const Text('Contacter le propriétaire'),
                            style: FilledButton.styleFrom(
                              backgroundColor: Theme.of(context).colorScheme.secondary,
                              foregroundColor: Theme.of(context).colorScheme.onSecondary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                        ),
                      ),
                    ),
                  )
                else if (isOwnProperty)
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: SafeArea(
                      child: SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: FilledButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.home),
                          label: const Text('Votre annonce'),
                          style: FilledButton.styleFrom(
                            backgroundColor: Colors.grey[600],
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}
*/
