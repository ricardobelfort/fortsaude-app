import { Component, ChangeDetectionStrategy, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '@core/services';
import { AlertService } from '@shared/ui/alert.service';
import { CurrentUserService } from '@core/services';
import { Appointment, AppointmentStatus } from '@core/models';
import { IconComponent } from '@shared/ui/icon.component';

type AppointmentStatusValue = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

@Component({
  selector: 'app-appointment-status',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="flex items-center gap-2">
      <span
        class="px-3 py-1 rounded-full text-xs font-semibold"
        [class.bg-blue-100]="appointment().status === 'SCHEDULED'"
        [class.text-blue-700]="appointment().status === 'SCHEDULED'"
        [class.bg-green-100]="appointment().status === 'CONFIRMED'"
        [class.text-green-700]="appointment().status === 'CONFIRMED'"
        [class.bg-purple-100]="appointment().status === 'COMPLETED'"
        [class.text-purple-700]="appointment().status === 'COMPLETED'"
        [class.bg-yellow-100]="appointment().status === 'NO_SHOW'"
        [class.text-yellow-700]="appointment().status === 'NO_SHOW'"
        [class.bg-red-100]="appointment().status === 'CANCELLED'"
        [class.text-red-700]="appointment().status === 'CANCELLED'"
      >
        {{ getStatusLabel() }}
      </span>

      <div class="dropdown dropdown-end">
        <button
          type="button"
          class="btn btn-sm btn-ghost"
          [disabled]="isLoading() || !currentUserService.canChangeAppointmentStatus()"
          title="Alterar status"
        >
          <app-icon [name]="'chevron-down'" [size]="16"></app-icon>
        </button>
        @if (currentUserService.canChangeAppointmentStatus()) {
          <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            @for (status of availableStatuses; track status) {
              <li>
                <a (click)="updateStatus(status)" [class.active]="appointment().status === status">
                  {{ getStatusLabel(status) }}
                </a>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentStatusComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly alertService = inject(AlertService);
  readonly currentUserService = inject(CurrentUserService);

  appointment = input.required<Appointment>();
  onStatusChange = output<void>();

  isLoading = signal(false);

  availableStatuses: AppointmentStatusValue[] = [
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.NO_SHOW,
    AppointmentStatus.CANCELLED,
  ];

  getStatusLabel(status?: AppointmentStatusValue): string {
    const st = status || this.appointment().status;
    const labels: Record<AppointmentStatusValue, string> = {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Concluído',
      NO_SHOW: 'Não Compareceu',
      CANCELLED: 'Cancelado',
    };
    return labels[st];
  }

  updateStatus(newStatus: AppointmentStatusValue): void {
    if (newStatus === this.appointment().status) return;

    this.isLoading.set(true);
    this.appointmentsService
      .update(this.appointment().id, {
        status: newStatus,
      })
      .subscribe({
        next: () => {
          this.alertService.success(`Status alterado para ${this.getStatusLabel(newStatus)}`);
          this.onStatusChange.emit();
          this.isLoading.set(false);
        },
        error: () => {
          this.alertService.error('Erro ao alterar status');
          this.isLoading.set(false);
        },
      });
  }
}
