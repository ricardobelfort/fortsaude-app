import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientsService } from '../../../core/services';
import { MedicalRecordFormComponent } from './medical-record-form/medical-record-form.component';
import { EvolutionsListComponent } from './evolutions-list/evolutions-list.component';
import { DocumentsListComponent } from './documents-list/documents-list.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { EmptyValuePipe } from '../../../shared/pipes/empty-value.pipe';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { FormatCpfPipe } from '../../../shared/pipes/format-cpf.pipe';
import { FormatPhonePipe } from '../../../shared/pipes/format-phone.pipe';
import { FormatZipCodePipe } from '../../../shared/pipes/format-zip-code.pipe';
import { PatientInfo, UpdatePatientDto } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MedicalRecordFormComponent,
    EvolutionsListComponent,
    DocumentsListComponent,
    IconComponent,
    EmptyValuePipe,
    StatusBadgePipe,
    FormatCpfPipe,
    FormatPhonePipe,
    FormatZipCodePipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header com título e botão voltar -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            @if (patient(); as p) {
              {{ p.fullName }}
            } @else {
              <div class="w-[300px] h-9 bg-gray-200 animate-pulse rounded"></div>
            }
          </h1>
          <p class="text-gray-600">Detalhes e histórico do paciente</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="isEditing.set(!isEditing())"
            class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
          >
            {{ isEditing() ? 'Cancelar' : 'Editar' }}
          </button>
          <a
            [routerLink]="['/app/patients']"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <app-icon [name]="'arrow-left'"></app-icon>
            Voltar
          </a>
        </div>
      </div>

      @if (patient(); as p) {
        <!-- Card com abas -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <!-- Abas no topo -->
          <div class="border-b border-slate-200 flex bg-white">
            <button
              type="button"
              class="px-6 py-4 text-sm font-semibold cursor-pointer transition-colors border-b-2"
              [ngClass]="
                activeTab() === 'resumo'
                  ? 'bg-indigo-600 text-white border-b-transparent'
                  : 'text-gray-700 hover:bg-slate-50 border-b-transparent'
              "
              (click)="setActiveTab('resumo')"
            >
              <div class="flex items-center text-lg gap-2">Resumo</div>
            </button>
            <button
              type="button"
              class="px-6 py-4 text-sm font-semibold cursor-pointer transition-colors border-b-2"
              [ngClass]="
                activeTab() === 'prontuario'
                  ? 'bg-indigo-600 text-white border-b-transparent'
                  : 'text-gray-700 hover:bg-slate-50 border-b-transparent'
              "
              (click)="setActiveTab('prontuario')"
            >
              <div class="flex items-center text-lg gap-2">Prontuário</div>
            </button>
            <button
              type="button"
              class="px-6 py-4 text-sm font-semibold cursor-pointer transition-colors border-b-2"
              [ngClass]="
                activeTab() === 'evolucoes'
                  ? 'bg-indigo-600 text-white border-b-transparent'
                  : 'text-gray-700 hover:bg-slate-50 border-b-transparent'
              "
              (click)="setActiveTab('evolucoes')"
            >
              <div class="flex items-center text-lg gap-2">Evoluções</div>
            </button>
            <button
              type="button"
              class="px-6 py-4 text-sm font-semibold cursor-pointer transition-colors border-b-2"
              [ngClass]="
                activeTab() === 'documentos'
                  ? 'bg-indigo-600 text-white border-b-transparent'
                  : 'text-gray-700 hover:bg-slate-50 border-b-transparent'
              "
              (click)="setActiveTab('documentos')"
            >
              <div class="flex items-center text-lg gap-2">Documentos</div>
            </button>
          </div>

          <!-- Conteúdo das abas -->
          <div class="p-6">
            <!-- Resumo Tab -->
            @if (activeTab() === 'resumo') {
              @if (!isEditing()) {
                <!-- Visualização -->
                <div class="space-y-6 relative">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Dados do Paciente</h3>
                    <div class="grid grid-cols-2 gap-6">
                      <div>
                        <label class="text-sm font-bold text-gray-900 block mb-1"
                          >Nome Completo
                        </label>
                        <p class="text-gray-500 font-light">{{ p.fullName }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Email</label>
                        <p class="text-gray-500 font-light">{{ p.email | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">CPF</label>
                        <p class="text-gray-500 font-light">
                          {{ p.documentId | formatCpf | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Telefone</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ p.phone | formatPhone | emptyValue }}
                        </p>
                      </div>
                      <div class="col-span-2">
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Observações</label
                        >
                        <p class="text-gray-500 font-light">{{ p.notes | emptyValue }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="pt-6 border-t border-slate-200">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Endereço</h3>
                    <div class="grid grid-cols-4 gap-6">
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Rua</label>
                        <p class="text-gray-500 font-light">{{ p.address?.street | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Número</label>
                        <p class="text-gray-500 font-light">{{ p.address?.number | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Complemento</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ p.address?.complement | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Tipo</label>
                        <p class="text-gray-500 font-light">{{ p.address?.type | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Bairro</label>
                        <p class="text-gray-500 font-light">
                          {{ p.address?.neighborhood | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">CEP</label>
                        <p class="text-gray-500 font-light">
                          {{ p.address?.zipCode | formatZipCode | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Cidade</label>
                        <p class="text-gray-500 font-light">{{ p.address?.city | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Estado</label>
                        <p class="text-gray-500 font-light">{{ p.address?.state | emptyValue }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="absolute top-0 right-0 flex items-center gap-2">
                    <label class="text-xs font-semibold text-gray-900 block">Status</label>
                    <span [ngClass]="(p.active | statusBadge).className">
                      {{ (p.active | statusBadge).text }}
                    </span>
                  </div>
                </div>
              } @else {
                <!-- Formulário de Edição -->
                <form [formGroup]="editForm" (ngSubmit)="onSaveChanges()" class="space-y-6">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Informações do Paciente</h3>
                    <div class="grid grid-cols-2 gap-6">
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2"
                          >Nome Completo</label
                        >
                        <input type="text" formControlName="fullName" class="fs-input w-full" />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2">Email</label>
                        <input type="email" formControlName="email" class="fs-input w-full" />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2">CPF</label>
                        <input type="text" formControlName="documentId" class="fs-input w-full" />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2"
                          >Telefone</label
                        >
                        <input type="tel" formControlName="phone" class="fs-input w-full" />
                      </div>
                      <div class="col-span-2">
                        <label class="text-sm font-semibold text-gray-600 block mb-2"
                          >Observações</label
                        >
                        <textarea
                          formControlName="notes"
                          rows="3"
                          class="fs-textarea w-full"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="pt-6 border-t border-slate-200">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Endereço</h3>
                    <div class="grid grid-cols-4 gap-6">
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2">Rua</label>
                        <input
                          type="text"
                          formControlName="addressStreet"
                          class="fs-input w-full"
                        />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2">Número</label>
                        <input
                          type="text"
                          formControlName="addressNumber"
                          class="fs-input w-full"
                        />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2"
                          >Complemento</label
                        >
                        <input
                          type="text"
                          formControlName="addressComplement"
                          class="fs-input w-full"
                        />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2">Tipo</label>
                        <input type="text" formControlName="addressType" class="fs-input w-full" />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2">Bairro</label>
                        <input
                          type="text"
                          formControlName="addressNeighborhood"
                          class="fs-input w-full"
                        />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2">CEP</label>
                        <input
                          type="text"
                          formControlName="addressZipCode"
                          class="fs-input w-full"
                        />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2">Cidade</label>
                        <input type="text" formControlName="addressCity" class="fs-input w-full" />
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-600 block mb-2">Estado</label>
                        <input type="text" formControlName="addressState" class="fs-input w-full" />
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      (click)="isEditing.set(false)"
                      class="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      [disabled]="isSaving()"
                      class="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium disabled:opacity-50"
                    >
                      {{ isSaving() ? 'Salvando...' : 'Salvar Alterações' }}
                    </button>
                  </div>
                </form>
              }
            }

            <!-- Prontuário Tab -->
            @if (activeTab() === 'prontuario') {
              <app-medical-record-form [patientId]="p.id"></app-medical-record-form>
            }

            <!-- Evoluções Tab -->
            @if (activeTab() === 'evolucoes') {
              <app-evolutions-list [patientId]="p.id"></app-evolutions-list>
            }

            <!-- Documentos Tab -->
            @if (activeTab() === 'documentos') {
              <app-documents-list [patientId]="p.id"></app-documents-list>
            }
          </div>
        </div>
      } @else {
        <div class="bg-white rounded-lg p-6">
          <div class="h-[400px] bg-gray-200 animate-pulse rounded"></div>
        </div>
      }
    </div>
  `,
})
export class PatientDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly patientsService = inject(PatientsService);
  private readonly fb = inject(FormBuilder);

  patient = signal<PatientInfo | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  isEditing = signal(false);
  activeTab = signal<'resumo' | 'prontuario' | 'evolucoes' | 'documentos'>('resumo');

  editForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    documentId: [''],
    phone: [''],
    notes: [''],
    addressStreet: [''],
    addressNumber: [''],
    addressComplement: [''],
    addressType: [''],
    addressNeighborhood: [''],
    addressZipCode: [''],
    addressCity: [''],
    addressState: [''],
  });

  ngOnInit() {
    this.loadPatient();
  }

  private loadPatient(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isLoading.set(true);
    this.patientsService.getById(id).subscribe({
      next: (patient) => {
        const patientData = patient as unknown as PatientInfo;
        this.patient.set(patientData);
        this.populateForm(patientData);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private populateForm(patient: PatientInfo): void {
    this.editForm.patchValue({
      fullName: patient.fullName,
      email: patient.email,
      documentId: patient.documentId,
      phone: patient.phone,
      notes: patient.notes,
      addressStreet: patient.address?.street,
      addressNumber: patient.address?.number,
      addressComplement: patient.address?.complement,
      addressType: patient.address?.type,
      addressNeighborhood: patient.address?.neighborhood,
      addressZipCode: patient.address?.zipCode,
      addressCity: patient.address?.city,
      addressState: patient.address?.state,
    });
  }

  onSaveChanges(): void {
    if (!this.editForm.valid || !this.patient()) return;

    this.isSaving.set(true);

    const patientId = this.patient()!.id;
    const formValue = this.editForm.value;

    // Build address as a concatenated string or object based on API expectations
    const addressString = [
      formValue.addressStreet,
      formValue.addressNumber,
      formValue.addressComplement,
      formValue.addressNeighborhood,
      formValue.addressCity,
      formValue.addressState,
      formValue.addressZipCode,
    ]
      .filter(Boolean)
      .join(', ');

    const updateData: Record<string, unknown> = {
      fullName: formValue.fullName || undefined,
      email: formValue.email || undefined,
      documentId: formValue.documentId || undefined,
      phone: formValue.phone || undefined,
      notes: formValue.notes || undefined,
      address: addressString || undefined,
    };

    this.patientsService.update(patientId, updateData as UpdatePatientDto).subscribe({
      next: (updatedPatient) => {
        const patientData = updatedPatient as unknown as PatientInfo;
        this.patient.set(patientData);
        this.isEditing.set(false);
        this.isSaving.set(false);
      },
      error: () => {
        this.isSaving.set(false);
      },
    });
  }

  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  setActiveTab(tab: 'resumo' | 'prontuario' | 'evolucoes' | 'documentos'): void {
    this.activeTab.set(tab);
  }
}
