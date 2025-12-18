import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService, CurrentUserService } from '../../core/services';
import { Appointment } from '../../core/models';
import { AlertService } from '../../shared/ui/alert.service';
import { CustomAgendaComponent } from './custom-agenda/custom-agenda.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, CustomAgendaComponent, AppointmentFormComponent],
  template: `
    <div class="space-y-4 sm:space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between px-0">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Agenda de Atendimentos</h1>
          <p class="text-sm sm:text-base text-gray-600">Visualização de agendamentos da clínica</p>
        </div>
        <button (click)="openAppointmentForm()" class="btn btn-primary btn-sm sm:btn-md">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Nova Consulta
        </button>
      </div>

      @if (feedback(); as fb) {
        <div
          class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm"
          [class.bg-green-100]="fb.type === 'success'"
          [class.text-green-800]="fb.type === 'success'"
          [class.bg-red-100]="fb.type === 'error'"
          [class.text-red-800]="fb.type === 'error'"
        >
          {{ fb.message }}
        </div>
      }

      <!-- Custom Agenda -->
      <app-custom-agenda
        [appointments]="appointments()"
        [clinicId]="clinicId()"
      ></app-custom-agenda>

      <!-- Modal de Agendamento -->
      @if (showAppointmentForm()) {
        <app-appointment-form
          [clinicId]="clinicId()"
          (onClose)="onAppointmentFormClose($event)"
        ></app-appointment-form>
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
          border-color: #e5e7eb;
        }

        .fc-daygrid-day-number {
          color: #374151;
          font-size: 12px;
        }

        .fc-event {
          cursor: pointer;
        }

        .fc-event-title {
          font-weight: 600;
          color: white;
        }

        .fc-event-time {
          display: none;
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

        .fc-button-group {
          gap: 2px;
          flex-wrap: wrap;
        }

        .fc-button {
          text-transform: none;
          font-size: 12px;
          padding: 4px 8px !important;
        }

        /* Remove border from button group */
        .fc-button-group > :not(:first-child) {
          border-left: none;
        }

        /* Desktop defaults - flexible toolbar */
        .fc-toolbar {
          margin-bottom: 8px;
        }
      }

      /* Mobile responsive adjustments - OUTSIDE ::ng-deep */
      @media (max-width: 640px) {
        :host ::ng-deep .fc-toolbar {
          display: flex !important;
          gap: 1px !important;
          margin-bottom: 3px !important;
          align-items: center !important;
        }

        :host ::ng-deep .fc-button-group {
          gap: 0px !important;
          flex-shrink: 0 !important;
          display: flex !important;
        }

        :host ::ng-deep .fc-toolbar-title {
          font-size: 11px !important;
          margin: 0 !important;
          text-align: center !important;
          padding: 0px 2px !important;
          white-space: nowrap !important;
          font-weight: 600 !important;
        }

        :host ::ng-deep .fc-button {
          padding: 1px 2px !important;
          font-size: 8px !important;
          height: auto !important;
          line-height: 1.1 !important;
          min-width: 22px !important;
        }

        :host ::ng-deep .fc-button-group > button {
          padding: 1px 2px !important;
        }

        :host ::ng-deep .fc-button.fc-button-primary {
          background-color: #374151 !important;
          border-color: #374151 !important;
          font-weight: 600 !important;
        }

        :host ::ng-deep .fc-button.fc-button-primary:hover {
          background-color: #1f2937 !important;
          border-color: #1f2937 !important;
        }

        :host ::ng-deep .fc-button.fc-button-primary:not(.fc-button-active) {
          background-color: #6b7280 !important;
          border-color: #6b7280 !important;
        }

        :host ::ng-deep .fc-col-header-cell {
          padding: 4px 1px !important;
          font-size: 9px !important;
          border-width: 0.5px !important;
          background-color: #f9fafb !important;
          font-weight: 600 !important;
        }

        :host ::ng-deep .fc-daygrid-day-number {
          padding: 2px 1px !important;
          font-size: 9px !important;
          color: #374151 !important;
        }

        :host ::ng-deep .fc-daygrid-day {
          border-width: 0.5px !important;
        }

        :host ::ng-deep .fc-daygrid-day-frame {
          min-height: 48px !important;
        }

        :host ::ng-deep .fc-event {
          margin: 0 0.5px !important;
          border-radius: 2px !important;
        }

        :host ::ng-deep .fc-event-title {
          font-size: 7px !important;
          padding: 0px 1px !important;
          line-height: 1 !important;
          font-weight: 500 !important;
        }

        :host ::ng-deep .fc-event-time {
          display: none !important;
        }

        :host ::ng-deep .fc-toolbar-chunk {
          display: flex !important;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly alertService = inject(AlertService);
  private readonly cdr = inject(ChangeDetectorRef);

  appointments = signal<Appointment[]>([]);
  clinicId = signal<string>('');
  feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  showAppointmentForm = signal(false);

  ngOnInit() {
    // Obter clínica do usuário logado
    const clinicId = this.currentUserService.getClinicId();
    if (clinicId) {
      this.clinicId.set(clinicId);
    }
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.appointmentsService.getAll().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
      },
      error: () => {
        this.alertService.error('Erro ao carregar agendamentos');
        this.feedback.set({ type: 'error', message: 'Erro ao carregar agendamentos' });
      },
    });
  }

  openAppointmentForm(): void {
    console.log('Abrindo formulário de agendamento');
    this.showAppointmentForm.set(true);
    console.log('Estado do sinal:', this.showAppointmentForm());
    this.cdr.markForCheck();
  }

  onAppointmentFormClose(event: { saved: boolean; appointment?: any }): void {
    this.showAppointmentForm.set(false);
    if (event.saved) {
      this.feedback.set({
        type: 'success',
        message: 'Consulta agendada com sucesso!',
      });
      // Recarregar agendamentos
      this.loadAppointments();
      // Limpar feedback após 5 segundos
      setTimeout(() => {
        this.feedback.set(null);
      }, 5000);
    }
  }
}
