// ============================================================
// sections.js - FICHIER QUI REMPLIT LES SECTIONS DE LA PAGE
// ============================================================
// Ce fichier contient les fonctions qui remplissent chaque section
// de la page avec des films (Meilleur film, Top, Catégories, etc.)
// ============================================================

// ------------------------------------------------------------
// IMPORTS - On importe les fonctions des autres fichiers
// ------------------------------------------------------------
// "import" permet d'utiliser des fonctions définies dans d'autres fichiers
// Les accolades {} indiquent qu'on importe des exports nommés
import { fetchTop, fetchByGenre, fetchDetails, GENRES, fetchAllGenres } from "./api.js";
import { movieCard, clear, applyVisibility } from "./ui.js";

// ------------------------------------------------------------
// FONCTION : loadMoreFilms - Charger plus de films
// ------------------------------------------------------------
// Rôle : Charge des films supplémentaires quand on clique "Voir plus"
// Paramètres :
//   - gridEl : la grille HTML où ajouter les films
//   - count : combien de films charger (par défaut 6)
// Retourne : le nombre de films ajoutés
export async function loadMoreFilms(gridEl, count = 6) {
  // Récupère la page actuelle depuis l'attribut data-current-page
  // parseInt() convertit le texte en nombre
  // || 1 = valeur par défaut si pas défini
  const currentPage = parseInt(gridEl.dataset.currentPage) || 1;
  
  // Récupère le genre depuis l'attribut data-genre (ex: "Action")
  const genre = gridEl.dataset.genre;
  
  // Vérifie si c'est la grille "Top" (pas de genre, juste les meilleurs)
  const isTop = gridEl.dataset.isTop === 'true';
  
  // Tableau pour stocker les films chargés
  const loaded = [];
  
  // Page courante (on va l'incrémenter si besoin)
  let page = currentPage;
  
  try {
    // Boucle : charger des pages jusqu'à avoir assez de films
    while (loaded.length < count) {
      // Appelle l'API selon le type de grille
      // L'opérateur ternaire (? :) est un if/else raccourci
      const data = isTop 
        ? await fetchTop(page)        // Si c'est le Top : films par note
        : await fetchByGenre(genre, page);  // Sinon : films par genre
      
      // Si on a des résultats...
      if (data.results && data.results.length > 0) {
        // Ajoute tous les films au tableau loaded
        // ...data.results = "spread operator", déverse le contenu du tableau
        loaded.push(...data.results);
        
        // Si pas de page suivante, on arrête
        if (!data.next) {
          gridEl.dataset.hasMore = 'false';  // Plus de films disponibles
          break;
        }
        page++;  // Passe à la page suivante
      } else {
        // Pas de résultats = fin
        gridEl.dataset.hasMore = 'false';
        break;
      }
    }
    
    // Prend seulement les 'count' premiers films
    // slice(0, count) = extrait de l'index 0 jusqu'à count (non inclus)
    const toAdd = loaded.slice(0, count);
    
    // Ajoute chaque film à la grille
    // forEach() exécute une fonction pour chaque élément
    toAdd.forEach(movie => {
      // appendChild() ajoute un élément enfant
      // movieCard() crée la carte HTML du film
      gridEl.appendChild(movieCard(movie));
    });
    
    // Sauvegarde la page courante pour le prochain chargement
    gridEl.dataset.currentPage = String(page);
    
    // Retourne le nombre de films ajoutés
    return toAdd.length;
    
  } catch (error) {
    // En cas d'erreur, on l'affiche dans la console
    console.error("Erreur lors du chargement de films supplémentaires:", error);
    gridEl.dataset.hasMore = 'false';
    return 0;  // Aucun film ajouté
  }
}

