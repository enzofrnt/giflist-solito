'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuthContext();

  function isActive(path: string) {
    return pathname === path;
  }

  if (!user && loading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.webp"
                alt="Logo Liste de cadeaux"
                width={40}
                height={40}
                className="rounded-full object-cover border-2 border-indigo-200 shadow-sm"
              />
              <span className="text-xl font-bold text-gray-900">Liste de cadeaux</span>
            </div>
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.webp"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-indigo-200 shadow-sm"
            />
            <span className="text-xl font-bold text-gray-900">Liste de cadeaux</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Accueil
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mes listes
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <Link 
                    href="/profile"
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors group"
                  >
                    <Image
                      src="/logo.webp"
                      alt="Logo Liste de cadeaux"
                      width={32}
                      height={32}
                      className="rounded-full object-cover border border-indigo-200"
                    />
                    <span className={`text-sm font-medium transition-colors ${
                      isActive('/profile') 
                        ? 'text-blue-700' 
                        : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {user.name}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors min-h-[44px] flex items-center justify-center relative z-10"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors min-h-[44px] flex items-center justify-center relative z-10"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  Créer un compte
                </Link>
              </div>
            )}
          </nav>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2.5 text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 relative z-10">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className={`px-3 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px] flex items-center justify-center relative z-10 ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                Accueil
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowMobileMenu(false)}
                    className={`px-3 py-3 text-sm font-medium rounded-lg transition-colors min-h-[44px] flex items-center justify-center relative z-10 ${
                      isActive('/dashboard') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  >
                    Mes listes
                  </Link>
                  <div className="px-3 py-2 border-t border-gray-200 mt-2 pt-3">
                    <Link 
                      href="/profile"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-2 mb-3 hover:bg-gray-50 rounded-lg p-3 transition-colors group min-h-[44px] relative z-10"
                      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                    >
                      <Image
                        src="/logo.webp"
                        alt="Logo Liste de cadeaux"
                        width={32}
                        height={32}
                        className="rounded-full object-cover border border-indigo-200"
                      />
                      <span className={`text-sm font-medium transition-colors ${
                        isActive('/profile') 
                          ? 'text-blue-700' 
                          : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {user.name}
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-3 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors text-left min-h-[44px] flex items-center justify-center relative z-10"
                      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-3 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors text-center min-h-[44px] flex items-center justify-center relative z-10"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-3 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-center min-h-[44px] flex items-center justify-center relative z-10"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  >
                    Créer un compte
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
