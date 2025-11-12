import { Component, ChangeDetectionStrategy, input, output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeasurementType, Measurement } from '../../models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LimitsService } from '../../services/limits.service';

@Component({
  selector: 'app-measurement-form',
  templateUrl: './measurement-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
})
export class MeasurementFormComponent implements OnInit {
  measurementType = input.required<MeasurementType>();
  existingMeasurement = input<Measurement | null>(null);
  
  formSubmitted = output<Omit<Measurement, 'id'>>();
  formCancelled = output<void>();

  private fb = inject(FormBuilder);
  private limitsService = inject(LimitsService);
  form!: FormGroup;

  ngOnInit() {
    this.buildForm();
    this.populateForm();
  }

  private populateForm() {
    const existing = this.existingMeasurement();
    if (existing) {
      this.form.patchValue({
        date: new Date(existing.date).toISOString().slice(0, 16),
        location: existing.location,
        deviceId: existing.deviceId || '',
        notes: existing.notes || '',
      });

      // Type-specific fields (no longer include limit fields)
      if (existing.type === 'temperature_humidity') {
        this.form.patchValue({
          temperature: existing.temperature,
          humidity: existing.humidity,
        });
      } else if (existing.type === 'luminosity') {
        this.form.patchValue({
          luminosity: existing.luminosity,
        });
      } else if (existing.type === 'dustiness_iso6') {
        this.form.patchValue({
          particles_0_5um: existing.particles_0_5um,
          particles_5um: existing.particles_5um,
        });
      } else if (existing.type === 'dustiness_iso5') {
        this.form.patchValue({
          particles_0_5um: existing.particles_0_5um,
          particles_5um: existing.particles_5um,
        });
      } else if (existing.type === 'torque') {
        this.form.patchValue({
          screwdriverId: existing.screwdriverId,
          torqueValue: existing.torqueValue,
        });
      } else if (existing.type === 'surface_resistance') {
        this.form.patchValue({
          material: existing.material,
          resistance: existing.resistance,
        });
      } else if (existing.type === 'grounding_resistance') {
        this.form.patchValue({
          pointId: existing.pointId,
          resistance: existing.resistance,
        });
      } else if (existing.type === 'ionizer') {
        this.form.patchValue({
          ionizerId: existing.ionizerId,
          decayTimePositive: existing.decayTimePositive,
          decayTimeNegative: existing.decayTimeNegative,
          balance: existing.balance,
        });
      }
    }
  }

  private buildForm() {
    const commonControls = {
      date: [new Date().toISOString().slice(0, 16), Validators.required],
      location: ['', Validators.required],
      deviceId: [''],
      notes: [''],
    };

    let specificControls = {};

    switch (this.measurementType()) {
      case 'temperature_humidity':
        specificControls = {
          temperature: [null, [Validators.required, Validators.min(-50), Validators.max(100)]],
          humidity: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
        };
        break;
      case 'luminosity':
        specificControls = {
          luminosity: [null, [Validators.required, Validators.min(0)]],
        };
        break;
      case 'dustiness_iso6':
        specificControls = {
          particles_0_5um: [null, [Validators.required, Validators.min(0)]],
          particles_5um: [null, [Validators.required, Validators.min(0)]],
        };
        break;
      case 'dustiness_iso5':
        specificControls = {
          particles_0_5um: [null, [Validators.required, Validators.min(0)]],
          particles_5um: [null, [Validators.required, Validators.min(0)]],
        };
        break;
      case 'torque':
        specificControls = {
          screwdriverId: ['', Validators.required],
          torqueValue: [null, [Validators.required, Validators.min(0)]],
        };
        break;
      case 'surface_resistance':
        specificControls = {
          material: ['', Validators.required],
          resistance: [null, [Validators.required, Validators.min(0)]],
        };
        break;
      case 'grounding_resistance':
        specificControls = {
          pointId: ['', Validators.required],
          resistance: [null, [Validators.required, Validators.min(0)]],
        };
        break;
      case 'ionizer':
        specificControls = {
          ionizerId: ['', Validators.required],
          decayTimePositive: [null, [Validators.required, Validators.min(0)]],
          decayTimeNegative: [null, [Validators.required, Validators.min(0)]],
          balance: [null, [Validators.required]],
        };
        break;
    }

    this.form = this.fb.group({ ...commonControls, ...specificControls });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const type = this.measurementType();
      
      // Get limits from LimitsService
      const limits = this.limitsService.getLimitsForType(type);
      
      let measurementData: any = {
          type: type,
          date: new Date(formValue.date).toISOString(),
          location: formValue.location,
          deviceId: formValue.deviceId,
          notes: formValue.notes
      };

      // Add type-specific data and limits from service
      if (type === 'temperature_humidity') {
        measurementData.temperature = formValue.temperature;
        measurementData.humidity = formValue.humidity;
        measurementData.limits = {
            temperatureMin: limits.temperatureMin,
            temperatureMax: limits.temperatureMax,
            humidityMin: limits.humidityMin,
            humidityMax: limits.humidityMax
        };
      } else if (type === 'ionizer') {
        measurementData.ionizerId = formValue.ionizerId;
        measurementData.decayTimePositive = formValue.decayTimePositive;
        measurementData.decayTimeNegative = formValue.decayTimeNegative;
        measurementData.balance = formValue.balance;
        measurementData.limits = {
            decayTime: limits.decayTime,
            balance: limits.balance
        };
      } else if (type === 'dustiness_iso6' || type === 'dustiness_iso5') {
        // For dustiness types with particle-specific limits
        measurementData.particles_0_5um = formValue.particles_0_5um;
        measurementData.particles_5um = formValue.particles_5um;
        measurementData.limits = {
          particles_0_5um_min: limits.particles_0_5um_min,
          particles_0_5um_max: limits.particles_0_5um_max,
          particles_5um_min: limits.particles_5um_min,
          particles_5um_max: limits.particles_5um_max
        };
      } else if (type === 'luminosity' || type === 'torque' || 
                 type === 'surface_resistance' || type === 'grounding_resistance') {
        // For types with min/max limits
        const { date, location, notes, ...specificData } = formValue;
        measurementData = {...measurementData, ...specificData, limits: { min: limits.min, max: limits.max }};
      }
      
      this.formSubmitted.emit(measurementData);
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.formCancelled.emit();
  }
}