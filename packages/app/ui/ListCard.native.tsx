import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Gift as GiftIcon, ListChecks, Settings } from 'lucide-react-native'
import { useTheme } from 'app/theme/ThemeProvider.native'
import { Button } from './Button.native'
import { FavoriteButton } from './FavoriteButton.native'
import { Card } from './Card.native'
import { colors, spacing, typography } from './tokens'

export type ListCardData = {
  title: string
  description?: string | null
  image?: string | null
  giftsCount: number
  isPublic?: boolean
  secret?: boolean
  createdAt?: string
}

export function ListCard({
  list,
  context,
  onOpen,
  onManage,
  isFavorite,
  onToggleFavorite,
  favoriteBusy,
}: {
  list: ListCardData
  context: 'owner' | 'public'
  onOpen: () => void
  onManage?: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  favoriteBusy?: boolean
}) {
  const { colors: palette } = useTheme()
  return (
    <Card>
      {list.image ? (
        <Image source={{ uri: list.image }} style={styles.cover} resizeMode="cover" accessibilityLabel={list.title} />
      ) : (
        <View style={[styles.cover, styles.coverEmpty]}>
          <GiftIcon size={28} color={colors.textSubtle} strokeWidth={1.8} />
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{list.title}</Text>
          {context === 'owner' ? (
            <View style={[styles.visibility, { backgroundColor: list.isPublic === false ? palette.warningSoft : palette.successSoft }]}>
              <Text style={[styles.visibilityText, { color: list.isPublic === false ? palette.warning : palette.success }]}>
                {list.isPublic === false ? 'Privée' : 'Publique'}
              </Text>
            </View>
          ) : null}
        </View>
        {list.description ? <Text style={styles.description} numberOfLines={3}>{list.description}</Text> : null}
        <Text style={styles.meta}>{list.giftsCount} cadeau{list.giftsCount > 1 ? 'x' : ''}{context === 'owner' && list.secret ? ' · Mode secret' : ''}</Text>
        {context === 'owner' ? (
          <View style={styles.ownerActions}>
            <Button title="Gérer" icon={Settings} onPress={onManage ?? onOpen} fullWidth />
          </View>
        ) : (
          <View style={styles.publicActions}>
            <Button title="Voir la liste" icon={ListChecks} onPress={onOpen} style={styles.flex} />
            {onToggleFavorite ? <FavoriteButton active={Boolean(isFavorite)} onPress={onToggleFavorite} busy={favoriteBusy} /> : null}
          </View>
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  cover: { width: '100%', aspectRatio: 16 / 10, borderRadius: 10, marginBottom: spacing.sm, backgroundColor: colors.surfaceMuted },
  coverEmpty: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  body: { gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.text, fontSize: typography.body, fontWeight: '800', flex: 1 },
  visibility: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  visibilityText: { fontSize: typography.caption, fontWeight: '700' },
  description: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  meta: { color: colors.textSubtle, fontSize: typography.caption },
  ownerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  publicActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
})
