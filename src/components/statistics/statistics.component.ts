import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../../services/statistics.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe],
})
export class StatisticsComponent {
  statisticsService = inject(StatisticsService);
  translationService = inject(TranslationService);

  getTypeEntries() {
    return Array.from(this.statisticsService.statistics().measurementsByType.entries());
  }

  getLocationEntries() {
    return Array.from(this.statisticsService.statistics().measurementsByLocation.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 locations
  }

  getTrendIcon(trend: 'improving' | 'worsening' | 'stable'): string {
    switch (trend) {
      case 'improving': return '↓';
      case 'worsening': return '↑';
      case 'stable': return '→';
    }
  }

  getTrendColor(trend: 'improving' | 'worsening' | 'stable'): string {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'worsening': return 'text-red-600';
      case 'stable': return 'text-gray-600';
    }
  }
}
