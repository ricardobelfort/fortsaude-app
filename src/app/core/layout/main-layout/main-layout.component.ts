import { Component, ChangeDetectionStrategy, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { CurrentUserService } from '@core/services/current-user.service';
import { AuthService } from '@core/services/auth.service';
import { SidebarComponent } from '@core/layout/sidebar/sidebar.component';
import { TopbarComponent } from '@core/layout/topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="min-h-screen bg-[#f5f7fb] text-slate-900 flex">
      <app-sidebar [expanded]="isSidebarExpanded()" (logout)="logout()"></app-sidebar>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col h-screen">
        <app-topbar [expanded]="isSidebarExpanded()" (toggleSidebar)="toggleSidebar()"></app-topbar>

        <!-- Content Area -->
        <main class="flex-1 overflow-y-auto overflow-x-hidden">
          <div class="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-full">
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

  sidebarExpanded = signal(this.isMobile() ? false : true);

  isSidebarExpanded(): boolean {
    return this.sidebarExpanded();
  }

  toggleSidebar(): void {
    this.sidebarExpanded.update((value) => !value);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      if (isMobile && this.sidebarExpanded()) {
        this.sidebarExpanded.set(false);
      }
    }
  }
}
