import { Platform, Image, ImageStyle, StyleProp } from 'react-native'
import { SolitoImage } from 'solito/image'

interface LogoImageProps {
  style?: StyleProp<ImageStyle>
  width: number
  height: number
  alt?: string
  contentFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

// Sur React Native, utiliser l'image locale PNG depuis les assets
// Sur web, utiliser SolitoImage avec le WebP depuis public
export function LogoImage({ style, width, height, alt = 'Logo', contentFit = 'contain' }: LogoImageProps) {
  if (Platform.OS === 'web') {
    // Sur web, utiliser SolitoImage avec le WebP depuis public
    return (
      <SolitoImage
        src="/logo.webp"
        style={style as any}
        width={width}
        height={height}
        alt={alt}
        contentFit={contentFit}
      />
    )
  }

  // Sur React Native, utiliser Image avec require() pour l'image locale PNG
  const logoImage = require('app/assets/logo.png')
  
  return (
    <Image
      source={logoImage}
      style={[style, { width, height }]}
      resizeMode={contentFit === 'contain' ? 'contain' : contentFit === 'cover' ? 'cover' : 'contain'}
      accessibilityLabel={alt}
      alt={alt}
    />
  )
}

