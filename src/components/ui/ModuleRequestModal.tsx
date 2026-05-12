'use client'

import { useState } from 'react'
import { useUserStore } from '@/stores/user-store'
import { ModuleCatalogItem } from '@/lib/module-catalog'

interface ModuleRequestModalProps {
  module: ModuleCatalogItem
  isOpen: boolean
  onClose: () => void
}

export default function ModuleRequestModal({
  module,
  isOpen,
  onClose
}: ModuleRequestModalProps) {
  const [budget, setBudget] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { addRequest } = useUserStore()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      addRequest({
        moduleId: module.id,
        moduleName: module.name,
        budget: budget ? parseInt(budget) : undefined,
        comment: comment
      })
      
      // Показываем уведомление (здесь можно использовать toast)
      alert(`✅ Заявка на модуль "${module.name}" отправлена!`)
      
      // Сбрасываем форму и закрываем модал
      setBudget('')
      setComment('')
      onClose()
    } catch (error) {
      console.error('Ошибка при отправке заявки:', error)
      alert('❌ Ошибка при отправке заявки. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full z-10 p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
              Заявка на модуль
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {module.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Закрыть"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Описание модуля */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${module.color} flex items-center justify-center text-white text-2xl`}>
                {module.icon}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {module.description}
                </div>
                {module.longDescription && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {module.longDescription}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Бюджет */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ваш бюджет (опционально)
            </label>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Например: 500"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              style={{ minHeight: '44px' }}
              min="0"
              step="100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Укажите примерный бюджет, который вы готовы заплатить за разработку
            </p>
          </div>
          
          {/* Комментарий */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Комментарий <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Расскажите, какие функции вы хотели бы видеть в этом модуле..."
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={4}
              required
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              style={{ minHeight: '44px' }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '44px' }}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </div>
        </form>
        
        {/* Info */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 dark:text-yellow-400">ℹ️</span>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Заявка будет рассмотрена в течение 3-5 рабочих дней. Мы свяжемся с вами по email с предложением.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
