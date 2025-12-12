import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  HostListener,
  ElementRef,
  inject,
  computed,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '@shared/ui/icon.component';
import { UserStateService } from '@core/services/user-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  styles: [
    `
      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.5rem 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgb(51 65 85);
        transition: background-color 0.15s ease;
        cursor: pointer;
        line-height: 1;
        position: relative;
      }

      .nav-link:hover {
        background-color: rgb(241 245 249);
      }

      .nav-active {
        background-color: rgb(241 245 249);
        color: rgb(15 23 42);
        font-weight: 600;
      }

      .nav-disabled {
        cursor: not-allowed;
        user-select: none;
        opacity: 0.6;
      }

      .badge {
        margin-left: auto;
        font-size: 0.6875rem;
        font-weight: 600;
        color: rgb(225 29 72);
        background-color: rgb(255 241 242);
        border: 1px solid rgb(255 228 230);
        padding: 0.125rem 0.5rem;
        border-radius: 0.5rem;
      }

      .nav-disabled .badge {
        color: rgb(100 116 139);
        background-color: rgb(241 245 249);
        border-color: rgb(226 232 240);
      }

      .tooltip-wrapper {
        position: relative;
        overflow: visible;
      }

      .tooltip {
        position: fixed;
        background-color: rgb(15 23 42);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 9999;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .tooltip::before {
        content: '';
        position: absolute;
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border: 0.375rem solid transparent;
        border-right-color: rgb(15 23 42);
      }

      .tooltip.visible {
        opacity: 1;
      }

      .dropdown-menu {
        position: absolute;
        bottom: 120%;
        left: 10px;
        margin-left: 0.5rem;
        width: 14rem;
        background-color: white;
        border-radius: 0.3rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 50;
        padding: 0 0.25rem;
        overflow: hidden;
      }

      .dropdown-header {
        padding: 0.75rem 0.75rem 0.25rem 0.75rem;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
        color: rgb(51 65 85);
        cursor: pointer;
        transition: background-color 0.15s ease;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
      }

      .dropdown-item:hover {
        background-color: rgb(241 245 249);
        border-radius: 0.3rem;
      }

      .dropdown-item.update-app {
        color: rgb(20 184 166);
        font-weight: 500;
      }

      .dropdown-item.logout {
        color: rgb(220 38 38);
        font-weight: 500;
      }

      .dropdown-item.logout:hover {
        background-color: rgb(254 242 242);
      }

      .dropdown-footer {
        padding: 0.75rem 1rem;
        font-size: 0.75rem;
        color: rgb(148 163 184);
        text-align: center;
      }

      .user-profile-btn {
        width: 100%;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
      }

      .user-profile-btn:hover {
        opacity: 0.9;
      }
    `,
  ],
  template: `
    <aside
      class="shrink-0 border-r border-slate-200 bg-white flex flex-col transition-all duration-200 min-h-screen h-screen"
      [class.w-64]="expanded()"
      [class.w-16]="!expanded()"
      aria-label="Navegação lateral"
    >
      <div
        class="h-14 flex items-center border-b border-slate-200"
        [class.px-4]="expanded()"
        [class.gap-3]="expanded()"
        [class.justify-center]="!expanded()"
      >
        <img src="assets/images/logo-transparent.png" width="36" alt="MultClinic Logo" />
        @if (expanded()) {
          <div>
            <p class="text-md uppercase font-semibold tracking-[0.2em] text-gray-800">MultClinic</p>
          </div>
        }
      </div>

      <nav
        class="flex-1 py-3 space-y-4 overflow-y-auto overflow-x-visible"
        [class.px-3]="expanded()"
        [class.px-2]="!expanded()"
      >
        <div class="space-y-1.5">
          @if (expanded()) {
            <p class="text-[11px] font-semibold tracking-[0.14em] text-slate-400 px-2">PRINCIPAL</p>
          }
          <a
            routerLink="/app/dashboard"
            class="nav-link tooltip-wrapper"
            routerLinkActive="nav-active"
            [routerLinkActiveOptions]="{ exact: true }"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            (mouseenter)="onTooltipMouseEnter($event, 'dashboard')"
            (mouseleave)="onTooltipMouseLeave()"
          >
            <app-icon
              [name]="'layout'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Dashboard</span>
            }
            @if (!expanded()) {
              <span
                class="tooltip"
                [class.visible]="activeTooltipId() === 'dashboard'"
                [style.top.px]="tooltipPosition()?.top"
                [style.left.px]="tooltipPosition()?.left"
                >Dashboard</span
              >
            }
          </a>
          <a
            routerLink="/app/appointments"
            class="nav-link tooltip-wrapper"
            routerLinkActive="nav-active"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            (mouseenter)="onTooltipMouseEnter($event, 'agenda')"
            (mouseleave)="onTooltipMouseLeave()"
          >
            <app-icon
              [name]="'calendar'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Agenda</span>
            }
            @if (!expanded()) {
              <span
                class="tooltip"
                [class.visible]="activeTooltipId() === 'agenda'"
                [style.top.px]="tooltipPosition()?.top"
                [style.left.px]="tooltipPosition()?.left"
                >Agenda</span
              >
            }
          </a>
          <a
            routerLink="/app/patients"
            class="nav-link tooltip-wrapper"
            routerLinkActive="nav-active"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            (mouseenter)="onTooltipMouseEnter($event, 'patients')"
            (mouseleave)="onTooltipMouseLeave()"
          >
            <app-icon
              [name]="'users'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Pacientes</span>
            }
            @if (!expanded()) {
              <span
                class="tooltip"
                [class.visible]="activeTooltipId() === 'patients'"
                [style.top.px]="tooltipPosition()?.top"
                [style.left.px]="tooltipPosition()?.left"
                >Pacientes</span
              >
            }
          </a>
          <a
            routerLink="/app/professionals"
            class="nav-link tooltip-wrapper"
            routerLinkActive="nav-active"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            (mouseenter)="onTooltipMouseEnter($event, 'professionals')"
            (mouseleave)="onTooltipMouseLeave()"
          >
            <app-icon
              [name]="'groups'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Profissionais</span>
            }
            @if (!expanded()) {
              <span
                class="tooltip"
                [class.visible]="activeTooltipId() === 'professionals'"
                [style.top.px]="tooltipPosition()?.top"
                [style.left.px]="tooltipPosition()?.left"
                >Profissionais</span
              >
            }
          </a>
        </div>

        <div class="space-y-1.5">
          @if (expanded()) {
            <p class="text-[11px] font-semibold tracking-[0.14em] text-slate-400 px-2">
              ADMIN & OUTROS
            </p>
          }
          <div
            class="nav-link nav-disabled tooltip-wrapper"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            (mouseenter)="onTooltipMouseEnter($event, 'departments')"
            (mouseleave)="onTooltipMouseLeave()"
          >
            <app-icon
              [name]="'department'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Departamentos</span>
            }
            @if (!expanded()) {
              <span
                class="tooltip"
                [class.visible]="activeTooltipId() === 'departments'"
                [style.top.px]="tooltipPosition()?.top"
                [style.left.px]="tooltipPosition()?.left"
                >Departamentos</span
              >
            }
          </div>
          <div
            class="nav-link nav-disabled tooltip-wrapper"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            (mouseenter)="onTooltipMouseEnter($event, 'financial')"
            (mouseleave)="onTooltipMouseLeave()"
          >
            <app-icon
              [name]="'money'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Financeiro</span>
            }
            @if (!expanded()) {
              <span
                class="tooltip"
                [class.visible]="activeTooltipId() === 'financial'"
                [style.top.px]="tooltipPosition()?.top"
                [style.left.px]="tooltipPosition()?.left"
                >Financeiro</span
              >
            }
          </div>
          <div
            class="nav-link nav-disabled tooltip-wrapper"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            (mouseenter)="onTooltipMouseEnter($event, 'services')"
            (mouseleave)="onTooltipMouseLeave()"
          >
            <app-icon
              [name]="'service'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Serviços</span>
            }
            @if (!expanded()) {
              <span
                class="tooltip"
                [class.visible]="activeTooltipId() === 'services'"
                [style.top.px]="tooltipPosition()?.top"
                [style.left.px]="tooltipPosition()?.left"
                >Serviços</span
              >
            }
          </div>
          <div
            class="nav-link nav-disabled tooltip-wrapper"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            (mouseenter)="onTooltipMouseEnter($event, 'communication')"
            (mouseleave)="onTooltipMouseLeave()"
          >
            <app-icon
              [name]="'message-notification'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Comunicação</span>
            }
            @if (!expanded()) {
              <span
                class="tooltip"
                [class.visible]="activeTooltipId() === 'communication'"
                [style.top.px]="tooltipPosition()?.top"
                [style.left.px]="tooltipPosition()?.left"
                >Comunicação</span
              >
            }
          </div>

          @if (canAccessAdmin()) {
            <a
              routerLink="/app/admin/users"
              class="nav-link tooltip-wrapper"
              routerLinkActive="nav-active"
              [class.justify-center]="!expanded()"
              [class.px-2]="!expanded()"
              (mouseenter)="onTooltipMouseEnter($event, 'admin')"
              (mouseleave)="onTooltipMouseLeave()"
            >
              <app-icon
                [name]="'shield'"
                [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
              ></app-icon>
              @if (expanded()) {
                <span>Administração</span>
              }
              @if (!expanded()) {
                <span
                  class="tooltip"
                  [class.visible]="activeTooltipId() === 'admin'"
                  [style.top.px]="tooltipPosition()?.top"
                  [style.left.px]="tooltipPosition()?.left"
                  >Administração</span
                >
              }
            </a>
          }
        </div>
      </nav>

      <div
        class="mt-auto space-y-2 py-2 border-t border-dashed border-slate-200"
        [class.px-3]="expanded()"
        [class.px-2]="!expanded()"
      >
        <!-- User Avatar Card -->
        @if (expanded()) {
          <div class="relative">
            <button type="button" class="user-profile-btn" (click)="toggleDropdown()">
              <div class="rounded-md p-2 bg-slate-50 hover:bg-slate-100 transition-colors">
                <div class="flex items-center gap-3">
                  <div>
                    @if (avatarUrl() && avatarUrl() !== '') {
                      <img
                        [src]="avatarUrl()"
                        alt="Avatar"
                        class="w-9 h-9 rounded-md object-cover"
                      />
                    } @else {
                      <div
                        class="w-9 h-9 rounded-md flex items-center justify-center bg-pink-200 text-pink-700 font-bold text-lg"
                      >
                        {{ initial() }}
                      </div>
                    }
                  </div>
                  <div class="flex flex-col min-w-0 flex-1">
                    <span class="font-semibold text-slate-900 text-left text-sm truncate">{{
                      fullName()
                    }}</span>
                    <span class="text-xs text-slate-500 text-left truncate">{{ email() }}</span>
                  </div>
                  <app-icon
                    [size]="16"
                    [name]="isDropdownOpen() ? 'unfold-less' : 'unfold-more'"
                    [className]="'text-slate-400 text-sm flex-shrink-0'"
                  ></app-icon>
                </div>
              </div>
            </button>

            @if (isDropdownOpen()) {
              <div class="dropdown-menu">
                <div class="py-1">
                  <button type="button" class="dropdown-item">
                    <app-icon [name]="'user'" [size]="20" [className]="'text-slate-500'"></app-icon>
                    <span>Meu Perfil</span>
                  </button>
                  <button type="button" class="dropdown-item">
                    <app-icon
                      [name]="'settings'"
                      [size]="20"
                      [className]="'text-slate-500'"
                    ></app-icon>
                    <span>Configurações</span>
                  </button>
                  <button type="button" class="dropdown-item">
                    <app-icon
                      [name]="'star'"
                      [size]="20"
                      [className]="'text-yellow-500'"
                    ></app-icon>
                    <span>Upgrade to Pro</span>
                  </button>
                  <button
                    type="button"
                    class="dropdown-item logout"
                    (click)="logout.emit(); toggleDropdown()"
                  >
                    <app-icon [name]="'logout'" [size]="20" [className]="'text-red-500'"></app-icon>
                    <span>Logout</span>
                  </button>
                </div>

                <div class="h-px bg-slate-200"></div>

                <div class="dropdown-footer">v0.0.0 • BETA</div>
              </div>
            }
          </div>
        } @else {
          <div class="flex justify-center">
            <button
              type="button"
              (click)="logout.emit()"
              class="bg-transparent border-none cursor-pointer"
            >
              @if (avatarUrl() && avatarUrl() !== '') {
                <img [src]="avatarUrl()" alt="Avatar" class="w-10 h-10 rounded-lg object-cover" />
              } @else {
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center bg-pink-200 text-pink-700 font-bold"
                >
                  {{ initial() }}
                </div>
              }
            </button>
          </div>
        }
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly userStateService = inject(UserStateService);

  readonly expanded = input.required<boolean>();
  readonly canAccessAdmin = input<boolean>(false);
  readonly logout = output<void>();

  private elementRef = inject(ElementRef);
  protected isDropdownOpen = signal(false);
  protected tooltipPosition = signal<{ top: number; left: number } | null>(null);
  protected activeTooltipId = signal<string | null>(null);

  // Get user data from UserStateService
  readonly fullName = computed(() => this.userStateService.userName() || 'Usuário');
  readonly email = computed(() => this.userStateService.userEmail() || 'user@email.com');
  readonly initial = computed(() => {
    const name = this.userStateService.userName();
    if (!name) return 'U';

    // Simply get the first character, normalize accents
    const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized.charAt(0).toUpperCase();
  });
  readonly avatarUrl = computed(() => {
    // Avatar URL could be stored in user service or fetched from backend
    // For now, we'll use an empty string and it will show the initial letter
    return '';
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isDropdownOpen()) {
      this.isDropdownOpen.set(false);
    }
  }

  protected onTooltipMouseEnter(event: MouseEvent, tooltipId: string): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const top = rect.top + rect.height / 2 - 15; // Centralizar verticalmente
    const left = rect.right + 8; // À direita do elemento

    this.activeTooltipId.set(tooltipId);
    this.tooltipPosition.set({
      top,
      left,
    });
  }

  protected onTooltipMouseLeave(): void {
    this.activeTooltipId.set(null);
    this.tooltipPosition.set(null);
  }

  protected toggleDropdown(): void {
    this.isDropdownOpen.update((value) => !value);
  }
}
