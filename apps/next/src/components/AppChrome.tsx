'use client'

import { usePathname } from 'next/navigation'
import { Header } from 'app/components/Header'

/**
 * Renders the product Header everywhere except on the design-system review
 * page, which is intentionally a standalone document (Phase 1). Existing
 * routes keep exactly the same Header and behaviour.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStandalone = Boolean(pathname && pathname.startsWith('/design-system'))

  return (
    <>
      {isStandalone ? null : <Header />}
      {children}
    </>
  )
}
