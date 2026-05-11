'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import TasksModule from '@/modules/tasks/TasksModule'

export default function TasksPage() {
  return (
    <ProtectedLayout>
      <TasksModule />
    </ProtectedLayout>
  )
}
