import { Component, ChangeDetectionStrategy, inject, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EvolutionsService } from '../../../../core/services';
import { AlertService } from '../../../../shared/ui/alert.service';
import { IconComponent } from '../../../../shared/ui/icon.component';
import { SpinnerComponent } from '../../../../shared/ui/spinner.component';

export interface EvolutionRecord {
  id: string;
  dateTime: string | Date;
  notes: string;
}

@Component({
  selector: 'app-evolutions-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, SpinnerComponent],
  styleUrls: ['./evolutions-list.component.css'],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <app-spinner [size]="16"></app-spinner>
            <p class="mt-4 text-gray-600">Carregando evoluções...</p>
          </div>
        </div>
      } @else if (evolutions().length > 0) {
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Timeline de Evoluções</h2>
            <button type="button" class="btn btn-primary" (click)="openDialog()">
              <app-icon [name]="'plus'"></app-icon>
              Nova Evolução
            </button>
          </div>

          <!-- Custom Timeline -->
          <div class="timeline-container">
            <!-- Vertical line -->
            <div class="timeline-line"></div>

            <!-- Timeline items -->
            @for (evolution of evolutions(); track evolution.id) {
              <div class="timeline-item">
                <!-- Dot -->
                <div class="timeline-dot"></div>

                <!-- Card -->
                <div class="timeline-content">
                  <span class="timeline-time">{{ evolution.dateTime | date: 'HH:mm' }}</span>
                  <div class="timeline-date">{{ evolution.dateTime | date: 'dd/MM/yyyy' }}</div>
                  <p class="timeline-notes">{{ evolution.notes }}</p>
                  <button
                    class="timeline-delete-btn"
                    (click)="deleteEvolution(evolution.id)"
                    type="button"
                    title="Deletar evolução"
                  >
                    <app-icon [name]="'delete'" [size]="20"></app-icon>
                    Remover
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="timeline-empty">
          <div class="timeline-empty-icon">
            <app-icon [name]="'file-text'" [size]="32" [className]="'text-gray-400'"></app-icon>
          </div>
          <p class="timeline-empty-title">Nenhuma evolução registrada</p>
          <p class="timeline-empty-text">Comece a registrar o progresso do paciente</p>
          <button class="btn btn-neutral" (click)="openDialog()">
            <app-icon [name]="'plus'"></app-icon>
            Nova Evolução
          </button>
        </div>
      }
    </div>

    <!-- Dialog -->
    @if (showDialog) {
      <div
        class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto animate-fade-in"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-16 mb-10 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Nova Evolução</h3>
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700 transition-colors"
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
              <button type="button" class="btn btn-outline" (click)="showDialog = false">
                Cancelar
              </button>
              <button type="submit" class="btn btn-neutral" [disabled]="!form.valid || isLoading()">
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

  constructor() {
    effect(() => {
      // Re-load evolutions whenever patientId changes
      this.patientId();
      this.loadEvolutions();
    });
  }

  private loadEvolutions(): void {
    this.isLoading.set(true);

    // Mock data for testing while API is down
    const mockEvolutions: EvolutionRecord[] = [
      {
        id: '1',
        dateTime: new Date('2025-12-19T14:30:00'),
        notes:
          'Paciente apresenta melhora significativa nos sintomas. Inflamação reduzida em 40%. Recomenda-se continuar com tratamento atual por mais 2 semanas.',
      },
      {
        id: '2',
        dateTime: new Date('2025-12-15T10:15:00'),
        notes:
          'Primeira consulta. Paciente relata dores nas costas que iniciaram há 1 semana. Realizado exame físico completo. Prescrito anti-inflamatório e fisioterapia.',
      },
      {
        id: '3',
        dateTime: new Date('2025-12-12T16:45:00'),
        notes:
          'Resultado dos exames de sangue dentro dos limites normais. Pressão arterial estável. Paciente orientado sobre hábitos alimentares e atividade física.',
      },
    ];

    // Simulate API delay
    setTimeout(() => {
      this.evolutions.set(mockEvolutions);
      this.isLoading.set(false);
    }, 500);
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
