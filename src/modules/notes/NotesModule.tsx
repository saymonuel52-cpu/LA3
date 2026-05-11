'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/database'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export default function NotesModule() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    try {
      const allNotes = await db.notes.toArray()
      setNotes(allNotes.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        tags: n.tags,
        isPinned: n.is_pinned,
        createdAt: n.created_at,
        updatedAt: n.updated_at || n.last_edited || n.created_at,
      })) as unknown as Note[])
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createNote() {
    if (!newNote.title.trim()) return

    const note: Note = {
      id: crypto.randomUUID(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean),
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.notes.add({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags,
      is_pinned: note.isPinned,
      is_archived: false,
      last_edited: note.updatedAt,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
      sync_version: 1,
      user_id: '',
      workspace_id: '',
    } as any)
    setNewNote({ title: '', content: '', tags: '' })
    loadNotes()
  }

  async function updateNote(id: string, updates: Partial<Note>) {
    await db.notes.update(id, { ...updates, last_edited: new Date().toISOString() } as any)
    loadNotes()
  }

  async function deleteNote(id: string) {
    await db.notes.delete(id)
    if (selectedNote?.id === id) {
      setSelectedNote(null)
    }
    loadNotes()
  }

  async function togglePin(id: string) {
    const note = notes.find(n => n.id === id)
    if (note) {
      await updateNote(id, { isPinned: !note.isPinned })
    }
  }

  const filteredNotes = notes
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Notes List */}
      <div className="bg-white rounded-lg shadow-sm border flex flex-col">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Поиск заметок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-500">Загрузка...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">Нет заметок</div>
          ) : (
            <div className="divide-y">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedNote?.id === note.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium truncate flex-1">{note.title}</h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                      className={`ml-2 ${note.isPinned ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      📌
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {note.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(note.updatedAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Note Form */}
        <div className="p-4 border-t space-y-2">
          <input
            type="text"
            placeholder="Заголовок"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Содержание"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <input
            type="text"
            placeholder="Теги (через запятую)"
            value={newNote.tags}
            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={createNote}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Создать заметку
          </button>
        </div>
      </div>

      {/* Note Editor */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                  className="text-2xl font-semibold flex-1 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePin(selectedNote.id)}
                    className={`px-3 py-1 rounded ${selectedNote.isPinned ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'}`}
                  >
                    📌 {selectedNote.isPinned ? 'Закреплено' : 'Закрепить'}
                  </button>
                  <button
                    onClick={() => deleteNote(selectedNote.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {selectedNote.tags.map(tag => (
                  <span key={tag} className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Обновлено: {new Date(selectedNote.updatedAt).toLocaleString('ru-RU')}
              </div>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={selectedNote.content}
                onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                className="w-full h-full resize-none focus:outline-none text-gray-700"
                placeholder="Напишите что-нибудь..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Выберите заметку или создайте новую
          </div>
        )}
      </div>
    </div>
  )
}
