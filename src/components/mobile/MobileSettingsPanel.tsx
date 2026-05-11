'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/providers/app-provider'
import { db } from '@/lib/db/database'

interface Module {
  id: string
  name: string
  icon: string
  enabled: boolean
  visibleInMobile: boolean
}

const availableModules: Module[] = [
  { id: 'dashboard', name: 'Дашборд', icon: '📊', enabled: true, visibleInMobile: true },
  { id: 'tasks', name: 'Задачи', icon: '✅', enabled: true, visibleInMobile: true },
  { id: 'calendar', name: 'Календарь', icon: '📅', enabled: true, visibleInMobile: true },
  { id: 'finance', name: 'Финансы', icon: '💰', enabled: true, visibleInMobile: true },
  { id: 'crm', name: 'CRM', icon: '👥', enabled: true, visibleInMobile: false },
  { id: 'appointments', name: 'Записи', icon: '📋', enabled: true, visibleInMobile: true },
  { id: 'notes', name: 'Заметки', icon: '📝', enabled: true, visibleInMobile: false },
  { id: 'health', name: 'Здоровье', icon: '❤️', enabled: true, visibleInMobile: false },
  { id: 'mail', name: 'Почта', icon: '📧', enabled: true, visibleInMobile: false },
]

const contextColors = {
  home: 'from-purple-500 to-blue-500',
  work: 'from-green-500 to-emerald-600',
  study: 'from-orange-500 to-amber-500',
}

const contextNames = {
  home: '🏠 Дом',
  work: '💼 Работа',
  study: '📚 Учеба',
}

