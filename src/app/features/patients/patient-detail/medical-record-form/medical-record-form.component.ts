import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MedicalRecordsService } from '../../../../core/services';
import { AlertService } from '../../../../shared/ui/alert.service';

interface MedicalRecordData {
  mainIssue?: string;
  anamnesis?: string;
  generalNotes?: string;
}

@Component({
  selector: 'app-medical-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="saveMedicalRecord()" class="space-y-6">
      <div>
        <label class="fs-label"> Queixa Principal </label>
        <textarea
          formControlName="mainIssue"
          rows="3"
          placeholder="Descreva a queixa principal do paciente"
          class="fs-textarea"
        ></textarea>
      </div>

      <div>
        <label class="fs-label"> Anamnese </label>
        <textarea
          formControlName="anamnesis"
          rows="5"
          placeholder="Histórico clínico do paciente"
          class="fs-textarea"
        ></textarea>
      </div>

      <div>
        <label class="fs-label"> Observações Gerais </label>
        <textarea
          formControlName="generalNotes"
          rows="4"
          placeholder="Notas adicionais"
          class="fs-textarea"
        ></textarea>
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

      <div class="flex gap-4">
        <button type="submit" class="btn btn-neutral" [disabled]="!form.valid || isLoading()">
          {{ isLoading() ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalRecordFormComponent {
  readonly patientId = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly medicalRecordsService = inject(MedicalRecordsService);
  private readonly alertService = inject(AlertService);

  form = this.fb.group({
    mainIssue: ['', Validators.required],
    anamnesis: ['', Validators.required],
    generalNotes: [''],
  });

  isLoading = signal(false);
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
              anamnesis: data.anamnesis,
              generalNotes: data.generalNotes,
            });
          }
        }
      },
    });
  }

  saveMedicalRecord(): void {
    if (!this.form.valid) return;

    this.isLoading.set(true);
    const { mainIssue, anamnesis, generalNotes } = this.form.value;

    const dto = {
      patientId: this.patientId(),
      mainIssue: mainIssue || '',
      anamnesis: anamnesis || '',
      generalNotes: generalNotes || '',
    };

    // TODO: Adjust based on actual backend response
    // For now, we'll treat this as a create operation
    this.medicalRecordsService.create(this.patientId(), dto).subscribe({
      next: () => {
        this.alertService.success('Prontuário salvo com sucesso');
        this.feedback.set({ type: 'success', message: 'Prontuário salvo com sucesso' });
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
