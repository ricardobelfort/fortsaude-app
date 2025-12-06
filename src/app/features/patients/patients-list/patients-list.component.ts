import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PatientsService } from '../../../core/services/patients.service';
import { Patient, CreatePatientDto, UpdatePatientDto } from '../../../core/models';
import { AlertService } from '../../../shared/ui/alert.service';
import { IconComponent } from '../../../shared/ui/icon.component';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Pacientes</h1>
          <p class="text-gray-600">Gestão completa dos pacientes da clínica</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          (click)="openDialog()"
        >
          <app-icon name="user-plus"></app-icon>
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
              <app-icon name="search"></app-icon>
              Buscar
            </button>
            <button type="button" class="fs-button-secondary" (click)="clearFilters()">
              <app-icon name="rotate-ccw"></app-icon>
              Limpar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <table class="min-w-[50rem] w-full text-left">
          <thead>
            <tr class="border-b">
              <th class="px-4 py-3 text-sm font-semibold text-gray-700">Nome</th>
              <th class="px-4 py-3 text-sm font-semibold text-gray-700">Idade</th>
              <th class="px-4 py-3 text-sm font-semibold text-gray-700">Telefone</th>
              <th class="px-4 py-3 text-sm font-semibold text-gray-700">E-mail</th>
              <th class="px-4 py-3 text-sm font-semibold text-gray-700">Data de Cadastro</th>
              <th class="px-4 py-3 text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            @if (patients().length === 0) {
              <tr>
                <td colspan="6" class="text-center py-4 text-gray-500">
                  Nenhum paciente encontrado
                </td>
              </tr>
            } @else {
              @for (patient of patients(); track patient.id) {
                <tr class="border-b last:border-0">
                  <td class="px-4 py-3 font-medium">{{ patient.fullName }}</td>
                  <td class="px-4 py-3">{{ calculateAge(patient.dateOfBirth) }} anos</td>
                  <td class="px-4 py-3">{{ patient.phone }}</td>
                  <td class="px-4 py-3">{{ patient.email }}</td>
                  <td class="px-4 py-3">{{ patient.createdAt | date: 'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <a
                        [routerLink]="['/app/patients', patient.id]"
                        class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <app-icon name="eye"></app-icon>
                        Ver
                      </a>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        (click)="editPatient(patient)"
                      >
                        <app-icon name="edit-3"></app-icon>
                        Editar
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                        (click)="deletePatient(patient.id)"
                      >
                        <app-icon name="trash-2"></app-icon>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
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
              <app-icon name="x"></app-icon>
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
                <input [(ngModel)]="formData.document" class="fs-input" />
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
              <textarea [(ngModel)]="formData.observations" class="fs-textarea" rows="3"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button type="button" class="fs-button-secondary" (click)="displayDialog.set(false)">
              <app-icon name="x-circle"></app-icon>
              Cancelar
            </button>
            <button type="button" class="fs-button-primary" (click)="savePatient()">
              <app-icon name="check-circle"></app-icon>
              Salvar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientsListComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly alertService = inject(AlertService);

  patients = signal<Patient[]>([]);
  displayDialog = signal(false);
  searchText = '';
  editingPatient: Patient | null = null;

  formData: Partial<CreatePatientDto> = {
    fullName: '',
    dateOfBirth: new Date(),
    document: '',
    phone: '',
    email: '',
    address: '',
    observations: '',
  };

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    const params: Record<string, string> = {};
    if (this.searchText) {
      params['search'] = this.searchText;
    }

    this.patientsService.getAll(params).subscribe({
      next: (data) => {
        this.patients.set(data);
      },
      error: () => {
        this.alertService.error('Falha ao carregar pacientes');
      },
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.loadPatients();
  }

  openDialog(): void {
    this.resetForm();
    this.editingPatient = null;
    this.displayDialog.set(true);
  }

  editPatient(patient: Patient): void {
    this.editingPatient = { ...patient };
    this.formData = { ...patient };
    this.displayDialog.set(true);
  }

  savePatient(): void {
    if (!this.formData.fullName || !this.formData.email) {
      this.alertService.error('Preencha os campos obrigatórios');
      return;
    }

    if (this.editingPatient) {
      // Update
      this.patientsService
        .update(this.editingPatient.id, this.formData as UpdatePatientDto)
        .subscribe({
          next: () => {
            this.alertService.success('Paciente atualizado');
            this.displayDialog.set(false);
            this.loadPatients();
          },
          error: () => {
            this.alertService.error('Falha ao atualizar paciente');
          },
        });
    } else {
      // Create
      this.patientsService.create(this.formData as CreatePatientDto).subscribe({
        next: () => {
          this.alertService.success('Paciente criado');
          this.displayDialog.set(false);
          this.loadPatients();
        },
        error: () => {
          this.alertService.error('Falha ao criar paciente');
        },
      });
    }
  }

  async deletePatient(id: string): Promise<void> {
    const confirmed = await this.alertService.confirm({
      text: 'Tem certeza que deseja deletar este paciente?',
      confirmButtonText: 'Sim, deletar',
    });

    if (!confirmed) return;

    this.patientsService.delete(id).subscribe({
      next: () => {
        this.alertService.success('Paciente deletado');
        this.loadPatients();
      },
      error: () => {
        this.alertService.error('Falha ao deletar paciente');
      },
    });
  }

  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private resetForm(): void {
    this.formData = {
      fullName: '',
      dateOfBirth: new Date(),
      document: '',
      phone: '',
      email: '',
      address: '',
      observations: '',
    };
  }
}
