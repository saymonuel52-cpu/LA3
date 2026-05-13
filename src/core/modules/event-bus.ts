/**
 * Event Bus — Шина событий для межмодульной коммуникации
 * 
 * Философия:
 * - Модули общаются через события, не зная друг о друге
 * - Типизированные события для type-safety
 * - Асинхронное выполнение с обработкой ошибок
 */

import { ModuleEvent } from './types';
import { SyncEvent } from '../sync/types';

type AnyEvent = ModuleEvent | SyncEvent;

class TypedEventBus {
  private listeners: Map<AnyEvent['type'], Set<(event: AnyEvent) => void | Promise<void>>> = new Map();

  /**
   * Подписаться на событие
   * @returns Функция для отписки
   */
  subscribe(eventType: AnyEvent['type'], listener: (event: AnyEvent) => void | Promise<void>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    const set = this.listeners.get(eventType)!;
    set.add(listener);
    
    // Возвращаем функцию для отписки (cleanup)
    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Опубликовать событие
   */
  publish(event: AnyEvent): void {
    const listeners = this.listeners.get(event.type);
    if (!listeners) return;
    
    // Асинхронное выполнение всех слушателей с обработкой ошибок
    for (const listener of listeners) {
      try {
        const result = listener(event);
        // Если вернули Promise, ловим ошибки незаметно для пользователя
        if (result instanceof Promise) {
          result.catch(error => {
            if (process.env.NODE_ENV === 'development') {
              console.error(`[EventBus] Error in listener for ${event.type}:`, error);
            }
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`[EventBus] Error in listener for ${event.type}:`, error);
        }
      }
    }
  }

  /**
   * Очистить все подписки
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Получить количество слушателей (для отладки)
   */
  getListenerCount(eventType?: AnyEvent['type']): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0;
    }
    return Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0);
  }
}

// Singleton instance
export const eventBus: TypedEventBus = new TypedEventBus();

// Dev-only: глобальный доступ для отладки
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__lad_eventBus = eventBus;
}
