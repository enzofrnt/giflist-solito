'use client';

import QRCodeStyling from 'qr-code-styling';
import { useEffect, useId, useRef, useState } from 'react';

interface QRCodeDisplayProps {
  shareCode: string;
  title?: string;
  className?: string;
}

interface QRCodeRef extends QRCodeStyling {
  pngVersion?: QRCodeStyling;
  pngContainer?: HTMLDivElement;
}

/** Reads a design token so the QR encoder stays in sync with the palette (no raw hex here). */
function readToken(name: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || undefined;
}

export default function QRCodeDisplay({ shareCode, title = "Scanner avec un appareil mobile", className = "" }: QRCodeDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeRef | null>(null);
  const helpId = useId();
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/list/${shareCode}` : '';

  useEffect(() => {
    if (shareCode && qrRef.current) {
      setIsGenerating(true);

      // Le centre du QR reste toujours le logo de l'application.
      const getCenterImage = () => '/logo.webp';

      // Couleurs issues des tokens du design system (aucune valeur brute ici)
      const ink = readToken('--ds-color-text');
      const primary = readToken('--ds-color-primary');
      const surface = readToken('--ds-color-surface');

      // Créer le QR code avec des modules arrondis (SVG pour affichage)
      const qrCode = new QRCodeStyling({
        width: 224,
        height: 224,
        type: "svg",
        data: `${window.location.origin}/list/${shareCode}`,
        image: getCenterImage(),
        margin: 20,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H'
        },
        dotsOptions: {
          color: ink, // Modules
          type: 'extra-rounded' // Modules très arrondis !
        },
        backgroundOptions: {
          color: surface,
        },
        cornersSquareOptions: {
          color: primary, // Carrés de position (angles)
          type: 'extra-rounded' // Coins des carrés de position très arrondis
        },
        cornersDotOptions: {
          color: primary, // Points des carrés de position
          type: 'extra-rounded' // Points des coins très arrondis
        },
        imageOptions: {
          hideBackgroundDots: true, // Cache les points derrière l'image
          imageSize: 0.32, // Logo compact, ~25 % du QR, avec correction H
          saveAsBlob: true
        }
      });

      // Créer une version PNG pour le téléchargement/partage (haute résolution)
      const pngSize = 1536; // 3x la taille originale (512) pour une meilleure qualité
      const qrCodePNG = new QRCodeStyling({
        width: pngSize,
        height: pngSize,
        type: "canvas",
        data: `${window.location.origin}/list/${shareCode}`,
        image: getCenterImage(),
        margin: 20,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H'
        },
        dotsOptions: {
          color: ink,
          type: 'extra-rounded'
        },
        backgroundOptions: {
          color: surface,
        },
        cornersSquareOptions: {
          color: primary,
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: primary,
          type: 'extra-rounded'
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.32,
          saveAsBlob: true
        }
      });

      // Créer un conteneur temporaire invisible pour rendre le canvas PNG
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = `${pngSize}px`;
      tempContainer.style.height = `${pngSize}px`;
      document.body.appendChild(tempContainer);

      // Rendre le canvas PNG dans le conteneur temporaire
      qrCodePNG.append(tempContainer);

      // Nettoyer l'ancien QR code
      if (qrCodeRef.current) {
        qrRef.current.innerHTML = '';
      }

      // Afficher le nouveau QR code SVG
      qrCode.append(qrRef.current);
      qrCodeRef.current = qrCode as QRCodeRef;

      // Stocker la version PNG et le conteneur temporaire
      qrCodeRef.current.pngVersion = qrCodePNG;
      qrCodeRef.current.pngContainer = tempContainer;

      setIsGenerating(false);
    }

    // Nettoyer le conteneur temporaire lors du démontage
    return () => {
      const qrRef = qrCodeRef.current as QRCodeRef | null;
      const pngContainer = qrRef?.pngContainer;
      if (pngContainer && pngContainer.parentNode) {
        document.body.removeChild(pngContainer);
      }
    };
  }, [shareCode]);

  // Vérifier si l'API Web Share est disponible
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  async function handleDownload() {
    if (!qrCodeRef.current) return;

    setIsDownloading(true);
    try {
      // Récupérer la version PNG du QR code et son conteneur
      const qrRef = qrCodeRef.current as QRCodeRef | null;
      const pngVersion = qrRef?.pngVersion;
      const pngContainer = qrRef?.pngContainer;

      if (!pngVersion || !pngContainer) {
        console.error('Version PNG non disponible');
        return;
      }

      // Trouver le canvas dans le conteneur
      const canvas = pngContainer.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) {
        console.error('Canvas non trouvé');
        return;
      }

      // Convertir le canvas en blob puis télécharger
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `qr-code-${shareCode}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          // Nettoyer l'URL après le téléchargement
          setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
          console.error('Erreur lors de la conversion du canvas en blob');
        }
        setIsDownloading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setIsDownloading(false);
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

        {isGenerating ? (
          <div className="ds-card ds-card--flat w-full" role="status" aria-live="polite">
            <div className="ds-card__body items-center justify-items-center">
              <span className="ds-spinner" aria-hidden="true" />
              <p className="ds-hint">Génération du QR code…</p>
            </div>
          </div>
        ) : (
          <div className="ds-card ds-card--flat w-full max-w-full">
            <div className="ds-card__body items-center justify-items-center">
              <div ref={qrRef} className="h-56 w-56 max-w-full" aria-label="QR code de partage de la liste" aria-describedby={helpId} role="img" />
              <p className="ds-hint" id={helpId}>📱 Pointez votre appareil photo vers le code</p>

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
        )}
      </div>

    </div>
  );
}
