import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
  imports: [CommonModule, ButtonModule, ToastModule, ConfirmDialogModule],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Usuários</h1>
          <button
            pButton
            type="button"
            icon="pi pi-plus"
            label="Novo Usuário"
            severity="success"
            disabled
          ></button>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="text-center py-12 text-gray-500">
            <p class="icon pi pi-users mb-4" style="font-size: 3rem;"></p>
            <p>Gestão de usuários em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  users = signal<User[]>([]);
  isLoading = signal(false);
}
