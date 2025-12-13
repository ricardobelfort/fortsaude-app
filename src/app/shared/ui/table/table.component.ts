import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon.component';
import { SpinnerComponent } from '../spinner.component';

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  format?: (value: unknown) => string;
  badge?: (value: unknown) => { text: string; color: 'primary' | 'success' | 'warning' | 'error' };
}

export interface TableSelection {
  selectedRows: Set<unknown>;
  isAllSelected: boolean;
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
  imports: [CommonModule, IconComponent, SpinnerComponent],
  styles: `
    select {
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1.25rem 1.25rem;
      padding-right: 2.5rem;
    }
  `,
  template: `
    <div class="space-y-0">
      <!-- Loading state -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <app-spinner [size]="16"></app-spinner>
            <p class="mt-3 text-gray-600">Carregando...</p>
          </div>
        </div>
      } @else if (data().length === 0) {
        <!-- Empty state -->
        <div class="flex items-center justify-center py-2">
          <div class="text-center">
            <p class="text-gray-500">{{ emptyMessage() }}</p>
          </div>
        </div>
      } @else {
        <!-- Table Container -->
        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <!-- Toolbar -->
          @if (showSearch() || showExport() || showDeleteAll()) {
            <div class="border-b border-slate-200 px-6 py-4 bg-white space-y-4">
              <div class="flex items-center justify-between gap-4">
                <!-- Search Input -->
                @if (showSearch()) {
                  <div class="flex-1">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      [value]="searchTerm()"
                      (change)="onSearchChange($any($event).target.value)"
                      (input)="onSearchChange($any($event).target.value)"
                      class="w-full px-4 py-2 rounded border border-slate-300 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                }

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                  <!-- Clear Button -->
                  @if (showSearch() && searchTerm()) {
                    <button
                      type="button"
                      (click)="clearSearch()"
                      class="px-4 py-2 rounded border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      Limpar
                    </button>
                  }

                  <!-- Export Button -->
                  @if (showExport()) {
                    <button
                      type="button"
                      (click)="onExport()"
                      class="px-4 py-2 rounded border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <app-icon [name]="'download'" [size]="16"></app-icon>
                      Exportar
                    </button>
                  }

                  <!-- Delete All Button -->
                  @if (showDeleteAll() && selectedRows().size > 0) {
                    <button
                      type="button"
                      (click)="onDeleteAll()"
                      class="px-4 py-2 rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <app-icon [name]="'delete'" [size]="16"></app-icon>
                      Excluir ({{ selectedRows().size }})
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-gray-900">
              <thead class="border-b border-slate-200">
                <tr>
                  <th class="px-4 py-2 font-semibold text-slate-900 w-10 h-10">
                    <div class="flex items-center justify-center h-full">
                      <input
                        type="checkbox"
                        [checked]="
                          selectedRows().size > 0 && selectedRows().size === paginatedData().length
                        "
                        [indeterminate]="
                          selectedRows().size > 0 && selectedRows().size !== paginatedData().length
                        "
                        (change)="toggleSelectAll()"
                        class="rounded border-slate-300 cursor-pointer w-4 h-4"
                      />
                    </div>
                  </th>
                  @for (column of columns(); track column.key) {
                    <th
                      class="px-6 py-2 font-semibold text-slate-900 text-left"
                      [style.width]="column.width"
                    >
                      @if (column.sortable) {
                        <button
                          type="button"
                          (click)="sort(column.key)"
                          class="flex items-center gap-2 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          {{ column.header }}
                          <app-icon
                            [name]="
                              sortBy() === column.key
                                ? sortOrder() === 'asc'
                                  ? 'arrow-up'
                                  : 'arrow-down'
                                : 'unfold-more'
                            "
                            [size]="16"
                            [class]="sortBy() === column.key ? 'text-slate-900' : 'text-slate-400'"
                          ></app-icon>
                        </button>
                      } @else {
                        {{ column.header }}
                      }
                    </th>
                  }
                  <th class="px-6 py-2 font-semibold text-slate-900 text-center">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (row of paginatedData(); track trackByFn(row); let rowIndex = $index) {
                  <tr
                    [class.bg-slate-50]="striped() && rowIndex % 2 === 0"
                    class="hover:bg-slate-50 transition-colors"
                  >
                    <td class="px-4 py-2 text-center h-10">
                      <div class="flex items-center justify-center h-full">
                        <input
                          type="checkbox"
                          [checked]="selectedRows().has(trackByFn(row))"
                          (change)="toggleRowSelection(row)"
                          class="rounded border-slate-300 cursor-pointer w-4 h-4"
                        />
                      </div>
                    </td>
                    @for (column of columns(); track column.key) {
                      <td class="px-6 py-2 text-slate-700">
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
                    <td class="px-6 py-2 text-center">
                      <div class="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          (click)="action.emit({ action: 'view', row })"
                          title="Visualizar"
                          class="p-2 text-slate-600 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          <app-icon [name]="'eye'" [size]="18"></app-icon>
                        </button>
                        <button
                          type="button"
                          (click)="action.emit({ action: 'edit', row })"
                          title="Editar"
                          class="p-2 text-slate-600 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          <app-icon [name]="'edit'" [size]="18"></app-icon>
                        </button>
                        <button
                          type="button"
                          (click)="action.emit({ action: 'delete', row })"
                          title="Excluir"
                          class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <app-icon [name]="'delete'" [size]="18"></app-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Footer with Pagination -->
          @if (data().length > 0) {
            <div class="border-t border-slate-200 px-6 py-3">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                  <p class="text-sm text-slate-600">
                    Mostrando {{ startIndex() + 1 }} a {{ endIndex() }} de
                    {{ data().length }} registro{{ data().length !== 1 ? 's' : '' }}
                  </p>
                  @if (selectedRows().size > 0) {
                    <p class="text-sm font-medium text-indigo-600">
                      ({{ selectedRows().size }} selecionado{{
                        selectedRows().size !== 1 ? 's' : ''
                      }})
                    </p>
                  }
                </div>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      (click)="previousPage()"
                      [disabled]="currentPage() === 1"
                      class="p-2 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <app-icon [name]="'chevron-left'" [size]="16"></app-icon>
                    </button>

                    @for (page of pageNumbers(); track page) {
                      <button
                        type="button"
                        (click)="goToPage(page)"
                        [class.bg-indigo-600]="currentPage() === page"
                        [class.text-white]="currentPage() === page"
                        [class.text-slate-700]="currentPage() !== page"
                        [class.hover:bg-slate-200]="currentPage() !== page"
                        class="px-3 p-2 rounded text-xs font-medium transition-colors"
                      >
                        {{ page }}
                      </button>
                    }

                    @if (showEllipsisEnd()) {
                      <span class="px-2 py-2 text-slate-600">...</span>
                      <button
                        type="button"
                        (click)="goToPage(totalPages())"
                        [class.text-slate-700]="currentPage() !== totalPages()"
                        [class.hover:bg-slate-200]="currentPage() !== totalPages()"
                        class="px-3 py-2 rounded text-xs font-medium transition-colors"
                      >
                        {{ totalPages() }}
                      </button>
                    }

                    <button
                      type="button"
                      (click)="nextPage()"
                      [disabled]="currentPage() === totalPages()"
                      class="p-2 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <app-icon [name]="'chevron-right'" [size]="16"></app-icon>
                    </button>
                  </div>
                  <select
                    [value]="pageSize()"
                    (change)="onPageSizeChange($any($event).target.value)"
                    class="px-4 py-2 rounded border border-slate-300 text-sm text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>
            </div>
          }
        </div>
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
  readonly showSearch = input(false);
  readonly showExport = input(false);
  readonly showDeleteAll = input(false);
  readonly searchableFields = input<string[]>([]);

  // Outputs
  readonly action = output<{ action: 'view' | 'edit' | 'delete'; row: Record<string, unknown> }>();
  readonly selectionChange = output<Set<unknown>>();
  readonly search = output<string>();
  readonly export = output<Set<unknown>>();
  readonly deleteAll = output<Set<unknown>>();

  // State
  private readonly currentPageSignal = signal(1);
  private readonly sortBySignal = signal<string | null>(null);
  private readonly sortOrderSignal = signal<'asc' | 'desc'>('asc');
  private readonly selectedRowsSignal = signal<Set<unknown>>(new Set());
  private readonly pageSizeSignal = signal<number>(10);
  private readonly searchTermSignal = signal<string>('');

  // Computed
  readonly currentPage = this.currentPageSignal.asReadonly();
  readonly sortBy = this.sortBySignal.asReadonly();
  readonly sortOrder = this.sortOrderSignal.asReadonly();
  readonly selectedRows = this.selectedRowsSignal.asReadonly();
  readonly searchTerm = this.searchTermSignal.asReadonly();
  readonly pageSize = computed(() => this.pageSizeSignal());
  readonly striped = computed(() => this.config().striped ?? true);

  readonly filteredData = computed(() => {
    const searchTerm = this.searchTermSignal().toLowerCase();
    const data = [...this.data()];

    if (!searchTerm) return data;

    const searchableFields = this.searchableFields();
    if (searchableFields.length === 0) return data;

    return data.filter((row) => {
      return searchableFields.some((field) => {
        const value = row[field] as string;
        return value && value.toLowerCase().includes(searchTerm);
      });
    });
  });

  readonly sortedData = computed(() => {
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();
    const data = [...this.filteredData()];

    if (!sortBy) return data;

    return data.sort((a, b) => {
      const aVal = a[sortBy] as string | number;
      const bVal = b[sortBy] as string | number;

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  });

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

  readonly showEllipsisEnd = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const end = Math.min(total, current + 2);
    return end < total - 1;
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

  changePageSize(size: number): void {
    this.pageSizeSignal.set(size);
    this.currentPageSignal.set(1);
  }

  onPageSizeChange(value: string): void {
    const size = parseInt(value, 10);
    this.changePageSize(size);
  }

  onSearchChange(term: string): void {
    this.searchTermSignal.set(term);
    this.currentPageSignal.set(1);
    this.search.emit(term);
  }

  clearSearch(): void {
    this.searchTermSignal.set('');
    this.currentPageSignal.set(1);
    this.search.emit('');
  }

  onExport(): void {
    this.export.emit(this.selectedRows());
  }

  onDeleteAll(): void {
    this.deleteAll.emit(this.selectedRows());
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

  toggleRowSelection(row: Record<string, unknown>): void {
    const rowId = this.trackByFn(row);
    const newSelection = new Set(this.selectedRows());

    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }

    this.selectedRowsSignal.set(newSelection);
    this.selectionChange.emit(newSelection);
  }

  toggleSelectAll(): void {
    const newSelection = new Set<unknown>();

    if (this.selectedRows().size > 0) {
      // Se algo está selecionado, desseleciona tudo
      this.selectedRowsSignal.set(newSelection);
    } else {
      // Se nada está selecionado, seleciona todos da página atual
      this.paginatedData().forEach((row) => {
        newSelection.add(this.trackByFn(row));
      });
      this.selectedRowsSignal.set(newSelection);
    }

    this.selectionChange.emit(newSelection);
  }
}
