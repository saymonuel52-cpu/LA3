'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import FinanceModule from '@/modules/finance/FinanceModule'

export default function FinancePage() {
  return (
    <ProtectedLayout>
      <FinanceModule />
    </ProtectedLayout>
  )
}
