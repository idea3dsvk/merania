import { Injectable, signal } from '@angular/core';
import { ISOSpecification, MeasurementType } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SpecificationsService {
  private readonly STORAGE_KEY = 'iso-specifications';
  
  private _specifications = signal<ISOSpecification[]>(this.loadFromStorage());
  
  public readonly specifications = this._specifications.asReadonly();

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

  addSpecification(spec: Omit<ISOSpecification, 'lastUpdated'>): void {
    this._specifications.update(current => {
      const newSpec: ISOSpecification = {
        ...spec,
        lastUpdated: new Date().toISOString(),
      };
      const updated = [...current, newSpec];
      this.saveToStorage(updated);
      return updated;
    });
  }

  updateSpecification(measurementType: MeasurementType, spec: Omit<ISOSpecification, 'lastUpdated'>): void {
    this._specifications.update(current => {
      const index = current.findIndex(s => s.measurementType === measurementType);
      if (index === -1) {
        // Add new if not found
        const newSpec: ISOSpecification = {
          ...spec,
          lastUpdated: new Date().toISOString(),
        };
        const updated = [...current, newSpec];
        this.saveToStorage(updated);
        return updated;
      }
      
      const updated = [...current];
      updated[index] = {
        ...spec,
        lastUpdated: new Date().toISOString(),
      };
      this.saveToStorage(updated);
      return updated;
    });
  }

  deleteSpecification(measurementType: MeasurementType): void {
    this._specifications.update(current => {
      const updated = current.filter(spec => spec.measurementType !== measurementType);
      this.saveToStorage(updated);
      return updated;
    });
  }
}
