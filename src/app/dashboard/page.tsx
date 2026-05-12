'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import { useApp } from '@/providers/app-provider'
import { useDashboardData } from '@/hooks/useDashboardData'
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
  const { stats, recentActivity, modules: moduleConfig, contexts, isLoading, mode } = useDashboardData()
  
  const contextConfig = {
    home: { name: 'Дом', visibleModules: ['dashboard', 'tasks', 'calendar', 'finance', 'notes', 'health'] },
    work: { name: 'Работа', visibleModules: ['dashboard', 'tasks', 'calendar', 'crm', 'mail', 'notes'] },
    study: { name: 'Учеба', visibleModules: ['dashboard', 'tasks', 'calendar', 'notes'] },
  }[currentContext]

  const visibleModules = modules.filter(m => 
    contextConfig?.visibleModules.includes(m.id)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Загрузка данных...</div>
      </div>
    )
  }

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

      {/* Демо-режим бейдж */}
      {mode === 'demo' && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟡</span>
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Демо-режим</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Демо-данные показываются только до регистрации. После авторизации вы увидите свои реальные данные.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
            {stat.trend && (
              <div className="text-xs text-green-600 mt-1">{stat.trend} {stat.description}</div>
            )}
          </div>
        ))}
        
        {stats.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            Нет данных для отображения. Добавьте свои первые задачи, события или транзакции.
          </div>
        )}
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
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.title}</div>
                <div className="text-sm text-gray-600">{activity.description}</div>
              </div>
              <span className="text-sm text-gray-500">{activity.timestamp}</span>
            </div>
          ))}
          
          {recentActivity.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Нет недавней активности.
            </div>
          )}
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
