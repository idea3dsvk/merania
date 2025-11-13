import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { DataService } from '../../services/data.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MeasurementType, MEASUREMENT_TYPES } from '../../models';

@Component({
  selector: 'app-trend-charts',
  templateUrl: './trend-charts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, BaseChartDirective, TranslatePipe],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class TrendChartsComponent {
  private dataService = inject(DataService);
  private translationService = inject(TranslationService);

  selectedType = signal<MeasurementType>('temperature_humidity');
  measurementTypes = MEASUREMENT_TYPES;

  // Line chart configuration
  lineChartType: ChartType = 'line';
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  };

  // Bar chart configuration
  barChartType: ChartType = 'bar';
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Computed chart data
  lineChartData = computed(() => {
    const measurements = this.dataService.measurements()
      .filter(m => m.type === this.selectedType())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 measurements

    if (measurements.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = measurements.map(m => new Date(m.date).toLocaleDateString());
    
    // Build datasets based on measurement type
    const datasets = this.buildDatasets(measurements);

    return {
      labels,
      datasets
    };
  });

  barChartData = computed(() => {
    const measurements = this.dataService.measurements();
    const typeCounts = new Map<MeasurementType, number>();

    MEASUREMENT_TYPES.forEach(type => typeCounts.set(type, 0));
    measurements.forEach(m => {
      typeCounts.set(m.type, (typeCounts.get(m.type) || 0) + 1);
    });

    return {
      labels: MEASUREMENT_TYPES.map(type => 
        this.translationService.translate(`measurementNames.${type}`)
      ),
      datasets: [{
        data: MEASUREMENT_TYPES.map(type => typeCounts.get(type) || 0),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(199, 199, 199, 0.5)',
          'rgba(83, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
          'rgb(199, 199, 199)',
          'rgb(83, 102, 255)',
        ],
        borderWidth: 1
      }]
    };
  });

  private buildDatasets(measurements: any[]): any[] {
    const type = this.selectedType();
    const datasets: any[] = [];

    switch (type) {
      case 'temperature_humidity':
        datasets.push({
          data: measurements.map(m => m.temperature),
          label: this.translationService.translate('form.temperature'),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4
        });
        datasets.push({
          data: measurements.map(m => m.humidity),
          label: this.translationService.translate('form.humidity'),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          tension: 0.4
        });
        break;

      case 'luminosity':
        datasets.push({
          data: measurements.map(m => m.luminosity),
          label: this.translationService.translate('form.luminosity'),
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgba(255, 206, 86, 0.1)',
          tension: 0.4
        });
        break;

      case 'dustiness_iso6':
      case 'dustiness_iso5':
        datasets.push({
          data: measurements.map(m => m.particles_0_5um),
          label: this.translationService.translate('form.particles_0_5um'),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4
        });
        datasets.push({
          data: measurements.map(m => m.particles_5um),
          label: this.translationService.translate('form.particles_5um'),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          tension: 0.4
        });
        break;

      case 'torque':
        datasets.push({
          data: measurements.map(m => m.torqueValue),
          label: this.translationService.translate('form.torque'),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.1)',
          tension: 0.4
        });
        break;

      case 'surface_resistance':
      case 'grounding_resistance':
        datasets.push({
          data: measurements.map(m => m.resistance),
          label: this.translationService.translate('form.resistance'),
          borderColor: 'rgb(199, 199, 199)',
          backgroundColor: 'rgba(199, 199, 199, 0.1)',
          tension: 0.4
        });
        break;

      case 'ionizer':
        datasets.push({
          data: measurements.map(m => m.balance),
          label: this.translationService.translate('form.balance'),
          borderColor: 'rgb(83, 102, 255)',
          backgroundColor: 'rgba(83, 102, 255, 0.1)',
          tension: 0.4
        });
        datasets.push({
          data: measurements.map(m => m.decayTimePositive),
          label: this.translationService.translate('form.decayTimePositive'),
          borderColor: 'rgb(255, 99, 71)',
          backgroundColor: 'rgba(255, 99, 71, 0.1)',
          tension: 0.4
        });
        datasets.push({
          data: measurements.map(m => m.decayTimeNegative),
          label: this.translationService.translate('form.decayTimeNegative'),
          borderColor: 'rgb(60, 179, 113)',
          backgroundColor: 'rgba(60, 179, 113, 0.1)',
          tension: 0.4
        });
        break;
    }

    return datasets;
  }

  getMeasurementTypeName(type: MeasurementType): string {
    return this.translationService.translate(`measurementNames.${type}`);
  }
}
