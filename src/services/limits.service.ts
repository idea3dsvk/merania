import { Injectable, signal, inject } from '@angular/core';
import { MeasurementType } from '../models';
import { FirebaseService } from './firebase.service';

export interface MeasurementLimits {
  temperature_humidity?: {
    temperatureMin: number;
    temperatureMax: number;
    humidityMin: number;
    humidityMax: number;
  };
  luminosity?: {
    min: number;
    max: number;
  };
  dustiness_iso6?: {
    particles_0_5um_min: number;
    particles_0_5um_max: number;
    particles_5um_min: number;
    particles_5um_max: number;
  };
  dustiness_iso5?: {
    particles_0_5um_min: number;
    particles_0_5um_max: number;
    particles_5um_min: number;
    particles_5um_max: number;
  };
  torque?: {
    min: number;
    max: number;
  };
  surface_resistance?: {
    min: number;
    max: number;
  };
  grounding_resistance?: {
    min: number;
    max: number;
  };
  ionizer?: {
    decayTime: number;
    balance: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LimitsService {
  private firebaseService = inject(FirebaseService);
  private readonly STORAGE_KEY = 'measurement-limits';
  private readonly COLLECTION_NAME = 'limits';
  private readonly DOCUMENT_ID = 'default-limits';
  
  private _limits = signal<MeasurementLimits>(this.loadFromStorage());
  
  public readonly limits = this._limits.asReadonly();

  constructor() {
    this.initializeFirebaseSync();
  }

  private async initializeFirebaseSync(): Promise<void> {
    if (!this.firebaseService.isFirebaseAvailable()) {
      console.log('Firebase not available for limits, using localStorage only');
      return;
    }

    try {
      // Load limits from Firebase
      const firebaseData = await this.firebaseService.getDocument(this.COLLECTION_NAME, this.DOCUMENT_ID);
      if (firebaseData) {
        console.log('Loaded limits from Firebase');
        this._limits.set(firebaseData as MeasurementLimits);
        this.saveToStorage(firebaseData as MeasurementLimits);
      }
    } catch (error) {
      console.error('Firebase limits initialization error:', error);
    }
  }

  private loadFromStorage(): MeasurementLimits {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading limits from storage:', error);
    }
    
    // Default limits
    return {
      temperature_humidity: {
        temperatureMin: 15,
        temperatureMax: 30,
        humidityMin: 30,
        humidityMax: 70,
      },
      luminosity: {
        min: 500,
        max: 1000,
      },
      dustiness_iso6: {
        particles_0_5um_min: 0,
        particles_0_5um_max: 10200,
        particles_5um_min: 0,
        particles_5um_max: 2930,
      },
      dustiness_iso5: {
        particles_0_5um_min: 0,
        particles_0_5um_max: 3520,
        particles_5um_min: 0,
        particles_5um_max: 293,
      },
      torque: {
        min: 4.0,
        max: 6.0,
      },
      surface_resistance: {
        min: 1e6,
        max: 1e9,
      },
      grounding_resistance: {
        min: 0,
        max: 1.0,
      },
      ionizer: {
        decayTime: 5.0,
        balance: 35,
      },
    };
  }

  private saveToStorage(limits: MeasurementLimits): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limits));
    } catch (error) {
      console.error('Error saving limits to storage:', error);
    }
  }

  async updateLimits(type: MeasurementType, limits: any): Promise<void> {
    this._limits.update(current => {
      const updated = { ...current, [type]: limits };
      this.saveToStorage(updated);
      return updated;
    });

    // Sync to Firebase
    if (this.firebaseService.isFirebaseAvailable()) {
      try {
        await this.firebaseService.saveDocument(this.COLLECTION_NAME, this.DOCUMENT_ID, this._limits());
        console.log('Limits synced to Firebase');
      } catch (error) {
        console.error('Firebase limits sync error:', error);
      }
    }
  }

  getLimitsForType(type: MeasurementType): any {
    return this._limits()[type];
  }
}
