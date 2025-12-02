import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../services/firestore_service.dart';
import '../../models/message_model.dart';

class ChatPage extends StatelessWidget {
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    final currentUserIdNullable = FirebaseAuth.instance.currentUser?.uid;
    final args = ModalRoute.of(context)?.settings.arguments;
    // Si on reçoit une simple String (id d'un autre user), garder la compatibilité
    final targetUserId = args is String ? args : null;

    if (currentUserIdNullable == null) {
      debugPrint('[ChatPage] build - no current user');
      return Scaffold(
        appBar: AppBar(title: const Text('Messages')),
        body: const Center(child: Text('Veuillez vous connecter')),
      );
    }

    final currentUserId = currentUserIdNullable;
    debugPrint(
        '[ChatPage] build - currentUserId=$currentUserId, targetUserId=$targetUserId');

    // Si un autre user est fourni, on ouvre directement la conversation
    if (targetUserId != null && targetUserId.isNotEmpty) {
      return ChatConversationPage(
        currentUserId: currentUserId,
        otherUserId: targetUserId,
      );
    }

    // Sinon : liste de TOUTES les conversations où currentUserId est participant
    return Scaffold(
      appBar: AppBar(title: const Text('Messages')),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('chats')
            .where('participants', arrayContains: currentUserId)
            .snapshots(),
        builder: (context, snapshot) {
          debugPrint(
              '[ChatPage] stream builder - hasData=${snapshot.hasData} connectionState=${snapshot.connectionState}');

          if (snapshot.hasError) {
            debugPrint('[ChatPage] snapshot error = ${snapshot.error}');
            return const Center(
              child: Text('Erreur de chargement des conversations'),
            );
          }

          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData) {
            debugPrint('[ChatPage] snapshot has no data after waiting');
            return const Center(child: CircularProgressIndicator());
          }

          final chats = snapshot.data!.docs;
          debugPrint(
              '[ChatPage] stream builder - docs.length=${chats.length}');
          for (final d in chats) {
            try {
              final data = d.data() as Map<String, dynamic>;
              final participants = data['participants'] is List
                  ? List<String>.from(data['participants'])
                  : <String>[];
              final propertyId = data['propertyId'] as String?;
              debugPrint(
                  '[ChatPage] chat ${d.id} participants=$participants propertyId=$propertyId lastMessage=${data['lastMessage']}');
            } catch (e) {
              debugPrint(
                  '[ChatPage] error reading chat doc ${d.id}: $e');
            }
          }

          if (chats.isEmpty) {
            debugPrint('[ChatPage] no chats for uid=$currentUserId');
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chat_bubble_outline,
                      size: 80, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('Aucune conversation'),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: chats.length,
            itemBuilder: (context, index) {
              final chatData =
                  chats[index].data() as Map<String, dynamic>;
              final participants =
                  List<String>.from(chatData['participants'] ?? []);
              debugPrint(
                  '[ChatPage] chat ${chats[index].id} participants=$participants');

              final otherUserId = participants.firstWhere(
                (p) => p != currentUserId,
                orElse: () => '',
              );

              if (otherUserId.isEmpty) {
                return const SizedBox.shrink();
              }

              return FutureBuilder<DocumentSnapshot<Map<String, dynamic>>>(
                future: FirebaseFirestore.instance
                    .collection('users')
                    .doc(otherUserId)
                    .get(),
                builder: (context, userSnapshot) {
                  if (!userSnapshot.hasData) {
                    return const Padding(
                      padding: EdgeInsets.all(8),
                      child: ListTile(title: Text('Chargement...')),
                    );
                  }

                  final userData = userSnapshot.data!.data();
                  final otherUserName =
                      userData?['displayName'] ?? 'Utilisateur';
                  final lastMessage = chatData['lastMessage'] ?? '';
                  final lastMessageTime =
                      (chatData['lastMessageTime'] as Timestamp?)
                          ?.toDate();

                  // Déterminer le texte à afficher
                  final displayText = lastMessage.isEmpty 
                      ? 'Commencer la conversation' 
                      : lastMessage;
                  final displayStyle = lastMessage.isEmpty
                      ? const TextStyle(
                          fontStyle: FontStyle.italic,
                          color: Colors.grey,
                          fontSize: 13,
                        )
                      : null;

                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Theme.of(context).colorScheme.secondary,
                      child: Text(
                        otherUserName[0].toUpperCase(),
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                    title: Text(
                      otherUserName,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      displayText,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: displayStyle,
                    ),
                    trailing: lastMessageTime != null
                        ? Text(
                            _formatTime(lastMessageTime),
                            style: const TextStyle(fontSize: 12),
                          )
                        : null,
                    onTap: () {
                      final chatId = chats[index].id;
                      final propertyId =
                          chatData['propertyId'] as String?;
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ChatConversationPage(
                            currentUserId: currentUserId,
                            otherUserId: otherUserId,
                            chatId: chatId,
                            propertyId: propertyId,
                          ),
                        ),
                      );
                    },
                  );
                },
              );
            },
          );
        },
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    if (diff.inDays < 7) return '${diff.inDays}d';
    return '${dt.day}/${dt.month}';
  }
}

