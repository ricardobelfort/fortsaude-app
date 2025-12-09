import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

interface ErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  /**
   * Handle HTTP errors globally
   */
  handleHttpError(error: HttpErrorResponse): void {
    const errorData = error.error as ErrorResponse;
    const status = error.status;
    const message = this.extractErrorMessage(errorData, status);

    // Log error for debugging
    console.error('HTTP Error:', {
      status,
      message,
      error: error.error,
    });

    // Handle specific status codes
    switch (status) {
      case 400:
        this.handleBadRequest(errorData);
        break;
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        this.handleForbidden();
        break;
      case 404:
        this.showErrorToast('Recurso não encontrado');
        break;
      case 409:
        this.handleConflict(errorData);
        break;
      case 422:
        this.handleValidationError(errorData);
        break;
      case 500:
        this.handleServerError();
        break;
      case 503:
        this.handleServiceUnavailable();
        break;
      default:
        this.showErrorToast(message || 'Erro ao processar a requisição');
    }
  }

  /**
   * Handle generic errors
   */
  handleError(error: Error | string, title?: string): void {
    const message = typeof error === 'string' ? error : error.message;

    console.error('Error:', error);

    if (title) {
      this.showErrorDialog(title, message);
    } else {
      this.showErrorToast(message || 'Ocorreu um erro inesperado');
    }
  }

  /**
   * Show success toast notification
   */
  showSuccess(message: string): void {
    this.toastr.success(message, 'Sucesso', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  }

  /**
   * Show info toast notification
   */
  showInfo(message: string): void {
    this.toastr.info(message, 'Informação', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  }

  /**
   * Show warning toast notification
   */
  showWarning(message: string): void {
    this.toastr.warning(message, 'Aviso', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
    });
  }

  /**
   * Show error toast notification
   */
  showErrorToast(message: string): void {
    this.toastr.error(message, 'Erro', {
      timeOut: 5000,
      positionClass: 'toast-top-right',
    });
  }

  /**
   * Show error dialog with SweetAlert2
   */
  showErrorDialog(title: string, message: string): void {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3f51b5',
    });
  }

  /**
   * Show confirmation dialog
   */
  async showConfirmation(
    title: string,
    message: string,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'warning',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#3f51b5',
      cancelButtonColor: '#6c757d',
    });

    return result.isConfirmed;
  }

  /**
   * Show success dialog
   */
  showSuccessDialog(title: string, message = ''): void {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3f51b5',
    });
  }

  /**
   * Private methods
   */

  private handleBadRequest(errorData: ErrorResponse): void {
    const message = errorData.message || 'Dados inválidos. Verifique o formulário.';

    if (errorData.errors) {
      // Handle validation errors
      const errorMessages = Object.entries(errorData.errors)
        .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
        .join('\n');

      this.showErrorDialog('Erro de Validação', errorMessages);
    } else {
      this.showErrorToast(message);
    }
  }

  private handleUnauthorized(): void {
    this.showErrorToast('Sessão expirada. Faça login novamente.');
    // Redirect to login after a short delay
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  private handleForbidden(): void {
    this.showErrorToast('Você não tem permissão para acessar este recurso.');
  }

  private handleConflict(errorData: ErrorResponse): void {
    const message = errorData.message || 'Conflito: O recurso já existe ou foi modificado.';
    this.showErrorToast(message);
  }

  private handleValidationError(errorData: ErrorResponse): void {
    const message = errorData.message || 'Erro de validação. Verifique os dados.';

    if (errorData.errors) {
      const errorMessages = Object.entries(errorData.errors)
        .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
        .join('\n');

      this.showErrorDialog('Erro de Validação', errorMessages);
    } else {
      this.showErrorToast(message);
    }
  }

  private handleServerError(): void {
    this.showErrorDialog(
      'Erro no Servidor',
      'Ocorreu um erro ao processar sua requisição. Tente novamente mais tarde.'
    );
  }

  private handleServiceUnavailable(): void {
    this.showErrorDialog(
      'Serviço Indisponível',
      'O serviço está temporariamente indisponível. Tente novamente em alguns momentos.'
    );
  }

  private extractErrorMessage(errorData: ErrorResponse, status: number): string {
    if (typeof errorData === 'string') {
      return errorData;
    }

    if (errorData?.message) {
      return errorData.message;
    }

    if (errorData?.error) {
      return errorData.error;
    }

    // Default messages by status code
    const defaultMessages: Record<number, string> = {
      400: 'Solicitação inválida',
      401: 'Não autorizado',
      403: 'Acesso proibido',
      404: 'Recurso não encontrado',
      409: 'Conflito',
      422: 'Erro de validação',
      500: 'Erro interno do servidor',
      503: 'Serviço indisponível',
    };

    return defaultMessages[status] || 'Erro desconhecido';
  }
}
