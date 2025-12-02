import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, RegisterData, LoginData } from '../models/User';

/**
 * Service d'authentification
 */
export class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(data: RegisterData): Promise<User> {
    try {
      console.log('📝 Tentative d\'inscription avec:', data.email);
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      console.log('✅ Utilisateur créé dans Firebase Auth:', userCredential.user.uid);

      // Créer le document utilisateur dans Firestore
      const userData: User = {
        uid: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        phone: data.phone,
        location: data.location,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log('✅ Document utilisateur créé dans Firestore');

      return userData;
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error.code, error.message);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  static async login(data: LoginData): Promise<FirebaseUser> {
    try {
      console.log('🔐 Tentative de connexion avec:', data.email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log('✅ Connexion réussie pour:', data.email);
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error.code, error.message);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Déconnexion
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Erreur déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Erreur reset password:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Changement de mot de passe
   */
  static async changePassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Récupérer les données utilisateur depuis Firestore
   */
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
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
   * Traduire les codes d'erreur Firebase
   */
  private static getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cette adresse email';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard';
      case 'auth/requires-recent-login':
        return 'Veuillez vous reconnecter pour effectuer cette action';
      default:
        return 'Une erreur est survenue. Veuillez réessayer';
    }
  }
}
