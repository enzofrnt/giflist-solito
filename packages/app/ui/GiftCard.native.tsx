import { Image, StyleSheet, Text, View } from 'react-native'
import { Gift, Pencil, RotateCcw, Trash2 } from 'lucide-react-native'
import type { Gift as GiftType } from 'app/types'
import { Button } from './Button.native'
import { Card } from './Card.native'
import { Badge } from './Badge.native'
import { colors, spacing, typography } from './tokens'

export function GiftCard({
  gift,
  context,
  onEdit,
  onDelete,
  onReserve,
  onCancelReservation,
}: {
  gift: GiftType
  context: 'owner' | 'public'
  onEdit?: () => void
  onDelete?: () => void
  onReserve?: () => void
  onCancelReservation?: () => void
}) {
  const reserved = gift.status === 'reserved'
  return (
    <Card>
      <View style={styles.row}>
        {gift.image ? (
          <Image source={{ uri: gift.image }} style={styles.thumb} resizeMode="cover" accessibilityLabel={gift.title} />
        ) : (
          <View style={[styles.thumb, styles.thumbEmpty]}>
            <Image source={require('app/assets/icon.png')} style={styles.fallback} accessibilityLabel="Giftlist" />
          </View>
        )}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{gift.title}</Text>
            <Badge label={reserved ? 'Réservé' : 'Disponible'} tone={reserved ? 'warning' : 'success'} />
          </View>
          {gift.price != null ? <Text style={styles.meta}>{gift.price} €</Text> : null}
          {gift.description ? <Text style={styles.description} numberOfLines={2}>{gift.description}</Text> : null}
        </View>
      </View>
      {context === 'owner' ? (
        <View style={styles.actions}>
          <Button title="Modifier" icon={Pencil} variant="secondary" onPress={onEdit!} style={styles.flex} />
          {reserved && onCancelReservation ? (
            <Button title="Annuler la réservation" icon={RotateCcw} variant="secondary" onPress={onCancelReservation} style={styles.flex} />
          ) : null}
          <Button title="Supprimer" icon={Trash2} variant="danger" onPress={onDelete!} style={styles.flex} />
        </View>
      ) : reserved && onCancelReservation ? (
        <Button title="Annuler la réservation" icon={RotateCcw} variant="secondary" onPress={onCancelReservation} fullWidth />
      ) : !reserved ? (
        <Button title="Réserver ce cadeau" icon={Gift} onPress={onReserve!} fullWidth />
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  thumb: { width: 92, height: 92, borderRadius: 10, backgroundColor: colors.surfaceMuted },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  fallback: { width: 44, height: 44, borderRadius: 10 },
  info: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { color: colors.text, fontSize: typography.body, fontWeight: '700', flex: 1 },
  meta: { color: colors.textSubtle, fontSize: typography.caption },
  description: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  flex: { flex: 1 },
})
