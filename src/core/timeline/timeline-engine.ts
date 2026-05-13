/**
 * Timeline Engine — Ядро Time-Centric системы LAD 2
 * 
 * Философия:
 * - Время — единственная истина
 * - Всё существует во времени
 * - Модули связываются через linkedEntities
 * 
 * Функции:
 * - Единая временная ось для всех сущностей
 * - CRUD операции с валидацией
 * - Интеграция с Dexie.js
 * - Система связей между модулями
 */

import { db } from '@/lib/db/database'
import { 
  TimeEntity, 
  EntityType, 
  DateRange, 
  TimelineFilters, 
  GroupedTimeline,
  TimelineStats
} from './types'
import { v4 as uuidv4 } from 'uuid'

export class TimelineEngine {
  // ============================================================================
  // CRUD ОПЕРАЦИИ
  // ============================================================================

  /**
   * Создать новую сущность во времени
   */
  async createEntity(entity: Partial<TimeEntity>): Promise<TimeEntity> {
    const now = new Date()
    const newEntity: TimeEntity = {
      id: uuidv4(),
      type: entity.type!,
      title: entity.title!,
      description: entity.description,
      startTime: entity.startTime!,
      endTime: entity.endTime,
      duration: entity.duration,
      recurrence: entity.recurrence,
      status: entity.status || 'pending',
      priority: entity.priority || 'medium',
      tags: entity.tags || [],
      linkedEntities: entity.linkedEntities || {},
      timezone: entity.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      color: entity.color,
      icon: entity.icon,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
      isDeleted: false,
      isDemo: entity.isDemo || false,
      metadata: entity.metadata,
    }

    // Сохраняем в соответствующую таблицу Dexie
    await this.saveToTable(newEntity)

    return newEntity
  }

  /**
   * Обновить сущность
   */
  async updateEntity(id: string, changes: Partial<TimeEntity>): Promise<TimeEntity> {
    const existing = await this.getEntityById(id)
    if (!existing) {
      throw new Error(`Entity ${id} not found`)
    }

    const updated: TimeEntity = {
      ...existing,
      ...changes,
      id, // ID не меняем
      updatedAt: new Date(),
    }

    // Сохраняем обновлённую сущность
    await this.saveToTable(updated)

    return updated
  }

  /**
   * Удалить сущность (soft delete)
   */
  async deleteEntity(id: string, hard = false): Promise<void> {
    if (hard) {
      // Полное удаление
      await this.removeFromTable(id)
    } else {
      // Soft delete — помечаем как удалённую
      await this.updateEntity(id, { isDeleted: true })
    }
  }

  /**
   * Получить сущность по ID
   */
  async getEntityById(id: string): Promise<TimeEntity | null> {
    const allTables = ['timeline_entities']
    
    for (const table of allTables) {
      const entity = await (db as any)[table].get(id)
      if (entity) {
        return this.hydrateEntity(entity)
      }
    }
    
    return null
  }

  // ============================================================================
  // QUERY OPERATIONS (Выборки)
  // ============================================================================

  /**
   * Получить таймлайн за период
   */
  async getTimeline(
    range: DateRange, 
    filters?: TimelineFilters
  ): Promise<TimeEntity[]> {
    let entities = await db.timelineEntities
      .where('startTime')
      .between(range.start.toISOString(), range.end.toISOString(), true, true)
      .toArray()

    // Применяем фильтры
    if (filters) {
      entities = this.applyFilters(entities, filters)
    }

    // Сортируем по времени начала
    return entities
      .map(e => this.hydrateEntity(e))
      .sort((a, b) => 
        a.startTime.getTime() - b.startTime.getTime() ||
        this.priorityToNumber(a.priority) - this.priorityToNumber(b.priority)
      )
  }

