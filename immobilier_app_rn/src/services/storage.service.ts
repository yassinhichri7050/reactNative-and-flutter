import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';

/**
 * Service de gestion du stockage Firebase Storage
 */
export class StorageService {
  /**
   * Choisir et uploader des images (max 5)
   */
  static async pickAndUploadImages(
    maxImages: number = 5
  ): Promise<string[]> {
    try {
      // Demander la permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission refusée pour accéder aux photos');
      }

      // Choisir les images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxImages,
      });

      if (result.canceled) {
        return [];
      }

      // Uploader chaque image
      const urls: string[] = [];
      for (const asset of result.assets.slice(0, maxImages)) {
        const url = await this.uploadImage(asset.uri);
        if (url) urls.push(url);
      }

      return urls;
    } catch (error) {
      console.error('Erreur sélection images:', error);
      throw new Error('Erreur lors de la sélection des images');
    }
  }

  /**
   * Uploader une seule image
   */
  static async uploadImage(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `properties/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Erreur upload image:', error);
      throw new Error('Erreur lors de l\'upload de l\'image');
    }
  }

  /**
   * Supprimer une image
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Erreur suppression image:', error);
      // Ne pas throw d'erreur si l'image n'existe pas
    }
  }

  /**
   * Supprimer plusieurs images
   */
  static async deleteImages(imageUrls: string[]): Promise<void> {
    try {
      await Promise.all(imageUrls.map(url => this.deleteImage(url)));
    } catch (error) {
      console.error('Erreur suppression images:', error);
    }
  }
}
