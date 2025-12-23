import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CurrentUserService } from '@core/services/current-user.service';

/**
 * Guard para verificar permissão de visualização de logs de auditoria
 * Apenas SYSTEM_ADMIN e CLINIC_ADMIN podem acessar
 */
@Injectable({
  providedIn: 'root',
})
export class AuditGuard implements CanActivate {
  private readonly currentUserService = inject(CurrentUserService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const role = this.currentUserService.getRole();
    const allowedRoles: string[] = ['SYSTEM_ADMIN', 'CLINIC_ADMIN'];

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    // Redirecionar para account se não tiver permissão
    this.router.navigate(['/account']);
    return false;
  }
}
