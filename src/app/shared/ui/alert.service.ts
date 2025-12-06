import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

interface AlertParams {
  title?: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly defaultButtonColor = '#2563eb';

  private fire(options: SweetAlertOptions) {
    return Swal.fire({
      confirmButtonColor: this.defaultButtonColor,
      cancelButtonColor: '#e5e7eb',
      ...options,
    });
  }

  success(message: string, title = 'Tudo certo') {
    return this.fire({ icon: 'success', title, text: message });
  }

  error(message: string, title = 'Algo deu errado') {
    return this.fire({ icon: 'error', title, text: message });
  }

  info(message: string, title = 'Informação') {
    return this.fire({ icon: 'info', title, text: message });
  }

  confirm(params: AlertParams) {
    const {
      title = 'Você tem certeza?',
      text,
      icon = 'question',
      confirmButtonText = 'Confirmar',
      cancelButtonText = 'Cancelar',
    } = params;

    return this.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
    }).then((result) => result.isConfirmed);
  }
}
