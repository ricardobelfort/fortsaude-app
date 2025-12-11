import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto pt-8"
    >
      <div class="bg-white shadow-2xl w-full max-w-2xl mb-8 flex flex-col h-[calc(100vh-160px)]">
        <!-- Header -->
        <div
          class="border-b border-slate-200 bg-white px-6 py-4 flex-shrink-0 flex items-center justify-between"
        >
          <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors cursor-pointer"
            (click)="cancelled.emit()"
            aria-label="Fechar modal"
          >
            <app-icon [name]="'x'" [size]="22" [className]="'text-gray-500'"></app-icon>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-6">
          <ng-content select="[modal-content]"></ng-content>
        </div>

        <!-- Footer -->
        <div
          class="border-t border-slate-200 bg-white px-6 py-4 flex-shrink-0 flex justify-end gap-3"
        >
          <button
            type="button"
            class="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
            (click)="cancelled.emit()"
          >
            {{ cancelButtonText() }}
          </button>
          <button
            type="button"
            [attr.form]="formId()"
            [disabled]="isLoading()"
            class="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium disabled:opacity-50 transition-colors"
          >
            {{ isLoading() ? loadingText() : submitButtonText() }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  readonly title = input<string>('');
  readonly submitButtonText = input<string>('Salvar');
  readonly cancelButtonText = input<string>('Cancelar');
  readonly loadingText = input<string>('Salvando...');
  readonly isLoading = input<boolean>(false);
  readonly formId = input<string>('');

  readonly cancelled = output<void>();
}
