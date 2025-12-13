import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfessionalsService } from '../../../core/services/professionals.service';
import { Professional, UpdateProfessionalDto } from '../../../core/models/professional.model';
import { ProfessionalFormComponent } from '../professional-form/professional-form.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { AlertService } from '../../../shared/ui/alert.service';

@Component({
  selector: 'app-professional-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ProfessionalFormComponent, ModalComponent, IconComponent],
  template: `
    <div class="space-y-6">
      <!-- Modal de Edição -->
      @if (isEditing()) {
        <app-modal
          title="Editar Profissional"
          submitButtonText="Atualizar Profissional"
          [isLoading]="isSaving()"
          formId="professional-edit-form"
          (cancelled)="isEditing.set(false)"
        >
          <div modal-content>
            <app-professional-form
              [professional]="professional()"
              [isSubmitting]="isSaving()"
              (submitted)="onSaveChanges($event)"
              (cancelled)="isEditing.set(false)"
            ></app-professional-form>
          </div>
        </app-modal>
      }

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            @if (professional(); as p) {
              {{ p.profile.account.person.fullName }}
            } @else {
              <div class="w-[300px] h-9 bg-gray-200 animate-pulse rounded"></div>
            }
          </h1>
          <p class="text-gray-600">Detalhes do profissional</p>
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
            [routerLink]="['/app/professionals']"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <app-icon [name]="'arrow-left'"></app-icon>
            Voltar
          </a>
        </div>
      </div>

      @if (professional(); as p) {
        <!-- Information Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="grid grid-cols-2 gap-8">
            <!-- Left Column -->
            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Informações Pessoais
                </h3>
                <div class="space-y-3">
                  <div>
                    <p class="text-xs font-semibold text-gray-500">Nome</p>
                    <p class="text-gray-900">{{ p.profile.account.person.fullName }}</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold text-gray-500">Email</p>
                    <p class="text-gray-900">{{ p.profile.account.email }}</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold text-gray-500">Telefone</p>
                    <p class="text-gray-900">{{ p.profile.account.person.phone }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Informações Profissionais
                </h3>
                <div class="space-y-3">
                  <div>
                    <p class="text-xs font-semibold text-gray-500">CRM</p>
                    <p class="text-gray-900">{{ p.crm }}</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold text-gray-500">Especialidade</p>
                    <p class="text-gray-900">{{ p.specialty }}</p>
                  </div>

                  <div>
                    <p class="text-xs font-semibold text-gray-500">Status</p>
                    <p class="text-gray-900">
                      <span
                        class="px-3 py-1 rounded-full text-sm font-medium"
                        [class.bg-green-100]="p.active"
                        [class.text-green-800]="p.active"
                        [class.bg-red-100]="!p.active"
                        [class.text-red-800]="!p.active"
                      >
                        {{ p.active ? 'Ativo' : 'Inativo' }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Availability -->
          @if (p.availableFrom || p.availableTo) {
            <div class="mt-8 pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Disponibilidade
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs font-semibold text-gray-500">Disponível de</p>
                  <p class="text-gray-900">{{ p.availableFrom }}</p>
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-500">Disponível até</p>
                  <p class="text-gray-900">{{ p.availableTo }}</p>
                </div>
              </div>
            </div>
          }

          <!-- Metadata -->
          <div
            class="mt-8 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs text-gray-500"
          >
            <div>
              <p>Criado em: {{ p.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <div>
              <p>Atualizado em: {{ p.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="space-y-4">
            <div class="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
            <div class="w-3/4 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div class="w-1/2 h-4 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProfessionalDetailComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly professionalsService = inject(ProfessionalsService);
  private readonly alertService = inject(AlertService);

  professional = signal<Professional | null>(null);
  isEditing = signal(false);
  isSaving = signal(false);

  ngOnInit(): void {
    this.loadProfessional();
  }

  loadProfessional(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this.alertService.error('ID do profissional não encontrado');
      return;
    }

    this.professionalsService.getById(id).subscribe({
      next: (professional) => {
        this.professional.set(professional);
      },
      error: () => {
        this.alertService.error('Erro ao carregar profissional');
      },
    });
  }

  onSaveChanges(dto: UpdateProfessionalDto): void {
    const prof = this.professional();
    if (!prof) return;

    this.isSaving.set(true);

    this.professionalsService.update(prof.id, dto).subscribe({
      next: (updated) => {
        this.professional.set(updated);
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.alertService.success('Profissional atualizado com sucesso!');
      },
      error: () => {
        this.isSaving.set(false);
        this.alertService.error('Erro ao atualizar profissional');
      },
    });
  }
}
