/**
 * Context Engine for LAD 2
 * Manages current context (Home/Work/Study) and adapts UI accordingly
 */

import { eventBus, Events } from '../event-bus/event-bus';

export type ContextType = 'home' | 'work' | 'study';

export interface ContextConfig {
  id: ContextType;
  name: string;
  icon: string;
  color: string;
  theme: string;
  defaultModule: string;
  visibleModules: string[];
}

export class ContextEngine {
  private static instance: ContextEngine;
  private currentContext: ContextType = 'home';
  private contexts: Map<ContextType, ContextConfig> = new Map();

  private constructor() {
    this.initializeContexts();
  }

  static getInstance(): ContextEngine {
    if (!ContextEngine.instance) {
      ContextEngine.instance = new ContextEngine();
    }
    return ContextEngine.instance;
  }

  private initializeContexts(): void {
    this.contexts.set('home', {
      id: 'home',
      name: 'Дом',
      icon: '🏠',
      color: '#3b82f6',
      theme: 'blue',
      defaultModule: 'dashboard',
      visibleModules: ['dashboard', 'tasks', 'calendar', 'finance', 'notes', 'health'],
    });

    this.contexts.set('work', {
      id: 'work',
      name: 'Работа',
      icon: '💼',
      color: '#10b981',
      theme: 'green',
      defaultModule: 'dashboard',
      visibleModules: ['dashboard', 'tasks', 'calendar', 'crm', 'mail', 'notes'],
    });

    this.contexts.set('study', {
      id: 'study',
      name: 'Учеба',
      icon: '📚',
      color: '#8b5cf6',
      theme: 'purple',
      defaultModule: 'dashboard',
      visibleModules: ['dashboard', 'tasks', 'calendar', 'notes'],
    });
  }

  /**
   * Get current context
   */
  getCurrentContext(): ContextType {
    return this.currentContext;
  }

  /**
   * Get context configuration
   */
  getContextConfig(context: ContextType): ContextConfig | undefined {
    return this.contexts.get(context);
  }

  /**
   * Get all contexts
   */
  getAllContexts(): ContextConfig[] {
    return Array.from(this.contexts.values());
  }

  /**
   * Switch to a different context
   */
  switchContext(newContext: ContextType): void {
    if (!this.contexts.has(newContext)) {
      console.error(`Context "${newContext}" does not exist`);
      return;
    }

    this.currentContext = newContext;
    
    // Persist to localStorage
    localStorage.setItem('lad2_context', newContext);
    
    // Emit event
    eventBus.emit(Events.CONTEXT_CHANGED, { context: newContext });
  }

  /**
   * Check if a module is visible in current context
   */
  isModuleVisible(moduleId: string): boolean {
    const config = this.contexts.get(this.currentContext);
    return config?.visibleModules.includes(moduleId) ?? false;
  }

  /**
   * Get default module for current context
   */
  getDefaultModule(): string {
    const config = this.contexts.get(this.currentContext);
    return config?.defaultModule ?? 'dashboard';
  }

  /**
   * Restore context from storage
   */
  restoreContext(): void {
    const stored = localStorage.getItem('lad2_context') as ContextType;
    if (stored && this.contexts.has(stored)) {
      this.currentContext = stored;
    }
  }
}

// Export singleton instance
export const contextEngine = ContextEngine.getInstance();