export default function MobileSettingsPanel({ onClose }: { onClose: () => void }) {
  const { currentContext, setCurrentContext, user } = useApp()
  const [modules, setModules] = useState<Module[]>(availableModules)
  const [activeTab, setActiveTab] = useState<'modules' | 'context'>('modules')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
  }, [])

  async function loadModules() {
    try {
      const configs = await db.moduleConfigs.toArray()
      const updatedModules = modules.map(mod => {
        const config = configs.find(c => c.module_id === mod.id)
        return {
          ...mod,
          enabled: config?.enabled ?? mod.enabled,
          visibleInMobile: config?.config?.visibleInMobile ?? mod.visibleInMobile,
        }
      })
      setModules(updatedModules)
    } catch (error) {
      console.error('Failed to load modules:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleModule(moduleId: string) {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const newEnabled = !module.enabled
    const newModules = modules.map(m => 
      m.id === moduleId ? { ...m, enabled: newEnabled } : m
    )
    setModules(newModules)

    try {
      const existing = await db.moduleConfigs.get({ user_id: user?.id || '', module_id: moduleId })
      
      if (existing) {
        await db.moduleConfigs.update(existing.id, {
          enabled: newEnabled,
          updated_at: new Date().toISOString(),
        } as any)
      } else {
        await db.moduleConfigs.add({
          id: crypto.randomUUID(),
          user_id: user?.id || '',
          module_id: moduleId,
          enabled: newEnabled,
          position: 0,
          config: {},
          last_used: new Date().toISOString(),
          context_visibility: { home: true, work: true, study: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
      }

      if (navigator.vibrate) navigator.vibrate(10)
    } catch (error) {
      console.error('Failed to update module:', error)
      // Rollback
      setModules(modules)
    }
  }

  async function toggleMobileVisibility(moduleId: string) {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const newVisible = !module.visibleInMobile
    const newModules = modules.map(m => 
      m.id === moduleId ? { ...m, visibleInMobile: newVisible } : m
    )
    setModules(newModules)

    try {
      const existing = await db.moduleConfigs.get({ user_id: user?.id || '', module_id: moduleId })
      
      if (existing) {
        await db.moduleConfigs.update(existing.id, {
          config: { ...existing.config, visibleInMobile: newVisible },
          updated_at: new Date().toISOString(),
        } as any)
      } else {
        await db.moduleConfigs.add({
          id: crypto.randomUUID(),
          user_id: user?.id || '',
          module_id: moduleId,
          enabled: true,
          position: 0,
          config: { visibleInMobile: newVisible },
          last_used: new Date().toISOString(),
          context_visibility: { home: true, work: true, study: true },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
      }

      if (navigator.vibrate) navigator.vibrate(10)
    } catch (error) {
      console.error('Failed to update module:', error)
      setModules(modules)
    }
  }

  function handleContextChange(context: 'home' | 'work' | 'study') {
    setCurrentContext(context)
    if (navigator.vibrate) navigator.vibrate(10)
  }

  const enabledModules = modules.filter(m => m.enabled)
  const mobileModules = modules.filter(m => m.visibleInMobile)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl animate-slide-up max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Настройки</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setActiveTab('modules')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'modules'
                  ? 'bg-white dark:bg-gray-700 shadow-md'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Модули ({enabledModules.length})
            </button>
            <button
              onClick={() => setActiveTab('context')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'context'
                  ? 'bg-white dark:bg-gray-700 shadow-md'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Контекст
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : activeTab === 'modules' ? (
            <div className="space-y-3">
              <p className="text-sm text-secondary mb-4">
                Включите модули, которые хотите видеть в приложении. Переключите тумблер, чтобы добавить/удалить модуль.
              </p>
              
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="card p-4"
                  style={{ backgroundColor: module.enabled ? 'rgba(139, 92, 246, 0.05)' : 'transparent' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{module.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{module.name}</h3>
                      <p className="text-xs text-secondary">
                        {module.enabled ? 'Включено' : 'Отключено'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Mobile visibility toggle */}
                      {module.enabled && (
                        <button
                          onClick={() => toggleMobileVisibility(module.id)}
                          className={`p-2 rounded-full transition-all ${
                            module.visibleInMobile
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                          style={{ minHeight: '44px', minWidth: '44px' }}
                          title="Показывать в нижней навигации"
                        >
                          {module.visibleInMobile ? '📱' : '📴'}
                        </button>
                      )}
                      
                      {/* Enable/disable toggle */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className={`relative w-14 h-8 rounded-full transition-all ${
                          module.enabled
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        style={{ minHeight: '44px' }}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                            module.enabled ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-secondary mb-4">
                Переключитесь между контекстами для разных сценариев использования.
              </p>

              {(['home', 'work', 'study'] as const).map((context) => (
                <button
                  key={context}
                  onClick={() => handleContextChange(context)}
                  className={`w-full p-4 rounded-xl transition-all ${
                    currentContext === context
                      ? `bg-gradient-to-r ${contextColors[context]} text-white shadow-lg scale-105`
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={{ minHeight: '60px' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {context === 'home' && '🏠'}
                      {context === 'work' && '💼'}
                      {context === 'study' && '📚'}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">
                        {context === 'home' && 'Домашний контекст'}
                        {context === 'work' && 'Рабочий контекст'}
                        {context === 'study' && 'Учебный контекст'}
                      </h3>
                      <p className="text-sm opacity-90">
                        {context === 'home' && 'Личные дела, семья, хобби'}
                        {context === 'work' && 'Рабочие задачи, проекты'}
                        {context === 'study' && 'Учеба, курсы, обучение'}
                      </p>
                    </div>
                    {currentContext === context && (
                      <div className="ml-auto text-2xl">✓</div>
                    )}
                  </div>
                </button>
              ))}

              {/* Context info */}
              <div className="card p-4 mt-4">
                <h4 className="font-semibold mb-2">💡 Как это работает</h4>
                <p className="text-sm text-secondary">
                  Каждый контекст имеет свои настройки видимости модулей. 
                  Например, в рабочем контексте могут быть видны только задачи и календарь, 
                  а дома — все модули.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-3xl">
          <div className="text-xs text-secondary text-center">
            {mobileModules.length} модулей в нижней навигации
          </div>
        </div>
      </div>
    </div>
  )
}
