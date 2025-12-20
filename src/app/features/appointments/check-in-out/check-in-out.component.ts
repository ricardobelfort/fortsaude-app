import { Component, ChangeDetectionStrategy, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '@core/services';
import { AlertService } from '@shared/ui/alert.service';
import { CurrentUserService } from '@core/services';
import { Appointment } from '@core/models';
import { IconComponent } from '@shared/ui/icon.component';

@Component({
  selector: 'app-check-in-out',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="flex gap-3 items-center">
      @if (currentUserService.canPerformCheckInOut()) {
        @if (!appointment().checkInTime) {
          <button
            type="button"
            class="btn btn-sm btn-success text-white"
            (click)="checkIn()"
            [disabled]="isLoading()"
            title="Registrar entrada"
          >
            @if (isLoading()) {
              <span class="loading loading-spinner loading-xs"></span>
            } @else {
              <app-icon [name]="'login'" [size]="16"></app-icon>
            }
            Check-in
          </button>
        } @else {
          <span class="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
            <app-icon [name]="'check-circle'" [size]="14" [className]="'inline mr-1'"></app-icon>
            {{ appointment().checkInTime | date: 'HH:mm' }}
          </span>
        }

        @if (appointment().checkInTime && !appointment().checkOutTime) {
          <button
            type="button"
            class="btn btn-sm btn-warning text-white"
            (click)="checkOut()"
            [disabled]="isLoading()"
            title="Registrar saída"
          >
            @if (isLoading()) {
              <span class="loading loading-spinner loading-xs"></span>
            } @else {
              <app-icon [name]="'logout'" [size]="16"></app-icon>
            }
            Check-out
          </button>
        } @else if (appointment().checkOutTime) {
          <span class="text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
            <app-icon [name]="'check-circle'" [size]="14" [className]="'inline mr-1'"></app-icon>
            {{ appointment().checkOutTime | date: 'HH:mm' }}
          </span>
        }
      } @else {
        <p class="text-xs text-gray-500 italic">Sem permissão para registrar presença</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckInOutComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly alertService = inject(AlertService);
  readonly currentUserService = inject(CurrentUserService);

  appointment = input.required<Appointment>();
  onCheckInOut = output<void>();

  isLoading = signal(false);

  checkIn(): void {
    this.isLoading.set(true);
    const now = new Date().toISOString();

    this.appointmentsService
      .update(this.appointment().id, {
        checkInTime: now,
      })
      .subscribe({
        next: () => {
          this.alertService.success('Check-in realizado com sucesso');
          this.onCheckInOut.emit();
          this.isLoading.set(false);
        },
        error: () => {
          this.alertService.error('Erro ao registrar check-in');
          this.isLoading.set(false);
        },
      });
  }

  checkOut(): void {
    this.isLoading.set(true);
    const now = new Date().toISOString();

    this.appointmentsService
      .update(this.appointment().id, {
        checkOutTime: now,
      })
      .subscribe({
        next: () => {
          this.alertService.success('Check-out realizado com sucesso');
          this.onCheckInOut.emit();
          this.isLoading.set(false);
        },
        error: () => {
          this.alertService.error('Erro ao registrar check-out');
          this.isLoading.set(false);
        },
      });
  }
}
