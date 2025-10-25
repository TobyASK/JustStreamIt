// Fonctions pour remplir les différentes sections de la page

import { fetchTop, fetchByGenre, fetchDetails, GENRES, fetchAllGenres } from "./api.js";
import { movieCard, clear, applyVisibility } from "./ui.js";

// Affiche le meilleur film en haut de page
export async function renderBest() {
  const banner = document.getElementById("best-movie-content");
  clear(banner);
  
  try {
    const firstPage = await fetchTop(1);
    const best = firstPage.results?.[0];
    
    if (!best) {
      banner.innerHTML = '<p class="text-muted">Aucun film disponible</p>';
      return;
    }

    // Afficher la structure initiale (image + titre + bouton)
    const placeholder = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIj48cmVjdCBmaWxsPSIjZGRkIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIvPjx0ZXh0IGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiB4PSI1MCUiIHk9IjUwJSIgZHk9Ii4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==";
    
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

    // Récupérer le résumé complet via l'endpoint détail
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
 * Récupère suffisamment de pages pour avoir au moins 12 films à afficher
 * 
 * @param {HTMLElement} gridEl - Grille à remplir (div.row)
 * @param {Function} fetchPageFn - Fonction de fetch prenant (page) en paramètre
 * @param {number} pagesNeeded - Nombre max de pages à récupérer (par défaut 3)
 */
async function fillGrid(gridEl, fetchPageFn, pagesNeeded = 3) {
  clear(gridEl);
  const items = [];
  
  try {
    // Récupérer plusieurs pages jusqu'à avoir au moins 12 films
    for (let page = 1; page <= pagesNeeded; page++) {
      try {
        const data = await fetchPageFn(page);
        if (data.results) {
          items.push(...data.results);
        }
        // Arrêter si on a assez de films OU si la page ne contient aucun résultat
        if (items.length >= 12 || !data.results || data.results.length === 0) break;
        // Arrêter aussi si on a récupéré tous les films disponibles (pas de page suivante)
        if (!data.next) break;
      } catch (pageError) {
        // Si une page spécifique échoue (ex: "Invalid page"), arrêter la pagination
        // mais garder les films déjà récupérés
        console.warn(`Page ${page} non disponible, arrêt de la pagination:`, pageError);
        break;
      }
    }
    
    // Prendre les 12 premiers films et créer leurs cartes
    // Si moins de 12 films disponibles, afficher ce qu'on a
    items.slice(0, 12).forEach(movie => {
      gridEl.appendChild(movieCard(movie));
    });
    
    // Si aucun film trouvé, afficher un message
    if (items.length === 0) {
      gridEl.innerHTML = '<div class="col-12"><p class="text-muted">Aucun film disponible pour ce genre</p></div>';
    }
  } catch (error) {
    console.error("Erreur lors du remplissage de la grille:", error);
    gridEl.innerHTML = '<div class="col-12"><p class="text-danger">Erreur lors du chargement</p></div>';
  }
}

/**
 * Remplit la grille "Films les mieux notés" (top global hors le meilleur)
 * Exclut le premier film car il est déjà affiché dans "Meilleur film"
 * 
 * @returns {Function} - Handler showMore pour "Voir plus/moins"
 */
export async function renderTop() {
  const grid = document.getElementById("top-rated-grid");
  
  // Récupérer les films en excluant le premier (déjà affiché dans "Meilleur film")
  const items = [];
  try {
    for (let page = 1; page <= 3; page++) {
      const data = await fetchTop(page);
      if (data.results) {
        items.push(...data.results);
      }
      // +1 car on va skip le premier film
      if (items.length >= 13) break;
    }
    
    clear(grid);
    // Skip le premier film (c'est le meilleur, déjà affiché)
    items.slice(1, 13).forEach(movie => {
      grid.appendChild(movieCard(movie));
    });
  } catch (error) {
    console.error("Erreur lors du chargement du top:", error);
    grid.innerHTML = '<div class="col-12"><p class="text-danger">Erreur lors du chargement</p></div>';
  }
  
  // Appliquer la visibilité responsive et retourner le handler toggle
  return applyVisibility(grid);
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
  // Remplir la grille avec les meilleurs films du genre
  await fillGrid(grid, (page) => fetchByGenre(genre, page));
  
  // Si la grille a des films, appliquer la visibilité et retourner le handler
  // Sinon retourner une fonction vide pour éviter les erreurs
  if (grid.children.length > 0 && !grid.querySelector('.text-muted, .text-danger')) {
    return applyVisibility(grid);
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

