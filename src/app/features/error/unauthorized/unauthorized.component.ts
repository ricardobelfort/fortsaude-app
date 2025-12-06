import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4"
    >
      <div class="w-full max-w-md shadow-2xl text-center bg-white rounded-2xl overflow-hidden">
        <div class="bg-gradient-to-r from-red-600 to-orange-600 p-8">
          <h1 class="text-6xl font-bold text-white">403</h1>
        </div>

        <div class="p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p class="text-gray-600 mb-6">Você não tem permissão para acessar este recurso.</p>

          <a
            routerLink="/app/dashboard"
            class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {}
