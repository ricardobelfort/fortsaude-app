import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <i [class]="iconClass" [ngClass]="className" [attr.aria-hidden]="true"></i>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() className = '';

  get iconClass(): string {
    // Map common icon names to Font Awesome classes
    const iconMap: Record<string, string> = {
      'layout': 'fas fa-th-large',
      'calendar': 'fas fa-calendar-alt',
      'users': 'fas fa-users',
      'user-check': 'fas fa-user-check',
      'grid': 'fas fa-th',
      'credit-card': 'fas fa-credit-card',
      'list': 'fas fa-list',
      'message-square': 'fas fa-comment',
      'shield': 'fas fa-shield-alt',
      'star': 'fas fa-star',
      'settings': 'fas fa-cog',
      'help-circle': 'fas fa-question-circle',
      'zap': 'fas fa-bolt',
      'log-out': 'fas fa-sign-out-alt',
      'chevrons-up': 'fas fa-chevron-up',
      'search': 'fas fa-search',
      'bell': 'fas fa-bell',
      'user-plus': 'fas fa-user-plus',
      'briefcase': 'fas fa-briefcase',
      'edit-3': 'fas fa-edit',
      'trash-2': 'fas fa-trash',
      'x': 'fas fa-times',
      'x-circle': 'fas fa-times-circle',
      'check-circle': 'fas fa-check-circle',
      'plus': 'fas fa-plus',
      'upload-cloud': 'fas fa-cloud-upload-alt',
      'download-cloud': 'fas fa-cloud-download-alt',
      'rotate-ccw': 'fas fa-redo',
      'eye': 'fas fa-eye',
      'save': 'fas fa-save',
    };

    return iconMap[this.name] || `fas fa-${this.name}`;
  }
}
