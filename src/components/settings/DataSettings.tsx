'use client'

import { useState } from 'react'
import { db } from '@/lib/db/database'
import { DataMode } from '@/hooks/useDashboardData'

interface DataSettingsProps {
  currentMode: DataMode
  onModeChange: (mode: DataMode) => void
}

export default function DataSettings({ currentMode, onModeChange }: DataSettingsProps) {
  const [isClearing, setIsClearing] = useState(false)
  const [clearStatus, setClearStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleClearDemoData = async () => {
    if (!confirm('Вы уверены, что хотите удалить все демо-данные? Это действие нельзя отменить.')) {
      return
    }

    setIsClearing(true)
    setClearStatus(null)

    try {
      // Удаляем все записи с isDemo = true из соответствующих таблиц
      // Используем фильтрацию в памяти, так как поле isDemo не проиндексировано
      const demoTasks = await db.tasks.filter(task => task.isDemo === true).toArray()
      const demoEvents = await db.calendarEvents.filter(event => event.isDemo === true).toArray()
      const demoTransactions = await db.transactions.filter(transaction => transaction.isDemo === true).toArray()
      
      // Удаляем каждую запись по отдельности
      for (const task of demoTasks) {
        await db.tasks.delete(task.id)
      }
      for (const event of demoEvents) {
        await db.calendarEvents.delete(event.id)
      }
      for (const transaction of demoTransactions) {
        await db.transactions.delete(transaction.id)
      }

      setClearStatus({
        type: 'success',
        message: 'Демо-данные успешно удалены из базы данных.'
      })
    } catch (error) {
      console.error('Ошибка при удалении демо-данных:', error)
      setClearStatus({
        type: 'error',
        message: 'Не удалось удалить демо-данные. Проверьте консоль для деталей.'
      })
    } finally {
      setIsClearing(false)
    }
  }

  const handleSeedDemoData = async () => {
    setIsClearing(true)
    setClearStatus(null)

    try {
      // Импортируем демо-данные из JSON файлов
      const tasksDemo = await import('@/data/demo/tasks.json')
      const calendarDemo = await import('@/data/demo/calendar.json')
      const financeDemo = await import('@/data/demo/finance.json')

      // Очищаем старые демо-данные перед добавлением новых
      await handleClearDemoData()

      // Добавляем задачи с приведением типов
      for (const task of tasksDemo.tasks) {
        await db.tasks.add({
          ...task,
          status: task.status as 'todo' | 'in_progress' | 'done' | 'archived',
          priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
          user_id: 'demo-user',
          workspace_id: 'demo-workspace',
          sync_version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      // Добавляем события
      for (const event of calendarDemo.events) {
        await db.calendarEvents.add({
          ...event,
          user_id: 'demo-user',
          workspace_id: 'demo-workspace',
          reminders: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sync_version: 1,
        })
      }

      // Добавляем транзакции
      for (const transaction of financeDemo.transactions) {
        await db.transactions.add({
          ...transaction,
          user_id: 'demo-user',
          workspace_id: 'demo-workspace',
          account_id: 'demo-account',
          ai_categorized: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sync_version: 1,
        })
      }

      setClearStatus({
        type: 'success',
        message: 'Демо-данные успешно загружены в базу данных.'
      })
    } catch (error) {
      console.error('Ошибка при загрузке демо-данных:', error)
      setClearStatus({
        type: 'error',
        message: 'Не удалось загрузить демо-данные. Проверьте консоль для деталей.'
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4 dark:text-white">Управление данными</h3>
      
      <div className="space-y-6">
        {/* Режим данных */}
        <div>
          <h4 className="font-medium mb-2 dark:text-white">Режим отображения данных</h4>
          <p className="text-sm text-secondary mb-3">
            Выберите, какие данные отображать на дашборде и в модулях.
          </p>
          <div className="flex flex-wrap gap-2">
            {(['demo', 'real', 'empty'] as DataMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  currentMode === mode
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {mode === 'demo' && 'Демо-данные'}
                {mode === 'real' && 'Реальные данные'}
                {mode === 'empty' && 'Пустой режим'}
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-secondary">
            {currentMode === 'demo' && 'Используются предзаполненные демо-данные из JSON файлов.'}
            {currentMode === 'real' && 'Используются реальные данные из вашей локальной базы данных (IndexedDB).'}
            {currentMode === 'empty' && 'Все виджеты и списки пустые. Идеально для начала работы с чистого листа.'}
          </div>
        </div>

        {/* Очистка демо-данных */}
        <div>
          <h4 className="font-medium mb-2 dark:text-white">Очистка демо-данных</h4>
          <p className="text-sm text-secondary mb-3">
            Удалите все демо-данные из базы данных, чтобы начать работу с чистой базой.
            Это действие удалит все записи, помеченные как демо (isDemo = true).
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleClearDemoData}
              disabled={isClearing}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isClearing ? 'Удаление...' : 'Удалить демо-данные'}
            </button>
            
            <button
              onClick={handleSeedDemoData}
              disabled={isClearing}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isClearing ? 'Загрузка...' : 'Загрузить демо-данные'}
            </button>
          </div>
          
          {clearStatus && (
            <div className={`mt-3 p-3 rounded-lg ${clearStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {clearStatus.message}
            </div>
          )}
        </div>

        {/* Информация о данных */}
        <div>
          <h4 className="font-medium mb-2 dark:text-white">Информация о данных</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="font-medium dark:text-white">Тип базы данных</div>
              <div className="text-secondary">IndexedDB (Dexie.js)</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="font-medium dark:text-white">Синхронизация</div>
              <div className="text-secondary">Локальная (offline-first)</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="font-medium dark:text-white">Резервное копирование</div>
              <div className="text-secondary">Ручной экспорт/импорт</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="font-medium dark:text-white">Размер данных</div>
              <div className="text-secondary">~5 МБ (демо-данные)</div>
            </div>
          </div>
        </div>

        {/* Предупреждение */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">⚠️</span>
            <div className="text-sm text-yellow-800">
              <strong>Внимание:</strong> Демо-данные предназначены только для ознакомления с функционалом.
              Для реального использования рекомендуется переключиться в режим «Реальные данные» и начать добавлять свои данные.
              Все операции с данными выполняются локально в вашем браузере.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
