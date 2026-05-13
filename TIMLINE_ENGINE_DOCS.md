# Timeline Engine — Time-Centric Core

## 🎯 Философия: «Время — единственная истина»

**LAD 2** — это не просто ежедневник. Это **операционная система жизни**, где время становится центральной осью, а все модули (Задачи, Календарь, Финансы, Здоровье) — измерениями, наложенными на эту ось.

### Ключевые принципы

1. **Время — единственная истина**: Каждая сущность имеет `startTime` и `endTime` (или `duration`)
2. **Модули связываются через `linkedEntities`**: Задача связана с событием, событие — с платежом, и так далее
3. **Единый таймлайн**: Все модули отображаются на одной временной оси
4. **Recurrence Rules**: Повторяющиеся события разворачиваются автоматически

---

## 🏗️ Архитектура

### Timeline Engine (`src/core/timeline/timeline-engine.ts`)

**Основные методы:**

```typescript
// CRUD
createEntity(entity: Partial<TimeEntity>): Promise<TimeEntity>
updateEntity(id: string, changes: Partial<TimeEntity>): Promise<TimeEntity>
deleteEntity(id: string, hard = false): Promise<void>
getEntityById(id: string): Promise<TimeEntity | null>

// Query
getTimeline(range: DateRange, filters?: TimelineFilters): Promise<TimeEntity[]>
getGroupedTimeline(range: DateRange, filters?: TimelineFilters): Promise<GroupedTimeline[]>
getModuleTimeline(moduleId: string, range: DateRange, filters?: TimelineFilters): Promise<TimeEntity[]>
getLinkedEntities(entity: TimeEntity): Promise<TimeEntity[]>

// Stats
getTimelineStats(range: DateRange): Promise<TimelineStats>

// Recurrence
expandRecurrence(entity: TimeEntity, range: DateRange): Promise<TimeEntity[]>
```

### TimeEntity (`src/core/timeline/types.ts`)

**Универсальная сущность времени:**

```typescript
interface TimeEntity {
  id: string
  type: EntityType  // task | event | appointment | payment | health_entry | note | crm_activity | custom
  title: string
  description?: string
  
  // Время (обязательно)
  startTime: Date
  endTime?: Date
  duration?: number  // в минутах
  
  // Повторение
  recurrence?: RecurrenceRule
  
  // Статус и приоритет
  status: EntityStatus
  priority: EntityPriority
  tags: string[]
  
  // Связи с другими модулями
  linkedEntities: LinkedEntities
  
  // Локализация
  timezone: string
  
  // UI
  color?: string
  icon?: string
  
  // Синхронизация
  createdAt: Date
  updatedAt: Date
  syncedAt: Date | null
  isDeleted?: boolean
  isDemo?: boolean
  
  // Расширенные данные
  metadata?: Record<string, any>
}
```

### RecurrenceRule

**Поддерживаемые правила повторения:**

```typescript
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number           // Например, каждые 2 недели
  count?: number              // Сколько раз повторять
  until?: Date                // До какой даты
  byDay?: string[]            // Например: ['MO', 'WE', 'FR']
  byMonth?: number[]          // Месяцы: [1, 6, 12]
  byMonthDay?: number[]       // Дни месяца: [1, 15]
}
```

---

## 📊 Примеры использования

### 1. Создание задачи

```typescript
const task = await timelineEngine.createEntity({
  type: 'task',
  title: 'Сделать отчёт',
  description: 'Еженедельный отчёт по продажам',
  startTime: new Date('2024-12-20T09:00:00'),
  endTime: new Date('2024-12-20T10:30:00'),
  status: 'pending',
  priority: 'high',
  tags: ['работа', 'отчёт'],
  linkedEntities: {
    taskId: 'task-123',
  },
  color: '#EF4444',
  icon: '📊',
})
```

### 2. Получение таймлайна на неделю

```typescript
const timeline = await timelineEngine.getTimeline({
  start: new Date(),
  end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
}, {
  types: ['task', 'event', 'appointment'],
  priorities: ['high', 'urgent'],
  tags: ['работа'],
  searchQuery: 'отчёт',
})
```

### 3. Сгруппированный таймлайн по дням

```typescript
const grouped = await timelineEngine.getGroupedTimeline({
  start: new Date(),
  end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
})

// Результат:
// [
//   {
//     date: '2024-12-17',
//     entities: [TimeEntity, TimeEntity, ...],
//     totalDuration: 240  // 4 часа
//   },
//   ...
// ]
```

### 4. Связанные сущности

```typescript
const event = await timelineEngine.getEntityById('event-123')
const linked = await timelineEngine.getLinkedEntities(event)

// linked = [task, payment, health_entry, ...]
// Все сущности, связанные с этим событием
```

### 5. Статистика

