/**
 * useSyncStatus — Хук для статуса синхронизации в React компонентах
 * 
 * Философия:
 * - Автоматическая подписка на изменения статуса
 * - Удобные геттеры для UI (isSyncing, isOffline, hasErrors)
 * - Force sync по требованию
 */

import { useEffect, useState } from 'react';
import { SyncStatusInfo } from '@/core/sync/types';
import { syncEngine } from '@/core/sync/sync-engine';

export const useSyncStatus = () => {
  const [status, setStatus] = useState<SyncStatusInfo>(syncEngine.getStatus());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Подписываемся на изменения статуса
    const unsub = syncEngine.subscribe((newStatus) => {
      setStatus(newStatus);
      setIsInitializing(false);
    });

    // Получаем актуальный статус сразу
    setStatus(syncEngine.getStatus());
    setIsInitializing(false);

    return unsub;
  }, []);

  const sync = async () => {
    try {
      await syncEngine.sync();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    status,
    isInitializing,
    sync,
    
    // Удобные геттеры для UI
    isSyncing: status.status === 'syncing',
    isOffline: status.status === 'offline',
    hasErrors: status.status === 'error',
    pendingChanges: status.pendingChanges,
    lastSync: status.lastSync,
  };
};
