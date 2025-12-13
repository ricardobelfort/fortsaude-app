import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon.component';
import { SpinnerComponent } from '../spinner.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      } @else if (searchTerm() && filteredData().length === 0) {
        <!-- No search results -->
        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <!-- Toolbar with search -->
          @if (showSearch() || showExport() || showDeleteAll()) {
            <div class="border-b border-slate-200 px-6 py-4 bg-white space-y-4">
              <div class="flex items-center justify-between gap-4">
                <!-- Search Input -->
                @if (showSearch()) {
                  <div class="flex items-center gap-2">
                    <label
                      class="input input-bordered flex items-center gap-2"
                      style="width: 350px;"
                    >
                      <app-icon [name]="'search'" [size]="18" class="text-slate-400"></app-icon>
                      <input
                        type="text"
                        placeholder="Buscar..."
                        [value]="searchTerm()"
                        (change)="onSearchChange($any($event).target.value)"
                        (input)="onSearchChange($any($event).target.value)"
                        class="grow"
                      />
                      @if (searchTerm()) {
                        <button
                          type="button"
                          (click)="clearSearch()"
                          class="btn btn-ghost btn-xs"
                          title="Limpar busca"
                        >
                          <app-icon [name]="'x'" [size]="16"></app-icon>
                        </button>
                      }
                    </label>
                  </div>
                }
                <div></div>
              </div>
            </div>
          }
          <!-- Empty content -->
          <div class="flex items-center justify-center py-8">
            <p class="text-gray-500 text-sm">Nenhum resultado encontrado</p>
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
                  <div class="flex items-center gap-2">
                    <label
                      class="input input-bordered flex items-center gap-2"
                      style="width: 350px;"
                    >
                      <app-icon [name]="'search'" [size]="18" class="text-slate-400"></app-icon>
                      <input
                        type="text"
                        placeholder="Buscar..."
                        [value]="searchTerm()"
                        (change)="onSearchChange($any($event).target.value)"
                        (input)="onSearchChange($any($event).target.value)"
                        class="grow"
                      />
                      @if (searchTerm()) {
                        <button
                          type="button"
                          (click)="clearSearch()"
                          class="btn btn-ghost btn-xs"
                          title="Limpar busca"
                        >
                          <app-icon [name]="'x'" [size]="16"></app-icon>
                        </button>
                      }
                    </label>
                  </div>
                }

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                  <!-- Delete All Button -->
                  @if (showDeleteAll() && selectedRows().size > 0) {
                    <button type="button" (click)="onDeleteAll()" class="btn btn-secondary">
                      <app-icon [name]="'delete'" [size]="24"></app-icon>
                      Excluir ({{ selectedRows().size }})
                    </button>
                  }

                  <!-- Export Button -->
                  @if (showExport()) {
                    <div class="dropdown dropdown-end">
                      <button type="button" class="btn btn-square" tabindex="0">
                        <app-icon [name]="'more'" [size]="24"></app-icon>
                      </button>
                      <ul
                        tabindex="0"
                        class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                      >
                        <li>
                          <a (click)="exportToFormat('xlsx')">
                            <app-icon [name]="'xls'" [size]="24"></app-icon>
                            Exportar Excel
                          </a>
                        </li>
                        <li>
                          <a (click)="exportToFormat('pdf')">
                            <app-icon [name]="'pdf'" [size]="24"></app-icon>
                            Exportar PDF
                          </a>
                        </li>
                      </ul>
                    </div>
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
  readonly entityName = input('dados');

  // Outputs
  readonly action = output<{ action: 'view' | 'edit' | 'delete'; row: Record<string, unknown> }>();
  readonly selectionChange = output<Set<unknown>>();
  readonly search = output<string>();
  readonly export = output<{ format: 'xlsx' | 'pdf'; data: Record<string, unknown>[] }>();
  readonly deleteAll = output<Set<unknown>>();

  // State
  private readonly currentPageSignal = signal(1);
  private readonly sortBySignal = signal<string | null>(null);
  private readonly sortOrderSignal = signal<'asc' | 'desc'>('asc');
  private readonly selectedRowsSignal = signal<Set<unknown>>(new Set());
  private readonly pageSizeSignal = signal<number>(10);
  private readonly searchTermSignal = signal<string>('');
  private readonly searchSubject = new Subject<string>();

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

  constructor() {
    effect(() => {
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
        this.searchTermSignal.set(term);
        this.currentPageSignal.set(1);
        this.search.emit(term);
      });
    });
  }

  private generateFileName(format: 'xlsx' | 'pdf'): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${this.entityName()}-${year}${month}${day}-${hours}${minutes}${seconds}.${format}`;
  }

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
    this.searchSubject.next(term);
  }

  clearSearch(): void {
    this.searchTermSignal.set('');
    this.currentPageSignal.set(1);
    this.search.emit('');
  }

  onExport(): void {
    this.export.emit({
      format: 'xlsx',
      data: this.selectedRows().size > 0 ? this.getSelectedData() : this.sortedData(),
    });
  }

  exportToFormat(format: 'xlsx' | 'pdf'): void {
    const selectedData = this.selectedRows().size > 0 ? this.getSelectedData() : this.sortedData();

    if (selectedData.length === 0) {
      return;
    }

    if (format === 'xlsx') {
      this.exportToXLSX(selectedData);
    } else if (format === 'pdf') {
      this.exportToPDF(selectedData);
    }

    this.export.emit({ format, data: selectedData });
  }

  private getSelectedData(): Record<string, unknown>[] {
    return this.sortedData().filter((row) => this.selectedRows().has(this.trackByFn(row)));
  }

  private exportToXLSX(data: Record<string, unknown>[]): void {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');

    const columnHeaders = this.columns().map((col) => col.header);
    const columns = this.columns();

    const rows = data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        if (col.badge) {
          return col.badge(value).text;
        }
        if (col.format) {
          return col.format(value);
        }
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      })
    );

    // Create header rows
    const headerRows = [
      [this.entityName().toUpperCase()],
      [`Exportado em: ${dateStr} às ${timeStr}`],
      [`Total de registros: ${data.length}`],
      [], // Empty row for spacing
    ];

    const worksheetData = [...headerRows, columnHeaders, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

    // Auto-adjust column widths
    const colWidths = columnHeaders.map((header) => ({
      wch: Math.max(header.length, 15),
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, this.generateFileName('xlsx'));
  }

  private exportToPDF(data: Record<string, unknown>[]): void {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR');

    const columnHeaders = this.columns().map((col) => col.header);
    const columns = this.columns();

    const rows: string[][] = data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) {
          return '';
        }
        if (col.badge) {
          return col.badge(value).text;
        }
        if (col.format) {
          return col.format(value);
        }
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return String(value);
      })
    );

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add header
    doc.setFontSize(14);
    doc.text(this.entityName().toUpperCase(), 10, 10);
    doc.setFontSize(10);
    doc.text(`Exportado em: ${dateStr} às ${timeStr}`, 10, 18);
    doc.text(`Total de registros: ${data.length}`, 10, 24);

    // Add table with margin to accommodate header
    autoTable(doc, {
      head: [columnHeaders],
      body: rows,
      margin: { top: 30, right: 10, bottom: 15, left: 10 },
    });

    // Add page numbers and footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    doc.save(this.generateFileName('pdf'));
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
