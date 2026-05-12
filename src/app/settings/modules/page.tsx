'use client'

import { useState } from 'react'
import { MODULE_CATALOG } from '@/lib/module-catalog'
import { useAllModulesAccess } from '@/hooks/useModuleAccess'
import ModuleCard from '@/components/modules/ModuleCard'
import ModuleRequestModal from '@/components/ui/ModuleRequestModal'
import AppLayout from '@/components/layout/AppLayout'

export default function ModulesPage() {
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  
  const modulesWithAccess = useAllModulesAccess()
  
  const [filter, setFilter] = useState<'all' | 'available' | 'premium' | 'requested'>('all')
  
  const filteredModules = modulesWithAccess.filter(({ status, module }) => {
    if (filter === 'all') return true
    if (filter === 'available') return status === 'available' || module.isCore
    if (filter === 'premium') return status === 'locked-paid'
    if (filter === 'requested') return status === 'locked-request' && module.accessType === 'request'
    return true
  })
  
  const handleRequestModule = (module: any) => {
    setSelectedModule(module)
    setIsRequestModalOpen(true)
  }
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧩 Каталог модулей
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Выберите модули, которые хотите добавить в свой персональный OS
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Все ({modulesWithAccess.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'available'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            ✅ Доступные ({modulesWithAccess.filter(m => m.status === 'available' || m.module.isCore).length})
          </button>
          <button
            onClick={() => setFilter('premium')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'premium'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            💎 Premium ({modulesWithAccess.filter(m => m.status === 'locked-paid').length})
          </button>
          <button
            onClick={() => setFilter('requested')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'requested'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            ⏳ В разработке ({modulesWithAccess.filter(m => m.status === 'locked-request' && m.module.accessType === 'request').length})
          </button>
        </div>
        
        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map(({ module, status, price, subscriptionPrice }) => (
            <ModuleCard
              key={module.id}
              module={module}
              status={status}
              price={price}
              subscriptionPrice={subscriptionPrice}
              onPurchase={() => {
                console.log('Purchase module:', module.id)
                // TODO: Открыть модал оплаты
              }}
              onRequest={() => handleRequestModule(module)}
            />
          ))}
        </div>
        
        {/* Info */}
        <div className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            💡 Как это работает?
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✅</span>
              <span><strong>Core-модули</strong> (Дашборд, Задачи, Календарь) всегда бесплатны и доступны</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">🟡</span>
              <span><strong>Демо-режим</strong> доступен до регистрации с ограниченными данными</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">💎</span>
              <span><strong>Premium-модули</strong> можно купить разово или оформить подписку</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">⏳</span>
              <span><strong>Модули в разработке</strong> можно заказать через заявку</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500">🎁</span>
              <span><strong>Бонусный модуль</strong> автоматически разблокируется после регистрации</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Module Request Modal */}
      {selectedModule && (
        <ModuleRequestModal
          module={selectedModule}
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false)
            setSelectedModule(null)
          }}
        />
      )}
    </AppLayout>
  )
}
