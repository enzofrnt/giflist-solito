# Clés d’accès sur le web

Après une connexion par mot de passe ou une inscription, les personnes qui ne possèdent pas encore de clé pour ce domaine sont invitées à en ajouter une. Elles peuvent passer cette étape ou ajouter une clé plus tard depuis **Mon compte → Sécurité**, sans ressaisir leur mot de passe. La page de connexion propose ensuite la connexion avec une clé d’accès, sans saisir d’adresse e-mail. Les clés peuvent être supprimées depuis le profil. La réinitialisation du mot de passe supprime toutes les clés du compte ; elles pourront être recréées après connexion.

Le navigateur doit prendre en charge WebAuthn et utiliser une connexion HTTPS (ou localhost en développement). Le domaine de production `giftlist.fr` est partagé par `www.giftlist.fr`. Les déploiements Vercel Preview utilisent leur propre nom d’hôte et leurs propres clés : une clé créée en preview n’est pas utilisable sur la production. Les URL de preview autorisées sont celles fournies par Vercel (`VERCEL_URL` et `VERCEL_BRANCH_URL`).

La migration Prisma crée les tables de clés publiques et de défis temporaires, privées au backend via RLS et révocation des droits Data API. Le script de build Vercel applique les migrations à la base configurée pour l’environnement ; vérifier que les previews utilisent une base de test isolée avant de déployer.

Les tests utilisent une base PostgreSQL éphémère. Le test de bout en bout WebAuthn utilise Chrome et un authentificateur virtuel ; définir `CHROME_PATH` si Chrome n’est pas installé à son emplacement macOS habituel.
