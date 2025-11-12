import { Component, ChangeDetectionStrategy, input, computed, ViewChild, AfterViewInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Measurement, MeasurementType } from '../../models';
import { TranslationService } from '../../services/translation.service';
import { LimitsService } from '../../services/limits.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-measurement-chart',
  templateUrl: './measurement-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BaseChartDirective, TranslatePipe],
})
export class MeasurementChartComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  
  measurements = input.required<Measurement[]>();
  measurementType = input.required<MeasurementType>();
  
  private translationService = inject(TranslationService);
  private limitsService = inject(LimitsService);

  public lineChartType: ChartType = 'line';

  // Chart data computed based on measurements
  public chartData = computed<ChartConfiguration['data']>(() => {
    const filtered = this.measurements().filter(m => m.type === this.measurementType());
    
    // Track limits changes to recompute datasets
    this.limitsService.limits();
    
    // Sort by date ascending for proper timeline
    const sorted = [...filtered].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels = sorted.map(m => new Date(m.date).toLocaleDateString());
    const datasets = this.getDatasets(sorted);

    return {
      labels,
      datasets,
    };
  });

  public chartOptions = computed<ChartConfiguration['options']>(() => {
    const baseOptions: ChartConfiguration['options'] = {
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
            text: 'Date',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Value',
          },
        },
      },
    };

    // Add second Y axis for temperature_humidity chart
    if (this.measurementType() === 'temperature_humidity') {
      baseOptions.scales!['y1'] = {
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Humidity (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
      } as any;
      (baseOptions.scales!['y'] as any).title = {
        display: true,
        text: 'Temperature (°C)',
      };
    }

    return baseOptions;
  });

  constructor() {
    // Update chart when data or limits change
    effect(() => {
      this.chartData();
      this.limitsService.limits(); // Track limits changes
      this.chart?.update();
    });
  }

  ngAfterViewInit() {
    // Chart is now available
  }

  private getDatasets(measurements: Measurement[]): ChartConfiguration['data']['datasets'] {
    const type = this.measurementType();
    
    switch (type) {
      case 'temperature_humidity': {
        // Get current limits from service
        const currentLimits = this.limitsService.getLimitsForType('temperature_humidity');
        
        const tempData = measurements.map((m: any) => m.temperature);
        const humData = measurements.map((m: any) => m.humidity);
        // Use current limits from service, not from old measurements
        const tempMinData = measurements.map(() => currentLimits.temperatureMin);
        const tempMaxData = measurements.map(() => currentLimits.temperatureMax);
        const humMinData = measurements.map(() => currentLimits.humidityMin);
        const humMaxData = measurements.map(() => currentLimits.humidityMax);
        
        return [
          {
            data: tempData,
            label: this.translationService.translate('form.temperature'),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
            borderWidth: 2,
          },
          {
            data: tempMinData,
            label: this.translationService.translate('form.temperatureMin'),
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            yAxisID: 'y',
            pointRadius: 0,
            borderWidth: 3,
          },
          {
            data: tempMaxData,
            label: this.translationService.translate('form.temperatureMax'),
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            yAxisID: 'y',
            pointRadius: 0,
            borderWidth: 3,
          },
          {
            data: humData,
            label: this.translationService.translate('form.humidity'),
            borderColor: 'rgb(6, 182, 212)',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
            borderWidth: 2,
          },
          {
            data: humMinData,
            label: this.translationService.translate('form.humidityMin'),
            borderColor: 'rgb(34, 211, 238)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            yAxisID: 'y1',
            pointRadius: 0,
            borderWidth: 3,
          },
          {
            data: humMaxData,
            label: this.translationService.translate('form.humidityMax'),
            borderColor: 'rgb(8, 145, 178)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            yAxisID: 'y1',
            pointRadius: 0,
            borderWidth: 3,
          },
        ];
      }
      
      case 'luminosity': {
        // Get current limits from service
        const currentLimits = this.limitsService.getLimitsForType('luminosity');
        
        const lumData = measurements.map((m: any) => m.luminosity);
        const minData = measurements.map(() => currentLimits.min);
        const maxData = measurements.map(() => currentLimits.max);
        
        return [
          {
            data: lumData,
            label: this.translationService.translate('form.luminosity'),
            borderColor: 'rgb(234, 179, 8)',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          } as any,
          {
            data: minData,
            label: this.translationService.translate('form.luminosityMin'),
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: maxData,
            label: this.translationService.translate('form.luminosityMax'),
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
        ];
      }
      
      case 'dustiness_iso6': {
        // Get current limits from service
        const currentLimits = this.limitsService.getLimitsForType('dustiness_iso6');
        
        const particles_0_5um_data = measurements.map((m: any) => m.particles_0_5um);
        const particles_5um_data = measurements.map((m: any) => m.particles_5um);
        const particles_0_5um_minData = measurements.map(() => currentLimits.particles_0_5um_min);
        const particles_0_5um_maxData = measurements.map(() => currentLimits.particles_0_5um_max);
        const particles_5um_minData = measurements.map(() => currentLimits.particles_5um_min);
        const particles_5um_maxData = measurements.map(() => currentLimits.particles_5um_max);
        
        return [
          {
            data: particles_0_5um_data,
            label: this.translationService.translate('form.particles_0_5um'),
            borderColor: 'rgb(156, 163, 175)',
            backgroundColor: 'rgba(156, 163, 175, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          } as any,
          {
            data: particles_0_5um_minData,
            label: this.translationService.translate('form.particles_0_5um') + ' Min',
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: particles_0_5um_maxData,
            label: this.translationService.translate('form.particles_0_5um') + ' Max',
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: particles_5um_data,
            label: this.translationService.translate('form.particles_5um'),
            borderColor: 'rgb(100, 116, 139)',
            backgroundColor: 'rgba(100, 116, 139, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          } as any,
          {
            data: particles_5um_minData,
            label: this.translationService.translate('form.particles_5um') + ' Min',
            borderColor: 'rgb(251, 191, 36)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: particles_5um_maxData,
            label: this.translationService.translate('form.particles_5um') + ' Max',
            borderColor: 'rgb(185, 28, 28)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
        ];
      }
      
      case 'dustiness_iso5': {
        // Get current limits from service
        const currentLimits = this.limitsService.getLimitsForType('dustiness_iso5');
        
        const particles_0_5um_data = measurements.map((m: any) => m.particles_0_5um);
        const particles_5um_data = measurements.map((m: any) => m.particles_5um);
        const particles_0_5um_minData = measurements.map(() => currentLimits.particles_0_5um_min);
        const particles_0_5um_maxData = measurements.map(() => currentLimits.particles_0_5um_max);
        const particles_5um_minData = measurements.map(() => currentLimits.particles_5um_min);
        const particles_5um_maxData = measurements.map(() => currentLimits.particles_5um_max);
        
        return [
          {
            data: particles_0_5um_data,
            label: this.translationService.translate('form.particles_0_5um'),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          } as any,
          {
            data: particles_0_5um_minData,
            label: this.translationService.translate('form.particles_0_5um') + ' Min',
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: particles_0_5um_maxData,
            label: this.translationService.translate('form.particles_0_5um') + ' Max',
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: particles_5um_data,
            label: this.translationService.translate('form.particles_5um'),
            borderColor: 'rgb(67, 56, 202)',
            backgroundColor: 'rgba(67, 56, 202, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          } as any,
          {
            data: particles_5um_minData,
            label: this.translationService.translate('form.particles_5um') + ' Min',
            borderColor: 'rgb(251, 191, 36)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: particles_5um_maxData,
            label: this.translationService.translate('form.particles_5um') + ' Max',
            borderColor: 'rgb(185, 28, 28)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
        ];
      }
      
      case 'torque': {
        // Get current limits from service
        const currentLimits = this.limitsService.getLimitsForType('torque');
        
        const torqueData = measurements.map((m: any) => m.torqueValue);
        const minData = measurements.map(() => currentLimits.min);
        const maxData = measurements.map(() => currentLimits.max);
        
        return [
          {
            data: torqueData,
            label: this.translationService.translate('form.torque'),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          } as any,
          {
            data: minData,
            label: this.translationService.translate('form.torqueMin'),
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: maxData,
            label: this.translationService.translate('form.torqueMax'),
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
        ];
      }
      
      case 'surface_resistance': {
        // Get current limits from service
        const currentLimits = this.limitsService.getLimitsForType('surface_resistance');
        
        const resistanceData = measurements.map((m: any) => m.resistance);
        const minData = measurements.map(() => currentLimits.min);
        const maxData = measurements.map(() => currentLimits.max);
        
        return [
          {
            data: resistanceData,
            label: this.translationService.translate('form.resistance'),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          } as any,
          {
            data: minData,
            label: this.translationService.translate('form.resistanceMin'),
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: maxData,
            label: this.translationService.translate('form.resistanceMax'),
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
        ];
      }
      
      case 'grounding_resistance': {
        // Get current limits from service
        const currentLimits = this.limitsService.getLimitsForType('grounding_resistance');
        
        const resistanceData = measurements.map((m: any) => m.resistance);
        const minData = measurements.map(() => currentLimits.min);
        const maxData = measurements.map(() => currentLimits.max);
        
        return [
          {
            data: resistanceData,
            label: this.translationService.translate('form.resistance'),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          } as any,
          {
            data: minData,
            label: this.translationService.translate('form.resistanceMin'),
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
          {
            data: maxData,
            label: this.translationService.translate('form.resistanceMax'),
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
            segment: {
              borderDash: [5, 5],
            }
          } as any,
        ];
      }
      
      case 'ionizer': {
        // Get current limits from service
        const currentLimits = this.limitsService.getLimitsForType('ionizer');
        
        const balanceData = measurements.map((m: any) => m.balance);
        const decayPosData = measurements.map((m: any) => m.decayTimePositive);
        const decayNegData = measurements.map((m: any) => m.decayTimeNegative);
        const balanceLimitData = measurements.map(() => currentLimits.balance);
        const decayLimitData = measurements.map(() => currentLimits.decayTime);
        
        return [
          {
            data: balanceData,
            label: this.translationService.translate('form.balance'),
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            data: balanceLimitData,
            label: this.translationService.translate('form.balanceLimit'),
            borderColor: 'rgb(109, 40, 217)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            data: decayPosData,
            label: this.translationService.translate('form.decayTimePositive'),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            data: decayNegData,
            label: this.translationService.translate('form.decayTimeNegative'),
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          },
          {
            data: decayLimitData,
            label: this.translationService.translate('form.decayTimeLimit'),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
          },
        ];
      }
      
      default:
        return [];
    }
  }
}
