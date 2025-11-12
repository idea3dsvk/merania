import { Injectable, signal } from '@angular/core';
import { ToastService } from './toast.service';

export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private _errors = signal<AppError[]>([]);
  public readonly errors = this._errors.asReadonly();

  constructor(private toastService: ToastService) {
    // Global error handler
    this.setupGlobalErrorHandler();
  }

  private setupGlobalErrorHandler(): void {
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message));
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason));
    });
  }

  handleError(error: Error | string, showToast: boolean = true): void {
    const appError: AppError = {
      message: typeof error === 'string' ? error : error.message,
      code: (error as any)?.code,
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: new Date(),
    };

    this._errors.update(errors => [...errors, appError]);
    
    console.error('[ErrorHandler]', appError);

    if (showToast) {
      this.toastService.error(appError.message, 5000);
    }
  }

  clearErrors(): void {
    this._errors.set([]);
  }

  wrapAsync<T>(fn: () => Promise<T>, errorMessage?: string): Promise<T | undefined> {
    return fn().catch((error) => {
      this.handleError(errorMessage || error);
      return undefined;
    });
  }

  wrapSync<T>(fn: () => T, errorMessage?: string): T | undefined {
    try {
      return fn();
    } catch (error) {
      this.handleError(errorMessage || (error as Error));
      return undefined;
    }
  }
}
