import { Component, ChangeDetectionStrategy, input, output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeasurementType } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LimitsService } from '../../services/limits.service';
import { TrapFocusDirective } from '../../directives/trap-focus.directive';

@Component({
  selector: 'app-limits-dialog',
  templateUrl: './limits-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, TrapFocusDirective],
})
export class LimitsDialogComponent implements OnInit {
  measurementType = input.required<MeasurementType>();
  
  dialogClosed = output<void>();

  private fb = inject(FormBuilder);
  private limitsService = inject(LimitsService);
  
  form!: FormGroup;

  ngOnInit() {
    this.buildForm();
  }

  private buildForm() {
    const currentLimits = this.limitsService.getLimitsForType(this.measurementType());
    
    switch (this.measurementType()) {
      case 'temperature_humidity':
        this.form = this.fb.group({
          temperatureMin: [currentLimits?.temperatureMin ?? 15, [Validators.required, Validators.min(-50), Validators.max(100)]],
          temperatureMax: [currentLimits?.temperatureMax ?? 30, [Validators.required, Validators.min(-50), Validators.max(100)]],
          humidityMin: [currentLimits?.humidityMin ?? 30, [Validators.required, Validators.min(0), Validators.max(100)]],
          humidityMax: [currentLimits?.humidityMax ?? 70, [Validators.required, Validators.min(0), Validators.max(100)]],
        });
        break;
      case 'luminosity':
        this.form = this.fb.group({
          min: [currentLimits?.min ?? 500, [Validators.required, Validators.min(0)]],
          max: [currentLimits?.max ?? 1000, [Validators.required, Validators.min(0)]],
        });
        break;
      case 'dustiness_iso6':
        this.form = this.fb.group({
          particles_0_5um_min: [currentLimits?.particles_0_5um_min ?? 0, [Validators.required, Validators.min(0)]],
          particles_0_5um_max: [currentLimits?.particles_0_5um_max ?? 10200, [Validators.required, Validators.min(0)]],
          particles_5um_min: [currentLimits?.particles_5um_min ?? 0, [Validators.required, Validators.min(0)]],
          particles_5um_max: [currentLimits?.particles_5um_max ?? 2930, [Validators.required, Validators.min(0)]],
        });
        break;
      case 'dustiness_iso5':
        this.form = this.fb.group({
          particles_0_5um_min: [currentLimits?.particles_0_5um_min ?? 0, [Validators.required, Validators.min(0)]],
          particles_0_5um_max: [currentLimits?.particles_0_5um_max ?? 3520, [Validators.required, Validators.min(0)]],
          particles_5um_min: [currentLimits?.particles_5um_min ?? 0, [Validators.required, Validators.min(0)]],
          particles_5um_max: [currentLimits?.particles_5um_max ?? 293, [Validators.required, Validators.min(0)]],
        });
        break;
      case 'torque':
        this.form = this.fb.group({
          min: [currentLimits?.min ?? 4.0, [Validators.required, Validators.min(0)]],
          max: [currentLimits?.max ?? 6.0, [Validators.required, Validators.min(0)]],
        });
        break;
      case 'surface_resistance':
        this.form = this.fb.group({
          min: [currentLimits?.min ?? 1e6, [Validators.required, Validators.min(0)]],
          max: [currentLimits?.max ?? 1e9, [Validators.required, Validators.min(0)]],
        });
        break;
      case 'grounding_resistance':
        this.form = this.fb.group({
          min: [currentLimits?.min ?? 0, [Validators.required, Validators.min(0)]],
          max: [currentLimits?.max ?? 1.0, [Validators.required, Validators.min(0)]],
        });
        break;
      case 'ionizer':
        this.form = this.fb.group({
          decayTime: [currentLimits?.decayTime ?? 5.0, [Validators.required, Validators.min(0)]],
          balance: [currentLimits?.balance ?? 35, [Validators.required, Validators.min(0)]],
        });
        break;
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.limitsService.updateLimits(this.measurementType(), this.form.value);
      this.dialogClosed.emit();
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogClosed.emit();
  }
}
