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
    <div class="space-y-8">
      <!-- Header -->
      <div class="hero-gradient rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Bem-vindo, {{ fullName }}</h1>
        <p class="text-sky-100">Sistema de Gestão Clínica FortSaúde</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card-dark shadow-lg overflow-hidden">
          <div class="h-2 bg-blue-100"></div>
          <div class="p-5 text-center">
            <p class="text-4xl font-bold text-blue-400 mb-1">{{ patientCount() }}</p>
            <p class="text-[var(--fs-text-muted)]">Pacientes Ativos</p>
          </div>
        </div>

        <div class="card-dark shadow-lg overflow-hidden">
          <div class="h-2 bg-green-100"></div>
          <div class="p-5 text-center">
            <p class="text-4xl font-bold text-green-400 mb-1">{{ appointmentsToday() }}</p>
            <p class="text-[var(--fs-text-muted)]">Atendimentos Hoje</p>
          </div>
        </div>

        <div class="card-dark shadow-lg overflow-hidden">
          <div class="h-2 bg-purple-100"></div>
          <div class="p-5 text-center">
            <p class="text-4xl font-bold text-purple-400 mb-1">{{ professionalsCount() }}</p>
            <p class="text-[var(--fs-text-muted)]">Profissionais</p>
          </div>
        </div>

        <div class="card-dark shadow-lg overflow-hidden">
          <div class="h-2 bg-orange-100"></div>
          <div class="p-5 text-center">
            <p class="text-4xl font-bold text-orange-400 mb-1">{{ appointmentsWeek() }}</p>
            <p class="text-[var(--fs-text-muted)]">Atendimentos Semana</p>
          </div>
        </div>
      </div>

      <!-- Próximos Atendimentos -->
      <div class="card-dark shadow-xl">
        <div class="px-6 pt-6 pb-2">
          <h2 class="text-xl font-bold text-slate-100">Próximos Atendimentos</h2>
        </div>
        <div class="px-2 pb-4 overflow-x-auto">
          <table class="min-w-[50rem] w-full text-left fs-dark-table">
            <thead>
              <tr>
                <th class="px-4 py-3 text-sm font-semibold text-slate-200">Paciente</th>
                <th class="px-4 py-3 text-sm font-semibold text-slate-200">Profissional</th>
                <th class="px-4 py-3 text-sm font-semibold text-slate-200">Data/Hora</th>
                <th class="px-4 py-3 text-sm font-semibold text-slate-200">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (appointment of nextAppointments(); track appointment.id) {
                <tr class="border-b border-[var(--fs-border)] last:border-0">
                  <td class="px-4 py-3">{{ appointment.patientName }}</td>
                  <td class="px-4 py-3">{{ appointment.professionalName }}</td>
                  <td class="px-4 py-3">{{ appointment.startTime | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td class="px-4 py-3">
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
        status: 'SCHEDULED',
      },
      {
        id: '2',
        patientName: 'Maria Santos',
        professionalName: 'Dra. Ana',
        startTime: new Date(),
        status: 'CONFIRMED',
      },
    ]);
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      SCHEDULED: 'status-scheduled',
      CONFIRMED: 'status-confirmed',
      COMPLETED: 'status-completed',
      NO_SHOW: 'status-no-show',
      CANCELLED: 'status-cancelled',
    };
    return statusClasses[status] || 'status-completed';
  }
}
