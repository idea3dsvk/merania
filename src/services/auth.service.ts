import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole, UserCredentials } from '../models';

// Predefined user accounts
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' as UserRole },
  { username: 'moderator', password: 'mod123', role: 'moderator' as UserRole }
];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'current-user';
  
  // Current authenticated user
  private _currentUser = signal<User | null>(this.loadUserFromStorage());
  
  // Read-only access to current user
  public readonly currentUser = this._currentUser.asReadonly();
  
  // Computed: is user authenticated
  public readonly isAuthenticated = computed(() => this._currentUser() !== null);
  
  // Computed: current user role
  public readonly currentRole = computed(() => this._currentUser()?.role || null);

  constructor() {}

  /**
   * Load user from localStorage on service initialization
   */
  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
    return null;
  }

  /**
   * Save current user to localStorage
   */
  private saveUserToStorage(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  /**
   * Attempt to login with username and password
   * Returns true if successful, false otherwise
   */
  login(credentials: UserCredentials): boolean {
    const user = USERS.find(
      u => u.username === credentials.username && u.password === credentials.password
    );
    
    if (user) {
      const authenticatedUser: User = {
        username: user.username,
        role: user.role
      };
      this._currentUser.set(authenticatedUser);
      this.saveUserToStorage(authenticatedUser);
      return true;
    }
    
    return false;
  }

  /**
   * Logout current user
   */
  logout(): void {
    this._currentUser.set(null);
    this.saveUserToStorage(null);
  }

  /**
   * Get current user (returns signal value)
   */
  getCurrentUser(): User | null {
    return this._currentUser();
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this._currentUser();
    return user !== null && user.role === role;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if current user is moderator
   */
  isModerator(): boolean {
    return this.hasRole('moderator');
  }

  /**
   * Check if current user can delete measurements
   * Only admin can delete
   */
  canDelete(): boolean {
    return this.isAdmin();
  }

  /**
   * Check if current user can edit limits
   * Only admin can edit limits
   */
  canEditLimits(): boolean {
    return this.isAdmin();
  }

  /**
   * Check if current user can add/edit measurements
   * Both admin and moderator can add/edit
   */
  canAddOrEdit(): boolean {
    return this.isAuthenticated();
  }
}
