import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon.component';

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  format?: (value: unknown) => string;
  badge?: (value: unknown) => { text: string; color: 'primary' | 'success' | 'warning' | 'error' };
}

export interface TableConfig {
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  pageSize?: number;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-4">
      <!-- Loading state -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
            ></div>
            <p class="mt-2 text-gray-600">Carregando dados...</p>
          </div>
        </div>
      } @else if (paginatedData().length === 0) {
        <!-- Empty state -->
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <app-icon [name]="'inbox'" class="h-12 w-12 text-gray-400 mx-auto mb-4"></app-icon>
            <p class="text-gray-500">{{ emptyMessage() }}</p>
          </div>
        </div>
      } @else {
        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full text-sm text-gray-900">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                @for (column of columns(); track column.key) {
                  <th
                    class="px-4 py-3 font-semibold text-gray-700 text-left"
                    [style.width]="column.width"
                  >
                    @if (column.sortable) {
                      <button
                        type="button"
                        (click)="sort(column.key)"
                        class="flex items-center gap-2 hover:text-gray-900 transition-colors"
                      >
                        {{ column.header }}
                        @if (sortBy() === column.key) {
                          <app-icon
                            [name]="sortOrder() === 'asc' ? 'arrow-up' : 'arrow-down'"
                            class="h-4 w-4"
                          ></app-icon>
                        }
                      </button>
                    } @else {
                      {{ column.header }}
                    }
                  </th>
                }
                <th class="px-4 py-3 font-semibold text-gray-700 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (row of paginatedData(); track trackByFn(row); let rowIndex = $index) {
                <tr
                  [class.bg-slate-50]="striped() && rowIndex % 2 === 0"
                  class="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  @for (column of columns(); track column.key) {
                    <td class="px-4 py-3 whitespace-nowrap">
                      @if (column.badge) {
                        @let badge = column.badge(getRowValue(row, column.key));
                        <span
                          [class]="getBadgeClass(badge.color)"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        >
                          {{ badge.text }}
                        </span>
                      } @else if (column.format) {
                        {{ column.format(getRowValue(row, column.key)) }}
                      } @else {
                        {{ getRowValue(row, column.key) }}
                      }
                    </td>
                  }
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        (click)="action.emit({ action: 'view', row })"
                        title="Visualizar"
                        class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <app-icon [name]="'eye'" [size]="20"></app-icon>
                      </button>
                      <button
                        type="button"
                        (click)="action.emit({ action: 'edit', row })"
                        title="Editar"
                        class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <app-icon [name]="'edit'" [size]="20"></app-icon>
                      </button>
                      <button
                        type="button"
                        (click)="action.emit({ action: 'delete', row })"
                        title="Excluir"
                        class="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <app-icon [name]="'delete'" [size]="20"></app-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-600">
              Mostrando {{ startIndex() + 1 }} a {{ endIndex() }} de {{ data().length }} registros
            </p>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <app-icon [name]="'chevron-left'" class="h-4 w-4"></app-icon>
              </button>
              @for (page of pageNumbers(); track page) {
                <button
                  type="button"
                  (click)="goToPage(page)"
                  [class.bg-slate-600]="currentPage() === page"
                  [class.text-white]="currentPage() === page"
                  class="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  {{ page }}
                </button>
              }
              <button
                type="button"
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <app-icon [name]="'chevron-right'" class="h-4 w-4"></app-icon>
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  // Inputs
  readonly data = input<Record<string, unknown>[]>([]);
  readonly columns = input<TableColumn[]>([]);
  readonly isLoading = input(false);
  readonly emptyMessage = input('Nenhum dado encontrado');
  readonly config = input<TableConfig>({
    striped: true,
    bordered: true,
    hoverable: true,
    pageSize: 10,
  });

  // Outputs
  readonly action = output<{ action: 'view' | 'edit' | 'delete'; row: Record<string, unknown> }>();

  // State
  private readonly currentPageSignal = signal(1);
  private readonly sortBySignal = signal<string | null>(null);
  private readonly sortOrderSignal = signal<'asc' | 'desc'>('asc');

  // Computed
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly sortBy = this.sortBySignal.asReadonly();
  readonly sortOrder = this.sortOrderSignal.asReadonly();
  readonly striped = computed(() => this.config().striped ?? true);

  readonly sortedData = computed(() => {
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();
    const data = [...this.data()];

    if (!sortBy) return data;

    return data.sort((a, b) => {
      const aVal = a[sortBy] as string | number;
      const bVal = b[sortBy] as string | number;

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  });

  readonly pageSize = computed(() => this.config().pageSize ?? 10);
  readonly totalPages = computed(() => Math.ceil(this.sortedData().length / this.pageSize()));

  readonly paginatedData = computed(() => {
    const pageSize = this.pageSize();
    const currentPage = this.currentPage();
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return this.sortedData().slice(start, end);
  });

  readonly startIndex = computed(() => (this.currentPage() - 1) * this.pageSize());
  readonly endIndex = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.sortedData().length)
  );

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  // Methods
  sort(column: string): void {
    if (this.sortBy() === column) {
      this.sortOrderSignal.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortBySignal.set(column);
      this.sortOrderSignal.set('asc');
    }
    this.currentPageSignal.set(1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPageSignal.update((p) => p + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPageSignal.update((p) => p - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPageSignal.set(page);
    }
  }

  trackByFn(row: Record<string, unknown>): unknown {
    return row['id'];
  }

  getRowValue(row: Record<string, unknown>, key: string): unknown {
    return row[key];
  }

  getBadgeClass(color: string): string {
    const colors: Record<string, string> = {
      primary: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return colors[color] || colors['primary'];
  }
}
