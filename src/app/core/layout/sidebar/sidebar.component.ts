import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon.component';

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
        border-left: 4px solid rgb(99 102 241);
        padding-left: 0.625rem;
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
    `,
  ],
  template: `
    <aside
      class="shrink-0 border-r border-slate-200 bg-white flex flex-col transition-all duration-200 min-h-screen h-screen"
      [class.w-64]="expanded()"
      [class.w-20]="!expanded()"
      aria-label="Navegação lateral"
    >
      <div class="h-14 px-4 flex items-center gap-3 border-b border-slate-200">
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
              name="layout"
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
              name="calendar"
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
              name="users"
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
              name="user-check"
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
              name="grid"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Departamentos</span>
              <span class="badge">Em breve</span>
            }
          </div>
          <div
            class="nav-link nav-disabled"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            title="Financeiro"
          >
            <app-icon
              name="credit-card"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Financeiro</span>
              <span class="badge">Em breve</span>
            }
          </div>
          <div
            class="nav-link nav-disabled"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            title="Serviços"
          >
            <app-icon
              name="list"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Serviços</span>
              <span class="badge">Em breve</span>
            }
          </div>
          <div
            class="nav-link nav-disabled"
            [class.justify-center]="!expanded()"
            [class.px-2]="!expanded()"
            title="Comunicação"
          >
            <app-icon
              name="message-square"
              [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
            ></app-icon>
            @if (expanded()) {
              <span>Comunicação</span>
              <span class="badge">Em breve</span>
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
                name="shield"
                [className]="expanded() ? 'shrink-0 text-base' : 'text-lg'"
              ></app-icon>
              @if (expanded()) {
                <span>Administração</span>
              }
            </a>
          }
        </div>
      </nav>

      <div class="mt-auto space-y-3" [class.px-3]="expanded()" [class.px-2]="!expanded()">
        <div
          class="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-900 border border-indigo-200"
          [class.p-4]="expanded()"
          [class.p-2]="!expanded()"
        >
          @if (expanded()) {
            <h3 class="text-sm font-semibold mb-1">Ative o Pro Access</h3>
            <p class="text-xs text-indigo-700 leading-snug opacity-80 mb-3">
              Desbloqueie mais recursos e funcionalidades avançadas
            </p>
            <button type="button" class="w-full fs-button-primary">
              <app-icon name="star"></app-icon>
              Upgrade Pro
            </button>
          } @else {
            <div class="flex items-center justify-center">
              <app-icon name="star" className="text-indigo-600"></app-icon>
            </div>
          }
        </div>

        <div class="pb-3">
          <button
            type="button"
            class="w-full fs-button-secondary"
            [class.justify-center]="!expanded()"
            (click)="logout.emit()"
          >
            <app-icon name="log-out"></app-icon>
            @if (expanded()) {
              <span>Sair</span>
            }
          </button>
        </div>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly expanded = input.required<boolean>();
  readonly canAccessAdmin = input<boolean>(false);
  readonly logout = output<void>();
}
