import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { IconComponent } from '../../../shared/ui/icon.component';
import { finalize } from 'rxjs';
import { signal } from '@angular/core';

@Component({
  selector: 'app-login',
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
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Bem-vindo</h3>
            <p class="text-gray-600 mb-8">Acesse sua conta para continuar</p>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5">
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
                  <div class="text-red-600 text-xs mt-1.5 font-medium">
                    @if (email.errors?.['required']) {
                      <span>E-mail é obrigatório</span>
                    }
                    @if (email.errors?.['email']) {
                      <span>E-mail inválido</span>
                    }
                  </div>
                }
              </div>

              <!-- Password Field -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <label for="password" class="block text-sm font-medium text-gray-700"
                    >Senha</label
                  >
                  <button
                    type="button"
                    (click)="navigateToForgotPassword()"
                    class="text-sm text-blue-600 hover:text-blue-700 transition cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    class="fs-input pl-10 pr-10"
                    placeholder="Sua senha"
                  />
                  <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <app-icon [name]="'lock'" [size]="16" [className]="'text-base'"></app-icon>
                  </div>
                  <button
                    type="button"
                    (click)="togglePasswordVisibility()"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition cursor-pointer p-1"
                  >
                    <app-icon
                      [name]="showPassword() ? 'eye-off' : 'eye'"
                      [size]="16"
                      [className]="'text-lg'"
                    ></app-icon>
                  </button>
                </div>
                @if (password.invalid && password.touched) {
                  <div class="text-red-600 text-xs mt-1.5 font-medium">
                    @if (password.errors?.['required']) {
                      <span>Senha é obrigatória</span>
                    }
                    @if (password.errors?.['minlength']) {
                      <span>Mínimo de 6 caracteres</span>
                    }
                  </div>
                }
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="fs-button-primary w-full"
                [disabled]="loginForm.invalid || isLoading()"
              >
                <span *ngIf="isLoading(); else loginLabel">Entrando...</span>
                <ng-template #loginLabel>Entrar</ng-template>
              </button>
            </form>

            <!-- Sign Up -->
            <div class="mt-8 pt-8 border-t border-gray-200 text-center">
              <p class="text-sm text-gray-700">
                Não tem conta?
                <button
                  type="button"
                  (click)="navigateToSignup()"
                  class="text-blue-600 hover:text-blue-700 transition font-medium"
                >
                  Criar conta
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
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private readonly emailControl = this.loginForm.get('email');
  private readonly passwordControl = this.loginForm.get('password');

  readonly email = this.emailControl!;
  readonly password = this.passwordControl!;

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    // Desabilitar controles quando está carregando
    this.emailControl?.disable();
    this.passwordControl?.disable();

    const { email, password } = this.loginForm.value;

    if (!email || !password) {
      this.emailControl?.enable();
      this.passwordControl?.enable();
      this.isLoading.set(false);
      return;
    }

    this.authService
      .login(email, password)
      .pipe(
        finalize(() => {
          this.emailControl?.enable();
          this.passwordControl?.enable();
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.errorHandler.showSuccess('Autenticação realizada com sucesso');
          setTimeout(() => this.router.navigate(['/app/dashboard']), 500);
        },
        error: (error: unknown) => {
          console.error('Login error:', error);
          const errorMessage = this.extractErrorMessage(error);
          this.errorHandler.showErrorToast(errorMessage);
        },
      });
  }

  private extractErrorMessage(error: unknown): string {
    const defaultMessage = 'E-mail ou senha incorretos';

    if (!(error instanceof Error)) {
      return defaultMessage;
    }

    const errObj = error as unknown as Record<string, unknown>;
    const errProp = errObj['error'];

    if (typeof errProp === 'object' && errProp !== null && 'message' in errProp) {
      const msgProp = (errProp as Record<string, unknown>)['message'];
      if (typeof msgProp === 'string') {
        return msgProp;
      }
    }

    return defaultMessage;
  }
}
