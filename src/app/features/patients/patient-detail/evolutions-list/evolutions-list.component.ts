import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EvolutionsService } from '../../../../core/services';
import { AlertService } from '../../../../shared/ui/alert.service';
import { IconComponent } from '../../../../shared/ui/icon.component';

export interface EvolutionRecord {
  id: string;
  dateTime: string | Date;
  notes: string;
}

@Component({
  selector: 'app-evolutions-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">Evoluções</h2>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          (click)="openDialog()"
        >
          <app-icon [name]="'plus'"></app-icon>
          Nova Evolução
        </button>
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
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800"
                    (click)="deleteEvolution(evolution.id)"
                  >
                    <app-icon [name]="'trash-2'"></app-icon>
                    Remover
                  </button>
                </div>
              </div>
              <p class="text-gray-700">{{ evolution.notes }}</p>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12 text-gray-500">
          <p class="text-5xl mb-4">📄</p>
          <p>Nenhuma evolução registrada</p>
        </div>
      }
    </div>

    <!-- Dialog -->
    @if (showDialog) {
      <div class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-16 mb-10 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Nova Evolução</h3>
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700"
              (click)="showDialog = false"
            >
              <app-icon [name]="'x'"></app-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="saveEvolution()" class="space-y-6">
            <div>
              <label class="fs-label"> Notas da Evolução </label>
              <textarea
                formControlName="notes"
                rows="5"
                placeholder="Descreva a evolução do paciente"
                class="fs-textarea"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3">
              <button type="button" class="fs-button-secondary" (click)="showDialog = false">
                Cancelar
              </button>
              <button
                type="submit"
                class="fs-button-primary"
                [disabled]="!form.valid || isLoading()"
              >
                {{ isLoading() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvolutionsListComponent {
  readonly patientId = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly evolutionsService = inject(EvolutionsService);
  private readonly alertService = inject(AlertService);

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
        this.alertService.success('Evolução registrada com sucesso');
        this.showDialog = false;
        this.isLoading.set(false);
        this.loadEvolutions();
      },
      error: () => {
        this.alertService.error('Erro ao registrar evolução');
        this.isLoading.set(false);
      },
    });
  }

  async deleteEvolution(id: string): Promise<void> {
    const confirmed = await this.alertService.confirm({
      text: 'Tem certeza que deseja deletar esta evolução?',
      confirmButtonText: 'Sim, deletar',
    });

    if (!confirmed) return;

    this.evolutionsService.delete(this.patientId(), id).subscribe({
      next: () => {
        this.alertService.success('Evolução deletada com sucesso');
        this.loadEvolutions();
      },
      error: () => {
        this.alertService.error('Erro ao deletar evolução');
      },
    });
  }
}
