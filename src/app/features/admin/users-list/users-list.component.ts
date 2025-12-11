import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/ui/icon.component';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
  createdAt: string | Date;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Usuários</h1>
          <button type="button" class="btn btn-neutral" disabled>
            <app-icon [name]="'user-plus'"></app-icon>
            Novo Usuário
          </button>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="text-center py-12 text-gray-500">
            <p class="text-5xl mb-4">👥</p>
            <p>Gestão de usuários em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  users = signal<User[]>([]);
  isLoading = signal(false);
}
