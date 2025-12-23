import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrentUserService } from '@core/services/current-user.service';
import { ProfilesService, ProfileResponse } from '@core/services/profiles.service';
import { ClinicAgendaConfigService } from '@core/services';
import { ClinicAgendaConfig } from '@core/models';
import { IconComponent } from '@shared/ui/icon.component';
import { AlertService } from '@shared/ui/alert.service';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';

@Component({
  selector: 'app-account',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, AuditLogsComponent],
  template: `
    <div class="min-h-screen">
      <!-- Header -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Minha conta</h1>
        <p class="text-sm sm:text-base text-slate-600">
          Gerencie as informações de conta, perfil e configurações da sua clínica
        </p>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-4 md:px-8 py-6 sm:py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <!-- Sidebar Menu -->
          <nav class="md:col-span-1 space-y-2">
            <div class="bg-white rounded-lg py-2 overflow-hidden border border-slate-200">
              <button
                type="button"
                class="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition cursor-pointer border-l-1 hover:bg-indigo-200 border-indigo-200"
                [ngClass]="
                  activeSection() === 'visao-geral'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                    : 'text-slate-700 hover:bg-slate-50 border-slate-100'
                "
                (click)="setActiveSection('visao-geral')"
              >
                <div class="flex items-center gap-3">
                  <app-icon [name]="'dashboard'" [size]="20"></app-icon>
                  <span>Visão geral</span>
                </div>
                <app-icon [name]="'arrow-right'" [size]="16"></app-icon>
              </button>

              <button
                type="button"
                class="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition cursor-pointer border-l-1 hover:bg-indigo-200 border-indigo-200"
                [ngClass]="
                  activeSection() === 'dados-acesso'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                    : 'text-slate-700 hover:bg-slate-50 border-slate-100'
                "
                (click)="setActiveSection('dados-acesso')"
              >
                <div class="flex items-center gap-3">
                  <app-icon [name]="'access'" [size]="20"></app-icon>
                  <span>Dados de acesso</span>
                </div>
                <app-icon [name]="'arrow-right'" [size]="16"></app-icon>
              </button>

              <button
                type="button"
                class="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition cursor-pointer border-l-1 hover:bg-indigo-200 border-indigo-200"
                [ngClass]="
                  activeSection() === 'dados-pessoais'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                    : 'text-slate-700 hover:bg-slate-50 border-slate-100'
                "
                (click)="setActiveSection('dados-pessoais')"
              >
                <div class="flex items-center gap-3">
                  <app-icon [name]="'user'" [size]="20"></app-icon>
                  <span>Dados pessoais</span>
                </div>
                <app-icon [name]="'arrow-right'" [size]="16"></app-icon>
              </button>

              <button
                type="button"
                class="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition cursor-pointer border-l-1 hover:bg-indigo-200 border-indigo-200"
                [ngClass]="
                  activeSection() === 'configuracoes'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                    : 'text-slate-700 hover:bg-slate-50 border-slate-100'
                "
                (click)="setActiveSection('configuracoes')"
              >
                <div class="flex items-center gap-3">
                  <app-icon [name]="'settings'" [size]="20"></app-icon>
                  <span>Configurações</span>
                </div>
                <app-icon [name]="'arrow-right'" [size]="16"></app-icon>
              </button>

              @if (canViewAudit()) {
                <button
                  type="button"
                  class="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition cursor-pointer border-l-1 hover:bg-indigo-200 border-indigo-200"
                  [ngClass]="
                    activeSection() === 'auditoria'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-600'
                      : 'text-slate-700 hover:bg-slate-50 border-slate-100'
                  "
                  (click)="setActiveSection('auditoria')"
                >
                  <div class="flex items-center gap-3">
                    <app-icon [name]="'clipboard-check'" [size]="20"></app-icon>
                    <span>Auditoria</span>
                  </div>
                  <app-icon [name]="'arrow-right'" [size]="16"></app-icon>
                </button>
              }
            </div>
          </nav>

          <!-- Main Content -->
          <div class="md:col-span-3 space-y-6">
            <!-- VISÃO GERAL -->
            @if (activeSection() === 'visao-geral') {
              @if (profile(); as p) {
                <!-- Profile Card -->
                <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <div
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200"
                  >
                    <div class="flex items-center gap-4">
                      <div
                        class="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0"
                      >
                        {{ p.account.person.fullName.charAt(0).toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                          {{ p.account.person.fullName }}
                        </h2>
                        <p class="text-sm text-slate-600">{{ p.role }}</p>
                        <p class="text-sm text-slate-500">{{ p.clinic.name }}</p>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-primary gap-2 whitespace-nowrap">
                      <app-icon [name]="'edit'" [size]="16"></app-icon>
                      Editar
                    </button>
                  </div>

                  <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Email
                      </p>
                      <p class="text-sm text-slate-900 font-medium break-all">
                        {{ p.account.email }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        CPF
                      </p>
                      <p class="text-sm text-slate-900 font-medium">
                        {{ formatCpf(p.account.person.cpf) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Telefone
                      </p>
                      <p class="text-sm text-slate-900 font-medium">
                        {{ p.account.person.phone || '-' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Clinic Card -->
                <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 class="text-lg font-semibold text-slate-900 mb-6">Informações da Clínica</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Nome
                      </p>
                      <p class="text-sm text-slate-900 font-medium">{{ p.clinic.name }}</p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        CNPJ
                      </p>
                      <p class="text-sm text-slate-900 font-medium">
                        {{ formatCnpj(p.clinic.cnpj) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Email
                      </p>
                      <p class="text-sm text-slate-900 font-medium break-all">
                        {{ p.clinic.email }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Telefone
                      </p>
                      <p class="text-sm text-slate-900 font-medium">{{ p.clinic.phone }}</p>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                  <span class="loading loading-spinner loading-lg"></span>
                </div>
              }
            }

            <!-- DADOS DE ACESSO -->
            @if (activeSection() === 'dados-acesso') {
              @if (profile(); as p) {
                <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 class="text-lg font-semibold text-slate-900 mb-6">Dados de Acesso</h3>

                  <div class="space-y-6">
                    <div class="pb-6 border-b border-slate-200">
                      <div class="flex items-center justify-between mb-4">
                        <div>
                          <h4 class="text-sm font-semibold text-slate-900">Email</h4>
                          <p class="text-sm text-slate-600 mt-1">{{ p.account.email }}</p>
                        </div>
                        <button class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                          Alterar
                        </button>
                      </div>
                    </div>

                    <div>
                      <div class="flex items-center justify-between mb-4">
                        <div>
                          <h4 class="text-sm font-semibold text-slate-900">Senha</h4>
                          <p class="text-sm text-slate-600 mt-1">••••••••</p>
                        </div>
                        <button class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                          Alterar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            }

            <!-- DADOS PESSOAIS -->
            @if (activeSection() === 'dados-pessoais') {
              @if (profile(); as p) {
                <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 class="text-lg font-semibold text-slate-900 mb-6">Dados Pessoais</h3>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Nome Completo
                      </p>
                      <p class="text-sm text-slate-900 font-medium">
                        {{ p.account.person.fullName }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        CPF
                      </p>
                      <p class="text-sm text-slate-900 font-medium">
                        {{ formatCpf(p.account.person.cpf) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Data de Nascimento
                      </p>
                      <p class="text-sm text-slate-900 font-medium">
                        {{ p.account.person.birthDate | date: 'dd/MM/yyyy' }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Gênero
                      </p>
                      <p class="text-sm text-slate-900 font-medium">
                        {{ formatGender(p.account.person.gender) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Telefone
                      </p>
                      <p class="text-sm text-slate-900 font-medium">
                        {{ p.account.person.phone || '-' }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Status
                      </p>
                      <span
                        class="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                        [class.bg-green-100]="p.account.person.active"
                        [class.text-green-800]="p.account.person.active"
                        [class.bg-red-100]="!p.account.person.active"
                        [class.text-red-800]="!p.account.person.active"
                      >
                        {{ p.account.person.active ? 'Ativo' : 'Inativo' }}
                      </span>
                    </div>
                  </div>

                  <div class="mt-6 pt-6 border-t border-slate-200">
                    <button class="btn btn-sm btn-outline gap-2">
                      <app-icon [name]="'edit'" [size]="16"></app-icon>
                      Editar Dados Pessoais
                    </button>
                  </div>
                </div>
              }
            }

            <!-- CONFIGURAÇÕES -->
            @if (activeSection() === 'configuracoes') {
              @if (isLoadingSettings()) {
                <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                  <span class="loading loading-spinner loading-lg"></span>
                </div>
              } @else if (settingsForm) {
                <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 class="text-lg font-semibold text-slate-900 mb-6">Configurações de Agenda</h3>

                  <form
                    [formGroup]="settingsForm"
                    (ngSubmit)="onSubmitSettings()"
                    class="space-y-6"
                  >
                    <!-- Horários de Funcionamento -->
                    <div>
                      <h4 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <app-icon
                          [name]="'clock'"
                          [size]="18"
                          [className]="'text-indigo-600'"
                        ></app-icon>
                        Horários de Funcionamento
                      </h4>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="form-control w-full">
                          <label class="label">
                            <span class="label-text text-xs font-semibold text-slate-700"
                              >Horário de Início</span
                            >
                          </label>
                          <input
                            type="time"
                            formControlName="workStartTime"
                            class="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div class="form-control w-full">
                          <label class="label">
                            <span class="label-text text-xs font-semibold text-slate-700"
                              >Horário de Término</span
                            >
                          </label>
                          <input
                            type="time"
                            formControlName="workEndTime"
                            class="input input-bordered input-sm w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Intervalo de Agendamento -->
                    <div>
                      <h4 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <app-icon
                          [name]="'timer-01'"
                          [size]="18"
                          [className]="'text-indigo-600'"
                        ></app-icon>
                        Intervalo de Agendamento
                      </h4>
                      <div class="form-control w-full">
                        <select
                          formControlName="appointmentIntervalMinutes"
                          class="select select-bordered select-sm w-full"
                        >
                          <option [ngValue]="30">30 minutos</option>
                          <option [ngValue]="40">40 minutos</option>
                          <option [ngValue]="60">1 hora</option>
                          <option [ngValue]="90">1.5 horas</option>
                          <option [ngValue]="120">2 horas</option>
                        </select>
                      </div>
                    </div>

                    <!-- Horário de Almoço -->
                    <div>
                      <h4 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <app-icon
                          [name]="'spoon-and-fork'"
                          [size]="18"
                          [className]="'text-indigo-600'"
                        ></app-icon>
                        Horário de Almoço
                      </h4>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="form-control w-full">
                          <label class="label">
                            <span class="label-text text-xs font-semibold text-slate-700"
                              >Início</span
                            >
                          </label>
                          <input
                            type="time"
                            formControlName="lunchStartTime"
                            class="input input-bordered input-sm w-full"
                          />
                        </div>
                        <div class="form-control w-full">
                          <label class="label">
                            <span class="label-text text-xs font-semibold text-slate-700"
                              >Término</span
                            >
                          </label>
                          <input
                            type="time"
                            formControlName="lunchEndTime"
                            class="input input-bordered input-sm w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Dias da Semana -->
                    <div>
                      <h4 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <app-icon
                          [name]="'calendar'"
                          [size]="18"
                          [className]="'text-indigo-600'"
                        ></app-icon>
                        Dias da Semana
                      </h4>
                      <div class="flex flex-wrap gap-4">
                        @for (day of weekDays; track day.value) {
                          <label class="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              [checked]="activeDays().includes(day.value)"
                              (change)="toggleDay(day.value)"
                              class="checkbox checkbox-sm"
                            />
                            <span class="text-sm font-medium text-slate-700">{{ day.label }}</span>
                          </label>
                        }
                      </div>
                    </div>

                    <!-- Botões -->
                    <div class="pt-6 border-t border-slate-200 flex gap-3 justify-end">
                      <button type="button" class="btn btn-sm btn-ghost gap-2">Descartar</button>
                      <button
                        type="submit"
                        class="btn btn-sm btn-primary gap-2"
                        [disabled]="!settingsForm.valid || isSavingSettings()"
                      >
                        @if (isSavingSettings()) {
                          <span class="loading loading-spinner loading-xs"></span>
                        } @else {
                          <app-icon [name]="'save'" [size]="16"></app-icon>
                        }
                        {{ isSavingSettings() ? 'Salvando...' : 'Salvar Configurações' }}
                      </button>
                    </div>
                  </form>
                </div>
              }
            }

            <!-- AUDITORIA -->
            @if (activeSection() === 'auditoria' && canViewAudit()) {
              <app-audit-logs></app-audit-logs>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AccountComponent implements OnInit {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly profilesService = inject(ProfilesService);
  private readonly configService = inject(ClinicAgendaConfigService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  profile = signal<ProfileResponse | null>(null);
  activeSection = signal<
    'visao-geral' | 'dados-acesso' | 'dados-pessoais' | 'configuracoes' | 'auditoria'
  >('visao-geral');
  userRole = signal<string>('');
  canViewAudit = computed(() => {
    const role = this.userRole();
    return role === 'SYSTEM_ADMIN' || role === 'CLINIC_ADMIN';
  });

  // Clinic Settings Properties
  settingsForm!: FormGroup;
  isLoadingSettings = signal(true);
  isSavingSettings = signal(false);
  activeDays = signal<number[]>([]);
  private originalConfig: ClinicAgendaConfig | null = null;
  private originalActiveDays: number[] = [];

  weekDays = [
    { label: 'Segunda', value: 1 },
    { label: 'Terça', value: 2 },
    { label: 'Quarta', value: 3 },
    { label: 'Quinta', value: 4 },
    { label: 'Sexta', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 0 },
  ];

  ngOnInit(): void {
    this.loadProfile();
    this.initializeSettingsForm();
    this.loadSettings();
    const role = this.currentUserService.getRole();
    if (role) {
      this.userRole.set(role);
    }
  }

  setActiveSection(
    section: 'visao-geral' | 'dados-acesso' | 'dados-pessoais' | 'configuracoes' | 'auditoria'
  ): void {
    this.activeSection.set(section);
  }

  private initializeSettingsForm(): void {
    this.settingsForm = this.fb.group({
      workStartTime: ['08:00', Validators.required],
      workEndTime: ['18:30', Validators.required],
      appointmentIntervalMinutes: [40, Validators.required],
      lunchStartTime: ['12:00'],
      lunchEndTime: ['13:00'],
    });
  }

  loadProfile(): void {
    const userId = this.currentUserService.getUserId();
    if (!userId) {
      this.alertService.error('Usuário não encontrado');
      return;
    }

    this.profilesService.getAll().subscribe({
      next: (profiles) => {
        const userProfile = profiles.find((p) => p.account.id === userId);
        if (userProfile) {
          this.profile.set(userProfile);
        } else {
          this.alertService.error('Perfil do usuário não encontrado');
        }
      },
      error: () => {
        this.alertService.error('Erro ao carregar perfil');
      },
    });
  }

  private loadSettings(): void {
    const clinicId = this.currentUserService.getClinicId();
    if (!clinicId) {
      this.alertService.error('Clínica não identificada');
      this.isLoadingSettings.set(false);
      return;
    }

    this.configService.getClinicAgendaConfig(clinicId).subscribe({
      next: (config) => {
        this.populateForm(config);
        this.isLoadingSettings.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erro ao carregar configurações:', err);
        this.alertService.error('Erro ao carregar configurações');
        this.isLoadingSettings.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private populateForm(config: ClinicAgendaConfig): void {
    this.settingsForm.patchValue({
      workStartTime: config.workStartTime,
      workEndTime: config.workEndTime,
      appointmentIntervalMinutes: config.appointmentIntervalMinutes,
      lunchStartTime: config.lunchStartTime || '',
      lunchEndTime: config.lunchEndTime || '',
    });
    this.activeDays.set(config.activeDays);

    this.originalConfig = { ...config };
    this.originalActiveDays = [...config.activeDays];
  }

  toggleDay(day: number): void {
    const current = this.activeDays();
    if (current.includes(day)) {
      this.activeDays.set(current.filter((d) => d !== day));
    } else {
      this.activeDays.set([...current, day].sort());
    }
  }

  onSubmitSettings(): void {
    if (!this.settingsForm.valid) return;

    this.isSavingSettings.set(true);
    const clinicId = this.currentUserService.getClinicId();
    if (!clinicId) {
      this.alertService.error('Clínica não identificada');
      this.isSavingSettings.set(false);
      return;
    }

    const config: ClinicAgendaConfig = {
      clinicId,
      workStartTime: this.settingsForm.get('workStartTime')?.value || '08:00',
      workEndTime: this.settingsForm.get('workEndTime')?.value || '18:30',
      appointmentIntervalMinutes: Number(
        this.settingsForm.get('appointmentIntervalMinutes')?.value || 40
      ),
      lunchStartTime: this.settingsForm.get('lunchStartTime')?.value || '12:00',
      lunchEndTime: this.settingsForm.get('lunchEndTime')?.value || '13:00',
      activeDays: this.activeDays(),
    };

    const changedFields = this.getChangedFields(config);

    if (changedFields.length === 0) {
      this.alertService.success('Nenhuma alteração foi realizada');
      this.isSavingSettings.set(false);
      return;
    }

    this.configService.saveClinicAgendaConfig(config, changedFields).subscribe({
      next: () => {
        this.alertService.success('Configurações salvas com sucesso');
        this.isSavingSettings.set(false);
        this.originalConfig = { ...config };
        this.originalActiveDays = [...config.activeDays];
        this.configService.clearCache(clinicId);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erro ao salvar configurações:', err);
        this.alertService.error('Erro ao salvar configurações');
        this.isSavingSettings.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private getChangedFields(newConfig: ClinicAgendaConfig): string[] {
    const changed: string[] = [];

    if (!this.originalConfig)
      return [
        'workStartTime',
        'workEndTime',
        'appointmentIntervalMinutes',
        'lunchStartTime',
        'lunchEndTime',
        'activeDays',
      ];

    if (this.originalConfig.workStartTime !== newConfig.workStartTime)
      changed.push('workStartTime');
    if (this.originalConfig.workEndTime !== newConfig.workEndTime) changed.push('workEndTime');
    if (this.originalConfig.appointmentIntervalMinutes !== newConfig.appointmentIntervalMinutes)
      changed.push('appointmentIntervalMinutes');
    if (this.originalConfig.lunchStartTime !== newConfig.lunchStartTime)
      changed.push('lunchStartTime');
    if (this.originalConfig.lunchEndTime !== newConfig.lunchEndTime) changed.push('lunchEndTime');

    if (JSON.stringify(this.originalActiveDays) !== JSON.stringify(newConfig.activeDays)) {
      changed.push('activeDays');
    }

    return changed;
  }

  formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatCnpj(cnpj: string): string {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  formatGender(gender: string): string {
    const genders: Record<string, string> = {
      M: 'Masculino',
      F: 'Feminino',
      O: 'Outro',
    };
    return genders[gender] || gender;
  }
}
