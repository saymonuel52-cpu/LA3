'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/database'

export interface Email {
  id: string
  from: string
  fromName: string
  to: string
  subject: string
  body: string
  date: string
  isRead: boolean
  isStarred: boolean
  isSent: boolean
  attachments?: string[]
}

const FOLDERS = [
  { id: 'inbox', name: 'Входящие', icon: '📥' },
  { id: 'sent', name: 'Отправленные', icon: '📤' },
  { id: 'drafts', name: 'Черновики', icon: '📝' },
  { id: 'trash', name: 'Корзина', icon: '🗑️' },
]

export default function MailModule() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [currentFolder, setCurrentFolder] = useState('inbox')
  const [composeOpen, setComposeOpen] = useState(false)
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', body: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmails()
  }, [])

  async function loadEmails() {
    try {
      const allLogs = await db.activityLogs.where('module_id').equals('mail').toArray()
      const emailsData = allLogs.map(log => log.changes as Email)
      setEmails(emailsData)
    } catch (error) {
      console.error('Failed to load emails:', error)
    } finally {
      setLoading(false)
    }
  }

  async function sendEmail() {
    if (!newEmail.to || !newEmail.subject) return

    const email: Email = {
      id: crypto.randomUUID(),
      from: 'user@lad2.app',
      fromName: 'Вы',
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      date: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isSent: true,
    }

    await db.activityLogs.add({
      id: email.id,
      userId: '',
      moduleId: 'mail',
      action: 'email_sent',
      entityType: 'email',
      entityId: email.id,
      changes: email,
      timestamp: email.date,
      syncStatus: 'local',
    } as any)

    setNewEmail({ to: '', subject: '', body: '' })
    setComposeOpen(false)
    loadEmails()
  }

  async function toggleStar(id: string) {
    const email = emails.find(e => e.id === id)
    if (email) {
      await db.activityLogs.update(email.id, {
        changes: { ...email, isStarred: !email.isStarred }
      } as any)
      loadEmails()
    }
  }

  async function markAsRead(id: string) {
    const email = emails.find(e => e.id === id)
    if (email && !email.isRead) {
      await db.activityLogs.update(email.id, {
        changes: { ...email, isRead: true }
      } as any)
      loadEmails()
    }
  }

  async function deleteEmail(id: string) {
    const email = emails.find(e => e.id === id)
    if (email) {
      await db.activityLogs.update(email.id, {
        changes: { ...email, isSent: false, to: 'trash' }
      } as any)
      loadEmails()
      if (selectedEmail?.id === id) {
        setSelectedEmail(null)
      }
    }
  }

  const filteredEmails = emails.filter(email => {
    if (currentFolder === 'inbox') return !email.isSent && email.to !== 'trash'
    if (currentFolder === 'sent') return email.isSent
    if (currentFolder === 'trash') return email.to === 'trash'
    return true
  })

  const unreadCount = emails.filter(e => !e.isRead && !e.isSent && e.to !== 'trash').length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      {/* Folders */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <button
          onClick={() => setComposeOpen(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
        >
          ✏️ Написать
        </button>

        <div className="space-y-1">
          {FOLDERS.map(folder => (
            <button
              key={folder.id}
              onClick={() => {
                setCurrentFolder(folder.id)
                setSelectedEmail(null)
              }}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg ${
                currentFolder === folder.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{folder.icon}</span>
                <span>{folder.name}</span>
              </div>
              {folder.id === 'inbox' && unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-lg shadow-sm border flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">
            {FOLDERS.find(f => f.id === currentFolder)?.name}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500">Загрузка...</div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">Нет писем</div>
          ) : (
            <div className="divide-y">
              {filteredEmails.map(email => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email)
                    markAsRead(email.id)
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                  } ${!email.isRead ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{email.isSent ? 'To:' : 'From:'}</span>
                        <span>{email.isSent ? email.to : email.fromName}</span>
                        {!email.isRead && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <div className="font-medium mt-1">{email.subject}</div>
                      <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {email.body}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className="text-xs text-gray-500">
                        {new Date(email.date).toLocaleDateString('ru-RU')}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}
                        className={`text-lg ${email.isStarred ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Detail */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col">
        {selectedEmail ? (
          <>
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {selectedEmail.fromName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{selectedEmail.fromName}</div>
                      <div className="text-sm text-gray-500">{selectedEmail.from}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {new Date(selectedEmail.date).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStar(selectedEmail.id)}
                    className={`px-3 py-1 rounded ${selectedEmail.isStarred ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}
                  >
                    ★
                  </button>
                  <button
                    onClick={() => deleteEmail(selectedEmail.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="prose max-w-none">
                {selectedEmail.body.split('\n').map((line, i) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Выберите письмо для просмотра
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Новое письмо</h2>
              <button
                onClick={() => setComposeOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Кому"
                value={newEmail.to}
                onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Тема"
                value={newEmail.subject}
                onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Сообщение"
                value={newEmail.body}
                onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={10}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setComposeOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Отмена
                </button>
                <button
                  onClick={sendEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
