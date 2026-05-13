/**
 * Sync Engine Types — Типы для синхронизации LAD 2
 * 
 * Философия:
 * - Local-First: всё работает офлайн
 * - CRDT: конфликты разрешаются автоматически
 * - Multi-provider: Supabase, WebRTC, File export/import
 */

// ============================================================================
// БАЗОВЫЕ ТИПЫ СИНХРОНИЗАЦИИ
// ============================================================================

export type SyncStatus = 'idle' | 'syncing' | 'connected' | 'offline' | 'error';
export type SyncDirection = 'pull' | 'push' | 'bidirectional';
export type ConflictStrategy = 'local-wins' | 'remote-wins' | 'merge' | 'manual';

/**
 * Метаданные синхронизации для любой сущности
 */
export interface SyncMetadata {
  clientId: string;              // Уникальный ID устройства/сессии
  lastSyncedAt?: Date;           // Когда последний раз синхронизировалось
  lastModifiedAt: Date;          // Когда сущность последний раз менялась
  version: number;               // Версия для оптимистичных блокировок
  isDeleted: boolean;            // Soft delete флаг
  isDemo: boolean;               // Демо-данные не синхронизируются
}

/**
 * Конфликт синхронизации
 */
export interface SyncConflict {
  entityId: string;
  entityType: string;
  localVersion: any;
  remoteVersion: any;
  conflictType: 'update-update' | 'update-delete' | 'create-create' | 'field-conflict';
  conflictingFields: string[];
  resolvedAt?: Date;
  resolution?: ConflictResolution;
}

/**
 * Результат разрешения конфликта
 */
export interface ConflictResolution {
  strategy: ConflictStrategy;
  winner: 'local' | 'remote' | 'merged';
  mergedData?: any;
  resolvedAt: Date;
  resolvedBy: 'auto' | 'user';
}

/**
 * Статус синхронизации для UI
 */
export interface SyncStatusInfo {
  status: SyncStatus;
  lastSync?: Date;
  pendingChanges: number;        // Количество локальных изменений в очереди
  errorMessage?: string;
  provider?: string;             // Какой провайдер активен
  bytesTransferred?: {
    uploaded: number;
    downloaded: number;
  };
}

// ============================================================================
// CRDT TYPES (Yjs абстракция)
// ============================================================================

export type YjsUpdate = Uint8Array;

export interface CRDTDocument {
  guid: string;
  getUpdate(since?: number): YjsUpdate;
  applyUpdate(update: YjsUpdate): void;
  toJSON(): Record<string, any>;
  destroy(): void;
}

export interface CRDTProvider {
  name: string;
  connect(doc: CRDTDocument): Promise<void>;
  disconnect(): Promise<void>;
  on(event: 'synced' | 'error' | 'status', callback: (data: any) => void): () => void;
  getStatus(): { connected: boolean; peers?: number };
}

// ============================================================================
// SYNC ENGINE INTERFACE
// ============================================================================

export interface SyncEngine {
  // Инициализация
  initialize(clientId: string, options?: SyncOptions): Promise<void>;
  
  // Регистрация сущностей для синхронизации
  registerEntity<T>(
    entityType: string,
    getId: (entity: T) => string,
    toSyncable: (entity: T) => Record<string, any>,
    fromSyncable: (data: Record<string, any>) => Partial<T>
  ): void;
  
  // Операции синхронизации
  sync(direction?: SyncDirection): Promise<SyncResult>;
  pull(): Promise<SyncResult>;
  push(): Promise<SyncResult>;
  
  // Управление очередью офлайн-изменений
  queueChange(entityType: string, entityId: string, operation: 'create' | 'update' | 'delete', data: any): void;
  flushQueue(): Promise<void>;
  
  // Конфликты
  getConflicts(): Promise<SyncConflict[]>;
  resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void>;
  
  // Статус и события
  getStatus(): SyncStatusInfo;
  subscribe(callback: (status: SyncStatusInfo) => void): () => void;
  
  // Провайдеры
  setProvider(provider: CRDTProvider): void;
  getProvider(): CRDTProvider | null;
  
  // Очистка
  destroy(): Promise<void>;
}

export interface SyncOptions {
  autoSync?: boolean;            // Автосинхронизация при изменении сети
  syncInterval?: number;         // Интервал периодической синхронизации (мс)
  conflictStrategy?: ConflictStrategy;
  excludeDemoData?: boolean;     // Не синхронизировать демо-данные
  compressUpdates?: boolean;     // Сжимать обновления перед отправкой
}

export interface SyncResult {
  success: boolean;
  direction: SyncDirection;
  changesApplied: number;
  conflictsDetected: number;
  conflictsResolved: number;
  duration: number;              // в мс
  errors?: Array<{ entity: string; error: string }>;
}

// ============================================================================
// NETWORK TYPES
// ============================================================================

export interface NetworkState {
  isOnline: boolean;
  isSlow?: boolean;              // 2G/3G или слабый сигнал
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  downlink?: number;             // Mbps
  rtt?: number;                  // Round-trip time в мс
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type SyncEvent = 
  | { type: 'sync_started'; payload: { direction: SyncDirection } }
  | { type: 'sync_completed'; payload: SyncResult }
  | { type: 'sync_error'; payload: { error: string; recoverable: boolean } }
  | { type: 'conflict_detected'; payload: SyncConflict }
  | { type: 'conflict_resolved'; payload: ConflictResolution }
  | { type: 'offline_changes_queued'; payload: { count: number } }
  | { type: 'offline_changes_flushed'; payload: { count: number } }
  | { type: 'provider_connected'; payload: { provider: string; peers?: number } }
  | { type: 'provider_disconnected'; payload: { provider: string } }
  | { type: 'network_changed'; payload: NetworkState };
