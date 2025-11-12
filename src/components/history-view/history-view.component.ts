import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Measurement, MeasurementType, MEASUREMENT_TYPES, TemperatureHumidityMeasurement, LuminosityMeasurement, DustinessISO6Measurement, DustinessISO5Measurement, TorqueMeasurement, SurfaceResistanceMeasurement, GroundingResistanceMeasurement, IonizerMeasurement } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocaleDatePipe } from '../../pipes/locale-date.pipe';
import { LocaleNumberPipe } from '../../pipes/locale-number.pipe';
import { TranslationService } from '../../services/translation.service';
import { MeasurementChartComponent } from '../measurement-chart/measurement-chart.component';
import { MeasurementFormComponent } from '../measurement-form/measurement-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

type MeasurementWithTrend = Measurement & { trend?: 'up' | 'down' | 'stable' };
@Component({
  selector: 'app-history-view',
  templateUrl: './history-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslatePipe, LocaleDatePipe, LocaleNumberPipe, MeasurementChartComponent, MeasurementFormComponent, ConfirmDialogComponent],
  providers: [DatePipe, provideCharts(withDefaultRegisterables())],
})
export class HistoryViewComponent {
  dataService = inject(DataService);
  authService = inject(AuthService);
  translationService = inject(TranslationService);
  
  // Computed: check if user can delete
  canDelete = computed(() => this.authService.canDelete());
  
  // Filters
  filterType = signal<MeasurementType | 'all'>('all');
  filterLocation = signal<string>('');
  filterNotes = signal<string>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterYear = signal<number | 'all'>('all');
  filterMonth = signal<number | 'all'>('all');
  
  // Generate years for last 15 years
  availableYears = computed(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = 0; i < 15; i++) {
      years.push(currentYear - i);
    }
    return years;
  });
  
  // Months 1-12
  availableMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  // Edit modal
  showEditModal = signal(false);
  editingMeasurement = signal<Measurement | null>(null);
  
  // Delete confirmation
  showDeleteConfirm = signal(false);
  deletingMeasurementId = signal<string | null>(null);
  
  measurementTypes = MEASUREMENT_TYPES;
  
  allLocations = computed(() => {
    const locations = this.dataService.measurements().map(m => m.location);
    return [...new Set(locations)];
  });

  // Optimized with Map for faster lookup of previous measurements
  private processedMeasurements = computed<MeasurementWithTrend[]>(() => {
    const allMeasurements = this.dataService.measurements(); // Already sorted date desc
    
    // Create a Map for faster lookups: key = "type:location", value = measurements array
    const measurementsByTypeLocation = new Map<string, Measurement[]>();
    
    for (const measurement of allMeasurements) {
      const key = `${measurement.type}:${measurement.location}`;
      if (!measurementsByTypeLocation.has(key)) {
        measurementsByTypeLocation.set(key, []);
      }
      measurementsByTypeLocation.get(key)!.push(measurement);
    }
    
    return allMeasurements.map((current) => {
        const key = `${current.type}:${current.location}`;
        const relatedMeasurements = measurementsByTypeLocation.get(key) || [];
        const currentIndex = relatedMeasurements.indexOf(current);
        const previous = relatedMeasurements[currentIndex + 1]; // Next in sorted array is older

        let trend: 'up' | 'down' | 'stable' | undefined = undefined;
        if (previous) {
            const currentValue = this.getPrimaryValue(current);
            const previousValue = this.getPrimaryValue(previous);

            if (currentValue > previousValue) trend = 'up';
            else if (currentValue < previousValue) trend = 'down';
            else trend = 'stable';
        }

        return { ...current, trend };
    });
  });

  filteredMeasurements = computed(() => {
    const type = this.filterType();
    const location = this.filterLocation().toLowerCase();
    const notes = this.filterNotes().toLowerCase();
    const dateFrom = this.filterDateFrom();
    const dateTo = this.filterDateTo();
    const year = this.filterYear();
    const month = this.filterMonth();
    
    return this.processedMeasurements().filter(m => {
      // Type filter
      if (type !== 'all' && m.type !== type) return false;
      
      // Location filter
      if (location && !m.location.toLowerCase().includes(location)) return false;
      
      // Notes filter (fulltext search)
      if (notes && !(m.notes || '').toLowerCase().includes(notes)) return false;
      
      const measurementDate = new Date(m.date);
      const measurementTime = measurementDate.getTime();
      
      // Date range filter
      if (dateFrom) {
        const fromTime = new Date(dateFrom).getTime();
        if (measurementTime < fromTime) return false;
      }
      if (dateTo) {
        const toTime = new Date(dateTo).getTime() + 86400000; // Add 1 day to include end date
        if (measurementTime > toTime) return false;
      }
      
      // Year filter
      if (year !== 'all' && measurementDate.getFullYear() !== year) return false;
      
      // Month filter (1-12)
      if (month !== 'all' && (measurementDate.getMonth() + 1) !== month) return false;
      
      return true;
    });
  });
  
  private getPrimaryValue(m: Measurement): number {
    switch (m.type) {
        case 'temperature_humidity': return m.temperature;
        case 'luminosity': return m.luminosity;
        case 'dustiness_iso6': return (m.particles_0_5um + m.particles_5um) / 2;
        case 'dustiness_iso5': return (m.particles_0_5um + m.particles_5um) / 2;
        case 'torque': return m.torqueValue;
        case 'surface_resistance': return m.resistance;
        case 'grounding_resistance': return m.resistance;
        case 'ionizer': return m.balance;
        default: return 0;
    }
  }

  setFilterType(event: Event) {
    const newType = (event.target as HTMLSelectElement).value as MeasurementType | 'all';
    this.filterType.set(newType);
  }

  setFilterLocation(event: Event) {
    this.filterLocation.set((event.target as HTMLInputElement).value);
  }

  setFilterNotes(event: Event) {
    this.filterNotes.set((event.target as HTMLInputElement).value);
  }

  setFilterDateFrom(event: Event) {
    this.filterDateFrom.set((event.target as HTMLInputElement).value);
  }

  setFilterDateTo(event: Event) {
    this.filterDateTo.set((event.target as HTMLInputElement).value);
  }

  setFilterYear(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterYear.set(value === 'all' ? 'all' : parseInt(value));
  }

  setFilterMonth(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterMonth.set(value === 'all' ? 'all' : parseInt(value));
  }

  getMonthName(month: number): string {
    const date = new Date(2000, month - 1, 1);
    return date.toLocaleString(this.translationService.currentLang(), { month: 'long' });
  }
  
  exportCSV() {
    this.dataService.exportToCSV(this.filteredMeasurements());
  }

  exportPDF() {
    this.dataService.exportToPDF(this.filteredMeasurements());
  }

  openEditModal(measurement: Measurement) {
    this.editingMeasurement.set(measurement);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingMeasurement.set(null);
  }

  handleEditSubmit(measurementData: Omit<Measurement, 'id'>) {
    const editing = this.editingMeasurement();
    if (editing) {
      this.dataService.updateMeasurement(editing.id, measurementData);
      this.closeEditModal();
    }
  }

  openDeleteConfirm(id: string) {
    this.deletingMeasurementId.set(id);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.deletingMeasurementId.set(null);
  }

  confirmDelete() {
    const id = this.deletingMeasurementId();
    if (id) {
      this.dataService.deleteMeasurement(id);
      this.closeDeleteConfirm();
    }
  }
}