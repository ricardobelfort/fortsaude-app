import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { PatientInfo } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
            class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
          >
            Editar
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
              <div class="flex items-center gap-2">
                <app-icon [name]="'user'" [size]="18"></app-icon>
                Resumo
              </div>
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
              <div class="flex items-center gap-2">
                <app-icon [name]="'file-text'" [size]="18"></app-icon>
                Prontuário
              </div>
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
              <div class="flex items-center gap-2">
                <app-icon [name]="'waterfall-up'" [size]="18"></app-icon>
                Evoluções
              </div>
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
              <div class="flex items-center gap-2">
                <app-icon [name]="'document-attachment'" [size]="18"></app-icon>
                Documentos
              </div>
            </button>
          </div>

          <!-- Conteúdo das abas -->
          <div class="p-6">
            <!-- Resumo Tab -->
            @if (activeTab() === 'resumo') {
              <div class="space-y-6 relative">
                <div>
                  <h3 class="text-lg font-bold text-gray-900 mb-4">Informações do Paciente</h3>
                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1"
                        >Nome Completo
                      </label>
                      <p class="text-gray-900">{{ p.fullName }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">Email</label>
                      <p class="text-gray-900">{{ p.email | emptyValue }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">CPF</label>
                      <p class="text-gray-900">{{ p.documentId | formatCpf | emptyValue }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">Telefone</label>
                      <p class="text-gray-900">{{ p.phone | formatPhone | emptyValue }}</p>
                    </div>
                    <div class="col-span-2">
                      <label class="text-sm font-semibold text-gray-600 block mb-1"
                        >Observações</label
                      >
                      <p class="text-gray-900">{{ p.notes | emptyValue }}</p>
                    </div>
                  </div>
                </div>
                <div class="pt-6 border-t border-slate-200">
                  <h3 class="text-lg font-bold text-gray-900 mb-4">Endereço</h3>
                  <div class="grid grid-cols-4 gap-6">
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">Rua</label>
                      <p class="text-gray-900">{{ p.address?.street | emptyValue }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">Número</label>
                      <p class="text-gray-900">{{ p.address?.number | emptyValue }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1"
                        >Complemento</label
                      >
                      <p class="text-gray-900">{{ p.address?.complement | emptyValue }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">Tipo</label>
                      <p class="text-gray-900">{{ p.address?.type | emptyValue }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">Bairro</label>
                      <p class="text-gray-900">{{ p.address?.neighborhood | emptyValue }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">CEP</label>
                      <p class="text-gray-900">
                        {{ p.address?.zipCode | formatZipCode | emptyValue }}
                      </p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">Cidade</label>
                      <p class="text-gray-900">{{ p.address?.city | emptyValue }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-semibold text-gray-600 block mb-1">Estado</label>
                      <p class="text-gray-900">{{ p.address?.state | emptyValue }}</p>
                    </div>
                  </div>
                </div>
                <div class="absolute top-0 right-0 flex items-center gap-2">
                  <label class="text-xs font-semibold text-gray-600 block">Status</label>
                  <span [ngClass]="(p.active | statusBadge).className">
                    {{ (p.active | statusBadge).text }}
                  </span>
                </div>
              </div>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly patientsService = inject(PatientsService);

  patient = signal<PatientInfo | null>(null);
  isLoading = signal(false);
  activeTab = signal<'resumo' | 'prontuario' | 'evolucoes' | 'documentos'>('resumo');

  // Example of accessing user data from UserStateService
  // You can use these signals to get current user info:
  // this.userStateService.userName()
  // this.userStateService.userEmail()
  // this.userStateService.userId()
  // this.userStateService.userRole()

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
