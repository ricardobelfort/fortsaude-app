import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { EvolutionsService } from '../../../../core/services';

export interface EvolutionRecord {
  id: string;
  dateTime: string | Date;
  notes: string;
}

@Component({
  selector: 'app-evolutions-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    TableModule,
  ],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="space-y-6">
      <div class="flex justify-end">
        <button
          pButton
          type="button"
          icon="pi pi-plus"
          label="Nova Evolução"
          severity="success"
          (click)="openDialog()"
        ></button>
      </div>

      @if (evolutions().length > 0) {
        <div class="space-y-4">
          @for (evolution of evolutions(); track evolution.id) {
            <div class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <p class="text-sm text-gray-500">
                    {{ evolution.dateTime | date: 'dd/MM/yyyy HH:mm' }}
                  </p>
                  <p class="text-gray-900 font-semibold">Evolução</p>
                </div>
                <div class="space-x-2">
                  <button
                    pButton
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
                    [text]="true"
                    (click)="deleteEvolution(evolution.id)"
                  ></button>
                </div>
              </div>
              <p class="text-gray-700">{{ evolution.notes }}</p>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12 text-gray-500">
          <p class="icon pi pi-inbox mb-4" style="font-size: 3rem;"></p>
          <p>Nenhuma evolução registrada</p>
        </div>
      }
    </div>

    <!-- Dialog -->
    <p-dialog
      [(visible)]="showDialog"
      header="Nova Evolução"
      [modal]="true"
      [style]="{ width: '50vw' }"
      [breakpoints]="{ '960px': '75vw', '640px': '90vw' }"
    >
      <form [formGroup]="form" (ngSubmit)="saveEvolution()" class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> Notas da Evolução </label>
          <textarea
            formControlName="notes"
            rows="5"
            placeholder="Descreva a evolução do paciente"
            class="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
          ></textarea>
        </div>
        <div class="flex justify-end gap-3">
          <button
            pButton
            type="button"
            label="Cancelar"
            severity="secondary"
            (click)="showDialog = false"
          ></button>
          <button
            pButton
            type="submit"
            label="Salvar"
            [loading]="isLoading()"
            [disabled]="!form.valid || isLoading()"
          ></button>
        </div>
      </form>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolutionsListComponent {
  readonly patientId = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly evolutionsService = inject(EvolutionsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  evolutions = signal<EvolutionRecord[]>([]);
  isLoading = signal(false);
  showDialog = false;

  form = this.fb.group({
    notes: ['', Validators.required],
  });

  ngOnInit() {
    this.loadEvolutions();
  }

  private loadEvolutions(): void {
    this.evolutionsService.getByPatientId(this.patientId()).subscribe({
      next: (evolutions) => {
        this.evolutions.set(evolutions);
      },
    });
  }

  openDialog(): void {
    this.form.reset();
    this.showDialog = true;
  }

  saveEvolution(): void {
    if (!this.form.valid) return;

    this.isLoading.set(true);
    const { notes } = this.form.value;

    const dto = {
      professionalId: 'temp-id', // TODO: Get from auth service
      dateTime: new Date(),
      notes: notes || '',
      structuredData: {},
    };

    this.evolutionsService.create(this.patientId(), dto).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Evolução registrada com sucesso',
        });
        this.showDialog = false;
        this.isLoading.set(false);
        this.loadEvolutions();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao registrar evolução',
        });
        this.isLoading.set(false);
      },
    });
  }

  deleteEvolution(id: string): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja deletar esta evolução?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.evolutionsService.delete(this.patientId(), id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Evolução deletada com sucesso',
            });
            this.loadEvolutions();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao deletar evolução',
            });
          },
        });
      },
    });
  }
}
