import { Component, ChangeDetectionStrategy, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { MeasurementFormComponent } from '../measurement-form/measurement-form.component';
import { MeasurementCardComponent, SummaryData } from '../measurement-card/measurement-card.component';
import { LimitsDialogComponent } from '../limits-dialog/limits-dialog.component';
import { Measurement, MeasurementType, MEASUREMENT_TYPES, isDustinessMeasurement, isDustinessMeasurementType } from '../../models';
import { TranslationService } from '../../services/translation.service';
import { LimitsService } from '../../services/limits.service';
import { SpecificationsService } from '../../services/specifications.service';

interface ScannedQRData {
  location: string;
  type: MeasurementType;
  id: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MeasurementFormComponent, MeasurementCardComponent, LimitsDialogComponent],
})
export class DashboardComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private limitsService = inject(LimitsService);
  private specificationsService = inject(SpecificationsService);
  
  showAddModal = signal(false);
  selectedMeasurementType = signal<MeasurementType | null>(null);
  showLimitsDialog = signal(false);
  selectedLimitsType = signal<MeasurementType | null>(null);
  scannedLocation = signal<string | null>(null);
  
  // Computed: check if user can edit limits
  canEditLimits = computed(() => this.authService.canEditLimits());

  measurementTypes = computed<MeasurementType[]>(() => {
    const predefined = [...MEASUREMENT_TYPES] as MeasurementType[];
    const fromSpecs = this.specificationsService
      .specificationTypes()
      .filter(type => this.isSupportedMeasurementType(type)) as MeasurementType[];
    const fromMeasurements = this.dataService
      .measurements()
      .map(m => m.type)
      .filter(type => this.isSupportedMeasurementType(type));

    return Array.from(new Set([...predefined, ...fromSpecs, ...fromMeasurements]));
  });
  
  ngOnInit() {
    // Check for scanned QR data
    const scannedDataStr = localStorage.getItem('scannedQRData');
    if (scannedDataStr) {
      try {
        const scannedData: ScannedQRData = JSON.parse(scannedDataStr);
        // Clear the stored data
        localStorage.removeItem('scannedQRData');
        // Store location for form pre-fill
        this.scannedLocation.set(scannedData.location);
        // Open the measurement form
        this.openAddModal(scannedData.type);
      } catch (error) {
        console.error('Failed to parse scanned QR data:', error);
      }
    }
  }
  
  getMeasurementName(type: MeasurementType): string {
    const key = `measurementNames.${type}`;
    const translated = this.translationService.translate(key);
    if (translated !== key) {
      return translated;
    }

    return type
      .split('_')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Memoized computation - only recalculates when measurements, language, or limits change
  summaries = computed<SummaryData[]>(() => {
    const allMeasurements = this.dataService.measurements();
    const currentLang = this.translationService.currentLang();
    const currentLimits = this.limitsService.limits(); // Track limits changes
    
    // Group measurements by type for better performance
    const measurementsByType = new Map<MeasurementType, Measurement[]>();
    for (const measurement of allMeasurements) {
      if (!measurementsByType.has(measurement.type)) {
        measurementsByType.set(measurement.type, []);
      }
      measurementsByType.get(measurement.type)!.push(measurement);
    }
    
    return this.measurementTypes().map(type => {
      const typeMeasurements = measurementsByType.get(type) || [];
      const latest = typeMeasurements[0]; // Assuming sorted by date desc
      return {
        type: type,
        name: this.getMeasurementName(type),
        count: typeMeasurements.length,
        latestValue: this.getLatestValueString(latest),
        isOutOfSpec: this.checkOutOfSpec(latest),
      };
    });
  });

  modalTitle = computed(() => {
    const type = this.selectedMeasurementType();
    if (!type) return '';
    const measurementName = this.getMeasurementName(type);
    return this.translationService.translate('dashboard.newRecordTitle').replace('{{measurementName}}', measurementName);
  });

  openAddModal(type: MeasurementType) {
    this.selectedMeasurementType.set(type);
    this.showAddModal.set(true);
  }

  closeModal() {
    this.showAddModal.set(false);
    this.selectedMeasurementType.set(null);
    this.scannedLocation.set(null);
  }

  async handleFormSubmit(measurementData: Omit<Measurement, 'id'>) {
    await this.dataService.addMeasurement(measurementData);
    this.closeModal();
  }

  openLimitsDialog(type: MeasurementType) {
    // Check if user has permission to edit limits
    if (!this.authService.canEditLimits()) {
      return; // Prevent opening dialog if user is not admin
    }
    this.selectedLimitsType.set(type);
    this.showLimitsDialog.set(true);
  }

  closeLimitsDialog() {
    this.showLimitsDialog.set(false);
    this.selectedLimitsType.set(null);
  }

  private getLatestValueString(m: Measurement | undefined): string {
    if (!m) return this.translationService.translate('dashboard.noData');
    if (isDustinessMeasurement(m)) {
      return `0.5µm: ${m.particles_0_5um} / 5µm: ${m.particles_5um}`;
    }

    switch (m.type) {
      case 'temperature_humidity': return `${m.temperature}°C / ${m.humidity}%`;
      case 'luminosity': return `${m.luminosity} lx`;
      case 'torque': return `${m.torqueValue} Nm`;
      case 'surface_resistance': return `${m.resistance.toExponential(1)} Ω`;
      case 'grounding_resistance': return `${m.resistance} Ω`;
      case 'ionizer': return `${this.translationService.translate('history.detailsPrefix.bal')}: ${m.balance}V`;
      default: return this.translationService.translate('dashboard.noData');
    }
  }

  private checkOutOfSpec(m: Measurement | undefined): boolean {
    if (!m) return false;
    
    // Get current limits from service
    const limits = this.limitsService.getLimitsForType(m.type);

    if (isDustinessMeasurement(m)) {
      return m.particles_0_5um < limits.particles_0_5um_min || m.particles_0_5um > limits.particles_0_5um_max ||
             m.particles_5um < limits.particles_5um_min || m.particles_5um > limits.particles_5um_max;
    }
    
    switch (m.type) {
      case 'temperature_humidity':
        return m.temperature < limits.temperatureMin || m.temperature > limits.temperatureMax ||
               m.humidity < limits.humidityMin || m.humidity > limits.humidityMax;
      case 'luminosity':
        return m.luminosity < limits.min || m.luminosity > limits.max;
      case 'torque': 
        return m.torqueValue < limits.min || m.torqueValue > limits.max;
      case 'surface_resistance': 
        return m.resistance < limits.min || m.resistance > limits.max;
      case 'grounding_resistance': 
        return m.resistance < limits.min || m.resistance > limits.max;
      case 'ionizer': 
        return m.balance > limits.balance || m.decayTimePositive > limits.decayTime || m.decayTimeNegative > limits.decayTime;
      default: 
        return false;
    }
  }

  private isSupportedMeasurementType(type: string): boolean {
    return MEASUREMENT_TYPES.includes(type as any) || isDustinessMeasurementType(type);
  }
}