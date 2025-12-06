import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users-list.component').then((m) => m.UsersListComponent),
  },
  {
    path: 'professionals',
    loadComponent: () =>
      import('./professionals/professionals-admin.component').then(
        (m) => m.ProfessionalsAdminComponent
      ),
  },
  {
    path: 'clinic-settings',
    loadComponent: () =>
      import('./clinic-settings/clinic-settings.component').then((m) => m.ClinicSettingsComponent),
  },
];
