import { Directive, Input, ElementRef, inject } from '@angular/core';

/**
 * Directive to add loading state to save buttons
 * Usage: <button [appSaveLoading]="isLoading()">Salvar</button>
 */
@Directive({
  selector: 'button[appSaveLoading]',
  standalone: true,
})
export class SaveLoadingDirective {
  private readonly el = inject(ElementRef<HTMLButtonElement>);

  @Input()
  set appSaveLoading(isLoading: boolean) {
    if (isLoading) {
      this.el.nativeElement.disabled = true;
      this.el.nativeElement.classList.add('opacity-70');

      // Create spinner
      const spinner = document.createElement('span');
      spinner.className = 'inline-flex items-center gap-2';
      spinner.innerHTML = `
        <svg class="inline-block animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.25"></circle>
          <path d="M22 12a10 10 0 11-20 0 10 10 0 0120 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"></path>
        </svg>
        <span>${this.el.nativeElement.textContent?.trim() || 'Salvando...'}</span>
      `;

      // Store original content
      if (!this.el.nativeElement.dataset['originalContent']) {
        this.el.nativeElement.dataset['originalContent'] = this.el.nativeElement.innerHTML;
      }

      this.el.nativeElement.innerHTML = '';
      this.el.nativeElement.appendChild(spinner);
    } else {
      this.el.nativeElement.disabled = false;
      this.el.nativeElement.classList.remove('opacity-70');

      // Restore original content
      if (this.el.nativeElement.dataset['originalContent']) {
        this.el.nativeElement.innerHTML = this.el.nativeElement.dataset['originalContent'];
      }
    }
  }
}
