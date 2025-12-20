import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appointment, ClinicAgendaConfig } from '../../../core/models';
import {
  ClinicAgendaConfigService,
  TimeSlot,
} from '../../../core/services/clinic-agenda-config.service';
import { IconComponent } from '../../../shared/ui/icon.component';

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
  date: string; // data em formato YYYY-MM-DD para comparação
}

@Component({
  selector: 'app-custom-agenda',
  standalone: true,
  imports: [CommonModule, IconComponent, FormsModule],
  template: `
    <div class="space-y-4">
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block loading loading-spinner loading-lg text-primary mb-4"></div>
            <p class="text-gray-600">Carregando configurações de agenda...</p>
          </div>
        </div>
      } @else {
        <!-- Month and Week Filter -->
        <div class="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center gap-4">
            <!-- Month Selector -->
            <div class="flex items-center gap-2">
              <select
                class="select select-bordered select-sm"
                [(ngModel)]="selectedMonth"
                (change)="onMonthChange()"
              >
                <option value="0">Janeiro</option>
                <option value="1">Fevereiro</option>
                <option value="2">Março</option>
                <option value="3">Abril</option>
                <option value="4">Maio</option>
                <option value="5">Junho</option>
                <option value="6">Julho</option>
                <option value="7">Agosto</option>
                <option value="8">Setembro</option>
                <option value="9">Outubro</option>
                <option value="10">Novembro</option>
                <option value="11">Dezembro</option>
              </select>
              <span class="text-sm font-semibold text-gray-700">{{ getCurrentYear() }}</span>
            </div>

            <!-- Week Navigation -->
            <div class="flex items-center gap-2 border-l border-gray-200 pl-4">
              <button class="btn btn-ghost btn-sm" (click)="previousWeek()">
                <app-icon [name]="'chevron-left'" [size]="18"></app-icon>
              </button>
              <span class="text-sm font-semibold text-gray-700 min-w-24 text-center">
                Semana {{ getCurrentWeekNumber() }}
              </span>
              <button class="btn btn-ghost btn-sm" (click)="nextWeek()">
                <app-icon [name]="'chevron-right'" [size]="18"></app-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Header with week days -->
        <div class="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
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
        </div>

        <!-- Agenda Table -->
        <div class="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full border-collapse" style="table-layout: fixed;">
            <!-- Table Header -->
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th
                  class="p-4 text-left font-semibold text-sm text-gray-700 border-r border-gray-200"
                  style="width: 80px;"
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
              @for (slot of timeSlots(); track slot.time) {
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
                                class="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
                                [style.borderColor]="event.color"
                                (click)="onEventClick(event)"
                              >
                                <div
                                  class="font-bold text-slate-700 text-xs mb-2 flex items-center gap-1"
                                >
                                  <app-icon [name]="'clock'" [size]="16"></app-icon>
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
                                        getAppointmentDetail(event.appointmentId)?.notes ||
                                          'Consulta'
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
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded" style="background-color: #3b82f6;"></div>
              <span class="text-xs">Agendado</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded" style="background-color: #6366f1;"></div>
              <span class="text-xs">Realizado</span>
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
                <button
                  type="button"
                  class="btn btn-sm btn-circle btn-ghost"
                  (click)="closeModal()"
                >
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
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomAgendaComponent {
  appointments = input<Appointment[]>([]);
  clinicId = input<string>(''); // Clínica ID para buscar configurações
  onAppointmentSelect = output<Appointment>();

  private readonly agendaConfigService = inject(ClinicAgendaConfigService);

  days: DayColumn[] = [
    { day: 'seg', dayName: 'Segunda', dayIndex: 0 },
    { day: 'ter', dayName: 'Terça', dayIndex: 1 },
    { day: 'qua', dayName: 'Quarta', dayIndex: 2 },
    { day: 'qui', dayName: 'Quinta', dayIndex: 3 },
    { day: 'sex', dayName: 'Sexta', dayIndex: 4 },
  ];

  selectedMonth: string = new Date().getMonth().toString();
  timeSlots = signal<TimeSlot[]>([]);
  agendaConfig = signal<ClinicAgendaConfig | null>(null);
  currentWeekStart = signal<Date>(new Date());
  selectedEvent = signal<AgendaEvent | null>(null);
  agendaEvents = signal<AgendaEvent[]>([]);
  isLoading = signal(true);

  constructor() {
    effect(() => {
      // Quando clinicId muda, busca configurações
      const clinicId = this.clinicId();
      if (clinicId) {
        this.loadAgendaConfig(clinicId);
      } else {
        // Sem clínica específica, usa configuração padrão
        const defaultConfig = this.getDefaultConfig('default');
        this.agendaConfig.set(defaultConfig);
        this.generateTimeSlots(defaultConfig);
        this.isLoading.set(false);
      }
    });

    effect(() => {
      // Atualizar eventos quando appointments mudam
      this.appointments();
      this.updateAgendaEvents();
    });
  }

  private loadAgendaConfig(clinicId: string): void {
    this.isLoading.set(true);
    this.agendaConfigService.getClinicAgendaConfig(clinicId).subscribe({
      next: (config) => {
        this.agendaConfig.set(config);
        this.generateTimeSlots(config);
        this.isLoading.set(false);
      },
      error: () => {
        // Em caso de erro, usa configuração padrão
        const defaultConfig = this.getDefaultConfig(clinicId);
        this.agendaConfig.set(defaultConfig);
        this.generateTimeSlots(defaultConfig);
        this.isLoading.set(false);
      },
    });
  }

  private getDefaultConfig(clinicId: string): ClinicAgendaConfig {
    return {
      clinicId,
      workStartTime: '08:00',
      workEndTime: '18:30',
      appointmentIntervalMinutes: 40,
      lunchStartTime: '12:00',
      lunchEndTime: '13:00',
      activeDays: [0, 1, 2, 3, 4],
    };
  }

  private generateTimeSlots(config: ClinicAgendaConfig): void {
    const slots = this.agendaConfigService.generateTimeSlots(config);
    this.timeSlots.set(slots);
  }

  private updateAgendaEvents(): void {
    const events = this.appointments().map((apt) => {
      // Converter timestamps UTC para hora local
      const startDate = new Date(apt.startsAt);
      const endDate = new Date(apt.endsAt);

      // Usar toLocaleString para converter para hora local, depois extrair hora e minuto
      const localStartString = startDate.toLocaleString('pt-BR', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      const localEndString = endDate.toLocaleString('pt-BR', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      // Parse hora e minuto da string "dd/mm/yyyy, hh:mm:ss"
      const startTimeParts = localStartString.split(', ')[1].split(':');
      const endTimeParts = localEndString.split(', ')[1].split(':');
      const startHour = parseInt(startTimeParts[0]);
      const startMinute = parseInt(startTimeParts[1]);
      const endHour = parseInt(endTimeParts[0]);
      const endMinute = parseInt(endTimeParts[1]);

      const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

      // Obter data em formato YYYY-MM-DD para comparação consistente
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const dateString = formatter.format(startDate);

      const slotPosition = this.findClosestSlotIndex(startHour, startMinute);
      const endSlotPosition = this.findClosestSlotIndex(endHour, endMinute);
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
        date: dateString,
      };
    });

    this.agendaEvents.set(events);
  }

  private findClosestSlotIndex(hour: number, minute: number): number {
    // Encontrar o slot mais próximo ao horário fornecido
    let closestIndex = 0;
    let closestDiff = Infinity;
    const slots = this.timeSlots();

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
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
    targetDate.setDate(targetDate.getDate() + dayIndex);
    targetDate.setHours(0, 0, 0, 0);

    // Usar Intl.DateTimeFormat com timezone para comparação consistente
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const targetDateString = formatter.format(targetDate);
    const currentSlotIndex = this.timeSlots().findIndex((slot) => slot.time === slotTime);

    if (currentSlotIndex === -1) {
      return [];
    }

    return this.agendaEvents().filter((event) => {
      // Comparar data e posição do slot, não a hora exata
      return event.date === targetDateString && event.slotPosition === currentSlotIndex;
    });
  }

  getEventDuration(event: AgendaEvent): string {
    const config = this.agendaConfig();
    const interval = config?.appointmentIntervalMinutes || 40;
    return `${event.slotDuration * interval} min`;
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
    // Encontrar o appointment completo
    const appointment = this.appointments().find((a) => a.id === event.appointmentId);
    if (appointment) {
      this.onAppointmentSelect.emit(appointment);
    }
  }

  closeModal(): void {
    this.selectedEvent.set(null);
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return '#3b82f6'; // blue
      case 'COMPLETED':
        return '#6366f1'; // indigo
      case 'CANCELLED':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      SCHEDULED: 'Agendado',
      COMPLETED: 'Realizado',
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
      case 'COMPLETED':
        return 'bg-indigo-100 text-indigo-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getCurrentYear(): number {
    return this.currentWeekStart().getFullYear();
  }

  getCurrentWeekNumber(): number {
    const date = new Date(this.currentWeekStart());
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  }

  onMonthChange(): void {
    const newDate = new Date(this.currentWeekStart());
    newDate.setMonth(parseInt(this.selectedMonth));
    // Volta para segunda-feira da primeira semana do mês selecionado
    const firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    const day = firstDay.getDay();
    const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1);
    newDate.setDate(diff);
    this.currentWeekStart.set(newDate);
  }
}
