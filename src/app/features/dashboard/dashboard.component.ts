import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentUserService } from '../../core/services/current-user.service';

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
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div
        class="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl p-8 text-white shadow-sm"
      >
        <h1 class="text-3xl font-bold mb-2">Bem-vindo, {{ fullName }}</h1>
        <p class="text-indigo-100">Sistema de Gestão Clínica FortSaúde</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-6 text-center">
            <p class="text-4xl font-bold text-blue-600 mb-2">{{ patientCount() }}</p>
            <p class="text-sm text-slate-600">Pacientes Ativos</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-6 text-center">
            <p class="text-4xl font-bold text-green-600 mb-2">{{ appointmentsToday() }}</p>
            <p class="text-sm text-slate-600">Atendimentos Hoje</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-6 text-center">
            <p class="text-4xl font-bold text-purple-600 mb-2">{{ professionalsCount() }}</p>
            <p class="text-sm text-slate-600">Profissionais</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-6 text-center">
            <p class="text-4xl font-bold text-orange-600 mb-2">{{ appointmentsWeek() }}</p>
            <p class="text-sm text-slate-600">Atendimentos Semana</p>
          </div>
        </div>
      </div>

      <!-- Próximos Atendimentos -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-200">
          <h2 class="text-xl font-bold text-slate-900">Próximos Atendimentos</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full w-full">
            <thead class="bg-slate-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Paciente
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Profissional
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Data/Hora
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              @for (appointment of nextAppointments(); track appointment.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-slate-900">{{ appointment.patientName }}</td>
                  <td class="px-6 py-4 text-sm text-slate-900">
                    {{ appointment.professionalName }}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-600">
                    {{ appointment.startTime | date: 'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-6 py-4">
                    <span class="stat-pill" [ngClass]="getStatusClass(appointment.status)">
                      {{ appointment.status }}
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

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      AGENDADO: 'status-scheduled',
      CONFIRMADO: 'status-confirmed',
      COMPLETED: 'status-completed',
      NO_SHOW: 'status-no-show',
      CANCELLED: 'status-cancelled',
    };
    return statusClasses[status] || 'status-completed';
  }
}
