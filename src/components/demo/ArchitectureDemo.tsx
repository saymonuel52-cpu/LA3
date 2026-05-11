'use client'

import { useState } from 'react'

const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊', color: 'bg-blue-500', context: ['home', 'work', 'study'] },
  { id: 'tasks', name: 'Tasks', icon: '✅', color: 'bg-green-500', context: ['home', 'work', 'study'] },
  { id: 'calendar', name: 'Calendar', icon: '📅', color: 'bg-purple-500', context: ['home', 'work', 'study'] },
  { id: 'finance', name: 'Finance', icon: '💰', color: 'bg-emerald-500', context: ['home'] },
  { id: 'crm', name: 'CRM', icon: '👥', color: 'bg-amber-500', context: ['work'] },
  { id: 'notes', name: 'Notes', icon: '📝', color: 'bg-pink-500', context: ['home', 'work', 'study'] },
  { id: 'health', name: 'Health', icon: '❤️', color: 'bg-red-500', context: ['home'] },
  { id: 'mail', name: 'Mail', icon: '📧', color: 'bg-indigo-500', context: ['work'] },
]

const contexts = [
  { id: 'home', name: 'Дом', color: 'bg-blue-100 text-blue-800', icon: '🏠' },
  { id: 'work', name: 'Работа', color: 'bg-green-100 text-green-800', icon: '💼' },
  { id: 'study', name: 'Учеба', color: 'bg-purple-100 text-purple-800', icon: '📚' },
]

export default function ArchitectureDemo() {
  const [currentContext, setCurrentContext] = useState('home')
  const [enabledModules, setEnabledModules] = useState(['dashboard', 'tasks', 'calendar', 'notes'])
  const [showAI, setShowAI] = useState(false)

  const toggleModule = (moduleId: string) => {
    setEnabledModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const filteredModules = modules.filter(module => 
    module.context.includes(currentContext)
  )

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Context Selector */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Контекстный движок</h3>
            <p className="mt-2 text-sm text-gray-600">
              Выберите контекст — интерфейс адаптируется автоматически
            </p>
          </div>
          
          <div className="space-y-3">
            {contexts.map(context => (
              <button
                key={context.id}
                onClick={() => setCurrentContext(context.id)}
                className={`flex w-full items-center justify-between rounded-lg p-4 transition-all ${
                  currentContext === context.id 
                    ? 'ring-2 ring-offset-2 ring-blue-500' 
                    : 'hover:bg-gray-50'
                } ${context.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{context.icon}</span>
                  <span className="font-semibold">{context.name}</span>
                </div>
                {currentContext === context.id && (
                  <span className="text-sm font-medium">Активен</span>
                )}
              </button>
            ))}
          </div>

          {/* AI Toggle */}
          <div className="pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">AI как агент</h4>
                <p className="text-sm text-gray-600">Включите AI для автоматических действий</p>
              </div>
              <button
                onClick={() => setShowAI(!showAI)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  showAI ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showAI ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Center: Module Visualization */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Модульная система</h3>
            <p className="mt-2 text-sm text-gray-600">
              {currentContext === 'home' && 'В контексте "Дом" доступны модули для личной жизни'}
              {currentContext === 'work' && 'В контексте "Работа" доступны профессиональные инструменты'}
              {currentContext === 'study' && 'В контексте "Учеба" доступны образовательные модули'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredModules.map(module => {
              const isEnabled = enabledModules.includes(module.id)
              return (
                <div
                  key={module.id}
                  onClick={() => toggleModule(module.id)}
                  className={`relative rounded-xl border-2 p-4 text-center cursor-pointer transition-all ${
                    isEnabled 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${module.color} text-white text-xl`}>
                    {module.icon}
                  </div>
                  <h4 className="mt-3 font-semibold text-gray-900">{module.name}</h4>
                  <div className="mt-2 flex justify-center gap-1">
                    {module.context.map(ctx => (
                      <span
                        key={ctx}
                        className={`text-xs px-2 py-1 rounded-full ${
                          ctx === 'home' ? 'bg-blue-100 text-blue-800' :
                          ctx === 'work' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {ctx === 'home' ? '🏠' : ctx === 'work' ? '💼' : '📚'}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isEnabled ? 'Включен' : 'Выключен'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Data Flow Visualization */}
          <div className="mt-8 rounded-lg bg-gray-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-white">Local-First Data Flow</h4>
                <p className="text-sm text-gray-300">
                  Данные хранятся локально, синхронизация с облаком — опционально
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-green-400">IndexedDB активна</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="rounded-lg bg-gray-800 p-4">
                <div className="text-center">
                  <div className="text-2xl">💾</div>
                  <div className="text-xs text-gray-300 mt-1">Local DB</div>
                </div>
              </div>
              
              <div className="text-gray-400">⇄</div>
              
              <div className="rounded-lg bg-gray-800 p-4">
                <div className="text-center">
                  <div className="text-2xl">🔄</div>
                  <div className="text-xs text-gray-300 mt-1">CRDT Sync</div>
                </div>
              </div>
              
              <div className="text-gray-400">⇄</div>
              
              <div className="rounded-lg bg-gray-800 p-4">
                <div className="text-center">
                  <div className="text-2xl">☁️</div>
                  <div className="text-xs text-gray-300 mt-1">Cloud (опционально)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAI && (
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6 animate-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">AI Assistant активен</h4>
                <p className="text-sm text-gray-600">
                  {currentContext === 'home' && 'Готов помочь с личными задачами и финансами'}
                  {currentContext === 'work' && 'Готов помочь с профессиональными задачами и CRM'}
                  {currentContext === 'study' && 'Готов помочь с учебными материалами и заметками'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                Magic Button
              </button>
              <button className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                Floating Assistant
              </button>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-white p-3">
              <div className="text-sm font-medium text-gray-900">Parse Text to Task</div>
              <div className="text-xs text-gray-500">"Встреча с Иваном завтра в 15" → задача</div>
            </div>
            <div className="rounded-lg bg-white p-3">
              <div className="text-sm font-medium text-gray-900">Categorize Transaction</div>
              <div className="text-xs text-gray-500">"Starbucks $5.50" → Кафе/Кофе</div>
            </div>
            <div className="rounded-lg bg-white p-3">
              <div className="text-sm font-medium text-gray-900">Generate Reply</div>
              <div className="text-xs text-gray-500">Улучшить текст письма</div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700">Local DB: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-700">Modules: {enabledModules.length}/8</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-700">Context: {contexts.find(c => c.id === currentContext)?.name}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Архитектура LAD 2 готова к запуску. Все конфигурационные файлы созданы.
        </div>
      </div>
    </div>
  )
}