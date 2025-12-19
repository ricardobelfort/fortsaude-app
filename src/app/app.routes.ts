import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { UserRole } from '@core/models';
import { LoginComponent } from '@features/auth/login/login.component';
import { SignupComponent } from '@features/auth/signup/signup.component';
import { ForgotPasswordComponent } from '@features/auth/forgot-password/forgot-password.component';
import { TermsComponent } from '@features/auth/terms/terms.component';
import { UnauthorizedComponent } from '@features/error/unauthorized/unauthorized.component';
import { MainLayoutComponent } from '@core/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/app/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'signup',
        component: SignupComponent,
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
      },
      {
        path: 'terms',
        component: TermsComponent,
      },
    ],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'patients',
        loadChildren: () =>
          import('./features/patients/patients.routes').then((m) => m.PATIENTS_ROUTES),
      },
      {
        path: 'professionals',
        loadChildren: () =>
          import('./features/professionals/professionals.routes').then(
            (m) => m.PROFESSIONALS_ROUTES
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointments.component').then(
            (m) => m.AppointmentsComponent
          ),
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./features/account/account.component').then((m) => m.AccountComponent),
      },
      {
        path: 'admin',
        canActivate: [roleGuard([UserRole.CLINIC_ADMIN])],
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/app/dashboard',
  },
];
