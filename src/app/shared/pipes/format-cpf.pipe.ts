import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format CPF/CNPJ numbers
 * CPF format: XXX.XXX.XXX-XX
 * CNPJ format: XX.XXX.XXX/XXXX-XX
 * Usage: {{ value | formatCpf }}
 */
@Pipe({
  name: 'formatCpf',
  standalone: true,
})
export class FormatCpfPipe implements PipeTransform {
  transform(value: unknown): string {
    if (!value || typeof value !== 'string') {
      return '';
    }

    // Remove non-numeric characters
    const cleanValue = value.replace(/\D/g, '');

    // Format as CPF (11 digits) or CNPJ (14 digits)
    if (cleanValue.length === 11) {
      // CPF: XXX.XXX.XXX-XX
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleanValue.length === 14) {
      // CNPJ: XX.XXX.XXX/XXXX-XX
      return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    // Return original if not CPF or CNPJ length
    return value;
  }
}
