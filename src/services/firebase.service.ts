import { Injectable, inject } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp;
  private firestore: Firestore;
  private isOnline = true;

  constructor() {
    try {
      // Initialize Firebase
      this.app = initializeApp(environment.firebase);
      this.firestore = getFirestore(this.app);
      
      // Check if Firebase is configured
      if (!environment.firebase.apiKey || environment.firebase.apiKey === 'YOUR_API_KEY') {
        console.warn('Firebase not configured. Using localStorage fallback.');
        this.isOnline = false;
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      this.isOnline = false;
    }
  }

  /**
   * Check if Firebase is available and configured
   */
  isFirebaseAvailable(): boolean {
    return this.isOnline;
  }

  /**
   * Get Firestore instance
   */
  getFirestoreInstance(): Firestore {
    return this.firestore;
  }

  /**
   * Save a document to Firestore
   */
  async saveDocument(collectionName: string, documentId: string, data: any): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Firebase not available');
    }
    
    try {
      const docRef = doc(this.firestore, collectionName, documentId);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error saving document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get a document from Firestore
   */
  async getDocument(collectionName: string, documentId: string): Promise<any | null> {
    if (!this.isOnline) {
      throw new Error('Firebase not available');
    }
    
    try {
      const docRef = doc(this.firestore, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get all documents from a collection
   */
  async getCollection(collectionName: string): Promise<any[]> {
    if (!this.isOnline) {
      throw new Error('Firebase not available');
    }
    
    try {
      const collectionRef = collection(this.firestore, collectionName);
      const querySnapshot = await getDocs(collectionRef);
      
      const documents: any[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return documents;
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document from Firestore
   */
  async deleteDocument(collectionName: string, documentId: string): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Firebase not available');
    }
    
    try {
      const docRef = doc(this.firestore, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for a collection
   */
  subscribeToCollection(
    collectionName: string, 
    callback: (data: any[]) => void
  ): Unsubscribe | null {
    if (!this.isOnline) {
      return null;
    }
    
    try {
      const collectionRef = collection(this.firestore, collectionName);
      const q = query(collectionRef, orderBy('updatedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents: any[] = [];
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(documents);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error(`Error subscribing to ${collectionName}:`, error);
      return null;
    }
  }

  /**
   * Sync localStorage data to Firebase
   */
  async syncToFirebase(collectionName: string, storageKey: string): Promise<void> {
    if (!this.isOnline) {
      return;
    }
    
    try {
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        const data = JSON.parse(localData);
        await this.saveDocument(collectionName, 'data', { content: data });
        console.log(`Synced ${storageKey} to Firebase`);
      }
    } catch (error) {
      console.error(`Error syncing ${storageKey} to Firebase:`, error);
    }
  }

  /**
   * Sync Firebase data to localStorage
   */
  async syncFromFirebase(collectionName: string, storageKey: string): Promise<void> {
    if (!this.isOnline) {
      return;
    }
    
    try {
      const firebaseData = await this.getDocument(collectionName, 'data');
      if (firebaseData && firebaseData.content) {
        localStorage.setItem(storageKey, JSON.stringify(firebaseData.content));
        console.log(`Synced ${storageKey} from Firebase`);
      }
    } catch (error) {
      console.error(`Error syncing ${storageKey} from Firebase:`, error);
    }
  }
}
