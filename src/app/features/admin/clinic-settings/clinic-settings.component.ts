import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '../../../shared/ui/alert.service';
import { IconComponent } from '../../../shared/ui/icon.component';

@Component({
  selector: 'app-clinic-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Configurações da Clínica</h1>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <form [formGroup]="form" (ngSubmit)="saveSettings()" class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="fs-label"> Nome da Clínica </label>
                <input
                  type="text"
                  formControlName="clinicName"
                  class="fs-input"
                  [disabled]="true"
                  placeholder="Nome da clínica"
                />
              </div>

              <div>
                <label class="fs-label"> CNPJ </label>
                <input
                  type="text"
                  formControlName="cnpj"
                  class="fs-input"
                  [disabled]="true"
                  placeholder="XX.XXX.XXX/0001-XX"
                />
              </div>

              <div>
                <label class="fs-label"> Telefone </label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="fs-input"
                  [disabled]="true"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>

              <div>
                <label class="fs-label"> Email </label>
                <input
                  type="email"
                  formControlName="email"
                  class="fs-input"
                  [disabled]="true"
                  placeholder="contato@clinica.com"
                />
              </div>

              <div class="col-span-2">
                <label class="fs-label"> Endereço </label>
                <textarea
                  formControlName="address"
                  rows="3"
                  class="fs-textarea"
                  [disabled]="true"
                  placeholder="Endereço completo da clínica"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="submit"
                class="fs-button-primary"
                [disabled]="!form.valid || isLoading()"
              >
                <app-icon [name]="\'save\'"></app-icon>
                {{ isLoading() ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClinicSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly alertService = inject(AlertService);

  isLoading = signal(false);

  form = this.fb.group({
    clinicName: ['', Validators.required],
    cnpj: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
  });

  saveSettings(): void {
    if (!this.form.valid) return;

    this.isLoading.set(true);
    // TODO: Implement save logic
    setTimeout(() => {
      this.alertService.success('Configurações salvas com sucesso');
      this.isLoading.set(false);
    }, 1000);
  }
}
