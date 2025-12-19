import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { ProfilesService, ProfileResponse } from '../../../core/services/profiles.service';
import { ClinicAgendaConfigService } from '../../../core/services';
import { ClinicAgendaConfig } from '../../../core/models';
import { IconComponent } from '../../../shared/ui/icon.component';
import { AlertService } from '../../../shared/ui/alert.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="min-h-screen">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <!-- Header -->
        <div class="mb-6 sm:mb-8">
          <h1 class="text-2xl sm:text-4xl font-bold text-gray-900">Configurações da Conta</h1>
          <p class="text-sm sm:text-base text-gray-600 mt-2">
            Gerencie suas informações pessoais e de segurança
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Sidebar - Menu -->
          <div class="lg:col-span-1">
            <nav class="bg-white rounded-lg shadow-sm p-4 sm:p-4 sticky top-8 space-y-2">
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm sm:text-base font-medium transition cursor-pointer"
                [ngClass]="
                  activeSection() === 'perfil'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                "
                (click)="setActiveSection('perfil')"
              >
                <app-icon [name]="'user'" [size]="20"></app-icon>
                <span>Meu Perfil</span>
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm sm:text-base font-medium transition cursor-pointer"
                [ngClass]="
                  activeSection() === 'configuracoes'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                "
                (click)="setActiveSection('configuracoes')"
              >
                <app-icon [name]="'settings'" [size]="20"></app-icon>
                <span>Configurações</span>
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm sm:text-base text-gray-700 hover:bg-gray-100 transition cursor-not-allowed"
                disabled
              >
                <app-icon [name]="'shield-01'" [size]="20"></app-icon>
                <span>Segurança</span>
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm sm:text-base text-gray-700 hover:bg-gray-100 transition cursor-not-allowed"
                disabled
              >
                <app-icon [name]="'notification-02'" [size]="20"></app-icon>
                <span>Notificações</span>
              </button>
            </nav>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3 space-y-6">
            <!-- SEÇÃO MEU PERFIL -->
            @if (activeSection() === 'perfil') {
              @if (profile(); as p) {
                <!-- Profile Header Card -->
                <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div class="flex items-center gap-4">
                      <div class="avatar placeholder">
                        <div
                          class="w-16 h-16 rounded-full bg-black text-white font-bold text-xl flex items-center justify-center flex-shrink-0"
                        >
                          <span>{{ p.account.person.fullName.charAt(0).toUpperCase() }}</span>
                        </div>
                      </div>
                      <div class="min-w-0">
                        <h2 class="text-2xl font-bold text-gray-900">
                          {{ p.account.person.fullName }}
                        </h2>
                        <p class="text-gray-600">{{ p.role }}</p>
                        <p class="text-sm text-gray-500">{{ p.clinic.name }}</p>
                      </div>
                    </div>
                    <button class="btn btn-primary btn-sm sm:btn-md">
                      <app-icon [name]="'edit'" [size]="18"></app-icon>
                      Editar
                    </button>
                  </div>
                </div>

                <!-- Personal Information -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-6">Informações Pessoais</h3>

                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Primeiro Nome
                      </p>
                      <p class="text-gray-900 font-medium">
                        {{ p.account.person.fullName.split(' ')[0] }}
                      </p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Sobrenome
                      </p>
                      <p class="text-gray-900 font-medium">
                        {{ p.account.person.fullName.split(' ').slice(1).join(' ') }}
                      </p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Data de Nascimento
                      </p>
                      <p class="text-gray-900 font-medium">
                        {{ p.account.person.birthDate | date: 'dd/MM/yyyy' }}
                      </p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        CPF
                      </p>
                      <p class="text-gray-900 font-medium">{{ formatCpf(p.account.person.cpf) }}</p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Gênero
                      </p>
                      <p class="text-gray-900 font-medium">
                        {{ formatGender(p.account.person.gender) }}
                      </p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Status
                      </p>
                      <p class="text-gray-900 font-medium">
                        <span
                          class="px-3 py-1 rounded-full text-sm font-medium"
                          [class.bg-green-100]="p.account.person.active"
                          [class.text-green-800]="p.account.person.active"
                          [class.bg-red-100]="!p.account.person.active"
                          [class.text-red-800]="!p.account.person.active"
                        >
                          {{ p.account.person.active ? 'Ativo' : 'Inativo' }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-6">Informações de Contato</h3>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Email
                      </p>
                      <p class="text-gray-900 font-medium break-all">{{ p.account.email }}</p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Telefone
                      </p>
                      <p class="text-gray-900 font-medium">{{ p.account.person.phone }}</p>
                    </div>
                  </div>
                </div>

                <!-- Clinic Information -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-6">Informações da Clínica</h3>

                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Nome
                      </p>
                      <p class="text-gray-900 font-medium">{{ p.clinic.name }}</p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Razão Social
                      </p>
                      <p class="text-gray-900 font-medium">{{ p.clinic.legalName }}</p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        CNPJ
                      </p>
                      <p class="text-gray-900 font-medium">{{ formatCnpj(p.clinic.cnpj) }}</p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Email
                      </p>
                      <p class="text-gray-900 font-medium break-all">{{ p.clinic.email }}</p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Telefone
                      </p>
                      <p class="text-gray-900 font-medium">{{ p.clinic.phone }}</p>
                    </div>

                    <div>
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Status
                      </p>
                      <p class="text-gray-900 font-medium">
                        <span
                          class="px-3 py-1 rounded-full text-sm font-medium"
                          [class.bg-green-100]="p.clinic.active"
                          [class.text-green-800]="p.clinic.active"
                          [class.bg-red-100]="!p.clinic.active"
                          [class.text-red-800]="!p.clinic.active"
                        >
                          {{ p.clinic.active ? 'Ativa' : 'Inativa' }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Metadata -->
                <div class="bg-white rounded-lg p-6 text-xs text-gray-500 space-y-2">
                  <p>
                    ID do Perfil: <span class="font-mono">{{ p.id }}</span>
                  </p>
                  <p>Criado em: {{ p.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
                  <p>Atualizado em: {{ p.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</p>
                </div>
              } @else {
                <!-- Loading State -->
                <div class="space-y-6">
                  @for (i of [1, 2, 3]; track i) {
                    <div class="bg-white rounded-lg shadow-sm p-6">
                      <div class="space-y-4">
                        <div class="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                        <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                        <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  }
                </div>
              }
            }

            <!-- SEÇÃO CONFIGURAÇÕES -->
            @if (activeSection() === 'configuracoes') {
              @if (isLoadingSettings()) {
                <div class="flex justify-center items-center h-96">
                  <span class="loading loading-spinner loading-lg"></span>
                </div>
              } @else if (settingsForm) {
                <div class="card bg-white shadow-sm">
                  <div class="card-body">
                    <form
                      [formGroup]="settingsForm"
                      (ngSubmit)="onSubmitSettings()"
                      class="space-y-6"
                    >
                      <!-- Seção de Horários -->
                      <div>
                        <h2
                          class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"
                        >
                          <app-icon
                            [name]="'clock'"
                            [size]="24"
                            [className]="'text-primary'"
                          ></app-icon>
                          Horários de Funcionamento
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
                            @if (settingsForm.get('workStartTime')?.hasError('required')) {
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
                            @if (settingsForm.get('workEndTime')?.hasError('required')) {
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
                        <h2
                          class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"
                        >
                          <app-icon
                            [name]="'timer-01'"
                            [size]="24"
                            [className]="'text-primary'"
                          ></app-icon>
                          Intervalo de Agendamento
                        </h2>
                        <div class="form-control w-full">
                          <label class="label">
                            <span class="label-text font-semibold">Intervalo (minutos)</span>
                          </label>
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
                          @if (
                            settingsForm.get('appointmentIntervalMinutes')?.hasError('required')
                          ) {
                            <label class="label">
                              <span class="label-text-alt text-error">Campo obrigatório</span>
                            </label>
                          }
                        </div>
                      </div>

                      <div class="divider my-2"></div>

                      <!-- Seção de Almoço -->
                      <div>
                        <h2
                          class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"
                        >
                          <app-icon
                            [name]="'spoon-and-fork'"
                            [size]="24"
                            [className]="'text-primary'"
                          ></app-icon>
                          Horário de Almoço
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
                        <h2
                          class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"
                        >
                          <app-icon
                            [name]="'calendar'"
                            [size]="24"
                            [className]="'text-primary'"
                          ></app-icon>
                          Dias da Semana
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
                      <div class="flex justify-end gap-3 mt-8">
                        <button
                          type="submit"
                          class="btn btn-primary gap-2"
                          [disabled]="!settingsForm.valid || isSavingSettings()"
                        >
                          @if (isSavingSettings()) {
                            <span class="loading loading-spinner loading-xs"></span>
                          } @else {
                            <app-icon [name]="'save'"></app-icon>
                          }
                          {{ isSavingSettings() ? 'Salvando...' : 'Salvar Configurações' }}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MyProfileComponent implements OnInit {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly profilesService = inject(ProfilesService);
  private readonly configService = inject(ClinicAgendaConfigService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  profile = signal<ProfileResponse | null>(null);
  isLoading = signal(false);
  activeSection = signal<'perfil' | 'configuracoes'>('perfil');

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
  }

  setActiveSection(section: 'perfil' | 'configuracoes'): void {
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

    this.isLoading.set(true);
    // First, get all profiles to find the current user's profile
    this.profilesService.getAll().subscribe({
      next: (profiles) => {
        // Find the profile that matches the current user's account.id
        const userProfile = profiles.find((p) => p.account.id === userId);

        if (userProfile) {
          this.profile.set(userProfile);
        } else {
          this.alertService.error('Perfil do usuário não encontrado');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao carregar perfil');
        this.isLoading.set(false);
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

    // Armazenar a configuração original para detecção de mudanças
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

    // Detectar apenas mudanças
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
        // Atualizar o original após salvar
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

    // Comparar arrays
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
