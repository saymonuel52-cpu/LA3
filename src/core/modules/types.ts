/**
 * Module Integration System — Типы для модульной системы LAD 2
 * 
 * Философия:
 * - Модули — это плагины реальности, которые встраиваются в Timeline Engine
 * - Каждый модуль реализует TimelineAdapter для интеграции
 * - Event Bus для межмодульной коммуникации
 */

// ============================================================================
// БАЗОВЫЕ ТИПЫ
// ============================================================================

export type ModuleStatus = 'disabled' | 'enabled' | 'loading' | 'error';
export type ModuleAccessType = 'free' | 'demo' | 'registration' | 'paid' | 'request';
export type UserContext = 'home' | 'work' | 'study';

/**
 * Метаданные модуля
 */
export interface ModuleMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;           // Emoji или name из иконок
  color: string;          // HEX цвет для таймлайна
  isCore: boolean;        // Всегда включен
  accessType: ModuleAccessType;
  price?: number;         // Для paid-модулей
  requiresAuth: boolean;
  tags: string[];
}

// ============================================================================
// TIMELINE ADAPTER — Контракт для интеграции модуля с календарём
// ============================================================================

import { TimeEntity, TimelineFilters, CreateEntityData } from '../timeline/types';

/**
 * Конфигурация отображения на таймлайне
 */
export interface DisplayConfig {
  icon: string;
  color: string;
  labelField: string;        // Поле для заголовка карточки
  subtitleField?: string;    // Поле для подзаголовка
  badgeField?: string;       // Поле для бейджа (приоритет/статус)
  allowDrag: boolean;        // Можно ли перетаскивать
  allowResize: boolean;      // Можно ли менять длительность
}

/**
 * Поле формы быстрого добавления
 */
export interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'tags';
  required?: boolean;
  placeholder?: string;
  options?: string[];        // Для select
  default?: any;
}

/**
 * Предложение времени
 */
export interface TimeSuggestion {
  label: string;
  time: string;              // "09:00", "14:30"
}

/**
 * Конфигурация формы быстрого добавления
 */
export interface QuickAddFormConfig {
  fields: FormField[];
  defaultDuration: number;   // в минутах
  suggestedTimes: TimeSuggestion[];
}

/**
 * Timeline Adapter — интерфейс для интеграции модуля с Timeline Engine
 */
export interface TimelineAdapter {
  // CRUD для сущностей модуля
  getTimelineEntities(filters: TimelineFilters): Promise<TimeEntity[]>;
  createTimelineEntity(data: CreateEntityData): Promise<TimeEntity>;
  updateTimelineEntity(id: string, changes: Partial<TimeEntity>): Promise<TimeEntity>;
  deleteTimelineEntity(id: string): Promise<void>;
  
  // Конфигурация отображения
  getDisplayConfig(): DisplayConfig;
  
  // Обработчики взаимодействий
  onEntityClick(entity: TimeEntity): void;
  onEntityDrop?(entity: TimeEntity, newTime: Date): Promise<void>;
  
  // Быстрое создание
  getQuickAddForm(): QuickAddFormConfig;
}

// ============================================================================
// EVENT BUS — Шина событий для межмодульной коммуникации
// ============================================================================

/**
 * Типизированные события модулей
 */
export type ModuleEvent = 
  | { type: 'entity_created'; payload: { entityId: string; moduleId: string; timeEntity: TimeEntity } }
  | { type: 'entity_updated'; payload: { entityId: string; moduleId: string; changes: Partial<TimeEntity> } }
  | { type: 'entity_deleted'; payload: { entityId: string; moduleId: string } }
  | { type: 'time_changed'; payload: { entityId: string; oldTime: Date; newTime: Date } }
  | { type: 'module_enabled'; payload: { moduleId: string } }
  | { type: 'module_disabled'; payload: { moduleId: string } }
  | { type: 'sync_requested'; payload: { moduleId: string; force?: boolean } }
  | { type: 'user_context_changed'; payload: { context: UserContext } }
  | { type: 'theme_changed'; payload: { theme: Partial<ThemeConfig> } };

export interface EventListener {
  (event: ModuleEvent): void | Promise<void>;
}

export interface EventBus {
  subscribe(eventType: ModuleEvent['type'], listener: EventListener): () => void;
  publish(event: ModuleEvent): void;
  clear(): void;
}

// ============================================================================
// MODULE REGISTRY — Реестр модулей
// ============================================================================

/**
 * Зарегистрированный модуль
 */
export interface RegisteredModule {
  metadata: ModuleMetadata;
  adapter: TimelineAdapter | null;
  status: ModuleStatus;
  load: () => Promise<TimelineAdapter>;
  unload: () => void;
}

/**
 * Состояние пользователя
 */
export interface UserState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  unlockedModules: string[];
  pendingRequests: Array<{ moduleId: string; status: 'pending' | 'approved' | 'rejected' }>;
  currentContext: UserContext;
}

/**
 * Реестр модулей
 */
export interface ModuleRegistry {
  register(metadata: ModuleMetadata, loader: () => Promise<TimelineAdapter>): void;
  getModules(): ModuleMetadata[];
  getModule(moduleId: string): RegisteredModule | undefined;
  enableModule(moduleId: string): Promise<void>;
  disableModule(moduleId: string): void;
  canAccess(moduleId: string, userState: UserState): boolean;
  subscribe(listener: (modules: ModuleMetadata[]) => void): () => void;
}

// ============================================================================
// THEME CONFIG — Для будущих шагов
// ============================================================================

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  backgroundImage?: string;
  density: 'compact' | 'comfortable' | 'spacious';
  animationSpeed: 'slow' | 'normal' | 'fast' | 'none';
}
