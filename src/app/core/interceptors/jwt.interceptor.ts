import { inject, Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { UserStateService } from '@core/services/user-state.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly userStateService = inject(UserStateService);
  private readonly router = inject(Router);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getAccessToken();
    const tenantId = this.userStateService.userClinicId();

    if (token && !this.isAuthEndpoint(request.url)) {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      // Add X-Tenant-ID header if tenant ID exists
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }

      request = request.clone({
        setHeaders: headers,
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if the request is to an auth endpoint (avoid adding token to login request)
   */
  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') || url.includes('/auth/refresh');
  }
}
