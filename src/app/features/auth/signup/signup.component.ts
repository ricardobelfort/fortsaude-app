import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { IconComponent } from '../../../shared/ui/icon.component';
import { signal } from '@angular/core';

@Component({
  selector: 'app-signup',
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
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Criar Conta</h3>
            <p class="text-gray-600 mb-8">Preencha os dados para se registrar</p>

            <!-- Signup Form -->
            <form [formGroup]="signupForm" (ngSubmit)="onSignup()" class="space-y-4">
              <!-- Full Name Field -->
              <div>
                <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2"
                  >Nome Completo</label
                >
                <input
                  id="fullName"
                  type="text"
                  formControlName="fullName"
                  class="fs-input"
                  placeholder="Seu nome completo"
                />
                @if (fullName.invalid && fullName.touched) {
                  <div class="text-red-600 text-xs mt-1.5 font-medium">
                    @if (fullName.errors?.['required']) {
                      <span>Nome é obrigatório</span>
                    }
                    @if (fullName.errors?.['minlength']) {
                      <span>Mínimo de 3 caracteres</span>
                    }
                  </div>
                }
              </div>

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

              <!-- Password Field -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2"
                  >Senha</label
                >
                <div class="relative">
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    class="fs-input pl-10 pr-10"
                    placeholder="Sua senha (mínimo 6 caracteres)"
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
                  <div class="text-red-600 text-xs mt-1.5 font-medium'">
                    @if (password.errors?.['required']) {
                      <span>Senha é obrigatória</span>
                    }
                    @if (password.errors?.['minlength']) {
                      <span>Mínimo de 6 caracteres</span>
                    }
                  </div>
                }
              </div>

              <!-- Confirm Password Field -->
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2"
                  >Confirmar Senha</label
                >
                <div class="relative">
                  <input
                    id="confirmPassword"
                    [type]="showConfirmPassword() ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    class="fs-input pl-10 pr-10"
                    placeholder="Confirme sua senha"
                  />
                  <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <app-icon [name]="'lock'" [size]="16" [className]="'text-base'"></app-icon>
                  </div>
                  <button
                    type="button"
                    (click)="toggleConfirmPasswordVisibility()"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition cursor-pointer p-1"
                  >
                    <app-icon
                      [name]="showConfirmPassword() ? 'eye-off' : 'eye'"
                      [size]="16"
                      [className]="'text-lg'"
                    ></app-icon>
                  </button>
                </div>
                @if (confirmPassword.invalid && confirmPassword.touched) {
                  <div class="text-red-600 text-xs mt-1.5 font-medium'">
                    @if (confirmPassword.errors?.['required']) {
                      <span>Confirmação de senha é obrigatória</span>
                    }
                    @if (confirmPassword.errors?.['passwordMismatch']) {
                      <span>As senhas não correspondem</span>
                    }
                  </div>
                }
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="fs-button-primary w-full mt-6"
                [disabled]="signupForm.invalid || isLoading()"
              >
                <span *ngIf="isLoading(); else signupLabel">Criando conta...</span>
                <ng-template #signupLabel>Criar Conta</ng-template>
              </button>
            </form>

            <!-- Login Link -->
            <div class="mt-8 pt-8 border-t border-gray-200 text-center">
              <p class="text-sm text-gray-700">
                Já tem conta?
                <button
                  type="button"
                  (click)="navigateToLogin()"
                  class="text-blue-600 hover:text-blue-700 transition font-medium cursor-pointer"
                >
                  Fazer login
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
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly signupForm = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  private readonly fullNameControl = this.signupForm.get('fullName');
  private readonly emailControl = this.signupForm.get('email');
  private readonly passwordControl = this.signupForm.get('password');
  private readonly confirmPasswordControl = this.signupForm.get('confirmPassword');

  readonly fullName = this.fullNameControl!;
  readonly email = this.emailControl!;
  readonly password = this.passwordControl!;
  readonly confirmPassword = this.confirmPasswordControl!;

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onSignup(): void {
    if (this.signupForm.invalid) return;

    this.isLoading.set(true);
    this.fullNameControl?.disable();
    this.emailControl?.disable();
    this.passwordControl?.disable();
    this.confirmPasswordControl?.disable();

    const { fullName, email, password } = this.signupForm.value;

    if (!fullName || !email || !password) {
      this.enableControls();
      this.isLoading.set(false);
      return;
    }

    // TODO: Chamar API de registro quando disponível
    // Por enquanto, apenas simular
    setTimeout(() => {
      this.enableControls();
      this.isLoading.set(false);
      this.errorHandler.showSuccess('Conta criada com sucesso! Faça login para continuar.');
      setTimeout(() => this.router.navigate(['/auth/login']), 1500);
    }, 1500);
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }

    return null;
  }

  private enableControls(): void {
    this.fullNameControl?.enable();
    this.emailControl?.enable();
    this.passwordControl?.enable();
    this.confirmPasswordControl?.enable();
  }
}
