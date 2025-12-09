import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientsService } from '../../../core/services/patients.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Patient, CreatePatientDto, UpdatePatientDto } from '../../../core/models';
import { IconComponent } from '../../../shared/ui/icon.component';
import { SaveLoadingDirective } from '../../../shared/ui/save-loading.directive';
import { TableComponent, TableColumn } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, SaveLoadingDirective, TableComponent],
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

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="fs-label">Buscar por nome ou e-mail</label>
            <input [(ngModel)]="searchText" placeholder="Nome, email..." class="fs-input" />
          </div>
          <div class="flex items-end gap-2">
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
      </div>

      <!-- Tabela -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <app-table
          [data]="getTableData()"
          [columns]="tableColumns()"
          [isLoading]="isLoading()"
          (action)="handleTableAction($event)"
        ></app-table>
      </div>

      <!-- Dialog -->
      @if (displayDialog()) {
        <div class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10 mb-10 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-900">
                {{ editingPatient ? 'Editar Paciente' : 'Novo Paciente' }}
              </h3>
              <button
                type="button"
                class="text-gray-500 hover:text-gray-700"
                (click)="displayDialog.set(false)"
              >
                <app-icon [name]="'x'"></app-icon>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="fs-label">Nome Completo</label>
                <input [(ngModel)]="formData.fullName" class="fs-input" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="fs-label">Data de Nascimento</label>
                  <input type="date" [(ngModel)]="formData.dateOfBirth" class="fs-input" />
                </div>
                <div>
                  <label class="fs-label">CPF/Documento</label>
                  <input
                    [(ngModel)]="formData.documentId"
                    (input)="onDocumentIdChange($event)"
                    class="fs-input"
                    placeholder="xxx.xxx.xxx-xx"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="fs-label">Telefone</label>
                  <input [(ngModel)]="formData.phone" class="fs-input" />
                </div>
                <div>
                  <label class="fs-label">E-mail</label>
                  <input type="email" [(ngModel)]="formData.email" class="fs-input" />
                </div>
              </div>
              <div>
                <label class="fs-label">Endereço</label>
                <input [(ngModel)]="formData.address" class="fs-input" />
              </div>
              <div>
                <label class="fs-label">Observações</label>
                <textarea [(ngModel)]="formData.notes" class="fs-textarea" rows="5"></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button type="button" class="fs-button-secondary" (click)="displayDialog.set(false)">
                Cancelar
              </button>
              <button
                type="button"
                class="fs-button-primary"
                (click)="savePatient()"
                [appSaveLoading]="isSaving()"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
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

  formData: Partial<CreatePatientDto & { dateOfBirth: Date | string | undefined }> = {
    fullName: '',
    dateOfBirth: '',
    documentId: undefined,
    phone: '',
    email: '',
    address: '',
    notes: '',
  };

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

  onDocumentIdChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Remove non-numeric characters
    const cleanValue = value.replace(/\D/g, '');

    // Format as CPF (11 digits) or CNPJ (14 digits)
    let formatted = cleanValue;
    if (cleanValue.length === 11) {
      // CPF: XXX.XXX.XXX-XX
      formatted = cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleanValue.length === 14) {
      // CNPJ: XX.XXX.XXX/XXXX-XX
      formatted = cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    // Update the form data with the formatted value
    this.formData.documentId = formatted || value;
  }

  openDialog(): void {
    this.resetForm();
    this.editingPatient = null;
    this.displayDialog.set(true);
  }

  editPatient(patient: Patient): void {
    this.editingPatient = patient;
    this.formData = {
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      documentId: patient.documentId || undefined,
      phone: patient.phone,
      email: patient.email,
      address: patient.address || undefined,
      notes: patient.notes || undefined,
    };
    this.displayDialog.set(true);
  }

  savePatient(): void {
    if (!this.formData.fullName || !this.formData.email) {
      return;
    }

    this.isSaving.set(true);

    if (this.editingPatient) {
      // Update
      this.patientsService
        .update(this.editingPatient.id, this.formData as UpdatePatientDto)
        .subscribe({
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
      this.patientsService.create(this.formData as CreatePatientDto).subscribe({
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

  private resetForm(): void {
    this.formData = {
      fullName: '',
      dateOfBirth: '',
      documentId: undefined,
      phone: '',
      email: '',
      address: '',
      notes: '',
    };
  }
}
