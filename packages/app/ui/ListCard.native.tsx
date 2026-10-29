import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { ListChecks, Settings } from 'lucide-react-native'
import { useTheme } from 'app/theme/ThemeProvider.native'
import { Button } from './Button.native'
import { Card } from './Card.native'
import { InfoHint } from './InfoHint.native'
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
  onTogglePublic,
}: {
  list: ListCardData
  context: 'owner' | 'public'
  onOpen: () => void
  onManage?: () => void
  onTogglePublic?: () => void
}) {
  const { colors: palette } = useTheme()
  return (
    <Card>
      {list.image ? (
        <Image source={{ uri: list.image }} style={styles.cover} resizeMode="cover" accessibilityLabel={list.title} />
      ) : null}
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
            <Button title="Gérer" icon={Settings} onPress={onManage ?? onOpen} style={styles.flex} />
            {onTogglePublic ? (
              <View style={styles.publicControl}>
                <InfoHint title="Liste publique" message="Une liste publique apparaît sur votre profil public et dans la recherche. Une liste privée reste accessible uniquement avec son code complet." />
                <Pressable
                  onPress={onTogglePublic}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: list.isPublic !== false }}
                  accessibilityLabel="Liste publique"
                  style={[styles.switch, { backgroundColor: list.isPublic === false ? palette.borderStrong : palette.primary }]}
                >
                  <View style={[styles.knob, list.isPublic === false ? styles.knobOff : styles.knobOn, { backgroundColor: palette.surface }]} />
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : (
          <Button title="Voir la liste" icon={ListChecks} onPress={onOpen} fullWidth />
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  cover: { width: '100%', height: 128, borderRadius: 10, marginBottom: spacing.sm, backgroundColor: colors.surfaceMuted },
  body: { gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.text, fontSize: typography.body, fontWeight: '800', flex: 1 },
  visibility: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  visibilityText: { fontSize: typography.caption, fontWeight: '700' },
  description: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 },
  meta: { color: colors.textSubtle, fontSize: typography.caption },
  ownerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  publicControl: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  switch: { width: 46, height: 28, borderRadius: 999, justifyContent: 'center', paddingHorizontal: 3 },
  knob: { width: 22, height: 22, borderRadius: 999 },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },
  flex: { flex: 1 },
})
