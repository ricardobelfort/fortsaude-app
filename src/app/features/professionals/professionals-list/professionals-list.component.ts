import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessionalsService } from '../../../core/services/professionals.service';
import {
  Professional,
  CreateProfessionalDto,
  UpdateProfessionalDto,
} from '../../../core/models/professional.model';
import { IconComponent } from '../../../shared/ui/icon.component';
import { AlertService } from '../../../shared/ui/alert.service';
import { TableComponent, TableColumn } from '../../../shared/ui/table/table.component';
import { ProfessionalFormComponent } from '../professional-form/professional-form.component';

@Component({
  selector: 'app-professionals-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, TableComponent, ProfessionalFormComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Profissionais</h1>
          <p class="text-sm sm:text-base text-gray-600">Gerenciamento de profissionais de saúde</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm sm:btn-md" (click)="openCreateDialog()">
          <app-icon [name]="'plus'"></app-icon>
          <span class="hidden xs:inline">Novo Profissional</span>
          <span class="xs:hidden">Novo</span>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-2 sm:p-4 overflow-x-auto">
        <app-table
          [data]="tableData()"
          [columns]="tableColumns()"
          [showSearch]="true"
          [showExport]="true"
          [showDeleteAll]="true"
          [searchableFields]="['name', 'email']"
          [entityName]="'profissionais'"
          (search)="onSearch($event)"
          (export)="onExport($event)"
          (deleteAll)="onDeleteAll($event)"
          [isLoading]="isLoading()"
          emptyMessage="Nenhum profissional encontrado"
          (action)="handleTableAction($event)"
        ></app-table>
      </div>
    </div>

    <!-- Modal de Criação/Edição -->
    @if (showModal()) {
      <div
        class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto pt-4"
        (click)="closeModal()"
      >
        <div
          class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mb-10 p-6"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">
              @if (editingProfessional()) {
                Editar Profissional
              } @else {
                Novo Profissional
              }
            </h3>
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700 p-1"
              (click)="closeModal()"
              [disabled]="isSubmitting()"
            >
              <app-icon [name]="'x'"></app-icon>
            </button>
          </div>

          <!-- Form -->
          <app-professional-form
            [professional]="editingProfessional()"
            [isSubmitting]="isSubmitting()"
            (submitted)="onFormSubmitted($event)"
            (cancelled)="closeModal()"
          ></app-professional-form>
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
  isLoading = signal(false);
  isSubmitting = signal(false);
  showModal = signal(false);
  editingProfessional = signal<Professional | null>(null);
  searchText = '';

  tableColumns = signal<TableColumn[]>([
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'specialty',
      header: 'Especialidade',
      sortable: true,
    },
    {
      key: 'crm',
      header: 'CRM',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      badge: (value) => ({
        text: value ? 'Ativo' : 'Inativo',
        color: value ? 'success' : 'warning',
      }),
    },
  ]);

  tableData = signal<Record<string, unknown>[]>([]);

  ngOnInit(): void {
    this.loadProfessionals();
  }

  loadProfessionals(): void {
    this.isLoading.set(true);
    const params: Record<string, string | string[]> = {};
    if (this.searchText) {
      params['search'] = this.searchText;
    }

    this.professionalsService.getAll(params).subscribe({
      next: (data) => {
        this.professionals.set(data);
        this.tableData.set(
          data.map((prof) => ({
            id: prof.id,
            name: prof.profile.account.person.fullName,
            specialty: prof.specialty,
            crm: prof.crm,
            email: prof.profile.account.email,
            status: prof.active,
            _original: prof,
          }))
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Falha ao carregar profissionais');
        this.isLoading.set(false);
      },
    });
  }

  handleTableAction(event: {
    action: 'view' | 'edit' | 'delete';
    row: Record<string, unknown>;
  }): void {
    const professional = (event.row as Record<string, unknown>)['_original'] as Professional;

    switch (event.action) {
      case 'view':
        window.location.href = `/app/professionals/${professional.id}`;
        break;
      case 'edit':
        this.openEditDialog(professional);
        break;
      case 'delete':
        this.confirmDelete(professional.id);
        break;
    }
  }

  openCreateDialog(): void {
    this.editingProfessional.set(null);
    this.showModal.set(true);
  }

  openEditDialog(professional: Professional): void {
    this.editingProfessional.set(professional);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProfessional.set(null);
  }

  onFormSubmitted(dto: CreateProfessionalDto | UpdateProfessionalDto): void {
    const editing = this.editingProfessional();
    this.isSubmitting.set(true);

    if (editing && 'id' in editing) {
      // Update
      this.professionalsService.update(editing.id, dto as UpdateProfessionalDto).subscribe({
        next: () => {
          this.alertService.success('Profissional atualizado com sucesso!');
          this.closeModal();
          this.isSubmitting.set(false);
          this.loadProfessionals();
        },
        error: () => {
          this.alertService.error('Erro ao atualizar profissional');
          this.isSubmitting.set(false);
        },
      });
    } else {
      // Create
      this.professionalsService.create(dto as CreateProfessionalDto).subscribe({
        next: () => {
          this.alertService.success('Profissional criado com sucesso!');
          this.closeModal();
          this.isSubmitting.set(false);
          this.loadProfessionals();
        },
        error: () => {
          this.alertService.error('Erro ao criar profissional');
          this.isSubmitting.set(false);
        },
      });
    }
  }

  async confirmDelete(id: string): Promise<void> {
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

  onSearch(searchTerm: string): void {
    this.searchText = searchTerm;
    if (searchTerm.trim()) {
      this.loadProfessionals();
    }
  }

  onExport(exportEvent: { format: 'xlsx' | 'pdf'; data: Record<string, unknown>[] }): void {
    if (exportEvent.data.length === 0) {
      this.alertService.info('Selecione pelo menos um profissional para exportar');
      return;
    }

    this.alertService.success(
      `${exportEvent.data.length} profissional(is) exportado(s) em ${exportEvent.format.toUpperCase()}`
    );
  }

  async onDeleteAll(selectedRows: Set<unknown>): Promise<void> {
    if (selectedRows.size === 0) {
      this.alertService.info('Selecione pelo menos um profissional');
      return;
    }

    const confirmed = await this.alertService.confirm({
      text: `Tem certeza que deseja deletar ${selectedRows.size} profissional(is)?`,
      confirmButtonText: 'Sim, deletar tudo',
    });

    if (!confirmed) return;

    const selectedData = this.tableData().filter((row) => selectedRows.has(row['id']));
    const professionalIds = selectedData
      .map((row) => ((row as Record<string, unknown>)['_original'] as Professional).id)
      .filter(Boolean) as string[];

    this.isLoading.set(true);
    let deletedCount = 0;
    let failedCount = 0;

    Promise.all(
      professionalIds.map((id) =>
        this.professionalsService
          .delete(id)
          .toPromise()
          .then(
            () => {
              deletedCount++;
            },
            () => {
              failedCount++;
            }
          )
      )
    ).then(() => {
      this.isLoading.set(false);
      if (deletedCount > 0) {
        this.alertService.success(`${deletedCount} profissional(is) deletado(s)`);
      }
      if (failedCount > 0) {
        this.alertService.error(`Falha ao deletar ${failedCount} profissional(is)`);
      }
      this.loadProfessionals();
    });
  }
}
