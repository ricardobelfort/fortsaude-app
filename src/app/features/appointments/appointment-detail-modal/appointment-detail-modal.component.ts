import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../core/models';
import { CheckInOutComponent } from '../check-in-out/check-in-out.component';
import { AppointmentStatusComponent } from '../appointment-status/appointment-status.component';
import { AppointmentRescheduleComponent } from '../appointment-reschedule/appointment-reschedule.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { FormatPhonePipe } from '../../../shared/pipes/format-phone.pipe';
import { EmptyValuePipe } from '../../../shared/pipes/empty-value.pipe';
import { CurrentUserService } from '../../../core/services';

@Component({
  selector: 'app-appointment-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    CheckInOutComponent,
    AppointmentStatusComponent,
    AppointmentRescheduleComponent,
    IconComponent,
    FormatPhonePipe,
    EmptyValuePipe,
  ],
  template: `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      @if (!canViewDetails()) {
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 text-center">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p class="text-gray-600 mb-6">
            Você não tem permissão para visualizar os detalhes desta consulta.
          </p>
          <button (click)="onClose.emit()" type="button" class="btn btn-primary">Fechar</button>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div
            class="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between"
          >
            <div class="flex-1">
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Detalhes da Consulta</h2>
              <p class="text-sm text-gray-600 mt-1">
                {{ appointment().patient.fullName }}
              </p>
            </div>
            <button (click)="onClose.emit()" type="button" class="btn btn-ghost btn-sm btn-circle">
              <app-icon [name]="'close'" [size]="20"></app-icon>
            </button>
          </div>

          <!-- Content -->
          <div class="p-4 sm:p-6 space-y-6">
            <!-- Patient Info -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">Paciente</h3>
              <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-white font-bold text-lg"
                  >
                    {{ getInitial(appointment().patient.fullName || '') }}
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">
                      {{ appointment().patient.fullName }}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{ appointment().patient.email }}
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <label class="text-xs font-semibold text-gray-600">Telefone</label>
                    <p class="text-sm text-gray-900">
                      {{ appointment().patient.phone | formatPhone | emptyValue }}
                    </p>
                  </div>
                  <div>
                    <label class="text-xs font-semibold text-gray-600">Data de Nascimento</label>
                    <p class="text-sm text-gray-900">
                      {{ appointment().patient.dateOfBirth | date: 'dd/MM/yyyy' | emptyValue }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Appointment Details -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">Informações da Consulta</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-blue-50 rounded-lg p-4">
                  <label class="text-xs font-semibold text-blue-600 mb-2 block">Data</label>
                  <p class="text-sm sm:text-base font-semibold text-gray-900">
                    {{ appointment().startsAt | date: 'dd/MM/yyyy' }}
                  </p>
                </div>
                <div class="bg-blue-50 rounded-lg p-4">
                  <label class="text-xs font-semibold text-blue-600 mb-2 block">Horário</label>
                  <p class="text-sm sm:text-base font-semibold text-gray-900">
                    {{ appointment().startsAt | date: 'HH:mm' }} -
                    {{ appointment().endsAt | date: 'HH:mm' }}
                  </p>
                </div>

                <div class="bg-indigo-50 rounded-lg p-4">
                  <label class="text-xs font-semibold text-indigo-600 mb-2 block"
                    >Profissional</label
                  >
                  <p class="text-sm sm:text-base font-semibold text-gray-900">
                    {{ appointment().professional.profile.account.person.fullName | emptyValue }}
                  </p>
                </div>

                <div class="bg-indigo-50 rounded-lg p-4">
                  <label class="text-xs font-semibold text-indigo-600 mb-2 block">Status</label>
                  <app-appointment-status
                    [appointment]="appointment()"
                    (onStatusChange)="onStatusChange($event)"
                  ></app-appointment-status>
                </div>

                @if (appointment().notes) {
                  <div class="col-span-2 bg-gray-50 rounded-lg p-4">
                    <label class="text-xs font-semibold text-gray-600 mb-2 block">Notas</label>
                    <p class="text-sm text-gray-700">{{ appointment().notes }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Check-in/Check-out -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">Registro de Presença</h3>
              <app-check-in-out
                [appointment]="appointment()"
                (onCheckInOut)="onCheckInOut($event)"
              ></app-check-in-out>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-4 pt-4 border-t border-gray-200">
              @if (canReschedule()) {
                <button
                  (click)="toggleReschedule()"
                  type="button"
                  class="btn btn-outline btn-block"
                >
                  <app-icon [name]="'calendar'" [size]="18"></app-icon>
                  {{ showReschedule() ? 'Cancelar Remarcação' : 'Remarcar Consulta' }}
                </button>

                @if (showReschedule()) {
                  <app-appointment-reschedule
                    [appointment]="appointment()"
                    (onClose)="onRescheduleClose($event)"
                  ></app-appointment-reschedule>
                }
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailModalComponent {
  private readonly currentUserService = inject(CurrentUserService);

  appointment = input.required<Appointment>();
  onClose = output<void>();
  onRefresh = output<void>();

  showReschedule = signal(false);

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  canReschedule(): boolean {
    return this.currentUserService.canRescheduleAppointment();
  }

  canViewDetails(): boolean {
    return this.currentUserService.canViewAppointmentDetails();
  }

  toggleReschedule() {
    this.showReschedule.update((val) => !val);
  }

  onStatusChange(_event: void) {
    this.onRefresh.emit();
  }

  onCheckInOut(_event: void) {
    this.onRefresh.emit();
  }

  onRescheduleClose(event: { saved: boolean; appointment?: Appointment }) {
    if (event.saved) {
      this.showReschedule.set(false);
      this.onRefresh.emit();
    }
  }
}
