import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  computed,
  signal,
} from '@angular/core';
import { IconComponent } from '@shared/ui/icon.component';
import { UserStateService } from '@core/services/user-state.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header
      class="h-14 bg-white border-b border-slate-200 px-2 sm:px-4 md:px-6 flex items-center justify-between relative"
    >
      <!-- Left: Toggle Button -->
      <button
        type="button"
        class="flex items-center justify-center w-9 sm:w-10 h-9 sm:h-10 rounded-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition"
        (click)="toggleSidebar.emit()"
        [attr.aria-expanded]="expanded()"
        aria-label="Alternar sidebar"
      >
        <app-icon [size]="18" [name]="expanded() ? 'menu' : 'chevron-right'"></app-icon>
      </button>

      <!-- Right: User and Notifications -->
      <div class="flex items-center gap-1 sm:gap-2 md:gap-3">
        <button
          type="button"
          class="flex items-center justify-center w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer transition"
          title="Notificações"
        >
          <app-icon [name]="'bell-sleep'" [size]="18" [className]="'text-lg'"></app-icon>
        </button>

        <!-- User Dropdown Menu -->
        <div class="relative">
          <button
            type="button"
            class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            aria-label="Menu do usuário"
            (click)="toggleDropdown()"
            [attr.aria-expanded]="isDropdownOpen()"
          >
            <div
              class="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs flex-shrink-0"
            >
              {{ initial() }}
            </div>
            <div class="hidden lg:flex flex-col items-start leading-tight min-w-0">
              <p class="text-xs font-semibold text-slate-900 truncate">{{ fullName() }}</p>
              <p class="text-xs text-slate-500 truncate">{{ email() }}</p>
            </div>
            <app-icon
              [name]="isDropdownOpen() ? 'arrow-up' : 'arrow-down'"
              [size]="16"
              [className]="'text-slate-400 ml-1'"
            ></app-icon>
          </button>

          <!-- Dropdown Menu -->
          @if (isDropdownOpen()) {
            <div
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50"
              role="menu"
            >
              <!-- Minha Conta Button -->
              <a
                href="/app/account"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                role="menuitem"
              >
                <app-icon [name]="'user'" [size]="18" [className]="'text-slate-400'"></app-icon>
                <span>Minha Conta</span>
              </a>
              <!-- Logout Button -->
              <button
                type="button"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                role="menuitem"
                (click)="logout()"
              >
                <app-icon [name]="'logout'" [size]="18" [className]="'text-red-400'"></app-icon>
                <span>Sair da conta</span>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  private readonly userStateService = inject(UserStateService);
  private readonly authService = inject(AuthService);

  readonly expanded = input<boolean>(true);
  readonly toggleSidebar = output<void>();

  isDropdownOpen = signal(false);

  // Get user data from UserStateService
  readonly fullName = computed(() => this.userStateService.userName() || 'Usuário');
  readonly email = computed(() => this.userStateService.userEmail() || 'user@email.com');
  readonly initial = computed(() => {
    const name = this.userStateService.userName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  });

  toggleDropdown(): void {
    this.isDropdownOpen.update((v) => !v);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  logout(): void {
    this.closeDropdown();
    this.authService.logout();
  }
}
