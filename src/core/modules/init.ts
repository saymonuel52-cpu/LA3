/**
 * Module Initialization — Инициализация модулей LAD 2
 * 
 * Философия:
 * - Lazy loading модулей (загружаются только при необходимости)
 * - Авто-включение core-модулей
 * - Динамическая регистрация
 */

import { moduleRegistry } from './module-registry';

/**
 * Динамические импорты модулей (lazy loading)
 */
const moduleLoaders: Record<string, () => Promise<any>> = {
  tasks: () => import('@/modules/tasks/tasks-module').then(m => m.createTasksModule),
  // finance: () => import('@/modules/finance/finance-module').then(m => m.createFinanceModule),
  // calendar: () => import('@/modules/calendar/calendar-module').then(m => m.createCalendarModule),
  // notes: () => import('@/modules/notes/notes-module').then(m => m.createNotesModule),
};

/**
 * Метаданные модулей
 */
const moduleMetadata = {
  tasks: {
    id: 'tasks',
    name: 'Задачи',
    description: 'Управление задачами и делами',
    version: '1.0.0',
    icon: '📋',
    color: '#8B5CF6',
    isCore: true,
    accessType: 'free' as const,
    requiresAuth: false,
    tags: ['productivity', 'core'],
  },
  // finance: { ... },
  // calendar: { ... },
};

/**
 * Инициализировать все модули
 */
export async function initializeModules(): Promise<void> {
  console.log('[Modules] Initializing...');
  
  // Регистрируем все известные модули
  for (const [moduleId, loader] of Object.entries(moduleLoaders)) {
    const metadata = moduleMetadata[moduleId as keyof typeof moduleMetadata];
    
    if (!metadata) {
      console.warn(`[Modules] No metadata for module ${moduleId}`);
      continue;
    }
    
    try {
      moduleRegistry.register(metadata, loader);
      console.log(`[Modules] Registered: ${metadata.name}`);
    } catch (error) {
      console.error(`[Modules] Failed to register ${moduleId}:`, error);
    }
  }
  
  // Авто-включение core-модулей
  const coreModules = moduleRegistry.getModules().filter(m => m.isCore);
  
  for (const module of coreModules) {
    try {
      await moduleRegistry.enableModule(module.id);
      console.log(`[Modules] Enabled core module: ${module.name}`);
    } catch (error) {
      console.error(`[Modules] Failed to enable core module ${module.id}:`, error);
    }
  }
  
  console.log('[Modules] Initialization complete');
}

// Экспорт для использования в app/layout.tsx
export { moduleRegistry };
