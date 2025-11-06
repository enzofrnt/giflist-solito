'use client'

import { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, Platform, ActivityIndicator, Dimensions } from 'react-native'
import { useRouter, usePathname } from 'solito/navigation'
import { useAuth } from 'app/hooks/useAuth'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { LogoImage } from 'app/components/LogoImage'

export function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  // Initialiser isMobile correctement selon la plateforme
  const [isMobile, setIsMobile] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    if (Platform.OS !== 'web') {
      const { width } = Dimensions.get('window')
      return width < 768
    }
    return false
  })
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeArea()

  // Détecter si on est sur mobile (web ou native)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const checkMobile = () => {
        const mobile = window.innerWidth < 768 // Breakpoint md (768px)
        setIsMobile(mobile)
        // Fermer le menu si on passe en mode desktop
        if (!mobile && showMobileMenu) {
          setShowMobileMenu(false)
        }
      }
      // Vérifier immédiatement au montage
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    } else {
      // Sur React Native, utiliser la largeur de l'écran
      const subscription = Dimensions.addEventListener('change', ({ window: { width } }) => {
        const mobile = width < 768
        setIsMobile(mobile)
        // Fermer le menu si on passe en mode desktop
        if (!mobile && showMobileMenu) {
          setShowMobileMenu(false)
        }
      })
      const { width } = Dimensions.get('window')
      setIsMobile(width < 768)
      return () => subscription?.remove()
    }
  }, [showMobileMenu])
  
  // Pour React Native, définir l'URL de l'API via une variable d'environnement
  // ou utiliser la valeur par défaut pour le développement local
  const getApiBaseUrl = () => {
    if (Platform.OS === 'web') {
      return '' // Sur web, utilise les chemins relatifs
    }
    // Pour React Native, utiliser une variable d'environnement si disponible
    // Sinon, utiliser localhost pour le développement
    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL
    }
    return 'http://localhost:3000' // Valeur par défaut pour le développement
  }

  const { user, loading, logout } = useAuth({ 
    noRedirect: true, 
    watchPathname: true,
    apiBaseUrl: getApiBaseUrl()
  })

  function isActive(path: string) {
    // Sur iOS, le pathname peut être vide ou undefined quand on est sur l'accueil
    if (path === '/') {
      return pathname === '/' || pathname === '' || !pathname
    }
    return pathname === path
  }

  function handleNavigate(href: string) {
    setShowMobileMenu(false)
    router.push(href)
  }

  function handleLogout() {
    logout()
    setShowMobileMenu(false)
  }

  if (!user && loading) {
    return (
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
        <View style={styles.container}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <View style={{ backgroundColor: 'transparent' } as any}>
                <LogoImage
                  style={styles.logo}
                  width={40}
                  height={28}
                  alt="Logo Liste de cadeaux"
                  contentFit="contain"
                />
              </View>
              <Text style={styles.title}>Liste de cadeaux</Text>
            </View>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        </View>
      </View>
    )
  }

  return (
    <View 
      style={[styles.header, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout
        if (height !== headerHeight) {
          setHeaderHeight(height)
        }
      }}
    >
      <View style={styles.container}>
        <View style={styles.headerContent}>
          {/* Logo et titre */}
          <Pressable 
            onPress={() => handleNavigate('/')}
            style={({ pressed }) => [
              styles.logoLink,
              pressed && styles.pressed
            ]}
          >
            <View style={{ backgroundColor: 'transparent' }}>
              <LogoImage
                style={styles.logo}
                width={40}
                height={28}
                alt="Logo"
                contentFit="contain"
              />
            </View>
            <Text style={styles.title}>Liste de cadeaux</Text>
          </Pressable>

          {/* Navigation desktop - masqué sur mobile */}
          {!isMobile && (
            <View style={styles.desktopNav}>
            <Pressable
              onPress={() => handleNavigate('/')}
              style={({ pressed }) => [
                styles.navLink,
                isActive('/') && styles.navLinkActive,
                pressed && styles.navLinkPressed
              ]}
            >
              <Text style={[
                styles.navLinkText,
                isActive('/') && styles.navLinkTextActive
              ]}>
                Accueil
              </Text>
            </Pressable>
            
            {user ? (
              <>
                <Pressable
                  onPress={() => handleNavigate('/dashboard')}
                  style={({ pressed }) => [
                    styles.navLink,
                    isActive('/dashboard') && styles.navLinkActive,
                    pressed && styles.navLinkPressed
                  ]}
                >
                  <Text style={[
                    styles.navLinkText,
                    isActive('/dashboard') && styles.navLinkTextActive
                  ]}>
                    Mes listes
                  </Text>
                </Pressable>
                <View style={styles.userSection}>
                  <Pressable
                    onPress={() => handleNavigate('/profile')}
                    style={({ pressed }) => [
                      styles.profileLink,
                      pressed && styles.profileLinkPressed
                    ]}
                  >
                    <View style={{ backgroundColor: 'transparent' }}>
                      <LogoImage
                        style={styles.avatar}
                        width={32}
                        height={22}
                        alt="Logo Liste de cadeaux"
                        contentFit="contain"
                      />
                    </View>
                    <Text style={[
                      styles.profileName,
                      isActive('/profile') && styles.profileNameActive
                    ]}>
                      {user.name}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleLogout}
                    style={({ pressed }) => [
                      styles.logoutButton,
                      pressed && styles.logoutButtonPressed
                    ]}
                  >
                    <Text style={styles.logoutButtonText}>Déconnexion</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.authButtons}>
                <Pressable
                  onPress={() => handleNavigate('/login')}
                  style={({ pressed }) => [
                    styles.loginButton,
                    pressed && styles.loginButtonPressed
                  ]}
                >
                  <Text style={styles.loginButtonText}>Connexion</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleNavigate('/register')}
                  style={({ pressed }) => [
                    styles.registerButton,
                    pressed && styles.registerButtonPressed
                  ]}
                >
                  <Text style={styles.registerButtonText}>Créer un compte</Text>
                </Pressable>
              </View>
            )}
            </View>
          )}

          {/* Bouton menu mobile - affiché sur mobile */}
          {isMobile && (
            <Pressable
            onPress={() => setShowMobileMenu(!showMobileMenu)}
            style={({ pressed }) => [
              styles.mobileMenuButton,
              pressed && styles.mobileMenuButtonPressed
            ]}
          >
            <View style={styles.hamburgerIcon}>
              <View style={[styles.hamburgerLine, { marginBottom: 4 }]} />
              <View style={[styles.hamburgerLine, { marginBottom: 4 }]} />
              <View style={styles.hamburgerLine} />
            </View>
          </Pressable>
          )}
        </View>
      </View>

      {/* Menu mobile */}
      {showMobileMenu && isMobile && (
            <View 
              style={[
                styles.mobileMenu,
                Platform.OS === 'web' ? {
                  maxHeight: headerHeight > 0 ? `calc(100vh - ${headerHeight}px)` as any : 'calc(100vh - 70px)' as any,
                } : headerHeight > 0 ? {
                  top: headerHeight,
                } : {},
              ]}
            >
            <View style={styles.mobileNav}>
              <Pressable
                onPress={() => handleNavigate('/')}
                style={({ pressed }) => [
                  styles.mobileNavLink,
                  isActive('/') && styles.mobileNavLinkActive,
                  pressed && styles.mobileNavLinkPressed
                ]}
              >
                <Text style={[
                  styles.mobileNavLinkText,
                  isActive('/') && styles.mobileNavLinkTextActive
                ]}>
                  Accueil
                </Text>
              </Pressable>
              
              {user ? (
                <>
                  <Pressable
                    onPress={() => handleNavigate('/dashboard')}
                    style={({ pressed }) => [
                      styles.mobileNavLink,
                      isActive('/dashboard') && styles.mobileNavLinkActive,
                      pressed && styles.mobileNavLinkPressed
                    ]}
                  >
                    <Text style={[
                      styles.mobileNavLinkText,
                      isActive('/dashboard') && styles.mobileNavLinkTextActive
                    ]}>
                      Mes listes
                    </Text>
                  </Pressable>
                  <View style={styles.mobileUserSection}>
                    <Pressable
                      onPress={() => handleNavigate('/profile')}
                      style={({ pressed }) => [
                        styles.mobileProfileLink,
                        pressed && styles.mobileProfileLinkPressed
                      ]}
                    >
                      <View style={{ backgroundColor: 'transparent' }}>
                        <LogoImage
                          style={styles.mobileAvatar}
                          width={32}
                          height={32}
                          alt="Logo Liste de cadeaux"
                          contentFit="contain"
                        />
                      </View>
                      <Text style={[
                        styles.mobileProfileName,
                        isActive('/profile') && styles.mobileProfileNameActive
                      ]}>
                        {user.name}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleLogout}
                      style={({ pressed }) => [
                        styles.mobileLogoutButton,
                        pressed && styles.mobileLogoutButtonPressed
                      ]}
                    >
                      <Text style={styles.mobileLogoutButtonText}>Déconnexion</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <View style={styles.mobileAuthButtons}>
                  <Pressable
                    onPress={() => handleNavigate('/login')}
                    style={({ pressed }) => [
                      styles.mobileLoginButton,
                      pressed && styles.mobileLoginButtonPressed
                    ]}
                  >
                    <Text style={styles.mobileLoginButtonText}>Connexion</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleNavigate('/register')}
                    style={({ pressed }) => [
                      styles.mobileRegisterButton,
                      pressed && styles.mobileRegisterButtonPressed
                    ]}
                  >
                    <Text style={styles.mobileRegisterButtonText}>Créer un compte</Text>
                  </Pressable>
                </View>
              )}
            </View>
            </View>
        )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    position: 'relative' as any,
    zIndex: 1000,
  },
  container: {
    maxWidth: 1152, // max-w-6xl
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...(Platform.OS === 'web' ? {
      marginHorizontal: 'auto',
      paddingHorizontal: 24,
    } : {}),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  logo: {
    width: 40,
    height: 28,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  desktopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navLinkActive: {
    backgroundColor: '#DBEAFE',
  },
  navLinkPressed: {
    backgroundColor: '#F3F4F6',
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  navLinkTextActive: {
    color: '#1D4ED8',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  profileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  profileLinkPressed: {
    backgroundColor: '#F9FAFB',
  },
  avatar: {
    width: 32,
    height: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: 'transparent',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  profileNameActive: {
    color: '#1D4ED8',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  logoutButtonPressed: {
    backgroundColor: '#E5E7EB',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonPressed: {
    backgroundColor: '#E5E7EB',
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  registerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  mobileMenuButton: {
    padding: 10,
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileMenuButtonPressed: {
    backgroundColor: '#F3F4F6',
  },
  hamburgerIcon: {
    width: 24,
    height: 18,
    justifyContent: 'center',
  },
  hamburgerLine: {
    width: 24,
    height: 2,
    backgroundColor: '#374151',
    borderRadius: 1,
  },
  overlay: {
    position: 'absolute' as any,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    ...(Platform.OS === 'web' ? {
      position: 'fixed' as any,
      left: 0,
      width: '100vw' as any,
    } : {}),
  } as any,
  mobileMenu: {
    position: 'absolute' as any,
    top: '100%' as any,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    zIndex: 1001,
    ...(Platform.OS === 'web' ? {
      width: '100%' as any,
      overflowY: 'auto' as any,
      boxShadow: 'none' as any,
    } : {}),
  } as any,
  mobileNav: {
    gap: 8,
  },
  mobileNavLink: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileNavLinkActive: {
    backgroundColor: '#DBEAFE',
  },
  mobileNavLinkPressed: {
    backgroundColor: '#F3F4F6',
  },
  mobileNavLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  mobileNavLinkTextActive: {
    color: '#1D4ED8',
  },
  mobileUserSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 12,
  },
  mobileProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    minHeight: 44,
  },
  mobileProfileLinkPressed: {
    backgroundColor: '#F9FAFB',
  },
  mobileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: 'transparent',
  },
  mobileProfileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  mobileProfileNameActive: {
    color: '#1D4ED8',
  },
  mobileLogoutButton: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileLogoutButtonPressed: {
    backgroundColor: '#E5E7EB',
  },
  mobileLogoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  mobileAuthButtons: {
    gap: 8,
    marginTop: 8,
  },
  mobileLoginButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileLoginButtonPressed: {
    backgroundColor: '#E5E7EB',
  },
  mobileLoginButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  mobileRegisterButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileRegisterButtonPressed: {
    backgroundColor: '#1D4ED8',
  },
  mobileRegisterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
})

