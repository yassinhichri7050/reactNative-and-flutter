# 🔥 Configuration des Index Firebase Firestore

## Index Requis pour l'Application

### 1. **Index pour les Propriétés (HomeScreen)**

**Collection:** `properties`  
**Champs indexés:**
- `status` (Ascending)
- `createdAt` (Descending)

**Comment créer cet index:**

#### Méthode 1 : Via l'URL générée par Firebase (RECOMMANDÉ)
1. Lancez l'application et accédez à l'écran d'accueil
2. Firebase affichera une erreur avec un lien direct comme :
   ```
   https://console.firebase.google.com/project/immobilierapp-fd8a0/firestore/indexes?create_composite=...
   ```
3. Cliquez sur ce lien
4. Firebase pré-remplira automatiquement tous les champs
5. Cliquez sur "Créer un index"
6. Attendez 2-5 minutes que l'index soit créé (statut "Building" → "Enabled")

#### Méthode 2 : Manuellement dans Firebase Console
1. Allez sur https://console.firebase.google.com/project/immobilierapp-fd8a0/firestore/indexes
2. Cliquez sur "Créer un index"
3. Configurez :
   - **Collection:** `properties`
   - **Champs à indexer:**
     - `status` → Ascending
     - `createdAt` → Descending
   - **Scope de la requête:** Collection
4. Cliquez sur "Créer"

### 2. **Index pour les Conversations (MessagesScreen)**

**Collection:** `chats`  
**Champs indexés:**
- `participants` (Array-contains)
- `lastMessageTime` (Descending)

**Comment créer cet index:**
- Suivez la même procédure que ci-dessus
- Configurez :
  - **Collection:** `chats`
  - **Champs à indexer:**
    - `participants` → Array-contains
    - `lastMessageTime` → Descending

### 3. **Règles de Sécurité Firestore**

Ajoutez ces règles dans Firebase Console → Firestore Database → Rules :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Propriétés
    match /properties/{propertyId} {
      // Lecture : tout le monde peut lire les propriétés approuvées
      allow read: if resource.data.status == 'approved' || 
                     request.auth != null;
      
      // Création : utilisateur authentifié
      allow create: if request.auth != null;
      
      // Modification/Suppression : propriétaire ou admin
      allow update, delete: if request.auth != null && 
                               (request.auth.uid == resource.data.ownerId ||
                                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Favoris
    match /users/{userId}/favorites/{favoriteId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Utilisateurs
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Conversations
    match /chats/{chatId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.participants;
      
      // Messages dans les conversations
      match /messages/{messageId} {
        allow read: if request.auth != null && 
                       request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if request.auth != null && 
                         request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
```

## ✅ Vérification

Une fois les index créés :

1. **Vérifier le statut des index :**
   - Allez dans Firebase Console → Firestore Database → Indexes
   - Attendez que tous les index soient en statut "Enabled" (vert)

2. **Tester l'application :**
   - Rechargez l'app dans Expo Go
   - L'écran d'accueil devrait afficher les propriétés
   - L'écran Favoris devrait fonctionner
   - L'écran Messagerie devrait afficher les conversations

3. **Vérifier les logs :**
   - Plus d'erreur "The query requires an index"
   - Plus d'erreur "getUserFavorites is not a function"
   - Plus d'erreur "getUserChats is not a function"

## 🎯 Résumé des Actions

- ✅ Index `properties` (status + createdAt) → **OBLIGATOIRE**
- ✅ Index `chats` (participants + lastMessageTime) → **OBLIGATOIRE**
- ✅ Règles de sécurité Firestore → **RECOMMANDÉ**

## 📝 Notes

- Les index prennent 2-5 minutes à être créés
- Sans index, les requêtes avec `where()` + `orderBy()` échouent
- Firebase limite le nombre de requêtes simultanées sans index

## 🆘 En cas de problème

Si les index ne se créent pas :
1. Vérifiez que vous êtes sur le bon projet Firebase (`immobilierapp-fd8a0`)
2. Vérifiez vos permissions (Owner/Editor requis)
3. Essayez de recréer l'index avec la méthode manuelle
4. Consultez les logs Firebase Console → Firestore → Usage
