/**
 * Modèle Chat - Représente une conversation
 */
export interface Chat {
  id: string;
  participants: string[];
  participantNames: { [uid: string]: string };
  propertyId: string;
  propertyTitle: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: { [uid: string]: number };
  createdAt: Date;
}

/**
 * Modèle Message - Représente un message dans une conversation
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

/**
 * Données pour créer un message
 */
export interface MessageFormData {
  text: string;
}
