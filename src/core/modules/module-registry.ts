/**
 * Module Registry — Реестр модулей LAD 2
 * 
 * Философия:
 * - Динамическая регистрация модулей
 * - Lazy loading (загрузка по требованию)
 * - Проверка доступа к модулям
 * - Авто-включение core-модулей
 */

import { 
  ModuleMetadata, 
  ModuleStatus, 
  RegisteredModule, 
  ModuleRegistry,
  TimelineAdapter,
  UserState 
} from './types';

import { eventBus } from './event-bus';

class ModuleRegistryImpl implements ModuleRegistry {
  private modules: Map<string, RegisteredModule> = new Map();
  private subscribers: Set<(modules: ModuleMetadata[]) => void> = new Set();

  /**
   * Зарегистрировать модуль
   */
  register(
    metadata: ModuleMetadata, 
    loader: () => Promise<TimelineAdapter>
  ): void {
    if (this.modules.has(metadata.id)) {
      console.warn(`[ModuleRegistry] Module ${metadata.id} already registered`);
      return;
    }

    const registeredModule: RegisteredModule = {
      metadata,
      adapter: null,
      status: 'disabled',
      load: async () => {
        this.updateModuleStatus(metadata.id, 'loading');
        
        try {
          const adapter = await loader();
          const module = this.modules.get(metadata.id);
          
          if (module) {
            module.adapter = adapter;
            this.updateModuleStatus(metadata.id, 'enabled');
            
            eventBus.publish({
              type: 'module_enabled',
              payload: { moduleId: metadata.id }
            });
          }
          
          return adapter;
        } catch (error) {
          console.error(`[ModuleRegistry] Failed to load module ${metadata.id}:`, error);
          this.updateModuleStatus(metadata.id, 'error');
          throw error;
        }
      },
      unload: () => {
        const module = this.modules.get(metadata.id);
        if (module) {
          module.adapter = null;
          this.updateModuleStatus(metadata.id, 'disabled');
          
          eventBus.publish({
            type: 'module_disabled',
            payload: { moduleId: metadata.id }
          });
        }
      }
    };

    this.modules.set(metadata.id, registeredModule);
    this.notifySubscribers();
  }

  /**
   * Получить все зарегистрированные модули
   */
  getModules(): ModuleMetadata[] {
    return Array.from(this.modules.values()).map(m => m.metadata);
  }

  /**
   * Получить модуль по ID
   */
  getModule(moduleId: string): RegisteredModule | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Включить модуль
   */
  async enableModule(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    
    if (!module) {
      throw new Error(`Module ${moduleId} not found in registry`);
    }
    
    if (module.status === 'enabled') {
      return; // Уже включен
    }

    // Проверяем доступ
    const userState = this.getCurrentUserState();
    if (!this.canAccess(moduleId, userState)) {
      throw new Error(`Access denied to module ${moduleId}`);
    }

    await module.load();
    this.notifySubscribers();
  }

  /**
   * Отключить модуль
   */
  disableModule(moduleId: string): void {
    const module = this.modules.get(moduleId);
    
    if (!module || module.status === 'disabled') {
      return;
    }
    
    module.unload();
    this.notifySubscribers();
  }

  /**
   * Проверить доступ к модулю
   */
  canAccess(moduleId: string, userState: UserState): boolean {
    const module = this.modules.get(moduleId);
    if (!module) return false;
    
    const { accessType, requiresAuth, isCore } = module.metadata;
    
    // Core-модули всегда доступны
    if (isCore) return true;
    
    switch (accessType) {
      case 'free':
        return true;
        
      case 'demo':
        return !userState.isAuthenticated;
        
      case 'registration':
        return userState.isAuthenticated && userState.hasCompletedOnboarding;
        
      case 'paid':
        return userState.unlockedModules?.includes(moduleId) || false;
        
      case 'request':
        return userState.pendingRequests?.some(
          r => r.moduleId === moduleId && r.status === 'approved'
        ) || false;
        
      default:
        return false;
    }
  }

  /**
   * Подписаться на изменения реестра
   */
  subscribe(listener: (modules: ModuleMetadata[]) => void): () => void {
    this.subscribers.add(listener);
    // Сразу вызываем с текущим списком
    listener(this.getModules());
    return () => this.subscribers.delete(listener);
  }

  /**
   * Обновить статус модуля
   */
  private updateModuleStatus(moduleId: string, status: ModuleStatus): void {
    const module = this.modules.get(moduleId);
    if (module) {
      module.status = status;
    }
  }

  /**
   * Получить текущее состояние пользователя
   */
  private getCurrentUserState(): UserState {
    // В реальном приложении: импортировать селекторы из stores
    // Здесь заглушка — заменить на реальные хуки
    try {
      // Динамический импорт чтобы избежать циклических зависимостей
      const { useAuthStore } = require('@/stores/auth-store');
      const { useUserStore } = require('@/stores/user-store');
      
      const authState = useAuthStore.getState?.() || { status: 'unauthenticated', hasCompletedOnboarding: false };
      const userState = useUserStore.getState?.() || { unlockedModules: [], pendingRequests: [] };
      
      return {
        isAuthenticated: authState.status === 'authenticated',
        hasCompletedOnboarding: authState.hasCompletedOnboarding,
        unlockedModules: userState.unlockedModules || [],
        pendingRequests: userState.pendingRequests || [],
        currentContext: userState.currentContext || 'home',
      };
    } catch {
      // Fallback для тестов/серверного рендеринга
      return {
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        unlockedModules: [],
        pendingRequests: [],
        currentContext: 'home',
      };
    }
  }

  /**
   * Уведомить подписчиков об изменениях
   */
  private notifySubscribers(): void {
    const modules = this.getModules();
    
    for (const subscriber of this.subscribers) {
      try {
        subscriber(modules);
      } catch (error) {
        console.error('[ModuleRegistry] Error notifying subscriber:', error);
      }
    }
  }

  /**
   * Отладочная информация
   */
  getDebugInfo(): Record<string, any> {
    return {
      totalModules: this.modules.size,
      modules: Array.from(this.modules.entries()).map(([id, mod]) => ({
        id,
        name: mod.metadata.name,
        status: mod.status,
        hasAdapter: !!mod.adapter,
      })),
      subscriberCount: this.subscribers.size,
    };
  }
}

// Singleton
export const moduleRegistry: ModuleRegistry = new ModuleRegistryImpl();

// Dev-only глобальный доступ
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).__lad_registry = moduleRegistry;
}
