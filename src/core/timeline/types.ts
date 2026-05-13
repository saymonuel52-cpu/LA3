/**
 * Time-Centric Core — Типы для Timeline Engine
 * 
 * Философия:
 * - Всё существует во времени
 * - Каждая сущность имеет startTime и endTime (или duration)
 * - Модули связываются через linkedEntities
 */

import { z } from 'zod'

// ============================================================================
// БАЗОВЫЕ ТИПЫ
// ============================================================================

/**
 * Типы сущностей во времени
 */
export type EntityType = 
  | 'task'           // Задача
  | 'event'          // Событие календаря
  | 'appointment'    // Запись/встреча
  | 'payment'        // Платеж
  | 'health_entry'   // Запись о здоровье
  | 'note'           // Заметка с временной меткой
  | 'crm_activity'   // Активность в CRM
  | 'custom'         // Пользовательская сущность

/**
 * Статус сущности
 */
export type EntityStatus = 
  | 'pending'        // Ожидает
  | 'in_progress'    // В процессе
  | 'completed'      // Завершено
  | 'cancelled'      // Отменено
  | 'archived'       // Архив

/**
 * Приоритет
 */
export type EntityPriority = 'low' | 'medium' | 'high' | 'urgent'

// ============================================================================
// RECURSION RULES (Повторяющиеся события)
// ============================================================================

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval?: number           // Например, каждые 2 недели
  count?: number              // Сколько раз повторять (если нет until)
  until?: Date                // До какой даты повторять
  byDay?: string[]            // Например: ['MO', 'WE', 'FR'] — пн, ср, пт
  byMonth?: number[]          // Месяцы: [1, 6, 12]
  byMonthDay?: number[]       // Дни месяца: [1, 15]
}

// ============================================================================
// LINKED ENTITIES (Связи между модулями)
// ============================================================================

export interface LinkedEntities {
  taskId?: string
  eventId?: string
  appointmentId?: string
  paymentId?: string
  healthEntryId?: string
  noteId?: string
  crmActivityId?: string
  // Расширяется другими модулями
  [key: string]: string | undefined
}

// ============================================================================
// ОСНОВНАЯ СУЩНОСТЬ ВРЕМЕНИ
// ============================================================================

/**
 * Универсальная сущность времени
 * 
 * Всё имеет:
 * - startTime (обязательно)
 * - endTime или duration
 * - timezone
 * - linkedEntities (связи с другими модулями)
 */
export interface TimeEntity {
  // Идентификация
  id: string
  type: EntityType
  title: string
  description?: string
  
  // Время (обязательно)
  startTime: Date
  endTime?: Date
  duration?: number  // в минутах, если endTime нет
  
  // Повторение
  recurrence?: RecurrenceRule
  
  // Метаданные
  status: EntityStatus
  priority: EntityPriority
  tags: string[]
  
  // Связи с другими модулями
  linkedEntities: LinkedEntities
  
  // Локализация
  timezone: string
  
  // Цвет и иконка для UI
  color?: string
  icon?: string
  
  // Синохронизация
  createdAt: Date
  updatedAt: Date
  syncedAt: Date | null
  isDeleted?: boolean
  isDemo?: boolean
  
  // Расширенные данные (модуль-специфичные)
  metadata?: Record<string, any>
}

// ============================================================================
// ZOD СХЕМЫ (валидация)
// ============================================================================

export const RecurrenceRuleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  interval: z.number().int().positive().optional(),
  count: z.number().int().positive().optional(),
  until: z.date().optional(),
  byDay: z.array(z.string()).optional(),
  byMonth: z.array(z.number().int().min(1).max(12)).optional(),
  byMonthDay: z.array(z.number().int().min(1).max(31)).optional(),
})

export const LinkedEntitiesSchema = z.object({
  taskId: z.string().optional(),
  eventId: z.string().optional(),
  appointmentId: z.string().optional(),
  paymentId: z.string().optional(),
  healthEntryId: z.string().optional(),
  noteId: z.string().optional(),
  crmActivityId: z.string().optional(),
}).passthrough()

export const TimeEntitySchema = z.object({
  id: z.string(),
  type: z.enum([
    'task', 'event', 'appointment', 'payment', 
    'health_entry', 'note', 'crm_activity', 'custom'
  ]),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().int().positive().optional(),
  recurrence: RecurrenceRuleSchema.optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'archived']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  tags: z.array(z.string()),
  linkedEntities: LinkedEntitiesSchema,
  timezone: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  syncedAt: z.date().nullable().optional(),
  isDeleted: z.boolean().optional(),
  isDemo: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
})

// ============================================================================
// DATE RANGE (Диапазон дат)
// ============================================================================

export interface DateRange {
  start: Date
  end: Date
}

export const DEFAULT_RANGE: DateRange = {
  start: new Date(),
  end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Следующая неделя
}

// ============================================================================
// FILTERS (Фильтры для выборки)
// ============================================================================

export interface TimelineFilters {
  types?: EntityType[]
  statuses?: EntityStatus[]
  priorities?: EntityPriority[]
  tags?: string[]
  linkedModule?: string  // Фильтр по модулю (например, 'finance')
  searchQuery?: string   // Поиск по title/description
  includeDeleted?: boolean
}

// ============================================================================
// QUERY RESULTS (Результаты запросов)
// ============================================================================

/**
 * Сгруппированный таймлайн (по дням)
 */
export interface GroupedTimeline {
  date: string           // YYYY-MM-DD
  entities: TimeEntity[]
  totalDuration: number  // в минутах
}

/**
 * Статистика таймлайна
 */
export interface TimelineStats {
  totalEntities: number
  totalDuration: number  // в минутах
  entitiesByType: Record<EntityType, number>
  entitiesByStatus: Record<EntityStatus, number>
  productivityScore: number  // 0-100
}
