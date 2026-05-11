'use client'

import ProtectedLayout from '@/components/layout/ProtectedLayout'
import CRMModule from '@/modules/crm/CRMModule'

export default function CRMPage() {
  return (
    <ProtectedLayout>
      <CRMModule />
    </ProtectedLayout>
  )
}
