/**
 * Modèle Property - Représente une propriété immobilière
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  surface: number;
  rooms: number;
  type: PropertyType;
  purpose: PropertyPurpose;
  status: PropertyStatus;
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  isPromo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType = 'Appartement' | 'Maison' | 'Villa' | 'Studio' | 'Terrain' | 'Autre';

export type PropertyPurpose = 'rent' | 'sale';

export type PropertyStatus = 'pending' | 'approved' | 'rejected';

/**
 * Données pour créer/modifier une propriété
 */
export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  surface: number;
  rooms: number;
  type: PropertyType;
  purpose: PropertyPurpose;
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  isPromo: boolean;
}
