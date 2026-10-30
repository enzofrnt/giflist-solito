'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'

const GITHUB_URL = 'https://github.com/enzofrnt/giflist-solito'
const ISSUES_URL = 'https://github.com/enzofrnt/giflist-solito/issues/new'

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

function BugIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 9h8M9 4l1.5 3M15 4l-1.5 3M7 13H4M20 13h-3M7 17H4M20 17h-3M12 9v10M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4v4a4 4 0 0 1-8 0v-4Z" />
    </svg>
  )
}

export function Footer() {
  const { user } = useAuthContext()
  const pathname = usePathname()
  const [year, setYear] = useState(new Date().getFullYear())
  const [logoClicks, setLogoClicks] = useState(0)
  const [eggOpen, setEggOpen] = useState(false)
  const [eggClosing, setEggClosing] = useState(false)

  // The footer is prerendered: refresh the copyright year after hydration so it
  // never stays stuck on the build year.
  useEffect(() => { setYear(new Date().getFullYear()) }, [])

  // Warm the easter-egg image so the overlay does not open on an empty frame.
  useEffect(() => {
    const image = new window.Image()
    image.src = '/easter-egg/william-le-voleur.jpg'
  }, [])

  useEffect(() => {
    if (!eggOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeEgg()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [eggOpen])

  function closeEgg() {
    setEggClosing(true)
    window.setTimeout(() => { setEggOpen(false); setEggClosing(false) }, 240)
  }

  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    // Keep the normal footer link behaviour outside the home page; on the home
    // page, collect ten clicks for the William easter egg instead of reloading.
    if (pathname !== '/') return
    event.preventDefault()
    setLogoClicks((current) => {
      const next = current + 1
      if (next >= 10) { setEggOpen(true); return 0 }
      return next
    })
  }

  return (
    <footer className="ds-footer">
      <div className="ds-footer__inner">
        <div className="ds-footer__brand">
          <Link href="/" className="ds-footer__brand-link" aria-label="Giftlist — accueil" onClick={handleLogoClick}>
            <Image
              src="/logo.webp"
              alt="Giftlist"
              width={320}
              height={214}
              sizes="64px"
              className="ds-footer__logo"
            />
          </Link>
          <p className="ds-footer__tagline">
            Des listes de cadeaux simples à partager. Vos proches réservent,
            sans créer de compte.
          </p>
          <p className="ds-footer__note">Gratuit · Aucune carte bancaire · Partage sans compte</p>
        </div>

        <nav className="ds-footer__nav" aria-label="Navigation de pied de page">
          <p className="ds-footer__title">Produit</p>
          <ul className="ds-footer__list">
            <li><Link href="/" className="ds-footer__link">Accueil</Link></li>
            {user ? (
              <>
                <li><Link href="/dashboard" className="ds-footer__link">Mes listes</Link></li>
                <li><Link href="/profile" className="ds-footer__link">Mon profil</Link></li>
              </>
            ) : (
              <>
                <li><Link href="/login" className="ds-footer__link">Connexion</Link></li>
                <li><Link href="/register" className="ds-footer__link">Créer un compte</Link></li>
              </>
            )}
          </ul>
        </nav>

        <nav className="ds-footer__nav" aria-label="Liens du projet">
          <p className="ds-footer__title">Le projet</p>
          <ul className="ds-footer__list">
            <li>
              <a href={GITHUB_URL} className="ds-footer__link" target="_blank" rel="noreferrer">
                <span className="ds-footer__link-icon"><GitHubIcon /></span>
                Code source
              </a>
            </li>
            <li>
              <a href={ISSUES_URL} className="ds-footer__link" target="_blank" rel="noreferrer">
                <span className="ds-footer__link-icon"><BugIcon /></span>
                Signaler un bug
              </a>
            </li>
            <li>
              <a href={`${GITHUB_URL}#readme`} className="ds-footer__link" target="_blank" rel="noreferrer">
                Documentation
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="ds-footer__bottom">
        <p suppressHydrationWarning>© {year} Giftlist. Tous droits réservés.</p>
        <p>Fait avec soin, pour le web et le mobile.</p>
      </div>

      {eggOpen ? (
        <div
          className={`ds-easter-egg${eggClosing ? ' ds-easter-egg--closing' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="William le voleur de cadeau"
          onClick={closeEgg}
        >
          <div className="ds-easter-egg__panel" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="ds-easter-egg__close" onClick={closeEgg} aria-label="Fermer l’easter egg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <p className="ds-easter-egg__title">William le voleur de cadeau !</p>
            <Image
              src="/easter-egg/william-le-voleur.jpg"
              alt="William, un chat roux, vole un cadeau sous le sapin"
              width={1145}
              height={1374}
              className="ds-easter-egg__image"
              unoptimized
              priority
            />
          </div>
        </div>
      ) : null}
    </footer>
  )
}
