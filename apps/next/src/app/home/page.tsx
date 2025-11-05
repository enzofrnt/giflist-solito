'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FlickeringGrid } from '@/components/ui/flickering-grid';

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('auth-token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Arrière-plan FlickeringGrid - seulement sur le contenu, pas sur le header */}
      <div className="fixed top-16 left-0 right-0 bottom-0 z-0">
        <FlickeringGrid
          className="w-full h-full"
          squareSize={3}
          gridGap={8}
          color="#9CA3AF"
          maxOpacity={0.15}
          flickerChance={0.05}
        />
      </div>
      
      {/* Contenu principal */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Logo Liste de cadeaux"
              width={120}
              height={120}
              className="object-contain border-4 border-indigo-200 shadow-lg rounded-xl"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Liste de cadeaux 🎁
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Créez et partagez vos listes de cadeaux facilement. 
            Invitez vos proches à réserver des cadeaux via QR Code ou lien direct.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="inline-flex justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Commencer maintenant
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Créez facilement</h3>
            <p className="text-gray-600 text-sm">
              Créez autant de listes que vous voulez pour différents événements
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Partagez simplement</h3>
            <p className="text-gray-600 text-sm">
              Partagez via QR Code ou lien direct avec vos proches
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gérez tout</h3>
            <p className="text-gray-600 text-sm">
              Suivez les réservations et gérez vos listes en temps réel
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}