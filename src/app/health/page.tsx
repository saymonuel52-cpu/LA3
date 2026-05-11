'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import HealthModule from '@/modules/health/HealthModule'

export default function HealthPage() {
  return (
    <ProtectedLayout>
      <HealthModule />
    </ProtectedLayout>
  )
}
