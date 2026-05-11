'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import NotesModule from '@/modules/notes/NotesModule'

export default function NotesPage() {
  return (
    <ProtectedLayout>
      <NotesModule />
    </ProtectedLayout>
  )
}