```typescript
const stats = await timelineEngine.getTimelineStats({
  start: new Date(),
  end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
})

// Результат:
// {
//   totalEntities: 42,
//   totalDuration: 1440,  // 24 часа
//   entitiesByType: { task: 20, event: 15, payment: 7, ... },
//   entitiesByStatus: { pending: 10, in_progress: 5, completed: 27, ... },
//   productivityScore: 64  // 64% завершено
// }
```

### 6. Повторяющиеся события

```typescript
const recurringEvent = await timelineEngine.createEntity({
  type: 'event',
  title: 'Еженедельная планёрка',
  startTime: new Date('2024-12-16T10:00:00'),
  duration: 60,
  recurrence: {
    frequency: 'weekly',
    interval: 1,
    byDay: ['MO'],  // Каждый понедельник
    count: 12,  // 12 раз
  },
})

// Развернуть на месяц
const instances = await timelineEngine.expandRecurrence(
  recurringEvent,
  { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
)

// instances = [event1, event2, event3, ...]  // 4 события (4 понедельника)
```

---

## 🗄️ База данных (Dexie.js)

### Схема

```typescript
db.version(3).stores({
  timelineEntities: 'id, startTime, endTime, [startTime+endTime], type, status, isDeleted',
})
```

### Индексы

- **id** — первичный ключ
- **startTime** — для выборки по времени
- **endTime** — для пересечения диапазонов
- **[startTime+endTime]** — составной индекс
- **type** — фильтрация по типу
- **status** — фильтрация по статусу
- **isDeleted** — soft delete

---

## 🔄 Интеграция с модулями

### Как модуль интегрируется в Timeline

Каждый модуль может:

1. **Создавать сущности** через `timelineEngine.createEntity()`
2. **Связывать сущности** через `linkedEntities`
3. **Фильтровать свой таймлайн** через `getModuleTimeline()`

### Пример: Модуль Финансы

```typescript
// Создание платежа
const payment = await db.transactions.add({ /* ... */ })

// Создание timeline entity
const timelineEvent = await timelineEngine.createEntity({
  type: 'payment',
  title: `Оплата: ${merchant}`,
  startTime: new Date(date),
  duration: 0,
  linkedEntities: {
    paymentId: payment.id,
  },
  color: '#10B981',
  icon: '💰',
})
```

### Пример: Модуль Задачи

```typescript
// Создание задачи
const task = await db.tasks.add({ /* ... */ })

// Создание timeline entity
const timelineTask = await timelineEngine.createEntity({
  type: 'task',
  title: task.title,
  startTime: new Date(task.due_date),
  status: task.status === 'done' ? 'completed' : 'pending',
  linkedEntities: {
    taskId: task.id,
  },
  color: '#F59E0B',
  icon: '✅',
})
```

---

## 📈 Производительность

### Оптимизации

1. **Индексы Dexie.js** — быстрая выборка по времени
2. **Пагинация** — загрузка по диапазонам (не все сразу)
3. **Кэширование** — результаты можно кэшировать в памяти
4. **Lazy loading** — сущности загружаются по требованию

### Benchmarks (цели)

- **Рендер 10,000 событий** < 100ms
- **Поиск по таймлайну** < 50ms
- **Группировка по дням** < 30ms
- **Expand recurrence (100 instances)** < 20ms

---

## 🧪 Тестирование

### Unit Tests

```typescript
describe('TimelineEngine', () => {
  it('should create entity with valid times', async () => {
    const entity = await timelineEngine.createEntity({
      type: 'event',
      title: 'Test',
      startTime: new Date('2024-12-17T10:00:00'),
      endTime: new Date('2024-12-17T11:00:00'),
    })
    
    expect(entity.id).toBeDefined()
    expect(entity.startTime).toBeInstanceOf(Date)
  })
  
  it('should filter by type and status', async () => {
    const timeline = await timelineEngine.getTimeline(
      { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { types: ['task'], statuses: ['pending'] }
    )
    
    expect(timeline.every(e => e.type === 'task')).toBe(true)
    expect(timeline.every(e => e.status === 'pending')).toBe(true)
  })
})
```

---

## 🚀 Следующие шаги

### Этап 2: Module Integration System (2-3 дня)

- Создать `ModuleRegistry` — реестр модулей
- Автоматическая регистрация timeline adapters
- Система событий между модулями (Event Bus)
- Lazy loading модулей

### Этап 3: Sync Engine с CRDT (3-4 дня)

- Интеграция с Yjs для CRDT
- Offline-first синхронизация
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

## 📚 Ресурсы

- **Timeline Engine**: `src/core/timeline/timeline-engine.ts`
- **Типы**: `src/core/timeline/types.ts`
- **База данных**: `src/lib/db/database.ts` (version 3)
- **Схема**: `src/lib/db/schema.ts` (TimelineEntity)

---

**Версия:** 1.0.0  
**Дата:** 2024-12-17  
**Статус:** ✅ Timeline Engine реализован, сборка успешна
