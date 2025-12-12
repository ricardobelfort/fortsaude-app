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
        <!-- Card Container using DaisyUI -->
        <div class="bg-white shadow-sm rounded-2xl">
          <div class="card-body p-12">
            <!-- Logo/Branding -->
            <div class="mb-3 text-center ">
              <img
                src="assets/images/logo-transparent.png"
                alt="Heartbeat Logo"
                width="120"
                class="mx-auto mb-2"
              />
            </div>

            <!-- Welcome Message -->
            <h3 class="text-2xl font-bold text-gray-900">Acesse sua conta</h3>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-3">
              <!-- Email Field -->
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text font-medium text-gray-700">E-mail</span>
                </label>
                <div class="relative">
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="input input-md w-full"
                    [class.input-error]="email.invalid && email.touched"
                    placeholder="seu@email.com"
                  />
                </div>
                @if (email.invalid && email.touched) {
                  <label class="label">
                    <span class="label-text-alt text-error font-medium">
                      @if (email.errors?.['required']) {
                        <span>E-mail é obrigatório</span>
                      }
                      @if (email.errors?.['email']) {
                        <span>E-mail inválido</span>
                      }
                    </span>
                  </label>
                }
              </div>

              <!-- Password Field -->
              <div class="form-control w-full">
                <label for="password" class="label p-0">
                  <span class="label-text font-medium text-gray-700">Senha</span>
                </label>
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    class="input input-md w-full"
                    [class.input-error]="password.invalid && password.touched"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    (click)="togglePasswordVisibility()"
                    class="absolute right-3 top-2 text-gray-500 hover:text-gray-700 transition cursor-pointer p-1 z-10"
                  >
                    <app-icon
                      [name]="showPassword() ? 'eye-off' : 'eye'"
                      [size]="16"
                      [className]="'text-base'"
                    ></app-icon>
                  </button>
                </div>
                @if (password.invalid && password.touched) {
                  <label class="label">
                    <span class="label-text-alt text-error font-medium">
                      @if (password.errors?.['required']) {
                        <span>Senha é obrigatória</span>
                      }
                      @if (password.errors?.['minlength']) {
                        <span>Mínimo de 6 caracteres</span>
                      }
                    </span>
                  </label>
                }
                <div class="flex justify-end mt-2">
                  <button
                    type="button"
                    (click)="navigateToForgotPassword()"
                    class="link link-primary link-hover"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              </div>

              <!-- Terms and Conditions - TODO: Backend ainda não implementou -->
              <!-- <div class="form-control">
                <label class="label cursor-pointer justify-start gap-3 mt-3">
                  <input
                    type="checkbox"
                    formControlName="acceptTerms"
                    class="checkbox checkbox-sm checkbox-primary"
                  />
                  <span class="label-text text-gray-700">
                    Eu concordo com os
                    <button
                      type="button"
                      (click)="navigateToTerms()"
                      class="link link-primary link-hover font-medium"
                    >
                      termos e condições
                    </button>
                  </span>
                </label>
                @if (acceptTerms.invalid && acceptTerms.touched) {
                  <label class="label">
                    <span class="label-text-alt text-error font-medium">
                      Você deve concordar com os termos e condições
                    </span>
                  </label>
                }
              </div> -->

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary w-full mt-2"
                [disabled]="loginForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <span class="loading loading-spinner loading-sm"></span>
                  Entrando...
                } @else {
                  <app-icon
                    [name]="'login'"
                    [size]="20"
                    [className]="'inline-block mr-2 align-middle'"
                  ></app-icon>
                  Entrar
                }
              </button>
            </form>

            <!-- Sign Up -->
            <div class="mt-4 pt-5 border-t border-gray-200 text-center">
              <p class="text-sm text-gray-700">
                Não tem uma conta?
                <button
                  type="button"
                  (click)="navigateToSignup()"
                  class="link link-primary font-medium"
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
    // acceptTerms: [false, [Validators.requiredTrue]], // TODO: Backend ainda não implementou
  });

  private readonly emailControl = this.loginForm.get('email');
  private readonly passwordControl = this.loginForm.get('password');
  // private readonly acceptTermsControl = this.loginForm.get('acceptTerms'); // TODO: Backend ainda não implementou

  readonly email = this.emailControl!;
  readonly password = this.passwordControl!;
  // readonly acceptTerms = this.acceptTermsControl!; // TODO: Backend ainda não implementou

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  navigateToTerms(): void {
    this.router.navigate(['/auth/terms']);
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
