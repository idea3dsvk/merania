import { Injectable, signal, inject } from '@angular/core';
import { MeasurementType, isDustinessMeasurementType } from '../models';
import { FirebaseService } from './firebase.service';

export interface MeasurementLimits {
  [type: string]: any;
  temperature_humidity?: {
    temperatureMin: number;
    temperatureMax: number;
    temperatureLclEwi?: number;
    temperatureUclEwi?: number;
    humidityMin: number;
    humidityMax: number;
    humidityLclEwi?: number;
    humidityUclEwi?: number;
  };
  luminosity?: {
    min: number;
    max: number;
    lclEwi?: number;
    uclEwi?: number;
  };
  dustiness_iso6?: {
    particles_0_5um_min: number;
    particles_0_5um_max: number;
    particles_0_5um_lcl_ewi?: number;
    particles_0_5um_ucl_ewi?: number;
    particles_5um_min: number;
    particles_5um_max: number;
    particles_5um_lcl_ewi?: number;
    particles_5um_ucl_ewi?: number;
  };
  dustiness_iso5?: {
    particles_0_5um_min: number;
    particles_0_5um_max: number;
    particles_0_5um_lcl_ewi?: number;
    particles_0_5um_ucl_ewi?: number;
    particles_5um_min: number;
    particles_5um_max: number;
    particles_5um_lcl_ewi?: number;
    particles_5um_ucl_ewi?: number;
  };
  dustiness_iso8?: {
    particles_0_5um_min: number;
    particles_0_5um_max: number;
    particles_0_5um_lcl_ewi?: number;
    particles_0_5um_ucl_ewi?: number;
    particles_5um_min: number;
    particles_5um_max: number;
    particles_5um_lcl_ewi?: number;
    particles_5um_ucl_ewi?: number;
  };
  torque?: {
    min: number;
    max: number;
    lclEwi?: number;
    uclEwi?: number;
  };
  surface_resistance?: {
    min: number;
    max: number;
    lclEwi?: number;
    uclEwi?: number;
  };
  grounding_resistance?: {
    min: number;
    max: number;
    lclEwi?: number;
    uclEwi?: number;
  };
  ionizer?: {
    decayTime: number;
    balance: number;
    decayTimeLclEwi?: number;
    decayTimeUclEwi?: number;
    balanceLclEwi?: number;
    balanceUclEwi?: number;
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
        const migrated = this.migrateLimits(firebaseData as MeasurementLimits);
        this._limits.set(migrated);
        this.saveToStorage(migrated);
      }
    } catch (error) {
      console.error('Firebase limits initialization error:', error);
    }
  }

  private loadFromStorage(): MeasurementLimits {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return this.migrateLimits(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading limits from storage:', error);
    }
    
    // Default limits
    return {
      temperature_humidity: {
        temperatureMin: 15,
        temperatureMax: 30,
        temperatureLclEwi: 18,
        temperatureUclEwi: 27,
        humidityMin: 30,
        humidityMax: 70,
        humidityLclEwi: 38,
        humidityUclEwi: 62,
      },
      luminosity: {
        min: 500,
        max: 1000,
        lclEwi: 600,
        uclEwi: 900,
      },
      dustiness_iso6: {
        particles_0_5um_min: 0,
        particles_0_5um_max: 10200,
        particles_0_5um_lcl_ewi: 2040,
        particles_0_5um_ucl_ewi: 8160,
        particles_5um_min: 0,
        particles_5um_max: 2930,
        particles_5um_lcl_ewi: 586,
        particles_5um_ucl_ewi: 2344,
      },
      dustiness_iso5: {
        particles_0_5um_min: 0,
        particles_0_5um_max: 3520,
        particles_0_5um_lcl_ewi: 704,
        particles_0_5um_ucl_ewi: 2816,
        particles_5um_min: 0,
        particles_5um_max: 293,
        particles_5um_lcl_ewi: 58.6,
        particles_5um_ucl_ewi: 234.4,
      },
      dustiness_iso8: {
        particles_0_5um_min: 0,
        particles_0_5um_max: 3520000,
        particles_0_5um_lcl_ewi: 704000,
        particles_0_5um_ucl_ewi: 2816000,
        particles_5um_min: 0,
        particles_5um_max: 29300,
        particles_5um_lcl_ewi: 5860,
        particles_5um_ucl_ewi: 23440,
      },
      torque: {
        min: 4.0,
        max: 6.0,
        lclEwi: 4.4,
        uclEwi: 5.6,
      },
      surface_resistance: {
        min: 1e6,
        max: 1e9,
        lclEwi: 200800000,
        uclEwi: 800200000,
      },
      grounding_resistance: {
        min: 0,
        max: 1.0,
        lclEwi: 0.2,
        uclEwi: 0.8,
      },
      ionizer: {
        decayTime: 5.0,
        decayTimeLclEwi: 1,
        decayTimeUclEwi: 4,
        balance: 35,
        balanceLclEwi: -21,
        balanceUclEwi: 21,
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
    const normalizedLimits = this.withEwiDefaults(type, limits);

    this._limits.update(current => {
      const updated = { ...current, [type]: normalizedLimits };
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
    const existing = this._limits()[type];
    if (existing) {
      const normalized = this.withEwiDefaults(type, existing);
      if (normalized !== existing) {
        this._limits.update(current => {
          const updated = { ...current, [type]: normalized };
          this.saveToStorage(updated);
          return updated;
        });
      }
      return normalized;
    }

    const defaults = this.withEwiDefaults(type, this.getDefaultLimitsForType(type));
    this._limits.update(current => {
      const updated = { ...current, [type]: defaults };
      this.saveToStorage(updated);
      return updated;
    });
    return defaults;
  }

  private getDefaultLimitsForType(type: MeasurementType): any {
    if (isDustinessMeasurementType(type)) {
      const isoClass = Number.parseInt(type.replace('dustiness_iso', ''), 10);
      if (isoClass === 5) {
        return {
          particles_0_5um_min: 0,
          particles_0_5um_max: 3520,
          particles_0_5um_lcl_ewi: 704,
          particles_0_5um_ucl_ewi: 2816,
          particles_5um_min: 0,
          particles_5um_max: 293,
          particles_5um_lcl_ewi: 58.6,
          particles_5um_ucl_ewi: 234.4,
        };
      }
      if (isoClass === 8) {
        return {
          particles_0_5um_min: 0,
          particles_0_5um_max: 3520000,
          particles_0_5um_lcl_ewi: 704000,
          particles_0_5um_ucl_ewi: 2816000,
          particles_5um_min: 0,
          particles_5um_max: 29300,
          particles_5um_lcl_ewi: 5860,
          particles_5um_ucl_ewi: 23440,
        };
      }
      return {
        particles_0_5um_min: 0,
        particles_0_5um_max: 10200,
        particles_0_5um_lcl_ewi: 2040,
        particles_0_5um_ucl_ewi: 8160,
        particles_5um_min: 0,
        particles_5um_max: 2930,
        particles_5um_lcl_ewi: 586,
        particles_5um_ucl_ewi: 2344,
      };
    }

    switch (type) {
      case 'temperature_humidity':
        return {
          temperatureMin: 15,
          temperatureMax: 30,
          temperatureLclEwi: 18,
          temperatureUclEwi: 27,
          humidityMin: 30,
          humidityMax: 70,
          humidityLclEwi: 38,
          humidityUclEwi: 62,
        };
      case 'luminosity':
        return { min: 500, max: 1000, lclEwi: 600, uclEwi: 900 };
      case 'torque':
        return { min: 4.0, max: 6.0, lclEwi: 4.4, uclEwi: 5.6 };
      case 'surface_resistance':
        return { min: 1e6, max: 1e9, lclEwi: 200800000, uclEwi: 800200000 };
      case 'grounding_resistance':
        return { min: 0, max: 1.0, lclEwi: 0.2, uclEwi: 0.8 };
      case 'ionizer':
        return {
          decayTime: 5.0,
          decayTimeLclEwi: 1,
          decayTimeUclEwi: 4,
          balance: 35,
          balanceLclEwi: -21,
          balanceUclEwi: 21,
        };
      default:
        return { min: 0, max: 100, lclEwi: 20, uclEwi: 80 };
    }
  }

  private migrateLimits(limits: MeasurementLimits): MeasurementLimits {
    const migrated = { ...limits };
    let changed = false;

    Object.keys(migrated).forEach(rawType => {
      const type = rawType as MeasurementType;
      const current = migrated[rawType];
      if (!current || typeof current !== 'object') {
        return;
      }

      const normalized = this.withEwiDefaults(type, current);
      if (normalized !== current) {
        migrated[rawType] = normalized;
        changed = true;
      }
    });

    if (changed) {
      this.saveToStorage(migrated);
    }

    return migrated;
  }

  private withEwiDefaults(type: MeasurementType, limits: any): any {
    if (!limits || typeof limits !== 'object') {
      return limits;
    }

    const next = { ...limits };
    let changed = false;

    const setIfMissing = (key: string, value: number) => {
      if (!this.isFiniteNumber(next[key])) {
        next[key] = value;
        changed = true;
      }
    };

    if (type === 'temperature_humidity' || (this.isFiniteNumber(next.temperatureMin) && this.isFiniteNumber(next.temperatureMax))) {
      const temp = this.resolveEwiPair(next.temperatureMin, next.temperatureMax, next.temperatureLclEwi, next.temperatureUclEwi);
      const hum = this.resolveEwiPair(next.humidityMin, next.humidityMax, next.humidityLclEwi, next.humidityUclEwi);
      setIfMissing('temperatureLclEwi', temp.lcl);
      setIfMissing('temperatureUclEwi', temp.ucl);
      setIfMissing('humidityLclEwi', hum.lcl);
      setIfMissing('humidityUclEwi', hum.ucl);
    }

    if (isDustinessMeasurementType(type) || this.isFiniteNumber(next.particles_0_5um_min)) {
      const p05 = this.resolveEwiPair(
        next.particles_0_5um_min,
        next.particles_0_5um_max,
        next.particles_0_5um_lcl_ewi,
        next.particles_0_5um_ucl_ewi
      );
      const p5 = this.resolveEwiPair(
        next.particles_5um_min,
        next.particles_5um_max,
        next.particles_5um_lcl_ewi,
        next.particles_5um_ucl_ewi
      );
      setIfMissing('particles_0_5um_lcl_ewi', p05.lcl);
      setIfMissing('particles_0_5um_ucl_ewi', p05.ucl);
      setIfMissing('particles_5um_lcl_ewi', p5.lcl);
      setIfMissing('particles_5um_ucl_ewi', p5.ucl);
    }

    if (type === 'ionizer' || (this.isFiniteNumber(next.decayTime) && this.isFiniteNumber(next.balance))) {
      const decay = this.resolveEwiPair(next.decayTimeMin ?? 0, next.decayTime, next.decayTimeLclEwi, next.decayTimeUclEwi);
      const balanceAbs = Math.abs(next.balance ?? 0);
      const balance = this.resolveEwiPair(-balanceAbs, balanceAbs, next.balanceLclEwi, next.balanceUclEwi);
      setIfMissing('decayTimeLclEwi', decay.lcl);
      setIfMissing('decayTimeUclEwi', decay.ucl);
      setIfMissing('balanceLclEwi', balance.lcl);
      setIfMissing('balanceUclEwi', balance.ucl);
    }

    if (this.isFiniteNumber(next.min) && this.isFiniteNumber(next.max)) {
      const generic = this.resolveEwiPair(next.min, next.max, next.lclEwi, next.uclEwi);
      setIfMissing('lclEwi', generic.lcl);
      setIfMissing('uclEwi', generic.ucl);
    }

    return changed ? next : limits;
  }

  private resolveEwiPair(min: number, max: number, explicitLcl?: number, explicitUcl?: number): { lcl: number; ucl: number } {
    const lower = this.isFiniteNumber(min) ? min : 0;
    const upper = this.isFiniteNumber(max) ? max : lower;

    if (this.isFiniteNumber(explicitLcl) && this.isFiniteNumber(explicitUcl)) {
      return { lcl: explicitLcl, ucl: explicitUcl };
    }

    const span = upper - lower;
    const warningOffset = span > 0 ? span * 0.2 : 0;
    return {
      lcl: lower + warningOffset,
      ucl: upper - warningOffset,
    };
  }

  private isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
  }
}
