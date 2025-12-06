import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { signal } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, ButtonModule],
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
                  <p-button
                    label="Esqueceu a senha?"
                    [text]="true"
                    severity="info"
                    [disabled]="true"
                    styleClass="text-sm"
                  ></p-button>
                </div>
                <input
                  id="password"
                  formControlName="password"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                  placeholder="Sua senha"
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
              <p-button
                type="submit"
                label="Entrar"
                icon="pi pi-sign-in"
                [loading]="isLoading()"
                [disabled]="loginForm.invalid || isLoading()"
                class="w-full"
              ></p-button>
            </form>

            <!-- Sign Up -->
            <div class="mt-8 pt-8 border-t border-gray-200 text-center">
              <p class="text-sm text-gray-700">
                Não tem conta?
                <p-button
                  label="Criar conta"
                  [text]="true"
                  severity="info"
                  [disabled]="true"
                ></p-button>
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

  readonly isLoading = signal(false);
  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private readonly emailControl = this.loginForm.get('email');
  private readonly passwordControl = this.loginForm.get('password');

  readonly email = this.emailControl!;
  readonly password = this.passwordControl!;

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
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Autenticação realizada com sucesso',
            life: 2000,
          });
          // Pequeno delay para mostrar o toast antes de navegar
          setTimeout(() => {
            this.router.navigate(['/app/dashboard']);
          }, 500);
        },
        error: (error: unknown) => {
          console.error('Login error:', error);
          const errorMessage = this.extractErrorMessage(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: errorMessage,
            life: 3000,
          });
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
