import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center gap-1.5">
      <div class="spinner-square" style="animation-delay: 0s"></div>
      <div class="spinner-square" style="animation-delay: 0.15s"></div>
      <div class="spinner-square" style="animation-delay: 0.3s"></div>
    </div>
  `,
  styles: `
    .spinner-square {
      width: var(--spinner-size);
      height: var(--spinner-size);
      background-color: #2563eb;
      border-radius: 4px;
      animation: squareScale 1.2s ease-in-out infinite;
    }

    @keyframes squareScale {
      0%,
      100% {
        transform: scale(0.6);
        opacity: 0.4;
      }
      50% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--spinner-size.px]': 'size()',
  },
})
export class SpinnerComponent {
  size = input<number>(12);
}
