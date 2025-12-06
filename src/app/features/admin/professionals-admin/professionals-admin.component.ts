import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/ui/icon.component';

@Component({
  selector: 'app-professionals-admin',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Profissionais</h1>
          <button type="button" class="fs-button-primary" disabled>
            <app-icon name="user-plus"></app-icon>
            Novo Profissional
          </button>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="text-center py-12 text-gray-500">
            <p class="text-5xl mb-4">🧑‍⚕️</p>
            <p>Gestão de profissionais em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalsAdminComponent {
  isLoading = signal(false);
}
