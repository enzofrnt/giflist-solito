import AsyncStorage from '@react-native-async-storage/async-storage'

const AUTH_TOKEN_KEY = 'auth-token'

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export async function setAuthToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du token:', error)
  }
}

export async function removeAuthToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
  } catch (error) {
    console.error('Erreur lors de la suppression du token:', error)
  }
}
