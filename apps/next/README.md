# 🎁 Liste de cadeaux

Application web pour gérer vos listes de cadeaux avec partage public.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- pnpm (gestionnaire de paquets)
- Docker et Docker Compose (pour la base de données locale)

### Installation

1. **Cloner le dépôt**
```bash
git clone <repo-url>
cd gift
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Démarrer PostgreSQL avec Docker**
```bash
pnpm docker:up
```

4. **Configurer les variables d'environnement**
```bash
cp env.example .env
```

Modifiez `.env` avec votre configuration (les valeurs par défaut fonctionnent pour le développement local).

5. **Appliquer les migrations**
```bash
pnpm db:migrate:dev
```

6. **Générer le client Prisma**
```bash
pnpm db:generate
```

7. **Démarrer l'application**
```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🗄️ Base de données

### Développement local

Le projet utilise **PostgreSQL** en local via Docker pour correspondre à l'environnement de production.

**Commandes Docker :**
- `pnpm docker:up` - Démarrer PostgreSQL
- `pnpm docker:down` - Arrêter PostgreSQL
- `pnpm docker:logs` - Voir les logs
- `pnpm docker:reset` - Réinitialiser la base de données (supprime les données)

**Commandes Prisma :**
- `pnpm db:generate` - Générer le client Prisma
- `pnpm db:push` - Synchroniser le schéma (sans migration)
- `pnpm db:migrate:dev` - Créer et appliquer une migration
- `pnpm db:migrate:create` - Créer une migration sans l'appliquer
- `pnpm db:migrate:reset` - Réinitialiser la base et appliquer les migrations
- `pnpm db:studio` - Ouvrir Prisma Studio (interface graphique)

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

- `pnpm dev` - Démarrer en mode développement
- `pnpm build` - Build de production
- `pnpm start` - Démarrer en mode production
- `pnpm lint` - Linter le code

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
└── build.sh                       # Script de build Vercel
```
