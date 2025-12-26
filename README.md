# OCMovies-API & JustStreamIt Frontend

Ce projet regroupe une API REST (Django/DRF) et un site web frontend (vanilla JS) pour explorer des films.

## Installation de l’API (backend)

1. Clonez ce dépôt ou téléchargez-le.
2. Placez-vous à la racine du projet.
3. Créez un environnement virtuel : `python -m venv env`
4. Activez-le : `env\Scripts\activate` (Windows) ou `source env/bin/activate` (Mac/Linux)
5. Installez les dépendances : `pip install -r requirements.txt`
6. Créez la base de données : `python manage.py create_db`
7. Lancez le serveur : `python manage.py runserver`

API disponible sur : http://localhost:8000/api/v1/

## Installation du frontend (JustStreamIt)

### Prérequis
- API OCMovies en fonctionnement (voir ci-dessus)

### Lancer le frontend (port 3000)
1. Placez-vous dans `juststreamit-frontend/`
2. Windows : `START-FRONTEND.bat` ou PowerShell : `START-FRONTEND.ps1` ou manuel : `python server.py`
3. Ouvrez http://localhost:3000

Le frontend consomme l’API sur http://127.0.0.1:8000/api/v1

## Optimisation API côté frontend
- Utilisation du paramètre `page_size` adapté à la taille d’écran :
  - Mobile : 2 films
  - Tablette : 4 films
  - Desktop : 6 films
- Les appels API sont optimisés pour limiter le trafic inutile.

## Responsivité (frontend)
- Zéro scroll horizontal garanti sur tous les appareils
- Breakpoints et padding adaptés pour mobile, tablette, desktop
- Grilles et titres ajustés pour chaque format

## Installation de pipenv (optionnel)

### Windows
```
pip install pipenv
```
### MacOS (recommandé : homebrew)
```
brew install pipenv
```
Ou :
```
pip3 install pipenv
```
### Linux
```
pip install pipenv
```

Pour vérifier l’installation :
```
pipenv --version
```

---

Pour plus de détails sur les points d’entrée API, consultez l’interface navigable sur http://localhost:8000/api/v1/titles/.


