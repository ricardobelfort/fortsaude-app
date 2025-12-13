import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../../../../core/services';
import { IconComponent } from '../../../../shared/ui/icon.component';
import { SpinnerComponent } from '../../../../shared/ui/spinner.component';

interface DocumentRecord {
  id: string;
  fileName: string;
  fileSize: number;
  documentType: string;
  createdAt: string | Date;
  url?: string;
}

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [CommonModule, IconComponent, SpinnerComponent],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <app-spinner [size]="16"></app-spinner>
            <p class="mt-4 text-gray-600">Carregando documentos...</p>
          </div>
        </div>
      } @else {
        @if (documents().length > 0) {
          <div class="space-y-3">
            @for (doc of documents(); track doc.id) {
              <div
                class="card bg-base-100 border border-base-300 p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 flex-1">
                    <app-icon [name]="'file'" class="w-6 h-6 text-base-content/60"></app-icon>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-base-content truncate">{{ doc.fileName }}</p>
                      <p class="text-sm text-base-content/60">
                        {{ formatFileSizePublic(doc.fileSize) }} • {{ doc.documentType }}
                      </p>
                      <p class="text-xs text-base-content/40">
                        {{ doc.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button type="button" class="btn btn-sm btn-ghost" disabled title="Download">
                      <app-icon [name]="'download-cloud'" class="w-4 h-4"></app-icon>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-ghost text-error"
                      disabled
                      title="Excluir"
                    >
                      <app-icon [name]="'trash-2'" class="w-4 h-4"></app-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center py-24">
            <app-icon [name]="'file'" class="w-16 h-16 mb-4 text-base-content/20"></app-icon>
            <p class="text-lg font-semibold text-base-content/60">Nenhum documento enviado</p>
            <p class="text-sm text-base-content/40 mt-1">
              Os documentos serão adicionados na aba de Prontuário
            </p>
          </div>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsListComponent {
  readonly patientId = input.required<string>();

  private readonly documentsService = inject(DocumentsService);

  documents = signal<DocumentRecord[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadDocuments();
  }

  private loadDocuments(): void {
    this.documentsService.getByPatientId(this.patientId()).subscribe({
      next: (docs) => {
        const mapped = (docs as unknown as Array<unknown>).map((doc: unknown) => {
          const d = doc as Record<string, unknown>;
          return {
            id: String(d['id'] || ''),
            fileName: String(d['fileName'] || 'Documento'),
            fileSize: Number(d['fileSize'] || 0),
            documentType: String(d['documentType'] || 'OTHER'),
            createdAt: (d['createdAt'] as string | Date) || new Date(),
            url: d['url'] ? String(d['url']) : undefined,
          } as DocumentRecord;
        });
        this.documents.set(mapped);
      },
    });
  }

  formatFileSizePublic(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
