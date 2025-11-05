# Fonctionnalité de Scraping de Produits

Cette fonctionnalité permet de récupérer automatiquement les informations d'un produit (nom, image, prix, description) à partir de son URL.

## Comment ça fonctionne

1. **Interface utilisateur** : Dans le modal de création de cadeau, une section bleue permet de coller l'URL du produit
2. **Scraping automatique** : L'API récupère les métadonnées Open Graph et les sélecteurs CSS communs
3. **Remplissage automatique** : Les champs du formulaire sont automatiquement remplis

## Sites compatibles

La fonctionnalité fonctionne avec la plupart des sites e-commerce grâce à :

- **Métadonnées Open Graph** : `og:title`, `og:image`, `og:description`
- **Métadonnées Twitter** : `twitter:title`, `twitter:image`
- **Sélecteurs CSS communs** : Classes comme `.price`, `.product-image`, etc.
- **Sites spécialisés** : Patterns spécifiques pour Amazon, Fnac, etc.

### Sites testés et compatibles

- ✅ Amazon (France, US, UK)
- ✅ Fnac
- ✅ Darty
- ✅ Boulanger
- ✅ Cdiscount
- ✅ Rue du Commerce
- ✅ LDLC
- ✅ Pixmania
- ✅ Sites avec métadonnées Open Graph

## Configuration (Optionnel)

Pour de meilleurs résultats, vous pouvez configurer ScrapingBee :

1. **Inscription** : Créez un compte sur [ScrapingBee](https://www.scrapingbee.com/)
2. **Clé API** : Récupérez votre clé API gratuite (1000 requêtes/mois)
3. **Configuration** : Ajoutez `SCRAPINGBEE_API_KEY` dans votre `.env.local`

```bash
# .env.local
SCRAPINGBEE_API_KEY="votre_cle_api_ici"
```

## Fallback automatique

Si ScrapingBee n'est pas configuré ou échoue, le système utilise automatiquement :
- Requêtes HTTP directes avec User-Agent
- Parsing des métadonnées Open Graph
- Extraction via sélecteurs CSS

## Limitations

- **Sites protégés** : Certains sites bloquent le scraping
- **JavaScript requis** : Les sites SPA peuvent nécessiter ScrapingBee
- **Rate limiting** : Respect des limites des sites
- **Images** : Certaines images peuvent ne pas être accessibles

## Utilisation

1. Ouvrez le modal "Ajouter un cadeau"
2. Collez l'URL du produit dans la section bleue
3. Cliquez sur "Récupérer"
4. Vérifiez et ajustez les informations si nécessaire
5. Sauvegardez le cadeau

## Dépannage

### Le scraping ne fonctionne pas
- Vérifiez que l'URL est accessible
- Essayez avec un autre site
- Vérifiez la configuration ScrapingBee

### Informations manquantes
- Certains sites n'ont pas toutes les métadonnées
- Vous pouvez compléter manuellement les champs vides

### Erreurs de prix
- Le format du prix peut varier selon le site
- Vérifiez et ajustez le prix si nécessaire
