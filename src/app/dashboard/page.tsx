'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import { useApp } from '@/providers/app-provider'
import { moduleRegistry } from '@/core/module-registry/module-registry'
import Link from 'next/link'

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊', color: 'bg-blue-500', href: '/dashboard' },
  { id: 'tasks', name: 'Задачи', icon: '✅', color: 'bg-green-500', href: '/tasks' },
  { id: 'calendar', name: 'Календарь', icon: '📅', color: 'bg-purple-500', href: '/calendar' },
  { id: 'finance', name: 'Финансы', icon: '💰', color: 'bg-emerald-500', href: '/finance' },
  { id: 'crm', name: 'CRM', icon: '👥', color: 'bg-amber-500', href: '/crm' },
  { id: 'notes', name: 'Заметки', icon: '📝', color: 'bg-pink-500', href: '/notes' },
  { id: 'health', name: 'Здоровье', icon: '❤️', color: 'bg-red-500', href: '/health' },
  { id: 'mail', name: 'Почта', icon: '📧', color: 'bg-indigo-500', href: '/mail' },
]

function DashboardContent() {
  const { currentContext } = useApp()
  
  const contextConfig = {
    home: { name: 'Дом', visibleModules: ['dashboard', 'tasks', 'calendar', 'finance', 'notes', 'health'] },
    work: { name: 'Работа', visibleModules: ['dashboard', 'tasks', 'calendar', 'crm', 'mail', 'notes'] },
    study: { name: 'Учеба', visibleModules: ['dashboard', 'tasks', 'calendar', 'notes'] },
  }[currentContext]

  const visibleModules = modules.filter(m => 
    contextConfig?.visibleModules.includes(m.id)
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Добро пожаловать, {currentContext === 'home' ? 'Дом' : currentContext === 'work' ? 'Работа' : 'Учеба'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Ваш персональный дашборд для {contextConfig?.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Активных задач</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Событий сегодня</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-gray-900">₽45K</div>
          <div className="text-sm text-gray-600">Расходы за месяц</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-gray-900">85%</div>
          <div className="text-sm text-gray-600">Продуктивность</div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Модули</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {visibleModules.map((module) => (
            <Link
              key={module.id}
              href={module.href}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${module.color} text-white text-2xl mb-4`}>
                {module.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Открыть модуль</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Недавняя активность</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Задача выполнена</div>
              <div className="text-sm text-gray-600">Завершена задача "Подготовить отчёт"</div>
            </div>
            <span className="text-sm text-gray-500">2 часа назад</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">📧</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Новое письмо</div>
              <div className="text-sm text-gray-600">Получено письмо от Иван Иванов</div>
            </div>
            <span className="text-sm text-gray-500">4 часа назад</span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-2xl">📅</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Событие в календаре</div>
              <div className="text-sm text-gray-600">Встреча с командой в 15:00</div>
            </div>
            <span className="text-sm text-gray-500">Завтра</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <DashboardContent />
    </ProtectedLayout>
  )
}
