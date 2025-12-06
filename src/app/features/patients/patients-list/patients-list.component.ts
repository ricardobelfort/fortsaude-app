import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PatientsService } from '../../../core/services/patients.service';
import { Patient, CreatePatientDto, UpdatePatientDto } from '../../../core/models';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Pacientes</h1>
          <p class="text-gray-600">Gestão completa dos pacientes da clínica</p>
        </div>
        <p-button label="Novo Paciente" icon="pi pi-plus" (onClick)="openDialog()"></p-button>
      </div>

      <!-- Filtros -->
      <p-card class="shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Buscar por nome ou e-mail</label
            >
            <input
              pInputText
              [(ngModel)]="searchText"
              placeholder="Nome, email..."
              class="w-full"
            />
          </div>
          <div class="flex items-end gap-2">
            <p-button label="Buscar" icon="pi pi-search" (onClick)="loadPatients()"></p-button>
            <p-button
              label="Limpar"
              icon="pi pi-times"
              severity="secondary"
              (onClick)="clearFilters()"
            ></p-button>
          </div>
        </div>
      </p-card>

      <!-- Tabela -->
      <p-card class="shadow-md">
        <p-table [value]="patients()" [tableStyle]="{ 'min-width': '50rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th>Nome</th>
              <th>Idade</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Data de Cadastro</th>
              <th>Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-patient>
            <tr>
              <td class="font-medium">{{ patient.fullName }}</td>
              <td>{{ calculateAge(patient.dateOfBirth) }} anos</td>
              <td>{{ patient.phone }}</td>
              <td>{{ patient.email }}</td>
              <td>{{ patient.createdAt | date: 'dd/MM/yyyy' }}</td>
              <td>
                <p-button
                  icon="pi pi-eye"
                  [rounded]="true"
                  [text]="true"
                  severity="info"
                  [routerLink]="['/app/patients', patient.id]"
                ></p-button>
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="info"
                  (onClick)="editPatient(patient)"
                ></p-button>
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="deletePatient(patient.id)"
                ></p-button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-4 text-gray-500">Nenhum paciente encontrado</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Dialog -->
    <p-dialog
      [(visible)]="displayDialog"
      [header]="editingPatient ? 'Editar Paciente' : 'Novo Paciente'"
      [modal]="true"
      [style]="{ width: '50vw' }"
    >
      <div *ngIf="displayDialog" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <input pInputText [(ngModel)]="formData.fullName" class="w-full" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
            <input pInputText type="date" [(ngModel)]="formData.dateOfBirth" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">CPF/Documento</label>
            <input pInputText [(ngModel)]="formData.document" class="w-full" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
            <input pInputText [(ngModel)]="formData.phone" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input pInputText type="email" [(ngModel)]="formData.email" class="w-full" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
          <input pInputText [(ngModel)]="formData.address" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Observações</label>
          <textarea
            [(ngModel)]="formData.observations"
            class="w-full border border-gray-300 rounded px-3 py-2"
            rows="3"
          ></textarea>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          severity="secondary"
          (onClick)="displayDialog.set(false)"
        ></p-button>
        <p-button label="Salvar" (onClick)="savePatient()"></p-button>
      </ng-template>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientsListComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

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
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar pacientes',
        });
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
      this.messageService.add({
        severity: 'warn',
        summary: 'Validação',
        detail: 'Preencha os campos obrigatórios',
      });
      return;
    }

    if (this.editingPatient) {
      // Update
      this.patientsService
        .update(this.editingPatient.id, this.formData as UpdatePatientDto)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Paciente atualizado',
            });
            this.displayDialog.set(false);
            this.loadPatients();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao atualizar paciente',
            });
          },
        });
    } else {
      // Create
      this.patientsService.create(this.formData as CreatePatientDto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Paciente criado',
          });
          this.displayDialog.set(false);
          this.loadPatients();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao criar paciente',
          });
        },
      });
    }
  }

  deletePatient(id: string): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja deletar este paciente?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.patientsService.delete(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Paciente deletado',
            });
            this.loadPatients();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao deletar paciente',
            });
          },
        });
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
