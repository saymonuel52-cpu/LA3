'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/providers/app-provider'
import { contextEngine } from '@/core/context/context-engine'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { id: 'dashboard', name: 'Дашборд', icon: '📊', href: '/dashboard' },
  { id: 'tasks', name: 'Задачи', icon: '✅', href: '/tasks' },
  { id: 'calendar', name: 'Календарь', icon: '📅', href: '/calendar' },
  { id: 'finance', name: 'Финансы', icon: '💰', href: '/finance' },
  { id: 'crm', name: 'CRM', icon: '👥', href: '/crm' },
  { id: 'notes', name: 'Заметки', icon: '📝', href: '/notes' },
  { id: 'health', name: 'Здоровье', icon: '❤️', href: '/health' },
  { id: 'mail', name: 'Почта', icon: '📧', href: '/mail' },
]

// Top 5 sections for mobile bottom navigation
const mobileNavItems = ['dashboard', 'tasks', 'calendar', 'finance', 'crm']

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentContext, setCurrentContext, user } = useApp()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      setSwipeStartX(e.touches[0].clientX)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || swipeStartX === null) return
    
    const currentX = e.touches[0].clientX
    const diff = currentX - swipeStartX
    
    // Swipe from left edge (within 60px)
    if (swipeStartX < 60 && diff > 100 && !sidebarOpen) {
      setSidebarOpen(true)
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
    
    // Swipe to close
    if (sidebarOpen && swipeStartX > 200 && diff < -100) {
      setSidebarOpen(false)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  const handleTouchEnd = () => {
    setSwipeStartX(null)
  }

  // Handle navigation click
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Haptic feedback on active nav item
  const handleNavActive = (id: string) => {
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const contextConfig = contextEngine.getContextConfig(currentContext)
  const visibleModules = navigation.filter(mod => 
    contextConfig?.visibleModules.includes(mod.id)
  )

  const isActive = (path: string) => pathname === path

  return (
    <div 
      className="flex h-screen overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Desktop Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`
          sidebar
          hidden md:flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
          bg-white border-r border-gray-200
          transition-all duration-300
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>LAD 2</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Context Selector */}
        <div className="p-4 border-b border-gray-200">
          <select
            value={currentContext}
            onChange={(e) => setCurrentContext(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
            style={{ fontSize: '16px', minHeight: '44px' }}
          >
            <option value="home">🏠 Дом</option>
            <option value="work">💼 Работа</option>
            <option value="study">📚 Учеба</option>
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {visibleModules.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleNavClick}
              className={`nav-item flex items-center gap-3 px-4 py-3 rounded-lg transition-colors`}
              style={{
                minHeight: '44px',
                backgroundColor: isActive(item.href) ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                color: isActive(item.href) ? 'var(--color-primary)' : 'var(--color-text-primary)',
              }}
              onTouchStart={() => handleNavActive(item.id)}
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0) || 'U'}
              </div>
              {sidebarOpen && (
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <div 
          className={`mobile-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="mobile-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sidebar Content */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>LAD 2</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                ✕
              </button>
            </div>

            {/* Context Selector */}
            <div className="p-4 border-b border-gray-200">
              <select
                value={currentContext}
                onChange={(e) => setCurrentContext(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                style={{ fontSize: '16px', minHeight: '44px' }}
              >
                <option value="home">🏠 Дом</option>
                <option value="work">💼 Работа</option>
                <option value="study">📚 Учеба</option>
              </select>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {visibleModules.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg`}
                  style={{
                    minHeight: '44px',
                    backgroundColor: isActive(item.href) ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    color: isActive(item.href) ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  }}
                  onTouchStart={() => handleNavActive(item.id)}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div ref={contentRef} className="flex-1 flex flex-col main-content overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                ☰
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">
                {contextConfig?.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative" style={{ minHeight: '44px', minWidth: '44px' }}>
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              style={{ minHeight: '44px' }}
            >
              + Быстрое действие
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav safe-area-inset-bottom">
        {navigation.filter(item => mobileNavItems.includes(item.id)).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 h-full nav-item haptic-feedback"
            style={{
              color: isActive(item.href) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
            onTouchStart={() => handleNavActive(item.id)}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
