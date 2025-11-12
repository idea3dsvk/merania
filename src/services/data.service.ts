import { Injectable, signal, inject } from '@angular/core';
import { Measurement } from '../models';
import { TranslationService } from './translation.service';
import { ToastService } from './toast.service';
import { ErrorHandlerService } from './error-handler.service';
import { FirebaseService } from './firebase.service';

// These declare statements are to inform TypeScript about global variables
// loaded from CDNs in index.html
declare var jspdf: any;
declare var autoTable: any;

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private translationService = inject(TranslationService);
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandlerService);
  private firebaseService = inject(FirebaseService);
  private readonly STORAGE_KEY = 'workplace-measurements';
  private readonly COLLECTION_NAME = 'measurements';
  
  // This is a mock database. In a real application, you would replace this
  // with calls to a backend service like Firebase Firestore.
  private _measurements = signal<Measurement[]>(this.loadFromStorage());

  public readonly measurements = this._measurements.asReadonly();

  constructor() {
    // Save to localStorage whenever measurements change
    this.setupAutoSave();
    // Initialize Firebase sync
    this.initializeFirebaseSync();
  }

  private async initializeFirebaseSync(): Promise<void> {
    if (!this.firebaseService.isFirebaseAvailable()) {
      console.log('Firebase not available, using localStorage only');
      return;
    }

    try {
      // Load data from Firebase on initialization
      const firebaseData = await this.firebaseService.getCollection(this.COLLECTION_NAME);
      if (firebaseData.length > 0) {
        console.log('Loaded measurements from Firebase:', firebaseData.length);
        this._measurements.set(firebaseData as Measurement[]);
        this.saveToStorage(firebaseData as Measurement[]);
      }

      // Subscribe to real-time updates
      this.firebaseService.subscribeToCollection(
        this.COLLECTION_NAME,
        (data) => {
          console.log('Firebase real-time update:', data.length);
          this._measurements.set(data as Measurement[]);
          this.saveToStorage(data as Measurement[]);
        }
      );
    } catch (error) {
      console.error('Firebase initialization error:', error);
      this.errorHandler.handleError(error as Error);
    }
  }

  private loadFromStorage(): Measurement[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error);
    }
    
    // Return initial mock data if nothing in storage
    return [
      { id: 'temp1', type: 'temperature_humidity', date: new Date(Date.now() - 86400000 * 5).toISOString(), location: 'Assembly Line 1', temperature: 22.5, humidity: 45.5, limits: { temperatureMin: 15, temperatureMax: 30, humidityMin: 30, humidityMax: 70 } },
      { id: 'lum1', type: 'luminosity', date: new Date(Date.now() - 86400000 * 4).toISOString(), location: 'Assembly Line 1', luminosity: 550, limits: { min: 500, max: 1000 } },
      { id: 'dust1', type: 'dustiness_iso6', date: new Date(Date.now() - 86400000 * 3).toISOString(), location: 'Assembly Line 1', particles_0_5um: 8500, particles_5um: 2100, limits: { particles_0_5um_min: 0, particles_0_5um_max: 10200, particles_5um_min: 0, particles_5um_max: 2930 } },
      { id: 'tor1', type: 'torque', date: new Date(Date.now() - 86400000 * 2).toISOString(), location: 'Station 3', screwdriverId: 'SD-007', torqueValue: 5.1, limits: { min: 4.0, max: 6.0 } },
      { id: 'sres1', type: 'surface_resistance', date: new Date(Date.now() - 86400000 * 1).toISOString(), location: 'ESD Bench 2', material: 'Mat-A', resistance: 1e8, limits: { min: 1e6, max: 1e9 } },
      { id: 'gres1', type: 'grounding_resistance', date: new Date(Date.now() - 86400000 * 0.5).toISOString(), location: 'Main Grounding Point', pointId: 'GP-01', resistance: 0.8, limits: { min: 0, max: 1.0 } },
      { id: 'ion1', type: 'ionizer', date: new Date().toISOString(), location: 'Clean Room A', ionizerId: 'ION-03', decayTimePositive: 4.5, decayTimeNegative: 4.8, balance: 15, limits: { decayTime: 5.0, balance: 35 } },
    ];
  }

  private saveToStorage(measurements: Measurement[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(measurements));
    } catch (error) {
      this.errorHandler.handleError(error as Error);
    }
  }

  private setupAutoSave(): void {
    // Use effect to auto-save whenever measurements change
    // Note: In Angular, we can't use effect outside injection context,
    // so we'll save manually in each mutation method
  }

  async addMeasurement(measurement: Omit<Measurement, 'id'>) {
    const newMeasurement = { ...measurement, id: crypto.randomUUID() } as Measurement;
    
    this._measurements.update(m => {
      const updated = [...m, newMeasurement].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.saveToStorage(updated);
      return updated;
    });

    // Sync to Firebase
    if (this.firebaseService.isFirebaseAvailable()) {
      try {
        await this.firebaseService.saveDocument(this.COLLECTION_NAME, newMeasurement.id, newMeasurement);
        console.log('Measurement synced to Firebase:', newMeasurement.id);
      } catch (error) {
        console.error('Firebase sync error:', error);
        this.errorHandler.handleError(error as Error);
      }
    }

    console.log('Added new measurement:', newMeasurement);
    this.toastService.success(this.translationService.translate('toast.measurementAdded'));
  }

  async updateMeasurement(id: string, measurement: Omit<Measurement, 'id'>): Promise<void> {
    const updatedMeasurement = { ...measurement, id } as Measurement;
    
    this._measurements.update(m => {
      const updated = m.map(item => 
        item.id === id ? updatedMeasurement : item
      ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.saveToStorage(updated);
      return updated;
    });

    // Sync to Firebase
    if (this.firebaseService.isFirebaseAvailable()) {
      try {
        await this.firebaseService.saveDocument(this.COLLECTION_NAME, id, updatedMeasurement);
        console.log('Measurement updated in Firebase:', id);
      } catch (error) {
        console.error('Firebase sync error:', error);
        this.errorHandler.handleError(error as Error);
      }
    }

    this.toastService.success(this.translationService.translate('toast.measurementUpdated'));
  }

  async deleteMeasurement(id: string): Promise<void> {
    this._measurements.update(m => {
      const updated = m.filter(measurement => measurement.id !== id);
      this.saveToStorage(updated);
      return updated;
    });

    // Sync to Firebase
    if (this.firebaseService.isFirebaseAvailable()) {
      try {
        await this.firebaseService.deleteDocument(this.COLLECTION_NAME, id);
        console.log('Measurement deleted from Firebase:', id);
      } catch (error) {
        console.error('Firebase delete error:', error);
        this.errorHandler.handleError(error as Error);
      }
    }

    this.toastService.success(this.translationService.translate('toast.measurementDeleted'));
  }

  clearAllMeasurements(): void {
    this._measurements.update(() => {
      this.saveToStorage([]);
      return [];
    });
    this.toastService.warning(this.translationService.translate('toast.allCleared'));
  }

  exportToCSV(data: Measurement[]) {
    if (data.length === 0) {
        this.toastService.warning(this.translationService.translate('alerts.noDataToExport'));
        return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify((row as any)[header])).join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `measurements_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.toastService.success(this.translationService.translate('toast.exportedCSV'));
  }

  exportToPDF(data: Measurement[]) {
    if (data.length === 0) {
        this.toastService.warning(this.translationService.translate('alerts.noDataToExport'));
        return;
    }
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    doc.text(this.translationService.translate('pdf.reportTitle'), 14, 16);

    const t = (key: string) => this.translationService.translate(key);

    const tableData = data.map(m => {
        const base = [
            m.id.substring(0, 4),
            new Date(m.date).toLocaleString(),
            t(`measurementNames.${m.type}`),
            m.location
        ];
        switch (m.type) {
            case 'temperature_humidity': return [...base, `${t('pdf.detailsPrefix.temp')}: ${m.temperature}°C (${m.limits.temperatureMin}-${m.limits.temperatureMax}), ${t('pdf.detailsPrefix.hum')}: ${m.humidity}% (${m.limits.humidityMin}-${m.limits.humidityMax})`];
            case 'luminosity': return [...base, `${t('pdf.detailsPrefix.lum')}: ${m.luminosity}lx (${m.limits.min}-${m.limits.max})`];
            case 'dustiness_iso6': return [...base, `0.5µm: ${m.particles_0_5um} (${m.limits.particles_0_5um_min}-${m.limits.particles_0_5um_max}), 5µm: ${m.particles_5um} (${m.limits.particles_5um_min}-${m.limits.particles_5um_max})`];
            case 'dustiness_iso5': return [...base, `0.5µm: ${m.particles_0_5um} (${m.limits.particles_0_5um_min}-${m.limits.particles_0_5um_max}), 5µm: ${m.particles_5um} (${m.limits.particles_5um_min}-${m.limits.particles_5um_max})`];
            case 'torque': return [...base, `${t('pdf.detailsPrefix.id')}: ${m.screwdriverId}, ${t('pdf.detailsPrefix.val')}: ${m.torqueValue}Nm (${m.limits.min}-${m.limits.max})`];
            case 'surface_resistance': return [...base, `${t('pdf.detailsPrefix.mat')}: ${m.material}, ${t('pdf.detailsPrefix.r')}: ${m.resistance}Ω (${m.limits.min}-${m.limits.max})`];
            case 'grounding_resistance': return [...base, `${t('pdf.detailsPrefix.point')}: ${m.pointId}, ${t('pdf.detailsPrefix.r')}: ${m.resistance}Ω (${m.limits.min}-${m.limits.max})`];
            case 'ionizer': return [...base, `${t('pdf.detailsPrefix.id')}: ${m.ionizerId}, ${t('pdf.detailsPrefix.bal')}: ${m.balance}V, ${t('pdf.detailsPrefix.dPositive')}: ${m.decayTimePositive}s, ${t('pdf.detailsPrefix.dNegative')}: ${m.decayTimeNegative}s`];
            default: return base;
        }
    });

    autoTable(doc, {
        head: [[t('pdf.headers.id'), t('pdf.headers.date'), t('pdf.headers.type'), t('pdf.headers.location'), t('pdf.headers.details')]],
        body: tableData,
        startY: 22
    });

    doc.save(`measurements_report_${new Date().toISOString().slice(0,10)}.pdf`);
    this.toastService.success(this.translationService.translate('toast.exportedPDF'));
  }
}