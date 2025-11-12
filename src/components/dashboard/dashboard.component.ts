import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { MeasurementFormComponent } from '../measurement-form/measurement-form.component';
import { MeasurementCardComponent, SummaryData } from '../measurement-card/measurement-card.component';
import { LimitsDialogComponent } from '../limits-dialog/limits-dialog.component';
import { Measurement, MeasurementType, MEASUREMENT_TYPES } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { LimitsService } from '../../services/limits.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MeasurementFormComponent, MeasurementCardComponent, LimitsDialogComponent, TranslatePipe],
})
export class DashboardComponent {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private limitsService = inject(LimitsService);
  
  showAddModal = signal(false);
  selectedMeasurementType = signal<MeasurementType | null>(null);
  showLimitsDialog = signal(false);
  selectedLimitsType = signal<MeasurementType | null>(null);
  
  // Computed: check if user can edit limits
  canEditLimits = computed(() => this.authService.canEditLimits());

  measurementTypes = MEASUREMENT_TYPES;
  
  getMeasurementName(type: MeasurementType): string {
    return this.translationService.translate(`measurementNames.${type}`);
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
    
    return this.measurementTypes.map(type => {
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
    switch (m.type) {
      case 'temperature_humidity': return `${m.temperature}°C / ${m.humidity}%`;
      case 'luminosity': return `${m.luminosity} lx`;
      case 'dustiness_iso6': return `0.5µm: ${m.particles_0_5um} / 5µm: ${m.particles_5um}`;
      case 'dustiness_iso5': return `0.5µm: ${m.particles_0_5um} / 5µm: ${m.particles_5um}`;
      case 'torque': return `${m.torqueValue} Nm`;
      case 'surface_resistance': return `${m.resistance.toExponential(1)} Ω`;
      case 'grounding_resistance': return `${m.resistance} Ω`;
      case 'ionizer': return `${this.translationService.translate('history.detailsPrefix.bal')}: ${m.balance}V`;
    }
  }

  private checkOutOfSpec(m: Measurement | undefined): boolean {
    if (!m) return false;
    
    // Get current limits from service
    const limits = this.limitsService.getLimitsForType(m.type);
    
    switch (m.type) {
      case 'temperature_humidity':
        return m.temperature < limits.temperatureMin || m.temperature > limits.temperatureMax ||
               m.humidity < limits.humidityMin || m.humidity > limits.humidityMax;
      case 'luminosity':
        return m.luminosity < limits.min || m.luminosity > limits.max;
      case 'dustiness_iso6':
        return m.particles_0_5um < limits.particles_0_5um_min || m.particles_0_5um > limits.particles_0_5um_max ||
               m.particles_5um < limits.particles_5um_min || m.particles_5um > limits.particles_5um_max;
      case 'dustiness_iso5':
        return m.particles_0_5um < limits.particles_0_5um_min || m.particles_0_5um > limits.particles_0_5um_max ||
               m.particles_5um < limits.particles_5um_min || m.particles_5um > limits.particles_5um_max;
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
}