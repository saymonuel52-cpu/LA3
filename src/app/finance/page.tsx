'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'

export default function FinancePage() {
  return (
    <ProtectedLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Финансы</h1>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-gray-600">Модуль финансов в разработке...</p>
        </div>
      </div>
    </ProtectedLayout>
  )
}
