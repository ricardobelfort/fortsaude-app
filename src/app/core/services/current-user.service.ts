import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models';

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
    return this.hasRole(UserRole.CLINIC_ADMIN);
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
}
