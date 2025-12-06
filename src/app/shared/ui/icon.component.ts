import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import feather from 'feather-icons';

type FeatherIconName = keyof typeof feather.icons;

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <span class="inline-flex" [class]="className" [innerHTML]="svg" aria-hidden="true"></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input({ required: true }) name!: FeatherIconName;
  @Input() size = 20;
  @Input() strokeWidth = 1.6;
  @Input() className = '';

  constructor(private readonly sanitizer: DomSanitizer) {}

  get svg(): SafeHtml {
    const icon = feather.icons[this.name];
    if (!icon) {
      return '';
    }

    const svg = icon.toSvg({
      width: this.size,
      height: this.size,
      'stroke-width': this.strokeWidth,
    });

    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
