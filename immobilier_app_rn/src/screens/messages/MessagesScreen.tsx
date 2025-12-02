import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Chat } from '../../models/Message';
import { getUserChats } from '../../services/firestore.service';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * MessagesScreen - Liste des conversations
 * Déduplication automatique des chats
 */
export default function MessagesScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = getUserChats(firebaseUser.uid, (data) => {
      // Sécurité: valider que data est un tableau
      if (!Array.isArray(data)) {
        setChats([]);
        setLoading(false);
        return;
      }
      
      // Filtrer pour ne garder que les conversations avec un vrai dernier message
      const filteredChats = data.filter(chat => {
        // Garder seulement si lastMessage existe et n'est pas vide
        return chat.lastMessage && 
               typeof chat.lastMessage === 'string' && 
               chat.lastMessage.trim().length > 0;
      });
      
      console.log(`💬 Messages filtrés: ${filteredChats.length}/${data.length} conversations avec messages`);
      setChats(filteredChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const renderChat = ({ item }: { item: Chat }) => {
    // Sécurité: vérifier que item existe
    if (!item || !item.id) return null;

    const otherUserId = item.participants?.find((id) => id !== firebaseUser?.uid);
    const otherUserName = otherUserId && item.participantNames ? item.participantNames[otherUserId] : 'Utilisateur';
    const unreadCount = firebaseUser && item.unreadCount ? item.unreadCount[firebaseUser.uid] || 0 : 0;

    // Sécurité: vérifier que lastMessageTime existe et est valide
    const lastMessageTime = item.lastMessageTime instanceof Date 
      ? item.lastMessageTime 
      : new Date();

    // Sécurité: valider toutes les strings avant utilisation
    const safeUserName = typeof otherUserName === 'string' && otherUserName.length > 0 ? otherUserName : 'Utilisateur';
    const safePropertyTitle = typeof item.propertyTitle === 'string' && item.propertyTitle.length > 0 ? item.propertyTitle : 'Propriété';
    const safeLastMessage = typeof item.lastMessage === 'string' && item.lastMessage.length > 0 ? item.lastMessage : 'Aucun message';

    return (
      <TouchableOpacity
        style={[styles.chatItem, { backgroundColor: theme.colors.surface }]}
        onPress={() =>
          navigation.navigate('Chat', {
            chatId: item.id,
            propertyId: item.propertyId,
            ownerId: otherUserId,
          })
        }
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>
            {safeUserName.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
              {safeUserName}
            </Text>
            <Text style={[styles.time, { color: theme.colors.textSecondary }]}>
              {formatDistanceToNow(lastMessageTime, {
                addSuffix: true,
                locale: fr,
              })}
            </Text>
          </View>
          <Text
            style={[styles.propertyTitle, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {safePropertyTitle}
          </Text>
          <Text
            style={[
              styles.lastMessage,
              {
                color: unreadCount > 0 ? theme.colors.textPrimary : theme.colors.textSecondary,
                fontWeight: unreadCount > 0 ? 'bold' : 'normal',
              },
            ]}
            numberOfLines={1}
          >
            {safeLastMessage}
          </Text>
        </View>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={80}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Aucune conversation
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
  },
  propertyTitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
