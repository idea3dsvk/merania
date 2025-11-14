import { Component, ChangeDetectionStrategy, signal, inject, computed, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HistoryViewComponent } from './components/history-view/history-view.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { SpecificationsViewComponent } from './components/specifications-view/specifications-view.component';
import { TrendChartsComponent } from './components/trend-charts/trend-charts.component';
import { ImportExportComponent } from './components/import-export/import-export.component';
import { AuditTrailComponent } from './components/audit-trail/audit-trail.component';
import { QRManagerComponent } from './components/qr-manager/qr-manager.component';
import { QRScannerComponent } from './components/qr-scanner/qr-scanner.component';
import { LoginComponent } from './components/login/login.component';
import { ToastComponent } from './components/toast/toast.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { TranslationService } from './services/translation.service';
import { AuthService } from './services/auth.service';
import { Language } from './translations';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first } from 'rxjs/operators';
import { concat, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardComponent, HistoryViewComponent, StatisticsComponent, SpecificationsViewComponent, TrendChartsComponent, ImportExportComponent, AuditTrailComponent, QRManagerComponent, QRScannerComponent, LoginComponent, ToastComponent, TranslatePipe],
})
export class AppComponent {
  private swUpdate = inject(SwUpdate);
  private appRef = inject(ApplicationRef);
  activeView = signal<'dashboard' | 'history' | 'statistics' | 'charts' | 'importExport' | 'auditTrail' | 'qrManager' | 'qrScanner' | 'specifications'>('dashboard');
  mobileMenuOpen = signal<boolean>(false);
  translationService = inject(TranslationService);
  authService = inject(AuthService);
  
  // Computed: check if user is authenticated
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());

  constructor() {
    // Check for service worker updates
    if (this.swUpdate.isEnabled) {
      // Check for updates every 6 hours
      const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
      const everySixHours$ = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
      
      everySixHoursOnceAppIsStable$.subscribe(() => this.swUpdate.checkForUpdate());

      // Handle version updates
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          if (confirm('New version available. Load new version?')) {
            window.location.reload();
          }
        });
    }
  }

  setView(view: 'dashboard' | 'history' | 'statistics' | 'charts' | 'importExport' | 'auditTrail' | 'qrManager' | 'qrScanner' | 'specifications'): void {
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