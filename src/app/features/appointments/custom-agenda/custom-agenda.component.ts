import { Component, ChangeDetectionStrategy, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../core/models';
import { IconComponent } from '../../../shared/ui/icon.component';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  isLunch?: boolean;
}

interface DayColumn {
  day: string;
  dayName: string;
  dayIndex: number;
}

interface AgendaEvent {
  appointmentId: string;
  patientName: string;
  startTime: string;
  endTime: string;
  status: string;
  color: string;
  slotPosition: number; // qual slot começa
  slotDuration: number; // quantos slots dura
}

@Component({
  selector: 'app-custom-agenda',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="space-y-4">
      <!-- Header with week navigation -->
      <div class="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
        <button class="btn btn-outline btn-primary" (click)="previousWeek()">
          <app-icon [name]="'chevron-left'" [size]="20"></app-icon>
        </button>

        <div class="flex-1 flex items-center justify-center gap-6 px-4">
          @for (day of days; track day.dayIndex) {
            <div class="text-center">
              <div class="text-xs font-bold text-gray-900 tracking-wide">
                {{ day.dayName | slice: 0 : 3 | uppercase }}
              </div>
              <div class="text-sm font-semibold text-gray-600 mt-1">
                {{ getDayDate(day.dayIndex).split('/')[0] }}
              </div>
            </div>
          }
        </div>

        <button class="btn btn-outline btn-primary" (click)="nextWeek()">
          <app-icon [name]="'chevron-right'" [size]="20"></app-icon>
        </button>
      </div>

      <!-- Agenda Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table class="w-full border-collapse">
          <!-- Table Header -->
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th
                class="p-4 text-left font-semibold text-sm text-gray-700 border-r border-gray-200 w-20"
              >
                Horário
              </th>
              @for (day of days; track day.dayIndex) {
                <th
                  class="p-4 text-center font-semibold text-sm text-gray-900 border-gray-200"
                  [class.border-r]="day.dayIndex !== 4"
                >
                  <div>{{ day.dayName }}</div>
                  <div class="text-xs text-gray-500 font-normal mt-1">
                    {{ getDayDate(day.dayIndex) }}
                  </div>
                </th>
              }
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody>
            @for (slot of timeSlots; track slot.time) {
              <tr class="border-b border-gray-200">
                <!-- Time Cell -->
                <td
                  class="p-3 text-xs font-medium text-gray-600 text-center border-r border-gray-200"
                  [class.bg-orange-100]="slot.isLunch"
                >
                  @if (slot.isLunch) {
                    <span class="text-orange-700 font-bold">ALMOÇO</span>
                  } @else {
                    {{ slot.time }}
                  }
                </td>

                <!-- Day Cells -->
                @for (day of days; track day.dayIndex) {
                  <td
                    class="min-h-24 p-2 align-middle border-gray-200"
                    [class.bg-orange-50]="slot.isLunch"
                    [class.border-r]="day.dayIndex !== 4"
                  >
                    @if (!slot.isLunch) {
                      <div class="flex flex-col gap-2">
                        @if (getEventsForSlot(day.dayIndex, slot.time); as events) {
                          @for (event of events; track event.appointmentId) {
                            <div
                              class="bg-white rounded-lg border-l-4 p-3 cursor-pointer hover:shadow-md transition-shadow"
                              [style.borderLeftColor]="event.color"
                              (click)="onEventClick(event)"
                            >
                              <div class="font-bold text-gray-900 text-xs mb-2">
                                {{ event.startTime }}
                              </div>

                              <div class="flex items-start gap-2 mb-2">
                                <div
                                  class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                  [style.backgroundColor]="event.color"
                                >
                                  {{ getInitial(event.patientName) }}
                                </div>
                                <div class="flex-1 min-w-0">
                                  <div class="font-semibold text-gray-900 text-xs truncate">
                                    {{ event.patientName }}
                                  </div>
                                  <div class="text-gray-500 text-xs truncate">
                                    {{
                                      getAppointmentDetail(event.appointmentId)?.notes || 'Consulta'
                                    }}
                                  </div>
                                </div>
                              </div>

                              <span
                                class="inline-block text-xs font-medium px-2 py-1 rounded-full"
                                [ngClass]="getStatusBadgeClass(event.status)"
                              >
                                {{ getStatusLabel(event.status) }}
                              </span>
                            </div>
                          }
                        }
                      </div>
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h3 class="font-semibold text-base-content mb-3">Legenda de Status</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #3b82f6;"></div>
            <span class="text-xs">Agendado</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #10b981;"></div>
            <span class="text-xs">Confirmado</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #6366f1;"></div>
            <span class="text-xs">Realizado</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #f59e0b;"></div>
            <span class="text-xs">Não compareceu</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #ef4444;"></div>
            <span class="text-xs">Cancelado</span>
          </div>
        </div>
      </div>

      <!-- Event Details Modal -->
      @if (selectedEvent(); as event) {
        <div class="modal modal-open">
          <div class="modal-box w-11/12 max-w-md">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg">Detalhes do Agendamento</h3>
              <button type="button" class="btn btn-sm btn-circle btn-ghost" (click)="closeModal()">
                ✕
              </button>
            </div>

            <div class="space-y-4 py-4">
              <!-- Patient Info -->
              <div>
                <label class="block text-sm font-semibold text-gray-700">Paciente</label>
                <p class="text-gray-900">
                  {{ getAppointmentDetail(event.appointmentId)?.patient?.fullName || 'N/A' }}
                </p>
              </div>

              <!-- Professional Info -->
              <div>
                <label class="block text-sm font-semibold text-gray-700">Profissional</label>
                <p class="text-gray-900">
                  {{
                    getAppointmentDetail(event.appointmentId)?.professional?.profile?.account
                      ?.person?.fullName || 'N/A'
                  }}
                </p>
              </div>

              <!-- Clinic Info -->
              <div>
                <label class="block text-sm font-semibold text-gray-700">Clínica</label>
                <p class="text-gray-900">
                  {{ getAppointmentDetail(event.appointmentId)?.clinic?.name || 'N/A' }}
                </p>
              </div>

              <!-- Date and Time -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700">Data</label>
                  <p class="text-gray-900">
                    {{ getAppointmentDetail(event.appointmentId)?.startsAt | date: 'dd/MM/yyyy' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700">Horário</label>
                  <p class="text-gray-900">
                    {{ getAppointmentDetail(event.appointmentId)?.startsAt | date: 'HH:mm' }} -
                    {{ getAppointmentDetail(event.appointmentId)?.endsAt | date: 'HH:mm' }}
                  </p>
                </div>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-sm font-semibold text-gray-700">Status</label>
                <span
                  class="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                  [style.backgroundColor]="event.color"
                >
                  {{ getStatusLabel(event.status) }}
                </span>
              </div>

              <!-- Notes -->
              @if (getAppointmentDetail(event.appointmentId)?.notes) {
                <div>
                  <label class="block text-sm font-semibold text-gray-700">Observações</label>
                  <p class="text-gray-900 text-sm">
                    {{ getAppointmentDetail(event.appointmentId)?.notes }}
                  </p>
                </div>
              }
            </div>

            <!-- Modal Actions -->
            <div class="modal-action">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Fechar</button>
            </div>
          </div>
          <div class="modal-backdrop" (click)="closeModal()"></div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomAgendaComponent {
  appointments = input<Appointment[]>([]);

  days: DayColumn[] = [
    { day: 'seg', dayName: 'Segunda', dayIndex: 0 },
    { day: 'ter', dayName: 'Terça', dayIndex: 1 },
    { day: 'qua', dayName: 'Quarta', dayIndex: 2 },
    { day: 'qui', dayName: 'Quinta', dayIndex: 3 },
    { day: 'sex', dayName: 'Sexta', dayIndex: 4 },
  ];

  timeSlots: TimeSlot[] = [];
  currentWeekStart = signal<Date>(new Date());
  selectedEvent = signal<AgendaEvent | null>(null);
  agendaEvents = signal<AgendaEvent[]>([]);

  constructor() {
    this.generateTimeSlots();

    effect(() => {
      // Atualizar eventos quando appointments mudam
      this.appointments();
      this.updateAgendaEvents();
    });
  }

  private generateTimeSlots(): void {
    // Gerar slots de 08:00 até 20:30 com intervalo de 30 minutos
    const slots: TimeSlot[] = [];
    let hour = 8;
    let minute = 0;

    while (hour < 20 || (hour === 20 && minute <= 30)) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push({ time: timeStr, hour, minute });

      // Adicionar slot de almoço entre 12:00 e 13:00
      if (hour === 12 && minute === 0) {
        slots.push({ time: 'ALMOÇO', hour: 12, minute: 0, isLunch: true });
        hour = 13;
        minute = 0;
        continue;
      }

      minute += 30;
      if (minute >= 60) {
        minute -= 60;
        hour += 1;
      }
    }

    this.timeSlots = slots;
  }

  private updateAgendaEvents(): void {
    const events = this.appointments().map((apt) => {
      const startDate = new Date(apt.startsAt);
      const endDate = new Date(apt.endsAt);
      const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

      const slotPosition = this.findClosestSlotIndex(startDate.getHours(), startDate.getMinutes());
      const endSlotPosition = this.findClosestSlotIndex(endDate.getHours(), endDate.getMinutes());
      const slotDuration = endSlotPosition > slotPosition ? endSlotPosition - slotPosition : 1;

      return {
        appointmentId: apt.id,
        patientName: apt.patient?.fullName || 'Sem nome',
        startTime,
        endTime,
        status: apt.status,
        color: this.getStatusColor(apt.status),
        slotPosition: slotPosition >= 0 ? slotPosition : 0,
        slotDuration: slotDuration > 0 ? slotDuration : 1,
      };
    });

    this.agendaEvents.set(events);
  }

  private findClosestSlotIndex(hour: number, minute: number): number {
    // Encontrar o slot mais próximo ao horário fornecido
    let closestIndex = 0;
    let closestDiff = Infinity;

    for (let i = 0; i < this.timeSlots.length; i++) {
      const slot = this.timeSlots[i];
      if (slot.isLunch) continue;

      const diff = Math.abs(slot.hour * 60 + slot.minute - (hour * 60 + minute));
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  getEventsForSlot(dayIndex: number, slotTime: string): AgendaEvent[] {
    const weekStart = this.getWeekStartDate();
    const targetDate = new Date(weekStart);
    targetDate.setDate(targetDate.getDate() + (dayIndex - weekStart.getDay()));

    return this.agendaEvents().filter((event) => {
      const aptDate = new Date(this.getAppointmentDetail(event.appointmentId)?.startsAt || '');
      return aptDate.toDateString() === targetDate.toDateString() && event.startTime === slotTime;
    });
  }

  getEventDuration(event: AgendaEvent): string {
    return `${event.slotDuration * 30} min`;
  }

  getAppointmentDetail(appointmentId: string): Appointment | undefined {
    return this.appointments().find((apt) => apt.id === appointmentId);
  }

  getDayDate(dayIndex: number): string {
    const weekStart = this.getWeekStartDate();
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  isCurrentDay(dayIndex: number): boolean {
    const weekStart = this.getWeekStartDate();
    const date = new Date(weekStart);
    date.setDate(date.getDate() + (dayIndex - weekStart.getDay()));
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getWeekRange(): string {
    const start = this.getWeekStartDate();
    const end = new Date(start);
    end.setDate(end.getDate() + 4); // Sexta-feira

    return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
  }

  private getWeekStartDate(): Date {
    const date = new Date(this.currentWeekStart());
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
    return new Date(date.setDate(diff));
  }

  previousWeek(): void {
    const newDate = new Date(this.currentWeekStart());
    newDate.setDate(newDate.getDate() - 7);
    this.currentWeekStart.set(newDate);
  }

  nextWeek(): void {
    const newDate = new Date(this.currentWeekStart());
    newDate.setDate(newDate.getDate() + 7);
    this.currentWeekStart.set(newDate);
  }

  onEventClick(event: AgendaEvent): void {
    this.selectedEvent.set(event);
  }

  closeModal(): void {
    this.selectedEvent.set(null);
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return '#3b82f6'; // blue
      case 'CONFIRMED':
        return '#10b981'; // green
      case 'COMPLETED':
        return '#6366f1'; // indigo
      case 'NO_SHOW':
        return '#f59e0b'; // amber
      case 'CANCELLED':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Realizado',
      NO_SHOW: 'Não compareceu',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700';
      case 'COMPLETED':
        return 'bg-indigo-100 text-indigo-700';
      case 'NO_SHOW':
        return 'bg-amber-100 text-amber-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
