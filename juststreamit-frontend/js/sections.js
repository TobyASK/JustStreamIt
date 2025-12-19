/**
 * Module Sections - Remplissage des différentes sections de la page
 * 
 * Responsabilités:
 * - Charger les données depuis l'API
 * - Créer et insérer les cartes films dans le DOM
 * - Gérer la pagination et le chargement progressif
 * - Initialiser la logique voir plus/moins pour chaque section
 */

import { fetchTop, fetchByGenre, fetchDetails, GENRES, fetchAllGenres } from "./api.js";
import { movieCard, clear, applyVisibility } from "./ui.js";

/**
 * Charge progressivement plus de films depuis l'API et les ajoute au DOM
 * 
 * Utilisé quand l'utilisateur clique "Voir plus" et qu'on a besoin de charger
 * des films supplémentaires depuis l'API (toutes les pages locales sont affichées)
 * 
 * @param {HTMLElement} gridEl - Conteneur des films
 * @param {number} count - Nombre de films à charger (défaut: 6)
 * @returns {Promise<number>} - Nombre de films effectivement ajoutés
 * 
 * Mécanisme:
 * 1. Récupère la page courante depuis gridEl.dataset.currentPage
 * 2. Récupère le type (top ou genre) depuis gridEl.dataset
 * 3. Boucle pour charger jusqu'à 'count' films
 * 4. Ajoute les films créés au DOM
 * 5. Met à jour dataset.hasMore si plus de pages disponibles
 */
export async function loadMoreFilms(gridEl, count = 6) {
  const currentPage = parseInt(gridEl.dataset.currentPage) || 1;
  const genre = gridEl.dataset.genre;
  const isTop = gridEl.dataset.isTop === 'true';
  
  const loaded = [];
  let page = currentPage;
  
  try {
    // Charger jusqu'à obtenir 'count' films
    while (loaded.length < count) {
      const data = isTop 
        ? await fetchTop(page)
        : await fetchByGenre(genre, page);
      
      if (data.results && data.results.length > 0) {
        loaded.push(...data.results);
        
        if (!data.next) {
          // Plus de pages disponibles après celle-ci
          gridEl.dataset.hasMore = 'false';
          break;
        }
        page++;
      } else {
        gridEl.dataset.hasMore = 'false';
        break;
      }
    }
    
    // Ajouter les films chargés au DOM (ne prendre que 'count' films)
    const toAdd = loaded.slice(0, count);
    toAdd.forEach(movie => {
      gridEl.appendChild(movieCard(movie));
    });
    
    // Mettre à jour la page courante pour la prochaine requête
    gridEl.dataset.currentPage = String(page);
    
    return toAdd.length;
  } catch (error) {
    console.error("Erreur lors du chargement de films supplémentaires:", error);
    gridEl.dataset.hasMore = 'false';
    return 0;
  }
}

/**
 * Affiche le meilleur film (celui avec le meilleur score IMDB)
 * 
 * Structure spéciale:
 * - Image à gauche (50% sur desktop, 100% sur mobile)
 * - Infos à droite (titre, résumé, bouton)
 * - Charge le résumé complet via fetchDetails()
 * 
 * @returns {Promise<void>}
 */
export async function renderBest() {
  const banner = document.getElementById("best-movie-content");
  clear(banner);
  
  try {
    // Récupérer le premier film (meilleur score IMDB)
    const firstPage = await fetchTop(1);
    const best = firstPage.results?.[0];
    
    if (!best) {
      banner.innerHTML = '<p class="text-muted">Aucun film disponible</p>';
      return;
    }

    // Placeholder SVG gris pour les images manquantes
    const placeholder = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIj48cmVjdCBmaWxsPSIjZGRkIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIvPjx0ZXh0IGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB4PSI1MCUiIHk9IjUwJSIgZHk9Ii4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==";
    
    // Afficher la structure avec résumé temporaire
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

    // Charger le résumé complet via l'endpoint détail
    const details = await fetchDetails(best.id);
    const sum = document.getElementById("best-summary");
    if (sum) {
      sum.textContent = details.long_description || details.description || "Aucun résumé disponible.";
    }
  } catch (error) {
    console.error("Erreur lors du chargement du meilleur film:", error);
    banner.innerHTML = '<p class="text-danger">Erreur lors du chargement</p>';
  }
}

