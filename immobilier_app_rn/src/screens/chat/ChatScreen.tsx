import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Message } from '../../models/Message';
import { getChatMessages, sendMessage, createOrGetChat } from '../../services/firestore.service';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * ChatScreen - Conversation en temps réel avec bulles de messages
 */
export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { firebaseUser } = useAuth();
  const { chatId: initialChatId, propertyId, ownerId } = route.params;

  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = getChatMessages(chatId, (data) => {
      setMessages(data);
    });

    return () => unsubscribe();
  }, [chatId]);

  const initializeChat = async () => {
    if (initialChatId) {
      setChatId(initialChatId);
      return;
    }

    if (!firebaseUser || !propertyId || !ownerId) return;

    try {
      const existingChatId = await createOrGetChat(firebaseUser.uid, ownerId, propertyId);
      setChatId(existingChatId);
    } catch (error) {
      console.error('Erreur initialisation chat:', error);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !firebaseUser || !chatId) return;

    const text = messageText.trim();
    setMessageText('');
    setLoading(true);

    try {
      await sendMessage(chatId, firebaseUser.uid, text);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === firebaseUser?.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMyMessage ? theme.colors.primary : theme.colors.surface,
            },
          ]}
        >
          {!isMyMessage && (
            <Text style={[styles.senderName, { color: theme.colors.primary }]}>
              {item.senderName}
            </Text>
          )}
          <Text
            style={[
              styles.messageText,
              { color: isMyMessage ? '#FFF' : theme.colors.textPrimary },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              { color: isMyMessage ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary },
            ]}
          >
            {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: fr })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted
        onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
      />

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          placeholder="Écrivez un message..."
          placeholderTextColor={theme.colors.textSecondary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: messageText.trim() ? theme.colors.primary : theme.colors.surface },
          ]}
          onPress={handleSend}
          disabled={!messageText.trim() || loading}
        >
          <Ionicons
            name="send"
            size={20}
            color={messageText.trim() ? '#FFF' : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
