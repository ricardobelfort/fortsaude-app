import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.model';
import { IconComponent } from '../../../shared/ui/icon.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="min-h-screen bg-[#f5f6fb] text-slate-900 flex">
      <!-- Sidebar -->
      <aside class="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div class="h-14 px-4 flex items-center gap-3 border-b border-slate-200">
          <div
            class="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-semibold tracking-wide"
          >
            FS
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.12em] text-slate-400">Clínica</p>
            <p class="text-sm font-semibold text-slate-900">FortSaúde</p>
          </div>
        </div>

        <nav class="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          <div class="space-y-1.5">
            <p class="text-[11px] font-semibold tracking-[0.14em] text-slate-400 px-2">PRINCIPAL</p>
            <a
              routerLink="/app/dashboard"
              class="nav-link"
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{ exact: true }"
            >
              <app-icon name="layout" className="shrink-0 text-base"></app-icon>
              <span>Dashboard</span>
            </a>
            <a routerLink="/app/appointments" class="nav-link" routerLinkActive="nav-active">
              <app-icon name="calendar" className="shrink-0 text-base"></app-icon>
              <span>Agenda</span>
            </a>
            <a routerLink="/app/patients" class="nav-link" routerLinkActive="nav-active">
              <app-icon name="users" className="shrink-0 text-base"></app-icon>
              <span>Pacientes</span>
            </a>
            <a routerLink="/app/professionals" class="nav-link" routerLinkActive="nav-active">
              <app-icon name="user-check" className="shrink-0 text-base"></app-icon>
              <span>Profissionais</span>
            </a>
          </div>

          <div class="space-y-1.5">
            <p class="text-[11px] font-semibold tracking-[0.14em] text-slate-400 px-2">ADMIN & OUTROS</p>
            <div class="nav-link nav-disabled">
              <app-icon name="grid" className="shrink-0 text-base"></app-icon>
              <span>Departamentos</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-link nav-disabled">
              <app-icon name="credit-card" className="shrink-0 text-base"></app-icon>
              <span>Financeiro</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-link nav-disabled">
              <app-icon name="list" className="shrink-0 text-base"></app-icon>
              <span>Serviços</span>
              <span class="badge">Em breve</span>
            </div>
            <div class="nav-link nav-disabled">
              <app-icon name="message-square" className="shrink-0 text-base"></app-icon>
              <span>Comunicação</span>
              <span class="badge">Em breve</span>
            </div>

            <a
              *ngIf="canAccessAdmin()"
              routerLink="/app/admin/users"
              class="nav-link"
              routerLinkActive="nav-active"
            >
              <app-icon name="shield" className="shrink-0 text-base"></app-icon>
              <span>Administração</span>
            </a>
          </div>
        </nav>

        <!-- Pro Banner -->
        <div class="mx-3 mb-4 p-4 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 shadow-sm text-indigo-900 space-y-2 border border-indigo-200">
          <h3 class="text-sm font-semibold">Ative o Pro Access</h3>
          <p class="text-xs text-indigo-700 leading-snug opacity-80">Desbloqueie mais recursos e funcionalidades avançadas</p>
          <button
            type="button"
            class="w-full fs-button-primary"
          >
            <app-icon name="star"></app-icon>
            Upgrade Pro
          </button>
        </div>

        <!-- Profile Section -->
        <div class="p-3 border-t border-slate-200 mt-auto">
          <button
            type="button"
            class="w-full fs-button-secondary justify-center"
            (click)="logout()"
          >
            <app-icon name="log-out"></app-icon>
            Sair
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-h-screen">
        <!-- Topbar -->
        <header class="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-end">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer transition"
              title="Notificações"
            >
              <app-icon name="bell" className="text-lg"></app-icon>
            </button>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer">
              <div class="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                {{ getUserInitial() }}
              </div>
              <div class="hidden lg:flex flex-col items-start leading-tight">
                <p class="text-sm font-semibold text-slate-900">{{ fullName }}</p>
                <p class="text-xs text-slate-500">{{ getUserEmail() }}</p>
              </div>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <main class="flex-1 overflow-y-auto">
          <div class="mx-auto w-full max-w-5xl px-6 py-6 lg:py-8">
            <div class="mb-6">
              <p class="text-sm text-slate-500">Bem-vindo</p>
              <h1 class="text-2xl font-semibold text-slate-900 leading-tight">{{ pageTitle() }}</h1>
            </div>
            <router-outlet></router-outlet>
          </div>
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

  getUserEmail(): string {
    return this.currentUserService.getEmail() || 'user@email.com';
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
