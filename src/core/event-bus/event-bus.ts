/**
 * Event Bus for inter-module communication
 * Implements observer pattern for decoupled module communication
 */

type EventHandler = (data: any) => void;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   */
  subscribe(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.unsubscribe(event, handler);
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any): void {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }

  /**
   * Clear all handlers for an event
   */
  clear(event: string): void {
    this.handlers.delete(event);
  }

  /**
   * Clear all handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();

// Common event types
export const Events = {
  // Context events
  CONTEXT_CHANGED: 'context:changed',
  
  // Module events
  MODULE_ENABLED: 'module:enabled',
  MODULE_DISABLED: 'module:disabled',
  MODULE_CONFIG_UPDATED: 'module:configUpdated',
  
  // Data events
  DATA_CHANGED: 'data:changed',
  SYNC_STARTED: 'sync:started',
  SYNC_COMPLETED: 'sync:completed',
  SYNC_ERROR: 'sync:error',
  
  // Auth events
  AUTH_CHANGED: 'auth:changed',
  USER_LOGGED_IN: 'auth:loggedIn',
  USER_LOGGED_OUT: 'auth:loggedOut',
  
  // AI events
  AI_ACTION_STARTED: 'ai:actionStarted',
  AI_ACTION_COMPLETED: 'ai:actionCompleted',
  AI_ACTION_ERROR: 'ai:actionError',
} as const;
