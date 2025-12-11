import { Component, ChangeDetectionStrategy, input, output, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  PatientInfo,
  CreatePatientDto,
  UpdatePatientDto,
  Patient,
} from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" id="patient-edit-form" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Dados Pessoais -->
      <div class="bg-white rounded-lg p-6 border border-slate-200">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Dados Pessoais</h3>
        <div class="grid grid-cols-2 gap-6">
          <!-- Full Name -->
          <div class="col-span-2">
            <label class="text-sm font-semibold text-gray-600 block mb-2">Nome Completo *</label>
            <input
              type="text"
              formControlName="fullName"
              class="fs-input w-full"
              placeholder="Nome completo do paciente"
            />
          </div>

          <!-- Document ID (CPF) -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">CPF</label>
            <input
              type="text"
              formControlName="documentId"
              class="fs-input w-full"
              placeholder="XXX.XXX.XXX-XX"
            />
          </div>

          <!-- RG -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">RG</label>
            <input type="text" formControlName="rg" class="fs-input w-full" placeholder="RG" />
          </div>

          <!-- Date of Birth -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Data de Nascimento</label>
            <input type="date" formControlName="dateOfBirth" class="fs-input w-full" />
          </div>

          <!-- Gender -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Gênero</label>
            <select formControlName="gender" class="fs-select w-full">
              <option value="">Selecionar</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>

          <!-- Blood Type -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Tipo Sanguíneo</label>
            <select formControlName="bloodType" class="fs-select w-full">
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
          </div>

          <!-- Email -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Email *</label>
            <input
              type="email"
              formControlName="email"
              class="fs-input w-full"
              placeholder="email@example.com"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Telefone *</label>
            <input
              type="tel"
              formControlName="phone"
              class="fs-input w-full"
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          <!-- Emergency Phone -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2"
              >Telefone de Emergência</label
            >
            <input
              type="tel"
              formControlName="emergencyPhone"
              class="fs-input w-full"
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          <!-- Emergency Contact Name -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2"
              >Responsável 1 (Nome)</label
            >
            <input
              type="text"
              formControlName="emergencyContactName"
              class="fs-input w-full"
              placeholder="Nome do responsável"
            />
          </div>

          <!-- Emergency Contact Degree -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Grau de Parentesco</label>
            <input
              type="text"
              formControlName="emergencyContactDegree"
              class="fs-input w-full"
              placeholder="Ex: Mãe, Pai, Cônjuge"
            />
          </div>
        </div>
      </div>

      <!-- Dados sobre Saúde -->
      <div class="bg-white rounded-lg p-6 border border-slate-200">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Informações de Saúde</h3>
        <div class="grid grid-cols-2 gap-6">
          <!-- Medical Doctor -->
          <div class="col-span-2">
            <label class="text-sm font-semibold text-gray-600 block mb-2">Nome do Médico</label>
            <input
              type="text"
              formControlName="medicalDoctor"
              class="fs-input w-full"
              placeholder="Nome do médico responsável"
            />
          </div>

          <!-- Health Treatment -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2"
              >Faz tratamento de saúde?</label
            >
            <div class="flex gap-4 items-center h-10">
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="healthTreatment" [value]="true" />
                <span class="text-sm">Sim</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="healthTreatment" [value]="false" />
                <span class="text-sm">Não</span>
              </label>
            </div>
          </div>

          <!-- Health Treatment Details -->
          @if (form.get('healthTreatment')?.value) {
            <div>
              <label class="text-sm font-semibold text-gray-600 block mb-2">Qual?</label>
              <input
                type="text"
                formControlName="healthTreatmentDetails"
                class="fs-input w-full"
                placeholder="Descreva o tratamento"
              />
            </div>
          }

          <!-- Medications -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Usa medicações?</label>
            <div class="flex gap-4 items-center h-10">
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="medications" [value]="true" />
                <span class="text-sm">Sim</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="medications" [value]="false" />
                <span class="text-sm">Não</span>
              </label>
            </div>
          </div>

          <!-- Medications Details -->
          @if (form.get('medications')?.value) {
            <div>
              <label class="text-sm font-semibold text-gray-600 block mb-2">Qual?</label>
              <input
                type="text"
                formControlName="medicationsDetails"
                class="fs-input w-full"
                placeholder="Descreva as medicações"
              />
            </div>
          }

          <!-- Health Plan -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2"
              >Possui Plano de Saúde?</label
            >
            <div class="flex gap-4 items-center h-10">
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="healthPlan" [value]="true" />
                <span class="text-sm">Sim</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="healthPlan" [value]="false" />
                <span class="text-sm">Não</span>
              </label>
            </div>
          </div>

          <!-- Health Plan Details -->
          @if (form.get('healthPlan')?.value) {
            <div>
              <label class="text-sm font-semibold text-gray-600 block mb-2">Qual?</label>
              <input
                type="text"
                formControlName="healthPlanDetails"
                class="fs-input w-full"
                placeholder="Nome do plano"
              />
            </div>
          }

          <!-- Dental Treatment -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2"
              >Faz acompanhamento Odontológico?</label
            >
            <div class="flex gap-4 items-center h-10">
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="dentalTreatment" [value]="true" />
                <span class="text-sm">Sim</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="dentalTreatment" [value]="false" />
                <span class="text-sm">Não</span>
              </label>
            </div>
          </div>

          <!-- Dental Treatment Details -->
          @if (form.get('dentalTreatment')?.value) {
            <div>
              <label class="text-sm font-semibold text-gray-600 block mb-2">Qual?</label>
              <input
                type="text"
                formControlName="dentalTreatmentDetails"
                class="fs-input w-full"
                placeholder="Descreva o acompanhamento"
              />
            </div>
          }

          <!-- Special Care Needed -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2"
              >Necessita de atendimento especial?</label
            >
            <div class="flex gap-4 items-center h-10">
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="specialCareNeeded" [value]="true" />
                <span class="text-sm">Sim</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" formControlName="specialCareNeeded" [value]="false" />
                <span class="text-sm">Não</span>
              </label>
            </div>
          </div>

          <!-- Special Care Details -->
          @if (form.get('specialCareNeeded')?.value) {
            <div class="col-span-2">
              <label class="text-sm font-semibold text-gray-600 block mb-2"
                >Em caso afirmativo, qual?</label
              >
              <textarea
                formControlName="specialCareDetails"
                rows="3"
                class="fs-textarea w-full"
                placeholder="Descreva a necessidade especial"
              ></textarea>
            </div>
          }

          <!-- Specialties -->
          <div class="col-span-2">
            <label class="text-sm font-semibold text-gray-600 block mb-2"
              >Será atendido pelas especialidades</label
            >
            <input
              type="text"
              formControlName="specialties"
              class="fs-input w-full"
              placeholder="Ex: Fisioterapia, Psicologia"
            />
          </div>

          <!-- Preferred Schedule -->
          <div class="col-span-2">
            <label class="text-sm font-semibold text-gray-600 block mb-2"
              >Preferência de horário de atendimento</label
            >
            <input
              type="text"
              formControlName="preferredSchedule"
              class="fs-input w-full"
              placeholder="Ex: Manhã, Tarde"
            />
          </div>

          <!-- Agreement -->
          <div class="col-span-2">
            <label class="text-sm font-semibold text-gray-600 block mb-2">Qual Convênio</label>
            <input
              type="text"
              formControlName="agreement"
              class="fs-input w-full"
              placeholder="Nome do convênio"
            />
          </div>
        </div>
      </div>

      <!-- Endereço -->
      <div class="bg-white rounded-lg p-6 border border-slate-200">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Endereço</h3>
        <div class="grid grid-cols-4 gap-6">
          <!-- Street -->
          <div class="col-span-2">
            <label class="text-sm font-semibold text-gray-600 block mb-2">Rua</label>
            <input type="text" formControlName="addressStreet" class="fs-input w-full" />
          </div>

          <!-- Number -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Número</label>
            <input type="text" formControlName="addressNumber" class="fs-input w-full" />
          </div>

          <!-- Type -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Tipo</label>
            <input type="text" formControlName="addressType" class="fs-input w-full" />
          </div>

          <!-- Complement -->
          <div class="col-span-2">
            <label class="text-sm font-semibold text-gray-600 block mb-2">Complemento</label>
            <input type="text" formControlName="addressComplement" class="fs-input w-full" />
          </div>

          <!-- Neighborhood -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Bairro</label>
            <input type="text" formControlName="addressNeighborhood" class="fs-input w-full" />
          </div>

          <!-- Zip Code -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">CEP</label>
            <input type="text" formControlName="addressZipCode" class="fs-input w-full" />
          </div>

          <!-- City -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Cidade</label>
            <input type="text" formControlName="addressCity" class="fs-input w-full" />
          </div>

          <!-- State -->
          <div>
            <label class="text-sm font-semibold text-gray-600 block mb-2">Estado</label>
            <input type="text" formControlName="addressState" class="fs-input w-full" />
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="bg-white rounded-lg p-6 border border-slate-200">
        <label class="text-sm font-semibold text-gray-600 block mb-2">Observações</label>
        <textarea
          formControlName="notes"
          rows="4"
          class="fs-textarea w-full"
          placeholder="Observações adicionais"
        ></textarea>
      </div>
    </form>
  `,
})
export class PatientFormComponent {
  private readonly fb = inject(FormBuilder);

  patient = input<PatientInfo | Patient | null>(null);
  isSubmitting = input(false);

  submitted = output<CreatePatientDto | UpdatePatientDto>();
  cancelled = output<void>();

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
}
