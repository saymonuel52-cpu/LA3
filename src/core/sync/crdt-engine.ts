/**
 * CRDT Engine — Обёртка над Yjs для Local-First синхронизации
 * 
 * Философия:
 * - Yjs обеспечивает бесконфликтную синхронизацию через CRDT
 * - Локальное хранение в IndexedDB для офлайн-работы
 * - Поддержка multiple providers (Supabase, WebRTC, File)
 */

import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { CRDTDocument, CRDTProvider, YjsUpdate } from './types';
import { eventBus } from '../modules/event-bus';

/**
 * Обёртка над Yjs документом для единого интерфейса
 */
export class YjsDocument implements CRDTDocument {
  public readonly doc: Y.Doc;
  public readonly guid: string;
  private providers: Map<string, CRDTProvider> = new Map();
  private localPersistence: IndexeddbPersistence | null = null;

  constructor(guid: string, options?: { offline?: boolean }) {
    this.guid = guid;
    this.doc = new Y.Doc({ guid });

    // Локальное сохранение для офлайн-работы
    if (options?.offline !== false) {
      this.localPersistence = new IndexeddbPersistence(`lad3-yjs-${guid}`, this.doc);
      this.setupLocalPersistence();
    }
  }

  private setupLocalPersistence(): void {
    if (!this.localPersistence) return;

    this.localPersistence.on('synced', () => {
      eventBus.publish({
        type: 'sync_completed',
        payload: {
          direction: 'pull',
          success: true,
          changesApplied: 0,
          conflictsDetected: 0,
          conflictsResolved: 0,
          duration: 0,
        }
      });
    });

    this.localPersistence.on('error', (error: Error) => {
      console.error('[YjsDocument] Local persistence error:', error);
      eventBus.publish({
        type: 'sync_error',
        payload: { error: error.message, recoverable: true }
      });
    });
  }

  getUpdate(since?: number): YjsUpdate {
    return Y.encodeStateAsUpdate(this.doc, since ? Y.encodeSnapshot(Y.snapshot(this.doc)) : undefined);
  }

  applyUpdate(update: YjsUpdate): void {
    try {
      Y.applyUpdate(this.doc, update);
    } catch (error) {
      console.error('[YjsDocument] Failed to apply update:', error);
      throw error;
    }
  }

  toJSON(): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Сериализуем все shared types
    this.doc.share.forEach((value, key) => {
      if (value instanceof Y.Map) {
        result[key] = value.toJSON();
      } else if (value instanceof Y.Array) {
        result[key] = value.toJSON();
      } else if (value instanceof Y.Text) {
        result[key] = value.toJSON();
      }
    });

    return result;
  }

  // Методы для работы с конкретными типами данных
  getMap<T = any>(name: string): Y.Map<T> {
    return this.doc.getMap(name);
  }

  getArray<T = any>(name: string): Y.Array<T> {
    return this.doc.getArray(name);
  }

  getText(name: string): Y.Text {
    return this.doc.getText(name);
  }

  // Добавление провайдера синхронизации
  addProvider(name: string, provider: CRDTProvider): void {
    this.providers.set(name, provider);
    provider.connect(this);
  }

  removeProvider(name: string): void {
    const provider = this.providers.get(name);
    if (provider) {
      provider.disconnect();
      this.providers.delete(name);
    }
  }

  // Статус
  getStatus(): Record<string, any> {
    const providers: Record<string, any> = {};
    
    for (const [name, provider] of this.providers) {
      providers[name] = provider.getStatus();
    }

    return {
      guid: this.guid,
      clients: this.doc.clientID,
      providers,
      localSynced: this.localPersistence?.synced ?? false,
    };
  }

  destroy(): void {
    for (const provider of this.providers.values()) {
      provider.disconnect();
    }
    
    this.providers.clear();
    
    if (this.localPersistence) {
      this.localPersistence.destroy();
    }
    
    this.doc.destroy();
  }
}

/**
 * Фабрика для создания документов
 */
export const createYjsDocument = (guid: string, options?: { offline?: boolean }): YjsDocument => {
  return new YjsDocument(guid, options);
};

// Dev-only глобальный доступ для отладки
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__lad_yjs = { Y, createYjsDocument };
}
