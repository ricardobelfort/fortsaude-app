import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProfessionalsService } from '../../../core/services/professionals.service';
import { Professional } from '../../../core/models/professional.model';
import { PROFESSIONAL_CATEGORY_LABELS } from '../../../core/models';

@Component({
  selector: 'app-professionals-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
          <h1 class="text-3xl font-bold text-gray-800">Profissionais</h1>
          <p class="text-gray-600">Gerenciamento de profissionais de saúde</p>
        </div>
        <p-button label="Novo Profissional" icon="pi pi-plus" (onClick)="openDialog()"></p-button>
      </div>

      <!-- Filters -->
      <p-card class="shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Nome ou Especialidade</label
            >
            <input pInputText [(ngModel)]="searchText" placeholder="Buscar..." class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              [(ngModel)]="selectedCategory"
              class="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option [value]="null">Todas as categorias</option>
              <option *ngFor="let cat of categoryOptions" [value]="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <p-button label="Buscar" icon="pi pi-search" (onClick)="loadProfessionals()"></p-button>
          </div>
        </div>
      </p-card>

      <!-- Table -->
      <p-card class="shadow-md">
        <p-table [value]="professionals()" [tableStyle]="{ 'min-width': '50rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Especialidade</th>
              <th>Registro</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-professional>
            <tr>
              <td>{{ professional.firstName }} {{ professional.lastName }}</td>
              <td>
                <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {{ getCategoryLabel(professional.category) }}
                </span>
              </td>
              <td>{{ professional.mainSpecialty }}</td>
              <td>{{ professional.registrationCode }}</td>
              <td>
                <span
                  [class]="
                    professional.active ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
                  "
                >
                  {{ professional.active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td>
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [text]="true"
                  severity="info"
                  (onClick)="editProfessional(professional)"
                ></p-button>
                <p-button
                  icon="pi pi-trash"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="deleteProfessional(professional.id)"
                ></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>

    <!-- Dialog -->
    <p-dialog
      [(visible)]="displayDialog"
      [header]="editingProfessional ? 'Editar Profissional' : 'Novo Profissional'"
      [modal]="true"
      [style]="{ width: '50vw' }"
    >
      <!-- TODO: Add form here -->
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalsListComponent implements OnInit {
  private readonly professionalsService = inject(ProfessionalsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  professionals = signal<Professional[]>([]);
  displayDialog = signal(false);
  editingProfessional: Professional | null = null;
  searchText = '';
  selectedCategory: string | null = null;

  categoryOptions = Object.entries(PROFESSIONAL_CATEGORY_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  ngOnInit(): void {
    this.loadProfessionals();
  }

  loadProfessionals(): void {
    const params: Record<string, string | string[]> = {};
    if (this.searchText) {
      params['search'] = this.searchText;
    }
    if (this.selectedCategory) {
      params['category'] = this.selectedCategory;
    }

    this.professionalsService.getAll(params).subscribe({
      next: (data) => {
        this.professionals.set(data);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao carregar profissionais',
        });
      },
    });
  }

  openDialog(): void {
    this.editingProfessional = null;
    this.displayDialog.set(true);
  }

  editProfessional(professional: Professional): void {
    this.editingProfessional = { ...professional };
    this.displayDialog.set(true);
  }

  deleteProfessional(id: string): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja deletar este profissional?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.professionalsService.delete(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Profissional deletado com sucesso',
            });
            this.loadProfessionals();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Falha ao deletar profissional',
            });
          },
        });
      },
    });
  }

  getCategoryLabel(category: string): string {
    return (
      PROFESSIONAL_CATEGORY_LABELS[category as keyof typeof PROFESSIONAL_CATEGORY_LABELS] ||
      category
    );
  }
}
