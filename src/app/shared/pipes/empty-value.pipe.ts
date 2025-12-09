import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to display '-' for empty, null, or undefined values
 * Usage: {{ value | emptyValue }}
 */
@Pipe({
  name: 'emptyValue',
  standalone: true,
})
export class EmptyValuePipe implements PipeTransform {
  transform(value: unknown, placeholder = '-'): string {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      return placeholder;
    }
    return String(value);
  }
}
