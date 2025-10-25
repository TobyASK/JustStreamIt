# JustStreamIt

Interface web pour parcourir les meilleurs films via l'API OCMovies. Développé en vanilla JavaScript et Bootstrap 5.

## Fonctionnalités

### Meilleur film
En haut de page, on affiche le film qui a le meilleur score IMDb avec son image, son résumé et un bouton pour voir plus de détails.

### Films les mieux notés
Juste en dessous, il y a les 7 films suivants du classement IMDb. Sur mobile ça fait 2 colonnes, sur tablette 4, et sur grand écran 6 colonnes. Y'a un bouton "Voir plus" pour charger encore 6 films si besoin, et un "Voir moins" pour les cacher.

### Catégories
Trois sections par genre :
- Mystery
- Drama  
- Un troisième genre choisi au hasard (différent des deux premiers)

Chaque catégorie affiche 6 films avec le même système de "Voir plus/moins". Si un genre a moins de 6 films, pas de souci, ça s'adapte.

### Fenêtre modale
Quand on clique sur un film (n'importe où sur la carte), une fenêtre s'ouvre avec toutes les infos : titre, genres, date de sortie, score IMDb, réalisateurs, acteurs, durée, pays, box-office et résumé complet.

### Design
Interface sombre assez simple, avec des cartes qui réagissent au survol. Quand une image de film n'existe plus sur Amazon, un placeholder gris s'affiche à la place.

## Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR.git
cd OCMovies-API-EN-FR
```

2. **Créer l'environnement virtuel**

Windows :
```bash
python -m venv env
env\Scripts\activate
```

MacOS/Linux :
```bash
python3 -m venv env
source env/bin/activate
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Créer la base de données**
```bash
python manage.py migrate
python manage.py create_db
```

## Lancement

**Windows - fichier batch**
```bash
START-JUSTSTREAMIT.bat
```

**Manuel (2 terminaux)**

Terminal 1 :
```bash
python manage.py runserver 8000
```

Terminal 2 :
```bash
cd juststreamit-frontend
python -m http.server 5500
```

Ensuite ouvrir http://localhost:5500

## Structure

```
juststreamit-frontend/
├── index.html
├── assets/css/styles.css
└── js/
    ├── main.js        # Gestion des événements
    ├── api.js         # Appels API
    ├── sections.js    # Rendu des sections
    └── ui.js          # Création des cartes et modale
```

## Technologies

- Vanilla JavaScript (ES6 modules)
- Bootstrap 5
- Django REST Framework (backend fourni par OpenClassrooms)

## Note sur les images

Pas mal d'images retournent des 404 parce qu'Amazon les a supprimées. J'ai mis un placeholder gris qui s'affiche automatiquement quand ça arrive. Les erreurs dans la console sont normales.

---

# 🇬🇧 OCMovies-API: Test API providing movie information

The OCMovies-API project is a REST API application to be executed locally in the context
of educational projects. It provides movie information from GET http endpoints.
The API provides these endpoints to get detailed infomation about movies filtered by
various criteria such as genre, IMDB score or year. Endpoints allow users to retrieve
information for individual movies or lists of movies.

## Installation

This locally-executable API can be installed and executed from [http://localhost:8000/api/v1/titles/](http://localhost:8000/api/v1/titles/) using the following steps.

1. Clone this repository using `$ git clone https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR.git` (you can also download the code [as a zip file](https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR/archive/refs/heads/master.zip))
2. Move to the ocmovies-api root folder with `$ cd ocmovies-api-en`
3. Create a virtual environment for the project with `$ python -m venv env` on windows or `$ python3 -m venv env` on macos or linux.
4. Activate the virtual environment with `$ env\Scripts\activate` on windows or `$ source env/bin/activate` on macos or linux.
5. Install project dependencies with `$ pip install -r requirements.txt`
6. Create and populate the project database with `$ python manage.py create_db`
7. Run the server with `$ python manage.py runserver`

When the server is running after step 7 of the procedure, the OCMovies API can be requested from endpoints starting with the following base URL: http://localhost:8000/api/v1/titles/.

Steps 1 to 6 are only required for initial installation. For subsequent launches of the API, you only have to execute steps 4 and 7 from the root folder of the project.

## Usage and detailed endpoint documentation

One you have launched the server, you can read the documentation through the
browseable documentation interface of the API by visiting [http://localhost:8000/api/v1/titles/](http://localhost:8000/api/v1/titles/).

The API provides the following endpoints. All these endpoints are read-only and exclusively support HTTP requests using the **GET method**:

- Search and filter movies: [http://localhost:8000/api/v1/titles/](http://localhost:8000/api/v1/titles/). The filters available are:

   - `year=<year>`, `min_year=<year>` or `max_year=<year>` to get movies 
   filterd by year. The first does an exact match of the year.
   - `imdb_score_min=<score>` and `imdb_score_max<score>` to get movies with only a 
   given imdb score.
   - `title=<title>` or `title_contains=<string>` to get movies matching 
   the searched string. The first performs an exact match while the second
   searches titles containing the search term. The search 
   is independent of character case.
   - `director=<director-name>` or `director_contains=<string>` to get movies
   whose directors correspond to the searched string. The first performs an exact match 
   with the director name while the second searches director names containing the 
   search term. The search is independent of character case.
   - `writer=<name>` or `writer_contains=<string>` to get movies
   whose writers contain to the searched string. The first performs an exact match 
   with the writer name while the second searches writer names containing the 
   search term. The search is independent of character case.
   - `actor=<name>` or `actor_contains=<string>` to get movies
   whose actors correspond to the searched string. The first performs an exact match 
   with the actor name while the second searches actor names containing the 
   search term. The search is independent of character case.
   - `genre=<name>` or `genre_contains=<string>` to get movies
   whose genres correspond to the searched string. The first performs an exact match 
   with the genre name while the second searches genre names containing the 
   search term. The search is independent of character case.
   - `country=<name>` or `country_contains=<string>` to get movies
   whose countries correspond to the searched string. The first performs an exact match 
   with the country name while the second searches country names containing the 
   search term. The search is independant of character case.
   - `lang=<name>` or `lang_contains=<string>` to get movies
   whose languages corresponds to the searched string. The first performs an exact match 
   with the language name while the second searches language names containing the 
   search term. The search is independent of character case.
   - `company=<name>` or `company_contains=<string>` to get movies
   whose company corresponds to the searched string. The first performs an exact match 
   with the company name while the second searches company names containing the 
   search term. The search is independent of character case.
   - `rating=<name>` or `rating_contains=<string>` to get movies
   whose rating corresponds to the searched string. The first performs an exact match 
   with the rating name while the second searches rating names containing the 
   search term. The search is independent of character case.
   - `sort_by=<field>` to sort movies in a particular order. For example,
   use `sort_by=title` to order the movies alphabetically by title and 
   `sort_by=-title` to order the movies in the reverse direction. You can also
   sort with multiple criteria by separating the criteria using commas as in `sort_by=-year,title` that filters the movie with the most recent ones first.
   Then, within a same year, movies are filtered alphabetically according to
   their title.

- Request detailed info about a movie: [http://localhost:8000/api/v1/titles/499549](http://localhost:8000/api/v1/titles/499549) where 499549 is the `id` of the 
movie "Avatar".
- Search the available genres: [http://localhost:8000/api/v1/genres/](http://localhost:8000/api/v1/genres/). The filters available are:
   - `name_contains=<search string>` to filter only the genres containing the
   searched string.
   - `movie_title_contains=<search string>` to find the genres associated with
   a particular movie searched by title.


