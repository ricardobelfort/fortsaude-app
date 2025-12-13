import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { ProfilesService, ProfileResponse } from '../../../core/services/profiles.service';
import { IconComponent } from '../../../shared/ui/icon.component';
import { AlertService } from '../../../shared/ui/alert.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="min-h-screen">
      <div class="max-w-full mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900">Configurações da Conta</h1>
          <p class="text-gray-600 mt-2">Gerencie suas informações pessoais e de segurança</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Sidebar - Menu -->
          <div class="lg:col-span-1">
            <nav class="bg-white rounded-lg shadow-sm p-6 sticky top-8 space-y-2">
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium bg-primary text-white cursor-pointer transition"
              >
                <app-icon [name]="'user'" [size]="20"></app-icon>
                <span>Meu Perfil</span>
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                disabled
              >
                <app-icon [name]="'shield'" [size]="20"></app-icon>
                <span>Segurança</span>
              </button>
              <button
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                disabled
              >
                <app-icon [name]="'notification'" [size]="20"></app-icon>
                <span>Notificações</span>
              </button>
            </nav>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3 space-y-6">
            @if (profile(); as p) {
              <!-- Profile Header Card -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="avatar placeholder">
                      <div
                        class="w-16 h-16 rounded-full bg-black text-white font-bold text-xl flex items-center justify-center"
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
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MyProfileComponent implements OnInit {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly profilesService = inject(ProfilesService);
  private readonly alertService = inject(AlertService);

  profile = signal<ProfileResponse | null>(null);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadProfile();
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
