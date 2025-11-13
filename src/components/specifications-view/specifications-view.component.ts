import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpecificationsService } from '../../services/specifications.service';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MeasurementType, MEASUREMENT_TYPES, ISOSpecification } from '../../models';

@Component({
  selector: 'app-specifications-view',
  templateUrl: './specifications-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
})
export class SpecificationsViewComponent {
  private specificationsService = inject(SpecificationsService);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  specifications = this.specificationsService.specifications;
  measurementTypes = MEASUREMENT_TYPES;

  selectedType = signal<MeasurementType | null>(null);
  showEditModal = signal(false);
  editForm!: FormGroup;

  currentSpecification = computed(() => {
    const type = this.selectedType();
    if (!type) return null;
    return this.specificationsService.getSpecificationForType(type);
  });

  openEditModal(type: MeasurementType) {
    this.selectedType.set(type);
    const spec = this.specificationsService.getSpecificationForType(type);
    
    this.editForm = this.fb.group({
      isoStandard: [spec?.isoStandard || '', Validators.required],
      standardTitle: [spec?.standardTitle || '', Validators.required],
      description: [spec?.description || '', Validators.required],
      requirements: [spec?.requirements || '', Validators.required],
      testingProcedure: [spec?.testingProcedure || ''],
      referenceDocument: [spec?.referenceDocument || ''],
    });
    
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedType.set(null);
  }

  onSubmit() {
    if (this.editForm.valid && this.selectedType()) {
      const formValue = this.editForm.value;
      this.specificationsService.updateSpecification(this.selectedType()!, {
        measurementType: this.selectedType()!,
        ...formValue,
      });
      this.closeEditModal();
    }
  }

  getMeasurementTypeName(type: MeasurementType): string {
    return this.translationService.translate(`measurementNames.${type}`);
  }

  canEditSpecifications(): boolean {
    return this.authService.canEditSpecifications();
  }

  deleteSpecification(type: MeasurementType) {
    if (confirm(this.translationService.translate('specifications.confirmDelete'))) {
      this.specificationsService.deleteSpecification(type);
    }
  }
}
