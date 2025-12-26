# Optimisation API - JustStreamIt Frontend

## Objectif
Réduire les appels inutiles à l'API en utilisant le paramètre `page_size` adapté à la taille d'écran.

## Changements implémentés

### 1. URL de base mise à jour
- **Avant**: `http://127.0.0.1:8000/api/v1`
- **Après**: `http://localhost:8000/api/v1`

### 2. Paramètre `page_size` adaptatif
Le frontend détecte automatiquement la taille d'écran et demande le bon nombre de films:

```javascript
getPageSize() {
  - Mobile (< 768px): 2 films
  - Tablette (768px - 1024px): 4 films  
  - Desktop (≥ 1024px): 6 films
}
```

### 3. Fonctions API mises à jour
Toutes les fonctions incluent maintenant `page_size`:

```javascript
// Exemples d'appels API générés:

// Desktop (6 films par page):
http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=6&page=1

// Tablette (4 films par page):
http://localhost:8000/api/v1/titles/?genre=Mystery&sort_by=-imdb_score&page_size=4&page=1

// Mobile (2 films par page):
http://localhost:8000/api/v1/titles/?title_contains=Avatar&page_size=2&page=1
```

### 4. Rechargement au changement de breakpoint
Quand l'utilisateur redimensionne la fenêtre et change de catégorie d'écran (ex: tablette → desktop):

1. Le frontend détecte le changement de `page_size`
2. Les données de toutes les sections sont rechargées
3. Le nombre de films affichés par défaut s'ajuste automatiquement

Exemple:
```javascript
// Redimensionne: 1024px → 992px (passe de 4 à 6 films)
→ Rechargement automatique avec page_size=6
```

## Bénéfices

✅ **Moins de données téléchargées** - Ne récupère que le stricte nécessaire  
✅ **Meilleure performance** - Appels API optimisés selon l'écran  
✅ **UX fluide** - Pas d'ajustements après le chargement  
✅ **Responsive optimisé** - Adaptation automatique en temps réel  

## Fichiers modifiés

- `js/api.js` - Ajout de `getPageSize()` et `page_size` dans toutes les requêtes
- `js/main.js` - Détection du changement de breakpoint et rechargement  
- `js/ui.js` - Ajout de `resetAndReload()` pour recharger les données
- `index.html` - Correction des erreurs W3C

## Notes d'implémentation

L'API Django accepte le paramètre `page_size`:
```
GET /api/v1/titles/?page_size=2&page=1
GET /api/v1/titles/?page_size=4&genre=Drama&page=1
GET /api/v1/titles/?page_size=6&sort_by=-imdb_score&page=1
```

Si l'API ne supporte pas `page_size`, les requêtes utiliseront la taille de page par défaut de l'API (actuellement 5).
