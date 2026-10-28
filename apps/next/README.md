# 🎁 Liste de cadeaux

Application web pour gérer vos listes de cadeaux avec partage public.

## 🚀 Démarrage rapide

### Prérequis

- Bun 1.4.4 (runtime et gestionnaire de paquets)
- Docker et Docker Compose (pour la base de données locale)

### Installation

1. **Cloner le dépôt**
```bash
git clone <repo-url>
cd giflist-solito
# Les étapes suivantes se lancent dans apps/next
cd apps/next
```

2. **Installer les dépendances**
```bash
bun install --frozen-lockfile
```

3. **Démarrer PostgreSQL avec Docker**
```bash
bun run docker:up
```

4. **Configurer les variables d'environnement**
```bash
cp env.example .env
```

Modifiez `.env` avec votre configuration (les valeurs par défaut fonctionnent pour le développement local).

5. **Appliquer les migrations**
```bash
bun run db:migrate:dev
```

6. **Générer le client Prisma**
```bash
bun run db:generate
```

7. **Démarrer l'application**
```bash
bun run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🗄️ Base de données

### Développement local

Le projet utilise **PostgreSQL** en local via Docker pour correspondre à l'environnement de production.

**Commandes Docker :**
- `bun run docker:up` - Démarrer PostgreSQL
- `bun run docker:down` - Arrêter PostgreSQL
- `bun run docker:logs` - Voir les logs
- `bun run docker:reset` - Réinitialiser la base de données (supprime les données)

**Commandes Prisma :**
- `bun run db:generate` - Générer le client Prisma
- `bun run db:push` - Synchroniser le schéma (sans migration)
- `bun run db:migrate:dev` - Créer et appliquer une migration
- `bun run db:migrate:create` - Créer une migration sans l'appliquer
- `bun run db:migrate:reset` - Réinitialiser la base et appliquer les migrations
- `bun run db:studio` - Ouvrir Prisma Studio (interface graphique)

### Production

La base de données PostgreSQL est hébergée sur Supabase ou Vercel Postgres. Les migrations sont appliquées automatiquement lors du déploiement sur Vercel.

## 📝 Variables d'environnement

Voir `env.example` pour la liste complète des variables d'environnement nécessaires.

**Développement local :**
- `POSTGRES_PRISMA_URL` - URL de connexion PostgreSQL locale (Docker)

**Production :**
- `POSTGRES_PRISMA_URL` - URL de connexion PostgreSQL (Supabase/Vercel)
- `JWT_SECRET` - Clé secrète pour les tokens JWT
- `NEXT_PUBLIC_BASE_URL` - URL de l'application

## 🛠️ Scripts disponibles

- `bun run dev` - Démarrer en mode développement
- `bun run build` - Build de production
- `bun run start` - Démarrer en mode production
- `bun run lint` - Linter le code

## 📦 Déploiement

Le déploiement est automatique sur Vercel via GitHub. Voir `DEPLOYMENT.md` pour plus de détails.

## 🏗️ Structure du projet

```
.
├── prisma/
│   ├── schema.prisma              # Schéma Prisma (production)
│   ├── schema.production.prisma   # Schéma Prisma (identique)
│   └── migrations/                # Migrations Prisma
├── src/
│   ├── app/                       # Pages Next.js
│   ├── components/                # Composants React
│   ├── lib/                       # Utilitaires (auth, prisma)
│   └── generated/prisma/          # Client Prisma généré
├── docker-compose.yml             # Configuration Docker
├── scripts/build-vercel.mjs      # Build Vercel sous Bun
└── vercel.json                     # Configuration du runtime Bun
```
