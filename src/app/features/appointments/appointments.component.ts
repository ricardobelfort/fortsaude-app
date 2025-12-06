import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AppointmentsService, PatientsService, ProfessionalsService } from '../../core/services';
import { AppointmentStatus } from '../../core/models';
import { AlertService } from '../../shared/ui/alert.service';
import { IconComponent } from '../../shared/ui/icon.component';

interface AppointmentRecord {
  id: string;
  patientName: string;
  professionalName: string;
  startTime: string | Date;
  endTime: string | Date;
  status: string;
  notes?: string;
}

interface Patient {
  id: string;
  fullName: string;
}

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Agenda de Atendimentos</h1>
          <button
            type="button"
            class="fs-button-primary"
            (click)="openNewAppointmentDialog()"
          >
            <app-icon name="calendar"></app-icon>
            Novo Atendimento
          </button>
        </div>

        <!-- Calendar View Toggle -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div class="flex gap-2">
            <button
              type="button"
              class="fs-button-secondary"
              [class.bg-indigo-50]="viewMode() === 'week'"
              [class.border-indigo-300]="viewMode() === 'week'"
              disabled
            >
              Semana
            </button>
            <button
              type="button"
              class="fs-button-secondary"
              [class.bg-indigo-50]="viewMode() === 'month'"
              [class.border-indigo-300]="viewMode() === 'month'"
              disabled
            >
              Mês
            </button>
            <button
              type="button"
              class="fs-button-secondary"
              [class.bg-indigo-50]="viewMode() === 'agenda'"
              [class.border-indigo-300]="viewMode() === 'agenda'"
              disabled
            >
              Agenda
            </button>
          </div>
        </div>

        @if (feedback(); as fb) {
          <div
            class="mb-4 px-4 py-3 rounded-lg text-sm"
            [class.bg-green-100]="fb.type === 'success'"
            [class.text-green-800]="fb.type === 'success'"
            [class.bg-red-100]="fb.type === 'error'"
            [class.text-red-800]="fb.type === 'error'"
          >
            {{ fb.message }}
          </div>
        }

        <!-- Appointments List (Temporary until FullCalendar integration) -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          @if (appointments().length > 0) {
            <div class="space-y-4">
              @for (apt of appointments(); track apt.id) {
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900">{{ apt.patientName }}</h3>
                      <p class="text-sm text-gray-600">Profissional: {{ apt.professionalName }}</p>
                      <p class="text-sm text-gray-600">
                        {{ apt.startTime | date: 'dd/MM/yyyy HH:mm' }} -
                        {{ apt.endTime | date: 'HH:mm' }}
                      </p>
                      <div class="mt-2">
                        <span
                          class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                          [class.bg-blue-100]="apt.status === 'SCHEDULED'"
                          [class.text-blue-800]="apt.status === 'SCHEDULED'"
                          [class.bg-green-100]="apt.status === 'CONFIRMED'"
                          [class.text-green-800]="apt.status === 'CONFIRMED'"
                          [class.bg-gray-100]="apt.status === 'COMPLETED'"
                          [class.text-gray-800]="apt.status === 'COMPLETED'"
                          [class.bg-red-100]="apt.status === 'CANCELLED'"
                          [class.text-red-800]="apt.status === 'CANCELLED'"
                        >
                          {{ apt.status }}
                        </span>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        (click)="editAppointment(apt)"
                        class="inline-flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-800"
                      >
                        <app-icon name="edit-3"></app-icon>
                        Editar
                      </button>
                      <button
                        type="button"
                        (click)="deleteAppointment(apt.id)"
                        class="inline-flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <app-icon name="trash-2"></app-icon>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-12 text-gray-500">
              <p class="text-5xl mb-4">📅</p>
              <p>Nenhum atendimento agendado</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- New/Edit Appointment Dialog -->
    @if (showDialog) {
      <div class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10 mb-10 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">
              {{ editingId ? 'Editar Atendimento' : 'Novo Atendimento' }}
            </h3>
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700"
              (click)="showDialog = false"
            >
              <app-icon name="x"></app-icon>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="saveAppointment()" class="space-y-6">
            <div>
              <label class="fs-label"> Paciente </label>
              <select formControlName="patientId" class="fs-select">
                <option value="">Selecione um paciente</option>
                @for (patient of patients(); track patient.id) {
                  <option [value]="patient.id">{{ patient.fullName }}</option>
                }
              </select>
            </div>

            <div>
              <label class="fs-label"> Profissional </label>
              <select formControlName="professionalId" class="fs-select">
                <option value="">Selecione um profissional</option>
                @for (prof of professionals(); track prof.id) {
                  <option [value]="prof.id">{{ prof.firstName }} {{ prof.lastName }}</option>
                }
              </select>
            </div>

            <div>
              <label class="fs-label"> Data e Hora </label>
              <input type="datetime-local" formControlName="startTime" class="fs-input" />
            </div>

            <div>
              <label class="fs-label"> Duração (minutos) </label>
              <input
                type="number"
                formControlName="duration"
                min="15"
                max="480"
                step="15"
                class="fs-input"
              />
            </div>

            <div>
              <label class="fs-label"> Status </label>
              <select formControlName="status" class="fs-select">
                <option value="SCHEDULED">Agendado</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="COMPLETED">Concluído</option>
                <option value="NO_SHOW">Não Compareceu</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            <div>
              <label class="fs-label"> Notas </label>
              <textarea
                formControlName="notes"
                rows="3"
                placeholder="Observações sobre o atendimento"
                class="fs-textarea"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" class="fs-button-secondary" (click)="showDialog = false">
                <app-icon name="x-circle"></app-icon>
                Cancelar
              </button>
              <button
                type="submit"
                class="fs-button-primary"
                [disabled]="!form.valid || isLoading()"
              >
                <app-icon name="check-circle"></app-icon>
                {{ isLoading() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly patientsService = inject(PatientsService);
  private readonly professionalsService = inject(ProfessionalsService);
  private readonly alertService = inject(AlertService);

  appointments = signal<AppointmentRecord[]>([]);
  patients = signal<Patient[]>([]);
  professionals = signal<Professional[]>([]);

  isLoading = signal(false);
  feedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  showDialog = false;
  editingId: string | null = null;
  viewMode = signal<'week' | 'month' | 'agenda'>('agenda');

  form = this.fb.group({
    patientId: ['', Validators.required],
    professionalId: ['', Validators.required],
    startTime: ['', Validators.required],
    duration: [60, Validators.required],
    status: ['SCHEDULED', Validators.required],
    notes: [''],
  });

  ngOnInit() {
    this.loadAppointments();
    this.loadPatients();
    this.loadProfessionals();
  }

  private loadAppointments(): void {
    this.appointmentsService.getAll().subscribe({
      next: (appointments) => {
        // Map to display format
        const mapped: AppointmentRecord[] = appointments.map((apt) => ({
          id: apt.id,
          patientName: apt.patient?.fullName || 'Sem Nome',
          professionalName: apt.professional
            ? `${apt.professional.firstName} ${apt.professional.lastName}`
            : 'Sem Nome',
          startTime: apt.startTime,
          endTime: apt.endTime,
          status: apt.status || 'SCHEDULED',
          notes: apt.observations,
        }));
        this.appointments.set(mapped);
      },
    });
  }

  private loadPatients(): void {
    this.patientsService.getAll().subscribe({
      next: (patients) => {
        this.patients.set(patients);
      },
    });
  }

  private loadProfessionals(): void {
    this.professionalsService.getAll().subscribe({
      next: (professionals) => {
        this.professionals.set(professionals);
      },
    });
  }

  openNewAppointmentDialog(): void {
    this.editingId = null;
    this.form.reset({ status: 'SCHEDULED', duration: 60 });
    this.showDialog = true;
  }

  editAppointment(apt: AppointmentRecord): void {
    this.editingId = apt.id;
    // Convert Date to string format for input datetime-local
    const startStr =
      apt.startTime instanceof Date ? apt.startTime.toISOString().slice(0, 16) : apt.startTime;
    this.form.patchValue({
      startTime: startStr,
      status: apt.status,
      notes: apt.notes,
    });
    this.showDialog = true;
  }

  saveAppointment(): void {
    if (!this.form.valid) return;

    this.isLoading.set(true);
    const { patientId, professionalId, startTime, duration, status, notes } = this.form.value;

    // Calculate endTime from startTime + duration
    const startDate = new Date(startTime || '');
    const endDate = new Date(startDate.getTime() + (duration || 60) * 60000);

    const dto = {
      patientId: patientId || '',
      professionalId: professionalId || '',
      startTime: startDate,
      endTime: endDate,
      status: (status as AppointmentStatus) || AppointmentStatus.SCHEDULED,
      observations: notes || '',
    };

    const request = this.editingId
      ? this.appointmentsService.update(this.editingId, dto)
      : this.appointmentsService.create(dto);

    request.subscribe({
      next: () => {
        const message = this.editingId
          ? 'Atendimento atualizado com sucesso'
          : 'Atendimento agendado com sucesso';
        this.alertService.success(message);
        this.feedback.set({
          type: 'success',
          message,
        });
        this.showDialog = false;
        this.isLoading.set(false);
        this.loadAppointments();
      },
      error: () => {
        this.alertService.error('Erro ao salvar atendimento');
        this.feedback.set({ type: 'error', message: 'Erro ao salvar atendimento' });
        this.isLoading.set(false);
      },
    });
  }

  async deleteAppointment(id: string): Promise<void> {
    const confirmed = await this.alertService.confirm({
      text: 'Tem certeza que deseja cancelar este atendimento?',
      confirmButtonText: 'Sim, cancelar',
    });

    if (!confirmed) return;

    this.appointmentsService.delete(id).subscribe({
      next: () => {
        this.alertService.success('Atendimento cancelado com sucesso');
        this.feedback.set({ type: 'success', message: 'Atendimento cancelado com sucesso' });
        this.loadAppointments();
      },
      error: () => {
        this.alertService.error('Erro ao cancelar atendimento');
        this.feedback.set({ type: 'error', message: 'Erro ao cancelar atendimento' });
      },
    });
  }
}
