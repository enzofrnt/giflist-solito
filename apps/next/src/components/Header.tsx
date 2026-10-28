'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/dashboard', label: 'Mes listes', auth: true },
  { href: '/profile', label: 'Profil', auth: true },
] as const

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <>
          <path d="m6 6 12 12M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  )
}

export function Header() {
  const pathname = usePathname()
  const { user, loading, logout } = useAuthContext()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

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
        <Link className="ds-header__brand" href="/" aria-label="Giftlist — accueil">
          <span className="ds-header__mark" aria-hidden="true">G</span>
          <span className="ds-header__wordmark">Giftlist</span>
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

        <div className="ds-header__actions">
          {loading ? (
            <span className="ds-spinner" aria-label="Chargement du compte" role="status" />
          ) : user ? (
            <>
              <span className="ds-header__user">
                <span className="ds-avatar ds-header__avatar" aria-hidden="true">{initials}</span>
                <span className="ds-body-sm">{user.name}</span>
              </span>
              <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm ds-header__logout" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
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
                <button type="button" className="ds-btn ds-btn--secondary ds-btn--block" onClick={handleLogout}>
                  Déconnexion
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
