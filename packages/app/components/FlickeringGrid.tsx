'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, Animated, Platform, LayoutChangeEvent } from 'react-native'

interface FlickeringGridProps {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  width?: number
  height?: number
  style?: any
  maxOpacity?: number
}

interface Square {
  id: number
  opacity: Animated.Value
  x: number
  y: number
}

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = 'rgb(0, 0, 0)',
  width,
  height,
  style,
  maxOpacity = 0.3,
}: FlickeringGridProps) {
  const containerRef = useRef<View>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const squaresRef = useRef<Square[]>([])
  const animationRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)

  // Convertir la couleur en RGBA
  const rgbaColor = useMemo(() => {
    if (color.startsWith('rgb')) {
      // Extraire les valeurs RGB
      const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/)
      if (match && match[1] && match[2] && match[3]) {
        const r = parseInt(match[1])
        const g = parseInt(match[2])
        const b = parseInt(match[3])
        return { r, g, b }
      }
    }
    // Couleur hex
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const r = parseInt(hex.slice(0, 2) || '00', 16)
      const g = parseInt(hex.slice(2, 4) || '00', 16)
      const b = parseInt(hex.slice(4, 6) || '00', 16)
      return { r, g, b }
    }
    // Par défaut, gris
    return { r: 156, g: 163, b: 175 }
  }, [color])

  // Calculer les dimensions de la grille
  const gridParams = useMemo(() => {
    const w = width || containerSize.width
    const h = height || containerSize.height
    if (w === 0 || h === 0) return { cols: 0, rows: 0, totalSquares: 0 }

    const cols = Math.floor(w / (squareSize + gridGap))
    const rows = Math.floor(h / (squareSize + gridGap))
    return { cols, rows, totalSquares: cols * rows }
  }, [width, height, containerSize, squareSize, gridGap])

  // Initialiser les carrés
  useEffect(() => {
    if (gridParams.totalSquares === 0) return

    const squares: Square[] = []
    for (let i = 0; i < gridParams.cols; i++) {
      for (let j = 0; j < gridParams.rows; j++) {
        const id = i * gridParams.rows + j
        squares.push({
          id,
          opacity: new Animated.Value(Math.random() * maxOpacity),
          x: i * (squareSize + gridGap),
          y: j * (squareSize + gridGap),
        })
      }
    }
    squaresRef.current = squares
  }, [gridParams, squareSize, gridGap, maxOpacity])

  // Animation des carrés
  const animate = useCallback(() => {
    const now = Date.now()
    const deltaTime = (now - lastUpdateRef.current) / 1000
    lastUpdateRef.current = now

    squaresRef.current.forEach((square) => {
      if (Math.random() < flickerChance * deltaTime) {
        const newOpacity = Math.random() * maxOpacity
        Animated.timing(square.opacity, {
          toValue: newOpacity,
          duration: 100,
          useNativeDriver: true,
        }).start()
      }
    })

    if (Platform.OS === 'web') {
      animationRef.current = requestAnimationFrame(animate) as any
    } else {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [flickerChance, maxOpacity])

  // Démarrer l'animation
  useEffect(() => {
    if (gridParams.totalSquares === 0) return

    lastUpdateRef.current = Date.now()
    animate()

    return () => {
      if (animationRef.current !== null) {
        if (Platform.OS === 'web') {
          cancelAnimationFrame(animationRef.current as number)
        } else {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [gridParams.totalSquares, animate])

  // Gérer le redimensionnement du conteneur
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout
    if (w > 0 && h > 0) {
      setContainerSize({ width: w, height: h })
    }
  }, [])

  // Rendre un carré
  const renderSquare = useCallback(
    (square: Square) => {
      const animatedStyle = {
        opacity: square.opacity,
        backgroundColor: `rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, 1)`,
      }

      return (
        <Animated.View
          key={square.id}
          style={[
            styles.square,
            {
              width: squareSize,
              height: squareSize,
              left: square.x,
              top: square.y,
            },
            animatedStyle,
          ]}
        />
      )
    },
    [squareSize, rgbaColor]
  )

  return (
    <View
      ref={containerRef}
      style={[styles.container, style]}
      onLayout={handleLayout}
      pointerEvents="none"
    >
      {squaresRef.current.map(renderSquare)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  square: {
    position: 'absolute',
  },
})

