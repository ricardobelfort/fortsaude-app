import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MedicalRecordsService } from '../../../../core/services';
import { CreateMedicalRecordDto } from '../../../../core/models';
import { AlertService } from '../../../../shared/ui/alert.service';
import { IconComponent } from '../../../../shared/ui/icon.component';

interface MedicalRecordData {
  mainIssue?: string;
  anamnesis?: { historia?: string } | string;
  generalNotes?: string;
}

interface DocumentFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

@Component({
  selector: 'app-medical-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="saveMedicalRecord()" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Coluna Esquerda: Campos de Preenchimento -->
        <div class="space-y-4">
          <fieldset class="fieldset">
            <label class="text-sm font-semibold"> Queixa Principal </label>
            <textarea
              formControlName="mainIssue"
              rows="3"
              placeholder="Descreva a queixa principal do paciente"
              class="textarea textarea-md w-full"
            ></textarea>
          </fieldset>

          <fieldset class="fieldset">
            <label class="text-sm font-semibold"> Anamnese </label>
            <textarea
              formControlName="anamnesis"
              rows="5"
              placeholder="Histórico clínico do paciente"
              class="textarea textarea-md w-full"
            ></textarea>
          </fieldset>

          <fieldset class="fieldset">
            <label class="text-sm font-semibold"> Observações Gerais </label>
            <textarea
              formControlName="generalNotes"
              rows="4"
              placeholder="Notas adicionais"
              class="textarea textarea-md w-full"
            ></textarea>
          </fieldset>
        </div>

        <!-- Coluna Direita: Upload e Arquivos -->
        <div class="space-y-4">
          <div>
            <p class="text-sm font-semibold block mb-2">Arquivos Anexados</p>
            <!-- Drop Zone -->
            <div
              class="flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              (click)="fileInput.click()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              [class.border-primary]="isDragging()"
              [class.bg-primary/10]="isDragging()"
            >
              <app-icon [name]="'documents'" [size]="36"></app-icon>
              <p class="text-sm font-semibold text-base-content mt-3">Clique ou arraste arquivos</p>
              <p class="text-xs text-base-content/60">PDF, DOC, DOCX, JPG, PNG</p>
              <input
                #fileInput
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                (change)="onFileSelected($event)"
              />
            </div>

            <!-- Lista de Documentos Selecionados -->
            @if (selectedFiles().length > 0) {
              <div class="space-y-2 mt-4">
                <p class="text-xs font-semibold text-base-content/60 uppercase">
                  {{ selectedFiles().length }} arquivo(s) selecionado(s)
                </p>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  @for (file of selectedFiles(); track $index) {
                    <div
                      class="flex items-center justify-between p-2 bg-base-100 border border-base-300 rounded hover:border-primary transition-colors"
                    >
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <app-icon [name]="'files'" [size]="18"></app-icon>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-medium text-base-content truncate">
                            {{ file.name }}
                          </p>
                          <p class="text-xs text-base-content/50">
                            {{ formatFileSize(file.size) }}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="btn btn-soft btn-secondary"
                        (click)="removeFile($index)"
                        title="Remover arquivo"
                      >
                        <app-icon [name]="'delete'" [size]="18"></app-icon>
                      </button>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <p class="text-xs text-base-content/40 text-center mt-3">
                Nenhum arquivo selecionado
              </p>
            }
          </div>
        </div>
      </div>

      @if (feedback(); as fb) {
        <div
          class="alert alert-soft"
          [class.alert-success]="fb.type === 'success'"
          [class.alert-error]="fb.type === 'error'"
        >
          <span>{{ fb.message }}</span>
        </div>
      }

      <div class="flex gap-4 pt-4">
        <button type="submit" class="btn btn-primary" [disabled]="!form.valid || isLoading()">
          @if (isLoading()) {
            <span class="loading loading-spinner"></span>
            Salvando...
          } @else {
            Salvar Prontuário
          }
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalRecordFormComponent {
  readonly patientId = input.required<string>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private readonly medicalRecordsService = inject(MedicalRecordsService);
  private readonly alertService = inject(AlertService);

  form = this.fb.group({
    mainIssue: ['', Validators.required],
    anamnesis: ['', Validators.required],
    generalNotes: [''],
  });

  isLoading = signal(false);
  isDragging = signal(false);
  selectedFiles = signal<DocumentFile[]>([]);
  feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  ngOnInit() {
    this.loadMedicalRecord();
  }

  private loadMedicalRecord(): void {
    this.medicalRecordsService.getByPatientId(this.patientId()).subscribe({
      next: (record) => {
        // Check if record exists (could be single object or array based on API)
        if (record && typeof record === 'object') {
          let data: MedicalRecordData | undefined;
          if (Array.isArray(record) && record.length > 0) {
            const rec = record[0] as unknown as MedicalRecordData;
            data = rec;
          } else if (!Array.isArray(record)) {
            data = record as unknown as MedicalRecordData;
          }
          if (data) {
            this.form.patchValue({
              mainIssue: data.mainIssue,
              anamnesis:
                typeof data.anamnesis === 'object' ? data.anamnesis?.historia : data.anamnesis,
              generalNotes: data.generalNotes,
            });
          }
        }
      },
      error: (error) => {
        console.error('Erro ao carregar prontuário:', error);
        this.alertService.error(
          'Não foi possível carregar o prontuário. Por favor, tente novamente.'
        );
        this.feedback.set({ type: 'error', message: 'Não foi possível carregar o prontuário' });
      },
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList): void {
    const newFiles: DocumentFile[] = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));

    this.selectedFiles.update((current) => [...current, ...newFiles]);
  }

  removeFile(index: number): void {
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  saveMedicalRecord(): void {
    if (!this.form.valid) return;

    this.isLoading.set(true);
    const { mainIssue, anamnesis, generalNotes } = this.form.value;

    const dto: CreateMedicalRecordDto = {
      mainIssue: mainIssue || '',
      anamnesis: anamnesis || '',
      generalNotes: generalNotes || '',
    };

    // TODO: Adjust based on actual backend response
    // For now, we'll treat this as a create operation
    this.medicalRecordsService.create(dto).subscribe({
      next: () => {
        this.alertService.success('Prontuário salvo com sucesso');
        this.feedback.set({ type: 'success', message: 'Prontuário salvo com sucesso' });
        this.selectedFiles.set([]);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao salvar prontuário');
        this.feedback.set({ type: 'error', message: 'Erro ao salvar prontuário' });
        this.isLoading.set(false);
      },
    });
  }
}
