import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SpecificationsService } from '../../services/specifications.service';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SpecificationType } from '../../models';

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
  measurementTypes = this.specificationsService.specificationTypes;

  selectedType = signal<SpecificationType | null>(null);
  showEditModal = signal(false);
  showCreateModal = signal(false);
  createError = signal<string | null>(null);
  editForm!: FormGroup;

  createForm = this.fb.group({
    measurementType: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_\s-]+$/)]],
    displayName: ['', [Validators.required]],
  });

  currentSpecification = computed(() => {
    const type = this.selectedType();
    if (!type) return null;
    return this.specificationsService.getSpecificationForType(type);
  });

  openEditModal(type: SpecificationType) {
    this.selectedType.set(type);
    const spec = this.specificationsService.getSpecificationForType(type);
    
    this.editForm = this.fb.group({
      isoStandard: [spec?.isoStandard || '', Validators.required],
      standardTitle: [spec?.standardTitle || '', Validators.required],
      description: [spec?.description || '', Validators.required],
      requirements: [spec?.requirements || '', Validators.required],
      displayName: [spec?.displayName || ''],
      testingProcedure: [spec?.testingProcedure || ''],
      referenceDocument: [spec?.referenceDocument || ''],
    });
    
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedType.set(null);
  }

  async onSubmit() {
    if (this.editForm.valid && this.selectedType()) {
      const formValue = this.editForm.value;
      await this.specificationsService.updateSpecification(this.selectedType()!, {
        measurementType: this.selectedType()!,
        ...formValue,
      });
      this.closeEditModal();
    }
  }

  openCreateModal(): void {
    this.createForm.reset({ measurementType: '', displayName: '' });
    this.createError.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.createError.set(null);
  }

  async onCreateTypeSubmit(): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const measurementType = this.createForm.controls.measurementType.value || '';
    const displayName = this.createForm.controls.displayName.value || '';

    try {
      const newType = await this.specificationsService.createSpecificationType(measurementType, displayName);
      this.closeCreateModal();
      this.openEditModal(newType);
    } catch (error) {
      const errorKey = error instanceof Error ? error.message : 'specifications.createTypeFailed';
      this.createError.set(this.translationService.translate(errorKey));
    }
  }

  getMeasurementTypeName(type: SpecificationType): string {
    const translationKey = `measurementNames.${type}`;
    const translatedName = this.translationService.translate(translationKey);
    if (translatedName !== translationKey) {
      return translatedName;
    }

    const specification = this.specificationsService.getSpecificationForType(type);
    if (specification?.displayName?.trim()) {
      return specification.displayName.trim();
    }

    return this.formatTypeName(type);
  }

  canEditSpecifications(): boolean {
    return this.authService.canEditSpecifications();
  }

  async deleteSpecification(type: SpecificationType) {
    if (confirm(this.translationService.translate('specifications.confirmDelete'))) {
      await this.specificationsService.deleteSpecification(type);
    }
  }

  private formatTypeName(type: string): string {
    return type
      .split('_')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
