<p align="center">
  <a href="https://giftlist.fr" aria-label="Giftlist">
    <img src="apps/next/public/logo.webp" alt="Giftlist" width="220">
  </a>
</p>

# Giftlist

Monorepo Solito : application web Next.js 16.4.3 dans `apps/next`, application native
Expo dans `apps/expo`, composants et logique partagés dans `packages/app`.

## Outils

- **Bun 1.4.4** pour les dépendances, les scripts, les tests et le serveur Next.js.
  La version est fixée dans `.bun-version` et `packageManager`.
- Node.js LTS reste requis par Expo pour certaines étapes de génération des
  projets natifs. Le JavaScript embarqué sur le téléphone utilise Hermes.
- PostgreSQL et, pour une base locale, Docker Compose.

Installer [Bun 1.4.4](https://bun.com/docs/installation), puis depuis la racine :

```sh
bun --version
bun install --frozen-lockfile
cp apps/next/env.example apps/next/.env
```

Renseigner la connexion PostgreSQL et les variables serveur dans le fichier local.
Les environnements Preview et Production doivent utiliser des bases distinctes.

## Développement

```sh
bun run web:dev       # Next.js avec le runtime Bun
bun run native        # Metro / Expo avec Bun
bun run native:export # Bundles Android et iOS, export non interactif
bun run android      # Générer et lancer l'application Android
bun run ios          # Générer et lancer l'application iOS
```

Pour préparer la base locale :

```sh
bun run --cwd apps/next docker:up
bun run --cwd apps/next db:migrate
```

## Vérification

```sh
bun run test
bun run web:typecheck
bun run web:build
bun run web:start
```

Les tests de récupération utilisent une base temporaire en mémoire. Le build
local ne modifie aucune base. Les dépendances sont résolues par le seul fichier
`bun.lock`, importé depuis le précédent lockfile pour conserver leurs versions.
Le linker hoisted de `bunfig.toml` conserve un arbre compatible avec Metro.
La commande `native:export` utilise le mode CI et un worker Metro pour que
l’export Expo se termine correctement avec Bun 1.4.4.

## Dépendances et workspaces

```sh
# Dépendance partagée
bun add --cwd packages/app date-fns

# Dépendance native, avec sélection de la version compatible Expo
bun run --cwd apps/expo --bun expo install <package>
```

Les références au package partagé utilisent `workspace:*`. Après un changement
de dépendance, committer les manifestes concernés et `bun.lock`.

## Déploiement

Vercel utilise `apps/next` comme Root Directory. Sa configuration se trouve dans
`apps/next/vercel.json` : installation Bun avec lockfile figé, migrations Prisma
versionnées, puis build Next.js sous Bun. Les fonctions utilisent le runtime
`1.4.x` ; Vercel gère ses mises à jour de patch.

Les branches Git déclenchent une preview sur la base de développement. Voir
[le guide de déploiement](apps/next/DEPLOYMENT.md) et
[la réinitialisation des mots de passe](apps/next/PASSWORD_RESET.md).

Next.js 16 utilise explicitement Webpack pour conserver la résolution des
modules `.web.*` et l’alias React Native de Solito. React 19.1 reste commun aux
applications web et Expo, conformément à leurs dépendances compatibles.
