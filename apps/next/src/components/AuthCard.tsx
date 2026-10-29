import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

export function AuthCard({
  title,
  lead,
  children,
  footer,
}: {
  title: string
  lead: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="ds-auth">
      <div className="ds-auth__card">
        <div className="ds-auth__header">
          <Link href="/" aria-label="Giftlist — accueil">
            <Image
              src="/logo.webp"
              alt=""
              width={320}
              height={214}
              className="ds-auth__logo ds-auth__logo--light"
              priority
            />
            <Image
              src="/logo-white.webp"
              alt=""
              width={320}
              height={214}
              className="ds-auth__logo ds-auth__logo--dark"
              priority
            />
          </Link>
          <h1 className="ds-auth__title">{title}</h1>
          <p className="ds-auth__lead">{lead}</p>
        </div>
        <div className="ds-auth__form">{children}</div>
        {footer ? <div className="ds-auth__footer">{footer}</div> : null}
      </div>
    </div>
  )
}
