import { Routes } from '@angular/router';

export const PROFESSIONALS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./professionals-list/professionals-list.component').then(
        (m) => m.ProfessionalsListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./professional-detail/professional-detail.component').then(
        (m) => m.ProfessionalDetailComponent
      ),
  },
];
