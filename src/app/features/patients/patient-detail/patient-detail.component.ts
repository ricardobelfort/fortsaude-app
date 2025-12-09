import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PatientsService } from '../../../core/services';
import { MedicalRecordFormComponent } from './medical-record-form/medical-record-form.component';
import { EvolutionsListComponent } from './evolutions-list/evolutions-list.component';
import { DocumentsListComponent } from './documents-list/documents-list.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { EmptyValuePipe } from '../../../shared/pipes/empty-value.pipe';
import { FormatCpfPipe } from '../../../shared/pipes/format-cpf.pipe';

interface PatientInfo {
  id: string;
  fullName: string;
  document: string;
  dateOfBirth: string;
  email: string;
  phone?: string;
  address?: string;
  observations?: string;
  createdAt: string | Date;
}

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
    FormatCpfPipe,
  ],
  template: `
    <div class="p-6 bg-white rounded-2xl shadow-sm">
      <div class="max-w mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              @if (patient(); as p) {
                {{ p.fullName }}
              } @else {
                <div class="w-[300px] h-9 bg-gray-200 animate-pulse rounded"></div>
              }
            </h1>
            @if (patient(); as p) {
              <p class="text-gray-600 mt-2">
                CPF: {{ p.document | formatCpf | emptyValue }} | Idade:
                {{ calculateAge(p.dateOfBirth) }} anos
              </p>
            }
          </div>
          <a
            [routerLink]="['/app/patients']"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <app-icon [name]="'arrow-left'"></app-icon>
            Voltar
          </a>
        </div>

        <!-- Tabs Navigation -->
        @if (patient(); as p) {
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <!-- Tab Buttons -->
            <div class="border-b border-gray-200 flex">
              <button
                type="button"
                class="flex-1 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer hover:bg-slate-50 transition-colors"
                [class.border-b-indigo-600]="activeTab() === 'resumo'"
                [class.border-b-transparent]="activeTab() !== 'resumo'"
                (click)="setActiveTab('resumo')"
              >
                Resumo
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer hover:bg-slate-50 transition-colors"
                [class.border-b-indigo-600]="activeTab() === 'prontuario'"
                [class.border-b-transparent]="activeTab() !== 'prontuario'"
                (click)="setActiveTab('prontuario')"
              >
                Prontuário
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer hover:bg-slate-50 transition-colors"
                [class.border-b-indigo-600]="activeTab() === 'evolucoes'"
                [class.border-b-transparent]="activeTab() !== 'evolucoes'"
                (click)="setActiveTab('evolucoes')"
              >
                Evoluções
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-3 text-sm font-semibold border-b-2 cursor-pointer hover:bg-slate-50 transition-colors"
                [class.border-b-indigo-600]="activeTab() === 'documentos'"
                [class.border-b-transparent]="activeTab() !== 'documentos'"
                (click)="setActiveTab('documentos')"
              >
                Documentos
              </button>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
              <!-- Resumo Tab -->
              @if (activeTab() === 'resumo') {
                <div class="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-900 mb-1">Email</label>
                    <p class="text-gray-600">{{ p.email | emptyValue }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-900 mb-1">Telefone</label>
                    <p class="text-gray-600">{{ p.phone | emptyValue }}</p>
                  </div>
                  <div class="col-span-2">
                    <label class="block text-sm font-bold text-gray-900 mb-1">Endereço</label>
                    <p class="text-gray-600">{{ p.address | emptyValue }}</p>
                  </div>
                  <div class="col-span-2">
                    <label class="block text-sm font-bold text-gray-900 mb-1">Observações</label>
                    <p class="text-gray-600">{{ p.observations | emptyValue }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-bold text-gray-900 mb-1"
                      >Data de Cadastro</label
                    >
                    <p class="text-gray-600">{{ p.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
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
