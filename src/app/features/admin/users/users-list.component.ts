import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { UsersService, UserResponse } from '@core/services/users.service';
import { CurrentUserService } from '@core/services/current-user.service';
import { AlertService } from '@shared/ui/alert.service';
import { IconComponent } from '@shared/ui/icon.component';
import { TableComponent, TableColumn } from '@shared/ui/table/table.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, IconComponent, TableComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Usuários</h1>
          <p class="text-sm sm:text-base text-gray-600">Gerenciamento de usuários da clínica</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm sm:btn-md" (click)="addNewUser()">
          <app-icon name="plus"></app-icon>
          <span class="hidden xs:inline">Novo Usuário</span>
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
          emptyMessage="Nenhum usuário encontrado"
          (action)="handleTableAction($event)"
        ></app-table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  private readonly usersService = inject(UsersService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly alertService = inject(AlertService);

  users = signal<UserResponse[]>([]);
  isLoading = signal(false);
  tableData = signal<Record<string, unknown>[]>([]);

  columns = signal<TableColumn[]>([
    {
      key: 'name',
      header: 'Nome',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'cpf',
      header: 'CPF',
      format: (value) => this.formatCpf(value as string),
    },
    {
      key: 'phone',
      header: 'Telefone',
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
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    const clinicId = this.currentUserService.getClinicId();

    if (!clinicId) {
      this.alertService.error('Clínica não identificada');
      this.isLoading.set(false);
      return;
    }

    this.usersService.getUsersByClinic(clinicId).subscribe({
      next: (users) => {
        this.users.set(users);
        // Transformar dados para o formato da tabela
        this.tableData.set(
          users.map((user) => ({
            id: user.id,
            name: user.person.fullName,
            email: user.person.email,
            cpf: user.person.cpf,
            phone: user.person.phone,
            status: user.enabled,
            _original: user,
          }))
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.alertService.error('Erro ao carregar usuários');
        this.isLoading.set(false);
      },
    });
  }

  addNewUser(): void {
    this.alertService.info('Funcionalidade em desenvolvimento');
  }

  handleTableAction(event: { action: string; row: unknown }): void {
    const user = (event.row as Record<string, unknown>)['_original'] as UserResponse;
    switch (event.action) {
      case 'edit':
        this.editUser(user);
        break;
      case 'delete':
        this.deleteUser(user.id);
        break;
      case 'view':
        this.alertService.info('Funcionalidade em desenvolvimento');
        break;
    }
  }

  editUser(_user: UserResponse): void {
    this.alertService.info('Funcionalidade em desenvolvimento');
  }

  deleteUser(userId: string): void {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    this.usersService.deleteUser(userId).subscribe({
      next: () => {
        this.alertService.success('Usuário deletado com sucesso');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erro ao deletar usuário:', error);
        this.alertService.error('Erro ao deletar usuário');
      },
    });
  }

  private formatCpf(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
