# Réinitialisation de mot de passe

Le parcours conserve l’authentification Prisma/bcrypt de Giftlist. Resend assure
uniquement l’envoi des messages. Aucun compte utilisateur n’est créé chez Resend.

## Configuration

Variables serveur requises dans Vercel, pour le projet `giflist-solito` :

```dotenv
APP_URL="https://giftlist.fr"
EMAIL_FROM="Giftlist <noreply@giftlist.fr>"
RESEND_API_KEY="<clé Resend>"
JWT_SECRET="<secret aléatoire, au moins 32 octets>"
```

La clé Resend est provisionnée par l’intégration Vercel. Les autres valeurs ont
été ajoutées dans l’environnement Production. Ne pas préfixer ces variables par
`NEXT_PUBLIC_`, ni les copier dans Git. Utiliser une base et une clé séparées pour
les previews et le développement. En Preview, `RESEND_API_KEY`, `EMAIL_FROM` et
`JWT_SECRET` sont communs à tout l’environnement Vercel, sans restriction de
branche. `APP_URL` n’est pas nécessaire : les liens utilisent automatiquement
`VERCEL_BRANCH_URL`, ou `VERCEL_URL` à défaut. Ils ne pointent jamais sur la
production, même si une valeur `APP_URL` de production est présente. Le serveur refuse de signer des sessions en
production si `JWT_SECRET` manque.

L’offre Resend Free a été sélectionnée. Le domaine `giftlist.fr` a été créé en
région `eu-west-1`, sans suivi d’ouverture ni de clic. Les trois enregistrements
d’authentification fournis par Resend et un DMARC initial `p=none` ont été ajoutés
dans Cloudflare. Conserver les CNAME d’envoi en mode DNS uniquement.

## Avant de publier

1. Vérifier que le domaine est `verified` dans Resend.
2. Appliquer la migration Prisma `20261028180000_add_password_recovery` sur la
   base cible, **avant** de déployer le nouveau serveur :

   ```sh
   bun run --cwd apps/next db:migrate
   ```

   Cette commande applique **toutes** les migrations en attente.
   Les migrations ont été exécutées sur une base de test jetable ; aucune
   migration de production n’a été appliquée pendant cette intégration.

3. Déployer le code avec les variables serveur configurées.
4. Vérifier le parcours complet avec une adresse que vous contrôlez. Les adresses
   de simulation Resend comme `delivered@resend.dev` conviennent aussi pour
   vérifier l’envoi sans écrire à un utilisateur réel.

La nouvelle clé JWT configurée entraîne une reconnexion des sessions existantes
au prochain déploiement. Les futurs changements de mot de passe incrémentent
`User.authVersion` et révoquent les sessions précédentes de ce seul utilisateur.
Le changement depuis le profil renvoie une session actualisée pour le navigateur
qui a effectué la modification.

## Parcours et protections

- `/login` → « Mot de passe oublié ? » → `/forgot-password`.
- `POST /api/auth/forgot-password` valide l’adresse, limite les demandes, puis
  renvoie une confirmation identique pour toute adresse valide. La recherche du
  compte et l’envoi s’exécutent après la réponse, via `after()` de Next.js.
- Le message contient `/reset-password#token=…`. Le secret ne figure pas dans
  l’URL HTTP reçue par le serveur. La page le lit puis retire le fragment de la
  barre d’adresse ; un rechargement nécessite de rouvrir le lien du message.
- Les secrets aléatoires de 256 bits sont stockés sous forme d’empreinte SHA-256,
  valables 30 minutes et consommés dans la même transaction que le changement
  du mot de passe. Une nouvelle demande remplace le lien précédent.
- Les tables `User`, de récupération et de quotas ont RLS activé et aucun accès public
  pour les rôles Supabase `anon` et `authenticated`. Le backend Prisma doit les
  utiliser avec sa connexion serveur privilégiée. La table `User` existante
  accordait auparavant lecture et écriture aux rôles de l’API publique : la
  migration ferme cet accès afin d’empêcher de contourner la réinitialisation.
- Les règles habituelles de mot de passe sont réutilisées, avec une limite de
  72 octets pour bcrypt. Un e-mail de confirmation suit la réinitialisation.
- Les anciennes sessions sont rejetées par toutes les routes authentifiées,
  y compris les routes de profil et de changement du mot de passe.
- Les réponses et journaux serveur ne contiennent ni secret de récupération,
  ni mot de passe, ni clé API. Les requêtes HTTP transportent le nouveau mot de
  passe uniquement dans le corps du POST, sous HTTPS en production.
- Les appels Resend ont un délai maximal et trois tentatives pour les pannes
  temporaires, avec la même clé d’idempotence pour éviter les doublons.

Quotas persistants partagés entre instances Vercel : 10 demandes par IP en
30 minutes, 3 messages par adresse en 30 minutes, 40 demandes d’envoi par jour UTC
pour l’application, et 30 soumissions de réinitialisation par IP en 15 minutes.
Le plafond d’envoi laisse une marge pour les confirmations dans l’offre gratuite.
Les demandes bloquées par les quotas d’envoi gardent la confirmation générique.
Les quotas expirés et les anciens liens sont nettoyés après les demandes admises.
Sur Vercel, l’adresse client est lue dans `x-vercel-forwarded-for` ; hors Vercel,
les appels partagent une clé locale pour éviter de faire confiance à des en-têtes
transmis par un client.

## Vérification

```sh
bun install --frozen-lockfile
bun run test
bun run web:typecheck
bun run web:build
```

Les tests démarrent un Postgres PGlite en mémoire, appliquent les migrations,
utilisent le vrai client Prisma et interceptent uniquement les appels d’envoi
Resend. Ils ne lisent aucune URL de base hébergée pour leurs opérations et
n’envoient aucun e-mail. Ils couvrent expiration, remplacement et consommation
unique du lien, concurrence, quotas atomiques, panne d’envoi, connexion avec le
nouveau mot de passe, révocation des anciennes sessions et RLS des nouvelles
tables et l’absence de droits publics sur la table des utilisateurs.
