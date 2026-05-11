'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/database'

export interface Procedure {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  color: string
}

export interface Appointment {
  id: string
  clientId: string
  clientName: string
  procedureId: string
  procedureName: string
  date: string
  time: string
  duration: number
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string
}

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  notes: string
  totalVisits: number
  lastVisit: string
}

const COLORS = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-amber-500',
]

const CATEGORIES = ['Массаж', 'Косметология', 'Физиотерапия', 'Реабилитация', 'Другое']

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AppointmentsModule() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'clients' | 'procedures'>('appointments')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [showProcedureForm, setShowProcedureForm] = useState(false)
  
  const [newAppointment, setNewAppointment] = useState({
    clientId: '',
    procedureId: '',
    date: '',
    time: '',
    notes: '',
  })
  
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })
  
  const [newProcedure, setNewProcedure] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: CATEGORIES[0],
    color: COLORS[0],
  })

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('pending')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [appots, clis, procs] = await Promise.all([
        db.appointments.toArray(),
        db.clients.toArray(),
        db.procedures.toArray(),
      ])

      setAppointments(appots as unknown as Appointment[])
      setClients(clis as unknown as Client[])
      setProcedures(procs as unknown as Procedure[])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addAppointment() {
    if (!newAppointment.clientId || !newAppointment.procedureId || !newAppointment.date || !newAppointment.time) return

    const client = clients.find(c => c.id === newAppointment.clientId)
    const procedure = procedures.find(p => p.id === newAppointment.procedureId)

    if (!client || !procedure) return

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      clientId: client.id,
      clientName: client.name,
      procedureId: procedure.id,
      procedureName: procedure.name,
      date: newAppointment.date,
      time: newAppointment.time,
      duration: procedure.duration,
      price: procedure.price,
      status: 'pending',
      notes: newAppointment.notes,
    }

    await db.appointments.add(appointment as any)
    
    // Update client stats
    const updatedClient = {
      ...client,
      totalVisits: client.totalVisits + 1,
      lastVisit: new Date().toISOString(),
      nextAppointment: newAppointment.date,
    }
    await db.clients.update(client.id, updatedClient as any)

    setNewAppointment({ clientId: '', procedureId: '', date: '', time: '', notes: '' })
    setShowAppointmentForm(false)
    loadData()
  }

  async function addClient() {
    if (!newClient.name || !newClient.phone) return

    const client: Client = {
      id: crypto.randomUUID(),
      ...newClient,
      totalVisits: 0,
      lastVisit: '',
    }

    await db.clients.add(client as any)
    setNewClient({ name: '', phone: '', email: '', notes: '' })
    setShowClientForm(false)
    loadData()
  }

  async function addProcedure() {
    if (!newProcedure.name) return

    const procedure: Procedure = {
      id: crypto.randomUUID(),
      ...newProcedure,
    }

    await db.procedures.add(procedure as any)
    setNewProcedure({ name: '', description: '', duration: 60, price: 0, category: CATEGORIES[0], color: COLORS[0] })
    setShowProcedureForm(false)
    loadData()
  }

  async function updateAppointmentStatus(id: string, status: Appointment['status']) {
    await db.appointments.update(id, { status } as any)
    loadData()
  }

  async function deleteAppointment(id: string) {
    await db.appointments.delete(id)
    loadData()
  }

  const filteredAppointments = appointments
    .filter(a => a.date === selectedDate)
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .sort((a, b) => a.time.localeCompare(b.time))

  const todayStats = {
    total: appointments.filter(a => a.date === selectedDate).length,
    pending: appointments.filter(a => a.date === selectedDate && a.status === 'pending').length,
    confirmed: appointments.filter(a => a.date === selectedDate && a.status === 'confirmed').length,
    completed: appointments.filter(a => a.date === selectedDate && a.status === 'completed').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stats-card">
          <div className="stats-number">{todayStats.total}</div>
          <div className="text-sm text-secondary">Всего</div>
        </div>
        <div className="stats-card">
          <div className="stats-number text-yellow-600">{todayStats.pending}</div>
          <div className="text-sm text-secondary">Ожидают</div>
        </div>
        <div className="stats-card">
          <div className="stats-number text-blue-600">{todayStats.confirmed}</div>
          <div className="text-sm text-secondary">Подтверждено</div>
        </div>
        <div className="stats-card">
          <div className="stats-number text-green-600">{todayStats.completed}</div>
          <div className="text-sm text-secondary">Выполнено</div>
        </div>
        <div className="stats-card">
          <div className="stats-number text-purple-600">{clients.length}</div>
          <div className="text-sm text-secondary">Клиентов</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
        >
          📅 Записи
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`btn ${activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}`}
        >
          👥 Клиенты ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab('procedures')}
          className={`btn ${activeTab === 'procedures' ? 'btn-primary' : 'btn-secondary'}`}
        >
          ⚙️ Процедуры ({procedures.length})
        </button>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {/* Date and Filters */}
          <div className="card">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-sm text-secondary mb-1 block">Дата</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                  style={{ minWidth: '180px' }}
                />
              </div>
              <div>
                <label className="text-sm text-secondary mb-1 block">Статус</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="input"
                  style={{ minWidth: '150px' }}
                >
                  <option value="all">Все</option>
                  <option value="pending">Ожидают</option>
                  <option value="confirmed">Подтверждено</option>
                  <option value="completed">Выполнено</option>
                </select>
              </div>
              <div className="flex-1">
                <button
                  onClick={() => setShowAppointmentForm(true)}
                  className="btn btn-primary w-full"
                >
                  + Новая запись
                </button>
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          {showAppointmentForm && (
            <div className="card fade-in">
              <h3 className="text-lg font-semibold mb-4">Новая запись</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary mb-1 block">Клиент</label>
                  <select
                    value={newAppointment.clientId}
                    onChange={(e) => setNewAppointment({ ...newAppointment, clientId: e.target.value })}
                    className="input"
                  >
                    <option value="">Выберите клиента</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-secondary mb-1 block">Процедура</label>
                  <select
                    value={newAppointment.procedureId}
                    onChange={(e) => setNewAppointment({ ...newAppointment, procedureId: e.target.value })}
                    className="input"
                  >
                    <option value="">Выберите процедуру</option>
                    {procedures.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.price}₽ ({p.duration} мин)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-secondary mb-1 block">Дата</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary mb-1 block">Время</label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-secondary mb-1 block">Заметки</label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Дополнительная информация..."
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <button onClick={addAppointment} className="btn btn-primary">
                    Создать запись
                  </button>
                  <button onClick={() => setShowAppointmentForm(false)} className="btn btn-secondary">
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appointments List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="skeleton h-20 rounded-lg mb-3"></div>
              <div className="skeleton h-20 rounded-lg mb-3"></div>
              <div className="skeleton h-20 rounded-lg"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="card text-center py-8 text-secondary">
              Нет записей на выбранный день
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map(appointment => (
                <div key={appointment.id} className="card fade-in">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {appointment.clientName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.clientName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-secondary">{appointment.procedureName}</span>
                          <span className="text-sm text-secondary">•</span>
                          <span className="text-sm font-medium">{appointment.time}</span>
                          <span className="text-sm text-secondary">•</span>
                          <span className="text-sm text-secondary">{appointment.duration} мин</span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-secondary mt-2">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[appointment.status]}`}>
                        {appointment.status === 'pending' && 'Ожидает'}
                        {appointment.status === 'confirmed' && 'Подтверждено'}
                        {appointment.status === 'completed' && 'Выполнено'}
                        {appointment.status === 'cancelled' && 'Отменено'}
                      </span>
                      <div className="text-lg font-bold text-purple-600">{appointment.price} ₽</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="btn btn-success text-sm"
                      >
                        Подтвердить
                      </button>
                    )}
                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        className="btn btn-success text-sm"
                      >
                        Завершить
                      </button>
                    )}
                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      className="btn btn-error text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Клиенты</h2>
            <button onClick={() => setShowClientForm(true)} className="btn btn-primary">
              + Добавить клиента
            </button>
          </div>

          {showClientForm && (
            <div className="card fade-in">
              <h3 className="text-lg font-semibold mb-4">Новый клиент</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary mb-1 block">Имя *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="input"
                    placeholder="Имя клиента"
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary mb-1 block">Телефон *</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="input"
                    placeholder="+7 (999) 000-00-00"
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary mb-1 block">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="input"
                    placeholder="client@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-secondary mb-1 block">Заметки</label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Информация о клиенте..."
                  />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <button onClick={addClient} className="btn btn-primary">
                    Добавить
                  </button>
                  <button onClick={() => setShowClientForm(false)} className="btn btn-secondary">
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(client => (
              <div key={client.id} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{client.name}</h3>
                    <div className="text-sm text-secondary mt-1">
                      <div>📞 {client.phone}</div>
                      {client.email && <div>✉️ {client.email}</div>}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {client.totalVisits} визитов
                      </span>
                      {client.lastVisit && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Последний: {new Date(client.lastVisit).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {client.notes && (
                  <p className="text-sm text-secondary mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {client.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Procedures Tab */}
      {activeTab === 'procedures' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Процедуры</h2>
            <button onClick={() => setShowProcedureForm(true)} className="btn btn-primary">
              + Добавить процедуру
            </button>
          </div>

          {showProcedureForm && (
            <div className="card fade-in">
              <h3 className="text-lg font-semibold mb-4">Новая процедура</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-secondary mb-1 block">Название *</label>
                  <input
                    type="text"
                    value={newProcedure.name}
                    onChange={(e) => setNewProcedure({ ...newProcedure, name: e.target.value })}
                    className="input"
                    placeholder="Название процедуры"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-secondary mb-1 block">Описание</label>
                  <textarea
                    value={newProcedure.description}
                    onChange={(e) => setNewProcedure({ ...newProcedure, description: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="Описание процедуры..."
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary mb-1 block">Категория</label>
                  <select
                    value={newProcedure.category}
                    onChange={(e) => setNewProcedure({ ...newProcedure, category: e.target.value })}
                    className="input"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-secondary mb-1 block">Длительность (мин)</label>
                  <input
                    type="number"
                    value={newProcedure.duration}
                    onChange={(e) => setNewProcedure({ ...newProcedure, duration: parseInt(e.target.value) || 60 })}
                    className="input"
                    min="15"
                    step="15"
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary mb-1 block">Цена (₽)</label>
                  <input
                    type="number"
                    value={newProcedure.price}
                    onChange={(e) => setNewProcedure({ ...newProcedure, price: parseInt(e.target.value) || 0 })}
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary mb-1 block">Цвет</label>
                  <div className="flex gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewProcedure({ ...newProcedure, color })}
                        className={`w-8 h-8 rounded-full ${color} ${newProcedure.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <button onClick={addProcedure} className="btn btn-primary">
                    Добавить
                  </button>
                  <button onClick={() => setShowProcedureForm(false)} className="btn btn-secondary">
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {procedures.map(procedure => (
              <div key={procedure.id} className="card">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${procedure.color} flex items-center justify-center text-white font-semibold`}>
                    {procedure.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{procedure.name}</h3>
                    <div className="text-sm text-secondary mt-1">
                      <div>⏱️ {procedure.duration} мин</div>
                      <div>💰 {procedure.price} ₽</div>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mt-2 inline-block">
                      {procedure.category}
                    </span>
                  </div>
                </div>
                {procedure.description && (
                  <p className="text-sm text-secondary mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {procedure.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
