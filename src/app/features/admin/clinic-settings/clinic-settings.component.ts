import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrentUserService, ClinicAgendaConfigService } from '../../../core/services';
import { ClinicAgendaConfig } from '../../../core/models';
import { AlertService } from '../../../shared/ui/alert.service';
import { IconComponent } from '../../../shared/ui/icon.component';

@Component({
  selector: 'app-clinic-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="min-h-screen bg-base-200 p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-base-900 mb-2">Configurações de Agenda</h1>
          <p class="text-base-600">
            Configure os horários de funcionamento e intervalo de agendamentos
          </p>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center items-center h-96">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        } @else if (form) {
          <div class="card bg-white shadow-lg">
            <div class="card-body">
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
                <!-- Seção de Horários -->
                <div>
                  <h2 class="text-xl font-semibold text-base-900 mb-4 flex items-center gap-2">
                    <span class="text-2xl">🕐</span> Horários de Funcionamento
                  </h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control w-full">
                      <label class="label">
                        <span class="label-text font-semibold">Horário de Início</span>
                      </label>
                      <input
                        type="time"
                        formControlName="workStartTime"
                        class="input input-bordered input-sm w-full"
                      />
                      @if (form.get('workStartTime')?.hasError('required')) {
                        <label class="label">
                          <span class="label-text-alt text-error">Campo obrigatório</span>
                        </label>
                      }
                    </div>

                    <div class="form-control w-full">
                      <label class="label">
                        <span class="label-text font-semibold">Horário de Término</span>
                      </label>
                      <input
                        type="time"
                        formControlName="workEndTime"
                        class="input input-bordered input-sm w-full"
                      />
                      @if (form.get('workEndTime')?.hasError('required')) {
                        <label class="label">
                          <span class="label-text-alt text-error">Campo obrigatório</span>
                        </label>
                      }
                    </div>
                  </div>
                </div>

                <div class="divider my-2"></div>

                <!-- Seção de Intervalo -->
                <div>
                  <h2 class="text-xl font-semibold text-base-900 mb-4 flex items-center gap-2">
                    <span class="text-2xl">⏱️</span> Intervalo de Agendamento
                  </h2>
                  <div class="form-control w-full">
                    <label class="label">
                      <span class="label-text font-semibold">Intervalo (minutos)</span>
                    </label>
                    <select
                      formControlName="appointmentIntervalMinutes"
                      class="select select-bordered select-sm w-full"
                    >
                      <option [value]="30">30 minutos</option>
                      <option [value]="40">40 minutos</option>
                      <option [value]="60">1 hora</option>
                      <option [value]="90">1.5 horas</option>
                      <option [value]="120">2 horas</option>
                    </select>
                    @if (form.get('appointmentIntervalMinutes')?.hasError('required')) {
                      <label class="label">
                        <span class="label-text-alt text-error">Campo obrigatório</span>
                      </label>
                    }
                  </div>
                </div>

                <div class="divider my-2"></div>

                <!-- Seção de Almoço -->
                <div>
                  <h2 class="text-xl font-semibold text-base-900 mb-4 flex items-center gap-2">
                    <span class="text-2xl">🍽️</span> Horário de Almoço
                  </h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control w-full">
                      <label class="label">
                        <span class="label-text font-semibold">Início</span>
                      </label>
                      <input
                        type="time"
                        formControlName="lunchStartTime"
                        class="input input-bordered input-sm w-full"
                      />
                    </div>

                    <div class="form-control w-full">
                      <label class="label">
                        <span class="label-text font-semibold">Término</span>
                      </label>
                      <input
                        type="time"
                        formControlName="lunchEndTime"
                        class="input input-bordered input-sm w-full"
                      />
                    </div>
                  </div>
                </div>

                <div class="divider my-2"></div>

                <!-- Seção de Dias Ativos -->
                <div>
                  <h2 class="text-xl font-semibold text-base-900 mb-4 flex items-center gap-2">
                    <span class="text-2xl">📅</span> Dias da Semana
                  </h2>
                  <div class="flex flex-wrap gap-3">
                    @for (day of weekDays; track day.value) {
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          [checked]="activeDays().includes(day.value)"
                          (change)="toggleDay(day.value)"
                          class="checkbox checkbox-sm"
                        />
                        <span class="label-text font-medium">{{ day.label }}</span>
                      </label>
                    }
                  </div>
                </div>

                <!-- Botões -->
                <div class="card-actions justify-end mt-8">
                  <button
                    type="submit"
                    class="btn btn-primary gap-2"
                    [disabled]="!form.valid || isSaving()"
                  >
                    @if (isSaving()) {
                      <span class="loading loading-spinner loading-xs"></span>
                    } @else {
                      <app-icon [name]="'save'"></app-icon>
                    }
                    {{ isSaving() ? 'Salvando...' : 'Salvar Configurações' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly alertService = inject(AlertService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly configService = inject(ClinicAgendaConfigService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = signal(true);
  isSaving = signal(false);
  activeDays = signal<number[]>([]);

  weekDays = [
    { label: 'Segunda', value: 1 },
    { label: 'Terça', value: 2 },
    { label: 'Quarta', value: 3 },
    { label: 'Quinta', value: 4 },
    { label: 'Sexta', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 0 },
  ];

  form = this.fb.group({
    workStartTime: ['08:00', Validators.required],
    workEndTime: ['18:30', Validators.required],
    appointmentIntervalMinutes: [40, Validators.required],
    lunchStartTime: ['12:00'],
    lunchEndTime: ['13:00'],
  });

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    const clinicId = this.currentUserService.getClinicId();
    if (!clinicId) {
      this.alertService.error('Clínica não identificada');
      this.isLoading.set(false);
      return;
    }

    this.configService.getClinicAgendaConfig(clinicId).subscribe({
      next: (config) => {
        this.populateForm(config);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erro ao carregar configurações:', err);
        this.alertService.error('Erro ao carregar configurações');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private populateForm(config: ClinicAgendaConfig): void {
    this.form.patchValue({
      workStartTime: config.workStartTime,
      workEndTime: config.workEndTime,
      appointmentIntervalMinutes: config.appointmentIntervalMinutes,
      lunchStartTime: config.lunchStartTime || '',
      lunchEndTime: config.lunchEndTime || '',
    });
    this.activeDays.set(config.activeDays);
  }

  toggleDay(day: number): void {
    const current = this.activeDays();
    if (current.includes(day)) {
      this.activeDays.set(current.filter((d) => d !== day));
    } else {
      this.activeDays.set([...current, day].sort());
    }
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.isSaving.set(true);
    const clinicId = this.currentUserService.getClinicId();
    if (!clinicId) {
      this.alertService.error('Clínica não identificada');
      this.isSaving.set(false);
      return;
    }

    const config: ClinicAgendaConfig = {
      clinicId,
      workStartTime: this.form.get('workStartTime')?.value || '08:00',
      workEndTime: this.form.get('workEndTime')?.value || '18:30',
      appointmentIntervalMinutes: Number(this.form.get('appointmentIntervalMinutes')?.value || 40),
      lunchStartTime: this.form.get('lunchStartTime')?.value || '12:00',
      lunchEndTime: this.form.get('lunchEndTime')?.value || '13:00',
      activeDays: this.activeDays(),
    };

    this.configService.saveClinicAgendaConfig(config).subscribe({
      next: () => {
        this.alertService.success('Configurações salvas com sucesso');
        this.isSaving.set(false);
        this.configService.clearCache(clinicId);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erro ao salvar configurações:', err);
        this.alertService.error('Erro ao salvar configurações');
        this.isSaving.set(false);
        this.cdr.markForCheck();
      },
    });
  }
}
