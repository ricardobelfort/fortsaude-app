import { Component, ChangeDetectionStrategy, inject, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { PrescriptionsService, CurrentUserService } from '@core/services';
import { Prescription, CreatePrescriptionDto } from '@core/models';
import { AlertService } from '@shared/ui/alert.service';
import { IconComponent } from '@shared/ui/icon.component';
import { SpinnerComponent } from '@shared/ui/spinner.component';
import { ModalComponent } from '@shared/ui/modal/modal.component';

@Component({
  selector: 'app-prescriptions-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, SpinnerComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <app-spinner [size]="16"></app-spinner>
            <p class="mt-4 text-gray-600">Carregando prescrições...</p>
          </div>
        </div>
      } @else {
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Prescrições</h2>
          @if (currentUserService.canCreatePrescriptions()) {
            <button
              type="button"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
              (click)="openDialog()"
            >
              <app-icon [name]="'plus'"></app-icon>
              Nova Prescrição
            </button>
          }
        </div>

        @if (prescriptions().length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            @for (prescription of prescriptions(); track prescription.id) {
              <div
                class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
              >
                <!-- Header -->
                <div
                  class="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-100 flex justify-between items-start"
                >
                  <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Prescrição de</p>
                    <p class="text-lg font-bold text-gray-900">
                      {{ prescription.professional.profile.account.person.fullName }}
                    </p>
                    <p class="text-xs text-gray-500 mt-2">
                      {{ prescription.createdAt | date: 'dd/MM/yyyy' }} •
                      {{ prescription.createdAt | date: 'HH:mm' }}
                    </p>
                  </div>
                  @if (currentUserService.canEditPrescriptions()) {
                    <div class="flex gap-1">
                      <button
                        type="button"
                        class="btn btn-sm btn-ghost text-emerald-600 hover:bg-emerald-100"
                        (click)="editPrescription(prescription)"
                        title="Editar prescrição"
                      >
                        <app-icon [name]="'edit'" [size]="18"></app-icon>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-ghost text-red-500 hover:bg-red-100"
                        (click)="deletePrescription(prescription.id)"
                        title="Deletar prescrição"
                      >
                        <app-icon [name]="'delete'" [size]="18"></app-icon>
                      </button>
                    </div>
                  }
                </div>

                <!-- Content -->
                <div class="px-6 py-4 space-y-4">
                  <!-- Medicamentos -->
                  @if (prescription.medications.length > 0) {
                    <div>
                      <p class="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
                        Medicamentos
                      </p>
                      <div class="space-y-2">
                        @for (med of prescription.medications; track med.name) {
                          <div
                            class="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-3"
                          >
                            <p class="font-semibold text-gray-900 text-sm">{{ med.name }}</p>
                            <div class="flex flex-wrap gap-2 mt-2">
                              <span class="badge badge-sm bg-blue-100 text-blue-700">{{
                                med.dosage
                              }}</span>
                              <span class="badge badge-sm bg-cyan-100 text-cyan-700">{{
                                med.frequency
                              }}</span>
                              <span class="badge badge-sm bg-teal-100 text-teal-700">{{
                                med.duration
                              }}</span>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Instruções -->
                  @if (prescription.instructions) {
                    <div>
                      <p class="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                        Instruções
                      </p>
                      <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p class="text-sm text-gray-700">{{ prescription.instructions }}</p>
                      </div>
                    </div>
                  }

                  <!-- Validade -->
                  @if (prescription.validUntil) {
                    <div
                      class="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <app-icon
                        [name]="'calendar'"
                        [size]="16"
                        [className]="'text-orange-600'"
                      ></app-icon>
                      <span class="text-sm font-medium text-gray-700">
                        Válida até
                        <strong class="text-orange-600">{{
                          prescription.validUntil | date: 'dd/MM/yyyy'
                        }}</strong>
                      </span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <div
            class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 text-center border border-gray-200"
          >
            <app-icon
              [name]="'receipt'"
              [size]="48"
              [className]="'text-gray-300 mx-auto mb-4'"
            ></app-icon>
            <p class="text-gray-600 font-medium mb-2">Nenhuma prescrição registrada</p>
            <p class="text-gray-500 text-sm">As prescrições aparecerão aqui quando forem criadas</p>
          </div>
        }
      }

      <!-- Form Dialog -->
      @if (showDialog()) {
        <app-modal
          [title]="isEditing() ? 'Editar Prescrição' : 'Nova Prescrição'"
          [submitButtonText]="isEditing() ? 'Atualizar' : 'Criar'"
          [cancelButtonText]="'Cancelar'"
          [loadingText]="'Salvando...'"
          [isLoading]="isSaving()"
          [isFormValid]="form.valid"
          formId="prescriptionForm"
          (cancelled)="closeDialog()"
          (submitted)="savePrescription()"
        >
          <div modal-content>
            <form [formGroup]="form" id="prescriptionForm" class="space-y-6">
              <!-- Instruções -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Instruções</span>
                  </div>
                  <textarea
                    formControlName="instructions"
                    placeholder="Instruções especiais para o paciente"
                    rows="3"
                    class="textarea textarea-bordered w-full"
                  ></textarea>
                </label>
              </div>

              <!-- Data de Validade -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Válida até</span>
                  </div>
                  <input
                    type="date"
                    formControlName="validUntil"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Medicamentos -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="font-semibold text-gray-900">Medicamentos</label>
                  <button type="button" class="btn btn-sm btn-outline" (click)="addMedication()">
                    <app-icon [name]="'plus'"></app-icon>
                    Adicionar
                  </button>
                </div>

                <div class="space-y-4">
                  @for (med of medications.controls; let i = $index; track i) {
                    <div
                      class="border border-gray-200 rounded-lg p-4 space-y-3"
                      [formGroupName]="i.toString()"
                    >
                      <div class="flex justify-between items-center mb-2">
                        <p class="font-semibold text-gray-700">Medicamento {{ i + 1 }}</p>
                        <button
                          type="button"
                          class="btn btn-sm btn-ghost text-red-600"
                          (click)="removeMedication(i)"
                        >
                          <app-icon [name]="'trash'"></app-icon>
                        </button>
                      </div>

                      <div class="grid grid-cols-2 gap-3">
                        <label class="form-control w-full">
                          <div class="label">
                            <span class="label-text text-sm">Nome</span>
                          </div>
                          <input
                            type="text"
                            formControlName="name"
                            placeholder="Ex: Dipirona"
                            class="input input-bordered input-sm w-full"
                          />
                        </label>

                        <label class="form-control w-full">
                          <div class="label">
                            <span class="label-text text-sm">Dosagem</span>
                          </div>
                          <input
                            type="text"
                            formControlName="dosage"
                            placeholder="Ex: 500mg"
                            class="input input-bordered input-sm w-full"
                          />
                        </label>

                        <label class="form-control w-full">
                          <div class="label">
                            <span class="label-text text-sm">Frequência</span>
                          </div>
                          <input
                            type="text"
                            formControlName="frequency"
                            placeholder="Ex: 2x ao dia"
                            class="input input-bordered input-sm w-full"
                          />
                        </label>

                        <label class="form-control w-full">
                          <div class="label">
                            <span class="label-text text-sm">Duração</span>
                          </div>
                          <input
                            type="text"
                            formControlName="duration"
                            placeholder="Ex: 7 dias"
                            class="input input-bordered input-sm w-full"
                          />
                        </label>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </form>
          </div>
        </app-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionsListComponent {
  private readonly prescriptionsService = inject(PrescriptionsService);
  private readonly alertService = inject(AlertService);
  readonly currentUserService = inject(CurrentUserService);
  private readonly fb = inject(FormBuilder);

  readonly patientId = input.required<string>();

  prescriptions = signal<Prescription[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  showDialog = signal(false);
  isEditing = signal(false);
  editingId = signal<string | null>(null);

  form = this.createNewForm();

  get medications(): FormArray {
    return this.form.get('medications') as FormArray;
  }

  constructor() {
    effect(() => {
      // Re-load prescriptions whenever patientId changes
      this.patientId();
      this.loadPrescriptions();
    });
  }

  private createNewForm() {
    return this.fb.group({
      instructions: ['', Validators.required],
      validUntil: ['', Validators.required],
      medications: this.fb.array([this.createMedicationGroup()]),
    });
  }

  private createMedicationGroup() {
    return this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      duration: ['', Validators.required],
    });
  }

  private loadPrescriptions(): void {
    this.isLoading.set(true);

    // Mock data for testing while API is down
    const mockPrescriptions = [
      {
        id: '1',
        clinic: {
          id: 'clinic-1',
          name: 'Clínica Forte Saúde',
          legalName: 'Forte Saúde LTDA',
          email: 'contato@fortesaude.com',
          phone: '11999999999',
          cnpj: '12.345.678/0001-90',
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        appointment: {
          id: 'apt-1',
          startsAt: '2024-12-19T10:00:00Z',
          endsAt: '2024-12-19T10:30:00Z',
        },
        patient: {
          id: 'pat-1',
          fullName: 'João Silva',
          active: true,
          documentId: '123',
          dateOfBirth: '1990-01-01',
          email: 'joao@example.com',
        },
        professional: {
          id: 'prof-1',
          profile: {
            account: {
              person: {
                fullName: 'Dr. João Silva',
              },
            },
          },
        },
        medications: [
          {
            name: 'Dipirona',
            dosage: '500mg',
            frequency: '2x ao dia',
            duration: '7 dias',
          },
        ],
        instructions: 'Tomar com alimentos',
        validUntil: '2025-12-31',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        clinic: {
          id: 'clinic-1',
          name: 'Clínica Forte Saúde',
          legalName: 'Forte Saúde LTDA',
          email: 'contato@fortesaude.com',
          phone: '11999999999',
          cnpj: '12.345.678/0001-90',
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        appointment: {
          id: 'apt-2',
          startsAt: '2024-12-18T14:00:00Z',
          endsAt: '2024-12-18T14:30:00Z',
        },
        patient: {
          id: 'pat-1',
          fullName: 'João Silva',
          active: true,
          documentId: '123',
          dateOfBirth: '1990-01-01',
          email: 'joao@example.com',
        },
        professional: {
          id: 'prof-2',
          profile: {
            account: {
              person: {
                fullName: 'Dra. Maria Santos',
              },
            },
          },
        },
        medications: [
          {
            name: 'Ibuprofeno',
            dosage: '400mg',
            frequency: '3x ao dia',
            duration: '5 dias',
          },
          {
            name: 'Amoxicilina',
            dosage: '500mg',
            frequency: '2x ao dia',
            duration: '7 dias',
          },
        ],
        instructions: 'Não tomar com leite',
        validUntil: '2025-12-25',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ] as Prescription[];

    // Simulate API delay
    setTimeout(() => {
      this.prescriptions.set(mockPrescriptions);
      this.isLoading.set(false);
    }, 500);
  }

  openDialog(): void {
    // Create a brand new form
    this.form = this.createNewForm();
    this.isEditing.set(false);
    this.editingId.set(null);
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
  }

  editPrescription(prescription: Prescription): void {
    // Create a completely new form
    this.form = this.createNewForm();

    this.isEditing.set(true);
    this.editingId.set(prescription.id);

    // Update form values
    const validUntilDate = prescription.validUntil.includes('T')
      ? prescription.validUntil.split('T')[0]
      : prescription.validUntil;

    this.form.patchValue({
      instructions: prescription.instructions,
      validUntil: validUntilDate,
    });

    // Clear and rebuild medications array
    const medicationsArray = this.form.get('medications') as FormArray;
    medicationsArray.clear();

    prescription.medications.forEach((med) => {
      medicationsArray.push(
        this.fb.group({
          name: [med.name, Validators.required],
          dosage: [med.dosage, Validators.required],
          frequency: [med.frequency, Validators.required],
          duration: [med.duration, Validators.required],
        })
      );
    });

    this.showDialog.set(true);
  }

  addMedication(): void {
    this.medications.push(this.createMedicationGroup());
  }

  removeMedication(index: number): void {
    this.medications.removeAt(index);
  }

  savePrescription(): void {
    if (!this.form.valid) return;

    this.isSaving.set(true);
    const formValue = this.form.value;
    const clinicId = this.currentUserService.getClinicId();

    if (!clinicId) {
      this.alertService.error('Clínica não identificada');
      this.isSaving.set(false);
      return;
    }

    const dto: CreatePrescriptionDto = {
      clinicId,
      appointmentId: '', // Pode ser vazio se não vinculado
      patientId: this.patientId(),
      professionalId: this.currentUserService.getUserId() || '',
      medications: (formValue.medications || []).map((med: Record<string, unknown>) => ({
        name: (med['name'] as string | null) || '',
        dosage: (med['dosage'] as string | null) || '',
        frequency: (med['frequency'] as string | null) || '',
        duration: (med['duration'] as string | null) || '',
      })),
      instructions: formValue.instructions || '',
      validUntil: formValue.validUntil || '',
    };

    if (this.isEditing() && this.editingId()) {
      this.prescriptionsService
        .update(this.editingId()!, {
          medications: dto.medications,
          instructions: dto.instructions,
          validUntil: dto.validUntil,
        })
        .subscribe({
          next: () => {
            this.alertService.success('Prescrição atualizada com sucesso');
            this.closeDialog();
            this.loadPrescriptions();
            this.isSaving.set(false);
          },
          error: () => {
            this.alertService.error('Erro ao atualizar prescrição');
            this.isSaving.set(false);
          },
        });
    } else {
      this.prescriptionsService.create(dto).subscribe({
        next: () => {
          this.alertService.success('Prescrição criada com sucesso');
          this.closeDialog();
          this.loadPrescriptions();
          this.isSaving.set(false);
        },
        error: () => {
          this.alertService.error('Erro ao criar prescrição');
          this.isSaving.set(false);
        },
      });
    }
  }

  deletePrescription(id: string): void {
    if (!confirm('Deseja deletar esta prescrição?')) return;

    this.prescriptionsService.delete(id).subscribe({
      next: () => {
        this.alertService.success('Prescrição deletada com sucesso');
        this.loadPrescriptions();
      },
      error: () => {
        this.alertService.error('Erro ao deletar prescrição');
      },
    });
  }
}
