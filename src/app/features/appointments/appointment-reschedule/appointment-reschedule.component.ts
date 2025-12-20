import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AppointmentsService, CurrentUserService, ClinicAgendaConfigService } from '@core/services';
import { Appointment, UpdateAppointmentDto } from '@core/models';
import { AlertService } from '@shared/ui/alert.service';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { TimeSlot } from '@core/services/clinic-agenda-config.service';

@Component({
  selector: 'app-appointment-reschedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [title]="'Remarcar Consulta'"
      [submitButtonText]="'Remarcar Consulta'"
      [cancelButtonText]="'Cancelar'"
      [isLoading]="isSubmitting()"
      [isFormValid]="appointmentForm.valid"
      [formId]="'rescheduleFormId'"
      (cancelled)="onCancel()"
      (submitted)="onSubmit()"
    >
      <form
        id="rescheduleFormId"
        [formGroup]="appointmentForm"
        (ngSubmit)="onSubmit()"
        modal-content
        class="space-y-6"
      >
        <!-- Data do Agendamento -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold text-gray-700">Nova Data</span>
          </label>
          <input
            type="date"
            formControlName="appointmentDate"
            [min]="getMinDate()"
            (change)="onDateChange()"
            class="input input-bordered input-sm w-full"
          />
          @if (
            appointmentForm.get('appointmentDate')?.hasError('required') &&
            appointmentForm.get('appointmentDate')?.touched
          ) {
            <label class="label">
              <span class="label-text-alt text-error">Data é obrigatória</span>
            </label>
          }
        </div>

        <!-- Horário Disponível -->
        @if (appointmentForm.get('appointmentDate')?.value) {
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold text-gray-700">Novo Horário</span>
            </label>

            @if (isLoadingSlots()) {
              <div class="flex items-center justify-center py-4">
                <div class="loading loading-spinner loading-sm text-primary"></div>
              </div>
            } @else if (availableSlots().length > 0) {
              <div class="grid grid-cols-4 gap-2">
                @for (slot of availableSlots(); track slot.time) {
                  <button
                    type="button"
                    (click)="selectTimeSlot(slot)"
                    [class.btn-primary]="
                      appointmentForm.get('appointmentTime')?.value === slot.time
                    "
                    [class.btn-outline]="
                      appointmentForm.get('appointmentTime')?.value !== slot.time
                    "
                    [disabled]="slot.isLunch"
                    class="btn btn-sm"
                  >
                    {{ slot.time }}
                  </button>
                }
              </div>
              @if (
                !appointmentForm.get('appointmentTime')?.value &&
                appointmentForm.get('appointmentDate')?.touched
              ) {
                <label class="label">
                  <span class="label-text-alt text-error">Horário é obrigatório</span>
                </label>
              }
            } @else {
              <p class="text-sm text-gray-500">Nenhum horário disponível para esta data</p>
            }
          </div>
        }

        <!-- Notas Opcionais -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold text-gray-700">Notas (opcional)</span>
          </label>
          <textarea
            formControlName="notes"
            class="textarea textarea-bordered textarea-sm w-full h-20"
            placeholder="Informações adicionais sobre a consulta..."
          ></textarea>
        </div>
      </form>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentRescheduleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentsService = inject(AppointmentsService);
  private alertService = inject(AlertService);
  private currentUserService = inject(CurrentUserService);
  private clinicAgendaConfigService = inject(ClinicAgendaConfigService);

  appointment = input.required<Appointment>();
  onClose = output<{ saved: boolean; appointment?: Appointment }>();

  appointmentForm: FormGroup;
  availableSlots = signal<TimeSlot[]>([]);
  isLoadingSlots = signal(false);
  isSubmitting = signal(false);

  constructor() {
    this.appointmentForm = this.fb.group({
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      notes: [''],
    });

    // Preencher formulário com dados atuais
    effect(() => {
      const apt = this.appointment();
      if (apt) {
        const startDate = new Date(apt.startsAt);
        this.appointmentForm.patchValue({
          appointmentDate: startDate.toISOString().split('T')[0],
          appointmentTime: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
          notes: apt.notes || '',
        });
      }
    });
  }

  ngOnInit() {
    this.loadAvailableSlots();
  }

  onDateChange() {
    const dateInput = this.appointmentForm.get('appointmentDate');
    if (dateInput?.value) {
      const validation = this.isValidAppointmentDate(dateInput.value);
      if (!validation.valid) {
        this.alertService.error(validation.message || 'Data inválida');
        dateInput.reset();
        this.appointmentForm.patchValue({ appointmentTime: '' });
        this.availableSlots.set([]);
        return;
      }
    }

    this.appointmentForm.patchValue({ appointmentTime: '' });
    this.loadAvailableSlots();
  }

  private loadAvailableSlots() {
    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;

    if (!appointmentDate) {
      this.availableSlots.set([]);
      return;
    }

    this.isLoadingSlots.set(true);
    const clinicId = this.currentUserService.getClinicId();

    if (!clinicId) {
      const defaultSlots = this.generateDefaultSlots();
      this.availableSlots.set(defaultSlots);
      this.isLoadingSlots.set(false);
      return;
    }

    this.clinicAgendaConfigService.getClinicAgendaConfig(clinicId).subscribe({
      next: (config) => {
        const slots = this.clinicAgendaConfigService.generateTimeSlots(config);
        this.availableSlots.set(slots);
        this.isLoadingSlots.set(false);
      },
      error: () => {
        const defaultSlots = this.generateDefaultSlots();
        this.availableSlots.set(defaultSlots);
        this.isLoadingSlots.set(false);
      },
    });
  }

  private generateDefaultSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    const intervalMinutes = 30;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        if (hour === endHour && minute > 0) break;
        if (hour === 12 && minute === 0) continue;
        if (hour === 12) continue;

        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push({
          time: timeString,
          hour,
          minute,
          isLunch: false,
        });
      }
    }

    return slots;
  }

  selectTimeSlot(slot: TimeSlot) {
    if (!slot.isLunch) {
      this.appointmentForm.patchValue({
        appointmentTime: slot.time,
      });
    }
  }

  private isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  private isValidAppointmentDate(dateString: string): { valid: boolean; message?: string } {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { valid: false, message: 'Não é permitido agendar para datas passadas' };
    }

    if (this.isWeekend(selectedDate)) {
      return { valid: false, message: 'Não é permitido agendar para fins de semana' };
    }

    return { valid: true };
  }

  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  onSubmit() {
    if (!this.currentUserService.canRescheduleAppointment()) {
      this.alertService.error('Você não tem permissão para remarcar consultas');
      return;
    }

    if (this.appointmentForm.invalid) {
      this.alertService.error('Preencha todos os campos obrigatórios');
      return;
    }

    const dateString = this.appointmentForm.get('appointmentDate')?.value;
    const validation = this.isValidAppointmentDate(dateString);
    if (!validation.valid) {
      this.alertService.error(validation.message || 'Data inválida');
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.appointmentForm.value;
    const [hour, minute] = formValue.appointmentTime.split(':').map(Number);
    const [year, month, day] = formValue.appointmentDate.split('-').map(Number);

    const newStartsAt = new Date(year, month - 1, day, hour, minute, 0, 0);
    const newEndsAt = new Date(newStartsAt);
    newEndsAt.setMinutes(newEndsAt.getMinutes() + 30);

    const dto: UpdateAppointmentDto = {
      startsAt: newStartsAt.toISOString(),
      endsAt: newEndsAt.toISOString(),
      notes: formValue.notes || undefined,
    };

    this.appointmentsService.update(this.appointment().id, dto).subscribe({
      next: (response: Appointment) => {
        this.isSubmitting.set(false);
        this.alertService.success('Consulta remarcada com sucesso!');
        this.onClose.emit({
          saved: true,
          appointment: response,
        });
      },
      error: () => {
        this.isSubmitting.set(false);
        this.alertService.error('Erro ao remarcar consulta. Tente novamente.');
      },
    });
  }

  onCancel() {
    this.onClose.emit({ saved: false });
  }
}
