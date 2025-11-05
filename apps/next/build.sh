#!/bin/bash
# Script de build pour Vercel

echo "🔄 Copie du schema de production..."
cp prisma/schema.production.prisma prisma/schema.prisma

echo "🔍 Vérification du schema copié..."
cat prisma/schema.prisma | head -15

echo "🔧 Génération du client Prisma..."
npx prisma generate

echo "🗄️ Synchronisation de la base de données..."
# Vérifier si POSTGRES_PRISMA_URL ou DATABASE_URL est défini (production)
if [ -n "$POSTGRES_PRISMA_URL" ] || [ -n "$DATABASE_URL" ]; then
  echo "🌐 Mode production détecté (PostgreSQL)"
  
  # Utiliser une URL de connexion directe (non-pooling) si disponible pour les migrations
  # Cela évite les problèmes avec les prepared statements du pooler Supabase
  DIRECT_URL="${DATABASE_URL:-$POSTGRES_PRISMA_URL}"
  if [ -n "$POSTGRES_URL_NON_POOLING" ]; then
    DIRECT_URL="$POSTGRES_URL_NON_POOLING"
    echo "🔗 Utilisation de l'URL de connexion directe (non-pooling) pour les migrations..."
  fi
  
  # Utiliser le moteur binaire pour éviter les problèmes avec le pooler Supabase
  export PRISMA_CLI_QUERY_ENGINE_TYPE=binary
  
  # Si des migrations existent, utiliser migrate deploy directement
  # (db push ne fonctionne pas avec le connection pooler de Supabase)
  if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "📦 Migrations trouvées, utilisation de migrate deploy..."
    echo "⏳ Application des migrations en cours (timeout: 120s)..."
    
    # Utiliser l'URL directe si disponible pour migrate deploy
    if [ -n "$POSTGRES_URL_NON_POOLING" ]; then
      timeout 120 env POSTGRES_PRISMA_URL="$POSTGRES_URL_NON_POOLING" npx prisma migrate deploy 2>&1 || {
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 124 ]; then
          echo "❌ Timeout: migrate deploy a pris plus de 120 secondes"
          exit 1
        else
          echo "❌ Échec de la synchronisation de la base de données (code: $EXIT_CODE)"
          exit 1
        fi
      }
    else
      timeout 120 npx prisma migrate deploy 2>&1 || {
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 124 ]; then
          echo "❌ Timeout: migrate deploy a pris plus de 120 secondes"
          exit 1
        else
          echo "❌ Échec de la synchronisation de la base de données (code: $EXIT_CODE)"
          exit 1
        fi
      }
    fi
    echo "✅ Migrations appliquées avec succès"
  else
    echo "📦 Aucune migration trouvée, synchronisation avec db push..."
    echo "⚠️ Attention: db push peut échouer avec le connection pooler de Supabase"
    echo "⏳ Synchronisation en cours (timeout: 90s)..."
    
    timeout 90 npx prisma db push --accept-data-loss --skip-generate --force-reset=false 2>&1 || {
      EXIT_CODE=$?
      if [ $EXIT_CODE -eq 124 ]; then
        echo "❌ Timeout: db push a pris plus de 90 secondes"
        exit 1
      else
        echo "⚠️ db push a échoué (code: $EXIT_CODE)"
        echo "💡 Créez une migration avec 'pnpm db:migrate:create --name init' pour utiliser migrate deploy"
        exit 1
      fi
    }
    echo "✅ Base de données synchronisée avec succès (via db push)"
  fi
else
  echo "⚠️ Aucune URL de base de données détectée, skip de la synchronisation"
fi

echo "🏗️ Build Next.js..."
# Utiliser pnpm si disponible, sinon npm
if command -v pnpm &> /dev/null; then
  pnpm next build --turbopack
else
  npm run build -- --turbopack || npx next build --turbopack
fi
