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
import { IconComponent } from '../../../shared/ui/icon.component';
import { UserStateService } from '../../../core/services/user-state.service';

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
        padding: 0.75rem 0.75rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgb(51 65 85);
        transition: background-color 0.15s ease;
        cursor: pointer;
        line-height: 1;
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

      .dropdown-menu {
        position: absolute;
        bottom: 0;
        left: 100%;
        margin-left: 0.5rem;
        width: 16rem;
        background-color: white;
        border: 1px solid rgb(226 232 240);
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 50;
        overflow: hidden;
      }

      .dropdown-header {
        padding: 0.75rem 0.75rem 0.25rem 0.75rem;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: rgb(51 65 85);
        cursor: pointer;
        transition: background-color 0.15s ease;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
      }

      .dropdown-item:hover {
        background-color: rgb(248 250 252);
      }

      .dropdown-item.update-app {
        color: rgb(20 184 166);
        font-weight: 500;
      }

      .dropdown-footer {
        padding: 0.75rem 1rem;
        border-top: 1px solid rgb(241 245 249);
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
      [class.w-20]="!expanded()"
      aria-label="Navegação lateral"
    >
      <div
        class="h-14 flex items-center border-b border-slate-200"
        [class.px-4]="expanded()"
        [class.gap-3]="expanded()"
        [class.justify-center]="!expanded()"
      >
        <div
          class="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-semibold tracking-wide"
        >
          FS
        </div>
        @if (expanded()) {
          <div>
            <p class="text-xs uppercase tracking-[0.12em] text-slate-400">Clínica</p>
            <p class="text-sm font-semibold text-slate-900">FortSaúde</p>
          </div>
        }
      </div>

      <nav
        class="flex-1 py-4 space-y-5 overflow-y-auto"
        [class.px-3]="expanded()"
        [class.px-2]="!expanded()"
      >
        <div class="space-y-1.5">
          @if (expanded()) {
            <p class="text-[11px] font-semibold tracking-[0.14em] text-slate-400 px-2">PRINCIPAL</p>
          }
          <a
            routerLink="/app/dashboard"
            class="nav-link"
            routerLinkActive="nav-active"
            [routerLinkActiveOptions]="{ exact: true }"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            [attr.title]="expanded() ? null : 'Dashboard'"
          >
            <app-icon
              [name]="'layout'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Dashboard</span>
            }
          </a>
          <a
            routerLink="/app/appointments"
            class="nav-link"
            routerLinkActive="nav-active"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            [attr.title]="expanded() ? null : 'Agenda'"
          >
            <app-icon
              [name]="'calendar'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Agenda</span>
            }
          </a>
          <a
            routerLink="/app/patients"
            class="nav-link"
            routerLinkActive="nav-active"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            [attr.title]="expanded() ? null : 'Pacientes'"
          >
            <app-icon
              [name]="'users'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Pacientes</span>
            }
          </a>
          <a
            routerLink="/app/professionals"
            class="nav-link"
            routerLinkActive="nav-active"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            [attr.title]="expanded() ? null : 'Profissionais'"
          >
            <app-icon
              [name]="'groups'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Profissionais</span>
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
            class="nav-link nav-disabled"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            title="Departamentos"
          >
            <app-icon
              [name]="'department'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Departamentos</span>
            }
          </div>
          <div
            class="nav-link nav-disabled"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            title="Financeiro"
          >
            <app-icon
              [name]="'money'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Financeiro</span>
            }
          </div>
          <div
            class="nav-link nav-disabled"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            title="Serviços"
          >
            <app-icon
              [name]="'service'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Serviços</span>
            }
          </div>
          <div
            class="nav-link nav-disabled"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            title="Comunicação"
          >
            <app-icon
              [name]="'message-notification'"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Comunicação</span>
            }
          </div>

          @if (canAccessAdmin()) {
            <a
              routerLink="/app/admin/users"
              class="nav-link"
              routerLinkActive="nav-active"
              [class.justify-center]="!expanded()"
              [class.px-2]="!expanded()"
              [attr.title]="expanded() ? null : 'Administração'"
            >
              <app-icon
                [name]="'shield'"
                [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
              ></app-icon>
              @if (expanded()) {
                <span>Administração</span>
              }
            </a>
          }
        </div>
      </nav>

      <div
        class="mt-auto space-y-3 p-2 border-t border-slate-200"
        [class.px-3]="expanded()"
        [class.px-2]="!expanded()"
      >
        <!-- User Avatar Card -->
        @if (expanded()) {
          <div class="relative">
            <button type="button" class="user-profile-btn" (click)="toggleDropdown()">
              <div class="rounded-md p-2 hover:bg-slate-100 transition-colors">
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
                <div class="dropdown-header">
                  <div class="flex items-center gap-3">
                    <div>
                      @if (avatarUrl() && avatarUrl() !== '') {
                        <img
                          [src]="avatarUrl()"
                          alt="Avatar"
                          class="w-12 h-12 rounded-xl object-cover"
                        />
                      } @else {
                        <div
                          class="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-200 text-pink-700 font-bold text-lg"
                        >
                          {{ initial() }}
                        </div>
                      }
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="font-semibold text-slate-900 text-sm truncate">{{
                        fullName()
                      }}</span>
                      <span class="text-xs text-slate-500 truncate">{{ email() }}</span>
                    </div>
                  </div>
                </div>

                <div class="h-px bg-slate-200 my-2"></div>

                <div class="py-1">
                  <button type="button" class="dropdown-item">
                    <app-icon [name]="'folder'" [className]="'text-slate-500'"></app-icon>
                    <span>Integrations</span>
                  </button>
                  <button type="button" class="dropdown-item">
                    <app-icon [name]="'clock'" [className]="'text-slate-500'"></app-icon>
                    <span>History</span>
                  </button>
                  <button type="button" class="dropdown-item">
                    <app-icon [name]="'star'" [className]="'text-yellow-500'"></app-icon>
                    <span>Upgrade to Pro</span>
                  </button>
                  <button type="button" class="dropdown-item update-app">
                    <span class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                    <span>Update App</span>
                  </button>
                </div>

                <div class="h-px bg-slate-200"></div>

                <div class="py-1">
                  <button
                    type="button"
                    class="dropdown-item"
                    (click)="logout.emit(); toggleDropdown()"
                  >
                    <app-icon [name]="'log-out'" [className]="'text-slate-500'"></app-icon>
                    <span>Logout</span>
                  </button>
                </div>

                <div class="h-px bg-slate-200"></div>

                <div class="dropdown-footer">v1.5.69 • Terms & Conditions</div>
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

  // Get user data from UserStateService
  readonly fullName = computed(() => this.userStateService.userName() || 'Usuário');
  readonly email = computed(() => this.userStateService.userEmail() || 'user@email.com');
  readonly initial = computed(() => {
    const name = this.userStateService.userName();
    return name ? name.charAt(0).toUpperCase() : 'U';
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

  protected toggleDropdown(): void {
    this.isDropdownOpen.update((value) => !value);
  }
}
