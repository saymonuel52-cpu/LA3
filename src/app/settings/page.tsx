'use client'

import { useState } from 'react'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import ThemeToggle from '@/components/settings/ThemeToggle'
import BackupSettings from '@/components/settings/BackupSettings'
import DataSettings from '@/components/settings/DataSettings'
import { DataMode } from '@/hooks/useDashboardData'

export default function SettingsPage() {
  const [dataMode, setDataMode] = useState<DataMode>('demo')

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Настройки</h1>
          <p className="text-secondary">Управление приложением и данными</p>
        </div>

        {/* Data Settings */}
        <DataSettings currentMode={dataMode} onModeChange={setDataMode} />

        {/* Theme Settings */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Тема</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium dark:text-white">Цветовая схема</div>
              <div className="text-sm text-secondary">Светлая, тёмная или системная</div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Backup Settings */}
        <BackupSettings />

        {/* App Info */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">О приложении</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-secondary">Версия</span>
              <span className="dark:text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Тип</span>
              <span className="dark:text-white">Local-First PWA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">База данных</span>
              <span className="dark:text-white">IndexedDB (Dexie.js)</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
