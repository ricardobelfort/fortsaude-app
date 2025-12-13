import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentUserService } from '../../core/services/current-user.service';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';

interface UpcomingAppointment {
  id: string;
  patientName: string;
  professionalName: string;
  startTime: string | Date;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatusBadgePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div
        class="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg sm:rounded-2xl p-4 sm:p-8 text-white shadow-sm"
      >
        <h1 class="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 break-words">
          Bem-vindo, {{ fullName }}
        </h1>
        <p class="text-xs sm:text-base text-indigo-100">
          Sistema de Gestão Clínica Multidisciplinar
        </p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          class="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="p-3 sm:p-6 text-center">
            <p class="text-2xl sm:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">
              {{ patientCount() }}
            </p>
            <p class="text-xs sm:text-sm text-slate-600 break-words">Pacientes Ativos</p>
          </div>
        </div>

        <div
          class="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="p-3 sm:p-6 text-center">
            <p class="text-2xl sm:text-4xl font-bold text-green-600 mb-1 sm:mb-2">
              {{ appointmentsToday() }}
            </p>
            <p class="text-xs sm:text-sm text-slate-600 break-words">Atendimentos Hoje</p>
          </div>
        </div>

        <div
          class="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="p-3 sm:p-6 text-center">
            <p class="text-2xl sm:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">
              {{ professionalsCount() }}
            </p>
            <p class="text-xs sm:text-sm text-slate-600 break-words">Profissionais</p>
          </div>
        </div>

        <div
          class="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div class="p-3 sm:p-6 text-center">
            <p class="text-2xl sm:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">
              {{ appointmentsWeek() }}
            </p>
            <p class="text-xs sm:text-sm text-slate-600 break-words">Atendimentos Semana</p>
          </div>
        </div>
      </div>

      <!-- Próximos Atendimentos -->
      <div
        class="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div class="px-3 sm:px-6 py-3 sm:py-5 border-b border-slate-200">
          <h2 class="text-base sm:text-xl font-bold text-slate-900">Próximos Atendimentos</h2>
        </div>

        <!-- Mobile View - Cards -->
        <div class="block sm:hidden divide-y divide-slate-200">
          @for (appointment of nextAppointments(); track appointment.id) {
            <div class="p-4 space-y-3">
              <div class="flex justify-between items-start gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-slate-500 uppercase font-semibold">Paciente</p>
                  <p class="text-sm font-medium text-slate-900 truncate">
                    {{ appointment.patientName }}
                  </p>
                </div>
                <span
                  [ngClass]="(appointment.status | statusBadge).className"
                  class="text-xs font-semibold whitespace-nowrap"
                >
                  {{ (appointment.status | statusBadge).text }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-xs text-slate-500 uppercase font-semibold">Data/Hora</p>
                  <p class="text-xs text-slate-700">
                    {{ appointment.startTime | date: 'dd/MM HH:mm' }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase font-semibold">Profissional</p>
                  <p class="text-xs text-slate-700 truncate">{{ appointment.professionalName }}</p>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Desktop View - Table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="min-w-full w-full">
            <thead class="bg-slate-50">
              <tr>
                <th
                  class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Paciente
                </th>
                <th
                  class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Profissional
                </th>
                <th
                  class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Data/Hora
                </th>
                <th
                  class="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              @for (appointment of nextAppointments(); track appointment.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                    {{ appointment.patientName }}
                  </td>
                  <td class="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900">
                    {{ appointment.professionalName }}
                  </td>
                  <td class="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">
                    {{ appointment.startTime | date: 'dd/MM HH:mm' }}
                  </td>
                  <td class="px-3 sm:px-6 py-3 sm:py-4">
                    <span [ngClass]="(appointment.status | statusBadge).className">
                      {{ (appointment.status | statusBadge).text }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly currentUserService = inject(CurrentUserService);

  fullName = this.currentUserService.getFullName();

  patientCount = signal(0);
  appointmentsToday = signal(0);
  professionalsCount = signal(0);
  appointmentsWeek = signal(0);
  nextAppointments = signal<UpcomingAppointment[]>([]);

  ngOnInit(): void {
    // TODO: Carregar dados da API
    this.patientCount.set(128);
    this.appointmentsToday.set(12);
    this.professionalsCount.set(15);
    this.appointmentsWeek.set(58);
    this.nextAppointments.set([
      {
        id: '1',
        patientName: 'João Silva',
        professionalName: 'Dr. Carlos',
        startTime: new Date(),
        status: 'AGENDADO',
      },
      {
        id: '2',
        patientName: 'Maria Santos',
        professionalName: 'Dra. Ana',
        startTime: new Date(),
        status: 'CONFIRMADO',
      },
    ]);
  }
}
