'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/database'

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done' | 'archived'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  completedAt?: string
}

export default function TasksModule() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const allTasks = await db.tasks.toArray()
      setTasks(allTasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        due_date: t.due_date,
        createdAt: t.created_at,
        completedAt: t.completed_at,
      })) as unknown as Task[])
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addTask() {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.title,
      description: newTask.description,
      status: 'todo',
      priority: newTask.priority,
      createdAt: new Date().toISOString(),
    }

    await db.tasks.add({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: null,
      created_at: task.createdAt,
      completed_at: null,
      user_id: '',
      workspace_id: '',
      sync_version: 1,
    } as any)
    setNewTask({ title: '', description: '', priority: 'medium' })
    loadTasks()
  }

  async function updateTaskStatus(id: string, status: Task['status']) {
    await db.tasks.update(id, { 
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null
    } as any)
    loadTasks()
  }

  async function deleteTask(id: string) {
    await db.tasks.delete(id)
    loadTasks()
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'active') return task.status !== 'done'
    if (filter === 'done') return task.status === 'done'
    return true
  })

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Всего задач</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats.todo}</div>
          <div className="text-sm text-gray-600">К выполнению</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">В процессе</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          <div className="text-sm text-gray-600">Выполнено</div>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Добавить задачу</h2>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Название задачи"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
          </div>
          <div>
            <textarea
              placeholder="Описание (необязательно)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div className="flex gap-4">
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
            <button
              onClick={addTask}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' && 'Все'}
            {f === 'active' && 'Активные'}
            {f === 'done' && 'Выполненные'}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          Задач нет
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg p-4 shadow-sm border flex items-start gap-4"
            >
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                className="mt-1 w-5 h-5"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority === 'high' && 'Высокий'}
                        {task.priority === 'medium' && 'Средний'}
                        {task.priority === 'low' && 'Низкий'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.status === 'todo' && 'К выполнению'}
                        {task.status === 'in_progress' && 'В процессе'}
                        {task.status === 'done' && 'Выполнено'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task.status !== 'in_progress' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                      >
                        В работу
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
