import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-users-list',
  standalone: true,
  template: `<p>Users admin works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {}
