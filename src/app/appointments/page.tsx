'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import AppointmentsModule from '@/modules/appointments/AppointmentsModule'

export default function AppointmentsPage() {
  return (
    <ProtectedLayout>
      <AppointmentsModule />
    </ProtectedLayout>
  )
}
