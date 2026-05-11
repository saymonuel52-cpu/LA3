'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import MailModule from '@/modules/mail/MailModule'

export default function MailPage() {
  return (
    <ProtectedLayout>
      <MailModule />
    </ProtectedLayout>
  )
}
