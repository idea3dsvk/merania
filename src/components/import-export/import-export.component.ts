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
    this.importStatus.set('Import feature coming soon! Currently only export is available.');
    setTimeout(() => {
      this.fileSelected.set(false);
      this.selectedFile.set(null);
      this.importStatus.set('');
    }, 3000);
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
