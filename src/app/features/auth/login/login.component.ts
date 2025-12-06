import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
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
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                  placeholder="seu@email.com"
                  [disabled]="isLoading()"
                />
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
                  <a href="#" class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >Esqueceu a senha?</a
                  >
                </div>
                <input
                  id="password"
                  formControlName="password"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                  placeholder="Sua senha"
                  [disabled]="isLoading()"
                  type="password"
                />
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
                [disabled]="loginForm.invalid || isLoading()"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                @if (isLoading()) {
                  <span>Autenticando...</span>
                  <svg
                    class="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                } @else {
                  <span>Entrar</span>
                  <i class="pi pi-sign-in"></i>
                }
              </button>
            </form>

            <!-- Demo Info & Sign Up -->
            <div class="mt-8 pt-8 border-t border-gray-200 text-center">
              <p class="text-xs text-gray-600 mb-4">Demo: use credenciais do seu sistema</p>
              <p class="text-sm text-gray-700">
                Não tem conta?
                <a href="#" class="text-blue-600 hover:text-blue-700 font-semibold">Criar conta</a>
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
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  isLoading = signal(false);

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const { email, password } = this.loginForm.value;

    this.authService
      .login(email, password)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Autenticação realizada com sucesso',
            life: 2000,
          });
          this.router.navigate(['/app/dashboard']);
        },
        error: (error: unknown) => {
          console.error('Login error:', error);
          let errorMessage = 'E-mail ou senha incorretos';
          if (error instanceof Error && 'error' in error) {
            const errObj = error as Record<string, unknown>;
            const errProp = errObj['error'];
            if (typeof errProp === 'object' && errProp !== null && 'message' in errProp) {
              const msgProp = (errProp as Record<string, unknown>)['message'];
              if (typeof msgProp === 'string') {
                errorMessage = msgProp;
              }
            }
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: errorMessage,
            life: 3000,
          });
        },
      });
  }
}
