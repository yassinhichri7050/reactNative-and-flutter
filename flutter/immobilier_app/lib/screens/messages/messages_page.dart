import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:timeago/timeago.dart' as timeago;

class MessagesPage extends StatelessWidget {
  const MessagesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final currentUserId = FirebaseAuth.instance.currentUser?.uid;

    if (currentUserId == null) {
      return const Center(
        child: Text('Veuillez vous connecter'),
      );
    }

    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('chats')
          .where('participants', arrayContains: currentUserId)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  'Une erreur est survenue',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          );
        }

        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return const Center(
            child: Text("Aucune conversation pour l'instant."),
          );
        }

        // Trier par date
        final chats = snapshot.data!.docs.toList()
          ..sort((a, b) {
            final aTime = (a['lastMessageTime'] as Timestamp?);
            final bTime = (b['lastMessageTime'] as Timestamp?);
            final aMillis = aTime?.millisecondsSinceEpoch ?? 0;
            final bMillis = bTime?.millisecondsSinceEpoch ?? 0;
            return bMillis.compareTo(aMillis);
          });

        // Dédupliquer les conversations : ne garder qu'une seule conversation par utilisateur (la plus récente)
        final Map<String, QueryDocumentSnapshot> uniqueChats = {};
        for (final chat in chats) {
          final chatData = chat.data() as Map<String, dynamic>;
          final participants = List<String>.from(chatData['participants'] ?? []);
          final otherUserId = participants.firstWhere(
            (id) => id != currentUserId,
            orElse: () => '',
          );
          
          if (otherUserId.isNotEmpty && !uniqueChats.containsKey(otherUserId)) {
            uniqueChats[otherUserId] = chat;
          }
        }

        final deduplicatedChats = uniqueChats.values.toList();

        return ListView.builder(
          itemCount: deduplicatedChats.length,
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemBuilder: (context, index) {
            final chat = deduplicatedChats[index].data() as Map<String, dynamic>;
            final participants = List<String>.from(chat['participants'] ?? []);
            final otherUserId = participants.firstWhere(
              (id) => id != currentUserId,
              orElse: () => '',
            );

            if (otherUserId.isEmpty) return const SizedBox.shrink();

            return FutureBuilder<DocumentSnapshot>(
              future: FirebaseFirestore.instance
                  .collection('users')
                  .doc(otherUserId)
                  .get(),
              builder: (context, userSnap) {
                final userData = userSnap.hasData
                  ? userSnap.data!.data() as Map<String, dynamic>?
                  : null;
                final userName = _extractDisplayName(userData);

                final lastMessage = chat['lastMessage'] as String? ?? '';
                final lastMessageTime = chat['lastMessageTime'] as Timestamp?;
                final unreadCount = chat['unreadCount_$currentUserId'] as int? ?? 0;

                String timeAgo = '';
                if (lastMessageTime != null) {
                  timeago.setLocaleMessages('fr', timeago.FrMessages());
                  timeAgo = timeago.format(
                    lastMessageTime.toDate(),
                    locale: 'fr',
                  );
                }

                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? const Color(0xFF1E1E1E)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? Colors.grey[800]!
                          : Colors.grey[200]!,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    leading: CircleAvatar(
                      radius: 28,
                      backgroundColor: Theme.of(context).colorScheme.secondary,
                      child: Text(
                        userName.isNotEmpty
                            ? userName[0].toUpperCase()
                            : 'U',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                    ),
                    title: Text(
                      userName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        lastMessage.isEmpty ? 'Commencer la conversation' : lastMessage,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                          fontStyle: lastMessage.isEmpty ? FontStyle.italic : FontStyle.normal,
                        ),
                      ),
                    ),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        if (timeAgo.isNotEmpty)
                          Text(
                            timeAgo,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[500],
                            ),
                          ),
                        if (unreadCount > 0) ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.secondary,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              unreadCount > 9 ? '9+' : '$unreadCount',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    onTap: () {
                      Navigator.pushNamed(
                        context,
                        '/chat',
                        arguments: otherUserId,
                      );
                    },
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  String _extractDisplayName(Map<String, dynamic>? userData) {
    if (userData == null) return 'Utilisateur';

    final combinedName = _combineNames(
      userData['firstName'] as String?,
      userData['lastName'] as String?,
    );

    final candidates = <String?>[
      userData['displayName'] as String?,
      userData['name'] as String?,
      userData['fullName'] as String?,
      combinedName,
      userData['username'] as String?,
      _emailPrefix(userData['email'] as String?),
    ];

    for (final entry in candidates) {
      final value = entry?.trim();
      if (value != null && value.isNotEmpty) {
        return value;
      }
    }

    return 'Utilisateur';
  }

  String? _combineNames(String? first, String? last) {
    final firstTrimmed = first?.trim();
    final lastTrimmed = last?.trim();
    if ((firstTrimmed?.isEmpty ?? true) && (lastTrimmed?.isEmpty ?? true)) {
      return null;
    }
    if (firstTrimmed != null && lastTrimmed != null) {
      return '$firstTrimmed $lastTrimmed';
    }
    return firstTrimmed ?? lastTrimmed;
  }

  String? _emailPrefix(String? email) {
    final trimmed = email?.trim();
    if (trimmed == null || trimmed.isEmpty) return null;
    final atIndex = trimmed.indexOf('@');
    if (atIndex <= 0) return null;
    return trimmed.substring(0, atIndex);
  }
}
