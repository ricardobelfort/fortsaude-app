import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-slate-50 text-slate-900">
      <!-- Sidebar -->
      <aside class="w-64 bg-[var(--fs-sidebar)] text-white flex flex-col shadow-xl">
        <div class="p-6 border-b border-[var(--fs-border)]">
          <h1 class="text-2xl font-bold">FortSaúde</h1>
          <p class="text-[var(--fs-text-muted)] text-sm">Clínica Multidisciplinar</p>
        </div>

        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          <a
            routerLink="/app/dashboard"
            routerLinkActive="sidebar-active"
            class="sidebar-link"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <span class="mr-2">🏠</span>Dashboard
          </a>

          <a routerLink="/app/patients" routerLinkActive="sidebar-active" class="sidebar-link">
            <span class="mr-2">👥</span>Pacientes
          </a>

          <a routerLink="/app/professionals" routerLinkActive="sidebar-active" class="sidebar-link">
            <span class="mr-2">💼</span>Profissionais
          </a>

          <a routerLink="/app/appointments" routerLinkActive="sidebar-active" class="sidebar-link">
            <span class="mr-2">🗓️</span>Agenda
          </a>

          <div *ngIf="canAccessAdmin()" class="border-t border-[var(--fs-border)] mt-4 pt-4">
            <a
              routerLink="/app/admin/users"
              routerLinkActive="sidebar-active"
              class="sidebar-link text-amber-300"
            >
              <span class="mr-2">🛡️</span>Admin
            </a>
          </div>
        </nav>

        <div class="p-4 border-t border-[var(--fs-border)]">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold"
            >
              {{ getUserInitial() }}
            </div>
            <div class="text-sm flex-1">
              <p class="font-medium">{{ fullName }}</p>
              <p class="text-[var(--fs-text-muted)]">{{ getRole }}</p>
            </div>
          </div>
          <button
            type="button"
            class="w-full mt-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 rounded-lg"
            (click)="logout()"
          >
            Sair
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Topbar -->
        <header
          class="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm"
        >
          <div>
            <p class="text-slate-500 text-sm">Bem-vindo</p>
            <h2 class="text-2xl font-bold text-slate-900">{{ pageTitle() }}</h2>
          </div>
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold"
            >
              {{ getUserInitial() }}
            </div>
            <button
              type="button"
              class="rounded-full w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100"
              title="Notificações"
            >
              🔔
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <main class="flex-1 overflow-y-auto p-8 bg-slate-50">
          <router-outlet></router-outlet>
        </main>
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
