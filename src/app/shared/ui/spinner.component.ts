import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <svg
      class="inline-block animate-spin"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.viewBox]="'0 0 24 24'"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.25"></circle>
      <path
        d="M22 12a10 10 0 11-20 0 10 10 0 0120 0"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        fill="none"
      ></path>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  size = input<number>(16);
}
