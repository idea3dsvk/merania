import { Component, ChangeDetectionStrategy, input, output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MeasurementType, isDustinessMeasurementType } from '../../models';
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
    const measurementType = this.measurementType();
    const currentLimits = this.limitsService.getLimitsForType(measurementType);

    if (isDustinessMeasurementType(measurementType)) {
      const particles05Ewi = this.resolveEwiPair(
        currentLimits?.particles_0_5um_min ?? 0,
        currentLimits?.particles_0_5um_max ?? 10200,
        currentLimits?.particles_0_5um_lcl_ewi,
        currentLimits?.particles_0_5um_ucl_ewi
      );
      const particles5Ewi = this.resolveEwiPair(
        currentLimits?.particles_5um_min ?? 0,
        currentLimits?.particles_5um_max ?? 2930,
        currentLimits?.particles_5um_lcl_ewi,
        currentLimits?.particles_5um_ucl_ewi
      );
      this.form = this.fb.group({
        particles_0_5um_min: [currentLimits?.particles_0_5um_min ?? 0, [Validators.required, Validators.min(0)]],
        particles_0_5um_max: [currentLimits?.particles_0_5um_max ?? 10200, [Validators.required, Validators.min(0)]],
        particles_0_5um_lcl_ewi: [particles05Ewi.lcl, [Validators.required, Validators.min(0)]],
        particles_0_5um_ucl_ewi: [particles05Ewi.ucl, [Validators.required, Validators.min(0)]],
        particles_5um_min: [currentLimits?.particles_5um_min ?? 0, [Validators.required, Validators.min(0)]],
        particles_5um_max: [currentLimits?.particles_5um_max ?? 2930, [Validators.required, Validators.min(0)]],
        particles_5um_lcl_ewi: [particles5Ewi.lcl, [Validators.required, Validators.min(0)]],
        particles_5um_ucl_ewi: [particles5Ewi.ucl, [Validators.required, Validators.min(0)]],
      });
      this.form.addValidators(this.ewiRangeValidator());
      return;
    }

    switch (measurementType) {
      case 'temperature_humidity': {
        const tempEwi = this.resolveEwiPair(
          currentLimits?.temperatureMin ?? 15,
          currentLimits?.temperatureMax ?? 30,
          currentLimits?.temperatureLclEwi,
          currentLimits?.temperatureUclEwi
        );
        const humEwi = this.resolveEwiPair(
          currentLimits?.humidityMin ?? 30,
          currentLimits?.humidityMax ?? 70,
          currentLimits?.humidityLclEwi,
          currentLimits?.humidityUclEwi
        );
        this.form = this.fb.group({
          temperatureMin: [currentLimits?.temperatureMin ?? 15, [Validators.required, Validators.min(-50), Validators.max(100)]],
          temperatureMax: [currentLimits?.temperatureMax ?? 30, [Validators.required, Validators.min(-50), Validators.max(100)]],
          temperatureLclEwi: [tempEwi.lcl, [Validators.required, Validators.min(-50), Validators.max(100)]],
          temperatureUclEwi: [tempEwi.ucl, [Validators.required, Validators.min(-50), Validators.max(100)]],
          humidityMin: [currentLimits?.humidityMin ?? 30, [Validators.required, Validators.min(0), Validators.max(100)]],
          humidityMax: [currentLimits?.humidityMax ?? 70, [Validators.required, Validators.min(0), Validators.max(100)]],
          humidityLclEwi: [humEwi.lcl, [Validators.required, Validators.min(0), Validators.max(100)]],
          humidityUclEwi: [humEwi.ucl, [Validators.required, Validators.min(0), Validators.max(100)]],
        });
        break;
      }
      case 'luminosity': {
        const luminosityEwi = this.resolveEwiPair(
          currentLimits?.min ?? 500,
          currentLimits?.max ?? 1000,
          currentLimits?.lclEwi,
          currentLimits?.uclEwi
        );
        this.form = this.fb.group({
          min: [currentLimits?.min ?? 500, [Validators.required, Validators.min(0)]],
          max: [currentLimits?.max ?? 1000, [Validators.required, Validators.min(0)]],
          lclEwi: [luminosityEwi.lcl, [Validators.required, Validators.min(0)]],
          uclEwi: [luminosityEwi.ucl, [Validators.required, Validators.min(0)]],
        });
        break;
      }
      case 'torque': {
        const torqueEwi = this.resolveEwiPair(
          currentLimits?.min ?? 4,
          currentLimits?.max ?? 6,
          currentLimits?.lclEwi,
          currentLimits?.uclEwi
        );
        this.form = this.fb.group({
          min: [currentLimits?.min ?? 4.0, [Validators.required, Validators.min(0)]],
          max: [currentLimits?.max ?? 6.0, [Validators.required, Validators.min(0)]],
          lclEwi: [torqueEwi.lcl, [Validators.required, Validators.min(0)]],
          uclEwi: [torqueEwi.ucl, [Validators.required, Validators.min(0)]],
        });
        break;
      }
      case 'surface_resistance': {
        const surfaceResistanceEwi = this.resolveEwiPair(
          currentLimits?.min ?? 1e6,
          currentLimits?.max ?? 1e9,
          currentLimits?.lclEwi,
          currentLimits?.uclEwi
        );
        this.form = this.fb.group({
          min: [currentLimits?.min ?? 1e6, [Validators.required, Validators.min(0)]],
          max: [currentLimits?.max ?? 1e9, [Validators.required, Validators.min(0)]],
          lclEwi: [surfaceResistanceEwi.lcl, [Validators.required, Validators.min(0)]],
          uclEwi: [surfaceResistanceEwi.ucl, [Validators.required, Validators.min(0)]],
        });
        break;
      }
      case 'grounding_resistance': {
        const groundingResistanceEwi = this.resolveEwiPair(
          currentLimits?.min ?? 0,
          currentLimits?.max ?? 1,
          currentLimits?.lclEwi,
          currentLimits?.uclEwi
        );
        this.form = this.fb.group({
          min: [currentLimits?.min ?? 0, [Validators.required, Validators.min(0)]],
          max: [currentLimits?.max ?? 1.0, [Validators.required, Validators.min(0)]],
          lclEwi: [groundingResistanceEwi.lcl, [Validators.required, Validators.min(0)]],
          uclEwi: [groundingResistanceEwi.ucl, [Validators.required, Validators.min(0)]],
        });
        break;
      }
      case 'ionizer': {
        const decayEwi = this.resolveEwiPair(
          0,
          currentLimits?.decayTime ?? 5,
          currentLimits?.decayTimeLclEwi,
          currentLimits?.decayTimeUclEwi
        );
        const balanceAbs = Math.abs(currentLimits?.balance ?? 35);
        const balanceEwi = this.resolveEwiPair(
          -balanceAbs,
          balanceAbs,
          currentLimits?.balanceLclEwi,
          currentLimits?.balanceUclEwi
        );
        this.form = this.fb.group({
          decayTime: [currentLimits?.decayTime ?? 5.0, [Validators.required, Validators.min(0)]],
          balance: [currentLimits?.balance ?? 35, [Validators.required, Validators.min(0)]],
          decayTimeLclEwi: [decayEwi.lcl, [Validators.required, Validators.min(0)]],
          decayTimeUclEwi: [decayEwi.ucl, [Validators.required, Validators.min(0)]],
          balanceLclEwi: [balanceEwi.lcl, [Validators.required]],
          balanceUclEwi: [balanceEwi.ucl, [Validators.required]],
        });
        break;
      }
      default: {
        const defaultEwi = this.resolveEwiPair(
          currentLimits?.min ?? 0,
          currentLimits?.max ?? 100,
          currentLimits?.lclEwi,
          currentLimits?.uclEwi
        );
        this.form = this.fb.group({
          min: [currentLimits?.min ?? 0, [Validators.required, Validators.min(0)]],
          max: [currentLimits?.max ?? 100, [Validators.required, Validators.min(0)]],
          lclEwi: [defaultEwi.lcl, [Validators.required, Validators.min(0)]],
          uclEwi: [defaultEwi.ucl, [Validators.required, Validators.min(0)]],
        });
        break;
      }
    }

    this.form.addValidators(this.ewiRangeValidator());
  }

  async onSubmit() {
    if (this.form.valid) {
      await this.limitsService.updateLimits(this.measurementType(), this.form.value);
      this.dialogClosed.emit();
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogClosed.emit();
  }

  isDustinessType(type: string): boolean {
    return isDustinessMeasurementType(type);
  }

  private ewiRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormGroup)) {
        return null;
      }

      const errors: ValidationErrors = {};
      const addRangeError = (minKey: string, maxKey: string, lclKey: string, uclKey: string, errorKey: string) => {
        const min = this.toNumber(control.get(minKey)?.value);
        const max = this.toNumber(control.get(maxKey)?.value);
        const lcl = this.toNumber(control.get(lclKey)?.value);
        const ucl = this.toNumber(control.get(uclKey)?.value);

        if ([min, max, lcl, ucl].some(v => v === null)) {
          return;
        }

        if (lcl! < min! || lcl! > max! || ucl! < min! || ucl! > max! || lcl! >= ucl!) {
          errors[errorKey] = true;
        }
      };

      const type = this.measurementType();
      if (type === 'temperature_humidity') {
        addRangeError('temperatureMin', 'temperatureMax', 'temperatureLclEwi', 'temperatureUclEwi', 'temperatureEwiInvalid');
        addRangeError('humidityMin', 'humidityMax', 'humidityLclEwi', 'humidityUclEwi', 'humidityEwiInvalid');
      }

      if (isDustinessMeasurementType(type)) {
        addRangeError('particles_0_5um_min', 'particles_0_5um_max', 'particles_0_5um_lcl_ewi', 'particles_0_5um_ucl_ewi', 'particles05EwiInvalid');
        addRangeError('particles_5um_min', 'particles_5um_max', 'particles_5um_lcl_ewi', 'particles_5um_ucl_ewi', 'particles5EwiInvalid');
      }

      if (type === 'luminosity' || type === 'torque' || type === 'surface_resistance' || type === 'grounding_resistance') {
        addRangeError('min', 'max', 'lclEwi', 'uclEwi', 'genericEwiInvalid');
      }

      if (type === 'ionizer') {
        const balanceLimit = this.toNumber(control.get('balance')?.value);
        const balanceLcl = this.toNumber(control.get('balanceLclEwi')?.value);
        const balanceUcl = this.toNumber(control.get('balanceUclEwi')?.value);
        if (balanceLimit !== null && balanceLcl !== null && balanceUcl !== null) {
          const minBalance = -Math.abs(balanceLimit);
          const maxBalance = Math.abs(balanceLimit);
          if (balanceLcl < minBalance || balanceLcl > maxBalance || balanceUcl < minBalance || balanceUcl > maxBalance || balanceLcl >= balanceUcl) {
            errors.balanceEwiInvalid = true;
          }
        }

        const decayLimit = this.toNumber(control.get('decayTime')?.value);
        const decayLcl = this.toNumber(control.get('decayTimeLclEwi')?.value);
        const decayUcl = this.toNumber(control.get('decayTimeUclEwi')?.value);
        if (decayLimit !== null && decayLcl !== null && decayUcl !== null) {
          if (decayLcl < 0 || decayLcl > decayLimit || decayUcl < 0 || decayUcl > decayLimit || decayLcl >= decayUcl) {
            errors.decayEwiInvalid = true;
          }
        }
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  private toNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private resolveEwiPair(min: number, max: number, explicitLcl?: number, explicitUcl?: number): { lcl: number; ucl: number } {
    if (Number.isFinite(explicitLcl) && Number.isFinite(explicitUcl)) {
      return { lcl: explicitLcl as number, ucl: explicitUcl as number };
    }

    const span = max - min;
    const warningOffset = span > 0 ? span * 0.2 : 0;
    return {
      lcl: min + warningOffset,
      ucl: max - warningOffset,
    };
  }
}
