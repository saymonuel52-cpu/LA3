import { db } from './db/database'

export async function exportDatabase(): Promise<Blob> {
  const data = {
    version: 1,
    exported_at: new Date().toISOString(),
    app_version: '1.0.0',
    tables: {} as Record<string, any[]>
  }

  // Export all tables
  const tables = [
    'tasks', 'calendarEvents', 'transactions', 'notes', 
    'contacts', 'procedures', 'appointments', 'clients',
    'moduleConfigs', 'settings', 'workspaces', 'activityLogs'
  ]

  for (const table of tables) {
    try {
      // @ts-ignore
      const records = await db[table].toArray()
      data.tables[table] = records
    } catch (error) {
      console.error(`Failed to export table ${table}:`, error)
      data.tables[table] = []
    }
  }

  const json = JSON.stringify(data, null, 2)
  return new Blob([json], { type: 'application/json' })
}

export async function downloadBackup(): Promise<string> {
  const blob = await exportDatabase()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  a.href = url
  a.download = `lad2-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  return a.download
}

export async function importDatabase(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString)
  
  if (!data.version || !data.tables) {
    throw new Error('Неверный формат резервной копии')
  }

  // Clear and import all tables
  const tableNames = Object.keys(data.tables) as (keyof typeof db)[]
  // @ts-ignore
  await db.transaction('rw', ...tableNames, async () => {
    for (const [tableName, records] of Object.entries(data.tables)) {
      try {
        // @ts-ignore
        await db[tableName].clear()
        // @ts-ignore
        if (records && Array.isArray(records)) {
          // @ts-ignore
          await db[tableName].bulkAdd(records)
        }
      } catch (error) {
        console.error(`Failed to import table ${tableName}:`, error)
      }
    }
  })

  window.location.reload()
}

export async function importBackupFile(file: File): Promise<void> {
  const text = await file.text()
  await importDatabase(text)
}

export async function scheduleAutoBackup(): Promise<void> {
  // Daily backup at 2 AM
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(2, 0, 0, 0)
  
  const timeUntilTomorrow = tomorrow.getTime() - now.getTime()
  
  setTimeout(async () => {
    try {
      const filename = await downloadBackup()
      console.log('Auto backup created:', filename)
      scheduleAutoBackup()
    } catch (error) {
      console.error('Auto backup failed:', error)
    }
  }, timeUntilTomorrow)
}

export async function getBackupSize(): Promise<number> {
  const blob = await exportDatabase()
  return blob.size
}

export async function verifyBackup(jsonString: string): Promise<{
  valid: boolean
  tables: number
  records: number
  error?: string
}> {
  try {
    const data = JSON.parse(jsonString)
    
    if (!data.version || !data.tables) {
      return { valid: false, tables: 0, records: 0, error: 'Неверный формат' }
    }

    let totalRecords = 0
    for (const records of Object.values(data.tables)) {
      if (Array.isArray(records)) {
        totalRecords += records.length
      }
    }

    return {
      valid: true,
      tables: Object.keys(data.tables).length,
      records: totalRecords
    }
  } catch (error) {
    return {
      valid: false,
      tables: 0,
      records: 0,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }
  }
}
