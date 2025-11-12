import { Injectable, signal, computed, inject } from '@angular/core';
import { User, UserRole, UserCredentials } from '../models';
import { FirebaseService } from './firebase.service';

// Predefined user accounts with roles
const USER_ROLES: { [email: string]: UserRole } = {
  'auotns@gmail.com': 'admin',
  'moderator@auo.com': 'moderator'
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firebaseService = inject(FirebaseService);
  private readonly STORAGE_KEY = 'current-user';
  
  // Current authenticated user
  private _currentUser = signal<User | null>(this.loadUserFromStorage());
  
  // Read-only access to current user
  public readonly currentUser = this._currentUser.asReadonly();
  
  // Computed: is user authenticated
  public readonly isAuthenticated = computed(() => this._currentUser() !== null);
  
  // Computed: current user role
  public readonly currentRole = computed(() => this._currentUser()?.role || null);

  constructor() {
    // Listen to Firebase auth state changes
    this.initializeAuthListener();
  }

  /**
   * Initialize Firebase auth listener
   */
  private initializeAuthListener(): void {
    if (this.firebaseService.isFirebaseAvailable()) {
      this.firebaseService.onAuthStateChange(async (firebaseUser) => {
        if (firebaseUser && firebaseUser.email) {
          // Try to get role from Firestore users collection
          try {
            const userDoc = await this.firebaseService.getDocument('users', firebaseUser.uid);
            const role = userDoc?.role || USER_ROLES[firebaseUser.email] || 'moderator';
            const user: User = {
              username: firebaseUser.email,
              role: role
            };
            this._currentUser.set(user);
            this.saveUserToStorage(user);
          } catch (error) {
            console.error('Error loading user role:', error);
            // Fallback to hardcoded roles
            const role = USER_ROLES[firebaseUser.email] || 'moderator';
            const user: User = {
              username: firebaseUser.email,
              role: role
            };
            this._currentUser.set(user);
            this.saveUserToStorage(user);
          }
        } else if (!firebaseUser) {
          // User signed out
          this._currentUser.set(null);
          this.saveUserToStorage(null);
        }
      });
    }
  }

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
   * Attempt to login with username (email) and password
   * Returns true if successful, false otherwise
   */
  async login(credentials: UserCredentials): Promise<boolean> {
    try {
      // Try Firebase Authentication
      if (this.firebaseService.isFirebaseAvailable()) {
        const firebaseUser = await this.firebaseService.signInWithEmail(
          credentials.username, 
          credentials.password
        );
        
        if (firebaseUser && firebaseUser.email) {
          // Try to get role from Firestore
          try {
            const userDoc = await this.firebaseService.getDocument('users', firebaseUser.uid);
            const role = userDoc?.role || USER_ROLES[firebaseUser.email] || 'moderator';
            const authenticatedUser: User = {
              username: firebaseUser.email,
              role: role
            };
            this._currentUser.set(authenticatedUser);
            this.saveUserToStorage(authenticatedUser);
            return true;
          } catch (error) {
            console.error('Error loading user role:', error);
            // Fallback to hardcoded roles
            const role = USER_ROLES[firebaseUser.email] || 'moderator';
            const authenticatedUser: User = {
              username: firebaseUser.email,
              role: role
            };
            this._currentUser.set(authenticatedUser);
            this.saveUserToStorage(authenticatedUser);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      if (this.firebaseService.isFirebaseAvailable()) {
        await this.firebaseService.signOutUser();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
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
