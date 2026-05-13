# Module Integration System — Шаг 2

## 🎯 Философия: «Модули — это плагины реальности»

**LAD 2** строится как модульная система, где каждый модуль (Задачи, Финансы, Здоровье, CRM) — это **измерение**, которое автоматически встраивается в единую временную ось (Timeline Engine).

### Ключевые принципы

1. **Timeline Adapter**: Каждый модуль реализует контракт для интеграции с календарём
2. **Event Bus**: Модули общаются через события, не зная друг о друге
3. **Lazy Loading**: Модули загружаются только при необходимости
4. **Access Control**: Разные уровни доступа (free/demo/registration/paid/request)

---

## 🏗️ Архитектура

### Module Registry (`src/core/modules/module-registry.ts`)

**Реестр модулей с динамической регистрацией:**

```typescript
class ModuleRegistryImpl implements ModuleRegistry {
  register(metadata: ModuleMetadata, loader: () => Promise<TimelineAdapter>): void
  getModules(): ModuleMetadata[]
  getModule(moduleId: string): RegisteredModule | undefined
  enableModule(moduleId: string): Promise<void>
  disableModule(moduleId: string): void
  canAccess(moduleId: string, userState: UserState): boolean
  subscribe(listener: (modules: ModuleMetadata[]) => void): () => void
}
```

**Методы:**
- `register()` — зарегистрировать модуль с метаданными и загрузчиком
- `enableModule()` — включить модуль (lazy load + проверка доступа)
- `disableModule()` — отключить модуль (unload adapter)
- `canAccess()` — проверить доступ пользователя к модулю
- `subscribe()` — подписаться на изменения реестра

### Event Bus (`src/core/modules/event-bus.ts`)

**Шина событий для межмодульной коммуникации:**

```typescript
const eventBus: EventBus = new TypedEventBus();

// Подписаться на событие
const unsubscribe = eventBus.subscribe('entity_created', (event) => {
  console.log('Новая сущность:', event.payload);
});

// Опубликовать событие
eventBus.publish({
  type: 'entity_created',
  payload: {
    entityId: '123',
    moduleId: 'tasks',
    timeEntity: { /* ... */ }
  }
});

// Отписаться
unsubscribe();
```

**Типы событий:**
- `entity_created` — создана новая сущность
- `entity_updated` — сущность обновлена
- `entity_deleted` — сущность удалена
- `time_changed` — изменено время сущности
- `module_enabled` — модуль включён
- `module_disabled` — модуль выключен
- `sync_requested` — запрос синхронизации
- `user_context_changed` — изменён контекст (дом/работа/учеба)
- `theme_changed` — изменена тема

### Timeline Adapter (`src/core/modules/types.ts`)

**Контракт для интеграции модуля с Timeline Engine:**

```typescript
export interface TimelineAdapter {
  // CRUD для сущностей модуля
  getTimelineEntities(filters: TimelineFilters): Promise<TimeEntity[]>
  createTimelineEntity(data: CreateEntityData): Promise<TimeEntity>
  updateTimelineEntity(id: string, changes: Partial<TimeEntity>): Promise<TimeEntity>
  deleteTimelineEntity(id: string): Promise<void>
  
  // Конфигурация отображения
  getDisplayConfig(): DisplayConfig
  
  // Обработчики взаимодействий
  onEntityClick(entity: TimeEntity): void
  onEntityDrop?(entity: TimeEntity, newTime: Date): Promise<void>
  
  // Быстрое создание
  getQuickAddForm(): QuickAddFormConfig
}
```

### Module Metadata

**Метаданные модуля:**

```typescript
export interface ModuleMetadata {
  id: string
  name: string
  description: string
  version: string
  icon: string           // Emoji или name из иконок
  color: string          // HEX цвет для таймлайна
  isCore: boolean        // Всегда включен
  accessType: ModuleAccessType
  price?: number         // Для paid-модулей
  requiresAuth: boolean
  tags: string[]
}

export type ModuleAccessType = 
  | 'free'        // Бесплатно
  | 'demo'        // Только для демо-режима
  | 'registration' // Требует регистрации
  | 'paid'        // Требует покупки
  | 'request'     // Требует запроса на доступ
```

---

