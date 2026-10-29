import { Info } from 'lucide-react-native'
import { Alert, Pressable } from 'react-native'
import { useTheme } from 'app/theme/ThemeProvider.native'

export function InfoHint({ title, message }: { title: string; message: string }) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={() => Alert.alert(title, message)}
      accessibilityRole="button"
      accessibilityLabel={`À propos : ${title}`}
      hitSlop={8}
      style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
    >
      <Info size={17} color={colors.textSubtle} strokeWidth={2} />
    </Pressable>
  )
}
