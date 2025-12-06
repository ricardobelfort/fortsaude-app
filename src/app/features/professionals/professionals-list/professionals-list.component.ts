import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessionalsService } from '../../../core/services/professionals.service';
import { Professional } from '../../../core/models/professional.model';
import { PROFESSIONAL_CATEGORY_LABELS } from '../../../core/models';
import { IconComponent } from '../../../shared/ui/icon.component';
import { AlertService } from '../../../shared/ui/alert.service';

@Component({
  selector: 'app-professionals-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Profissionais</h1>
          <p class="text-gray-600">Gerenciamento de profissionais de saúde</p>
        </div>
        <button type="button" class="fs-button-primary" (click)="openDialog()">
          <app-icon name="user-plus" [size]="18"></app-icon>
          Novo Profissional
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="fs-label">Nome ou Especialidade</label>
            <input [(ngModel)]="searchText" placeholder="Buscar..." class="fs-input" />
          </div>
          <div>
            <label class="fs-label">Categoria</label>
            <select [(ngModel)]="selectedCategory" class="fs-select">
              <option [value]="null">Todas as categorias</option>
              @for (cat of categoryOptions; track cat.value) {
                <option [value]="cat.value">{{ cat.label }}</option>
              }
            </select>
          </div>
          <div class="flex items-end">
            <button type="button" class="fs-button-primary" (click)="loadProfessionals()">
              <app-icon name="search" [size]="18"></app-icon>
              Buscar
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm p-4 overflow-x-auto">
        @if (professionals().length > 0) {
          <table class="min-w-[50rem] w-full text-left">
            <thead>
              <tr class="border-b">
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Nome</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Categoria</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Especialidade</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Registro</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (professional of professionals(); track professional.id) {
                <tr class="border-b last:border-0">
                  <td class="px-4 py-3 font-medium">
                    {{ professional.firstName }} {{ professional.lastName }}
                  </td>
                  <td class="px-4 py-3">
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {{ getCategoryLabel(professional.category) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">{{ professional.mainSpecialty }}</td>
                  <td class="px-4 py-3">{{ professional.registrationCode }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="font-medium"
                      [class.text-green-600]="professional.active"
                      [class.text-red-600]="!professional.active"
                    >
                      {{ professional.active ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        (click)="editProfessional(professional)"
                      >
                        <app-icon name="edit-3" [size]="18"></app-icon>
                        Editar
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                        (click)="deleteProfessional(professional.id)"
                      >
                        <app-icon name="trash-2" [size]="18"></app-icon>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <div class="text-center py-12 text-gray-500">
            <p class="text-5xl mb-4">👩‍⚕️</p>
            <p>Nenhum profissional encontrado</p>
          </div>
        }
      </div>
    </div>

    <!-- Dialog Placeholder -->
    @if (displayDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-16 mb-10 p-6 text-center space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">
              {{ editingProfessional ? 'Editar Profissional' : 'Novo Profissional' }}
            </h3>
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700"
              (click)="displayDialog.set(false)"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>
          <p class="text-gray-600">Formulário em desenvolvimento.</p>
          <div class="flex justify-center gap-3">
            <button type="button" class="fs-button-secondary" (click)="displayDialog.set(false)">
              Fechar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalsListComponent implements OnInit {
  private readonly professionalsService = inject(ProfessionalsService);
  private readonly alertService = inject(AlertService);

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
        this.alertService.error('Falha ao carregar profissionais');
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

  async deleteProfessional(id: string): Promise<void> {
    const confirmed = await this.alertService.confirm({
      text: 'Tem certeza que deseja deletar este profissional?',
      confirmButtonText: 'Sim, deletar',
    });

    if (!confirmed) return;

    this.professionalsService.delete(id).subscribe({
      next: () => {
        this.alertService.success('Profissional deletado com sucesso');
        this.loadProfessionals();
      },
      error: () => {
        this.alertService.error('Falha ao deletar profissional');
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
