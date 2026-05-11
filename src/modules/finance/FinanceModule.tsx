'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db/database'

export interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  date: string
  isIncome: boolean
  createdAt: string
}

const CATEGORIES = [
  'Зарплата', 'Продажи', 'Фриланс', 'Инвестиции', 'Другое',
  'Еда', 'Транспорт', 'Жильё', 'Коммунальные', 'Развлечения', 'Здоровье', 'Покупки', 'Обучение', 'Другое',
]

export default function FinanceModule() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    category: 'Еда',
    date: new Date().toISOString().split('T')[0],
    isIncome: false,
  })
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions() {
    try {
      const allTransactions = await db.transactions.toArray()
      setTransactions(allTransactions.map(t => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        category: t.category,
        date: t.date,
        isIncome: t.is_income,
        createdAt: t.created_at,
      })) as unknown as Transaction[])
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addTransaction() {
    if (!newTransaction.amount || !newTransaction.description) return

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
      category: newTransaction.category,
      date: newTransaction.date,
      isIncome: newTransaction.isIncome,
      createdAt: new Date().toISOString(),
    }

    await db.transactions.add({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      is_income: transaction.isIncome,
      created_at: transaction.createdAt,
      user_id: '',
      workspace_id: '',
      sync_version: 1,
    } as any)
    setNewTransaction({
      amount: '',
      description: '',
      category: 'Еда',
      date: new Date().toISOString().split('T')[0],
      isIncome: false,
    })
    loadTransactions()
  }

  async function deleteTransaction(id: string) {
    await db.transactions.delete(id)
    loadTransactions()
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    if (filter === 'income') return t.isIncome
    if (filter === 'expense') return !t.isIncome
    return true
  })

  const totalIncome = transactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => !t.isIncome).reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  const expensesByCategory = transactions
    .filter(t => !t.isIncome)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const topCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90">Доходы</div>
          <div className="text-3xl font-bold mt-2">{totalIncome.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90">Расходы</div>
          <div className="text-3xl font-bold mt-2">{totalExpenses.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className={`rounded-lg p-6 text-white ${balance >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'}`}>
          <div className="text-sm opacity-90">Баланс</div>
          <div className="text-3xl font-bold mt-2">{balance.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Добавить транзакцию</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сумма</label>
            <input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              step="0.01"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="На что потратили?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
            <select
              value={newTransaction.isIncome ? 'income' : 'expense'}
              onChange={(e) => setNewTransaction({ ...newTransaction, isIncome: e.target.value === 'income' })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </div>
        </div>
        <button
          onClick={addTransaction}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Добавить транзакцию
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
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
            {f === 'income' && 'Доходы'}
            {f === 'expense' && 'Расходы'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">История операций</h2>
          {loading ? (
            <div className="text-gray-500">Загрузка...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Нет транзакций</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.isIncome ? '↑' : '↓'}
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString('ru-RU')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`font-semibold ${transaction.isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.isIncome ? '+' : '-'}{transaction.amount.toLocaleString('ru-RU')} ₽
                      </div>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Расходы по категориям</h2>
          {topCategories.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Нет данных</div>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? (amount / totalExpenses * 100).toFixed(1) : 0
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{category}</span>
                      <span>{amount.toLocaleString('ru-RU')} ₽ ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
