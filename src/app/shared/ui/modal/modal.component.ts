import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="modal modal-open">
      <div class="modal-box w-11/12 sm:w-full max-w-2xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 flex-shrink-0 gap-2">
          <h3 class="font-bold text-base sm:text-lg break-words">{{ title() }}</h3>
          <button
            type="button"
            class="btn btn-sm btn-circle btn-ghost flex-shrink-0"
            (click)="cancelled.emit()"
            aria-label="Fechar modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Content with scrollbar -->
        <div class="flex-1 overflow-y-auto py-4">
          <ng-content select="[modal-content]"></ng-content>
        </div>

        <!-- Footer -->
        <div class="modal-action mt-6 flex-shrink-0 flex gap-2">
          <button type="button" class="btn btn-outline btn-sm sm:btn-md" (click)="cancelled.emit()">
            {{ cancelButtonText() }}
          </button>
          <button
            type="button"
            [attr.form]="formId()"
            [disabled]="isLoading() || !isFormValid()"
            class="btn btn-primary btn-sm sm:btn-md gap-2"
          >
            @if (isLoading()) {
              <span class="loading loading-spinner loading-sm"></span>
            }
            {{ isLoading() ? loadingText() : submitButtonText() }}
          </button>
        </div>
      </div>
      <div class="modal-backdrop" (click)="cancelled.emit()"></div>
    </div>
  `,
})
export class ModalComponent {
  readonly title = input<string>('');
  readonly submitButtonText = input<string>('Salvar');
  readonly cancelButtonText = input<string>('Cancelar');
  readonly loadingText = input<string>('Salvando...');
  readonly isLoading = input<boolean>(false);
  readonly isFormValid = input<boolean>(true);
  readonly formId = input<string>('');

  readonly cancelled = output<void>();
}
