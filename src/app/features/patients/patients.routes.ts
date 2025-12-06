import { Routes } from '@angular/router';

export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./patients-list/patients-list.component').then((m) => m.PatientsListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./patient-detail/patient-detail.component').then((m) => m.PatientDetailComponent),
  },
];
