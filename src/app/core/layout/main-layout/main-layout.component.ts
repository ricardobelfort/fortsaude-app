import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    BreadcrumbModule,
  ],
  template: `
    <div class="flex h-screen">
      <!-- Sidebar -->
      <div class="w-64 bg-gray-900 text-white flex flex-col">
        <div class="p-6 border-b border-gray-800">
          <h1 class="text-2xl font-bold">FortSaúde</h1>
          <p class="text-gray-400 text-sm">Clínica Multidisciplinar</p>
        </div>

        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <a
            routerLink="/app/dashboard"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            <i class="pi pi-home mr-2"></i>Dashboard
          </a>

          <a
            routerLink="/app/patients"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            <i class="pi pi-users mr-2"></i>Pacientes
          </a>

          <a
            routerLink="/app/professionals"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            <i class="pi pi-briefcase mr-2"></i>Profissionais
          </a>

          <a
            routerLink="/app/appointments"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            <i class="pi pi-calendar mr-2"></i>Agenda
          </a>

          <div *ngIf="canAccessAdmin()" class="border-t border-gray-800 mt-4 pt-4">
            <a
              routerLink="/app/admin/users"
              class="block px-4 py-2 rounded hover:bg-gray-800 transition text-yellow-400"
            >
              <i class="pi pi-shield mr-2"></i>Admin
            </a>
          </div>
        </nav>

        <div class="p-4 border-t border-gray-800">
          <div class="flex items-center gap-3">
            <p-avatar [label]="getUserInitial()" shape="circle"></p-avatar>
            <div class="text-sm flex-1">
              <p class="font-medium">{{ fullName }}</p>
              <p class="text-gray-400">{{ getRole }}</p>
            </div>
          </div>
          <p-button
            label="Sair"
            icon="pi pi-sign-out"
            class="w-full mt-3"
            severity="secondary"
            size="small"
            (onClick)="logout()"
          ></p-button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Topbar -->
        <div class="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <p class="text-gray-600 text-sm">Bem-vindo</p>
            <h2 class="text-2xl font-bold text-gray-800">{{ pageTitle() }}</h2>
          </div>
          <div class="flex items-center gap-4">
            <p-avatar
              icon="pi pi-user"
              shape="circle"
              styleClass="bg-blue-500 text-white"
            ></p-avatar>
            <p-button icon="pi pi-bell" [rounded]="true" [text]="true"></p-button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-8 bg-gray-50">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  fullName = this.currentUserService.getFullName();
  pageTitle = signal('Dashboard');

  canAccessAdmin(): boolean {
    return this.currentUserService.hasRole(UserRole.CLINIC_ADMIN);
  }

  get getRole(): string {
    const role = this.currentUserService.getRole();
    return this.getRoleLabel(role || '');
  }

  getUserInitial(): string {
    return this.fullName.charAt(0).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      CLINIC_ADMIN: 'Administrador',
      PROFESSIONAL: 'Profissional',
      RECEPTIONIST: 'Recepcionista',
      FINANCE: 'Financeiro',
      ASSISTANT: 'Assistente',
    };
    return labels[role] || role;
  }
}