  /**
   * Сгруппированный таймлайн по дням
   */
  async getGroupedTimeline(
    range: DateRange,
    filters?: TimelineFilters
  ): Promise<GroupedTimeline[]> {
    const entities = await this.getTimeline(range, filters)
    
    const groups: Map<string, TimeEntity[]> = new Map()
    
    for (const entity of entities) {
      const dateKey = this.toDateKey(entity.startTime)
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      
      groups.get(dateKey)!.push(entity)
    }

    // Преобразуем в массив и считаем длительность
    return Array.from(groups.entries()).map(([date, entities]) => ({
      date,
      entities,
      totalDuration: entities.reduce((sum, e) => 
        sum + (this.getDuration(e) || 0), 0
      ),
    })).sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Получить сущности для конкретного модуля
   */
  async getModuleTimeline(
    moduleId: string,
    range: DateRange,
    filters?: TimelineFilters
  ): Promise<TimeEntity[]> {
    const allEntities = await this.getTimeline(range, {
      ...filters,
      linkedModule: moduleId,
    })

    // Фильтруем по связанному модулю
    return allEntities.filter(entity => 
      Object.keys(entity.linkedEntities).some(key => 
        key.includes(moduleId) || 
        entity.linkedEntities[key]?.startsWith(`${moduleId}-`)
      )
    )
  }

  /**
   * Получить связанные сущности
   */
  async getLinkedEntities(entity: TimeEntity): Promise<TimeEntity[]> {
    const linkedIds = Object.values(entity.linkedEntities).filter(Boolean) as string[]
    
    if (linkedIds.length === 0) return []
    
    const linked: TimeEntity[] = []
    
    for (const id of linkedIds) {
      const linkedEntity = await this.getEntityById(id)
      if (linkedEntity && !linkedEntity.isDeleted) {
        linked.push(linkedEntity)
      }
    }
    
    return linked
  }

  // ============================================================================
  // STATS (Статистика)
  // ============================================================================

  /**
   * Получить статистику таймлайна
   */
  async getTimelineStats(range: DateRange): Promise<TimelineStats> {
    const entities = await this.getTimeline(range)
    
    const stats: TimelineStats = {
      totalEntities: entities.length,
      totalDuration: 0,
      entitiesByType: {
        task: 0,
        event: 0,
        appointment: 0,
        payment: 0,
        health_entry: 0,
        note: 0,
        crm_activity: 0,
        custom: 0,
      },
      entitiesByStatus: {
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        archived: 0,
      },
      productivityScore: 0,
    }

    for (const entity of entities) {
      // Считаем длительность
      stats.totalDuration += this.getDuration(entity) || 0
      
      // Считаем по типам
      stats.entitiesByType[entity.type]++
      
      // Считаем по статусам
      stats.entitiesByStatus[entity.status]++
    }

    // Считаем продуктивность (завершённые / все)
    const completed = stats.entitiesByStatus.completed
    const total = Object.values(stats.entitiesByStatus).reduce((a, b) => a + b, 0)
    stats.productivityScore = total > 0 ? Math.round((completed / total) * 100) : 0

    return stats
  }

  // ============================================================================
  // RECURSION (Повторяющиеся события)
  // ============================================================================

  /**
   * Развернуть повторяющееся событие в конкретные экземпляры
   */
  async expandRecurrence(
    entity: TimeEntity,
    range: DateRange
  ): Promise<TimeEntity[]> {
    if (!entity.recurrence) {
      return [entity]
    }

    const instances: TimeEntity[] = []
    let currentDate = entity.startTime
    let count = 0

    while (currentDate <= range.end) {
      // Проверяем, не вышли ли за лимит
      if (entity.recurrence.count && count >= entity.recurrence.count) {
        break
      }

      // Проверяем, не вышли ли за дату until
      if (entity.recurrence.until && currentDate > entity.recurrence.until) {
        break
      }

      // Проверяем, попадает ли в диапазон запроса
      if (currentDate >= range.start) {
        const instance: TimeEntity = {
          ...entity,
          id: `${entity.id}-${this.toDateKey(currentDate)}`,
          startTime: new Date(currentDate),
          endTime: entity.endTime 
            ? new Date(entity.endTime.getTime() + (currentDate.getTime() - entity.startTime.getTime()))
            : undefined,
          createdAt: entity.createdAt, // Оригинальная дата создания
        }
        instances.push(instance)
      }

      // Переходим к следующей итерации
      currentDate = this.nextOccurrence(currentDate, entity.recurrence)
      count++

      // Защита от бесконечного цикла
      if (count > 365) break
    }

    return instances
  }

  // ============================================================================
  // PRIVATE METHODS (Внутренние)
  // ============================================================================

  /**
   * Сохранить сущность в соответствующую таблицу
   */
  private async saveToTable(entity: TimeEntity): Promise<void> {
    // Для MVP сохраняем всё в одну таблицу
    await db.timelineEntities.put({
      ...entity,
      startTime: entity.startTime.toISOString(),
      endTime: entity.endTime?.toISOString(),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      syncedAt: entity.syncedAt?.toISOString(),
    })
  }

  /**
   * Удалить сущность из таблицы
   */
  private async removeFromTable(id: string): Promise<void> {
    await db.timelineEntities.delete(id)
  }

  /**
   * Применить фильтры к сущностям
   */
  private applyFilters(
    entities: any[], 
    filters: TimelineFilters
  ): any[] {
    return entities.filter(entity => {
      // Фильтр по типам
      if (filters.types && !filters.types.includes(entity.type)) {
        return false
      }

      // Фильтр по статусам
      if (filters.statuses && !filters.statuses.includes(entity.status)) {
        return false
      }

      // Фильтр по приоритетам
      if (filters.priorities && !filters.priorities.includes(entity.priority)) {
        return false
      }

      // Фильтр по тегам
      if (filters.tags && !filters.tags.some(tag => entity.tags.includes(tag))) {
        return false
      }

      // Фильтр по модулю
      if (filters.linkedModule) {
        const hasLinkedModule = Object.keys(entity.linkedEntities).some(key =>
          key.includes(filters.linkedModule!) ||
          entity.linkedEntities[key]?.startsWith(`${filters.linkedModule}-`)
        )
        if (!hasLinkedModule) return false
      }

      // Поиск
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesTitle = entity.title.toLowerCase().includes(query)
        const matchesDescription = entity.description?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDescription) return false
      }

      // Включить удалённые
      if (!filters.includeDeleted && entity.isDeleted) {
        return false
      }

      return true
    })
  }

  /**
   * Гидратировать сущность (преобразовать из БД в тип)
   */
  private hydrateEntity(data: any): TimeEntity {
    return {
      ...data,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      syncedAt: data.syncedAt ? new Date(data.syncedAt) : undefined,
    }
  }

  /**
   * Получить длительность в минутах
   */
  private getDuration(entity: TimeEntity): number | null {
    if (entity.duration) return entity.duration
    if (entity.endTime && entity.startTime) {
      return Math.round((entity.endTime.getTime() - entity.startTime.getTime()) / 60000)
    }
    return null
  }

  /**
   * Преобразовать дату в ключ YYYY-MM-DD
   */
  private toDateKey(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  /**
   * Перевести приоритет в число для сортировки
   */
  private priorityToNumber(priority: string): number {
    const map: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    }
    return map[priority] ?? 2
  }

  /**
   * Получить следующую дату повторения
   */
  private nextOccurrence(date: Date, rule: any): Date {
    const result = new Date(date)

    switch (rule.frequency) {
      case 'daily':
        result.setDate(result.getDate() + (rule.interval || 1))
        break
      case 'weekly':
        result.setDate(result.getDate() + (7 * (rule.interval || 1)))
        break
      case 'monthly':
        result.setMonth(result.getMonth() + (rule.interval || 1))
        break
      case 'yearly':
        result.setFullYear(result.getFullYear() + (rule.interval || 1))
        break
    }

    return result
  }
}

// Экземпляр Timeline Engine (синглтон)
export const timelineEngine = new TimelineEngine()
