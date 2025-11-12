import { Component, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <!-- Logo/Header -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">
            {{ 'login.title' | translate }}
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            {{ 'login.subtitle' | translate }}
          </p>
        </div>

        <!-- Login Form -->
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span class="block sm:inline">{{ errorMessage() }}</span>
            </div>
          }

          <div class="space-y-4">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                {{ 'login.username' | translate }}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                [(ngModel)]="username"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                [placeholder]="'login.usernamePlaceholder' | translate"
              />
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                {{ 'login.password' | translate }}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                [(ngModel)]="password"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                [placeholder]="'login.passwordPlaceholder' | translate"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {{ 'login.loginButton' | translate }}
            </button>
          </div>
        </form>

        <!-- Demo Credentials Info -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p class="text-xs font-semibold text-gray-700 mb-2">{{ 'login.demoAccounts' | translate }}:</p>
          <div class="text-xs text-gray-600 space-y-1">
            <p><strong>{{ 'login.admin' | translate }}:</strong> auotns&#64;gmail.com</p>
            <p><strong>{{ 'login.moderator' | translate }}:</strong> moderator&#64;auo.com</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private authService = inject(AuthService);

  username = '';
  password = '';
  errorMessage = signal<string>('');
  
  // Output event to notify parent when login is successful
  loginSuccess = output<void>();

  onSubmit(): void {
    // Clear previous error
    this.errorMessage.set('');

    // Validate inputs
    if (!this.username || !this.password) {
      this.errorMessage.set('Prosím vyplňte meno a heslo');
      return;
    }

    // Attempt login
    const success = this.authService.login({
      username: this.username,
      password: this.password
    });

    if (success) {
      // Emit success event to parent component
      this.loginSuccess.emit();
    } else {
      // Show error message
      this.errorMessage.set('Nesprávne prihlasovacie údaje');
    }
  }
}
