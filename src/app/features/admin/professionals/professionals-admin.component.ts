import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { ProfessionalsService } from '@core/services/professionals.service';
import { Professional } from '@core/models';
import { CurrentUserService } from '@core/services/current-user.service';
import { AlertService } from '@shared/ui/alert.service';
import { IconComponent } from '@shared/ui/icon.component';
import { TableComponent, TableColumn } from '@shared/ui/table/table.component';

@Component({
  selector: 'app-professionals-admin',
  standalone: true,
  imports: [CommonModule, IconComponent, TableComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Profissionais</h1>
          <p class="text-sm sm:text-base text-gray-600">Gerenciamento de profissionais de saúde</p>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-sm sm:btn-md"
          (click)="addNewProfessional()"
        >
          <app-icon name="plus"></app-icon>
          <span class="hidden xs:inline">Novo Profissional</span>
          <span class="xs:hidden">Novo</span>
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-2 sm:p-4 overflow-x-auto">
        <app-table
          [data]="tableData()"
          [columns]="columns()"
          [isLoading]="isLoading()"
          [showSearch]="true"
          [showExport]="true"
          emptyMessage="Nenhum profissional encontrado"
          (action)="handleTableAction($event)"
        ></app-table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalsAdminComponent {
  private readonly professionalsService = inject(ProfessionalsService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly alertService = inject(AlertService);

  professionals = signal<Professional[]>([]);
  isLoading = signal(false);
  tableData = signal<Record<string, unknown>[]>([]);

  columns = signal<TableColumn[]>([
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'specialty',
      header: 'Especialidade',
      sortable: true,
      format: (value) => this.translateSpecialty(value as string),
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
        color: value ? 'success' : 'error',
      }),
    },
  ]);

  constructor() {
    this.loadProfessionals();
  }

  loadProfessionals(): void {
    this.isLoading.set(true);
    const clinicId = this.currentUserService.getClinicId();

    if (!clinicId) {
      this.alertService.error('Clínica não identificada');
      this.isLoading.set(false);
      return;
    }

    this.professionalsService.getAll({ clinicId }).subscribe({
      next: (professionals) => {
        this.professionals.set(professionals);
        // Transformar dados para o formato da tabela
        this.tableData.set(
          professionals.map((prof) => ({
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
      error: (error) => {
        console.error('Erro ao carregar profissionais:', error);
        this.alertService.error('Erro ao carregar profissionais');
        this.isLoading.set(false);
      },
    });
  }

  translateSpecialty(specialty: string): string {
    const specialties: Record<string, string> = {
      CARDIOLOGY: 'Cardiologia',
      DERMATOLOGY: 'Dermatologia',
      PEDIATRICS: 'Pediatria',
      NEUROLOGY: 'Neurologia',
      ORTHOPEDICS: 'Ortopedia',
      PSYCHIATRY: 'Psiquiatria',
      GYNECOLOGY: 'Ginecologia',
      GENERAL_PRACTICE: 'Clínica Geral',
      SPEECH_THERAPY: 'Fonoaudiologia',
    };
    return specialties[specialty] || specialty;
  }

  addNewProfessional(): void {
    this.alertService.info('Funcionalidade em desenvolvimento');
  }

  handleTableAction(event: { action: string; row: unknown }): void {
    const professional = (event.row as Record<string, unknown>)['_original'] as Professional;

    switch (event.action) {
      case 'edit':
        this.editProfessional(professional);
        break;
      case 'delete':
        this.deleteProfessional(professional.id);
        break;
      case 'view':
        this.alertService.info('Funcionalidade em desenvolvimento');
        break;
    }
  }

  editProfessional(_professional: Professional): void {
    this.alertService.info('Funcionalidade em desenvolvimento');
  }

  deleteProfessional(professionalId: string): void {
    if (!confirm('Tem certeza que deseja deletar este profissional?')) return;

    this.professionalsService.delete(professionalId).subscribe({
      next: () => {
        this.alertService.success('Profissional deletado com sucesso');
        this.loadProfessionals();
      },
      error: (error) => {
        console.error('Erro ao deletar profissional:', error);
        this.alertService.error('Erro ao deletar profissional');
      },
    });
  }
}