## 📊 Примеры использования

### 1. Регистрация модуля

```typescript
import { moduleRegistry } from '@/core/modules/init';

// Регистрация в init.ts
moduleRegistry.register(
  {
    id: 'finance',
    name: 'Финансы',
    description: 'Управление финансами и платежами',
    version: '1.0.0',
    icon: '💰',
    color: '#10B981',
    isCore: false,
    accessType: 'registration',
    requiresAuth: true,
    tags: ['finance', 'payments'],
  },
  () => import('@/modules/finance/finance-module').then(m => m.createFinanceModule)
);
```

### 2. Включение модуля

```typescript
// Авто-включение core-модулей в init.ts
const coreModules = moduleRegistry.getModules().filter(m => m.isCore);

for (const module of coreModules) {
  await moduleRegistry.enableModule(module.id);
  console.log(`Enabled core module: ${module.name}`);
}

// Ручное включение из UI
await moduleRegistry.enableModule('finance');
```

### 3. Проверка доступа

```typescript
const userState = {
  isAuthenticated: true,
  hasCompletedOnboarding: true,
  unlockedModules: ['finance'],
  pendingRequests: [],
  currentContext: 'work',
};

const canAccess = moduleRegistry.canAccess('finance', userState);
// true, если модуль в unlockedModules или accessType === 'free'
```

### 4. Подписка на события

```typescript
import { eventBus } from '@/core/modules/event-bus';

// Подписка на создание сущностей
const unsubscribe = eventBus.subscribe('entity_created', (event) => {
  if (event.payload.moduleId === 'tasks') {
    console.log('Создана задача:', event.payload.timeEntity.title);
    // Обновить UI, отправить уведомление, и т.д.
  }
});

// Отписка при размонтировании компонента
return () => unsubscribe();
```

### 5. Создание сущности через модуль

```typescript
const tasksModule = moduleRegistry.getModule('tasks');

if (tasksModule?.adapter) {
  const entity = await tasksModule.adapter.createTimelineEntity({
    type: 'task',
    title: 'Сделать отчёт',
    startTime: new Date('2024-12-20T09:00:00'),
    duration: 60,
    priority: 'high',
    tags: ['работа'],
    contextId: 'work',
  });

  console.log('Создана сущность:', entity);
  // eventBus автоматически опубликует событие 'entity_created'
}
```

### 6. Drag & Drop сущности

```typescript
const tasksModule = moduleRegistry.getModule('tasks');

if (tasksModule?.adapter?.onEntityDrop) {
  // Пользователь перетащил задачу на 2 часа позже
  await tasksModule.adapter.onEntityDrop(entity, newTime);
  // Модуль сам обновит задачу и опубликует событие 'time_changed'
}
```

---

## 🧩 Пример: Tasks Module

### Реализация (`src/modules/tasks/tasks-module.ts`)

```typescript
export class TasksModule implements TimelineAdapter {
  private readonly moduleId = 'tasks';

  async getTimelineEntities(filters: TimelineFilters): Promise<TimeEntity[]> {
    // Получаем задачи из базы
    const tasks = await db.tasks.toArray();
    
    // Фильтруем и преобразуем в TimeEntity
    return tasks
      .filter(t => !t.deleted_at)
      .map(task => this.taskToTimeEntity(task));
  }

  async createTimelineEntity(data: CreateEntityData): Promise<TimeEntity> {
    const task = {
      title: data.title,
      due_date: data.startTime?.toISOString(),
      priority: data.priority || 'medium',
      status: 'todo',
      tags: data.tags || [],
      context: data.contextId || 'home',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const id = await db.tasks.add(task);
    const createdTask = { ...task, id: String(id) };
    const timeEntity = this.taskToTimeEntity(createdTask);

    // Публикуем событие для других модулей
    eventBus.publish({
      type: 'entity_created',
      payload: {
        entityId: createdTask.id,
        moduleId: this.moduleId,
        timeEntity,
      }
    });

    return timeEntity;
  }

  getDisplayConfig(): DisplayConfig {
    return {
      icon: '📋',
      color: '#8B5CF6',
      labelField: 'title',
      allowDrag: true,
      allowResize: true,
    };
  }

  async onEntityDrop?(entity: TimeEntity, newTime: Date): Promise<void> {
    if (entity.linkedEntities.taskId) {
      await this.updateTimelineEntity(entity.linkedEntities.taskId, {
        startTime: newTime,
      });
    }
  }

  private taskToTimeEntity(task: any): TimeEntity {
    return {
      id: String(task.id),
      startTime: new Date(task.due_date || task.created_at),
      title: task.title,
      type: 'task',
      status: task.status,
      priority: task.priority,
      tags: task.tags || [],
      linkedEntities: { taskId: String(task.id) },
      color: '#8B5CF6',
      icon: '📋',
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      syncedAt: null,
      isDeleted: false,
    };
  }
}

export const createTasksModule = async (): Promise<TimelineAdapter> => {
  return new TasksModule();
};
```

