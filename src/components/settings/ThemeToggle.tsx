'use client'

import { useTheme } from '@/providers/theme-provider'

export default function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()

  return (
    <div 
      className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"
      role="group"
      aria-label="Переключение темы"
    >
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'light' 
            ? 'bg-white dark:bg-gray-700 shadow-md' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Светлая тема"
        aria-pressed={theme === 'light'}
        style={{ minHeight: '44px', minWidth: '44px' }}
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'dark' 
            ? 'bg-white dark:bg-gray-700 shadow-md' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Тёмная тема"
        aria-pressed={theme === 'dark'}
        style={{ minHeight: '44px', minWidth: '44px' }}
      >
        🌙
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-lg transition-all ${
          theme === 'system' 
            ? 'bg-white dark:bg-gray-700 shadow-md' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Системная тема"
        aria-pressed={theme === 'system'}
        style={{ minHeight: '44px', minWidth: '44px' }}
      >
        💻
      </button>
    </div>
  )
}
