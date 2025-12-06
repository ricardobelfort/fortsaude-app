import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-professional-detail',
  standalone: true,
  template: `<p>Professional detail works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalDetailComponent {}