---

## 🔄 Жизненный цикл модуля

```
1. Регистрация
   ↓
2. Lazy Loading (при enableModule)
   ↓
3. Загрузка адаптера (import())
   ↓
4. Публикация события 'module_enabled'
   ↓
5. Интеграция с Timeline Engine
   ↓
[Активное использование]
   ↓
6. Отключение (disableModule)
   ↓
7. Удаление адаптера
   ↓
8. Публикация события 'module_disabled'
```

---

## 📊 Интеграция с Timeline Engine

### Как модуль попадает на таймлайн

```typescript
// Timeline Engine собирает сущности из всех модулей
const timeline = await timelineEngine.getTimeline(
  { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  { types: ['task', 'event', 'payment'] }
);

// Внутри getTimeline():
for (const module of moduleRegistry.getModules()) {
  const registered = moduleRegistry.getModule(module.id);
  
  if (registered?.adapter) {
    const entities = await registered.adapter.getTimelineEntities(filters);
    allEntities.push(...entities);
  }
}

// Возвращаем объединённый таймлайн
return allEntities.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
```

---

## 🧪 Тестирование

### Unit Tests для Event Bus

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventBus } from '@/core/modules/event-bus';

describe('EventBus', () => {
  it('should subscribe and publish events', () => {
    const mockListener = vi.fn();
    const unsubscribe = eventBus.subscribe('entity_created', mockListener);

    eventBus.publish({
      type: 'entity_created',
      payload: { entityId: '123', moduleId: 'tasks', timeEntity: {} as any }
    });

    expect(mockListener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('should handle multiple listeners', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    eventBus.subscribe('entity_created', listener1);
    eventBus.subscribe('entity_created', listener2);

    eventBus.publish({
      type: 'entity_created',
      payload: { entityId: '1', moduleId: 'test', timeEntity: {} as any }
    });

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🚀 Следующие шаги

### Этап 3: Sync Engine с CRDT (3-4 дня)

- Интеграция с Yjs для CRDT-синхронизации
- Offline-first архитектура
- Конфликт-резолвинг
- Авто-синхронизация при появлении сети

### Этап 4: Theme System (1-2 дня)

- Глобальные CSS variables
- Контекстные темы (Дом/Работа/Учеба)
- Персистентность в localStorage
- Синхронизация между устройствами

### Этап 5: UI Components (3-4 дня)

- `TimelineView` — основной вид календаря
- `EventCard` — карточка события
- `SidePanel` — боковая панель
- `QuickPeek` — быстрый просмотр
- `ThemeCustomizer` — настройщик тем

---

## 📁 Структура файлов

```
src/
├── core/
│   ├── modules/
│   │   ├── types.ts              # ModuleMetadata, TimelineAdapter, EventBus
│   │   ├── event-bus.ts          # Typed event bus
│   │   ├── module-registry.ts    # Реестр модулей
│   │   └── init.ts               # Инициализация
│   └── timeline/
│       ├── types.ts              # TimeEntity, TimelineFilters
│       └── timeline-engine.ts    # Timeline Engine
├── modules/
│   └── tasks/
│       └── tasks-module.ts       # Пример реализации
└── lib/
    └── db/
        ├── schema.ts             # Task интерфейс
        └── database.ts           # Dexie.js
```

---

**Версия:** 1.0.0  
**Дата:** 2024-12-17  
**Статус:** ✅ Module Integration System реализована, сборка успешна
