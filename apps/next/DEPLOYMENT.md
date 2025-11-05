# 🚀 Guide de déploiement

## Configuration hybride SQLite/PostgreSQL

### 🏠 **Développement local (SQLite)**
```bash
# Variables d'environnement
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Commandes
pnpm dev                    # Démarrer en mode dev
pnpm db:push               # Synchroniser la DB SQLite
pnpm db:generate           # Générer le client Prisma
```

### 🌐 **Production Vercel (PostgreSQL)**

#### Variables d'environnement requises dans Vercel :
- `POSTGRES_PRISMA_URL` : URL de connexion PostgreSQL pour Prisma (format pooling)
- `DATABASE_URL` : URL de connexion PostgreSQL (alternative, utilisée en fallback)
- `NEXT_PUBLIC_BASE_URL` : URL de votre application Vercel
- `JWT_SECRET` : Clé secrète pour les tokens JWT

#### Processus de déploiement automatique :

1. **Copie du schéma de production** : Le script `build.sh` copie `schema.production.prisma` vers `schema.prisma`

2. **Génération du client Prisma** : Le client Prisma est généré avec le schéma PostgreSQL

3. **Synchronisation de la base de données** :
   - Si des migrations existent dans `prisma/migrations/` : utilisation de `prisma migrate deploy`
   - Sinon : utilisation de `prisma db push` pour synchroniser le schéma directement

4. **Build Next.js** : Compilation de l'application

#### 📋 **Étapes de déploiement Vercel**

### 1. **Préparer la base de données PostgreSQL**
- Créer un projet sur [Supabase](https://supabase.com) ou [Vercel Postgres](https://vercel.com)
- Copier l'URL de connexion PostgreSQL
- Pour Supabase : utiliser l'URL de connexion directe (non-pooling) dans `DATABASE_URL`
- Pour Vercel Postgres : utiliser `POSTGRES_PRISMA_URL` qui est automatiquement configuré

### 2. **Configurer Vercel**
- Aller sur [vercel.com](https://vercel.com)
- Importer votre projet GitHub
- Ajouter les variables d'environnement :
  - `POSTGRES_PRISMA_URL` = URL PostgreSQL (format Prisma)
  - `DATABASE_URL` = URL PostgreSQL (alternative, fallback)
  - `NEXT_PUBLIC_BASE_URL` = URL de votre app Vercel
  - `JWT_SECRET` = Clé secrète pour les tokens (générer avec `openssl rand -base64 32`)

### 3. **Déployer**
- Vercel détecte automatiquement Next.js
- Le script `build.sh` est exécuté automatiquement
- Les migrations sont appliquées automatiquement pendant le build
- La base de données est synchronisée avec le schéma

## 🔧 **Commandes utiles**

```bash
# Développement local
pnpm dev

# Build local pour tester
pnpm build

# Générer client Prisma (local)
pnpm db:generate

# Synchroniser DB (local - SQLite)
pnpm db:push

# Créer une migration (production)
# Sur votre machine locale, avec DATABASE_URL pointant vers PostgreSQL :
cp prisma/schema.production.prisma prisma/schema.prisma
npx prisma migrate dev --name init

# Appliquer les migrations (production)
pnpm db:migrate
```

## 📁 **Structure des fichiers**

```
prisma/
├── schema.prisma           # Schema copié depuis schema.production.prisma pendant le build
├── schema.production.prisma # Schema PostgreSQL (production)
├── migrations/             # Migrations Prisma (optionnel, créé avec migrate dev)
└── dev.db                  # Base SQLite locale

build.sh                    # Script de build pour Vercel
vercel.json                 # Configuration Vercel
env.example                 # Variables d'environnement
```

## 🗄️ **Gestion des migrations**

### ✅ Migrations créées et versionnées

Le projet utilise maintenant **des migrations Prisma versionnées** pour gérer l'évolution de la base de données PostgreSQL en production. Les migrations sont stockées dans `prisma/migrations/` et doivent être versionnées dans Git.

### 📦 Créer une nouvelle migration

Quand vous modifiez `schema.production.prisma`, créez une nouvelle migration :

```bash
# Option 1 : Créer et appliquer la migration (si vous avez accès à une DB PostgreSQL)
pnpm db:migrate:dev --name nom_de_la_migration

# Option 2 : Créer uniquement la migration (sans l'appliquer)
pnpm db:migrate:create --name nom_de_la_migration
```

**Important** : Les migrations créées doivent être committées dans Git :
```bash
git add prisma/migrations/
git commit -m "Add migration: description"
```

### 🚀 Déploiement avec migrations

Le script `build.sh` applique automatiquement les migrations lors du déploiement sur Vercel :
- Si des migrations existent : `prisma migrate deploy` est utilisé (recommandé)
- Si aucune migration n'existe : `prisma db push` est utilisé comme fallback

### ⚠️ Migration initiale

La migration initiale (`20250101000000_init`) crée toutes les tables, index et contraintes nécessaires. Elle sera automatiquement appliquée lors du premier déploiement.

### 🔄 Workflow recommandé

1. **Modifier** `prisma/schema.production.prisma`
2. **Créer une migration** : `pnpm db:migrate:create --name description`
3. **Vérifier** le fichier SQL généré dans `prisma/migrations/`
4. **Commit** la migration : `git add prisma/migrations/ && git commit -m "Add migration: description"`
5. **Déployer** : Les migrations sont appliquées automatiquement sur Vercel

## ⚠️ **Notes importantes**

- Le script `build.sh` gère automatiquement les migrations pendant le déploiement
- Si `POSTGRES_PRISMA_URL` ou `DATABASE_URL` n'est pas défini, la synchronisation est ignorée
- Les migrations sont appliquées avant le build Next.js
- En cas d'échec des migrations, le build échoue pour éviter des déploiements avec une DB non synchronisée
