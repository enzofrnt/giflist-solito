'use client'

import { useRouter } from 'solito/navigation'
import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Image, Dimensions } from 'react-native'
import { Svg, Path } from 'react-native-svg'
import { FlickeringGrid } from 'app/components/FlickeringGrid'

export function HomeScreen() {
  const router = useRouter()

  const handleGetStarted = () => {
    // Vérifier si l'utilisateur est connecté (seulement sur web pour l'instant)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token')
      if (token) {
        router.push('/dashboard')
        return
      }
    }
    router.push('/login')
  }

  // Récupérer la hauteur de l'écran pour le FlickeringGrid
  const screenHeight = Platform.OS === 'web' && typeof window !== 'undefined' 
    ? window.innerHeight 
    : Dimensions.get('window').height

  return (
    <View style={styles.container}>
      {/* Arrière-plan FlickeringGrid - prend toute la hauteur de l'écran visible */}
      <FlickeringGrid
        squareSize={3}
        gridGap={8}
        color="#9CA3AF"
        maxOpacity={0.15}
        flickerChance={0.05}
        style={styles.flickeringGrid}
        height={screenHeight}
        width={Platform.OS === 'web' && typeof window !== 'undefined' ? window.innerWidth : Dimensions.get('window').width}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Image
            source={Platform.OS === 'web' 
              ? { uri: '/logo.png' } 
              : require('app/assets/logo.png')
            }
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo Liste de cadeaux"
            alt="Logo Liste de cadeaux"
          />
        </View>
        <Text style={styles.title}>Liste de cadeaux 🎁</Text>
        <Text style={styles.subtitle}>
          Créez et partagez vos listes de cadeaux facilement.
          Invitez vos proches à réserver des cadeaux via QR Code ou lien direct.
        </Text>
        <Pressable 
          onPress={handleGetStarted}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={styles.buttonText}>Commencer maintenant</Text>
        </Pressable>
      </View>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <FeatureCard
          icon="plus"
          title="Créez facilement"
          description="Créez autant de listes que vous voulez pour différents événements"
          color="#3B82F6"
        />
        <FeatureCard
          icon="link"
          title="Partagez simplement"
          description="Partagez via QR Code ou lien direct avec vos proches"
          color="#10B981"
        />
        <FeatureCard
          icon="check"
          title="Gérez tout"
          description="Suivez les réservations et gérez vos listes en temps réel"
          color="#8B5CF6"
        />
      </View>
      </ScrollView>
    </View>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: 'plus' | 'link' | 'check'
  title: string
  description: string
  color: string
}) {
  const renderIcon = () => {
    switch (icon) {
      case 'plus':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )
      case 'link':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )
      case 'check':
        return (
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )
    }
  }

  return (
    <View style={styles.featureCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        {renderIcon()}
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  flickeringGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 0,
    // Fixe le FlickeringGrid pour qu'il ne scroll pas avec le contenu sur web
    ...(Platform.OS === 'web' ? { 
      position: 'fixed' as any,
      height: '100vh' as any,
    } : {}),
  } as any,
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 32,
    maxWidth: 1152, // max-w-6xl equivalent
    alignSelf: 'center',
    width: '100%',
  },
  heroSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 82,
    borderWidth: 4,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 36 : 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 14,
    color: '#4B5563',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 28 : 24,
    maxWidth: 672, // max-w-2xl equivalent
  },
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonPressed: {
    backgroundColor: '#1D4ED8',
    opacity: 0.9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -16, // Compenser le padding du contentContainer
    paddingHorizontal: 16, // Réappliquer le padding pour l'alignement
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    flex: 1,
    minWidth: 280,
    flexBasis: 0, // Permet aux cartes de partager l'espace équitablement
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
})
