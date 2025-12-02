import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formater un prix en dinars tunisiens
 */
export const formatPrice = (price: number): string => {
  return `${price.toFixed(0)} DT`;
};

export const formatPriceDT = (price: number): string => {
  return `${price.toLocaleString('fr-TN')} DT`;
};

/**
 * Formater une date
 */
export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy', { locale: fr });
};

/**
 * Formater une date relative (il y a X jours)
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return formatDate(date);
};

/**
 * Valider un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valider un mot de passe
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Tronquer un texte
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
