import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../../../../core/services';
import { AlertService } from '../../../../shared/ui/alert.service';
import { IconComponent } from '../../../../shared/ui/icon.component';

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
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          (click)="triggerFileInput()"
        >
          <app-icon [name]="\'upload-cloud\'"></app-icon>
          Upload de Documento
        </button>
        <input
          #fileInput
          type="file"
          hidden
          (change)="onFileSelected($event)"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>

      @if (feedback(); as fb) {
        <div
          class="px-4 py-3 rounded-lg text-sm"
          [class.bg-green-100]="fb.type === 'success'"
          [class.text-green-800]="fb.type === 'success'"
          [class.bg-red-100]="fb.type === 'error'"
          [class.text-red-800]="fb.type === 'error'"
        >
          {{ fb.message }}
        </div>
      }

      @if (documents().length > 0) {
        <div class="space-y-3">
          @for (doc of documents(); track doc.id) {
            <div
              class="flex items-center justify-between border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition"
            >
              <div>
                <p class="font-semibold text-gray-900">{{ doc.fileName }}</p>
                <p class="text-sm text-gray-500">
                  {{ formatFileSizePublic(doc.fileSize) }} | {{ doc.documentType }}
                </p>
                <p class="text-xs text-gray-400">
                  {{ doc.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 disabled:opacity-60"
                  disabled
                  (click)="downloadDocument(doc)"
                >
                  <app-icon [name]="\'download-cloud\'"></app-icon>
                  Baixar
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800"
                  (click)="deleteDocument(doc.id)"
                >
                  <app-icon [name]="\'trash-2\'"></app-icon>
                  Excluir
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12 text-gray-500">
          <p class="text-5xl mb-4">📄</p>
          <p>Nenhum documento enviado</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsListComponent {
  readonly patientId = input.required<string>();

  private readonly documentsService = inject(DocumentsService);
  private readonly alertService = inject(AlertService);

  documents = signal<DocumentRecord[]>([]);
  isLoading = signal(false);
  feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

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

  triggerFileInput(): void {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    const file = files[0];
    this.isLoading.set(true);

    const docType = this.getDocumentType(file.name);
    this.documentsService.upload(this.patientId(), file, docType).subscribe({
      next: () => {
        this.alertService.success('Documento enviado com sucesso');
        this.feedback.set({ type: 'success', message: 'Documento enviado com sucesso' });
        this.isLoading.set(false);
        input.value = '';
        this.loadDocuments();
      },
      error: () => {
        this.alertService.error('Erro ao enviar documento');
        this.feedback.set({ type: 'error', message: 'Erro ao enviar documento' });
        this.isLoading.set(false);
      },
    });
  }

  async deleteDocument(id: string): Promise<void> {
    const confirmed = await this.alertService.confirm({
      text: 'Tem certeza que deseja deletar este documento?',
      confirmButtonText: 'Sim, deletar',
    });

    if (!confirmed) return;

    this.documentsService.delete(this.patientId(), id).subscribe({
      next: () => {
        this.alertService.success('Documento deletado com sucesso');
        this.feedback.set({ type: 'success', message: 'Documento deletado com sucesso' });
        this.loadDocuments();
      },
      error: () => {
        this.alertService.error('Erro ao deletar documento');
        this.feedback.set({ type: 'error', message: 'Erro ao deletar documento' });
      },
    });
  }

  downloadDocument(doc: DocumentRecord): void {
    // Placeholder - implement based on backend response
    console.log('Download:', doc);
  }

  private getDocumentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toUpperCase() || 'OTHER';
    if (['PDF', 'DOC', 'DOCX'].includes(ext)) return 'REPORT';
    if (['JPG', 'JPEG', 'PNG'].includes(ext)) return 'EXAM';
    return 'OTHER';
  }

  formatFileSizePublic(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
