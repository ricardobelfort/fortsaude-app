import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AppointmentsService, PatientsService, ProfessionalsService } from '../../core/services';
import { AppointmentStatus } from '../../core/models';

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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Agenda de Atendimentos</h1>
          <button
            pButton
            type="button"
            icon="pi pi-plus"
            label="Novo Atendimento"
            severity="success"
            (click)="openNewAppointmentDialog()"
          ></button>
        </div>

        <!-- Calendar View Toggle -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div class="flex gap-3">
            <button
              pButton
              [outlined]="viewMode() !== 'week'"
              label="Semana"
              [disabled]="true"
              class="text-sm"
            ></button>
            <button
              pButton
              [outlined]="viewMode() !== 'month'"
              label="Mês"
              [disabled]="true"
              class="text-sm"
            ></button>
            <button
              pButton
              [outlined]="viewMode() !== 'agenda'"
              label="Agenda"
              [disabled]="true"
              class="text-sm"
            ></button>
          </div>
        </div>

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
                        pButton
                        type="button"
                        icon="pi pi-pencil"
                        severity="info"
                        [text]="true"
                        (click)="editAppointment(apt)"
                      ></button>
                      <button
                        pButton
                        type="button"
                        icon="pi pi-trash"
                        severity="danger"
                        [text]="true"
                        (click)="deleteAppointment(apt.id)"
                      ></button>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center py-12 text-gray-500">
              <p class="icon pi pi-calendar" style="font-size: 3rem; margin-bottom: 1rem;"></p>
              <p>Nenhum atendimento agendado</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- New/Edit Appointment Dialog -->
    <p-dialog
      [(visible)]="showDialog"
      [header]="editingId ? 'Editar Atendimento' : 'Novo Atendimento'"
      [modal]="true"
      [style]="{ width: '50vw' }"
      [breakpoints]="{ '960px': '75vw', '640px': '90vw' }"
    >
      <form [formGroup]="form" (ngSubmit)="saveAppointment()" class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> Paciente </label>
          <select formControlName="patientId" class="w-full border border-gray-300 rounded-lg p-2">
            <option value="">Selecione um paciente</option>
            @for (patient of patients(); track patient.id) {
              <option [value]="patient.id">{{ patient.fullName }}</option>
            }
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> Profissional </label>
          <select
            formControlName="professionalId"
            class="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Selecione um profissional</option>
            @for (prof of professionals(); track prof.id) {
              <option [value]="prof.id">{{ prof.firstName }} {{ prof.lastName }}</option>
            }
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> Data e Hora </label>
          <input
            type="datetime-local"
            formControlName="startTime"
            class="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> Duração (minutos) </label>
          <input
            type="number"
            formControlName="duration"
            min="15"
            max="480"
            step="15"
            class="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> Status </label>
          <select formControlName="status" class="w-full border border-gray-300 rounded-lg p-2">
            <option value="SCHEDULED">Agendado</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="COMPLETED">Concluído</option>
            <option value="NO_SHOW">Não Compareceu</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2"> Notas </label>
          <textarea
            formControlName="notes"
            rows="3"
            placeholder="Observações sobre o atendimento"
            class="w-full border border-gray-300 rounded-lg p-2"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <button
            pButton
            type="button"
            label="Cancelar"
            severity="secondary"
            (click)="showDialog = false"
          ></button>
          <button
            pButton
            type="submit"
            label="Salvar"
            [loading]="isLoading()"
            [disabled]="!form.valid || isLoading()"
          ></button>
        </div>
      </form>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly patientsService = inject(PatientsService);
  private readonly professionalsService = inject(ProfessionalsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  appointments = signal<AppointmentRecord[]>([]);
  patients = signal<Patient[]>([]);
  professionals = signal<Professional[]>([]);

  isLoading = signal(false);
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
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.editingId
            ? 'Atendimento atualizado com sucesso'
            : 'Atendimento agendado com sucesso',
        });
        this.showDialog = false;
        this.isLoading.set(false);
        this.loadAppointments();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao salvar atendimento',
        });
        this.isLoading.set(false);
      },
    });
  }

  deleteAppointment(id: string): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja cancelar este atendimento?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.appointmentsService.delete(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Atendimento cancelado com sucesso',
            });
            this.loadAppointments();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao cancelar atendimento',
            });
          },
        });
      },
    });
  }
}
