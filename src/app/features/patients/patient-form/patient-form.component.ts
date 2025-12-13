import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  PatientInfo,
  CreatePatientDto,
  UpdatePatientDto,
  Patient,
} from '../../../core/models/patient.model';

interface CalendarDay {
  day: number;
  date: Date;
  isOtherMonth: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-patient-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Steps Indicator -->
      <ul class="steps w-full">
        @for (step of [1, 2, 3, 4]; track step) {
          <li class="step" [class.step-primary]="step <= currentStep()">
            <span class="text-xs sm:text-sm">
              @switch (step) {
                @case (1) {
                  Dados Pessoais
                }
                @case (2) {
                  Saúde
                }
                @case (3) {
                  Endereço
                }
                @case (4) {
                  Observações
                }
              }
            </span>
          </li>
        }
      </ul>

      <!-- Form -->
      <form [formGroup]="form" id="patient-edit-form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Step 1: Dados Pessoais -->
        @if (currentStep() === 1) {
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-900">Dados Pessoais</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Full Name -->
              <div class="sm:col-span-2">
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">
                      Nome Completo <span class="text-error">*</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    formControlName="fullName"
                    placeholder="Nome completo do paciente"
                    [class.input-error]="
                      form.get('fullName')?.invalid && form.get('fullName')?.touched
                    "
                    class="input input-bordered w-full"
                  />
                  @if (form.get('fullName')?.invalid && form.get('fullName')?.touched) {
                    <div class="label">
                      <span class="label-text-alt text-error">Este campo é obrigatório</span>
                    </div>
                  }
                </label>
              </div>

              <!-- Document ID (CPF) -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">CPF</span>
                  </div>
                  <input
                    type="text"
                    formControlName="documentId"
                    placeholder="XXX.XXX.XXX-XX"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- RG -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">RG</span>
                  </div>
                  <input
                    type="text"
                    formControlName="rg"
                    placeholder="RG"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Date of Birth -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Data de Nascimento</span>
                  </div>
                  <div class="dropdown dropdown-end w-full">
                    <input
                      type="text"
                      [value]="getFormattedDate()"
                      placeholder="DD/MM/YYYY"
                      readonly
                      tabindex="0"
                      class="input input-bordered w-full cursor-pointer"
                      (click)="toggleCalendar()"
                    />
                    @if (showCalendar()) {
                      <div
                        tabindex="0"
                        class="dropdown-content z-[1] card card-compact shadow bg-base-100 p-0"
                      >
                        <div class="p-4">
                          <div class="flex justify-between items-center mb-4">
                            <button
                              type="button"
                              (click)="previousMonth()"
                              class="btn btn-sm btn-ghost"
                            >
                              ←
                            </button>
                            <div class="text-sm font-semibold">
                              {{ months()[currentMonth()] }} {{ currentYear() }}
                            </div>
                            <button
                              type="button"
                              (click)="nextMonth()"
                              class="btn btn-sm btn-ghost"
                            >
                              →
                            </button>
                          </div>
                          <div class="grid grid-cols-7 gap-1 mb-2">
                            <div class="text-xs font-semibold text-center text-base-content/70">
                              Dom
                            </div>
                            <div class="text-xs font-semibold text-center text-base-content/70">
                              Seg
                            </div>
                            <div class="text-xs font-semibold text-center text-base-content/70">
                              Ter
                            </div>
                            <div class="text-xs font-semibold text-center text-base-content/70">
                              Qua
                            </div>
                            <div class="text-xs font-semibold text-center text-base-content/70">
                              Qui
                            </div>
                            <div class="text-xs font-semibold text-center text-base-content/70">
                              Sex
                            </div>
                            <div class="text-xs font-semibold text-center text-base-content/70">
                              Sáb
                            </div>
                          </div>
                          <div class="grid grid-cols-7 gap-1">
                            @for (day of calendarDays(); track day.date) {
                              <button
                                type="button"
                                (click)="selectDate(day.date)"
                                [disabled]="day.isOtherMonth"
                                [class.btn-primary]="day.isSelected"
                                [class.text-base-content/40]="day.isOtherMonth"
                                class="btn btn-sm btn-ghost"
                              >
                                {{ day.day }}
                              </button>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </label>
              </div>

              <!-- Gender -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Gênero</span>
                  </div>
                  <select formControlName="gender" class="select select-bordered w-full">
                    <option value="">Selecionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </label>
              </div>

              <!-- Blood Type -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Tipo Sanguíneo</span>
                  </div>
                  <select formControlName="bloodType" class="select select-bordered w-full">
                    <option value="">Selecionar</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </label>
              </div>

              <!-- Email -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold"
                      >Email <span class="text-error">*</span></span
                    >
                  </div>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="email@example.com"
                    [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched"
                    class="input input-bordered w-full"
                  />
                  @if (form.get('email')?.invalid && form.get('email')?.touched) {
                    <div class="label">
                      <span class="label-text-alt text-error">
                        @if (form.get('email')?.errors?.['required']) {
                          Este campo é obrigatório
                        } @else if (form.get('email')?.errors?.['email']) {
                          Email inválido
                        }
                      </span>
                    </div>
                  }
                </label>
              </div>

              <!-- Phone -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold"
                      >Telefone <span class="text-error">*</span></span
                    >
                  </div>
                  <input
                    type="text"
                    formControlName="phone"
                    placeholder="(XX) XXXXX-XXXX"
                    (input)="onPhoneInput($event, 'phone')"
                    [class.input-error]="form.get('phone')?.invalid && form.get('phone')?.touched"
                    class="input input-bordered w-full"
                  />
                  @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
                    <div class="label">
                      <span class="label-text-alt text-error">Este campo é obrigatório</span>
                    </div>
                  }
                </label>
              </div>

              <!-- Emergency Phone -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Telefone de Emergência</span>
                  </div>
                  <input
                    type="text"
                    formControlName="emergencyPhone"
                    placeholder="(XX) XXXXX-XXXX"
                    (input)="onPhoneInput($event, 'emergencyPhone')"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Emergency Contact Name -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Responsável 1 (Nome)</span>
                  </div>
                  <input
                    type="text"
                    formControlName="emergencyContactName"
                    placeholder="Nome do responsável"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Emergency Contact Degree -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Grau de Parentesco</span>
                  </div>
                  <input
                    type="text"
                    formControlName="emergencyContactDegree"
                    placeholder="Ex: Mãe, Pai, Cônjuge"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>
            </div>
          </div>
        }

        <!-- Step 2: Informações de Saúde -->
        @if (currentStep() === 2) {
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-900">Informações de Saúde</h3>
            <div class="grid grid-cols-2 gap-4">
              <!-- Medical Doctor -->
              <div class="col-span-2">
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Nome do Médico</span>
                  </div>
                  <input
                    type="text"
                    formControlName="medicalDoctor"
                    placeholder="Nome do médico responsável"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Health Treatment -->
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Faz tratamento de saúde?</span>
                </label>
                <div class="flex gap-4">
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="healthTreatment"
                      [value]="true"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Sim</span>
                  </label>
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="healthTreatment"
                      [value]="false"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Não</span>
                  </label>
                </div>
              </div>

              <!-- Health Treatment Details -->
              @if (form.get('healthTreatment')?.value) {
                <div>
                  <label class="form-control w-full">
                    <div class="label">
                      <span class="label-text font-semibold">Qual?</span>
                    </div>
                    <input
                      type="text"
                      formControlName="healthTreatmentDetails"
                      placeholder="Descreva o tratamento"
                      class="input input-bordered w-full"
                    />
                  </label>
                </div>
              }

              <!-- Medications -->
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Usa medicações?</span>
                </label>
                <div class="flex gap-4">
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="medications"
                      [value]="true"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Sim</span>
                  </label>
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="medications"
                      [value]="false"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Não</span>
                  </label>
                </div>
              </div>

              <!-- Medications Details -->
              @if (form.get('medications')?.value) {
                <div>
                  <label class="form-control w-full">
                    <div class="label">
                      <span class="label-text font-semibold">Qual?</span>
                    </div>
                    <input
                      type="text"
                      formControlName="medicationsDetails"
                      placeholder="Descreva as medicações"
                      class="input input-bordered w-full"
                    />
                  </label>
                </div>
              }

              <!-- Health Plan -->
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Possui Plano de Saúde?</span>
                </label>
                <div class="flex gap-4">
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="healthPlan"
                      [value]="true"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Sim</span>
                  </label>
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="healthPlan"
                      [value]="false"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Não</span>
                  </label>
                </div>
              </div>

              <!-- Health Plan Details -->
              @if (form.get('healthPlan')?.value) {
                <div>
                  <label class="form-control w-full">
                    <div class="label">
                      <span class="label-text font-semibold">Qual?</span>
                    </div>
                    <input
                      type="text"
                      formControlName="healthPlanDetails"
                      placeholder="Nome do plano"
                      class="input input-bordered w-full"
                    />
                  </label>
                </div>
              }

              <!-- Dental Treatment -->
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Faz acompanhamento Odontológico?</span>
                </label>
                <div class="flex gap-4">
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="dentalTreatment"
                      [value]="true"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Sim</span>
                  </label>
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="dentalTreatment"
                      [value]="false"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Não</span>
                  </label>
                </div>
              </div>

              <!-- Dental Treatment Details -->
              @if (form.get('dentalTreatment')?.value) {
                <div>
                  <label class="form-control w-full">
                    <div class="label">
                      <span class="label-text font-semibold">Qual?</span>
                    </div>
                    <input
                      type="text"
                      formControlName="dentalTreatmentDetails"
                      placeholder="Descreva o acompanhamento"
                      class="input input-bordered w-full"
                    />
                  </label>
                </div>
              }

              <!-- Special Care Needed -->
              <div>
                <label class="label">
                  <span class="label-text font-semibold">Necessita de atendimento especial?</span>
                </label>
                <div class="flex gap-4">
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="specialCareNeeded"
                      [value]="true"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Sim</span>
                  </label>
                  <label class="label cursor-pointer">
                    <input
                      type="radio"
                      formControlName="specialCareNeeded"
                      [value]="false"
                      class="radio radio-sm"
                    />
                    <span class="label-text ml-2">Não</span>
                  </label>
                </div>
              </div>

              <!-- Special Care Details -->
              @if (form.get('specialCareNeeded')?.value) {
                <div class="col-span-2">
                  <label class="form-control w-full">
                    <div class="label">
                      <span class="label-text font-semibold">Em caso afirmativo, qual?</span>
                    </div>
                    <textarea
                      formControlName="specialCareDetails"
                      rows="3"
                      placeholder="Descreva a necessidade especial"
                      class="textarea textarea-bordered w-full"
                    ></textarea>
                  </label>
                </div>
              }

              <!-- Specialties -->
              <div class="col-span-2">
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Será atendido pelas especialidades</span>
                  </div>
                  <input
                    type="text"
                    formControlName="specialties"
                    placeholder="Ex: Fisioterapia, Psicologia"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Preferred Schedule -->
              <div class="col-span-2">
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold"
                      >Preferência de horário de atendimento</span
                    >
                  </div>
                  <input
                    type="text"
                    formControlName="preferredSchedule"
                    placeholder="Ex: Manhã, Tarde"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Agreement -->
              <div class="col-span-2">
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Qual Convênio</span>
                  </div>
                  <input
                    type="text"
                    formControlName="agreement"
                    placeholder="Nome do convênio"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Endereço -->
        @if (currentStep() === 3) {
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-900">Endereço</h3>
            <div class="grid grid-cols-1 gap-4">
              <!-- Street -->
              <div class="col-span-2">
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Rua</span>
                  </div>
                  <input
                    type="text"
                    formControlName="addressStreet"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Number -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Número</span>
                  </div>
                  <input
                    type="text"
                    formControlName="addressNumber"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Type -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Tipo</span>
                  </div>
                  <input
                    type="text"
                    formControlName="addressType"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Complement -->
              <div class="col-span-2">
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Complemento</span>
                  </div>
                  <input
                    type="text"
                    formControlName="addressComplement"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Neighborhood -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Bairro</span>
                  </div>
                  <input
                    type="text"
                    formControlName="addressNeighborhood"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- Zip Code -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">CEP</span>
                  </div>
                  <input
                    type="text"
                    formControlName="addressZipCode"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- City -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Cidade</span>
                  </div>
                  <input
                    type="text"
                    formControlName="addressCity"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>

              <!-- State -->
              <div>
                <label class="form-control w-full">
                  <div class="label">
                    <span class="label-text font-semibold">Estado</span>
                  </div>
                  <input
                    type="text"
                    formControlName="addressState"
                    class="input input-bordered w-full"
                  />
                </label>
              </div>
            </div>
          </div>
        }

        <!-- Step 4: Observações -->
        @if (currentStep() === 4) {
          <div class="space-y-4">
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text font-semibold">Observações</span>
              </div>
              <textarea
                formControlName="notes"
                rows="4"
                placeholder="Observações adicionais"
                class="textarea textarea-bordered w-full"
              ></textarea>
            </label>
          </div>
        }

        <!-- Navigation Buttons -->
        <div class="flex gap-2 pt-6">
          <button
            type="button"
            (click)="previousStep()"
            [disabled]="currentStep() === 1"
            class="btn btn-outline"
          >
            Voltar
          </button>
          @if (currentStep() < totalSteps) {
            <button type="button" (click)="nextStep()" class="btn btn-primary ml-auto">
              Próximo
            </button>
          } @else {
            <button type="submit" (click)="onSubmit()" class="btn btn-primary ml-auto">
              Salvar
            </button>
          }
        </div>
      </form>
    </div>
  `,
})
export class PatientFormComponent {
  private readonly fb = inject(FormBuilder);

  patient = input<PatientInfo | Patient | null>(null);
  isSubmitting = input(false);

  submitted = output<CreatePatientDto | UpdatePatientDto>();
  cancelled = output<void>();
  formValidChange = output<boolean>();

  showCalendar = signal(false);
  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());
  currentStep = signal(1);
  totalSteps = 4;

  months = signal([
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]);

  form = this.fb.group({
    fullName: ['', Validators.required],
    dateOfBirth: [''],
    documentId: [''],
    rg: [''],
    gender: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    emergencyPhone: [''],
    emergencyContactName: [''],
    emergencyContactDegree: [''],
    bloodType: [''],
    medicalDoctor: [''],
    healthTreatment: [false],
    healthTreatmentDetails: [''],
    medications: [false],
    medicationsDetails: [''],
    healthPlan: [false],
    healthPlanDetails: [''],
    dentalTreatment: [false],
    dentalTreatmentDetails: [''],
    specialCareNeeded: [false],
    specialCareDetails: [''],
    specialties: [''],
    preferredSchedule: [''],
    agreement: [''],
    addressStreet: [''],
    addressNumber: [''],
    addressComplement: [''],
    addressNeighborhood: [''],
    addressZipCode: [''],
    addressCity: [''],
    addressState: [''],
    addressType: [''],
    notes: [''],
    active: [true],
  });

  constructor() {
    effect(() => {
      const patientData = this.patient();
      if (patientData) {
        this.populateForm(patientData as PatientInfo);
      }
    });

    // Emit initial form state
    setTimeout(() => {
      this.formValidChange.emit(this.form.valid);
    }, 100);

    // Monitor form validation changes using valueChanges
    this.form.valueChanges.subscribe(() => {
      this.formValidChange.emit(this.form.valid);
    });

    // Also monitor statusChanges as fallback
    this.form.statusChanges.subscribe(() => {
      this.formValidChange.emit(this.form.valid);
    });
  }

  calendarDays = signal<CalendarDay[]>([]);

  formattedDateOfBirth = signal('');

  private updateCalendarDays(): void {
    const firstDay = new Date(this.currentYear(), this.currentMonth(), 1);
    const lastDay = new Date(this.currentYear(), this.currentMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const selectedDate = this.form.get('dateOfBirth')?.value;
    const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const isOtherMonth = date.getMonth() !== this.currentMonth();
      const isSelected = !!(selectedDateObj && this.isSameDay(date, selectedDateObj));

      days.push({
        day: date.getDate(),
        date: new Date(date),
        isOtherMonth,
        isSelected,
      });
    }

    this.calendarDays.set(days);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private formatDateToBr(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  }

  getFormattedDate(): string {
    return this.formatDateToBr(this.form.get('dateOfBirth')?.value || '');
  }

  toggleCalendar(): void {
    this.showCalendar.update((v) => !v);
    if (this.showCalendar()) {
      this.updateCalendarDays();
    }
  }

  previousMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
    this.updateCalendarDays();
  }

  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
    this.updateCalendarDays();
  }

  selectDate(date: Date): void {
    const isoDate = date.toISOString().split('T')[0];
    this.form.patchValue({ dateOfBirth: isoDate });
    this.showCalendar.set(false);
  }

  formatPhoneNumber(value: string): string {
    if (!value) return '';
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    // Format: (XX) XXXXX-XXXX
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  }

  onPhoneInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatPhoneNumber(input.value);
    this.form.get(controlName)?.setValue(formatted, { emitEvent: false });
  }

  private populateForm(patient: PatientInfo | Patient): void {
    const address = typeof patient.address === 'string' ? {} : patient.address || {};

    const addressObj = address as Record<string, unknown>;

    this.form.patchValue({
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      documentId: patient.documentId || undefined,
      email: patient.email,
      phone: patient.phone || undefined,
      notes: (patient as PatientInfo).notes || undefined,
      addressStreet: (addressObj['street'] as string | undefined) || undefined,
      addressNumber: (addressObj['number'] as string | undefined) || undefined,
      addressComplement: (addressObj['complement'] as string | undefined) || undefined,
      addressNeighborhood: (addressObj['neighborhood'] as string | undefined) || undefined,
      addressZipCode: (addressObj['zipCode'] as string | undefined) || undefined,
      addressCity: (addressObj['city'] as string | undefined) || undefined,
      addressState: (addressObj['state'] as string | undefined) || undefined,
      addressType: (addressObj['type'] as string | undefined) || undefined,
      active: patient.active !== undefined ? patient.active : true,
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const formValue = this.form.value;
    const data: CreatePatientDto | UpdatePatientDto = {
      fullName: formValue.fullName || undefined,
      dateOfBirth: formValue.dateOfBirth || undefined,
      email: formValue.email || undefined,
      phone: formValue.phone || undefined,
      documentId: formValue.documentId || undefined,
      rg: formValue.rg || undefined,
      gender: formValue.gender || undefined,
      emergencyPhone: formValue.emergencyPhone || undefined,
      emergencyContactName: formValue.emergencyContactName || undefined,
      emergencyContactDegree: formValue.emergencyContactDegree || undefined,
      bloodType: formValue.bloodType || undefined,
      medicalDoctor: formValue.medicalDoctor || undefined,
      healthTreatment: formValue.healthTreatment || undefined,
      healthTreatmentDetails: formValue.healthTreatmentDetails || undefined,
      medications: formValue.medications || undefined,
      medicationsDetails: formValue.medicationsDetails || undefined,
      healthPlan: formValue.healthPlan || undefined,
      healthPlanDetails: formValue.healthPlanDetails || undefined,
      dentalTreatment: formValue.dentalTreatment || undefined,
      dentalTreatmentDetails: formValue.dentalTreatmentDetails || undefined,
      specialCareNeeded: formValue.specialCareNeeded || undefined,
      specialCareDetails: formValue.specialCareDetails || undefined,
      specialties: formValue.specialties || undefined,
      preferredSchedule: formValue.preferredSchedule || undefined,
      agreement: formValue.agreement || undefined,
      addressStreet: formValue.addressStreet || undefined,
      addressNumber: formValue.addressNumber || undefined,
      addressComplement: formValue.addressComplement || undefined,
      addressNeighborhood: formValue.addressNeighborhood || undefined,
      addressZipCode: formValue.addressZipCode || undefined,
      addressCity: formValue.addressCity || undefined,
      addressState: formValue.addressState || undefined,
      addressType: formValue.addressType || undefined,
      notes: formValue.notes || undefined,
      active: formValue.active !== null ? formValue.active : undefined,
    };

    this.submitted.emit(data);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update((step) => step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((step) => step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
