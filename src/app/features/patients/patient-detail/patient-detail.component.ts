import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PatientsService } from '../../../core/services';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { MedicalRecordFormComponent } from './medical-record-form/medical-record-form.component';
import { EvolutionsListComponent } from './evolutions-list/evolutions-list.component';
import { DocumentsListComponent } from './documents-list/documents-list.component';
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
        <!-- Card com abas - Layout flexível com footer fixo -->
        <div
          class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]"
        >
          <!-- Abas no topo -->
          <div class="border-b border-slate-200 flex bg-white flex-shrink-0">
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
          <div class="p-6 overflow-y-auto flex-1">
            <!-- Resumo Tab -->
            @if (activeTab() === 'resumo') {
              @if (!isEditing()) {
                <!-- Visualização -->
                <div class="space-y-6">
                  <!-- Dados Pessoais -->
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Dados Pessoais</h3>
                    <div class="grid grid-cols-2 gap-6">
                      <div>
                        <label class="text-sm font-bold text-gray-900 block mb-1"
                          >Nome Completo</label
                        >
                        <p class="text-gray-500 font-light">{{ p.fullName }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Status</label>
                        <p [ngClass]="(p.active | statusBadge).className">
                          {{ (p.active | statusBadge).text }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">CPF</label>
                        <p class="text-gray-500 font-light">
                          {{ p.documentId | formatCpf | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">RG</label>
                        <p class="text-gray-500 font-light">{{ p.rg | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Data de Nascimento</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ p.dateOfBirth | date: 'dd/MM/yyyy' | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Gênero</label>
                        <p class="text-gray-500 font-light">{{ p.gender | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Tipo Sanguíneo</label
                        >
                        <p class="text-gray-500 font-light">{{ p.bloodType | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Email</label>
                        <p class="text-gray-500 font-light">{{ p.email | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Telefone</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ p.phone | formatPhone | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Telefone de Emergência</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ p.emergencyPhone | formatPhone | emptyValue }}
                        </p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Responsável 1 (Nome)</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ p.emergencyContactName | emptyValue }}
                        </p>
                      </div>
                      <div class="col-span-2">
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Grau de Parentesco</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ p.emergencyContactDegree | emptyValue }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Informações de Saúde -->
                  <div class="pt-6 border-t border-slate-200">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Informações de Saúde</h3>
                    <div class="grid grid-cols-2 gap-6">
                      <div class="col-span-2">
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Nome do Médico</label
                        >
                        <p class="text-gray-500 font-light">{{ p.medicalDoctor | emptyValue }}</p>
                      </div>
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Faz tratamento de saúde?</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ (p.healthTreatment ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.healthTreatment) {
                        <div>
                          <label class="text-sm font-semibold text-gray-900 block mb-1"
                            >Qual tratamento?</label
                          >
                          <p class="text-gray-500 font-light">
                            {{ p.healthTreatmentDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Usa medicações?</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ (p.medications ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.medications) {
                        <div>
                          <label class="text-sm font-semibold text-gray-900 block mb-1"
                            >Qual medicação?</label
                          >
                          <p class="text-gray-500 font-light">
                            {{ p.medicationsDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Possui Plano de Saúde?</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ (p.healthPlan ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.healthPlan) {
                        <div>
                          <label class="text-sm font-semibold text-gray-900 block mb-1"
                            >Qual plano?</label
                          >
                          <p class="text-gray-500 font-light">
                            {{ p.healthPlanDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Faz acompanhamento Odontológico?</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ (p.dentalTreatment ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.dentalTreatment) {
                        <div>
                          <label class="text-sm font-semibold text-gray-900 block mb-1"
                            >Qual acompanhamento?</label
                          >
                          <p class="text-gray-500 font-light">
                            {{ p.dentalTreatmentDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div>
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Necessita de atendimento especial?</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ (p.specialCareNeeded ? 'Sim' : 'Não') | emptyValue }}
                        </p>
                      </div>
                      @if (p.specialCareNeeded) {
                        <div class="col-span-2">
                          <label class="text-sm font-semibold text-gray-900 block mb-1"
                            >Em caso afirmativo, qual?</label
                          >
                          <p class="text-gray-500 font-light">
                            {{ p.specialCareDetails | emptyValue }}
                          </p>
                        </div>
                      }
                      <div class="col-span-2">
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Será atendido pelas especialidades</label
                        >
                        <p class="text-gray-500 font-light">{{ p.specialties | emptyValue }}</p>
                      </div>
                      <div class="col-span-2">
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Preferência de horário de atendimento</label
                        >
                        <p class="text-gray-500 font-light">
                          {{ p.preferredSchedule | emptyValue }}
                        </p>
                      </div>
                      <div class="col-span-2">
                        <label class="text-sm font-semibold text-gray-900 block mb-1"
                          >Qual Convênio</label
                        >
                        <p class="text-gray-500 font-light">{{ p.agreement | emptyValue }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Endereço -->
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
                        <label class="text-sm font-semibold text-gray-900 block mb-1">Tipo</label>
                        <p class="text-gray-500 font-light">{{ p.address?.type | emptyValue }}</p>
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

                  <!-- Observações -->
                  <div class="pt-6 border-t border-slate-200">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Observações</h3>
                    <p class="text-gray-500 font-light">{{ p.notes | emptyValue }}</p>
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
  activeTab = signal<'resumo' | 'prontuario' | 'evolucoes' | 'documentos'>('resumo');

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

  setActiveTab(tab: 'resumo' | 'prontuario' | 'evolucoes' | 'documentos'): void {
    this.activeTab.set(tab);
  }
}
