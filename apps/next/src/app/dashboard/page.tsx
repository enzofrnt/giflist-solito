'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="ds-page">
        <main className="ds-page__main">
          <div className="ds-stack ds-stack--gap-3 items-center" role="status" aria-live="polite">
            <span className="ds-spinner" aria-hidden="true" />
            <p className="ds-page-subtitle">Chargement…</p>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <DashboardClient />
}
