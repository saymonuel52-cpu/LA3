'use client'

import { useState, useEffect } from 'react'
import dashboardDemo from '@/data/demo/dashboard.json'
import tasksDemo from '@/data/demo/tasks.json'
import calendarDemo from '@/data/demo/calendar.json'
import financeDemo from '@/data/demo/finance.json'
import { db } from '@/lib/db/database'
import { Task, CalendarEvent, Transaction } from '@/lib/db/schema'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useUserStore } from '@/stores/user-store'
import { useAuthStore } from '@/stores/auth-store'

export type DataMode = 'demo' | 'real'

export interface DashboardStats {
  id: string
  title: string
  value: number | string
  icon: string
  trend?: string
  description: string
}

export interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  icon: string
  timestamp: string
  module: string
}

export interface DashboardData {
  stats: DashboardStats[]
  recentActivity: RecentActivity[]
  modules: any[]
  contexts: any
  tasks: Task[]
  events: CalendarEvent[]
  transactions: Transaction[]
  isLoading: boolean
  mode: DataMode
}

/**
 * Хук для управления данными дашборда.
 * 
 * Логика демо-режима:
 * - Демо-данные показываются ТОЛЬКО если пользователь не авторизован ИЛИ не прошел онбординг
 * - После регистрации/онбординга автоматически переключается на реальные данные
 * - В настройках нет переключателя режимов — только кнопка сброса данных
 * 
 * Интеграция с auth:
 * - Слушает изменения в auth store
 * - При auth.status === 'authenticated' переключает на real mode
 * - При онбординге очищает демо-данные
 */
