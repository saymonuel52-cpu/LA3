'use client'

import { useState } from 'react'
import { downloadBackup, importBackupFile, getBackupSize, verifyBackup } from '@/lib/backup'

export default function BackupSettings() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [backupInfo, setBackupInfo] = useState<{ size: number, date: string } | null>(null)

  async function handleExport() {
    setLoading(true)
    setMessage(null)
    
    try {
      const filename = await downloadBackup()
      const size = await getBackupSize()
      
      setBackupInfo({
        size,
        date: new Date().toLocaleString('ru-RU')
      })
      
      setMessage({
        type: 'success',
        text: `Резервная копия создана: ${filename}`
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Ошибка при создании резервной копии'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage(null)

    try {
      const text = await file.text()
      const verification = await verifyBackup(text)
      
      if (!verification.valid) {
        throw new Error(verification.error || 'Неверный формат файла')
      }

      const confirmed = confirm(
        `Найдено ${verification.records} записей в ${verification.tables} таблицах.\n\n` +
        'Это перезапишет все текущие данные. Продолжить?'
      )
      
      if (!confirmed) return

      await importBackupFile(file)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Ошибка при импорте'
      })
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 dark:text-white">Резервное копирование</h3>
        <p className="text-secondary">
          Экспорт и импорт всех данных приложения
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {backupInfo && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">💾</span>
            <div>
              <div className="font-semibold dark:text-white">Последняя резервная копия</div>
              <div className="text-sm text-secondary">
                {backupInfo.date} • {(backupInfo.size / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-backup"
          disabled={loading}
        />
        
        <button
          onClick={handleExport}
          disabled={loading}
          className="btn btn-primary flex-1 disabled:opacity-50"
          style={{
            background: loading ? '#CBD5E1' : 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
          }}
        >
          {loading ? 'Загрузка...' : '📥 Скачать резервную копию'}
        </button>

        <label
          htmlFor="import-backup"
          className="btn btn-secondary flex-1 cursor-pointer text-center"
        >
          📤 Восстановить из резервной копии
        </label>
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
        <div className="flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-semibold text-yellow-800 dark:text-yellow-200">
              Важно!
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Резервная копия содержит все ваши данные. Храните её в надёжном месте.
              При восстановлении текущие данные будут заменены.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
