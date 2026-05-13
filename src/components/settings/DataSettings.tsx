'use client'

import { useState } from 'react'
import { db } from '@/lib/db/database'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function DataSettings() {
  const [isClearing, setIsClearing] = useState(false)
  const [clearStatus, setClearStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleClearDemoData = async () => {
    setIsClearing(true)
    setClearStatus(null)

    try {
      // Удаляем все записи с isDemo = true из соответствующих таблиц
      const demoTasks = await db.tasks.filter(task => task.isDemo === true).toArray()
      const demoEvents = await db.calendarEvents.filter(event => event.isDemo === true).toArray()
      const demoTransactions = await db.transactions.filter(transaction => transaction.isDemo === true).toArray()
      
      // Удаляем каждую запись по отдельности
      for (const task of demoTasks) {
        if (task.id) await db.tasks.delete(String(task.id))
      }
      for (const event of demoEvents) {
        if (event.id) await db.calendarEvents.delete(String(event.id))
      }
      for (const transaction of demoTransactions) {
        if (transaction.id) await db.transactions.delete(String(transaction.id))
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
      setShowConfirmModal(false)
    }
  }

  const openConfirmModal = () => {
    setShowConfirmModal(true)
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4 dark:text-white">Управление данными</h3>
      
      <div className="space-y-6">
        {/* Очистка демо-данных */}
        <div>
          <h4 className="font-medium mb-2 dark:text-white">Сброс всех данных</h4>
          <p className="text-sm text-secondary mb-3">
            Удалите все данные из базы данных, чтобы начать работу с чистой базой.
            Это действие удалит все записи: задачи, события, транзакции, контакты и другие данные.
            <strong>Это действие нельзя отменить!</strong>
          </p>
          <button
            onClick={openConfirmModal}
            disabled={isClearing}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
            style={{ minHeight: '44px' }}
          >
            {isClearing ? 'Удаление...' : '🗑️ Сбросить все данные'}
          </button>
          
          {clearStatus && (
            <div className={`mt-3 p-3 rounded-lg ${clearStatus.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
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
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Внимание:</strong> Все операции с данными выполняются локально в вашем браузере.
              Перед сбросом рекомендуется создать резервную копию важных данных.
            </div>
          </div>
        </div>
      </div>

      {/* Подтверждение удаления */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleClearDemoData}
        title="Сбросить все данные?"
        description="Это действие удалит ВСЕ данные из вашей локальной базы: задачи, события, транзакции, контакты и другие записи. Это действие нельзя отменить. Продолжить?"
        confirmText="Да, удалить всё"
        cancelText="Отмена"
        variant="danger"
      />
    </div>
  )
}
