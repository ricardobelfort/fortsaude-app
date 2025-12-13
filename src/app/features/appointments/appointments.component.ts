import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../core/services';
import { Appointment } from '../../core/models';
import { AlertService } from '../../shared/ui/alert.service';

import { Calendar, CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Agenda de Atendimentos</h1>
        <p class="text-gray-600">Visualização de agendamentos da clínica</p>
      </div>

      @if (feedback(); as fb) {
        <div
          class="px-4 py-3 rounded-lg text-sm"
          [class.bg-green-100]="fb.type === 'success'"
          [class.text-green-800]="fb.type === 'success'"
          [class.bg-red-100]="fb.type === 'error'"
          [class.text-red-800]="fb.type === 'error'"
        >
          {{ fb.message }}
        </div>
      }

      <!-- Calendar -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div #calendarContainer class="fc-custom"></div>
      </div>

      <!-- Appointment Details Modal -->
      @if (showModal() && selectedAppointment(); as apt) {
        <div class="modal modal-open">
          <div class="modal-box w-11/12 max-w-md">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg">Detalhes do Agendamento</h3>
              <button
                type="button"
                class="btn btn-sm btn-circle btn-ghost"
                (click)="closeModal()"
                aria-label="Fechar modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="space-y-4 py-4">
              <!-- Patient Info -->
              <div>
                <label class="block text-sm font-semibold text-gray-700">Paciente</label>
                <p class="text-gray-900">{{ apt.patient.fullName || 'N/A' }}</p>
              </div>

              <!-- Professional Info -->
              <div>
                <label class="block text-sm font-semibold text-gray-700">Profissional</label>
                <p class="text-gray-900">
                  {{ apt.professional.profile.account.person.fullName || 'N/A' }}
                </p>
              </div>

              <!-- Clinic Info -->
              <div>
                <label class="block text-sm font-semibold text-gray-700">Clínica</label>
                <p class="text-gray-900">{{ apt.clinic.name || 'N/A' }}</p>
              </div>

              <!-- Date and Time -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700">Data</label>
                  <p class="text-gray-900">
                    {{ apt.startsAt | date: 'dd/MM/yyyy' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700">Horário</label>
                  <p class="text-gray-900">
                    {{ apt.startsAt | date: 'HH:mm' }} - {{ apt.endsAt | date: 'HH:mm' }}
                  </p>
                </div>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-sm font-semibold text-gray-700">Status</label>
                <span
                  class="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                  [style.background-color]="getStatusColor_(apt.status)"
                >
                  {{ getStatusLabel(apt.status) }}
                </span>
              </div>

              <!-- Notes -->
              @if (apt.notes) {
                <div>
                  <label class="block text-sm font-semibold text-gray-700">Observações</label>
                  <p class="text-gray-900 text-sm">{{ apt.notes }}</p>
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
  styles: [
    `
      :host ::ng-deep {
        /* FullCalendar Global Styles */
        .fc {
          font-size: 14px;
          font-family: inherit;
        }

        .fc-button-primary {
          background-color: #1f2937 !important;
          border-color: #1f2937 !important;
        }

        .fc-button-primary:hover {
          background-color: #1f2937 !important;
          border-color: #1f2937 !important;
        }

        .fc-button-primary.fc-button-active {
          background-color: #1f2937 !important;
          border-color: #1f2937 !important;
        }

        .fc-daygrid-day.fc-day-today {
          background-color: #eff6ff !important;
        }

        .fc-col-header-cell {
          background-color: #f9fafb !important;
          font-weight: 600;
          color: #111827;
          padding: 12px 4px;
        }

        .fc-daygrid-day-number {
          color: #374151;
          padding: 8px 4px;
        }

        .fc-event {
          cursor: pointer;
          border-radius: 4px;
        }

        .fc-event-title {
          font-weight: 600;
          color: white;
          font-size: 13px;
          padding: 2px 4px;
        }

        .fc-event-time {
          color: white;
          font-size: 11px;
        }

        .fc-daygrid {
          border-color: #e5e7eb;
        }

        .fc-cell-shaded {
          background-color: transparent;
        }

        .fc-daygrid-day {
          border-color: #e5e7eb;
        }

        .fc-col-header-cell {
          border-color: #e5e7eb;
        }

        .fc-button-group {
          gap: 4px;
        }

        .fc-button {
          text-transform: none;
          font-size: 14px;
        }

        .fc-button-group > button:not(:first-child) {
          margin-left: 4px;
        }

        /* Remove border from button group */
        .fc-button-group > :not(:first-child) {
          border-left: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsComponent implements OnInit, AfterViewInit {
  @ViewChild('calendarContainer') calendarContainer!: ElementRef;

  private readonly appointmentsService = inject(AppointmentsService);
  private readonly alertService = inject(AlertService);

  appointments = signal<Appointment[]>([]);
  feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  showModal = signal(false);
  selectedAppointment = signal<Appointment | null>(null);

  private calendar: Calendar | null = null;

  ngOnInit() {
    this.loadAppointments();
  }

  ngAfterViewInit() {
    this.initializeCalendar();
  }

  private loadAppointments(): void {
    this.appointmentsService.getAll().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        if (this.calendar) {
          this.updateCalendarEvents();
        }
      },
      error: () => {
        this.alertService.error('Erro ao carregar agendamentos');
        this.feedback.set({ type: 'error', message: 'Erro ao carregar agendamentos' });
      },
    });
  }

  private initializeCalendar(): void {
    const calendarEl = this.calendarContainer.nativeElement;

    const options: CalendarOptions = {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      locale: ptBrLocale,
      events: this.getCalendarEvents(),
      eventClick: (info) => this.onEventClick(info),
      eventDidMount: (info) => {
        // Add click cursor style
        info.el.style.cursor = 'pointer';
      },
      aspectRatio: 1.35,
    };

    this.calendar = new Calendar(calendarEl, options);
    this.calendar.render();
  }

  private getCalendarEvents() {
    return this.appointments().map((apt) => {
      const color = this.getStatusColor_(apt.status);
      return {
        id: apt.id,
        title: `${apt.patient?.fullName || 'Sem nome'} - ${apt.professional?.profile?.account?.person?.fullName || 'Sem profissional'}`,
        start: apt.startsAt,
        end: apt.endsAt,
        backgroundColor: color,
        borderColor: color,
        textColor: '#fff',
        extendedProps: {
          status: apt.status,
          notes: apt.notes,
        },
      };
    });
  }

  getStatusColor_(status: string): string {
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

  private updateCalendarEvents(): void {
    if (this.calendar) {
      this.calendar.removeAllEvents();
      this.calendar.addEventSource(this.getCalendarEvents());
    }
  }

  private onEventClick(info: { event: { id: string } }): void {
    const appointment = this.appointments().find((apt) => apt.id === info.event.id);
    if (appointment) {
      this.selectedAppointment.set(appointment);
      this.showModal.set(true);
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedAppointment.set(null);
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
}
