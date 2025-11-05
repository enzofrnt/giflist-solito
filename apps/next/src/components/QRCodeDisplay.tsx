'use client';

import QRCodeStyling from 'qr-code-styling';
import { useEffect, useRef, useState } from 'react';

interface QRCodeDisplayProps {
  shareCode: string;
  title?: string;
  className?: string;
  listImage?: string; // Image de la liste pour le QR code
}

interface QRCodeRef extends QRCodeStyling {
  pngVersion?: QRCodeStyling;
  pngContainer?: HTMLDivElement;
}

export default function QRCodeDisplay({ shareCode, title = "Scanner avec un appareil mobile", className = "", listImage }: QRCodeDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeRef | null>(null);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/list/${shareCode}` : '';

  useEffect(() => {
    if (shareCode && qrRef.current) {
      setIsGenerating(true);
      
      // Utiliser l'image de la liste ou le logo par défaut
      const getCenterImage = () => {
        if (listImage && listImage.trim()) {
          return listImage; // Utiliser l'image de la liste si elle existe
        }
        
        // Sinon, utiliser le logo par défaut
        return '/logo.png';
      };
      
      // Créer le QR code avec des modules arrondis (SVG pour affichage)
      const qrCode = new QRCodeStyling({
        width: 256,
        height: 256,
        type: "svg",
        data: `${window.location.origin}/list/${shareCode}`,
        image: getCenterImage(),
        margin: 20,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'M'
        },
        dotsOptions: {
          color: '#1f2937', // Gris foncé pour les modules
          type: 'extra-rounded' // Modules très arrondis !
        },
        backgroundOptions: {
          color: '#ffffff',
        },
        cornersSquareOptions: {
          color: '#3b82f6', // Bleu pour les carrés de position (angles)
          type: 'extra-rounded' // Coins des carrés de position très arrondis
        },
        cornersDotOptions: {
          color: '#3b82f6', // Bleu pour les points des carrés de position
          type: 'extra-rounded' // Points des coins très arrondis
        },
        imageOptions: {
          hideBackgroundDots: true, // Cache les points derrière l'image
          imageSize: 0.8, // Taille de l'image (40% du QR code)
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
          errorCorrectionLevel: 'M'
        },
        dotsOptions: {
          color: '#1f2937',
          type: 'extra-rounded'
        },
        backgroundOptions: {
          color: '#ffffff',
        },
        cornersSquareOptions: {
          color: '#3b82f6',
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: '#3b82f6',
          type: 'extra-rounded'
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.8,
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
  }, [shareCode, listImage]);

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
    <div className={`text-center ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>
      
      {isGenerating ? (
        <div className="inline-block">
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-64 h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="inline-block">
          {/* Conteneur simple et épuré */}
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            {/* QR Code avec modules arrondis natifs */}
            <div className="relative w-64 h-64 rounded-lg overflow-hidden flex items-center justify-center">
              <div ref={qrRef} className="w-full h-full" />
            </div>
          </div>
          
          {/* Instructions simples */}
          <div className="mt-3 text-sm text-gray-500">
            📱 Pointez votre appareil photo vers le code
          </div>

          {/* Boutons de téléchargement et partage */}
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={handleDownload}
              disabled={isDownloading || isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Téléchargement...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger
                </>
              )}
            </button>

            {canShare && (
              <button
                onClick={handleShare}
                disabled={isSharing || isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSharing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Partage...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Partager
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
