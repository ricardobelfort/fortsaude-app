import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DocumentsService } from '../../../../core/services';

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
  imports: [CommonModule, ButtonModule, ToastModule, ConfirmDialogModule],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="space-y-6">
      <div class="flex justify-end">
        <button
          pButton
          type="button"
          icon="pi pi-upload"
          label="Upload de Documento"
          severity="success"
          (click)="triggerFileInput()"
        ></button>
        <input
          #fileInput
          type="file"
          hidden
          (change)="onFileSelected($event)"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>

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
                  pButton
                  type="button"
                  icon="pi pi-download"
                  severity="info"
                  [text]="true"
                  [disabled]="true"
                  (click)="downloadDocument(doc)"
                ></button>
                <button
                  pButton
                  type="button"
                  icon="pi pi-trash"
                  severity="danger"
                  [text]="true"
                  (click)="deleteDocument(doc.id)"
                ></button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12 text-gray-500">
          <p class="icon pi pi-file mb-4" style="font-size: 3rem;"></p>
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
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  documents = signal<DocumentRecord[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadDocuments();
  }

  private loadDocuments(): void {
    this.documentsService.getByPatientId(this.patientId()).subscribe({
      next: (docs) => {
        // Map API response to component interface
        const mapped = (docs as unknown as Array<unknown>).map((doc: unknown) => {
          const d = doc as Record<string, unknown>;
          return {
            id: String(d['id'] || ''),
            fileName: String(d['fileName'] || 'Documento'),
            fileSize: Number(d['fileSize'] || 0),
            documentType: String(d['documentType'] || 'OTHER'),
            createdAt: (d['createdAt'] as string | Date) || new Date(),
            url: d['url'] ? String(d['url']) : undefined,
          };
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
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Documento enviado com sucesso',
        });
        this.isLoading.set(false);
        input.value = '';
        this.loadDocuments();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao enviar documento',
        });
        this.isLoading.set(false);
      },
    });
  }

  deleteDocument(id: string): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja deletar este documento?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.documentsService.delete(this.patientId(), id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Documento deletado com sucesso',
            });
            this.loadDocuments();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao deletar documento',
            });
          },
        });
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
