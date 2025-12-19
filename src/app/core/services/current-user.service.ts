import { inject, Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models';

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  private readonly authService = inject(AuthService);

  getFullName(): string {
    return this.authService.currentUser()?.fullName ?? 'Usuário';
  }

  getRole(): UserRole | null {
    return this.authService.currentUser()?.role ?? null;
  }

  hasRole(role: UserRole | UserRole[]): boolean {
    const userRole = this.getRole();
    if (!userRole) return false;

    if (Array.isArray(role)) {
      return role.includes(userRole);
    }

    return userRole === role;
  }

  canAccessAdmin(): boolean {
    return this.hasRole([UserRole.SYSTEM_ADMIN, UserRole.CLINIC_ADMIN]);
  }

  canAccessPatients(): boolean {
    return this.hasRole([
      UserRole.SYSTEM_ADMIN,
      UserRole.CLINIC_ADMIN,
      UserRole.RECEPTIONIST,
      UserRole.PROFESSIONAL,
    ]);
  }

  canAccessFinance(): boolean {
    return this.hasRole([UserRole.SYSTEM_ADMIN, UserRole.CLINIC_ADMIN, UserRole.FINANCE]);
  }

  canAccessAppointments(): boolean {
    return this.hasRole([
      UserRole.SYSTEM_ADMIN,
      UserRole.CLINIC_ADMIN,
      UserRole.RECEPTIONIST,
      UserRole.PROFESSIONAL,
      UserRole.PATIENT,
    ]);
  }

  canAccessProfessionals(): boolean {
    return this.hasRole([
      UserRole.SYSTEM_ADMIN,
      UserRole.CLINIC_ADMIN,
      UserRole.PATIENT,
      UserRole.RECEPTIONIST,
    ]);
  }

  canViewProfessionals(): boolean {
    return this.hasRole([UserRole.CLINIC_ADMIN, UserRole.PROFESSIONAL, UserRole.RECEPTIONIST]);
  }

  getClinicId(): string | null {
    return this.authService.currentUser()?.clinicId ?? null;
  }

  getUserId(): string | null {
    return this.authService.currentUser()?.id ?? null;
  }

  getEmail(): string | null {
    return this.authService.currentUser()?.email ?? null;
  }
}
