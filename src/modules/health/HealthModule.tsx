'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/database'

export interface Habit {
  id: string
  name: string
  description: string
  category: 'health' | 'fitness' | 'learning' | 'productivity' | 'wellness'
  targetPerWeek: number
  color: string
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  value: number
  notes?: string
}

const CATEGORIES = [
  { value: 'health', label: 'Здоровье', color: 'bg-red-500' },
  { value: 'fitness', label: 'Фитнес', color: 'bg-green-500' },
  { value: 'learning', label: 'Обучение', color: 'bg-blue-500' },
  { value: 'productivity', label: 'Продуктивность', color: 'bg-purple-500' },
  { value: 'wellness', label: 'Благополучие', color: 'bg-pink-500' },
]

const COLORS = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500']

export default function HealthModule() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'health' as const,
    targetPerWeek: 3,
    color: COLORS[0],
  })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const allHabits = await db.notes.where('category').equals('habit').toArray()
      const habitsData = allHabits.map(h => ({
        id: h.id,
        name: h.title,
        description: h.content,
        category: (h as any).category || 'health',
        targetPerWeek: (h as any).targetPerWeek || 3,
        color: (h as any).color || COLORS[0],
        createdAt: (h as any).created_at || h.created_at,
      })) as Habit[]
      
      setHabits(habitsData)
    } catch (error) {
      console.error('Failed to load habits:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addHabit() {
    if (!newHabit.name) return

    const habit: Habit = {
      id: crypto.randomUUID(),
      ...newHabit,
      createdAt: new Date().toISOString(),
    }

    await db.notes.add({
      id: habit.id,
      title: habit.name,
      content: habit.description,
      tags: [habit.category],
      isPinned: false,
      isArchived: false,
      lastEdited: new Date().toISOString(),
      createdAt: habit.createdAt,
      updatedAt: new Date().toISOString(),
      syncVersion: 1,
      userId: '',
      workspaceId: '',
      ...(habit as any),
    } as any)

    setNewHabit({ name: '', description: '', category: 'health', targetPerWeek: 3, color: COLORS[0] })
    loadData()
  }

  async function deleteHabit(id: string) {
    await db.notes.delete(id)
    loadData()
  }

  async function logHabit(habitId: string, value: number = 1, notes?: string) {
    const log: HabitLog = {
      id: crypto.randomUUID(),
      habitId,
      date: selectedDate,
      value,
      notes,
    }
    
    await db.activityLogs.add({
      id: log.id,
      userId: '',
      moduleId: 'health',
      action: 'habit_logged',
      entityType: 'habit_log',
      entityId: log.id,
      changes: log,
      timestamp: new Date().toISOString(),
      syncStatus: 'local',
    } as any)

    loadLogs()
  }

  async function loadLogs() {
    const logs = await db.activityLogs.where('module_id').equals('health').toArray()
    const habitLogsData = logs.map(log => log.changes as HabitLog)
    setHabitLogs(habitLogsData)
  }

  function getHabitLogsForDate(date: string) {
    return habitLogs.filter(log => log.date === date)
  }

  function getStreak(habitId: string) {
    const habitLogsForHabit = habitLogs.filter(log => log.habitId === habitId)
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      if (habitLogsForHabit.some(log => log.date === dateStr)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    
    return streak
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{habits.length}</div>
          <div className="text-sm text-gray-600">Всего привычек</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {getHabitLogsForDate(selectedDate).length}
          </div>
          <div className="text-sm text-gray-600">Выполнено сегодня</div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Habits List */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Привычки</h2>
        
        {loading ? (
          <div className="text-gray-500">Загрузка...</div>
        ) : habits.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Нет привычек. Создайте первую!</div>
        ) : (
          <div className="space-y-4">
            {habits.map(habit => {
              const todayLog = getHabitLogsForDate(selectedDate).find(log => log.habitId === habit.id)
              const streak = getStreak(habit.id)
              const category = CATEGORIES.find(c => c.value === habit.category)
              
              return (
                <div key={habit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${habit.color} flex items-center justify-center text-white font-semibold`}>
                      {habit.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-sm text-gray-600">{habit.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {category && (
                          <span className={`text-xs px-2 py-0.5 rounded text-white ${category.color}`}>
                            {category.label}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Целевое: {habit.targetPerWeek} раз в неделю
                        </span>
                        <span className="text-xs text-orange-600">
                          🔥 {streak} дней
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {todayLog ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">✓ Выполнено</span>
                        <span className="text-sm text-gray-500">{todayLog.value} раз</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => logHabit(habit.id, 1)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => logHabit(habit.id, 2)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          +2
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add Habit Form */}
        <div className="mt-6 pt-6 border-t space-y-4">
          <h3 className="font-semibold">Добавить привычку</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Название привычки"
              value={newHabit.name}
              onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newHabit.category}
              onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value as any })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Описание"
              value={newHabit.description}
              onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Цель в неделю"
              value={newHabit.targetPerWeek}
              onChange={(e) => setNewHabit({ ...newHabit, targetPerWeek: parseInt(e.target.value) || 3 })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={1}
              max={7}
            />
            <div>
              <label className="block text-sm text-gray-700 mb-1">Цвет</label>
              <div className="flex gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewHabit({ ...newHabit, color })}
                    className={`w-8 h-8 rounded-full ${color} ${newHabit.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={addHabit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Добавить привычку
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
