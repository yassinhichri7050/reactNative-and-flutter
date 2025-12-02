import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider d'authentification
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      console.log('👤 Chargement des données utilisateur pour:', uid);
      const data = await AuthService.getUserData(uid);
      if (data) {
        console.log('✅ Données utilisateur chargées:', { uid: data.uid, email: data.email, role: data.role });
        setUserData(data);
      } else {
        console.log('⚠️ Aucun document utilisateur trouvé dans Firestore pour:', uid);
        // Utilisateur existe dans Auth mais pas dans Firestore (ancien compte)
        // On crée un document minimal pour compatibilité
        setUserData(null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement données utilisateur:', error);
      setUserData(null);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 AuthContext.login() appelé avec:', email);
    await AuthService.login({ email, password });
    console.log('✅ AuthService.login() terminé avec succès');
  };

  const register = async (data: any) => {
    const user = await AuthService.register(data);
    setUserData(user);
  };

  const logout = async () => {
    await AuthService.logout();
    setUserData(null);
  };

  const refreshUserData = async () => {
    if (firebaseUser) {
      await loadUserData(firebaseUser.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userData,
        loading,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook pour utiliser l'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
