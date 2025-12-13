import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessionalsService } from '../../../core/services/professionals.service';
import { Professional } from '../../../core/models/professional.model';
import { IconComponent } from '../../../shared/ui/icon.component';
import { AlertService } from '../../../shared/ui/alert.service';
import { TableComponent, TableColumn } from '../../../shared/ui/table/table.component';

@Component({
  selector: 'app-professionals-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, TableComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Profissionais</h1>
          <p class="text-gray-600">Gerenciamento de profissionais de saúde</p>
        </div>
        <button type="button" class="btn btn-neutral" (click)="openDialog()">
          <app-icon [name]="'user-plus'"></app-icon>
          Novo Profissional
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-4 overflow-x-auto">
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

    <!-- Dialog Placeholder -->
    @if (displayDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
        <div
          class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-16 mb-10 p-6 text-center space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">
              {{ editingProfessional ? 'Editar Profissional' : 'Novo Profissional' }}
            </h3>
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700"
              (click)="displayDialog.set(false)"
            >
              <app-icon [name]="'x'"></app-icon>
            </button>
          </div>
          <p class="text-gray-600">Formulário em desenvolvimento.</p>
          <div class="flex justify-center gap-3">
            <button type="button" class="btn btn-outline" (click)="displayDialog.set(false)">
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
  isLoading = signal(false);
  displayDialog = signal(false);
  editingProfessional: Professional | null = null;
  searchText = '';

  tableColumns = signal<TableColumn[]>([
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'role',
      header: 'Profissão',
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
        // Mapear dados para o formato da tabela
        this.tableData.set(
          data.map((prof) => ({
            id: prof.id,
            name: prof.profile.account.person.fullName,
            role: prof.profile.role,
            specialty: prof.specialty,
            crm: prof.crm,
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
        this.viewProfessional(professional);
        break;
      case 'edit':
        this.editProfessional(professional);
        break;
      case 'delete':
        this.deleteProfessional(professional.id);
        break;
    }
  }

  viewProfessional(professional: Professional): void {
    // TODO: Implementar visualização
    this.alertService.info(`Visualizando: ${professional.profile.account.person.fullName}`);
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
