import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MedicalRecordsService } from '../../../../core/services';

interface MedicalRecordData {
  mainIssue?: string;
  anamnesis?: string;
  generalNotes?: string;
}

@Component({
  selector: 'app-medical-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ToastModule],
  template: `
    <p-toast></p-toast>
    <form [formGroup]="form" (ngSubmit)="saveMedicalRecord()" class="space-y-6">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2"> Queixa Principal </label>
        <textarea
          pInputTextarea
          formControlName="mainIssue"
          rows="3"
          placeholder="Descreva a queixa principal do paciente"
          class="w-full"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2"> Anamnese </label>
        <textarea
          pInputTextarea
          formControlName="anamnesis"
          rows="5"
          placeholder="Histórico clínico do paciente"
          class="w-full"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2"> Observações Gerais </label>
        <textarea
          pInputTextarea
          formControlName="generalNotes"
          rows="4"
          placeholder="Notas adicionais"
          class="w-full"
        ></textarea>
      </div>

      <div class="flex gap-4">
        <button
          pButton
          type="submit"
          label="Salvar"
          icon="pi pi-check"
          [loading]="isLoading()"
          [disabled]="!form.valid || isLoading()"
        ></button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalRecordFormComponent {
  readonly patientId = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly medicalRecordsService = inject(MedicalRecordsService);
  private readonly messageService = inject(MessageService);

  form = this.fb.group({
    mainIssue: ['', Validators.required],
    anamnesis: ['', Validators.required],
    generalNotes: [''],
  });

  isLoading = signal(false);

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
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Prontuário salvo com sucesso',
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao salvar prontuário',
        });
        this.isLoading.set(false);
      },
    });
  }
}
