import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PatientsService } from '../../../core/services';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { MedicalRecordFormComponent } from './medical-record-form/medical-record-form.component';
import { EvolutionsListComponent } from './evolutions-list/evolutions-list.component';
import { DocumentsListComponent } from './documents-list/documents-list.component';
import { PrescriptionsListComponent } from './prescriptions-list/prescriptions-list.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
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
    PatientFormComponent,
    MedicalRecordFormComponent,
    EvolutionsListComponent,
    DocumentsListComponent,
    PrescriptionsListComponent,
    ModalComponent,
    IconComponent,
    EmptyValuePipe,
    StatusBadgePipe,
    FormatCpfPipe,
    FormatPhonePipe,
    FormatZipCodePipe,
  ],
  template: `
    <div class="space-y-6">
      <!-- Modal de Edição - Overlay -->
      @if (isEditing()) {
        <app-modal
          title="Editar Paciente"
          submitButtonText="Atualizar Paciente"
          [isLoading]="isSaving()"
          formId="patient-edit-form"
          (cancelled)="isEditing.set(false)"
        >
          <div modal-content>
            <app-patient-form
              [patient]="patient()"
              [isSubmitting]="isSaving()"
              (submitted)="onSaveChanges($event)"
              (cancelled)="isEditing.set(false)"
            ></app-patient-form>
          </div>
        </app-modal>
      }

      <!-- Header com título e botões -->
      <div class="flex flex-col gap-1">
        <div class="flex items-end justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h1
              class="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words"
            >
              @if (patient(); as p) {
                {{ p.fullName }}
              } @else {
                <div class="w-[300px] h-7 bg-gray-200 animate-pulse rounded"></div>
              }
            </h1>
            <p class="text-md text-gray-600 line-clamp-1">Detalhes e histórico do paciente</p>
          </div>
          <div class="flex gap-1 flex-shrink-0">
            <button
              type="button"
              (click)="isEditing.set(!isEditing())"
              title="{{ isEditing() ? 'Cancelar' : 'Editar' }}"
              class="btn btn-md"
            >
              <app-icon [name]="'edit'" [size]="16"></app-icon>
              <span class="hidden sm:inline">Editar</span>
            </button>
            <a [routerLink]="['/app/patients']" title="Voltar" class="btn btn-md">
              <app-icon [name]="'arrow-left'" [size]="20"></app-icon>
              <span class="hidden sm:inline">Voltar</span>
            </a>
          </div>
        </div>
      </div>

      @if (patient(); as p) {
        <!-- Card com abas -->
        <div class="card bg-white shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]">
          <!-- Abas no topo -->
          <div class="tabs tabs-bordered tabs-sm sm:tabs-md w-full border-base-300">
            <button
              type="button"
              [class.tab-active]="activeTab() === 'resumo'"
              [class]="
                activeTab() === 'resumo'
                  ? 'text-primary border-primary bg-primary/10'
                  : 'text-base-content/60 hover:bg-base-content/5 hover:text-base-content/80'
              "
              class="tab flex items-center gap-1.5 flex-1 justify-center transition-all duration-200"
              (click)="setActiveTab('resumo')"
              title="Resumo"
            >
              <app-icon [name]="'resume'" [size]="20"></app-icon>
              <span class="hidden sm:inline">Resumo</span>
            </button>
            <button
              type="button"
              [class.tab-active]="activeTab() === 'prontuario'"
              [class]="
                activeTab() === 'prontuario'
                  ? 'text-primary border-primary bg-primary/10'
                  : 'text-base-content/60 hover:bg-base-content/5 hover:text-base-content/80'
              "
              class="tab flex items-center gap-1.5 flex-1 justify-center transition-all duration-200"
              (click)="setActiveTab('prontuario')"
              title="Prontuário"
            >
              <app-icon [name]="'file-text'" [size]="20"></app-icon>
              <span class="hidden sm:inline">Prontuário</span>
            </button>
            <button
              type="button"
              [class.tab-active]="activeTab() === 'evolucoes'"
              [class]="
                activeTab() === 'evolucoes'
                  ? 'text-primary border-primary bg-primary/10'
                  : 'text-base-content/60 hover:bg-base-content/5 hover:text-base-content/80'
              "
              class="tab flex items-center gap-1.5 flex-1 justify-center transition-all duration-200"
              (click)="setActiveTab('evolucoes')"
              title="Evoluções"
            >
              <app-icon [name]="'trending'" [size]="20"></app-icon>
              <span class="hidden sm:inline">Evoluções</span>
            </button>
            <button
              type="button"
              [class.tab-active]="activeTab() === 'documentos'"
              [class]="
                activeTab() === 'documentos'
                  ? 'text-primary border-primary bg-primary/10'
                  : 'text-base-content/60 hover:bg-base-content/5 hover:text-base-content/80'
              "
              class="tab flex items-center gap-1.5 flex-1 justify-center transition-all duration-200"
              (click)="setActiveTab('documentos')"
              title="Documentos"
            >
              <app-icon [name]="'documents'" [size]="20"></app-icon>
              <span class="hidden sm:inline">Documentos</span>
            </button>
            <button
              type="button"
              [class.tab-active]="activeTab() === 'prescricoes'"
              [class]="
                activeTab() === 'prescricoes'
                  ? 'text-primary border-primary bg-primary/10'
                  : 'text-base-content/60 hover:bg-base-content/5 hover:text-base-content/80'
              "
              class="tab flex items-center gap-1.5 flex-1 justify-center transition-all duration-200"
              (click)="setActiveTab('prescricoes')"
              title="Prescrições"
            >
              <app-icon [name]="'prescriptions'" [size]="20"></app-icon>
              <span class="hidden sm:inline">Prescrições</span>
            </button>
          </div>

          <!-- Conteúdo das abas -->
          <div class="card-body p-2 sm:p-3 md:p-4 lg:p-6 overflow-y-auto flex-1">
            @if (activeTab() === 'resumo') {
              @if (!isEditing()) {
                <!-- Visualização -->
                <div class="space-y-3 sm:space-y-4 md:space-y-6">
                  <!-- Dados Pessoais -->
                  <div>
                    <h3
                      class="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4"
                    >
                      Dados Pessoais
                    </h3>
                    <div
                      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
                    >
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Nome Completo</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.fullName }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Status</label
                        >
                        <p [ngClass]="(p.active | statusBadge).className">
                          {{ (p.active | statusBadge).text }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >CPF</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.documentId | formatCpf | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >RG</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.rg | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Data de Nascimento</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.dateOfBirth | date: 'dd/MM/yyyy' | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Gênero</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.gender | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Tipo Sanguíneo</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.bloodType | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Email</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.email | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Telefone</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.phone | formatPhone | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Telefone de Emergência</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.emergencyPhone | formatPhone | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Responsável 1 (Nome)</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.emergencyContactName | emptyValue }}
                        </p>
                      </div>
                      <div class="sm:col-span-2">
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Grau de Parentesco</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.emergencyContactDegree | emptyValue }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="pt-3 sm:pt-4 md:pt-6 border-t border-slate-200">
                    <h3
                      class="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4"
                    >
                      Informações de Saúde
                    </h3>
                    <div
                      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
                    >
                      <div class="sm:col-span-2">
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Nome do Médico</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.medicalDoctor | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Faz tratamento de saúde?</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ (p.healthTreatment ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.healthTreatment) {
                        <div>
                          <label
                            class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                            >Qual tratamento?</label
                          >
                          <p class="text-xs sm:text-sm text-base-content font-semibold">
                            {{ p.healthTreatmentDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Usa medicações?</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ (p.medications ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.medications) {
                        <div>
                          <label
                            class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                            >Qual medicação?</label
                          >
                          <p class="text-xs sm:text-sm text-base-content font-semibold">
                            {{ p.medicationsDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Possui Plano de Saúde?</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ (p.healthPlan ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.healthPlan) {
                        <div>
                          <label
                            class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                            >Qual plano?</label
                          >
                          <p class="text-xs sm:text-sm text-base-content font-semibold">
                            {{ p.healthPlanDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Faz acompanhamento Odontológico?</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ (p.dentalTreatment ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.dentalTreatment) {
                        <div>
                          <label
                            class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                            >Qual acompanhamento?</label
                          >
                          <p class="text-xs sm:text-sm text-base-content font-semibold">
                            {{ p.dentalTreatmentDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Necessita de atendimento especial?</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ (p.specialCareNeeded ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.specialCareNeeded) {
                        <div class="sm:col-span-2">
                          <label
                            class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                            >Em caso afirmativo, qual?</label
                          >
                          <p class="text-xs sm:text-sm text-base-content font-semibold">
                            {{ p.specialCareDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div class="sm:col-span-2">
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Será atendido pelas especialidades</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.specialties | emptyValue }}
                        </p>
                      </div>
                      <div class="sm:col-span-2">
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Preferência de horário de atendimento</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.preferredSchedule | emptyValue }}
                        </p>
                      </div>
                      <div class="sm:col-span-2">
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Qual Convênio</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.agreement | emptyValue }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Endereço -->
                  <div class="pt-3 sm:pt-4 md:pt-6 border-t border-slate-200">
                    <h3
                      class="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4"
                    >
                      Endereço
                    </h3>
                    <div
                      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
                    >
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Rua</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.address?.street | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Número</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.address?.number | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Tipo</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.address?.type | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Complemento</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.address?.complement | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Bairro</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.address?.neighborhood | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >CEP</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.address?.zipCode | formatZipCode | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Cidade</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.address?.city | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label
                          class="text-xs sm:text-sm font-semibold text-base-content/60 block mb-0.5 sm:mb-1"
                          >Estado</label
                        >
                        <p class="text-xs sm:text-sm text-base-content font-semibold">
                          {{ p.address?.state | emptyValue }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Observações -->
                  <div class="pt-3 sm:pt-4 md:pt-6 border-t border-slate-200">
                    <h3
                      class="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4"
                    >
                      Observações
                    </h3>
                    <p class="text-xs sm:text-sm text-base-content font-semibold">
                      {{ p.notes | emptyValue }}
                    </p>
                  </div>
                </div>
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

            <!-- Prescrições Tab -->
            @if (activeTab() === 'prescricoes') {
              <app-prescriptions-list [patientId]="p.id"></app-prescriptions-list>
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

  patient = signal<PatientInfo | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  isEditing = signal(false);
  activeTab = signal<'resumo' | 'prontuario' | 'evolucoes' | 'documentos' | 'prescricoes'>(
    'resumo'
  );

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
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSaveChanges(updateData: UpdatePatientDto): void {
    if (!this.patient()) return;

    this.isSaving.set(true);
    const patientId = this.patient()!.id;

    this.patientsService.update(patientId, updateData).subscribe({
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

  setActiveTab(tab: 'resumo' | 'prontuario' | 'evolucoes' | 'documentos' | 'prescricoes'): void {
    this.activeTab.set(tab);
  }
}
