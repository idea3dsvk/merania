import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HistoryViewComponent } from './components/history-view/history-view.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { SpecificationsViewComponent } from './components/specifications-view/specifications-view.component';
import { LoginComponent } from './components/login/login.component';
import { ToastComponent } from './components/toast/toast.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { TranslationService } from './services/translation.service';
import { AuthService } from './services/auth.service';
import { Language } from './translations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardComponent, HistoryViewComponent, StatisticsComponent, SpecificationsViewComponent, LoginComponent, ToastComponent, TranslatePipe],
})
export class AppComponent {
  activeView = signal<'dashboard' | 'history' | 'statistics' | 'specifications'>('dashboard');
  mobileMenuOpen = signal<boolean>(false);
  translationService = inject(TranslationService);
  authService = inject(AuthService);
  
  // Computed: check if user is authenticated
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());

  setView(view: 'dashboard' | 'history' | 'statistics' | 'specifications'): void {
    this.activeView.set(view);
    // Close mobile menu when navigating
    this.mobileMenuOpen.set(false);
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  setLanguage(event: Event) {
    this.translationService.setLanguage((event.target as HTMLSelectElement).value as Language);
  }
  
  onLoginSuccess(): void {
    // Login successful, user will now see main app
    this.activeView.set('dashboard');
  }
  
  async onLogout(): Promise<void> {
    await this.authService.logout();
    this.activeView.set('dashboard');
  }
}