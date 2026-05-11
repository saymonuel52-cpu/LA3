'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/database'

export interface CalendarEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location?: string
  color: string
  createdAt: string
}

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-amber-500',
]

export default function CalendarModule() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    color: COLORS[0],
  })
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      const allEvents = await db.calendarEvents.toArray()
      setEvents(allEvents.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        startDate: e.start_time,
        endDate: e.end_time,
        location: e.location,
        color: (e as any).color || COLORS[0],
        createdAt: e.created_at,
      })) as unknown as CalendarEvent[])
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addEvent() {
    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate) return

    await db.calendarEvents.add({
      id: crypto.randomUUID(),
      title: newEvent.title,
      description: newEvent.description,
      start_time: newEvent.startDate,
      end_time: newEvent.endDate,
      location: newEvent.location,
      color: newEvent.color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      workspace_id: '',
      sync_version: 1,
    } as any)
    setNewEvent({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      color: COLORS[0],
    })
    loadEvents()
  }

  async function deleteEvent(id: string) {
    await db.calendarEvents.delete(id)
    loadEvents()
  }

  async function updateEvent(id: string, updates: Partial<CalendarEvent>) {
    await db.calendarEvents.update(id, updates as any)
    loadEvents()
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { daysInMonth, firstDay }
  }

  const { daysInMonth, firstDay } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.startDate.startsWith(dateStr))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">◀</button>
            <button onClick={nextMonth} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">▶</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="text-center font-medium text-gray-600 py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-gray-50" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayEvents = getEventsForDay(day)
            return (
              <div key={day} className="h-24 border p-1 bg-white hover:bg-gray-50">
                <div className="font-medium text-sm mb-1">{day}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} className={`text-xs text-white px-1 py-0.5 rounded truncate ${event.color}`}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 3} ещё</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Event Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Добавить событие</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Встреча, дедлайн..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Детали события..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
              <input
                type="datetime-local"
                value={newEvent.startDate}
                onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата конца</label>
              <input
                type="datetime-local"
                value={newEvent.endDate}
                onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Место</label>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Офис, онлайн..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цвет</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewEvent({ ...newEvent, color })}
                  className={`w-8 h-8 rounded-full ${color} ${newEvent.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={addEvent}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Добавить событие
          </button>
        </div>

        {/* Today's Events */}
        <div className="mt-8">
          <h3 className="font-semibold mb-3">События сегодня</h3>
          <div className="space-y-2">
            {loading ? (
              <div className="text-gray-500 text-sm">Загрузка...</div>
            ) : events.filter(e => e.startDate.startsWith(new Date().toISOString().split('T')[0])).length === 0 ? (
              <div className="text-gray-500 text-sm">Нет событий</div>
            ) : (
              events
                .filter(e => e.startDate.startsWith(new Date().toISOString().split('T')[0]))
                .map(event => (
                  <div key={event.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className={`w-3 h-3 rounded-full ${event.color}`} />
                    <span className="flex-1 text-sm">{event.title}</span>
                    <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-700">×</button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
