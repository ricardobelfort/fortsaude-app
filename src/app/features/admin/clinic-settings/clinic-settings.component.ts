import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-clinic-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, ToastModule],
  template: `
    <p-toast></p-toast>

    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Configurações da Clínica</h1>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <form [formGroup]="form" (ngSubmit)="saveSettings()" class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Nome da Clínica
                </label>
                <input
                  type="text"
                  formControlName="clinicName"
                  class="w-full border border-gray-300 rounded-lg p-3"
                  [disabled]="true"
                  placeholder="Nome da clínica"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"> CNPJ </label>
                <input
                  type="text"
                  formControlName="cnpj"
                  class="w-full border border-gray-300 rounded-lg p-3"
                  [disabled]="true"
                  placeholder="XX.XXX.XXX/0001-XX"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"> Telefone </label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="w-full border border-gray-300 rounded-lg p-3"
                  [disabled]="true"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2"> Email </label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full border border-gray-300 rounded-lg p-3"
                  [disabled]="true"
                  placeholder="contato@clinica.com"
                />
              </div>

              <div class="col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2"> Endereço </label>
                <textarea
                  formControlName="address"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg p-3"
                  [disabled]="true"
                  placeholder="Endereço completo da clínica"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                pButton
                type="submit"
                label="Salvar"
                [loading]="isLoading()"
                [disabled]="!form.valid || isLoading()"
              ></button>
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
  private readonly messageService = inject(MessageService);

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
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Configurações salvas com sucesso',
      });
      this.isLoading.set(false);
    }, 1000);
  }
}
