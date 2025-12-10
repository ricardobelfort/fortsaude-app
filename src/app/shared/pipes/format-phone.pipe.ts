import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPhone',
  standalone: true,
})
export class FormatPhonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Remove non-digits
    const digits = value.replace(/\D/g, '');

    // Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (digits.length === 11) {
      // Cell phone: (XX) XXXXX-XXXX
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (digits.length === 10) {
      // Landline: (XX) XXXX-XXXX
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return value;
  }
}
