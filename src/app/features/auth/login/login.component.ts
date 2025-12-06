import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    PasswordModule,
    CardModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div
      class="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
    >
      <p-card class="w-full max-w-md shadow-2xl">
        <ng-template pTemplate="header">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <h1 class="text-3xl font-bold text-white mb-2">FortSaúde</h1>
            <p class="text-blue-100">Sistema de Gestão Clínica</p>
          </div>
        </ng-template>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input
              pInputText
              id="email"
              type="email"
              formControlName="email"
              class="w-full"
              placeholder="seu@email.com"
              [disabled]="isLoading()"
            />
            <div *ngIf="email.invalid && email.touched" class="text-red-600 text-sm mt-1">
              <span *ngIf="email.errors?.['required']">E-mail é obrigatório</span>
              <span *ngIf="email.errors?.['email']">E-mail inválido</span>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <p-password
              id="password"
              formControlName="password"
              [feedback]="false"
              class="w-full"
              placeholder="Sua senha"
              [disabled]="isLoading()"
            ></p-password>
            <div *ngIf="password.invalid && password.touched" class="text-red-600 text-sm mt-1">
              <span *ngIf="password.errors?.['required']">Senha é obrigatória</span>
              <span *ngIf="password.errors?.['minlength']">Mínimo de 6 caracteres</span>
            </div>
          </div>

          <p-button
            [label]="isLoading() ? 'Autenticando...' : 'Entrar'"
            type="submit"
            class="w-full"
            [loading]="isLoading()"
            [disabled]="loginForm.invalid || isLoading()"
          ></p-button>
        </form>

        <ng-template pTemplate="footer">
          <div class="text-center text-sm text-gray-600 border-t pt-4 mt-4">
            <p>Demo: use credenciais do seu sistema</p>
          </div>
        </ng-template>
      </p-card>
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
