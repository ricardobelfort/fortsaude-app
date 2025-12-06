import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, ButtonModule, CardModule],
  template: `
    <div
      class="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4"
    >
      <p-card class="w-full max-w-md shadow-2xl text-center">
        <ng-template pTemplate="header">
          <div class="bg-gradient-to-r from-red-600 to-orange-600 p-8">
            <h1 class="text-6xl font-bold text-white">403</h1>
          </div>
        </ng-template>

        <h2 class="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
        <p class="text-gray-600 mb-6">Você não tem permissão para acessar este recurso.</p>

        <p-button label="Voltar ao Dashboard" routerLink="/app/dashboard" class="w-full"></p-button>
      </p-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {}
