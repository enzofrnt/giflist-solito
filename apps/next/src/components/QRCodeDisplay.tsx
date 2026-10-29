'use client';

import QRCodeStyling from 'qr-code-styling';
import { useEffect, useId, useRef, useState } from 'react';

interface QRCodeDisplayProps {
  shareCode: string;
  title?: string;
  className?: string;
}

/** Reads a design token so the QR encoder stays in sync with the palette (no raw hex here). */
function readToken(name: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || undefined;
}

if (typeof window !== 'undefined') {
  for (const src of ['/logo.webp', '/logo-white.webp']) {
    const warm = new window.Image()
    warm.src = src
  }
}

export default function QRCodeDisplay({ shareCode, title = "Scanner avec un appareil mobile", className = "" }: QRCodeDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const helpId = useId();
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/list/${shareCode}` : '';

  useEffect(() => {
    if (!shareCode || !qrRef.current) return

    setIsGenerating(true)
    const origin = window.location.origin
    const dark = document.documentElement.dataset.theme === 'dark'
    const image = dark ? '/logo-white.webp' : '/logo.webp'
    const qrCode = new QRCodeStyling({
      width: 224,
      height: 224,
      type: 'svg',
      data: `${origin}/list/${shareCode}`,
      image,
      margin: 20,
      qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' },
      dotsOptions: { color: readToken('--ds-color-text'), type: 'extra-rounded' },
      backgroundOptions: { color: 'transparent' },
      cornersSquareOptions: { color: readToken('--ds-color-primary'), type: 'extra-rounded' },
      cornersDotOptions: { color: readToken('--ds-color-primary'), type: 'extra-rounded' },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.46, saveAsBlob: false },
    })

    qrRef.current.innerHTML = ''
    qrCode.append(qrRef.current)
    qrCodeRef.current = qrCode
    setIsGenerating(false)

    return () => {
      if (qrRef.current) qrRef.current.innerHTML = ''
      qrCodeRef.current = null
    }
  }, [shareCode])

  // Vérifier si l'API Web Share est disponible
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  async function handleDownload() {
    setIsDownloading(true)
    try {
      const origin = window.location.origin
      const dark = document.documentElement.dataset.theme === 'dark'
      // The 1024px PNG is built only when the user asks for it.
      const png = new QRCodeStyling({
        width: 1024,
        height: 1024,
        type: 'canvas',
        data: `${origin}/list/${shareCode}`,
        image: dark ? '/logo-white.webp' : '/logo.webp',
        margin: 20,
        qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' },
        dotsOptions: { color: readToken('--ds-color-text'), type: 'extra-rounded' },
        backgroundOptions: { color: dark ? '#11100f' : '#faf9f7' },
        cornersSquareOptions: { color: readToken('--ds-color-primary'), type: 'extra-rounded' },
        cornersDotOptions: { color: readToken('--ds-color-primary'), type: 'extra-rounded' },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.46, saveAsBlob: true },
      })
      const blob = await png.getRawData('png')
      if (!(blob instanceof Blob)) throw new Error('PNG indisponible')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `qr-code-${shareCode}.png`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleShare() {
    if (!canShare) return;

    setIsSharing(true);
    try {
      // Partager le lien avec un message descriptif
      await navigator.share({
        title: `Ma liste de cadeaux`,
        text: `Voilà ma liste de cadeau créée grâce à GiftList, je te laisse jeter un œil ! 🎁\n\n${shareUrl}`,
        url: shareUrl
      });
    } catch (error) {
      // L'utilisateur a annulé le partage ou une erreur s'est produite
      if ((error as Error).name !== 'AbortError') {
        console.error('Erreur lors du partage:', error);
      }
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className={className}>
      <div className="ds-stack ds-stack--gap-3 items-center text-center">
        <h4 className="ds-card__title">{title}</h4>

        <div className="ds-card ds-card--flat w-full max-w-full">
          <div className="ds-card__body items-center justify-items-center">
            <div className="qr-frame">
              <div ref={qrRef} className="qr-frame__code" aria-hidden="true" />
            </div>
            <span className="ds-info-inline" id={helpId}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
              Pointez votre appareil photo vers le code
            </span>

            <div className="ds-cluster justify-center">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading || isGenerating}
                aria-busy={isDownloading || undefined}
                className="ds-btn ds-btn--secondary"
              >
                {isDownloading ? (
                  <>
                    <span className="ds-spinner" aria-hidden="true" />
                    Téléchargement…
                  </>
                ) : (
                  <>
                    <span className="ds-btn__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </span>
                    Télécharger
                  </>
                )}
              </button>

              {canShare && (
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isSharing || isGenerating}
                  aria-busy={isSharing || undefined}
                  className="ds-btn ds-btn--primary"
                >
                  {isSharing ? (
                    <>
                      <span className="ds-spinner" aria-hidden="true" />
                      Partage…
                    </>
                  ) : (
                    <>
                      <span className="ds-btn__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </span>
                      Partager
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
