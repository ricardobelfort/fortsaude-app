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
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Pacientes</h1>
          <p class="text-gray-600">Gestão completa dos pacientes da clínica</p>
        </div>
        <button type="button" class="fs-button-primary" (click)="openDialog()">
          <app-icon [name]="'user-plus'"></app-icon>
          Novo Paciente
        </button>
      </div>

      <!-- Tabela -->
      <div class="bg-white rounded-lg shadow-md">
        <!-- Filtro dentro do card -->
        <div class="border-b border-slate-200 px-6 py-4">
          <div class="flex items-center justify-end gap-3">
            <div class="w-80">
              <input [(ngModel)]="searchText" placeholder="Nome, email..." class="fs-input" />
            </div>
            <button type="button" class="fs-button-primary" (click)="loadPatients()">
              <app-icon [name]="'search'"></app-icon>
              Buscar
            </button>
            <button type="button" class="fs-button-secondary" (click)="clearFilters()">
              <app-icon [name]="'filter-remove'"></app-icon>
              Limpar
            </button>
          </div>
        </div>

        <!-- Tabela -->
        <div class="px-6 py-4">
          <app-table
            [data]="getTableData()"
            [columns]="tableColumns()"
            [isLoading]="isLoading()"
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
          formId="patient-edit-form"
          (cancelled)="displayDialog.set(false)"
        >
          <div modal-content>
            <app-patient-form
              [patient]="editingPatient"
              [isSubmitting]="isSaving()"
              (submitted)="savePatient($event)"
              (cancelled)="displayDialog.set(false)"
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

  searchText = '';
  editingPatient: Patient | null = null;

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
    const params: Record<string, string> = {};
    if (this.searchText) {
      params['search'] = this.searchText;
    }

    this.patientsService.getAll(params).subscribe({
      next: (data) => {
        this.patients.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.searchText = '';
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

  getTableData(): Record<string, unknown>[] {
    return this.patients() as unknown as Record<string, unknown>[];
  }
}
