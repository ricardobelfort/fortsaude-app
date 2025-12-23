import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interceptor que passa requisições sem modificação
 * O backend registra automaticamente eventos de auditoria
 */
@Injectable()
export class AuditInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // O backend registra automaticamente eventos de auditoria
    // Este interceptor passa as requisições sem modificações
    return next.handle(req);
  }
}
