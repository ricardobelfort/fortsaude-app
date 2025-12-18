import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  PatientsService,
  ProfessionalsService,
  AppointmentsService,
  CurrentUserService,
  ServiceTypesService,
} from '../../../core/services';
import {
  Patient,
  Professional,
  Appointment,
  CreateAppointmentDto,
  ServiceType,
} from '../../../core/models';
import { AlertService } from '../../../shared/ui/alert.service';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  available: boolean;
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [title]="'Agendar Nova Consulta'"
      [submitButtonText]="'Agendar Consulta'"
      [cancelButtonText]="'Cancelar'"
      [isLoading]="isSubmitting()"
      [isFormValid]="appointmentForm.valid"
      [formId]="'appointmentFormId'"
      (cancelled)="onCancel()"
      (submitted)="onSubmit()"
    >
      <form
        id="appointmentFormId"
        [formGroup]="appointmentForm"
        (ngSubmit)="onSubmit()"
        modal-content
        class="space-y-6"
      >
        <!-- Paciente -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold text-gray-700">Paciente</span>
          </label>
          <select
            formControlName="patientId"
            class="select select-bordered select-sm w-full"
            (change)="onPatientChange()"
          >
            <option value="">Selecione um paciente...</option>
            @for (patient of patients(); track patient.id) {
              <option [value]="patient.id">{{ patient.fullName }}</option>
            }
          </select>
          @if (
            appointmentForm.get('patientId')?.hasError('required') &&
            appointmentForm.get('patientId')?.touched
          ) {
            <label class="label">
              <span class="label-text-alt text-error">Paciente é obrigatório</span>
            </label>
          }
        </div>

        <!-- Profissional -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold text-gray-700">Profissional</span>
          </label>
          <select
            formControlName="professionalId"
            class="select select-bordered select-sm w-full"
            (change)="onProfessionalChange()"
          >
            <option value="">Selecione um profissional...</option>
            @for (professional of professionals(); track professional.id) {
              <option [value]="professional.id">
                {{ professional.profile.account.person.fullName }} -
                {{ professional.specialty }}
              </option>
            }
          </select>
          @if (
            appointmentForm.get('professionalId')?.hasError('required') &&
            appointmentForm.get('professionalId')?.touched
          ) {
            <label class="label">
              <span class="label-text-alt text-error">Profissional é obrigatório</span>
            </label>
          }
        </div>

        <!-- Tipo de Serviço -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold text-gray-700">Tipo de Serviço</span>
          </label>
          @if (isLoadingServiceTypes()) {
            <div class="flex items-center justify-center py-4">
              <div class="loading loading-spinner loading-sm text-primary"></div>
            </div>
          } @else if (serviceTypes().length === 0) {
            <input
              type="text"
              formControlName="serviceProvidedId"
              placeholder="Insira o ID do serviço"
              class="input input-bordered input-sm w-full"
            />
            <p class="text-xs text-gray-500 mt-2">
              Tipos de serviço não disponíveis. Insira o ID manualmente.
            </p>
          } @else {
            <select
              formControlName="serviceProvidedId"
              class="select select-bordered select-sm w-full"
            >
              <option value="">Selecione um tipo de serviço...</option>
              @for (service of serviceTypes(); track service.id) {
                <option [value]="service.id">{{ service.name }}</option>
              }
            </select>
          }
          @if (
            appointmentForm.get('serviceProvidedId')?.hasError('required') &&
            appointmentForm.get('serviceProvidedId')?.touched
          ) {
            <label class="label">
              <span class="label-text-alt text-error">Tipo de serviço é obrigatório</span>
            </label>
          }
        </div>

        <!-- Data -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold text-gray-700">Data</span>
          </label>
          <input
            type="date"
            formControlName="appointmentDate"
            class="input input-bordered input-sm w-full"
            (change)="onDateChange()"
            [min]="getMinDate()"
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

        <!-- Horário -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold text-gray-700">Horário</span>
          </label>
          @if (isLoadingSlots()) {
            <div class="flex items-center justify-center py-8">
              <div class="loading loading-spinner text-primary"></div>
            </div>
          } @else if (availableSlots().length === 0) {
            <p class="text-sm text-gray-500 text-center py-4">
              Nenhum horário disponível para esta data
            </p>
          } @else {
            <div class="grid grid-cols-4 gap-2">
              @for (slot of availableSlots(); track slot.time) {
                <button
                  type="button"
                  (click)="selectTimeSlot(slot)"
                  [class.btn-primary]="appointmentForm.get('appointmentTime')?.value === slot.time"
                  [class.btn-outline]="appointmentForm.get('appointmentTime')?.value !== slot.time"
                  [disabled]="!slot.available"
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
          }
        </div>

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
export class AppointmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private patientsService = inject(PatientsService);
  private professionalsService = inject(ProfessionalsService);
  private appointmentsService = inject(AppointmentsService);
  private alertService = inject(AlertService);
  private currentUserService = inject(CurrentUserService);
  private serviceTypesService = inject(ServiceTypesService);

  clinicId = input<string>('');
  onClose = output<{ saved: boolean; appointment?: Appointment }>();

  appointmentForm: FormGroup;
  patients = signal<Patient[]>([]);
  professionals = signal<Professional[]>([]);
  serviceTypes = signal<ServiceType[]>([]);
  availableSlots = signal<TimeSlot[]>([]);
  isLoadingSlots = signal(false);
  isLoadingServiceTypes = signal(false);
  isSubmitting = signal(false);

  constructor() {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      professionalId: ['', Validators.required],
      serviceProvidedId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit() {
    console.log('🚀 [AppointmentForm] Inicializando componente');
    this.loadPatients();
    this.loadProfessionals();
    this.loadServiceTypes();
  }

  private loadPatients() {
    console.log('📥 [AppointmentForm] Carregando pacientes...');
    this.patientsService.getAll().subscribe({
      next: (response: Patient[]) => {
        console.log('✅ [AppointmentForm] Pacientes carregados:', response.length, 'registros');
        this.patients.set(response || []);
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ [AppointmentForm] Erro ao carregar pacientes:', error);
        this.alertService.error('Erro ao carregar lista de pacientes');
      },
    });
  }

  private loadProfessionals() {
    console.log('📥 [AppointmentForm] Carregando profissionais...');
    this.professionalsService.getAll().subscribe({
      next: (response: Professional[]) => {
        console.log('✅ [AppointmentForm] Profissionais carregados:', response.length, 'registros');
        this.professionals.set(response || []);
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ [AppointmentForm] Erro ao carregar profissionais:', error);
        this.alertService.error('Erro ao carregar lista de profissionais');
      },
    });
  }

  private loadServiceTypes() {
    const clinicId = this.currentUserService.getClinicId();

    if (!clinicId) {
      console.warn('⚠️ [AppointmentForm] clinicId não disponível para carregar tipos de serviço');
      this.isLoadingServiceTypes.set(false);
      return;
    }

    console.log('📥 [AppointmentForm] Carregando tipos de serviço para clínica:', clinicId);
    this.isLoadingServiceTypes.set(true);
    this.serviceTypesService.getByClinic(clinicId).subscribe({
      next: (response: ServiceType[]) => {
        console.log(
          '✅ [AppointmentForm] Tipos de serviço carregados:',
          response.length,
          'registros'
        );
        this.serviceTypes.set(response || []);
        this.isLoadingServiceTypes.set(false);
      },
      error: (error: unknown) => {
        console.error('[AppointmentForm] Tipos de serviço não disponíveis:', error);
        this.isLoadingServiceTypes.set(false);
        this.serviceTypes.set([]);
      },
    });
  }

  onPatientChange() {
    // Limpar horário selecionado quando mudar paciente
    this.appointmentForm.patchValue({ appointmentTime: '' });
    this.loadAvailableSlots();
  }

  onProfessionalChange() {
    // Limpar horário e tipo de serviço selecionado quando mudar profissional
    this.appointmentForm.patchValue({
      appointmentTime: '',
      serviceProvidedId: '',
    });
    this.loadAvailableSlots();
  }

  onDateChange() {
    // Validar data selecionada
    const dateInput = this.appointmentForm.get('appointmentDate');
    if (dateInput?.value) {
      const validation = this.isValidAppointmentDate(dateInput.value);
      if (!validation.valid) {
        console.warn('⚠️ [AppointmentForm] Data inválida:', validation.message);
        this.alertService.error(validation.message || 'Data inválida');
        dateInput.reset();
        this.appointmentForm.patchValue({ appointmentTime: '' });
        this.availableSlots.set([]);
        return;
      }
    }

    // Limpar horário selecionado quando mudar data
    this.appointmentForm.patchValue({ appointmentTime: '' });
    this.loadAvailableSlots();
  }

  private loadAvailableSlots() {
    const professionalId = this.appointmentForm.get('professionalId')?.value;
    const appointmentDate = this.appointmentForm.get('appointmentDate')?.value;

    if (!professionalId || !appointmentDate) {
      this.availableSlots.set([]);
      return;
    }

    this.isLoadingSlots.set(true);

    // TODO: Chamar serviço para obter slots disponíveis do profissional
    // Por enquanto, gerar slots genéricos (8:00 - 18:30, intervalos de 30 min)
    const slots = this.generateDefaultSlots();

    // Simular delay de carregamento
    setTimeout(() => {
      this.availableSlots.set(slots);
      this.isLoadingSlots.set(false);
    }, 300);
  }

  private generateDefaultSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    const intervalMinutes = 30;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        if (hour === endHour && minute > 0) break;

        // Pular horário de almoço (12:00 - 13:00)
        if (hour === 12 && minute === 0) continue;
        if (hour === 12) continue;

        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push({
          time: timeString,
          hour,
          minute,
          available: Math.random() > 0.3, // 70% de chance de estar disponível
        });
      }
    }

    return slots;
  }

  selectTimeSlot(slot: TimeSlot) {
    console.log(
      '⏰ [AppointmentForm] Selecionando horário:',
      slot.time,
      'Disponível:',
      slot.available
    );
    if (slot.available) {
      this.appointmentForm.patchValue({
        appointmentTime: slot.time,
      });
      console.log('✅ [AppointmentForm] Horário atualizado no formulário:', slot.time);
      console.log('📋 [AppointmentForm] Form value após horário:', this.appointmentForm.value);
    } else {
      console.warn('❌ [AppointmentForm] Horário indisponível:', slot.time);
    }
  }

  private isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Domingo, 6 = Sábado
  }

  private isValidAppointmentDate(dateString: string): { valid: boolean; message?: string } {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar se é uma data no passado
    if (selectedDate < today) {
      return { valid: false, message: 'Não é permitido agendar para datas passadas' };
    }

    // Verificar se é fim de semana
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
    console.log('📋 [AppointmentForm] onSubmit chamado');
    console.log('📋 [AppointmentForm] Form válido?', this.appointmentForm.valid);
    console.log('📋 [AppointmentForm] Form value:', this.appointmentForm.value);

    if (this.appointmentForm.invalid) {
      console.warn('❌ [AppointmentForm] Formulário inválido');
      this.alertService.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar data novamente antes de submeter
    const dateString = this.appointmentForm.get('appointmentDate')?.value;
    const validation = this.isValidAppointmentDate(dateString);
    if (!validation.valid) {
      console.warn('❌ [AppointmentForm] Data inválida:', validation.message);
      this.alertService.error(validation.message || 'Data inválida');
      return;
    }

    console.log('✅ [AppointmentForm] Iniciando submissão do formulário');
    this.isSubmitting.set(true);

    const formValue = this.appointmentForm.value;
    const [hour, minute] = formValue.appointmentTime.split(':').map(Number);

    // Combinar data e horário para criar startsAt
    // A data vem no formato YYYY-MM-DD do input[type=date]
    // Parse corretamente considerando que é uma data local
    const [year, month, day] = formValue.appointmentDate.split('-').map(Number);
    const appointmentDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);

    // Calcular endsAt (assumindo 30 minutos de consulta)
    const endsAt = new Date(appointmentDateTime);
    endsAt.setMinutes(endsAt.getMinutes() + 30);

    // Obter clinicId do usuário autenticado
    const clinicId = this.currentUserService.getClinicId();

    const appointmentPayload: CreateAppointmentDto = {
      clinicId: clinicId || '',
      patientId: formValue.patientId,
      professionalId: formValue.professionalId,
      serviceProvidedId: formValue.serviceProvidedId,
      startsAt: appointmentDateTime.toISOString(),
      endsAt: endsAt.toISOString(),
      notes: formValue.notes || undefined,
    };

    console.log('📤 [AppointmentForm] Payload sendo enviado:', appointmentPayload);

    this.appointmentsService.create(appointmentPayload).subscribe({
      next: (response: Appointment) => {
        console.log('✅ [AppointmentForm] Consulta agendada com sucesso!', response);
        this.isSubmitting.set(false);
        this.alertService.success('Consulta agendada com sucesso!');
        this.onClose.emit({
          saved: true,
          appointment: response,
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ [AppointmentForm] Erro ao agendar consulta:', error);
        this.isSubmitting.set(false);
        this.alertService.error('Erro ao agendar consulta. Tente novamente.');
      },
    });
  }

  onCancel() {
    console.log('🚫 [AppointmentForm] Formulário cancelado');
    this.onClose.emit({ saved: false });
  }
}