// ------------------------------------------------------------
// FONCTION : renderBest - Afficher le meilleur film
// ------------------------------------------------------------
// Rôle : Affiche le film #1 (meilleure note IMDb) en grand en haut
// Cette section a un design différent des autres (plus grand, avec résumé)
export async function renderBest() {
  // Récupère l'élément HTML qui contiendra le meilleur film
  // document.getElementById() trouve un élément par son attribut id=""
  const banner = document.getElementById("best-movie-content");
  
  // Vide le contenu actuel (pour supprimer le spinner de chargement)
  clear(banner);
  
  try {
    // Récupère la première page des meilleurs films
    const firstPage = await fetchTop(1);
    
    // Prend le premier film (index 0)
    // ?.[0] = "optional chaining" : évite une erreur si results n'existe pas
    const best = firstPage.results?.[0];
    
    // Si pas de film trouvé, affiche un message
    if (!best) {
      banner.innerHTML = '<p class="text-muted">Aucun film disponible</p>';
      return;  // Sort de la fonction
    }

    // Image par défaut si l'image du film n'existe pas
    const placeholder = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIj48cmVjdCBmaWxsPSIjZGRkIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIvPjx0ZXh0IGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB4PSI1MCUiIHk9IjUwJSIgZHk9Ii4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==";
    
    // Crée le HTML de la section (image à gauche, infos à droite)
    // Les backticks (``) permettent d'écrire sur plusieurs lignes
    // ${variable} insère une variable dans la chaîne
    // ?? est le "nullish coalescing" : utilise la valeur après si null/undefined
    banner.innerHTML = `
      <div class="col-12 col-md-5">
        <img src="${best.image_url || placeholder}" class="best-movie-img" alt="" role="presentation" aria-hidden="true"
             title="${best.title ?? ""}" onerror="this.onerror=null; this.src='${placeholder}'" />
      </div>
      <div class="col-12 col-md-7">
        <h3 class="best-movie-title">${best.title ?? ""}</h3>
        <p id="best-summary" class="mb-3 text-muted">Chargement du résumé...</p>
        <button class="btn btn-primary" data-open-details data-movie-id="${best.id}">Voir les détails</button>
      </div>
    `;

    // Récupère les détails complets du film (pour avoir le résumé)
    // fetchDetails() fait un 2ème appel API pour obtenir TOUTES les infos
    const details = await fetchDetails(best.id);
    
    // Met à jour le résumé
    const sum = document.getElementById("best-summary");
    if (sum) {
      // textContent = définit le texte d'un élément
      // || = "ou" : si la première valeur est vide, utilise la suivante
      sum.textContent = details.long_description || details.description || "Aucun résumé disponible.";
    }
    
  } catch (error) {
    // En cas d'erreur (ex: serveur éteint), affiche un message d'erreur
    console.error("Erreur lors du chargement du meilleur film:", error);
    banner.innerHTML = '<p class="text-danger">Erreur lors du chargement</p>';
  }
}

// ------------------------------------------------------------
// FONCTION : fillGrid - Remplir une grille (fonction interne)
// ------------------------------------------------------------
// Rôle : Fonction générique pour remplir n'importe quelle grille
// Paramètres :
//   - gridEl : l'élément grille HTML
//   - fetchPageFn : fonction qui récupère une page de films
//   - initialCount : nombre de films à charger (défaut 12)
//
// Cette fonction est "privée" (pas de export) = utilisée seulement dans ce fichier
async function fillGrid(gridEl, fetchPageFn, initialCount = 12) {
  // Vide la grille avant de la remplir
  clear(gridEl);
  
  // Tableau pour stocker les films
  const items = [];
  
  // Indique s'il y a encore des pages à charger
  let hasMorePages = false;
  
  try {
    let page = 1;
    
    // Boucle : charge des pages jusqu'à avoir assez de films
    while (items.length < initialCount) {
      try {
        // Appelle la fonction de fetch passée en paramètre
        const data = await fetchPageFn(page);
        
        if (data.results && data.results.length > 0) {
          // Ajoute les films au tableau
          items.push(...data.results);
          
          // !! convertit en booléen (true si data.next existe)
          hasMorePages = !!data.next;
          
          // Si pas de page suivante, on arrête
          if (!data.next) break;
          page++;
        } else {
          break;
        }
      } catch (pageError) {
        // Si une page échoue, on continue avec ce qu'on a
        console.warn(`Page ${page} non disponible:`, pageError);
        break;
      }
    }
    
    // Crée une carte pour chaque film et l'ajoute à la grille
    // slice(0, initialCount) prend seulement les X premiers
    items.slice(0, initialCount).forEach(movie => {
      gridEl.appendChild(movieCard(movie));
    });
    
    // Stocke les infos de pagination pour "Voir plus"
    gridEl.dataset.currentPage = String(page);
    gridEl.dataset.hasMore = String(hasMorePages);
    
    // Si aucun film, affiche un message
    if (items.length === 0) {
      gridEl.innerHTML = '<div class="col-12"><p class="text-muted">Aucun film disponible pour ce genre</p></div>';
    }
    
  } catch (error) {
    console.error("Erreur lors du remplissage de la grille:", error);
    gridEl.innerHTML = '<div class="col-12"><p class="text-danger">Erreur lors du chargement</p></div>';
  }
}

