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
import { CurrentUserService } from '../../../core/services/current-user.service';
import { ProfilesService, ProfileResponse } from '../../../core/services/profiles.service';
import {
  Professional,
  CreateProfessionalDto,
  UpdateProfessionalDto,
} from '../../../core/models/professional.model';

@Component({
  selector: 'app-professional-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" id="professional-edit-form" (ngSubmit)="onSubmit()" class="space-y-6">
      <div class="space-y-4">
        <!-- Profile Selection -->
        <div>
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text font-semibold">
                Perfil do Profissional <span class="text-error">*</span>
              </span>
            </div>
            <select
              formControlName="profile"
              [class.select-error]="form.get('profile')?.invalid && form.get('profile')?.touched"
              class="select select-bordered w-full placeholder-gray-400"
              [disabled]="isLoadingProfiles()"
            >
              <option value="">
                @if (isLoadingProfiles()) {
                  Carregando perfis...
                } @else {
                  Selecionar perfil
                }
              </option>
              @for (profile of profiles(); track profile.id) {
                <option [value]="profile.id">
                  {{ profile.account.person.fullName }} ({{ profile.role }})
                </option>
              }
            </select>
            @if (form.get('profile')?.invalid && form.get('profile')?.touched) {}
          </label>
        </div>

        <!-- CRM / Registration Code -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text font-semibold">
                  CRM <span class="text-error">*</span>
                </span>
              </div>
              <input
                type="text"
                formControlName="crm"
                placeholder="Ex: 123456/SP"
                [class.input-error]="form.get('crm')?.invalid && form.get('crm')?.touched"
                class="input input-bordered w-full placeholder-gray-400"
              />
              @if (form.get('crm')?.invalid && form.get('crm')?.touched) {
                <div class="label">
                  <span class="label-text-alt text-error">Este campo é obrigatório</span>
                </div>
              }
            </label>
          </div>

          <!-- Specialty -->
          <div>
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text font-semibold">
                  Especialidade <span class="text-error">*</span>
                </span>
              </div>
              <select
                formControlName="specialty"
                [class.select-error]="
                  form.get('specialty')?.invalid && form.get('specialty')?.touched
                "
                class="select select-bordered w-full placeholder-gray-400"
              >
                <option value="">Selecionar especialidade</option>
                <option value="CARDIOLOGY">Cardiologia</option>
                <option value="DERMATOLOGY">Dermatologia</option>
                <option value="PHONOAUDIOLOGY">Fonoaudioligia</option>
                <option value="PEDIATRICS">Pediatria</option>
                <option value="NEUROLOGY">Neurologia</option>
                <option value="ORTHOPEDICS">Ortopedia</option>
                <option value="PSYCHIATRY">Psiquiatria</option>
                <option value="GYNECOLOGY">Ginecologia</option>
                <option value="GENERAL_PRACTICE">Clínica Geral</option>
              </select>
              @if (form.get('specialty')?.invalid && form.get('specialty')?.touched) {
                <div class="label">
                  <span class="label-text-alt text-error">Este campo é obrigatório</span>
                </div>
              }
            </label>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="form-control w-full">
            <div class="label">
              <span class="label-text font-semibold">
                Email <span class="text-error">*</span>
              </span>
            </div>
            <input
              type="email"
              formControlName="email"
              placeholder="email@example.com"
              [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched"
              class="input input-bordered w-full placeholder-gray-400"
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
              <span class="label-text font-semibold">
                Telefone <span class="text-error">*</span>
              </span>
            </div>
            <input
              type="text"
              formControlName="phone"
              placeholder="(XX) XXXXX-XXXX"
              (input)="onPhoneInput($event)"
              [class.input-error]="form.get('phone')?.invalid && form.get('phone')?.touched"
              class="input input-bordered w-full placeholder-gray-400"
            />
            @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
              <div class="label">
                <span class="label-text-alt text-error">Este campo é obrigatório</span>
              </div>
            }
          </label>
        </div>

        <!-- Available Hours -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text font-semibold">Disponível de</span>
              </div>
              <input
                type="time"
                formControlName="availableFrom"
                class="input input-bordered w-full placeholder-gray-400"
              />
            </label>
          </div>

          <div>
            <label class="form-control w-full">
              <div class="label">
                <span class="label-text font-semibold">Disponível até</span>
              </div>
              <input
                type="time"
                formControlName="availableTo"
                class="input input-bordered w-full placeholder-gray-400"
              />
            </label>
          </div>
        </div>

        <!-- Active Status -->
        <div>
          <label class="form-control w-full">
            <div class="label cursor-pointer">
              <span class="label-text font-semibold">Ativo</span>
              <input type="checkbox" formControlName="active" class="checkbox checkbox-primary" />
            </div>
          </label>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          class="btn btn-outline"
          (click)="cancelled.emit()"
          [disabled]="isSubmitting()"
        >
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" [disabled]="!form.valid || isSubmitting()">
          @if (isSubmitting()) {
            <span class="loading loading-spinner loading-sm"></span>
            Salvando...
          } @else {
            {{ professional() ? 'Atualizar Profissional' : 'Criar Profissional' }}
          }
        </button>
      </div>
    </form>
  `,
})
export class ProfessionalFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly profilesService = inject(ProfilesService);

  professional = input<Professional | null>(null);
  isSubmitting = input(false);
  submitted = output<CreateProfessionalDto | UpdateProfessionalDto>();
  cancelled = output<void>();

  profiles = signal<ProfileResponse[]>([]);
  isLoadingProfiles = signal(false);

  form = this.fb.group({
    profile: ['', [Validators.required]],
    crm: ['', [Validators.required]],
    specialty: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    availableFrom: [''],
    availableTo: [''],
    active: [true],
  });

  constructor() {
    this.loadProfiles();

    effect(() => {
      const prof = this.professional();
      if (prof) {
        this.form.patchValue({
          profile: prof.profile.id,
          crm: prof.crm,
          specialty: prof.specialty,
          email: prof.profile.account.email,
          phone: prof.profile.account.person.phone,
          availableFrom: prof.availableFrom,
          availableTo: prof.availableTo,
          active: prof.active,
        });
      }
    });
  }

  loadProfiles(): void {
    this.isLoadingProfiles.set(true);
    this.profilesService.getAll().subscribe({
      next: (profiles) => {
        this.profiles.set(profiles);
        this.isLoadingProfiles.set(false);
      },
      error: () => {
        this.isLoadingProfiles.set(false);
      },
    });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    if (value.length > 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }

    this.form.patchValue({ phone: value }, { emitEvent: false });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const formValue = this.form.value;
    const clinicId = this.currentUserService.getClinicId();
    const profileId = formValue.profile;

    if (!clinicId || !profileId) {
      console.error('Clinic ID or Profile ID not found');
      return;
    }

    const editing = this.professional();

    if (editing) {
      // Update
      const dto: UpdateProfessionalDto = {
        crm: formValue.crm || undefined,
        specialty: formValue.specialty || undefined,
        availableFrom: formValue.availableFrom || undefined,
        availableTo: formValue.availableTo || undefined,
      };
      this.submitted.emit(dto);
    } else {
      // Create
      const dto: CreateProfessionalDto = {
        profileId: profileId,
        clinicId: clinicId,
        crm: formValue.crm || '',
        specialty: formValue.specialty || '',
        availableFrom: formValue.availableFrom || undefined,
        availableTo: formValue.availableTo || undefined,
      };
      this.submitted.emit(dto);
    }
  }
}
