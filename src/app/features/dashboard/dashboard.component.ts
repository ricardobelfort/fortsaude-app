import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { TimelineModule } from 'primeng/timeline';
import { AvatarModule } from 'primeng/avatar';
import { CurrentUserService } from '../../core/services/current-user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    ChartModule,
    TimelineModule,
    AvatarModule,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
        <h1 class="text-3xl font-bold mb-2">Bem-vindo, {{ fullName }}</h1>
        <p class="text-blue-100">Sistema de Gestão Clínica FortSaúde</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <p-card class="shadow-md">
          <ng-template pTemplate="header">
            <div class="bg-blue-50 p-6"></div>
          </ng-template>
          <div class="text-center">
            <p class="text-4xl font-bold text-blue-600 mb-2">{{ patientCount() }}</p>
            <p class="text-gray-600">Pacientes Ativos</p>
          </div>
        </p-card>

        <p-card class="shadow-md">
          <ng-template pTemplate="header">
            <div class="bg-green-50 p-6"></div>
          </ng-template>
          <div class="text-center">
            <p class="text-4xl font-bold text-green-600 mb-2">{{ appointmentsToday() }}</p>
            <p class="text-gray-600">Atendimentos Hoje</p>
          </div>
        </p-card>

        <p-card class="shadow-md">
          <ng-template pTemplate="header">
            <div class="bg-purple-50 p-6"></div>
          </ng-template>
          <div class="text-center">
            <p class="text-4xl font-bold text-purple-600 mb-2">{{ professionalsCount() }}</p>
            <p class="text-gray-600">Profissionais</p>
          </div>
        </p-card>

        <p-card class="shadow-md">
          <ng-template pTemplate="header">
            <div class="bg-orange-50 p-6"></div>
          </ng-template>
          <div class="text-center">
            <p class="text-4xl font-bold text-orange-600 mb-2">{{ appointmentsWeek() }}</p>
            <p class="text-gray-600">Atendimentos Semana</p>
          </div>
        </p-card>
      </div>

      <!-- Próximos Atendimentos -->
      <p-card class="shadow-md">
        <ng-template pTemplate="header">
          <h2 class="text-xl font-bold text-gray-800 p-6">Próximos Atendimentos</h2>
        </ng-template>
        <p-table [value]="nextAppointments()" [tableStyle]="{ 'min-width': '50rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th>Paciente</th>
              <th>Profissional</th>
              <th>Data/Hora</th>
              <th>Status</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-appointment>
            <tr>
              <td>{{ appointment.patientName }}</td>
              <td>{{ appointment.professionalName }}</td>
              <td>{{ appointment.startTime | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <span
                  [class]="
                    'px-3 py-1 rounded-full text-sm font-medium ' +
                    getStatusClass(appointment.status)
                  "
                >
                  {{ appointment.status }}
                </span>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
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
  nextAppointments = signal<unknown[]>([]);

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
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      NO_SHOW: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
}
