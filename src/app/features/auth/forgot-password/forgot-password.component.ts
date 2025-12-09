import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { IconComponent } from '../../../shared/ui/icon.component';
import { signal } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div
      class="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center p-6"
    >
      <div class="w-full max-w-md">
        <!-- Logo/Branding (Outside Card) -->
        <div class="mb-8 text-center">
          <h1 class="text-4xl font-bold text-blue-900">FortSaúde</h1>
          <p class="text-blue-700 mt-1">Sistema de Gestão Clínica</p>
        </div>

        <!-- Card Container -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div class="p-8">
            <!-- Welcome Message -->
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Recuperar Senha</h3>
            <p class="text-gray-600 mb-8">Digite seu e-mail para receber um link de recuperação</p>

            <!-- Forgot Password Form -->
            <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-5">
              <!-- Email Field -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2"
                  >E-mail</label
                >
                <div class="relative">
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="fs-input pl-10"
                    placeholder="seu@email.com"
                  />
                  <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <app-icon [name]="'letter'" [size]="16" [className]="'text-base'"></app-icon>
                  </div>
                </div>
                @if (email.invalid && email.touched) {
                  <div class="text-red-600 text-xs mt-1.5 font-medium'">
                    @if (email.errors?.['required']) {
                      <span>E-mail é obrigatório</span>
                    }
                    @if (email.errors?.['email']) {
                      <span>E-mail inválido</span>
                    }
                  </div>
                }
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="fs-button-primary w-full"
                [disabled]="forgotPasswordForm.invalid || isLoading()"
              >
                <span *ngIf="isLoading(); else submitLabel">Enviando...</span>
                <ng-template #submitLabel>Enviar Link de Recuperação</ng-template>
              </button>
            </form>

            <!-- Info Message -->
            @if (emailSent()) {
              <div class="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
                <p class="text-sm text-green-800">
                  Um link de recuperação foi enviado para seu e-mail. Verifique sua caixa de entrada
                  e spam.
                </p>
              </div>
            }

            <!-- Back to Login -->
            <div class="mt-8 pt-8 border-t border-gray-200 text-center">
              <p class="text-sm text-gray-700">
                <button
                  type="button"
                  (click)="navigateToLogin()"
                  class="text-blue-600 hover:text-blue-700 transition font-medium cursor-pointer"
                >
                  Voltar para login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly emailSent = signal(false);

  readonly forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  private readonly emailControl = this.forgotPasswordForm.get('email');
  readonly email = this.emailControl!;

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) return;

    this.isLoading.set(true);
    this.emailControl?.disable();

    const { email } = this.forgotPasswordForm.value;

    if (!email) {
      this.emailControl?.enable();
      this.isLoading.set(false);
      return;
    }

    // TODO: Chamar API de recuperação de senha quando disponível
    // Por enquanto, apenas simular
    setTimeout(() => {
      this.emailControl?.enable();
      this.isLoading.set(false);
      this.emailSent.set(true);
      this.errorHandler.showSuccess('Link de recuperação enviado com sucesso!');
    }, 1500);
  }
}
