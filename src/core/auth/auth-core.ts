/**
 * Authentication Core for LAD 2
 * Handles user authentication and session management
 */

import { eventBus, Events } from '../event-bus/event-bus';

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export class AuthCore {
  private static instance: AuthCore;
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: true,
  };
  private listeners: Set<(state: AuthState) => void> = new Set();

  private constructor() {}

  static getInstance(): AuthCore {
    if (!AuthCore.instance) {
      AuthCore.instance = new AuthCore();
    }
    return AuthCore.instance;
  }

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update auth state
   */
  private updateState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<void> {
    this.updateState({ loading: true });
    
    try {
      // Simulate authentication - replace with actual auth logic
      const user: User = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        created_at: new Date().toISOString(),
      };

      localStorage.setItem('lad2_user', JSON.stringify(user));
      
      this.updateState({
        isAuthenticated: true,
        user,
        loading: false,
      });

      eventBus.emit(Events.USER_LOGGED_IN, { user });
    } catch (error) {
      this.updateState({ loading: false });
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    localStorage.removeItem('lad2_user');
    
    this.updateState({
      isAuthenticated: false,
      user: null,
    });

    eventBus.emit(Events.USER_LOGGED_OUT, {});
  }

  /**
   * Restore session from localStorage
   */
  restoreSession(): void {
    const stored = localStorage.getItem('lad2_user');
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        this.updateState({
          isAuthenticated: true,
          user,
          loading: false,
        });
      } catch {
        this.updateState({ loading: false });
      }
    } else {
      this.updateState({ loading: false });
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.state.user;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.state.user?.id ?? null;
  }
}

// Export singleton instance
export const authCore = AuthCore.getInstance();
