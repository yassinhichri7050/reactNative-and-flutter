/**
 * Modèle User - Représente un utilisateur
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  location?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'user' | 'admin';

/**
 * Données pour l'inscription
 */
export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  location?: string;
}

/**
 * Données pour la connexion
 */
export interface LoginData {
  email: string;
  password: string;
}
