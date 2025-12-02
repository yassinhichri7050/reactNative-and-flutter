# ImmobilierApp - Guide d'Installation

## 📱 Installation sur Téléphone Android

### Étape 1: Localiser l'APK
```
C:\Users\yassi\Desktop\flutter\immobilier_app\build\app\outputs\apk\release\app-release.apk
```

### Étape 2: Transférer sur le téléphone
1. Connectez votre téléphone à l'ordinateur via USB
2. Copiez `app-release.apk` sur votre téléphone (dossier Téléchargements)
3. Ou envoyez-le par email/WhatsApp et téléchargez-le sur le téléphone

### Étape 3: Installer l'APK
1. Sur le téléphone: **Paramètres → Sécurité → Sources inconnues** → Activer
2. Ouvrez le gestionnaire de fichiers
3. Naviguez jusqu'à `app-release.apk`
4. Tapez dessus pour installer
5. Confirmez l'installation

### Étape 4: Lancer l'Application
- L'app apparaîtra dans vos applications
- Appuyez sur "ImmobilierApp" pour démarrer
- **Splash screen** (900ms) → **Écran de login**

---

## 🔑 Premier Lancement

### Créer un Compte
1. Tapez "S'inscrire"
2. Entrez:
   - Nom complet
   - Email (valide)
   - Numéro de téléphone
   - Mot de passe (min. 6 caractères)
3. Appuyez sur "S'inscrire"

### Se Connecter
1. Entrez email et mot de passe
2. Appuyez sur "Connexion"
3. Accès à l'écran d'accueil!

---

## 🏠 Fonctionnalités Disponibles

### Navigation Inférieure (5 onglets)
1. **Accueil** - Annonces récentes, promotions, recommandées
2. **Rechercher** - Filtres avancés (prix, type, surface, localisation)
3. **Publier** - Ajouter une nouvelle annonce avec images
4. **Favoris** - Vos annonces favorites
5. **Profil** - Votre profil et vos annonces

### Header avec Bouton Thème
- ☀️ **Light Mode** (beige/marron)
- 🌙 **Dark Mode** (noir/gris)
- Appuyez sur le bouton en haut à droite pour basculer

### Fonctionnalités Clés
✅ **Authentication** - Inscription, connexion, mot de passe oublié  
✅ **Annonces** - CRUD complet, upload d'images  
✅ **Favoris** - Ajouter/retirer des annonces favorites  
✅ **Recherche** - Filtres multi-critères  
✅ **Chat** - Messagerie temps réel avec utilisateurs  
✅ **Profil** - Modifier profil, changer mot de passe  
✅ **Thème** - Light/Dark mode persistant  

---

## ⚙️ Configuration Firebase

L'app utilise **Firebase** pour:
- 🔐 Authentification (Email/Mot de passe)
- 🗄️ Base de données (Firestore)
- 📁 Stockage (Images)
- 💬 Messagerie temps réel

**Configuration automatique** via `google-services.json`

---

## 🛠️ Dépannage

### L'app crash au démarrage
→ Assurez-vous que vous êtes connecté à **Internet**  
→ Attendez quelques secondes pour que Firebase se charge

### Les images ne s'affichent pas
→ Vérifiez les permissions de caméra/galerie  
→ Redémarrez l'app

### Impossible de se connecter
→ Vérifiez votre email/mot de passe  
→ Cliquez sur "Mot de passe oublié?" pour réinitialiser

---

## 📊 Spécifications Techniques

- **SDK Flutter**: 3.9.2
- **Min. Android**: API 21 (Android 5.0)
- **Taille APK**: ~80-100 MB
- **Version App**: 1.0.0

---

## 💡 Conseils

1. **Ajoutez des annonces** pour tester la recherche
2. **Activez le Dark Mode** pour tester la persistance du thème
3. **Testez le Chat** - Créez 2 comptes et discutez!
4. **Mettez en Favoris** les annonces que vous aimez

---

## 📧 Support

Pour toute question: `support@immobilierapp.local`

**Bon usage de l'app! 🎉**
