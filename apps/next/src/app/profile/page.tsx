'use client'

import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ProfileClient from './ProfileClient'

export default function ProfilePage() {
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
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <span className="ds-spinner" role="status" aria-label="Chargement du compte" />
          <p className="ds-body-sm ds-text-muted">Chargement…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <ProfileClient />
}
