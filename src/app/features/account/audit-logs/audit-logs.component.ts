import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService, AuditEventResponse } from '@core/services/audit.service';
import { IconComponent } from '@shared/ui/icon.component';
import { SpinnerComponent } from '@shared/ui/spinner.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IconComponent, SpinnerComponent],
  template: `
    <style>
      :host ::ng-deep .audit-input::placeholder {
        color: #9ca3af;
        opacity: 1;
      }
    </style>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Logs de Auditoria</h3>
          <p class="text-sm text-base-content/60">Histórico de operações e acessos</p>
        </div>
        <button (click)="loadLogs()" [disabled]="isLoading()" class="btn btn-sm btn-outline gap-2">
          <app-icon [name]="'refresh'" [size]="16"></app-icon>
          Atualizar
        </button>
      </div>

      <!-- Filtros -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <fieldset class="fieldset">
              <label class="text-sm font-semibold">Tipo de Entidade</label>
              <input
                type="text"
                [(ngModel)]="entityTypeFilter"
                placeholder="ex: Patient, MedicalRecord"
                class="input input-sm w-full audit-input"
              />
            </fieldset>
            <fieldset class="fieldset">
              <label class="text-sm font-semibold">Ação</label>
              <select [(ngModel)]="actionFilter" class="select select-sm w-full">
                <option value="">Todas as ações</option>
                <option value="CREATE">Criar</option>
                <option value="READ">Ler</option>
                <option value="UPDATE">Atualizar</option>
                <option value="DELETE">Deletar</option>
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <label class="text-sm font-semibold">Usuário</label>
              <input
                type="text"
                [(ngModel)]="userNameFilter"
                placeholder="Nome do usuário"
                class="input input-sm w-full audit-input"
              />
            </fieldset>
          </div>
          <div class="flex gap-2 justify-end">
            <button (click)="clearFilters()" class="btn btn-sm btn-ghost">Limpar Filtros</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex justify-center py-12">
          <app-spinner></app-spinner>
        </div>
      }

      <!-- Logs Table -->
      @if (!isLoading()) {
        @if (filteredLogs().length > 0) {
          <div class="card bg-white shadow-md border border-base-200">
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Ação</th>
                    <th>Entidade</th>
                    <th>Usuário</th>
                    <th>Clínica</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (log of filteredLogs(); track log.id) {
                    <tr class="hover">
                      <td class="whitespace-nowrap">
                        <div class="text-sm">
                          {{ formatDate(log.createdAt) }}
                        </div>
                        <div class="text-xs text-base-content/60">
                          {{ formatTime(log.createdAt) }}
                        </div>
                      </td>
                      <td>
                        <span [class]="getActionBadgeClass(log.action)">
                          {{ formatAction(log.action) }}
                        </span>
                      </td>
                      <td>
                        <div class="flex flex-col gap-1">
                          <span class="font-medium">{{ log.entityType }}</span>
                          <span class="text-xs text-base-content/60 font-mono">
                            {{ log.entityId.substring(0, 8) }}...
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="flex flex-col gap-1">
                          <span class="font-medium">
                            {{ getUserName(log) }}
                          </span>
                          <span class="text-xs text-base-content/60">
                            {{ log.user.role }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span class="text-sm">{{ log.clinic.name }}</span>
                      </td>
                      <td class="text-right">
                        <button (click)="toggleDetails(log.id)" class="btn btn-square btn-sm">
                          <app-icon
                            [name]="expandedLog() === log.id ? 'arrow-up' : 'arrow-down'"
                            [size]="16"
                          ></app-icon>
                        </button>
                      </td>
                    </tr>

                    <!-- Details Row -->
                    @if (expandedLog() === log.id) {
                      <tr class="bg-base-200/50">
                        <td colspan="6">
                          <div class="p-4 space-y-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p class="text-xs font-semibold text-base-content/60">
                                  ID da Entidade
                                </p>
                                <p class="text-sm font-mono break-all">
                                  {{ log.entityId }}
                                </p>
                              </div>
                              <div>
                                <p class="text-xs font-semibold text-base-content/60">
                                  ID do Usuário
                                </p>
                                <p class="text-sm font-mono break-all">
                                  {{ log.user.id }}
                                </p>
                              </div>
                            </div>

                            @if (Object.keys(log.details).length > 0) {
                              <div>
                                <p class="text-xs font-semibold text-base-content/60 mb-2">
                                  Detalhes da Mudança
                                </p>
                                <div class="bg-base-100 p-3 rounded-lg">
                                  @for (key of Object.keys(log.details); track key) {
                                    <div class="flex justify-between py-1 text-sm">
                                      <span class="font-medium">{{ key }}:</span>
                                      <span class="text-base-content/70">
                                        {{ log.details[key] }}
                                      </span>
                                    </div>
                                  }
                                </div>
                              </div>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination Info -->
            <div class="card-body pt-4">
              <div class="text-sm text-base-content/60 text-center">
                Total de {{ filteredLogs().length }} registros
              </div>
            </div>
          </div>
        } @else {
          <div class="alert alert-info">
            <app-icon [name]="'info'" [size]="20"></app-icon>
            <span>Nenhum log de auditoria encontrado com os filtros aplicados.</span>
          </div>
        }
      }

      <!-- Error State -->
      @if (error()) {
        <div class="alert alert-error">
          <app-icon [name]="'alert-circle'" [size]="20"></app-icon>
          <span>{{ error() }}</span>
        </div>
      }
    </div>
  `,
})
export class AuditLogsComponent {
  private auditService = inject(AuditService);

  // Signals
  logs = signal<AuditEventResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  expandedLog = signal<string | null>(null);

  // Filter properties
  entityTypeFilter = '';
  actionFilter = '';
  userNameFilter = '';

  // Computed filtered logs
  filteredLogs = computed(() => {
    const allLogs = this.logs();
    const entityType = this.entityTypeFilter.toLowerCase();
    const action = this.actionFilter;
    const userName = this.userNameFilter.toLowerCase();

    return allLogs.filter((log) => {
      const entityMatch = !entityType || log.entityType.toLowerCase().includes(entityType);

      const actionMatch = !action || log.action === action;

      const userMatch = !userName || this.getUserName(log).toLowerCase().includes(userName);

      return entityMatch && actionMatch && userMatch;
    });
  });

  Object = Object;

  constructor() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading.set(true);
    this.error.set(null);

    this.auditService.getAllLogs().subscribe({
      next: (logs: AuditEventResponse[]) => {
        this.logs.set(logs);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar logs:', err);
        this.error.set('Erro ao carregar logs de auditoria');
        this.isLoading.set(false);
      },
    });
  }

  clearFilters() {
    this.entityTypeFilter = '';
    this.actionFilter = '';
    this.userNameFilter = '';
  }

  toggleDetails(logId: string) {
    this.expandedLog.set(this.expandedLog() === logId ? null : logId);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  formatAction(action: string): string {
    const actionMap: Record<string, string> = {
      CREATE: 'Criar',
      READ: 'Ler',
      UPDATE: 'Atualizar',
      DELETE: 'Deletar',
    };
    return actionMap[action] || action;
  }

  getActionBadgeClass(action: string): string {
    const classMap: Record<string, string> = {
      CREATE: 'badge badge-success',
      READ: 'badge badge-info',
      UPDATE: 'badge badge-warning',
      DELETE: 'badge badge-error',
    };
    return classMap[action] || 'badge';
  }

  getUserName(log: AuditEventResponse): string {
    return log.user?.account?.person?.fullName || 'Usuário desconhecido';
  }
}
