import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientsService } from '../../../core/services/patients.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Patient, CreatePatientDto, UpdatePatientDto } from '../../../core/models';
import { IconComponent } from '../../../shared/ui/icon.component';
import { TableComponent, TableColumn } from '../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { PatientFormComponent } from '../patient-form/patient-form.component';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    TableComponent,
    ModalComponent,
    PatientFormComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Pacientes</h1>
          <p class="text-sm sm:text-base text-gray-600">Gestão completa dos pacientes da clínica</p>
        </div>
        <button type="button" class="btn btn-neutral btn-sm sm:btn-md" (click)="openDialog()">
          <app-icon [name]="'user-plus'"></app-icon>
          <span class="hidden xs:inline">Novo Paciente</span>
          <span class="xs:hidden">Novo</span>
        </button>
      </div>

      <!-- Tabela/Cards Mobile -->
      <div class="card bg-white shadow-sm p-2 sm:p-4">
        <!-- Mobile: Cards Layout -->
        <div class="block sm:hidden space-y-3">
          @for (patient of tableData(); track patient['id']) {
            <div class="card bg-base-100 border border-base-300 p-3 space-y-3">
              <!-- Header: Nome e Data -->
              <div>
                <p class="text-sm font-semibold text-base-content">{{ patient['fullName'] }}</p>
                <p class="text-xs text-base-content/60">{{ formatDate(patient['createdAt']) }}</p>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p class="text-base-content/70 font-medium">Idade</p>
                  <p class="text-base-content font-semibold">
                    {{ calculateAge(patient['dateOfBirth']) }} anos
                  </p>
                </div>
                <div>
                  <p class="text-base-content/70 font-medium">Telefone</p>
                  <p class="text-base-content font-semibold truncate">
                    {{ patient['phone'] || 'N/A' }}
                  </p>
                </div>
              </div>

              <!-- Email -->
              <div class="text-xs">
                <p class="text-base-content/70 font-medium">E-mail</p>
                <p class="text-base-content font-semibold truncate">{{ patient['email'] }}</p>
              </div>

              <!-- Actions -->
              <div class="flex gap-1.5 pt-2">
                <button
                  type="button"
                  class="btn flex-1"
                  (click)="handleTableAction({ action: 'view', row: patient })"
                >
                  <app-icon [name]="'eye'" [size]="16"></app-icon>
                  Ver
                </button>
                <button type="button" class="btn flex-1" (click)="openEditDialog(patient)">
                  <app-icon [name]="'edit'" [size]="16"></app-icon>
                  Editar
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Desktop: Table Layout -->
        <div class="hidden sm:block overflow-x-auto">
          <app-table
            [data]="tableData()"
            [columns]="tableColumns()"
            [showSearch]="true"
            [showExport]="true"
            [showDeleteAll]="true"
            [searchableFields]="['fullName', 'email']"
            [entityName]="'pacientes'"
            (export)="onExport($event)"
            (deleteAll)="onDeleteAll($event)"
            [isLoading]="isLoading()"
            emptyMessage="Nenhum paciente encontrado"
            (action)="handleTableAction($event)"
          ></app-table>
        </div>
      </div>

      <!-- Dialog -->
      @if (displayDialog()) {
        <app-modal
          [title]="editingPatient ? 'Editar Paciente' : 'Novo Paciente'"
          [submitButtonText]="editingPatient ? 'Atualizar Paciente' : 'Criar Paciente'"
          [isLoading]="isSaving()"
          [isFormValid]="isFormValid()"
          formId="patient-edit-form"
          (cancelled)="displayDialog.set(false)"
        >
          <div modal-content>
            <app-patient-form
              [patient]="editingPatient"
              [isSubmitting]="isSaving()"
              (submitted)="savePatient($event)"
              (cancelled)="displayDialog.set(false)"
              (formValidChange)="onFormValidChange($event)"
            ></app-patient-form>
          </div>
        </app-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientsListComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  readonly patients = signal<Patient[]>([]);
  readonly displayDialog = signal(false);
  readonly isSaving = signal(false);
  readonly isLoading = signal(false);
  readonly isFormValid = signal(false);

  editingPatient: Patient | null = null;
  readonly tableData = signal<Record<string, unknown>[]>([]);

  calculateAge(dateOfBirth: string | Date | unknown): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth as string | Date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatDate(date: unknown): string {
    if (!date) return 'N/A';
    const d = new Date(date as string | Date);
    return d.toLocaleDateString('pt-BR');
  }

  openEditDialog(patientData: Record<string, unknown>): void {
    const patient = patientData as unknown as Patient;
    this.editPatient(patient);
  }

  readonly tableColumns = () =>
    [
      { key: 'fullName', header: 'Nome', sortable: true },
      {
        key: 'dateOfBirth',
        header: 'Idade',
        sortable: true,
        format: (value: unknown) => {
          const date = value as string;
          const today = new Date();
          const birthDate = new Date(date);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return `${age} anos`;
        },
      },
      { key: 'phone', header: 'Telefone', sortable: true },
      { key: 'email', header: 'E-mail', sortable: true },
      {
        key: 'createdAt',
        header: 'Data de Cadastro',
        sortable: true,
        format: (value: unknown) => {
          const date = new Date(value as string);
          return date.toLocaleDateString('pt-BR');
        },
      },
    ] as TableColumn[];

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);

    this.patientsService.getAll({}).subscribe({
      next: (data) => {
        this.patients.set(data);
        this.tableData.set(data as unknown as Record<string, unknown>[]);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.loadPatients();
  }

  openDialog(): void {
    this.editingPatient = null;
    this.displayDialog.set(true);
  }

  editPatient(patient: Patient): void {
    this.editingPatient = patient;
    this.displayDialog.set(true);
  }

  savePatient(formData: CreatePatientDto | UpdatePatientDto): void {
    this.isSaving.set(true);

    if (this.editingPatient) {
      // Update
      this.patientsService.update(this.editingPatient.id, formData as UpdatePatientDto).subscribe({
        next: () => {
          this.displayDialog.set(false);
          this.isSaving.set(false);
          this.loadPatients();
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
    } else {
      // Create
      this.patientsService.create(formData as CreatePatientDto).subscribe({
        next: () => {
          this.displayDialog.set(false);
          this.isSaving.set(false);
          this.loadPatients();
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
    }
  }

  handleTableAction(event: {
    action: 'view' | 'edit' | 'delete';
    row: Record<string, unknown>;
  }): void {
    const patient = event.row as unknown as Patient;

    switch (event.action) {
      case 'view':
        this.router.navigate(['/app/patients', patient.id]);
        break;
      case 'edit':
        this.editPatient(patient);
        break;
      case 'delete':
        this.deletePatient(patient.id);
        break;
    }
  }

  deletePatient(id: string): void {
    this.errorHandler
      .showConfirmation(
        'Deletar Paciente',
        'Tem certeza que deseja deletar este paciente?',
        'Sim, deletar',
        'Cancelar'
      )
      .then((confirmed) => {
        if (!confirmed) return;

        this.patientsService.delete(id).subscribe({
          next: () => {
            this.loadPatients();
          },
        });
      });
  }

  onExport(exportEvent: { format: 'xlsx' | 'pdf'; data: Record<string, unknown>[] }): void {
    if (exportEvent.data.length === 0) {
      this.errorHandler.showInfo('Selecione pelo menos um paciente para exportar');
      return;
    }

    this.errorHandler.showSuccess(
      `${exportEvent.data.length} paciente(s) exportado(s) em ${exportEvent.format.toUpperCase()}`
    );
  }

  onFormValidChange(isValid: boolean): void {
    console.log('Form valid changed:', isValid);
    this.isFormValid.set(isValid);
  }

  async onDeleteAll(selectedRows: Set<unknown>): Promise<void> {
    if (selectedRows.size === 0) {
      this.errorHandler.showInfo('Selecione pelo menos um paciente');
      return;
    }

    const confirmed = await this.errorHandler.showConfirmation(
      'Deletar Pacientes',
      `Tem certeza que deseja deletar ${selectedRows.size} paciente(s)?`,
      'Sim, deletar',
      'Cancelar'
    );

    if (!confirmed) return;

    const selectedIds = Array.from(selectedRows) as string[];
    for (const id of selectedIds) {
      this.patientsService.delete(id).subscribe({
        next: () => {
          // Reload after each deletion
        },
      });
    }

    this.loadPatients();
  }
}
