/**
 * Sync Engine — Основной движок синхронизации LAD 2
 * 
 * Философия:
 * - Local-First: всё работает офлайн, синхронизация фоном
 * - CRDT через Yjs: конфликты разрешаются автоматически
 * - Multi-provider: Supabase, WebRTC, File
 * - Offline queue: изменения сохраняются и отправляются при восстановлении сети
 */

import { 
  SyncEngine, 
  SyncOptions, 
  SyncResult, 
  SyncDirection, 
  SyncStatus, 
  SyncStatusInfo,
  SyncConflict,
  ConflictResolution,
  CRDTProvider 
} from './types';

import { YjsDocument, createYjsDocument } from './crdt-engine';
import { eventBus } from '../modules/event-bus';

export class SyncEngineImpl implements SyncEngine {
  private clientId: string = '';
  private options: SyncOptions = {};
  private document: YjsDocument | null = null;
  private provider: CRDTProvider | null = null;
  private status: SyncStatus = 'idle';
  private subscribers: Set<(status: SyncStatusInfo) => void> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private offlineQueue: Array<{
    entityType: string;
    entityId: string;
    operation: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
  }> = [];
  
  private entityMappers: Map<string, {
    getId: (entity: any) => string;
    toSyncable: (entity: any) => Record<string, any>;
    fromSyncable: (data: Record<string, any>) => any;
  }> = new Map();

  async initialize(clientId: string, options?: SyncOptions): Promise<void> {
    this.clientId = clientId;
    this.options = {
      autoSync: true,
      syncInterval: 30000,
      conflictStrategy: 'merge',
      excludeDemoData: true,
      compressUpdates: true,
      ...options,
    };

    // Создаём Yjs документ
    this.document = createYjsDocument('lad3-main', { offline: true });

    // Настраиваем авто-синхронизацию
    if (this.options.autoSync) {
      this.setupAutoSync();
      this.setupNetworkListener();
    }

    this.updateStatus('idle');
    console.log(`[SyncEngine] Initialized with clientId: ${clientId}`);
  }

  registerEntity<T>(
    entityType: string,
    getId: (entity: T) => string,
    toSyncable: (entity: T) => Record<string, any>,
    fromSyncable: (data: Record<string, any>) => Partial<T>
  ): void {
    this.entityMappers.set(entityType, { getId, toSyncable, fromSyncable });
    console.log(`[SyncEngine] Registered entity type: ${entityType}`);
  }

  async sync(direction: SyncDirection = 'bidirectional'): Promise<SyncResult> {
    const startTime = performance.now();
    this.updateStatus('syncing');

    eventBus.publish({
      type: 'sync_started',
      payload: { direction }
    });

    try {
      let changesApplied = 0;
      let conflictsDetected = 0;
      let conflictsResolved = 0;

      // Push: отправляем локальные изменения
      if (direction === 'push' || direction === 'bidirectional') {
        const pushResult = await this.push();
        changesApplied += pushResult.changesApplied;
        conflictsDetected += pushResult.conflictsDetected;
        conflictsResolved += pushResult.conflictsResolved;
      }

      // Pull: получаем удалённые изменения
      if (direction === 'pull' || direction === 'bidirectional') {
        const pullResult = await this.pull();
        changesApplied += pullResult.changesApplied;
        conflictsDetected += pullResult.conflictsDetected;
        conflictsResolved += pullResult.conflictsResolved;
      }

      const result: SyncResult = {
        success: true,
        direction,
        changesApplied,
        conflictsDetected,
        conflictsResolved,
        duration: performance.now() - startTime,
      };

      this.updateStatus('connected');
      eventBus.publish({
        type: 'sync_completed',
        payload: result
      });

      return result;
    } catch (error: any) {
      const result: SyncResult = {
        success: false,
        direction,
        changesApplied: 0,
        conflictsDetected: 0,
        conflictsResolved: 0,
        duration: performance.now() - startTime,
        errors: [{ entity: 'unknown', error: error.message }],
      };

      this.updateStatus('error', error.message);
      eventBus.publish({
        type: 'sync_error',
        payload: { error: error.message, recoverable: true }
      });

      return result;
    }
  }

  async pull(): Promise<SyncResult> {
    // В реальной реализации: получить обновления от провайдера и применить
    // Здесь заглушка — в реальном провайдере (Supabase/WebRTC) есть логика pull
    return {
      success: true,
      direction: 'pull',
      changesApplied: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      duration: 0,
    };
  }

