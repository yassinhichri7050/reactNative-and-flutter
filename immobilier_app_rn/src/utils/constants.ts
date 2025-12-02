/**
 * Constantes de l'application
 */

export const APP_NAME = 'Gold Meuble';
export const APP_VERSION = '2.0.0';

export const PROPERTY_TYPES = [
  'Appartement',
  'Maison',
  'Villa',
  'Studio',
  'Terrain',
  'Autre',
] as const;

export const MAX_IMAGES = 5;

export const DEFAULT_LOCATION = {
  latitude: 36.8065,
  longitude: 10.1815,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const THEME_LABELS = {
  gold_light: 'Thème clair (Gold)',
  gold_dark: 'Thème sombre (Gold)',
  green_nature: 'Thème vert (Nature)',
};

export const PURPOSE_LABELS = {
  rent: 'À LOUER',
  sale: 'À VENDRE',
};

export const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Validée',
  rejected: 'Rejetée',
};
