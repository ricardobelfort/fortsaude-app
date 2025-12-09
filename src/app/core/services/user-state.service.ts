import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '../models';

/**
 * Service to manage user state globally across the application
 * Provides access to authenticated user data extracted from JWT token
 */
@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private readonly authService = inject(AuthService);

  /**
   * Get the current authenticated user
   */
  readonly currentUser = computed(() => this.authService.currentUser());

  /**
   * Get user's full name
   */
  readonly userName = computed(() => this.currentUser()?.fullName ?? '');

  /**
   * Get user's email
   */
  readonly userEmail = computed(() => this.currentUser()?.email ?? '');

  /**
   * Get user's ID
   */
  readonly userId = computed(() => this.currentUser()?.id ?? '');

  /**
   * Get user's clinic ID
   */
  readonly userClinicId = computed(() => this.currentUser()?.clinicId ?? '');

  /**
   * Get user's role
   */
  readonly userRole = computed(() => this.currentUser()?.role ?? '');

  /**
   * Check if user is authenticated
   */
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  /**
   * Get all user data
   */
  getUser(): User | null {
    return this.currentUser();
  }

  /**
   * Get user's full name
   */
  getName(): string {
    return this.userName();
  }

  /**
   * Get user's email
   */
  getEmail(): string {
    return this.userEmail();
  }

  /**
   * Get user's ID
   */
  getId(): string {
    return this.userId();
  }

  /**
   * Get user's clinic ID
   */
  getClinicId(): string {
    return this.userClinicId();
  }

  /**
   * Get user's role
   */
  getRole(): string {
    return this.userRole();
  }
}
