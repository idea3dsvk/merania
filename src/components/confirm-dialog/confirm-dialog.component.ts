import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TrapFocusDirective } from '../../directives/trap-focus.directive';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe, TrapFocusDirective],
})
export class ConfirmDialogComponent {
  title = input.required<string>();
  message = input.required<string>();
  show = input.required<boolean>();
  
  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
