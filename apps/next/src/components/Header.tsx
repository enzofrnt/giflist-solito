'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DropdownMenu } from '@/components/DropdownMenu'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuthContext } from '@/contexts/AuthContext'

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function Header() {
  const pathname = usePathname()
  const { user, loading, logout } = useAuthContext()
  const initials = user?.name?.trim()?.slice(0, 2)?.toUpperCase() || 'GL'

  return (
    <header className="ds-header">
      <div className="ds-header__inner">
        <div className="ds-header__left">
          <Link className="ds-header__brand" href="/" aria-label="Giftlist — accueil">
            <Image
              src="/logo.webp"
              alt="Giftlist"
              width={320}
              height={214}
              className="ds-header__logo"
              priority
            />
          </Link>

          {user ? (
            <nav className="ds-header__nav" aria-label="Navigation principale">
              <Link
                href="/dashboard"
                className="ds-header__link"
                aria-current={pathname?.startsWith('/dashboard') ? 'page' : undefined}
              >
                Mes listes
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="ds-header__actions">
          <ThemeToggle />
          {loading ? (
            <span className="ds-spinner" aria-label="Chargement du compte" role="status" />
          ) : user ? (
            <div className="ds-header__account-wrap">
              <DropdownMenu
                label="Menu du compte"
                triggerClassName="ds-header__account"
                trigger={
                  <>
                    <span className="ds-avatar ds-header__avatar" aria-hidden="true">{initials}</span>
                    <span className="ds-header__account-name">{user.name}</span>
                    <span className="ds-header__account-chevron" aria-hidden="true"><ChevronDownIcon /></span>
                  </>
                }
                items={[
                  { label: 'Mes listes', href: '/dashboard', mobileOnly: true },
                  { label: 'Mon profil', href: '/profile' },
                  { label: 'Se déconnecter', onSelect: () => logout(), danger: true },
                ]}
              />
            </div>
          ) : (
            <>
              <Link href="/login" className="ds-btn ds-btn--ghost ds-btn--sm ds-header__auth-action">Connexion</Link>
              <Link href="/register" className="ds-btn ds-btn--primary ds-btn--sm ds-header__auth-action">Créer un compte</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
