/**
 * Каталог модулей LA3 с системой доступа (Freemium + Заявочная модель)
 * 
 * Типы доступа:
 * - 'free': Базовые модули, всегда доступны
 * - 'registration': Доступно только после регистрации
 * - 'paid': Платные модули (покупка или подписка)
 * - 'request': Модули по заявке (на рассмотрении)
 */

export type ModuleAccessType = 'free' | 'registration' | 'paid' | 'request' | 'demo';

export interface ModuleCatalogItem {
  id: string;
  name: string;
  icon: string;
  color: string; // Tailwind класс цвета (например, 'bg-blue-500')
  description: string;
  longDescription?: string;
  
  // Типы доступа
  isCore: boolean;              // Всегда доступны (Дашборд, Задачи, Календарь)
  accessType: ModuleAccessType;
  
  // Платные модули
  price?: number;               // Разовая покупка (₽)
  subscriptionPrice?: number;   // Ежемесячная подписка (₽/мес)
  
  // Бонусы
  bonusOnRegistration?: boolean; // Разблокировать автоматически при регистрации
  bonusOnOnboarding?: boolean;   // Разблокировать после прохождения онбординга
  
  // Метаданные
  requiresAuth?: boolean;        // Нужна ли регистрация для использования
  tags?: string[];               // Теги для фильтрации (например, ['productivity', 'business'])
  beta?: boolean;                // Бета-версия
}

/**
 * Полный каталог модулей LA3
 */
export const MODULE_CATALOG: ModuleCatalogItem[] = [
  // Core модули (всегда бесплатные)
  {
    id: 'dashboard',
    name: 'Дашборд',
    icon: '📊',
    color: 'bg-blue-500',
    description: 'Обзорная панель с виджетами',
    isCore: true,
    accessType: 'free',
    requiresAuth: false,
    tags: ['core', 'overview']
  },
  {
    id: 'tasks',
    name: 'Задачи',
    icon: '✅',
    color: 'bg-green-500',
    description: 'Управление задачами и проектами',
    isCore: true,
    accessType: 'free',
    requiresAuth: false,
    tags: ['core', 'productivity']
  },
  {
    id: 'calendar',
    name: 'Календарь',
    icon: '📅',
    color: 'bg-purple-500',
    description: 'Планирование событий и встреч',
    isCore: true,
    accessType: 'free',
    requiresAuth: false,
    tags: ['core', 'planning']
  },
  
  // Модули после регистрации (бонусные)
  {
    id: 'notes',
    name: 'Заметки',
    icon: '📝',
    color: 'bg-pink-500',
    description: 'Заметки и идеи в Markdown',
    isCore: false,
    accessType: 'registration',
    bonusOnRegistration: true,
    requiresAuth: true,
    tags: ['productivity', 'notes']
  },
  
  // Платные модули
  {
    id: 'finance',
    name: 'Финансы',
    icon: '💰',
    color: 'bg-emerald-500',
    description: 'Учёт расходов и доходов',
    longDescription: 'Полноценный финансовый трекер с категориями, бюджетами и аналитикой',
    isCore: false,
    accessType: 'paid',
    price: 490,
    subscriptionPrice: 49,
    requiresAuth: true,
    tags: ['finance', 'money'],
    beta: false
  },
  {
    id: 'crm',
    name: 'CRM',
    icon: '👥',
    color: 'bg-amber-500',
    description: 'Управление контактами и клиентами',
    longDescription: 'Система управления взаимоотношениями с клиентами с историей взаимодействий',
    isCore: false,
    accessType: 'paid',
    price: 990,
    subscriptionPrice: 99,
    requiresAuth: true,
    tags: ['business', 'sales']
  },
  {
    id: 'appointments',
    name: 'Записи',
    icon: '📋',
    color: 'bg-indigo-500',
    description: 'Запись клиентов на процедуры',
    longDescription: 'Календарь записей для специалистов с уведомлениями и напоминаниями',
    isCore: false,
    accessType: 'paid',
    price: 790,
    subscriptionPrice: 79,
    requiresAuth: true,
    tags: ['business', 'healthcare']
  },
  
  // Модули по заявке
  {
    id: 'health',
    name: 'Здоровье',
    icon: '❤️',
    color: 'bg-red-500',
    description: 'Трекер здоровья и привычек',
    longDescription: 'Мониторинг здоровья, привычек, тренировок и медицинских показателей',
    isCore: false,
    accessType: 'request',
    requiresAuth: true,
    tags: ['health', 'wellness'],
    beta: true
  },
  {
    id: 'mail',
    name: 'Почта',
    icon: '📧',
    color: 'bg-indigo-500',
    description: 'Email клиент с AI',
    longDescription: 'Интегрированный почтовый клиент с AI-ассистентом для написания писем',
    isCore: false,
    accessType: 'request',
    requiresAuth: true,
    tags: ['communication', 'ai'],
    beta: true
  }
];

/**
 * Получить модуль по ID
 */
export function getModuleById(moduleId: string): ModuleCatalogItem | undefined {
  return MODULE_CATALOG.find(module => module.id === moduleId);
}

/**
 * Получить все доступные модули для пользователя
 */
export function getAvailableModules(
  modules: string[],
  isAuthenticated: boolean,
  hasCompletedOnboarding: boolean
): ModuleCatalogItem[] {
  return MODULE_CATALOG.filter(module => {
    // Core модули всегда доступны
    if (module.isCore) return true;
    
    // Если модуль в списке разблокированных
    if (modules.includes(module.id)) return true;
    
    // Модули по регистрации
    if (module.accessType === 'registration') {
      return isAuthenticated && hasCompletedOnboarding;
    }
    
    // Платные модули (пока недоступны без покупки)
    if (module.accessType === 'paid') {
      return false;
    }
    
    // Модули по заявке
    if (module.accessType === 'request') {
      return false;
    }
    
    return false;
  });
}

/**
 * Получить бонусные модули при регистрации
 */
export function getBonusModulesOnRegistration(): ModuleCatalogItem[] {
  return MODULE_CATALOG.filter(module => module.bonusOnRegistration);
}

/**
 * Получить платные модули
 */
export function getPaidModules(): ModuleCatalogItem[] {
  return MODULE_CATALOG.filter(module => module.accessType === 'paid');
}

/**
 * Получить модули по заявке
 */
export function getRequestModules(): ModuleCatalogItem[] {
  return MODULE_CATALOG.filter(module => module.accessType === 'request');
}
