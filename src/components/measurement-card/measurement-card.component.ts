import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeasurementType } from '../../models';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface SummaryData {
  type: MeasurementType;
  name: string;
  count: number;
  latestValue: string;
  isOutOfSpec: boolean;
}

@Component({
  selector: 'app-measurement-card',
  templateUrl: './measurement-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe],
})
export class MeasurementCardComponent {
  private authService = inject(AuthService);
  
  summary = input.required<SummaryData>();
  cardClicked = output<MeasurementType>();
  limitsClicked = output<MeasurementType>();
  
  // Computed: check if user can edit limits
  canEditLimits = computed(() => this.authService.canEditLimits());

  onClick(): void {
    this.cardClicked.emit(this.summary().type);
  }

  onLimitsClick(event: Event): void {
    event.stopPropagation();
    // Only emit if user has permission
    if (this.canEditLimits()) {
      this.limitsClicked.emit(this.summary().type);
    }
  }
}
