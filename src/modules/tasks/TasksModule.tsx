'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [swipedTaskId, setSwipedTaskId] = useState<string | null>(null)
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const touchStartX = useRef<number>(0)

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
    setSwipedTaskId(null)
  }

  async function deleteTask(id: string) {
    await db.tasks.delete(id)
    loadTasks()
    setSwipedTaskId(null)
  }

  // Touch handlers for swipe actions
  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    touchStartX.current = e.touches[0].clientX
    setSwipedTaskId(taskId)
  }

  const handleTouchMove = (e: React.TouchEvent, taskId: string) => {
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX.current
    
    // Prevent scrolling when swiping task
    if (Math.abs(diff) > 10) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent, taskId: string) => {
    const currentX = e.changedTouches[0].clientX
    const diff = currentX - touchStartX.current
    
    // Swipe left to delete (> 80px)
    if (diff < -80) {
      deleteTask(taskId)
    }
    // Swipe right to complete (> 80px)
    else if (diff > 80) {
      updateTaskStatus(taskId, 'done')
    }
    // Reset
    else {
      setSwipedTaskId(null)
    }
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
        <div className="card">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-secondary">Всего задач</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-blue-600">{stats.todo}</div>
          <div className="text-sm text-secondary">К выполнению</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-secondary">В процессе</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          <div className="text-sm text-secondary">Выполнено</div>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Добавить задачу</h2>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Название задачи"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input"
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
          </div>
          <div>
            <textarea
              placeholder="Описание (необязательно)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="input"
              rows={2}
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              className="input"
              style={{ width: 'auto' }}
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
            <button
              onClick={addTask}
              className="btn btn-primary"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn ${
              filter === f
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            {f === 'all' && 'Все'}
            {f === 'active' && 'Активные'}
            {f === 'done' && 'Выполненные'}
          </button>
        ))}
      </div>

      {/* Task List with Swipe Actions */}
      {loading ? (
        <div className="text-center py-8">
          <div className="skeleton h-16 rounded-lg mb-3"></div>
          <div className="skeleton h-16 rounded-lg mb-3"></div>
          <div className="skeleton h-16 rounded-lg"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card text-center py-8 text-secondary">
          Задач нет
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isSwiped = swipedTaskId === task.id
            return (
              <div
                key={task.id}
                // @ts-ignore
                ref={el => { taskRefs.current[task.id] = el }}
                className="list-item relative overflow-hidden"
                style={{
                  transform: isSwiped ? (
                    task.status === 'done' ? 'translateX(-100px)' : 'translateX(100px)'
                  ) : 'translateX(0)',
                  transition: 'transform 0.3s ease',
                }}
                onTouchStart={(e) => handleTouchStart(e, task.id)}
                onTouchMove={(e) => handleTouchMove(e, task.id)}
                onTouchEnd={(e) => handleTouchEnd(e, task.id)}
              >
                {/* Swipe Left Action (Delete) */}
                <div className="list-item-swipe-left absolute inset-0 z-0">
                  <span>Удалить</span>
                </div>

                {/* Swipe Right Action (Complete) */}
                <div className="list-item-swipe-right absolute inset-0 z-0">
                  <span>Завершить</span>
                </div>

                {/* Content */}
                <div className="list-item-content relative z-10 p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                      className="mt-1 w-5 h-5"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-secondary' : ''}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-secondary mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority === 'high' && 'Высокий'}
                              {task.priority === 'medium' && 'Средний'}
                              {task.priority === 'low' && 'Низкий'}
                            </span>
                            <span className="text-xs text-secondary">
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
                              className="btn btn-secondary text-sm"
                            >
                              В работу
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="btn btn-secondary text-sm"
                            style={{ color: 'var(--color-error)' }}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Mobile Swipe Hint */}
      <div className="md:hidden text-center text-sm text-secondary mt-4">
        💡 Свайпните влево для удаления, вправо для завершения
      </div>
    </div>
  )
}
