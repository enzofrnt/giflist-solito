import { NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { useMemo } from 'react'

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationContainer
      linking={useMemo(
        () => ({
          prefixes: [Linking.createURL('/')],
          config: {
            initialRouteName: 'home' as const,
            screens: {
              home: '',
              login: 'login',
              register: 'register',
              main: 'mes-listes',
              manage: 'manage/:id',
              giftForm: 'manage/:id/cadeau',
              public: 'list/:shareCode',
            },
          },
        }),
        []
      )}
    >
      {children}
    </NavigationContainer>
  )
}
