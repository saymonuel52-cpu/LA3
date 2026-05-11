'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/database'

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  tags: string[]
  notes: string
  lastContacted?: string
  nextFollowUp?: string
  createdAt: string
}

export default function CRMModule() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    tags: '',
    notes: '',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'lead' | 'customer' | 'partner'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    try {
      const allContacts = await db.contacts.toArray()
      setContacts(allContacts.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        position: c.position,
        tags: c.tags,
        notes: c.notes,
        lastContacted: c.last_contacted,
        nextFollowUp: c.next_follow_up,
        createdAt: c.created_at,
      })) as unknown as Contact[])
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addContact() {
    if (!newContact.name) return

    const contact: Contact = {
      id: crypto.randomUUID(),
      ...newContact,
      tags: newContact.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    }

    await db.contacts.add({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      position: contact.position,
      tags: contact.tags,
      notes: contact.notes,
      last_contacted: contact.lastContacted,
      next_follow_up: contact.nextFollowUp,
      created_at: contact.createdAt,
      user_id: '',
      workspace_id: '',
      sync_version: 1,
    } as any)
    setNewContact({ name: '', email: '', phone: '', company: '', position: '', tags: '', notes: '' })
    loadContacts()
  }

  async function updateContact(id: string, updates: Partial<Contact>) {
    await db.contacts.update(id, updates as any)
    loadContacts()
  }

  async function deleteContact(id: string) {
    await db.contacts.delete(id)
    if (selectedContact?.id === id) {
      setSelectedContact(null)
    }
    loadContacts()
  }

  async function logContact(id: string) {
    await updateContact(id, { lastContacted: new Date().toISOString() })
  }

  const filteredContacts = contacts
    .filter(contact => {
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      if (!matchesSearch) return false
      if (filter === 'all') return true
      
      // Simple filter based on tags
      const tagMap: Record<string, string[]> = {
        lead: ['потенциальный', 'лид', 'заинтересован'],
        customer: ['клиент', 'покупатель', 'заказчик'],
        partner: ['партнёр', 'поставщик', 'коллега'],
      }
      
      const filterTags = tagMap[filter] || []
      return contact.tags.some(tag => filterTags.some(ft => tag.toLowerCase().includes(ft)))
    })

  const stats = {
    total: contacts.length,
    leads: contacts.filter(c => c.tags.some(t => ['лид', 'потенциальный', 'заинтересован'].some(ft => t.toLowerCase().includes(ft)))).length,
    customers: contacts.filter(c => c.tags.some(t => ['клиент', 'покупатель', 'заказчик'].some(ft => t.toLowerCase().includes(ft)))).length,
    followUps: contacts.filter(c => c.nextFollowUp && new Date(c.nextFollowUp!) <= new Date()).length,
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow-sm border flex flex-col">
        {/* Stats */}
        <div className="p-4 border-b grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Всего</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.leads}</div>
            <div className="text-xs text-gray-500">Лиды</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.customers}</div>
            <div className="text-xs text-gray-500">Клиенты</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.followUps}</div>
            <div className="text-xs text-gray-500">Напоминания</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b space-y-2">
          <input
            type="text"
            placeholder="Поиск контактов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            {(['all', 'lead', 'customer', 'partner'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 text-xs rounded ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {f === 'all' && 'Все'}
                {f === 'lead' && 'Лиды'}
                {f === 'customer' && 'Клиенты'}
                {f === 'partner' && 'Партнёры'}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500">Загрузка...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">Нет контактов</div>
          ) : (
            <div className="divide-y">
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{contact.name}</h3>
                      {contact.company && (
                        <div className="text-sm text-gray-600">{contact.company}</div>
                      )}
                      {contact.position && (
                        <div className="text-sm text-gray-500">{contact.position}</div>
                      )}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {contact.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {contact.nextFollowUp && (
                      <div className="text-xs text-yellow-600 ml-2">
                        📅 {new Date(contact.nextFollowUp).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Contact Form */}
        <div className="p-4 border-t space-y-2">
          <input
            type="text"
            placeholder="Имя *"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Телефон"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Компания"
              value={newContact.company}
              onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Должность"
              value={newContact.position}
              onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="text"
            placeholder="Теги (через запятую)"
            value={newContact.tags}
            onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addContact}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Добавить контакт
          </button>
        </div>
      </div>

      {/* Contact Details */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col overflow-y-auto">
        {selectedContact ? (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{selectedContact.name}</h2>
                {selectedContact.position && (
                  <p className="text-gray-600">{selectedContact.position}</p>
                )}
                {selectedContact.company && (
                  <p className="text-gray-500">{selectedContact.company}</p>
                )}
              </div>
              <button
                onClick={() => deleteContact(selectedContact.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Удалить
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <input
                  type="email"
                  value={selectedContact.email}
                  onChange={(e) => updateContact(selectedContact.id, { email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Телефон</label>
                <input
                  type="tel"
                  value={selectedContact.phone}
                  onChange={(e) => updateContact(selectedContact.id, { phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Заметки</label>
              <textarea
                value={selectedContact.notes}
                onChange={(e) => updateContact(selectedContact.id, { notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Дополнительная информация..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Последний контакт</label>
                <div className="mt-1">
                  {selectedContact.lastContacted ? (
                    <span className="text-gray-700">
                      {new Date(selectedContact.lastContacted).toLocaleString('ru-RU')}
                    </span>
                  ) : (
                    <span className="text-gray-400">Не зафиксирован</span>
                  )}
                </div>
                <button
                  onClick={() => logContact(selectedContact.id)}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                >
                  Зафиксировать контакт
                </button>
              </div>
              <div>
                <label className="text-sm text-gray-500">Следующий follow-up</label>
                <input
                  type="datetime-local"
                  value={selectedContact.nextFollowUp?.slice(0, 16) || ''}
                  onChange={(e) => updateContact(selectedContact.id, { nextFollowUp: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Теги</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {selectedContact.tags.map(tag => (
                  <span key={tag} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Выберите контакт для просмотра деталей
          </div>
        )}
      </div>
    </div>
  )
}
