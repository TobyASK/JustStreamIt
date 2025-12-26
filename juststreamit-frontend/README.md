# JustStreamIt – Frontend

Site web vanilla JavaScript (Bootstrap 5 via CDN) consommant l’API locale OCMovies (Django/DRF) et couvrant le cahier des charges du projet.

## Démarrer

### Pré-requis
- Environnement Python du dépôt API déjà installé (venv)
- Dépendances de l'API installées
- Django et DRF en fonctionnement

### Option 1 – Frontend indépendant (recommandé)

⭐ **Le frontend et backend tournent séparément** – Respecte le cahier des charges P6

1. **Lancer le backend Django** (port 8000):
   - Depuis la racine: `START-JUSTSTREAMIT.bat` OU
   - Manuel: `./env/Scripts/Activate.ps1` puis `python manage.py runserver 8000`

2. **Lancer le frontend** (port 3000):
   - Depuis `juststreamit-frontend/`:
     - Windows: `START-FRONTEND.bat` OU
     - PowerShell: `START-FRONTEND.ps1` OU
     - Manuel: `python server.py`

3. **Ouvrir dans le navigateur**: http://localhost:3000

✅ CORS est activé dans Django (`CORS_ORIGIN_ALLOW_ALL = True`)
✅ Le frontend appelle l'API sur http://127.0.0.1:8000/api/v1
✅ Pas de modification des fichiers backend nécessaire

### Option 2 – Tout intégré (ancien mode)

1. Depuis la racine: `START-JUSTSTREAMIT.bat`
2. Ouvrez: http://127.0.0.1:8000/
3. Faites un rafraîchissement dur (Ctrl+F5)

⚠️ Cette option suppose que le frontend est servi comme fichiers statiques Django.

## Fonctionnalités principales

- Meilleur film: affiche l’affiche, le titre, un bouton « Détails » et le résumé (via endpoint détail).
- Films les mieux notés: top global (hors le meilleur film déjà affiché).
- Catégorie 1 (Mystery) & Catégorie 2 (Drama): meilleurs films par genre.
- Autres: sélection d’un genre parmi la liste des genres de l’API; recharge de la grille à la sélection.
- Responsive (2/4/6):
  - Mobile: 2 visibles (4 cachés)
  - Tablette: 4 visibles (2 cachés)
  - Desktop: 6 visibles
  - Bouton « Voir plus » qui dévoile jusqu’à tout afficher, puis « Voir moins » pour revenir à l’état par défaut.
- Modale de détails: image, titre, genres complets, date de sortie, classification, score IMDB, réalisateur(s), acteurs, durée, pays, box-office (worldwide/USA), résumé.

## Structure des fichiers (frontend)

- `index.html` – Structure de la page (5 sections + modale Bootstrap 5)
- `assets/css/styles.css` – Styles complémentaires (cartes, best-summary, etc.)
- `js/api.js` – Appel API (fetchTop, fetchByGenre, fetchDetails, fetchGenres)
- `js/ui.js` – Cartes, helpers DOM, logique 2/4/6 + toggle Voir plus/moins
- `js/sections.js` – Rendu des sections (Meilleur, Top, Catégories, Autres)
- `js/main.js` – Orchestration, délégation des clics, modale, resize

## Choix techniques & conformité

- Vanilla JS (aucun framework JS) et `fetch` natif pour les requêtes.
- Bootstrap 5 via CDN (autorisée). Aucun plugin/module additionnel.
- Intégration Django: frontend servi comme fichiers statiques via `STATICFILES_DIRS`.
- Accessibilité: images de cartes décoratives (alt="" + aria-hidden) pour éviter les doublons de titres; titres en H3; modale scrollable.
- Robustesse images: fallback placeholder en cas d’erreur de chargement.

## Vérifications soutenance

- API OK: http://127.0.0.1:8000/api/v1/titles/?sort_by=-imdb_score&page=1 renvoie 200 et `count` > 0.
- Page OK: http://127.0.0.1:8000/ s’affiche sans erreur JavaScript en console.
- Responsive: vérifier 2/4/6 cartes (devtools > responsive design mode).
- « Voir plus/moins »: bascule correcte et persistante au resize.
- Modale: infos complètes, pas d’overflow horizontal, scroll vertical actif si besoin.
- Liste des genres « Autres »: chargée depuis l’API (fallback local si indisponible).

## Validation W3C

- HTML: https://validator.w3.org/ – valider `index.html` (ou via URL http://127.0.0.1:8000/).
- CSS: https://jigsaw.w3.org/css-validator/

En cas d’avertissements mineurs liés à Bootstrap (externes) ou attributs ARIA informatifs, préciser en soutenance que le code custom respecte les règles; ajustements mineurs possibles sur demande.

## Dépannage

- Rien ne charge / images cassées: Ctrl+F5 (cache). Les images ont un placeholder en fallback.
- API indisponible: vérifier `python manage.py runserver 8000` et les migrations/DB.
- CORS: l’intégration front+API sur le même port évite les soucis; sinon activer `django-cors-headers`.
- Genres vides: `fetchGenres()` fait un fallback sur une liste locale si l’endpoint `/genres/` n’est pas disponible.

## Licence

Projet pédagogique – usage éducatif.
# JustStreamIt — Front-end Vanilla JavaScript

Application web responsive pour afficher un classement de films à partir de l'API OCMovies locale.

## 🎯 Fonctionnalités

Le projet implémente une interface avec **5 zones principales** :

