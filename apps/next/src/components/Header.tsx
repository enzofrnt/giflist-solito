'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DropdownMenu } from '@/components/DropdownMenu'
import { useAuthContext } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/dashboard', label: 'Mes listes', auth: true },
  { href: '/profile', label: 'Profil', auth: true },
] as const

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  )
}

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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href))
  const initials = user?.name?.trim()?.slice(0, 2)?.toUpperCase() || 'GL'
  const visibleLinks = NAV_LINKS.filter((link) => !('auth' in link && link.auth) || user)

  function handleLogout() {
    setMenuOpen(false)
    logout()
  }

  return (
    <>
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

            <nav className="ds-header__nav" aria-label="Navigation principale">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="ds-header__link"
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="ds-header__actions">
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
                    { label: 'Mon profil', href: '/profile' },
                    { label: 'Mes listes', href: '/dashboard' },
                    { label: 'Se déconnecter', onSelect: handleLogout, danger: true },
                  ]}
                />
              </div>
            ) : (
              <>
                <Link href="/login" className="ds-btn ds-btn--ghost ds-btn--sm ds-header__auth-action">Connexion</Link>
                <Link href="/register" className="ds-btn ds-btn--primary ds-btn--sm ds-header__auth-action">Créer un compte</Link>
              </>
            )}

            <button
              type="button"
              className="ds-icon-btn ds-header__menu-button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="ds-mobile-menu" onClick={() => setMenuOpen(false)}>
          <div
            className="ds-mobile-menu__panel"
            id="mobile-navigation"
            onClick={(event) => event.stopPropagation()}
          >
            {user ? (
              <div className="ds-mobile-menu__account">
                <span className="ds-avatar" aria-hidden="true">{initials}</span>
                <div className="ds-stack ds-stack--gap-1">
                  <span className="ds-label">{user.name}</span>
                  <span className="ds-caption">{user.email}</span>
                </div>
              </div>
            ) : null}

            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="ds-mobile-menu__link"
                aria-current={isActive(link.href) ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="ds-mobile-menu__footer">
              {user ? (
                <button type="button" className="ds-btn ds-btn--danger ds-btn--block" onClick={handleLogout}>
                  Se déconnecter
                </button>
              ) : (
                <>
                  <Link href="/login" className="ds-btn ds-btn--secondary ds-btn--block">Connexion</Link>
                  <Link href="/register" className="ds-btn ds-btn--primary ds-btn--block">Créer un compte</Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
