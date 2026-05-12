'use client'

import { ModuleCatalogItem } from '@/lib/module-catalog'
import { ModuleAccessStatus } from '@/stores/user-store'
import Link from 'next/link'

interface ModuleCardProps {
  module: ModuleCatalogItem
  status: ModuleAccessStatus
  price?: number
  subscriptionPrice?: number
  hasRequested?: boolean
  requestStatus?: 'pending' | 'approved' | 'rejected'
  onPurchase?: () => void
  onRequest?: () => void
}

/**
 * Карточка модуля с разными состояниями доступа
 */
export default function ModuleCard({
  module,
  status,
  price,
  subscriptionPrice,
  hasRequested,
  requestStatus,
  onPurchase,
  onRequest
}: ModuleCardProps) {
  const isAvailable = status === 'available'
  const isDemo = status === 'demo'
  const isLockedReg = status === 'locked-reg'
  const isLockedPaid = status === 'locked-paid'
  const isLockedRequest = status === 'locked-request'
  
  const getStatusBadge = () => {
    if (isAvailable) {
      return null
    }
    if (isDemo) {
      return (
        <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
          🟡 Демо
        </span>
      )
    }
    if (isLockedReg) {
      return (
        <span className="absolute top-2 right-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
          🔒 Регистрация
        </span>
      )
    }
    if (isLockedPaid) {
      return (
        <span className="absolute top-2 right-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
          💎 Premium
        </span>
      )
    }
    if (isLockedRequest) {
      if (requestStatus === 'pending') {
        return (
          <span className="absolute top-2 right-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
            ⏳ На рассмотрении
          </span>
        )
      }
      if (requestStatus === 'approved') {
        return (
          <span className="absolute top-2 right-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
            ✅ Одобрено
          </span>
        )
      }
      return (
        <span className="absolute top-2 right-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
          🔒 Заявка
        </span>
      )
    }
    return null
  }
  
  const getButtonText = () => {
    if (isAvailable) {
      return 'Открыть'
    }
    if (isDemo) {
      return 'Попробовать'
    }
    if (isLockedReg) {
      return 'Доступно после регистрации'
    }
    if (isLockedPaid) {
      return price ? `Купить за ${price}₽` : 'Оформить подписку'
    }
    if (isLockedRequest) {
      if (hasRequested) {
        return requestStatus === 'pending' ? 'Заявка отправлена' : 'Оставить заявку'
      }
      return 'Оставить заявку'
    }
    return 'Недоступно'
  }
  
  const getButtonVariant = () => {
    if (isAvailable) return 'primary'
    if (isDemo) return 'warning'
    if (isLockedReg) return 'secondary'
    if (isLockedPaid) return 'premium'
    if (isLockedRequest) return 'info'
    return 'secondary'
  }
  
  const isClickable = isAvailable || isDemo || (isLockedRequest && (!hasRequested || requestStatus === 'rejected'))
  
  return (
    <div
      className={`
        relative bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300
        ${isClickable 
          ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' 
          : 'opacity-75 cursor-not-allowed'
        }
        ${isAvailable ? 'border-transparent hover:border-purple-300 dark:hover:border-purple-700' : 'border-gray-200 dark:border-gray-700'}
      `}
    >
      {/* Оверлей для заблокированных модулей */}
      {(isLockedReg || isLockedPaid || (isLockedRequest && hasRequested && requestStatus !== 'rejected')) && (
        <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-4xl mb-2">🔒</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {isLockedReg && 'Доступно после регистрации'}
              {isLockedPaid && 'Premium модуль'}
              {isLockedRequest && hasRequested && requestStatus === 'pending' && 'Заявка на рассмотрении'}
            </p>
          </div>
        </div>
      )}
      
      {/* Статусный бейдж */}
      {getStatusBadge()}
      
      {/* Контент карточки */}
      <div className="p-6">
        {/* Иконка и название */}
        <div className="mb-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${module.color} text-white text-3xl mb-3 shadow-lg`}>
            {module.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {module.name}
          </h3>
          {module.beta && (
            <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full mb-2">
              Beta
            </span>
          )}
        </div>
        
        {/* Описание */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {module.description}
        </p>
        
        {/* Цена для платных модулей */}
        {isLockedPaid && price && (
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {price}₽
            </div>
            {subscriptionPrice && (
              <div className="text-xs text-purple-600 dark:text-purple-400">
                или {subscriptionPrice}₽/мес
              </div>
            )}
          </div>
        )}
        
        {/* Кнопка */}
        <button
          className={`
            w-full py-3 rounded-xl font-medium transition-all
            ${isClickable ? 'hover:shadow-lg active:scale-95' : ''}
            ${getButtonVariant() === 'primary' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/30' 
              : ''}
            ${getButtonVariant() === 'warning' 
              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
              : ''}
            ${getButtonVariant() === 'secondary' 
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
              : ''}
            ${getButtonVariant() === 'premium' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/30' 
              : ''}
            ${getButtonVariant() === 'info' 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : ''}
          `}
          style={{ minHeight: '44px' }}
          disabled={!isClickable}
          onClick={() => {
            if (isLockedPaid && onPurchase) {
              onPurchase()
            } else if (isLockedRequest && onRequest) {
              onRequest()
            } else if (isClickable && module.id) {
              // Переход к модулю
              console.log(`Opening module: ${module.id}`)
            }
          }}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}
