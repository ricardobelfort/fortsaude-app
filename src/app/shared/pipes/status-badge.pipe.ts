import { Pipe, PipeTransform } from '@angular/core';

interface StatusBadge {
  text: string;
  className: string;
}

/**
 * Pipe to format status with badge styling
 * Converts status values to display text and CSS classes
 * Usage: {{ status | statusBadge }}
 */
@Pipe({
  name: 'statusBadge',
  standalone: true,
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: string | boolean): StatusBadge {
    // Handle boolean status (active/inactive)
    if (typeof status === 'boolean') {
      return status
        ? {
            text: 'Ativo',
            className:
              'inline-flex items-center gap-2 px-1 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-300',
          }
        : {
            text: 'Inativo',
            className:
              'inline-flex items-center gap-2 px-1 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300',
          };
    }

    // Handle string status (appointment statuses, etc)
    const statusMap: Record<string, StatusBadge> = {
      AGENDADO: {
        text: 'Agendado',
        className:
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-300',
      },
      CONFIRMADO: {
        text: 'Confirmado',
        className:
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-300',
      },
      COMPLETED: {
        text: 'Concluído',
        className:
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-slate-200 text-slate-700 border border-slate-300',
      },
      NO_SHOW: {
        text: 'Não Compareceu',
        className:
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300',
      },
      CANCELLED: {
        text: 'Cancelado',
        className:
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 border border-red-300',
      },
      PENDENTE: {
        text: 'Pendente',
        className:
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 border border-orange-300',
      },
    };

    return (
      statusMap[status.toUpperCase()] || {
        text: status,
        className:
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-300',
      }
    );
  }
}
