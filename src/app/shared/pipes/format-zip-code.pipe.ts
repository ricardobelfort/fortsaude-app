import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatZipCode',
  standalone: true,
})
export class FormatZipCodePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Remove non-digits
    const digits = value.replace(/\D/g, '');

    // Format: XXXXX-XXX
    if (digits.length === 8) {
      return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    return value;
  }
}
