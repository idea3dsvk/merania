import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Measurement, TemperatureHumidityMeasurement, LuminosityMeasurement, TorqueMeasurement, SurfaceResistanceMeasurement, GroundingResistanceMeasurement, IonizerMeasurement } from '../../models';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe],
})
export class ImportExportComponent {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  translationService = inject(TranslationService);

  // State
  importing = signal(false);
  exporting = signal(false);
  importProgress = signal(0);
  importTotal = signal(0);
  importStatus = signal<string>('');
  fileSelected = signal(false);
  selectedFile = signal<File | null>(null);

  // Computed
  canImport = computed(() => 
    this.authService.currentUser()?.role === 'admin' && 
    this.fileSelected() && 
    !this.importing()
  );
  
  isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.fileSelected.set(true);
      this.importStatus.set(`File selected: ${file.name}`);
    }
  }

  async importData(): Promise<void> {
    const file = this.selectedFile();
    if (!file || !this.isAdmin()) return;

    this.importing.set(true);
    this.importStatus.set('Processing file...');
    this.importProgress.set(0);

    try {
      const fileExtension = file.name.toLowerCase().split('.').pop();
      
      if (fileExtension === 'json') {
        await this.importJSON(file);
      } else if (fileExtension === 'csv') {
        this.importStatus.set('CSV import coming soon! Please use JSON format.');
        setTimeout(() => {
          this.fileSelected.set(false);
          this.selectedFile.set(null);
          this.importStatus.set('');
          this.importing.set(false);
        }, 3000);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        this.importStatus.set('Excel import coming soon! Please use JSON format.');
        setTimeout(() => {
          this.fileSelected.set(false);
          this.selectedFile.set(null);
          this.importStatus.set('');
          this.importing.set(false);
        }, 3000);
      } else {
        throw new Error('Unsupported file format. Please use JSON format.');
      }
    } catch (error) {
      console.error('Import error:', error);
      this.importStatus.set('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setTimeout(() => {
        this.fileSelected.set(false);
        this.selectedFile.set(null);
        this.importStatus.set('');
        this.importing.set(false);
      }, 5000);
    }
  }

  private async importJSON(file: File): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate JSON structure
      if (!data.measurements || !Array.isArray(data.measurements)) {
        throw new Error('Invalid JSON format. Expected { measurements: [...] }');
      }

      const measurements = data.measurements as Measurement[];
      this.importTotal.set(measurements.length);

      if (measurements.length === 0) {
        throw new Error('No measurements found in file');
      }

      // Validate each measurement has required fields
      for (let i = 0; i < measurements.length; i++) {
        const m = measurements[i];
        if (!m.type || !m.date || !m.location) {
          throw new Error(`Invalid measurement at index ${i}: missing required fields (type, date, location)`);
        }
      }

      this.importStatus.set(`Importing ${measurements.length} measurements...`);

      // Import in batches of 50
      const batchSize = 50;
      let imported = 0;

      for (let i = 0; i < measurements.length; i += batchSize) {
        const batch = measurements.slice(i, i + batchSize);
        
        // Add each measurement
        for (const measurement of batch) {
          await this.dataService.addMeasurement(measurement);
          imported++;
          this.importProgress.set(imported);
        }

        // Update progress
        this.importStatus.set(`Imported ${imported} of ${measurements.length} measurements...`);
      }

      // Success
      this.importStatus.set(`✓ Successfully imported ${imported} measurements!`);
      setTimeout(() => {
        this.fileSelected.set(false);
        this.selectedFile.set(null);
        this.importStatus.set('');
        this.importing.set(false);
        this.importProgress.set(0);
        this.importTotal.set(0);
      }, 3000);

    } catch (error) {
      throw error;
    }
  }

  private getMeasurementValue(m: Measurement, field: string): string {
    switch (m.type) {
      case 'temperature_humidity':
        if (field === 'temperature') return (m as TemperatureHumidityMeasurement).temperature.toString();
        if (field === 'humidity') return (m as TemperatureHumidityMeasurement).humidity.toString();
        break;
      case 'luminosity':
        if (field === 'luminosity') return (m as LuminosityMeasurement).luminosity.toString();
        break;
      case 'torque':
        if (field === 'torqueValue') return (m as TorqueMeasurement).torqueValue.toString();
        break;
      case 'surface_resistance':
        if (field === 'resistance') return (m as SurfaceResistanceMeasurement).resistance.toString();
        break;
      case 'grounding_resistance':
        if (field === 'resistance') return (m as GroundingResistanceMeasurement).resistance.toString();
        break;
      case 'ionizer':
        const ionizer = m as IonizerMeasurement;
        if (field === 'decayPositive') return ionizer.decayTimePositive.toString();
        if (field === 'decayNegative') return ionizer.decayTimeNegative.toString();
        if (field === 'balance') return ionizer.balance.toString();
        break;
    }
    return '';
  }

  async exportDatabase(): Promise<void> {
    if (!this.isAdmin()) return;

    this.exporting.set(true);

    try {
      // Get all data
      const measurements = this.dataService.measurements();

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Measurements sheet
      const measurementsData = measurements.map(m => ({
        Date: new Date(m.date).toLocaleString(),
        Type: m.type,
        Location: m.location,
        DeviceID: m.deviceId || '',
        Temperature: this.getMeasurementValue(m, 'temperature'),
        Humidity: this.getMeasurementValue(m, 'humidity'),
        Luminosity: this.getMeasurementValue(m, 'luminosity'),
        TorqueValue: this.getMeasurementValue(m, 'torqueValue'),
        Resistance: this.getMeasurementValue(m, 'resistance'),
        DecayPositive: this.getMeasurementValue(m, 'decayPositive'),
        DecayNegative: this.getMeasurementValue(m, 'decayNegative'),
        Balance: this.getMeasurementValue(m, 'balance'),
        Notes: m.notes || '',
      }));
      const measurementsSheet = XLSX.utils.json_to_sheet(measurementsData);
      XLSX.utils.book_append_sheet(workbook, measurementsSheet, 'Measurements');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filename = `workplace-monitor-backup-${timestamp}.xlsx`;

      // Download
      XLSX.writeFile(workbook, filename);

      setTimeout(() => {
        this.exporting.set(false);
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      this.exporting.set(false);
    }
  }

  async exportCSV(): Promise<void> {
    if (!this.isAdmin()) return;

    this.exporting.set(true);

    try {
      const measurements = this.dataService.measurements();
      
      // Create CSV header
      const headers = [
        'Date', 'Type', 'Location', 'DeviceID',
        'Temperature', 'Humidity', 'Luminosity', 'DustParticles',
        'TorqueValue', 'TorqueLimit', 'ResistanceRtt', 'ResistanceRtg',
        'BalanceValue', 'DecayPositive', 'DecayNegative', 'Notes'
      ];
      
      const rows = measurements.map(m => [
        new Date(m.date).toLocaleString(),
        m.type,
        m.location,
        m.deviceId || '',
        this.getMeasurementValue(m, 'temperature'),
        this.getMeasurementValue(m, 'humidity'),
        this.getMeasurementValue(m, 'luminosity'),
        this.getMeasurementValue(m, 'torqueValue'),
        this.getMeasurementValue(m, 'resistance'),
        this.getMeasurementValue(m, 'decayPositive'),
        this.getMeasurementValue(m, 'decayNegative'),
        this.getMeasurementValue(m, 'balance'),
        m.notes || '',
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      a.href = url;
      a.download = `measurements-${timestamp}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        this.exporting.set(false);
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      this.exporting.set(false);
    }
  }

  async exportJSON(): Promise<void> {
    if (!this.isAdmin()) return;

    this.exporting.set(true);

    try {
      const data = {
        measurements: this.dataService.measurements(),
        exportDate: new Date().toISOString(),
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      a.href = url;
      a.download = `database-backup-${timestamp}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        this.exporting.set(false);
      }, 1000);

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      this.exporting.set(false);
    }
  }
}