1. **Meilleur Film** : Affiche le film avec le meilleur score IMDB (image, titre, résumé, bouton Détails)
2. **Films les mieux notés** : Grille de films (hors le meilleur) avec pagination
3. **Catégorie 1 - Mystery** : Films du genre Mystery
4. **Catégorie 2 - Drama** : Films du genre Drama
5. **Autres** : Sélection dynamique de genre avec liste déroulante

**Modale de détails** : Affiche tous les détails d'un film (genres, date, classification, score IMDB, réalisateurs, acteurs, durée, pays, box-office, résumé)

## 📱 Responsive

- **Mobile** : 2 cartes visibles par ligne
- **Tablette** : 4 cartes visibles par ligne
- **Desktop** : 6 cartes visibles par ligne

Chaque section dispose d'un bouton **"Voir plus"** pour afficher 2 films supplémentaires à la demande.

## 🛠️ Technologies

- **JavaScript Vanilla** (ES Modules, fetch natif, zéro librairie JS tierce)
- **Bootstrap 5** (via CDN pour le CSS et composants modaux)
- **Aucun bundler** (pas de webpack, vite, etc.)

## 📋 Prérequis

### 1. API OCMovies (Backend Django)

L'API doit être lancée en local sur `http://127.0.0.1:8000/`

**Commandes de lancement depuis la racine du projet** :

```powershell
# Activer l'environnement virtuel
.\env\Scripts\activate

# Installer les dépendances (si pas déjà fait)
pip install -r requirements.txt

# Créer et alimenter la base de données (si première installation)
python manage.py create_db

# Lancer le serveur API
python manage.py runserver 8000
```

L'API sera accessible sur : `http://127.0.0.1:8000/api/v1/`

**Note** : CORS est déjà configuré dans `config/settings.py` avec `CORS_ORIGIN_ALLOW_ALL = True`

## 🚀 Lancement de l'application

**L'application complète tourne maintenant sur un seul serveur Django !**

### Méthode 1 : Script BAT (recommandé pour Windows)

Double-cliquez sur le fichier à la racine du projet :
```
START-JUSTSTREAMIT.bat
```

### Méthode 2 : Ligne de commande

```powershell
# Depuis la racine du projet OCMovies-API-EN-FR-master
.\env\Scripts\activate
python manage.py runserver 8000
```

Puis ouvrez votre navigateur sur : **`http://127.0.0.1:8000/`**

**C'est tout !** Le serveur Django sert à la fois :
- 🎬 L'application frontend JustStreamIt sur `http://127.0.0.1:8000/`
- 🔌 L'API REST sur `http://127.0.0.1:8000/api/v1/`

## 📁 Structure du projet

```
juststreamit-frontend/
├── index.html              # Page principale avec les 5 sections + modale
├── assets/
│   └── css/
│       └── styles.css      # Styles personnalisés (cartes, responsive)
└── js/
    ├── api.js              # Appels API (fetchTop, fetchByGenre, fetchDetails)
    ├── ui.js               # Helpers DOM (movieCard, applyVisibility, clear)
    ├── sections.js         # Rendu des 5 sections (renderBest, renderTop, etc.)
    └── main.js             # Orchestration, modale, événements
```

## 🔌 Points d'entrée API utilisés

- **Top global** : `GET /titles/?sort_by=-imdb_score&page=1`
- **Par genre** : `GET /titles/?genre=<GENRE>&sort_by=-imdb_score&page=1`
- **Détail d'un film** : `GET /titles/<ID>`
- **Genres** : Liste statique en fallback (Action, Mystery, Drama, etc.)

## ✨ Fonctionnalités clés

### Accessibilité
- Images avec attributs `alt`
- Modale fermable via croix, Échap, ou clic sur l'arrière-plan
- Boutons et liens focusables au clavier

### Gestion des erreurs
- Gestion des images manquantes (placeholder automatique)
- Messages d'erreur en cas d'échec de chargement
- Console sans erreurs JavaScript

### Performance
- Chargement optimisé par pagination API
- Affichage initial de 2/4/6 films selon le breakpoint
- Révélation progressive via "Voir plus"

## 📝 Livrables

- ✅ Code complet en vanilla JavaScript (ES Modules)
- ✅ Framework CSS unique (Bootstrap 5)
- ✅ Responsive 2/4/6 cartes avec bouton "Voir plus"
- ✅ 5 zones fonctionnelles + modale complète
- ✅ Zéro erreur en console
- ✅ README avec instructions de lancement

## 🐛 Dépannage

**Problème** : Les films ne s'affichent pas
- ✓ Vérifier que l'API Django tourne sur `http://127.0.0.1:8000/`
- ✓ Tester l'endpoint directement : `http://127.0.0.1:8000/api/v1/titles/`
- ✓ Vérifier la console du navigateur pour les erreurs

**Problème** : Erreur CORS
- ✓ S'assurer que `CORS_ORIGIN_ALLOW_ALL = True` dans `config/settings.py`
- ✓ Relancer le serveur Django après modification

**Problème** : Images ne s'affichent pas
- ✓ Normal si l'API de test ne contient pas toutes les images
- ✓ Un placeholder s'affiche automatiquement

## 👨‍💻 Développement

Le code est organisé en modules ES6 :

- `api.js` : Logique d'appels HTTP
- `ui.js` : Création de composants DOM réutilisables
- `sections.js` : Logique métier de rendu par section
- `main.js` : Point d'entrée, orchestration, événements globaux

Pas de transpilation nécessaire, compatible navigateurs modernes (ES2020+).

---

**Projet éducatif** - JustStreamIt Frontend © 2025
