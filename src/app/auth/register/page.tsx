'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { useDashboardStore } from '@/stores/dashboard-store'
import { useUserStore } from '@/stores/user-store'
import { getBonusModulesOnRegistration } from '@/lib/module-catalog'

export default function RegisterPage() {
  const router = useRouter()
  const { switchToRealMode } = useDashboardStore()
  const { addUnlockedModule } = useUserStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      // TODO: Реальная реализация регистрации
      // Здесь будет вызов API для создания аккаунта
      
      // Эмуляция задержки
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // После успешной регистрации:
      // 1. Переключаемся на реальный режим данных
      switchToRealMode()
      
      // 2. Разблокируем бонусный модуль
      const bonusModules = getBonusModulesOnRegistration()
      if (bonusModules.length > 0) {
        const bonusModule = bonusModules[0] // Берём первый бонусный модуль
        addUnlockedModule(bonusModule.id)
        
        // TODO: Показать тост с уведомлением о бонусе
        alert(`🎁 Поздравляем! Вам разблокирован модуль: ${bonusModule.name}`)
      }
      
      // 3. Перенаправляем на дашборд
      router.push('/dashboard')
      
    } catch (err) {
      console.error('Ошибка регистрации:', err)
      setError('Ошибка при регистрации. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Создание аккаунта
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Зарегистрируйтесь, чтобы сохранить свои данные и разблокировать бонусы
            </p>
          </div>
          
          {/* Register Form */}
          <form onSubmit={handleRegister} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ minHeight: '44px' }}
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ minHeight: '44px' }}
                placeholder="Минимум 6 символов"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '44px' }}
            >
              {isLoading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          {/* Bonus Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Бонус при регистрации
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  После регистрации вы автоматически получите доступ к модулю <strong>Заметки</strong>!
                </p>
              </div>
            </div>
          </div>
          
          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
