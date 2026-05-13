/**
 * Tasks Module — Модуль управления задачами
 * 
 * Интеграция с Timeline Engine через TimelineAdapter
 * Философия: задачи существуют во времени и связаны с другими сущностями
 */

import { TimelineAdapter, DisplayConfig, QuickAddFormConfig } from '@/core/modules/types';
import { TimeEntity, TimelineFilters, CreateEntityData } from '@/core/timeline/types';
import { eventBus } from '@/core/modules/event-bus';
import { db } from '@/lib/db/database';

// ============================================================================
// ТИПЫ ЗАДАЧ (локальные для модуля)
// ============================================================================

export interface TasksModuleTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  estimatedDuration?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'archived';
  tags: string[];
  contextId: 'home' | 'work' | 'study';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  completedAt?: Date;
}

// ============================================================================
// ТИПЫ ЗАДАЧ (локальные для модуля)
// ============================================================================

export interface TasksModuleTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  estimatedDuration?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'archived';
  tags: string[];
  contextId: 'home' | 'work' | 'study';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  completedAt?: Date;
}

// ============================================================================
// TASKS MODULE IMPLEMENTATION
// ============================================================================

export class TasksModule implements TimelineAdapter {
  private readonly moduleId = 'tasks';

  /**
   * Получить сущности задач для таймлайна
   */
  async getTimelineEntities(filters: TimelineFilters): Promise<TimeEntity[]> {
    // Получаем все задачи (без удалённых) - используем any для совместимости с базой
    const allTasks = await db.tasks.toArray();
    let tasks = allTasks.filter((t: any) => !t.deleted_at);

    // Фильтры по времени
    if (filters.startTime) {
      tasks = tasks.filter((task: any) => 
        !task.due_date || new Date(task.due_date) >= (filters.startTime as Date)
      );
    }
    
    if (filters.endTime) {
      tasks = tasks.filter((task: any) => 
        !task.due_date || new Date(task.due_date) <= (filters.endTime as Date)
      );
    }

    // Фильтры по типам
    if (filters.types && !filters.types.includes('task')) {
      return [];
    }

    // Фильтры по статусам
    if (filters.statuses?.length) {
      tasks = tasks.filter((task: any) => 
        filters.statuses?.includes(task.status)
      );
    }

    // Фильтры по приоритетам
    if (filters.priorities?.length) {
      tasks = tasks.filter((task: any) => 
        filters.priorities?.includes(task.priority)
      );
    }

    // Поиск по тексту
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      tasks = tasks.filter((task: any) => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    return tasks.map((task: any) => this.taskToTimeEntity(task));
  }

  /**
   * Создать новую задачу
   */
  async createTimelineEntity(data: CreateEntityData): Promise<TimeEntity> {
    const task: any = {
      title: data.title,
      description: data.description,
      due_date: data.startTime?.toISOString(),
      estimated_duration: data.duration,
      priority: (data.priority as any) || 'medium',
      status: 'todo',
      tags: data.tags || [],
      context: (data as any).contextId || 'home',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    const id = await db.tasks.add(task);
    const createdTask = { ...task, id: String(id) } as any;
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

  /**
   * Обновить задачу
   */
  async updateTimelineEntity(id: string, changes: Partial<TimeEntity>): Promise<TimeEntity> {
    const updates: any = {
      ...(changes.title && { title: changes.title }),
      ...(changes.description && { description: changes.description }),
      ...(changes.startTime && { due_date: changes.startTime.toISOString() }),
      ...(changes.priority && { priority: changes.priority as any }),
      ...(changes.status && { 
        status: changes.status as any,
      }),
      updated_at: new Date().toISOString(),
    };

    await db.tasks.update(id, updates);
    
    const updatedTask = await db.tasks.get(id) as any | undefined;
    
    if (!updatedTask) {
      throw new Error(`Task ${id} not found after update`);
    }

    const timeEntity = this.taskToTimeEntity(updatedTask);

    eventBus.publish({
      type: 'entity_updated',
      payload: {
        entityId: id,
        moduleId: this.moduleId,
        changes,
      }
    });

    return timeEntity;
  }

  /**
   * Удалить задачу (soft delete)
   */
  async deleteTimelineEntity(id: string): Promise<void> {
    // Soft delete
    await db.tasks.update(id, {
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    eventBus.publish({
      type: 'entity_deleted',
      payload: {
        entityId: id,
        moduleId: this.moduleId,
      }
    });
  }

  /**
   * Получить конфигурацию отображения
   */
  getDisplayConfig(): DisplayConfig {
    return {
      icon: '📋',
      color: '#8B5CF6',
      labelField: 'title',
      subtitleField: 'description',
      badgeField: 'priority',
      allowDrag: true,
      allowResize: true,
    };
  }

  /**
   * Обработчик клика на сущность
   */
  onEntityClick(entity: TimeEntity): void {
    // В реальном приложении: открыть модал редактирования
    console.log(`[TasksModule] Clicked entity:`, {
      id: entity.linkedEntities.taskId,
      title: entity.title,
    });

    // Эмитим событие для UI-слоя
    eventBus.publish({
      type: 'entity_updated',
      payload: {
        entityId: entity.linkedEntities.taskId as string,
        moduleId: this.moduleId,
        changes: {},
      }
    });
  }

  /**
   * Обработчик перетаскивания (drag & drop)
   */
  async onEntityDrop?(entity: TimeEntity, newTime: Date): Promise<void> {
    // Обработка перетаскивания: обновление времени задачи
    if (entity.linkedEntities.taskId) {
      await this.updateTimelineEntity(entity.linkedEntities.taskId, {
        startTime: newTime,
      });
    }
  }

  /**
   * Получить конфигурацию формы быстрого добавления
   */
  getQuickAddForm(): QuickAddFormConfig {
    return {
      fields: [
        { name: 'title', type: 'text', required: true, placeholder: 'Название задачи' },
        { name: 'description', type: 'textarea', required: false, placeholder: 'Описание' },
        { 
          name: 'priority', 
          type: 'select', 
          options: ['low', 'medium', 'high', 'urgent'], 
          default: 'medium' 
        },
        { name: 'tags', type: 'tags', placeholder: 'тег1, тег2' },
      ],
      defaultDuration: 60,
      suggestedTimes: [
        { label: 'Сегодня вечером', time: '18:00' },
        { label: 'Завтра утром', time: '09:00' },
        { label: 'Завтра после обеда', time: '14:00' },
      ],
    };
  }

  // ============================================================================
  // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================================================

  /**
   * Конвертировать Task в TimeEntity
   */
  private taskToTimeEntity(task: any): TimeEntity {
    const startTime = task.due_date ? new Date(task.due_date) : new Date(task.created_at);
    const endTime = task.due_date && task.estimated_duration
      ? new Date(new Date(task.due_date).getTime() + task.estimated_duration * 60000)
      : undefined;

    return {
      id: String(task.id),
      startTime,
      endTime,
      duration: task.estimated_duration,
      title: task.title,
      description: task.description,
      type: 'task',
      status: task.status,
      priority: task.priority,
      tags: task.tags || [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      linkedEntities: { taskId: String(task.id) },
      color: '#8B5CF6',
      icon: '📋',
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      syncedAt: null,
      isDeleted: false,
      metadata: {
        contextId: task.context,
        completed: task.status === 'completed',
        completedAt: task.status === 'completed' ? new Date(task.updated_at) : undefined,
      }
    };
  }
}

/**
 * Фабрика для lazy loading
 */
export const createTasksModule = async (): Promise<TimelineAdapter> => {
  return new TasksModule();
};
