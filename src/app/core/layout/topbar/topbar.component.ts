import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, computed } from '@angular/core';
import { IconComponent } from '@shared/ui/icon.component';
import { UserStateService } from '@core/services/user-state.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header
      class="h-14 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between relative"
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="absolute left-2 flex items-center justify-center w-10 h-10 rounded-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition"
          (click)="toggleSidebar.emit()"
          [attr.aria-expanded]="expanded()"
          aria-label="Alternar sidebar"
        >
          <app-icon [size]="20" [name]="expanded() ? 'menu' : 'chevron-right'"></app-icon>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex items-center justify-center w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer transition"
          title="Notificações"
        >
          <app-icon [name]="'bell-sleep'" [size]="20" [className]="'text-lg'"></app-icon>
        </button>
        <div
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          aria-label="Perfil do usuário"
        >
          <div
            class="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm"
          >
            {{ initial() }}
          </div>
          <div class="hidden lg:flex flex-col items-start leading-tight">
            <p class="text-sm font-semibold text-slate-900">{{ fullName() }}</p>
            <p class="text-xs text-slate-500'">{{ email() }}</p>
          </div>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  private readonly userStateService = inject(UserStateService);

  readonly expanded = input<boolean>(true);
  readonly toggleSidebar = output<void>();

  // Get user data from UserStateService
  readonly fullName = computed(() => this.userStateService.userName() || 'Usuário');
  readonly email = computed(() => this.userStateService.userEmail() || 'user@email.com');
  readonly initial = computed(() => {
    const name = this.userStateService.userName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  });
}
