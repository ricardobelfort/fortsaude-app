import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, UserRole } from '../models';
import { environment } from '../../../environments/environment';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface JwtPayload {
  sub: string;
  clinicId: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Signals
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly refreshTokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<User | null>(null);
  private readonly isInitializedSignal = signal(false);

  // Computed values
  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());
  readonly currentUser = computed(() => this.userSignal());
  readonly isInitialized = computed(() => this.isInitializedSignal());

  constructor() {
    this.initializeAuthState();
    this.setupPersistedState();
  }

  /**
   * Initialize auth state from localStorage
   */
  private initializeAuthState(): void {
    const accessToken = this.getStoredAccessToken();
    const refreshToken = this.getStoredRefreshToken();

    if (accessToken) {
      this.accessTokenSignal.set(accessToken);

      // Decode token and set user data
      const payload = this.decodeToken(accessToken);
      if (payload) {
        const user: User = {
          id: payload.sub,
          clinicId: payload.clinicId,
          email: payload.email,
          fullName: payload.name,
          role: payload.role as UserRole,
          iat: payload.iat,
          exp: payload.exp,
        };
        this.userSignal.set(user);
      }
    }
    if (refreshToken) {
      this.refreshTokenSignal.set(refreshToken);
    }

    this.isInitializedSignal.set(true);
  }

  /**
   * Setup side effect to persist tokens to localStorage
   */
  private setupPersistedState(): void {
    effect(() => {
      const token = this.accessTokenSignal();
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    });

    effect(() => {
      const token = this.refreshTokenSignal();
      if (token) {
        localStorage.setItem('refreshToken', token);
      } else {
        localStorage.removeItem('refreshToken');
      }
    });
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, body).pipe(
      tap((response) => {
        this.accessTokenSignal.set(response.accessToken);
        this.refreshTokenSignal.set(response.refreshToken);

        // Decode JWT and extract user data
        const payload = this.decodeToken(response.accessToken);
        if (payload) {
          const user: User = {
            id: payload.sub,
            clinicId: payload.clinicId,
            email: payload.email,
            fullName: payload.name,
            role: payload.role as UserRole,
            iat: payload.iat,
            exp: payload.exp,
          };
          this.userSignal.set(user);
        }
      })
    );
  }

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken(): Observable<LoginResponse> {
    const refreshToken = this.refreshTokenSignal();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const body: RefreshTokenRequest = { refreshToken };
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/refresh`, body).pipe(
      tap((response) => {
        this.accessTokenSignal.set(response.accessToken);
        this.refreshTokenSignal.set(response.refreshToken);
      })
    );
  }

  /**
   * Get current user details from API
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/me`).pipe(
      tap((user) => {
        this.userSignal.set(user);
      })
    );
  }

  /**
   * Logout and clear auth state
   */
  logout(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.userSignal.set(null);
  }

  /**
   * Decode JWT token to extract payload
   */
  private decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const decoded = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return decoded as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }

  /**
   * Get stored access token from localStorage
   */
  private getStoredAccessToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem('accessToken');
  }

  /**
   * Get stored refresh token from localStorage
   */
  private getStoredRefreshToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem('refreshToken');
  }
}
