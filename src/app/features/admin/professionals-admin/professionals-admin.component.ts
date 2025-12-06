import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-professionals-admin',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule],
  template: `
    <p-toast></p-toast>

    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Profissionais</h1>
          <button
            pButton
            type="button"
            icon="pi pi-plus"
            label="Novo Profissional"
            severity="success"
            disabled
          ></button>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="text-center py-12 text-gray-500">
            <p class="icon pi pi-briefcase mb-4" style="font-size: 3rem;"></p>
            <p>Gestão de profissionais em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalsAdminComponent {
  private readonly messageService = inject(MessageService);

  isLoading = signal(false);
}