/**
 * Fonction générique pour remplir une grille avec des films
 * 
 * Charge initialCount films et prépare la pagination pour loadMoreFilms()
 * 
 * @param {HTMLElement} gridEl - Conteneur des films
 * @param {Function} fetchPageFn - Fonction de fetch (fetchTop ou fetchByGenre)
 * @param {number} initialCount - Nombre de films à charger initialement (défaut: 12)
 * @returns {Promise<void>}
 */
async function fillGrid(gridEl, fetchPageFn, initialCount = 12) {
  clear(gridEl);
  const items = [];
  let hasMorePages = false;
  
  try {
    let page = 1;
    while (items.length < initialCount) {
      try {
        const data = await fetchPageFn(page);
        if (data.results && data.results.length > 0) {
          items.push(...data.results);
          hasMorePages = !!data.next;
          if (!data.next) break;
          page++;
        } else {
          break;
        }
      } catch (pageError) {
        console.warn(`Page ${page} non disponible:`, pageError);
        break;
      }
    }
    
    items.slice(0, initialCount).forEach(movie => {
      gridEl.appendChild(movieCard(movie));
    });
    
    // Stocker pour charger plus tard
    gridEl.dataset.currentPage = String(page);
    gridEl.dataset.hasMore = String(hasMorePages);
    
    if (items.length === 0) {
      gridEl.innerHTML = '<div class="col-12"><p class="text-muted">Aucun film disponible pour ce genre</p></div>';
    }
  } catch (error) {
    console.error("Erreur lors du remplissage de la grille:", error);
    gridEl.innerHTML = '<div class="col-12"><p class="text-danger">Erreur lors du chargement</p></div>';
  }
}

// Affiche les films les mieux notés (en excluant le meilleur déjà affiché)
export async function renderTop() {
  const grid = document.getElementById("top-rated-grid");
  
  const items = [];
  let hasMorePages = false;
  
  try {
    let page = 1;
    // Charger initialement 13 films (pour en avoir 12 après skip)
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
    
    clear(grid);
    // Skip le premier film (déjà dans "Meilleur film")
    items.slice(1, 13).forEach(movie => {
      grid.appendChild(movieCard(movie));
    });
    
    grid.dataset.currentPage = String(page);
    grid.dataset.isTop = 'true';
    grid.dataset.hasMore = String(hasMorePages);
  } catch (error) {
    console.error("Erreur lors du chargement du top:", error);
    grid.innerHTML = '<div class="col-12"><p class="text-danger">Erreur lors du chargement</p></div>';
  }
  
  return applyVisibility(grid, fetchTop);
}

/**
 * Remplit une grille pour une catégorie (genre) donnée
 * Utilisé pour "Mystery", "Drama" et "Autres"
 * 
 * @param {string} sectionId - ID de la section (ex: "category-1", "others")
 * @param {string} genre - Nom du genre (ex: "Mystery", "Drama", "Action")
 * @returns {Function} - Handler showMore pour "Voir plus/moins"
 */
export async function renderCategory(sectionId, genre) {
  const grid = document.getElementById(`${sectionId}-grid`);
  
  // Stocker le genre dans le dataset pour le chargement progressif
  grid.dataset.genre = genre;
  
  // Remplir la grille avec les meilleurs films du genre
  await fillGrid(grid, (page) => fetchByGenre(genre, page));
  
  // Si la grille a des films, appliquer la visibilité et retourner le handler
  // Sinon retourner une fonction vide pour éviter les erreurs
  if (grid.children.length > 0 && !grid.querySelector('.text-muted, .text-danger')) {
    return applyVisibility(grid, (page) => fetchByGenre(genre, page));
  } else {
    // Retourner une fonction vide si pas de films
    return () => {};
  }
}

/**
 * Initialise la liste déroulante des genres dans la section "Autres"
 * Tente de charger tous les genres depuis l'API (toutes pages)
 * Utilise un fallback local (GENRES) si l'API échoue
 */
export async function initOthers() {
  const select = document.getElementById("genre-select");
  try {
    // Récupérer tous les genres depuis l'API (pagination complète)
    const unique = await fetchAllGenres();
    if (unique && unique.length) {
      select.innerHTML = unique.map(g => `<option value="${g}">${g}</option>`).join("");
      return;
    }
  } catch (err) {
    console.warn("Impossible de charger tous les genres depuis l'API, fallback local utilisé.", err);
  }
  // Fallback: utiliser la liste locale si l'API n'est pas disponible
  select.innerHTML = GENRES.map(g => `<option value="${g}">${g}</option>`).join("");
}

