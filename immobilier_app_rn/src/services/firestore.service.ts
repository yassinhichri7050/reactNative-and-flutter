import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Property, PropertyFormData } from '../models/Property';
import { User } from '../models/User';
import { Chat, Message, MessageFormData } from '../models/Message';

/**
 * Service Firestore - Gestion des données
 */
export class FirestoreService {
  // ==================== PROPRIÉTÉS ====================

  /**
   * Récupérer toutes les propriétés approuvées
   */
  static async getApprovedProperties(): Promise<Property[]> {
    try {
      console.log('🏠 Récupération des propriétés approuvées...');
      
      // Récupérer TOUTES les propriétés d'abord pour diagnostic
      const allPropsSnapshot = await getDocs(collection(db, 'properties'));
      console.log('📊 Total de propriétés dans Firestore:', allPropsSnapshot.size);
      
      // Compter par statut
      const statusCount: Record<string, number> = {};
      allPropsSnapshot.docs.forEach(doc => {
        const status = doc.data().status || 'undefined';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      console.log('📊 Propriétés par statut:', statusCount);
      
      // TEMPORAIRE: Récupérer TOUTES les propriétés sans filtre de statut
      console.log('⚠️ MODE TEMPORAIRE: Affichage de TOUTES les propriétés (sans filtre status)');
      const q = query(
        collection(db, 'properties'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const properties = snapshot.docs.map(doc => this.convertProperty(doc.id, doc.data()));
      console.log(`✅ ${properties.length} propriétés récupérées (tous statuts)`);
      
      if (properties.length > 0) {
        console.log('🔍 Première propriété:', { id: properties[0].id, title: properties[0].title, status: properties[0].status });
      }
      
      return properties;
    } catch (error) {
      console.error('❌ Erreur récupération propriétés:', error);
      return [];
    }
  }

  /**
   * Écouter les propriétés approuvées en temps réel
   */
  static listenToApprovedProperties(
    callback: (properties: Property[]) => void
  ): () => void {
    const q = query(
      collection(db, 'properties'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const properties = snapshot.docs.map(doc => 
        this.convertProperty(doc.id, doc.data())
      );
      callback(properties);
    });
  }

  /**
   * Récupérer une propriété par ID
   */
  static async getPropertyById(id: string): Promise<Property | null> {
    try {
      const docRef = doc(db, 'properties', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return this.convertProperty(docSnap.id, docSnap.data());
      }
      return null;
    } catch (error) {
      console.error('Erreur récupération propriété:', error);
      return null;
    }
  }

  /**
   * Ajouter une nouvelle propriété (status='pending')
   */
  static async addProperty(
    data: PropertyFormData,
    ownerId: string,
    ownerName: string,
    ownerPhone?: string
  ): Promise<string> {
    try {
      const propertyData = {
        ...data,
        ownerId,
        ownerName,
        ownerPhone,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      console.log('DEBUG addProperty ownerId =', ownerId, 'status =', propertyData.status);
      const docRef = await addDoc(collection(db, 'properties'), propertyData);
      console.log('✅ Propriété créée avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur ajout propriété:', error);
      throw new Error('Erreur lors de l\'ajout de la propriété');
    }
  }

  /**
   * Modifier une propriété
   */
  static async updateProperty(
    id: string,
    data: Partial<PropertyFormData>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'properties', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erreur modification propriété:', error);
      throw new Error('Erreur lors de la modification');
    }
  }

  /**
   * Supprimer une propriété
   */
  static async deleteProperty(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'properties', id));
    } catch (error) {
      console.error('Erreur suppression propriété:', error);
      throw new Error('Erreur lors de la suppression');
    }
  }

  /**
   * Récupérer les propriétés d'un utilisateur
   * Support des anciennes propriétés Flutter (userId) et nouvelles (ownerId)
   */
  static async getUserProperties(userId: string): Promise<Property[]> {
    try {
      console.log('📋 Récupération des propriétés de l\'utilisateur:', userId);
      console.log('🔍 DEBUG getUserProperties userId =', userId);
      
      // Requête 1: nouvelles propriétés avec ownerId
      const q1 = query(
        collection(db, 'properties'),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot1 = await getDocs(q1);
      console.log('🔍 getUserProperties avec ownerId: count =', snapshot1.size);
      
      // Requête 2: anciennes propriétés Flutter avec userId
      const q2 = query(
        collection(db, 'properties'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot2 = await getDocs(q2);
      console.log('🔍 getUserProperties avec userId: count =', snapshot2.size);
      
      // Fusionner les résultats en évitant les doublons
      const propertiesMap = new Map<string, Property>();
      
      snapshot1.docs.forEach(doc => {
        propertiesMap.set(doc.id, this.convertProperty(doc.id, doc.data()));
      });
      
      snapshot2.docs.forEach(doc => {
        if (!propertiesMap.has(doc.id)) {
          propertiesMap.set(doc.id, this.convertProperty(doc.id, doc.data()));
        }
      });
      
      const properties = Array.from(propertiesMap.values());
      console.log(`✅ ${properties.length} propriétés utilisateur récupérées (ownerId: ${snapshot1.size}, userId: ${snapshot2.size})`);
      
      if (properties.length > 0) {
        console.log('🔍 Première propriété utilisateur:', { id: properties[0].id, title: properties[0].title, ownerId: properties[0].ownerId });
      } else {
        console.log('⚠️ Aucune propriété trouvée pour userId =', userId);
        // Vérifier si des propriétés existent avec d'autres champs
        const allPropsSnapshot = await getDocs(collection(db, 'properties'));
        console.log('🔍 Total propriétés dans Firestore:', allPropsSnapshot.size);
        if (allPropsSnapshot.size > 0) {
          const firstDoc = allPropsSnapshot.docs[0].data();
          console.log('🔍 Exemple de document property:', {
            id: allPropsSnapshot.docs[0].id,
            ownerId: firstDoc.ownerId,
            userId: firstDoc.userId,
            uid: firstDoc.uid,
          });
        }
      }
      
      return properties;
    } catch (error) {
      console.error('❌ Erreur récupération propriétés utilisateur:', error);
      return [];
    }
  }

  /**
   * Récupérer les propriétés en attente (Admin)
   */
  static async getPendingProperties(): Promise<Property[]> {
    try {
      console.log('🛠 Admin - Récupération des propriétés en attente...');
      const q = query(
        collection(db, 'properties'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const properties = snapshot.docs.map(doc => this.convertProperty(doc.id, doc.data()));
      console.log(`🛠 Admin - ${properties.length} propriétés en attente récupérées`);
      return properties;
    } catch (error) {
      console.error('❌ Erreur récupération propriétés en attente:', error);
      return [];
    }
  }

  /**
   * Récupérer TOUTES les propriétés (Admin)
   */
  static async getAllProperties(): Promise<Property[]> {
    try {
      console.log('🛠 Admin - Récupération de toutes les propriétés...');
      const q = query(
        collection(db, 'properties'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const properties = snapshot.docs.map(doc => this.convertProperty(doc.id, doc.data()));
      console.log(`🛠 Admin - ${properties.length} propriétés totales récupérées`);
      
      // Compter par statut
      const statusCount: Record<string, number> = {};
      properties.forEach(p => {
        const status = p.status || 'undefined';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      console.log('🛠 Admin - Répartition par statut:', statusCount);
      
      return properties;
    } catch (error) {
      console.error('❌ Erreur récupération toutes propriétés:', error);
      return [];
    }
  }

  /**
   * Approuver une propriété (Admin)
   */
  static async approveProperty(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'properties', id), {
        status: 'approved',
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erreur approbation propriété:', error);
      throw new Error('Erreur lors de l\'approbation');
    }
  }

  /**
   * Rejeter une propriété (Admin)
   */
  static async rejectProperty(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'properties', id), {
        status: 'rejected',
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erreur rejet propriété:', error);
      throw new Error('Erreur lors du rejet');
    }
  }

  // ==================== FAVORIS ====================

  /**
   * Ajouter aux favoris
   */
  static async addToFavorites(userId: string, propertyId: string): Promise<void> {
    try {
      const favRef = doc(db, 'users', userId, 'favorites', propertyId);
      await setDoc(favRef, {
        propertyId,
        addedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erreur ajout favori:', error);
      throw new Error('Erreur lors de l\'ajout aux favoris');
    }
  }

  /**
   * Retirer des favoris
   */
  static async removeFromFavorites(userId: string, propertyId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId, 'favorites', propertyId));
    } catch (error) {
      console.error('Erreur suppression favori:', error);
      throw new Error('Erreur lors de la suppression des favoris');
    }
  }

  /**
   * Vérifier si une propriété est en favoris
   */
  static async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    try {
      const favDoc = await getDoc(doc(db, 'users', userId, 'favorites', propertyId));
      return favDoc.exists();
    } catch (error) {
      console.error('Erreur vérification favori:', error);
      return false;
    }
  }

  /**
   * Récupérer les favoris d'un utilisateur
   */
  static async getFavorites(userId: string): Promise<Property[]> {
    try {
      console.log('❤️ Récupération des favoris pour:', userId);
      const favSnapshot = await getDocs(collection(db, 'users', userId, 'favorites'));
      console.log(`⭐ Favoris pour user ${userId}: ${favSnapshot.size} docs`);
      
      // Le propertyId peut être soit l'ID du document, soit un champ 'propertyId'
      const propertyIds: string[] = [];
      favSnapshot.docs.forEach(doc => {
        // Essayer d'abord l'ID du document
        const docId = doc.id;
        // Sinon chercher un champ 'propertyId'
        const data = doc.data();
        console.log(`🔖 Document favori ${docId}:`, data);
        const propId = data.propertyId || docId;
        propertyIds.push(propId);
        console.log(`🔖 Favori trouvé: docId=${docId}, propertyId=${propId}`);
      });
      
      console.log(`📍 ${propertyIds.length} IDs de propriétés favorites:`, propertyIds);
      
      if (propertyIds.length === 0) {
        console.log('⚠️ Aucun favori trouvé dans users/' + userId + '/favorites');
        return [];
      }

      const properties: Property[] = [];
      for (const id of propertyIds) {
        const property = await this.getPropertyById(id);
        if (property) {
          properties.push(property);
          console.log(`✅ Propriété favorite chargée: ${property.title}`);
        } else {
          console.log(`⚠️ Propriété favorite introuvable: ${id}`);
        }
      }
      console.log(`✅ ${properties.length} propriétés favorites chargées sur ${propertyIds.length}`);
      
      return properties;
    } catch (error) {
      console.error('❌ Erreur récupération favoris:', error);
      return [];
    }
  }

  /**
   * Alias pour getFavorites (compatibilité)
   */
  static async getUserFavorites(userId: string): Promise<Property[]> {
    return this.getFavorites(userId);
  }

  /**
   * Toggle favori (ajouter ou retirer)
   */
  static async toggleFavorite(userId: string, propertyId: string): Promise<void> {
    const isFav = await this.isFavorite(userId, propertyId);
    if (isFav) {
      await this.removeFromFavorites(userId, propertyId);
    } else {
      await this.addToFavorites(userId, propertyId);
    }
  }

  // ==================== RECHERCHE ====================

  /**
   * Rechercher des propriétés par titre ou description
   */
  static async searchProperties(searchQuery: string): Promise<Property[]> {
    try {
      const q = query(
        collection(db, 'properties'),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      const properties = snapshot.docs.map(doc => this.convertProperty(doc.id, doc.data()));
      
      // Filtrage côté client (Firestore ne supporte pas LIKE)
      const searchLower = searchQuery.toLowerCase();
      return allProperties.filter((p) =>
        (p.title || '').toLowerCase().includes(searchLower) ||
        (p.description || '').toLowerCase().includes(searchLower) ||
        (p.location || '').toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Erreur recherche propriétés:', error);
      return [];
    }
  }

  // ==================== UTILISATEURS ====================

  /**
   * Récupérer un utilisateur par ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupérer tous les utilisateurs (Admin)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      console.log('👥 Récupération de tous les utilisateurs...');
      const snapshot = await getDocs(collection(db, 'users'));
      const users = snapshot.docs.map(doc => doc.data() as User);
      console.log(`✅ ${users.length} utilisateurs récupérés`);
      return users;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateurs:', error);
      return [];
    }
  }

  /**
   * Supprimer un utilisateur (Admin)
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId));
      console.log('✅ Utilisateur supprimé:', userId);
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
  }

  /**
   * Créer un utilisateur
   */
  static async createUser(uid: string, email: string, displayName: string): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        displayName,
        role: 'user',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static async updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  }

  // ==================== MESSAGERIE ====================

  /**
   * Créer ou récupérer une conversation
   */
  static async getOrCreateChat(
    userId: string,
    userName: string,
    ownerId: string,
    ownerName: string,
    propertyId: string,
    propertyTitle: string
  ): Promise<string> {
    try {
      // Vérifier si une conversation existe déjà
      const q = query(
        collection(db, 'chats'),
        where('propertyId', '==', propertyId),
        where('participants', 'array-contains', userId)
      );
      
      const snapshot = await getDocs(q);
      const existingChat = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(ownerId);
      });

      if (existingChat) {
        return existingChat.id;
      }

      // Créer une nouvelle conversation
      const chatData = {
        participants: [userId, ownerId],
        participantNames: {
          [userId]: userName,
          [ownerId]: ownerName,
        },
        propertyId,
        propertyTitle,
        lastMessage: '',
        lastMessageTime: Timestamp.now(),
        unreadCount: {
          [userId]: 0,
          [ownerId]: 0,
        },
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      return docRef.id;
    } catch (error) {
      console.error('Erreur création chat:', error);
      throw new Error('Erreur lors de la création de la conversation');
    }
  }

  /**
   * Envoyer un message
   */
  static async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    text: string
  ): Promise<void> {
    try {
      // Ajouter le message
      const messageData = {
        chatId,
        senderId,
        senderName,
        text,
        createdAt: Timestamp.now(),
        read: false,
      };
      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

      // Mettre à jour le chat
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find((id: string) => id !== senderId);
        
        await updateDoc(chatRef, {
          lastMessage: text,
          lastMessageTime: Timestamp.now(),
          [`unreadCount.${otherUserId}`]: (chatData.unreadCount[otherUserId] || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw new Error('Erreur lors de l\'envoi du message');
    }
  }

  /**
   * Écouter les messages d'une conversation
   */
  static listenToMessages(
    chatId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => this.convertMessage(doc.id, doc.data()));
      callback(messages);
    });
  }

  /**
   * Écouter les conversations d'un utilisateur
   * Enrichit automatiquement les noms manquants depuis la collection users
   */
  static listenToChats(
    userId: string,
    callback: (chats: Chat[]) => void
  ): () => void {
    console.log('💬 Écoute des conversations pour:', userId);
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );
    
    return onSnapshot(q, async (snapshot) => {
      const chats = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const chat = this.convertChat(docSnap.id, data);
          
          // Enrichir les noms manquants
          if (chat.participants && chat.participants.length > 0) {
            for (const participantId of chat.participants) {
              if (!chat.participantNames[participantId] || chat.participantNames[participantId] === 'Utilisateur') {
                try {
                  const userDoc = await getDoc(doc(db, 'users', participantId));
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    chat.participantNames[participantId] = 
                      userData.displayName || 
                      userData.name || 
                      userData.email?.split('@')[0] || 
                      'Utilisateur';
                    
                    // Mettre à jour dans Firestore pour éviter de refaire la requête
                    await updateDoc(doc(db, 'chats', docSnap.id), {
                      [`participantNames.${participantId}`]: chat.participantNames[participantId]
                    });
                  }
                } catch (error) {
                  console.log('Erreur récupération nom utilisateur:', error);
                }
              }
            }
          }
          
          return chat;
        })
      );
      
      console.log(`✅ ${chats.length} conversations reçues avec noms enrichis`);
      callback(chats);
    });
  }

