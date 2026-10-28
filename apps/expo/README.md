# Giftlist — application mobile (Expo)

- **Expo SDK 57**, React Native 0.86, React 19.2.
- Navigation native (`@react-navigation/native-stack`), session AsyncStorage, API Giftlist partagée.
- Écrans : accueil, connexion, inscription, mes listes, gestion d’une liste, liste publique/réservation, profil.

## API

Copier `env.example` vers `.env` et adapter l’URL :

```sh
cp env.example .env
```

| Contexte | `EXPO_PUBLIC_API_URL` |
|----------|------------------------|
| Simulateur iOS | `http://localhost:3000` |
| Émulateur Android | `http://10.0.2.2:3000` |
| Téléphone physique | `http://<IP-LAN>:3000` |

Le serveur web doit tourner (`bun run web:dev`) et écouter sur l’interface réseau
accessible depuis l’appareil.

## Commandes

```sh
bun run --cwd apps/expo start
bun run --cwd apps/expo ios
bun run --cwd apps/expo android
bun run --cwd apps/expo export
```

Le simulateur iOS local nécessite Xcode + un runtime iOS installé
(`xcrun simctl` doit répondre). Si Expo Simulators (cloud) est disponible sur ton
compte, `eas simulator --platform ios` est l’alternative sans Xcode.

## EAS

`eas.json` prépare les profils `development`, `preview` et `production`.
Le projet EAS doit être créé/associé au compte Expo avant le premier build :

```sh
eas login
eas build:configure
```

Aucun secret n’est versionné.

## Code partagé

- `packages/app/ui` : tokens Porcelain & Cobalt + primitives `.native` / `.web`.
- `packages/app/lib/api.ts` : client API commun.
- `packages/app/provider/session.native.tsx` : session native (AsyncStorage).