  async push(): Promise<SyncResult> {
    // Отправляем офлайн-очередь
    await this.flushQueue();
    
    return {
      success: true,
      direction: 'push',
      changesApplied: this.offlineQueue.length,
      conflictsDetected: 0,
      conflictsResolved: 0,
      duration: 0,
    };
  }

  queueChange(entityType: string, entityId: string, operation: 'create' | 'update' | 'delete', data: any): void {
    // Не синхронизируем демо-данные если включена опция
    if (this.options.excludeDemoData && data.isDemo) {
      return;
    }

    const mapper = this.entityMappers.get(entityType);
    if (!mapper) {
      console.warn(`[SyncEngine] Unknown entity type: ${entityType}`);
      return;
    }

    this.offlineQueue.push({
      entityType,
      entityId,
      operation,
      data: mapper.toSyncable(data),
      timestamp: Date.now(),
    });

    eventBus.publish({
      type: 'offline_changes_queued',
      payload: { count: this.offlineQueue.length }
    });

    // Если онлайн — сразу отправляем
    if (typeof navigator !== 'undefined' && navigator.onLine && this.provider) {
      this.flushQueue().catch(console.error);
    }
  }

  async flushQueue(): Promise<void> {
    if (this.offlineQueue.length === 0 || !this.provider || !this.document) {
      return;
    }

    console.log(`[SyncEngine] Flushing ${this.offlineQueue.length} queued changes`);

    // В реальной реализации: отправить каждое изменение через провайдера
    // Здесь просто очищаем очередь (демо-логика)
    const flushed = [...this.offlineQueue];
    this.offlineQueue = [];

    eventBus.publish({
      type: 'offline_changes_flushed',
      payload: { count: flushed.length }
    });
  }

  async getConflicts(): Promise<SyncConflict[]> {
    // В реальной реализации: получить конфликты от провайдера
    // CRDT автоматически разрешает большинство конфликтов, так что их будет мало
    return [];
  }

  async resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void> {
    // Применяем разрешение конфликта
    // В реальной реализации: обновить документ и отправить на сервер
    console.log(`[SyncEngine] Resolved conflict ${conflictId}:`, resolution);
    
    eventBus.publish({
      type: 'conflict_resolved',
      payload: resolution
    });
  }

  getStatus(): SyncStatusInfo {
    return {
      status: this.status,
      lastSync: undefined, // Заполнить из истории
      pendingChanges: this.offlineQueue.length,
      provider: this.provider?.name,
    };
  }

  subscribe(callback: (status: SyncStatusInfo) => void): () => void {
    this.subscribers.add(callback);
    // Сразу вызываем с текущим статусом
    callback(this.getStatus());
    return () => {
      this.subscribers.delete(callback);
    };
  }

  setProvider(provider: CRDTProvider): void {
    if (this.document) {
      provider.connect(this.document);
    }
    this.provider = provider;
  }

  getProvider(): CRDTProvider | null {
    return this.provider;
  }

  async destroy(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (this.provider) {
      await this.provider.disconnect();
    }

    if (this.document) {
      this.document.destroy();
    }

    this.subscribers.clear();
    this.offlineQueue = [];
    this.updateStatus('idle');
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  private updateStatus(status: SyncStatus, errorMessage?: string): void {
    this.status = status;
    
    const info: SyncStatusInfo = {
      ...this.getStatus(),
      status,
      errorMessage,
    };

    for (const subscriber of this.subscribers) {
      subscriber(info);
    }
  }

  private setupAutoSync(): void {
    if (this.options.syncInterval && this.options.syncInterval > 0) {
      this.syncInterval = setInterval(() => {
        if (typeof navigator !== 'undefined' && navigator.onLine && this.status !== 'syncing') {
          this.sync().catch(console.error);
        }
      }, this.options.syncInterval);
    }
  }

  private setupNetworkListener(): void {
    const handleOnline = () => {
      console.log('[SyncEngine] Network online, flushing queue');
      this.flushQueue().catch(console.error);
      this.sync().catch(console.error);
      
      eventBus.publish({
        type: 'network_changed',
        payload: { isOnline: true }
      });
    };

    const handleOffline = () => {
      console.log('[SyncEngine] Network offline');
      this.updateStatus('offline');
      
      eventBus.publish({
        type: 'network_changed',
        payload: { isOnline: false }
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Cleanup при уничтожении
      const originalDestroy = this.destroy.bind(this);
      this.destroy = async () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        return originalDestroy();
      };
    }
  }
}

// Singleton
export const syncEngine: SyncEngine = new SyncEngineImpl();

// Dev-only глобальный доступ
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__lad_sync = syncEngine;
}