class ChatConversationPage extends StatefulWidget {
  final String currentUserId;
  final String otherUserId;
  final String? propertyId;
  final String? chatId;

  const ChatConversationPage({
    super.key,
    required this.currentUserId,
    required this.otherUserId,
    this.propertyId,
    this.chatId,
  });

  @override
  State<ChatConversationPage> createState() => _ChatConversationPageState();
}

class _ChatConversationPageState extends State<ChatConversationPage> {
  String? _chatId;
  final _messageController = TextEditingController();
  late FirestoreService _fs;

  @override
  void initState() {
    super.initState();
    _fs = FirestoreService();
    _initChat();
  }

  Future<void> _initChat() async {
    // Initialise le chatId selon ce qui est fourni
    if (widget.chatId != null && widget.chatId!.isNotEmpty) {
      _chatId = widget.chatId;
    } else if (widget.propertyId != null &&
        widget.propertyId!.isNotEmpty) {
      _chatId = await _fs.getOrCreateChatForProperty(
        widget.currentUserId,
        widget.otherUserId,
        widget.propertyId!,
      );
      debugPrint(
          '[ChatConversationPage] _initChat - got chatId for property: $_chatId');
    } else {
      _chatId = await _fs.getOrCreateChat(
        widget.currentUserId,
        widget.otherUserId,
      );
    }
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_chatId == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Conversation')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Conversation')),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: _fs.streamChatMessages(_chatId!),
              builder: (context, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                final messages = snapshot.data!.docs
                    .map(
                      (doc) => MessageModel.fromMap(
                        doc.data() as Map<String, dynamic>,
                        doc.id,
                      ),
                    )
                    .toList();

                // (اختياري) وضع read = true للرسائل الواردة
                try {
                  for (final d in snapshot.data!.docs) {
                    final m = d.data() as Map<String, dynamic>;
                    if (m['toId'] == widget.currentUserId &&
                        (m['isRead'] == false || m['isRead'] == null)) {
                      d.reference.update({'isRead': true});
                    }
                  }
                } catch (e) {
                  debugPrint(
                      '[ChatConversationPage] Error marking messages read: $e');
                }

                if (messages.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 80,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Aucun message',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Envoyez le premier message pour démarrer la conversation',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  reverse: true,
                  padding: const EdgeInsets.all(16),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    final isMe =
                        msg.fromId == widget.currentUserId;

                    return Align(
                      alignment: isMe
                          ? Alignment.centerRight
                          : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color:
                              isMe ? Colors.brown : Colors.grey[300],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          msg.text,
                          style: TextStyle(
                            color:
                                isMe ? Colors.white : Colors.black,
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Message',
                      border: OutlineInputBorder(
                        borderRadius:
                            BorderRadius.circular(20),
                      ),
                      contentPadding:
                          const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FloatingActionButton(
                  mini: true,
                  onPressed: () async {
                    if (_messageController.text.isEmpty) return;
                    await _fs.sendMessage(
                      _chatId!,
                      widget.currentUserId,
                      widget.otherUserId,
                      _messageController.text.trim(),
                    );
                    _messageController.clear();
                  },
                  child: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }
}
