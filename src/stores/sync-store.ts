/**
 * Sync Store — Глобальный стейт синхронизации
 * 
 * Философия:
 * - Интеграция с Sync Engine через Zustand
 * - Персистентность настроек в localStorage
 * - Хуки для удобного использования в компонентах
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SyncStatusInfo, NetworkState } from '@/core/sync/types';
import { syncEngine } from '@/core/sync/sync-engine';

interface SyncState {
  // Статус синхронизации
  status: SyncStatusInfo;
  
  // Сетевое состояние
  network: NetworkState;
  
  // Действия
  initialize: (clientId: string) => Promise<void>;
  sync: () => Promise<void>;
  setProvider: (providerName: 'supabase' | 'webrtc' | 'file') => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      status: {
        status: 'idle',
        pendingChanges: 0,
      },
      network: {
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      },
      
      async initialize(clientId: string) {
        await syncEngine.initialize(clientId, {
          autoSync: true,
          syncInterval: 30000,
          excludeDemoData: true,
        });
        
        // Подписываемся на обновления статуса (отписка происходит при размонтировании компонента)
        syncEngine.subscribe((status) => {
          set({ status });
        });
      },
      
      async sync() {
        await syncEngine.sync();
      },
      
      setProvider(providerName) {
        // Здесь логика переключения провайдера
        // В зависимости от providerName создаём и устанавливаем соответствующий провайдер
        console.log(`[SyncStore] Setting provider: ${providerName}`);
      },
    }),
    {
      name: 'lad3-sync-prefs',
      partialize: (state) => ({
        // Сохраняем только настройки, не статус
      }),
    }
  )
);

/**
 * Хук для удобного использования статуса синхронизации в компонентах
 */
export const useSyncStatus = () => {
  const status = useSyncStore((state) => state.status);
  const network = useSyncStore((state) => state.network);
  const sync = useSyncStore((state) => state.sync);
  
  return { status, network, sync };
};
