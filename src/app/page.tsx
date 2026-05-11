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

function ArchitectureDemo() {
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

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 mb-6">
              🚀 НОВОЕ ПОКОЛЕНИЕ
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              LAD 2 — ваша
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Персональная ОС
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
              Local Adaptive Dashboard 2 — это не просто приложение. Это операционная система для вашей жизни, 
              работающая идеально без интернета, адаптирующаяся под контекст и расширяемая как Lego.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#demo"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                🎯 Запустить демо
              </a>
              <a
                href="#architecture"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-8 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
              >
                🏗️ Изучить архитектуру
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Core Principles */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Пять принципов LAD 2
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Нарушать нельзя. Это основа философии продукта.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                title: "Local-First",
                description: "Работает идеально БЕЗ интернета. Данные хранятся локально.",
                icon: "💾",
                color: "bg-blue-100 text-blue-800"
              },
              {
                title: "Zero-Config",
                description: "Установка в 1 клик. Никаких .env файлов для пользователя.",
                icon: "⚡",
                color: "bg-green-100 text-green-800"
              },
              {
                title: "Context-Aware",
                description: "Интерфейс меняется под задачу (Дом / Работа / Учеба).",
                icon: "🎭",
                color: "bg-purple-100 text-purple-800"
              },
              {
                title: "Modular",
                description: "Собирайте приложение как Lego. Включайте/выключайте модули.",
                icon: "🧩",
                color: "bg-yellow-100 text-yellow-800"
              },
              {
                title: "AI as Agent",
                description: "AI не просто чатится, он ДЕЙСТВУЕТ: создает задачи, парсит чеки.",
                icon: "🤖",
                color: "bg-red-100 text-red-800"
              }
            ].map((principle, index) => (
              <div key={index} className="relative rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`inline-flex rounded-lg p-3 ${principle.color} text-2xl`}>
                  {principle.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{principle.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architecture Demo */}
      <div id="demo" className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Демонстрация архитектуры
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Интерактивная визуализация модульной системы LAD 2
            </p>
          </div>
          
          <div className="mt-12">
            <ArchitectureDemo />
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div id="architecture" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Технологический стек
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Современные технологии для реализации принципов Local-First и AI-First
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { name: "Next.js 14", logo: "⚡", desc: "App Router" },
              { name: "React 18", logo: "⚛️", desc: "Concurrent Features" },
              { name: "TypeScript", logo: "📘", desc: "Strict Mode" },
              { name: "Tailwind CSS", logo: "🎨", desc: "Utility-First" },
              { name: "Dexie.js", logo: "💾", desc: "IndexedDB" },
              { name: "Supabase", logo: "🛢️", desc: "Postgres + Auth" },
              { name: "Zustand", logo: "🔄", desc: "State Management" },
              { name: "Radix UI", logo: "🎯", desc: "Headless Components" },
              { name: "Vercel AI", logo: "🤖", desc: "AI SDK" },
              { name: "WebLLM", logo: "🧠", desc: "Local AI" },
              { name: "Docker", logo: "🐳", desc: "Containerization" },
              { name: "PWA", logo: "📱", desc: "Progressive Web App" }
            ].map((tech, index) => (
              <div key={index} className="flex flex-col items-center rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-3xl">{tech.logo}</div>
                <h3 className="mt-3 font-semibold text-gray-900">{tech.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Как запустить LAD 2?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Три способа начать работу с вашей персональной ОС
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">1. Локальная разработка</div>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/30 p-4 text-sm text-white">
{`npm install
npm run dev`}
              </pre>
              <p className="mt-4 text-blue-100">
                Идеально для изучения архитектуры и внесения изменений
              </p>
            </div>
            
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">2. Docker (Self-Hosted)</div>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/30 p-4 text-sm text-white">
{`docker compose up -d`}
              </pre>
              <p className="mt-4 text-blue-100">
                Полное развертывание с базой данных и Redis для production
              </p>
            </div>
            
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">3. Vercel (Cloud)</div>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-black/30 p-4 text-sm text-white">
{`vercel deploy`}
              </pre>
              <p className="mt-4 text-blue-100">
                Мгновенное развертывание в облаке с автоматическими обновлениями
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                // Имитация запуска
                alert('🚀 Запускаем LAD 2...\n\n1. Устанавливаем зависимости\n2. Инициализируем базу данных\n3. Запускаем сервер разработки\n\nПриложение будет доступно по адресу http://localhost:3000');
              }}
            >
              🚀 Запустить сейчас
            </a>
            <p className="mt-4 text-sm text-blue-200">
              Все конфигурационные файлы уже созданы. Осталось только запустить!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">LAD 2</div>
            <p className="mt-2 text-gray-400">
              Local Adaptive Dashboard — Personal Operating System
            </p>
            <p className="mt-8 text-sm text-gray-500">
              Архитектура создана как фундамент для разработки. Все файлы конфигурации, схемы БД и планы реализации готовы к использованию.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white">📁 project-structure.json</a>
              <a href="#" className="hover:text-white">🏗️ architecture-schema.json</a>
              <a href="#" className="hover:text-white">🛢️ src/lib/db/schema.ts</a>
              <a href="#" className="hover:text-white">🤖 ai-integration-plan.md</a>
              <a href="#" className="hover:text-white">🐳 docker-compose.yml</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}