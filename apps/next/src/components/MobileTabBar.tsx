'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { List, Search, UserRound, type LucideIcon } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

type Tab = {
  href: string
  label: string
  icon: LucideIcon
  section: string
}

const TABS: Tab[] = [
  { href: '/dashboard', label: 'Mes listes', icon: List, section: 'dashboard' },
  { href: '/search', label: 'Recherche', icon: Search, section: 'search' },
  { href: '/profile', label: 'Profil', icon: UserRound, section: 'profile' },
]

// Browsing screens where the persistent mobile navigation is useful. Auth,
// admin, focused forms (manage/gift) and the standalone design-system page keep
// the screen free of the bar.
const TAB_SECTIONS = new Set(['dashboard', 'search', 'profile', 'list', 'u'])

export function MobileTabBar() {
  const pathname = usePathname()
  const { user, loading } = useAuthContext()

  const path = pathname ?? '/'
  const section = path.split('/')[1] ?? ''
  const visible = path === '/' || TAB_SECTIONS.has(section)

  if (loading || !user || !visible) return null

  return (
    <>
      <div className="ds-tabbar-spacer" aria-hidden="true" />
      <nav className="ds-tabbar" aria-label="Navigation principale">
        {TABS.map((tab) => {
          const active = tab.section === section
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="ds-tabbar__item"
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
