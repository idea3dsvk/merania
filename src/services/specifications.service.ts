import { Injectable, signal, inject } from '@angular/core';
import { ISOSpecification, MeasurementType } from '../models';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class SpecificationsService {
  private firebaseService = inject(FirebaseService);
  private readonly STORAGE_KEY = 'iso-specifications';
  private readonly COLLECTION_NAME = 'specifications';
  
  private _specifications = signal<ISOSpecification[]>(this.loadFromStorage());
  
  public readonly specifications = this._specifications.asReadonly();

  constructor() {
    this.initializeFirebaseSync();
  }

  private async initializeFirebaseSync(): Promise<void> {
    if (!this.firebaseService.isFirebaseAvailable()) {
      console.log('Firebase not available for specifications, using localStorage only');
      return;
    }

    try {
      // Load specifications from Firebase
      const firebaseData = await this.firebaseService.getCollection(this.COLLECTION_NAME);
      if (firebaseData.length > 0) {
        console.log('Loaded specifications from Firebase:', firebaseData.length);
        this._specifications.set(firebaseData as ISOSpecification[]);
        this.saveToStorage(firebaseData as ISOSpecification[]);
      } else {
        // Sync default specifications to Firebase
        const defaults = this.loadFromStorage();
        for (const spec of defaults) {
          await this.firebaseService.saveDocument(this.COLLECTION_NAME, spec.measurementType, spec);
        }
        console.log('Synced default specifications to Firebase');
      }
    } catch (error) {
      console.error('Firebase specifications initialization error:', error);
    }
  }

  private loadFromStorage(): ISOSpecification[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading specifications from storage:', error);
    }
    
    // Default specifications
    return [
      {
        measurementType: 'temperature_humidity',
        isoStandard: 'ISO 9001',
        standardTitle: 'Quality Management Systems',
        description: 'Temperature and humidity control requirements for quality management',
        requirements: 'Temperature: 15-30°C, Humidity: 30-70%',
        testingProcedure: 'Continuous monitoring with calibrated sensors',
        lastUpdated: new Date().toISOString(),
      },
      {
        measurementType: 'dustiness_iso6',
        isoStandard: 'ISO 14644-1',
        standardTitle: 'Cleanrooms - Classification of Air Cleanliness',
        description: 'ISO Class 6 cleanroom particle concentration limits',
        requirements: '0.5µm particles: max 10,200 per m³, 5µm particles: max 2,930 per m³',
        testingProcedure: 'Particle counter measurements at designated locations',
        referenceDocument: 'ISO 14644-1:2015',
        lastUpdated: new Date().toISOString(),
      },
      {
        measurementType: 'dustiness_iso5',
        isoStandard: 'ISO 14644-1',
        standardTitle: 'Cleanrooms - Classification of Air Cleanliness',
        description: 'ISO Class 5 cleanroom particle concentration limits',
        requirements: '0.5µm particles: max 3,520 per m³, 5µm particles: max 293 per m³',
        testingProcedure: 'Particle counter measurements at designated locations',
        referenceDocument: 'ISO 14644-1:2015',
        lastUpdated: new Date().toISOString(),
      },
      {
        measurementType: 'luminosity',
        isoStandard: 'ISO 8995',
        standardTitle: 'Lighting of Indoor Work Places',
        description: 'Minimum illuminance requirements for workplaces',
        requirements: 'Assembly work: 500-1000 lux',
        testingProcedure: 'Lux meter measurements at work surface level',
        lastUpdated: new Date().toISOString(),
      },
      {
        measurementType: 'surface_resistance',
        isoStandard: 'IEC 61340-5-1',
        standardTitle: 'Protection of Electronic Devices - ESD',
        description: 'Surface resistance requirements for ESD control',
        requirements: 'Surface resistance: 1×10⁶ to 1×10⁹ Ω',
        testingProcedure: 'Two-point probe method or concentric ring method',
        lastUpdated: new Date().toISOString(),
      },
      {
        measurementType: 'grounding_resistance',
        isoStandard: 'IEC 61340-5-1',
        standardTitle: 'Protection of Electronic Devices - ESD',
        description: 'Grounding resistance requirements',
        requirements: 'Grounding resistance: < 1.0 Ω',
        testingProcedure: 'Continuity test from ground point to equipment',
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private saveToStorage(specs: ISOSpecification[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(specs));
    } catch (error) {
      console.error('Error saving specifications to storage:', error);
    }
  }

  getSpecificationForType(type: MeasurementType): ISOSpecification | undefined {
    return this._specifications().find(spec => spec.measurementType === type);
  }

  async addSpecification(spec: Omit<ISOSpecification, 'lastUpdated'>): Promise<void> {
    const newSpec: ISOSpecification = {
      ...spec,
      lastUpdated: new Date().toISOString(),
    };
    
    this._specifications.update(current => {
      const updated = [...current, newSpec];
      this.saveToStorage(updated);
      return updated;
    });

    // Sync to Firebase
    if (this.firebaseService.isFirebaseAvailable()) {
      try {
        await this.firebaseService.saveDocument(this.COLLECTION_NAME, newSpec.measurementType, newSpec);
        console.log('Specification synced to Firebase:', newSpec.measurementType);
      } catch (error) {
        console.error('Firebase specification sync error:', error);
      }
    }
  }

  async updateSpecification(measurementType: MeasurementType, spec: Omit<ISOSpecification, 'lastUpdated'>): Promise<void> {
    const updatedSpec: ISOSpecification = {
      ...spec,
      lastUpdated: new Date().toISOString(),
    };

    this._specifications.update(current => {
      const index = current.findIndex(s => s.measurementType === measurementType);
      if (index === -1) {
        const updated = [...current, updatedSpec];
        this.saveToStorage(updated);
        return updated;
      }
      
      const updated = [...current];
      updated[index] = updatedSpec;
      this.saveToStorage(updated);
      return updated;
    });

    // Sync to Firebase
    if (this.firebaseService.isFirebaseAvailable()) {
      try {
        await this.firebaseService.saveDocument(this.COLLECTION_NAME, measurementType, updatedSpec);
        console.log('Specification updated in Firebase:', measurementType);
      } catch (error) {
        console.error('Firebase specification update error:', error);
      }
    }
  }

  async deleteSpecification(measurementType: MeasurementType): Promise<void> {
    this._specifications.update(current => {
      const updated = current.filter(spec => spec.measurementType !== measurementType);
      this.saveToStorage(updated);
      return updated;
    });

    // Sync to Firebase
    if (this.firebaseService.isFirebaseAvailable()) {
      try {
        await this.firebaseService.deleteDocument(this.COLLECTION_NAME, measurementType);
        console.log('Specification deleted from Firebase:', measurementType);
      } catch (error) {
        console.error('Firebase specification delete error:', error);
      }
    }
  }
}
