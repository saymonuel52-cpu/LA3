'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import CalendarModule from '@/modules/calendar/CalendarModule'

export default function CalendarPage() {
  return (
    <ProtectedLayout>
      <CalendarModule />
    </ProtectedLayout>
  )
}
