# Déploiement Giftlist sur Vercel

## Configuration du projet

- Projet : `giflist-solito`.
- Root Directory : `apps/next`.
- Framework : Next.js.
- Configuration versionnée : `apps/next/vercel.json`.
- Installation : `cd ../.. && bun install --frozen-lockfile`.
- Build : `bun run build:vercel`.
- Runtime des fonctions : Bun `1.4.x`.

Bun 1.4.4 est la version de référence du monorepo (`packageManager` et
`.bun-version`). Le fichier `bun.lock` est le seul lockfile. Ne pas ajouter de
lockfile npm, pnpm ou Yarn. L’installation génère le client Prisma sans ouvrir
une connexion à la base de données.

## Bases et environnements

Les variables Vercel sont propres à chaque environnement. Preview et Development
pointent sur `Gift-dev`, Production sur `Gift-Production`. Ne pas recopier les
identifiants de production dans une preview.

Variables de connexion serveur :

- `POSTGRES_PRISMA_URL` : connexion Prisma utilisée par l’application.
- `DATABASE_URL` : alternative si `POSTGRES_PRISMA_URL` n’est pas définie.
- `POSTGRES_URL_NON_POOLING` : connexion directe pour les migrations, si disponible.

Ajouter aussi `JWT_SECRET`. Pour les e-mails de récupération, configurer
`RESEND_API_KEY`, `EMAIL_FROM` et `APP_URL` dans chaque environnement concerné.
Voir [PASSWORD_RESET.md](PASSWORD_RESET.md). Les secrets restent dans Vercel ou
un fichier `.env` ignoré par Git.

Une clé JWT distincte est configurée pour la branche `codex/bun-migration` en
Preview. Vercel capture les variables lors de la création du déploiement : après
une modification de configuration, un nouveau push doit déclencher une nouvelle
preview pour qu’elle prenne effet. Les variables d’envoi d’e-mails Preview restent
à renseigner séparément pour tester la récupération par e-mail.

## Build de déploiement

`scripts/build-vercel.mjs` exécute sous Bun :

1. `prisma migrate deploy` sur la base de **cet environnement**, avec un délai
   maximal de 120 secondes. La connexion non poolée est prioritaire, puis
   `DATABASE_URL`, puis `POSTGRES_PRISMA_URL`.
2. La génération du client à partir de `prisma/schema.production.prisma`.
3. `next build` avec le runtime Bun.

Le build échoue si la migration échoue ou si une connexion de base manque sur
Vercel. Il n’utilise aucun `db push`, reset ou mécanisme acceptant une perte de
données. Les schémas PostgreSQL local et production restent identiques ; aucune
base SQLite n’est utilisée.

Le build local `bun run web:build` génère le client et compile le web sans lancer
de migration. Le build ne recopie et ne modifie plus les schémas Prisma.

## Commandes

Depuis la racine du dépôt :

```sh
bun install --frozen-lockfile
bun run test
bun run web:typecheck
bun run web:build

# Migrations locales : vérifier sa connexion avant de lancer ces commandes
bun run --cwd apps/next db:migrate:dev --name description
bun run --cwd apps/next db:migrate:create --name description
bun run --cwd apps/next db:migrate
```

Les migrations versionnées sont stockées dans `apps/next/prisma/migrations`.
Garder `schema.prisma` et `schema.production.prisma` synchronisés et committer la
migration avec les deux schémas. Les previews sont déclenchées par un push Git,
sans commande de déploiement manuelle.