  /**
   * Alias pour listenToChats (compatibilité)
   */
  static getUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    return this.listenToChats(userId, callback);
  }

  /**
   * Alias pour listenToMessages (compatibilité)
   */
  static getChatMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    return this.listenToMessages(chatId, callback);
  }

  /**
   * Alias pour getOrCreateChat (compatibilité)
   */
  static async createOrGetChat(userId: string, ownerId: string, propertyId: string): Promise<string> {
    // On a besoin des noms, mais on va les récupérer
    const userData = await this.getUserById(userId);
    const ownerData = await this.getUserById(ownerId);
    const property = await this.getPropertyById(propertyId);
    
    return this.getOrCreateChat(
      userId,
      userData?.displayName || 'Utilisateur',
      ownerId,
      ownerData?.displayName || 'Propriétaire',
      propertyId,
      property?.title || 'Propriété'
    );
  }

  /**
   * Marquer une conversation comme lue
   */
  static async markChatAsRead(chatId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        [`unreadCount.${userId}`]: 0,
      });
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
    }
  }

  // ==================== UTILITAIRES ====================

  /**
   * Convertir un document Firestore en Property
   */
  private static convertProperty(id: string, data: DocumentData): Property {
    return {
      id,
      title: data.title,
      description: data.description,
      price: data.price,
      oldPrice: data.oldPrice,
      surface: data.surface,
      rooms: data.rooms,
      type: data.type,
      purpose: data.purpose,
      status: data.status,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      images: data.images || [],
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      ownerPhone: data.ownerPhone,
      isPromo: data.isPromo || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  /**
   * Convertir un document Firestore en Chat
   */
  private static convertChat(id: string, data: DocumentData): Chat {
    return {
      id,
      participants: data.participants || [],
      participantNames: data.participantNames || {},
      propertyId: data.propertyId || '',
      propertyTitle: data.propertyTitle || 'Propriété',
      lastMessage: data.lastMessage || '',
      lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
      unreadCount: data.unreadCount || {},
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }

  /**
   * Convertir un document Firestore en Message
   */
  private static convertMessage(id: string, data: DocumentData): Message {
    return {
      id,
      chatId: data.chatId,
      senderId: data.senderId,
      senderName: data.senderName,
      text: data.text,
      createdAt: data.createdAt?.toDate() || new Date(),
      read: data.read || false,
    };
  }
}

// Exports de fonctions pour compatibilité avec les imports des écrans
export const getApprovedProperties = () => FirestoreService.getApprovedProperties();
export const getPropertyById = (id: string) => FirestoreService.getPropertyById(id);
export const getUserProperties = (userId: string) => FirestoreService.getUserProperties(userId);
export const getPendingProperties = () => FirestoreService.getPendingProperties();
export const getAllProperties = () => FirestoreService.getAllProperties();
export const addProperty = (data: PropertyFormData, ownerId: string, ownerName?: string, ownerPhone?: string) => 
  FirestoreService.addProperty(data, ownerId, ownerName || 'Utilisateur', ownerPhone);
export const updateProperty = (propertyId: string, data: Partial<PropertyFormData>) => FirestoreService.updateProperty(propertyId, data);
export const deleteProperty = (propertyId: string) => FirestoreService.deleteProperty(propertyId);
export const approveProperty = (propertyId: string) => FirestoreService.approveProperty(propertyId);
export const rejectProperty = (propertyId: string) => FirestoreService.rejectProperty(propertyId);
export const searchProperties = (query: string) => FirestoreService.searchProperties(query);

// Favoris
export const getUserFavorites = (userId: string) => FirestoreService.getUserFavorites(userId);
export const toggleFavorite = (userId: string, propertyId: string) => FirestoreService.toggleFavorite(userId, propertyId);
export const isFavorite = (userId: string, propertyId: string) => FirestoreService.isFavorite(userId, propertyId);

// Users
export const getUserById = (userId: string) => FirestoreService.getUserById(userId);
export const getAllUsers = () => FirestoreService.getAllUsers();
export const deleteUser = (userId: string) => FirestoreService.deleteUser(userId);
export const createUser = (uid: string, email: string, displayName: string) => FirestoreService.createUser(uid, email, displayName);
export const updateUserProfile = (userId: string, data: Partial<User>) => FirestoreService.updateUserProfile(userId, data);

// Chats & Messages
export const getUserChats = (userId: string, callback: (chats: Chat[]) => void) => FirestoreService.getUserChats(userId, callback);
export const getChatMessages = (chatId: string, callback: (messages: Message[]) => void) => FirestoreService.getChatMessages(chatId, callback);
export const createOrGetChat = (userId: string, ownerId: string, propertyId: string) => FirestoreService.createOrGetChat(userId, ownerId, propertyId);
export const sendMessage = (chatId: string, senderId: string, senderName: string, text: string) => FirestoreService.sendMessage(chatId, senderId, senderName, text);

