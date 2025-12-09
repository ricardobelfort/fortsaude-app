import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/role.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-screen bg-[#f5f6fb] text-slate-900 flex">
      <app-sidebar
        [expanded]="isSidebarExpanded()"
        [canAccessAdmin]="canAccessAdmin()"
        (logout)="logout()"
      ></app-sidebar>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-h-screen">
        <app-topbar
          [expanded]="isSidebarExpanded()"
          [fullName]="fullName"
          [email]="getUserEmail()"
          [initial]="getUserInitial()"
          (toggleSidebar)="toggleSidebar()"
        ></app-topbar>

        <!-- Content Area -->
        <main class="flex-1 overflow-y-auto">
          <div class="w-full px-8 py-8">
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
  sidebarExpanded = signal(true);

  isSidebarExpanded(): boolean {
    return this.sidebarExpanded();
  }

  toggleSidebar(): void {
    this.sidebarExpanded.update((value) => !value);
  }

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