// ------------------------------------------------------------
// FONCTION : renderTop - Afficher les films les mieux notés
// ------------------------------------------------------------
// Rôle : Remplit la section "Films les mieux notés"
// Particularité : Skip le premier film (déjà affiché dans "Meilleur film")
export async function renderTop() {
  // Récupère la grille HTML
  const grid = document.getElementById("top-rated-grid");
  
  const items = [];
  let hasMorePages = false;
  
  try {
    let page = 1;
    
    // Charge 13 films (pour en afficher 12 après avoir skipé le premier)
    while (items.length < 13) {
      const data = await fetchTop(page);
      
      if (data.results && data.results.length > 0) {
        items.push(...data.results);
        hasMorePages = !!data.next;
        if (!data.next) break;
        page++;
      } else {
        break;
      }
    }
    
    // Vide la grille
    clear(grid);
    
    // IMPORTANT : slice(1, 13) = du 2ème au 13ème film
    // On "skip" le premier car il est déjà affiché en haut
    items.slice(1, 13).forEach(movie => {
      grid.appendChild(movieCard(movie));
    });
    
    // Sauvegarde les infos de pagination
    grid.dataset.currentPage = String(page);
    grid.dataset.isTop = 'true';  // Marque cette grille comme "Top"
    grid.dataset.hasMore = String(hasMorePages);
    
  } catch (error) {
    console.error("Erreur lors du chargement du top:", error);
    grid.innerHTML = '<div class="col-12"><p class="text-danger">Erreur lors du chargement</p></div>';
  }
  
  // Retourne le handler pour "Voir plus/moins"
  return applyVisibility(grid, fetchTop);
}

// ------------------------------------------------------------
// FONCTION : renderCategory - Afficher une catégorie de genre
// ------------------------------------------------------------
// Rôle : Remplit une grille avec les films d'un genre donné
// Paramètres :
//   - sectionId : ID de la section (ex: "category-1", "others")
//   - genre : Nom du genre (ex: "Mystery", "Drama", "Action")
// Retourne : le handler pour "Voir plus/moins"
//
// Cette fonction est utilisée pour Mystery, Drama et la section "Autres"
export async function renderCategory(sectionId, genre) {
  // Construit l'ID de la grille : sectionId + "-grid"
  // Ex: "category-1" + "-grid" = "category-1-grid"
  const grid = document.getElementById(`${sectionId}-grid`);
  
  // Stocke le genre dans data-genre pour pouvoir charger plus tard
  grid.dataset.genre = genre;
  
  // Remplit la grille avec les films du genre
  // (page) => fetchByGenre(genre, page) est une "arrow function"
  // Elle sera appelée par fillGrid pour chaque page
  await fillGrid(grid, (page) => fetchByGenre(genre, page));
  
  // Vérifie s'il y a des films (et pas de message d'erreur)
  // querySelector() cherche un élément correspondant au sélecteur CSS
  if (grid.children.length > 0 && !grid.querySelector('.text-muted, .text-danger')) {
    // Retourne le handler pour gérer "Voir plus/moins"
    return applyVisibility(grid, (page) => fetchByGenre(genre, page));
  } else {
    // Retourne une fonction vide si pas de films
    // Évite les erreurs quand on appelle handler.more() ou handler.less()
    return () => {};
  }
}

// ------------------------------------------------------------
// FONCTION : initOthers - Initialiser le dropdown des genres
// ------------------------------------------------------------
// Rôle : Remplit la liste déroulante avec tous les genres disponibles
// Appelée au démarrage pour que l'utilisateur puisse choisir un genre
export async function initOthers() {
  // Récupère l'élément <select> (liste déroulante)
  const select = document.getElementById("genre-select");
  
  try {
    // Tente de récupérer tous les genres depuis l'API
    const unique = await fetchAllGenres();
    
    // Si on a des genres...
    if (unique && unique.length) {
      // Crée les <option> et les insère dans le <select>
      // .map() transforme chaque genre en HTML
      // .join("") assemble tout en une seule chaîne
      select.innerHTML = unique.map(g => `<option value="${g}">${g}</option>`).join("");
      return;  // Terminé !
    }
  } catch (err) {
    // Si l'API échoue, on affiche un warning (pas bloquant)
    console.warn("Impossible de charger tous les genres depuis l'API, fallback local utilisé.", err);
  }
  
  // FALLBACK (plan B) : Si l'API ne marche pas, utilise la liste locale
  // GENRES est défini dans api.js
  select.innerHTML = GENRES.map(g => `<option value="${g}">${g}</option>`).join("");
}