export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    stats: [],
    recentActivity: [],
    modules: [],
    contexts: {},
    tasks: [],
    events: [],
    transactions: [],
    isLoading: true,
    mode: 'real'
  })

  const { dataMode, setDataMode, switchToRealMode, switchToDemoMode } = useDashboardStore()
  const { clearDemoMode } = useUserStore()
  
  // Получаем состояние авторизации из auth store
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore()

  // Эффект для синхронизации с auth state
  useEffect(() => {
    // Проверяем авторизацию и онбординг
    const shouldUseDemo = !isAuthenticated || !hasCompletedOnboarding
    
    if (shouldUseDemo && dataMode !== 'demo') {
      // Включаем демо-режим
      switchToDemoMode()
    } else if (!shouldUseDemo && dataMode !== 'real') {
      // Переключаемся на реальные данные
      switchToRealMode()
      clearDemoMode()
    }
  }, [isAuthenticated, hasCompletedOnboarding, dataMode, switchToRealMode, switchToDemoMode, clearDemoMode])

  useEffect(() => {
    const loadData = async () => {
      setData(prev => ({ ...prev, isLoading: true }))

      try {
        // Проверяем авторизацию и онбординг
        const shouldUseDemo = !isAuthenticated || !hasCompletedOnboarding

        if (shouldUseDemo) {
          // Устанавливаем демо-режим
          setDataMode('demo')

          // Преобразуем демо-данные в полные типы схемы
          const demoTasks: Task[] = tasksDemo.tasks.map((task, index) => ({
            ...task,
            id: index + 1,
            user_id: 'demo-user',
            workspace_id: 'demo-workspace',
            context: 'work',
            sync_version: 1,
            status: task.status as 'todo' | 'in_progress' | 'done' | 'archived',
            priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })) as Task[];
          
          const demoEvents: CalendarEvent[] = calendarDemo.events.map(event => ({
            ...event,
            user_id: 'demo-user',
            workspace_id: 'demo-workspace',
            reminders: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_version: 1,
          }))
          
          const demoTransactions: Transaction[] = financeDemo.transactions.map(transaction => ({
            ...transaction,
            user_id: 'demo-user',
            workspace_id: 'demo-workspace',
            account_id: 'demo-account',
            ai_categorized: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_version: 1,
          }))
          
          setData({
            stats: dashboardDemo.stats,
            recentActivity: dashboardDemo.recentActivity,
            modules: dashboardDemo.modules,
            contexts: dashboardDemo.contexts,
            tasks: demoTasks,
            events: demoEvents,
            transactions: demoTransactions,
            isLoading: false,
            mode: 'demo'
          })
        } else {
          // Получаем реальные данные из БД
          const allTasks = await db.tasks.toArray()
          const allEvents = await db.calendarEvents.toArray()
          const allTransactions = await db.transactions.toArray()
          
          const realTasks = allTasks.filter(task => task.isDemo !== true)
          const realEvents = allEvents.filter(event => event.isDemo !== true)
          const realTransactions = allTransactions.filter(transaction => transaction.isDemo !== true)
          
          // Генерируем статистику на основе реальных данных
          const stats = generateStatsFromRealData(realTasks, realEvents, realTransactions)
          const recentActivity = generateRecentActivity(realTasks, realEvents, realTransactions)
          
          setData({
            stats,
            recentActivity,
            modules: dashboardDemo.modules,
            contexts: dashboardDemo.contexts,
            tasks: realTasks,
            events: realEvents,
            transactions: realTransactions,
            isLoading: false,
            mode: 'real'
          })
        }
      } catch (error) {
        console.error('Ошибка загрузки данных дашборда:', error)
        // В случае ошибки возвращаем преобразованные демо-данные как fallback
        const fallbackTasks: Task[] = tasksDemo.tasks.map((task, index) => ({
          ...task,
          id: index + 1,
          user_id: 'demo-user',
          workspace_id: 'demo-workspace',
          context: 'work',
          sync_version: 1,
          status: task.status as 'todo' | 'in_progress' | 'done' | 'archived',
          priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as Task[];
        
        const fallbackEvents: CalendarEvent[] = calendarDemo.events.map(event => ({
          ...event,
          user_id: 'demo-user',
          workspace_id: 'demo-workspace',
          reminders: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sync_version: 1,
        }))
        
        const fallbackTransactions: Transaction[] = financeDemo.transactions.map(transaction => ({
          ...transaction,
          user_id: 'demo-user',
          workspace_id: 'demo-workspace',
          account_id: 'demo-account',
          ai_categorized: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sync_version: 1,
        }))
        
        setData({
          stats: dashboardDemo.stats,
          recentActivity: dashboardDemo.recentActivity,
          modules: dashboardDemo.modules,
          contexts: dashboardDemo.contexts,
          tasks: fallbackTasks,
          events: fallbackEvents,
          transactions: fallbackTransactions,
          isLoading: false,
          mode: 'demo'
        })
      }
    }

    loadData()
  }, [isAuthenticated, hasCompletedOnboarding, dataMode])

  return data
}

/**
 * Генерация статистики на основе реальных данных из БД
 */
function generateStatsFromRealData(
  tasks: Task[],
  events: CalendarEvent[],
  transactions: Transaction[]
): DashboardStats[] {
  const today = new Date().toISOString().split('T')[0]

  const activeTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length
  const todayEvents = events.filter(e => e.start_time.startsWith(today)).length
  
  const monthlyExpenses = transactions
    .filter(t => !t.is_income)
    .reduce((sum, t) => sum + t.amount, 0)
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length
  const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return [
    {
      id: 'tasks',
      title: 'Активных задач',
      value: activeTasks,
      icon: '📋',
      trend: '+2',
      description: 'Задачи в работе'
    },
    {
      id: 'events',
      title: 'Событий сегодня',
      value: todayEvents,
      icon: '📅',
      trend: '-1',
      description: 'Запланированные события'
    },
    {
      id: 'finance',
      title: 'Расходы за месяц',
      value: `₽${monthlyExpenses.toLocaleString('ru-RU')}`,
      icon: '💰',
      trend: '+8%',
      description: 'По сравнению с прошлым месяцем'
    },
    {
      id: 'productivity',
      title: 'Продуктивность',
      value: `${productivity}%`,
      icon: '✅',
      trend: '+5%',
      description: 'Эффективность за неделю'
    }
  ]
}

/**
 * Генерация недавней активности на основе реальных данных
 */
function generateRecentActivity(
  tasks: Task[],
  events: CalendarEvent[],
  transactions: Transaction[]
): RecentActivity[] {
  const activities: RecentActivity[] = []
  
  // Добавляем последние выполненные задачи
  const recentTasks = tasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 2)
  
  recentTasks.forEach(task => {
    activities.push({
      id: `task-${task.id}`,
      type: 'task_completed',
      title: 'Задача выполнена',
      description: task.title,
      icon: '✅',
      timestamp: formatTimeAgo(task.updated_at),
      module: 'tasks'
    })
  })
  
  // Добавляем ближайшие события
  const upcomingEvents = events
    .filter(e => new Date(e.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 2)
  
  upcomingEvents.forEach(event => {
    activities.push({
      id: `event-${event.id}`,
      type: 'calendar_event',
      title: 'Событие в календаре',
      description: event.title,
      icon: '📅',
      timestamp: formatTimeAgo(event.start_time),
      module: 'calendar'
    })
  })
  
  // Добавляем последние транзакции
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 1)
  
  recentTransactions.forEach(transaction => {
    activities.push({
      id: `tx-${transaction.id}`,
      type: 'finance_transaction',
      title: 'Новая транзакция',
      description: `${transaction.merchant} - ₽${transaction.amount}`,
      icon: '💰',
      timestamp: formatTimeAgo(transaction.date),
      module: 'finance'
    })
  })
  
  return activities.slice(0, 5) // Ограничиваем 5 элементами
}

/**
 * Форматирование времени в относительный формат (например, "2 часа назад")
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays} ${pluralize(diffDays, 'день', 'дня', 'дней')} назад`
  } else if (diffHours > 0) {
    return `${diffHours} ${pluralize(diffHours, 'час', 'часа', 'часов')} назад`
  } else if (diffMins > 0) {
    return `${diffMins} ${pluralize(diffMins, 'минуту', 'минуты', 'минут')} назад`
  } else {
    return 'только что'
  }
}

/**
 * Склонение существительных по числам
 */
function pluralize(number: number, one: string, two: string, five: string): string {
  let n = Math.abs(number)
  n %= 100
  if (n >= 5 && n <= 20) {
    return five
  }
  n %= 10
  if (n === 1) {
    return one
  }
  if (n >= 2 && n <= 4) {
    return two
  }
  return five
}

