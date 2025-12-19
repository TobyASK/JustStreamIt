/**
 * Module API - Gestion de toutes les requêtes HTTP vers l'API OCMovies
 * 
 * L'API est hébergée localement sur http://127.0.0.1:8000
 * Tous les appels utilisent le fetch API et retournent des Promises
 */

// URL de base de l'API OCMovies locale
// Toutes les requêtes commencent par cette URL
export const API_BASE = "http://127.0.0.1:8000/api/v1";

/**
 * Fonction helper pour toutes les requêtes GET
 * Encapsule fetch() et gère les erreurs HTTP
 * 
 * @param {string} url - URL complète de la requête
 * @returns {Promise<Object>} - Données JSON parsées
 * @throws {Error} - Si la réponse HTTP n'est pas OK (status >= 400)
 */
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

/**
 * Récupère les films les mieux notés (triés par score IMDB décroissant)
 * 
 * Endpoint: GET /api/v1/titles/?sort_by=-imdb_score&page={page}
 * 
 * @param {number} page - Numéro de page (défaut: 1)
 * @returns {Promise<Object>} - Objet {count, next, previous, results: [films]}
 * 
 * @example
 * const data = await fetchTop(1);
 * console.log(data.results[0]); // Le film avec le meilleur score IMDB
 */
export async function fetchTop(page = 1) {
  return getJSON(`${API_BASE}/titles/?sort_by=-imdb_score&page=${page}`);
}

/**
 * Récupère les films d'un genre spécifique (triés par score IMDB décroissant)
 * 
 * Endpoint: GET /api/v1/titles/?genre={genre}&sort_by=-imdb_score&page={page}
 * 
 * @param {string} genre - Nom du genre (ex: "Mystery", "Drama", "Action")
 * @param {number} page - Numéro de page (défaut: 1)
 * @returns {Promise<Object>} - Objet {count, next, previous, results: [films]}
 * 
 * @example
 * const data = await fetchByGenre("Mystery", 1);
 * console.log(data.results); // Films du genre Mystery
 */
export async function fetchByGenre(genre, page = 1) {
  return getJSON(`${API_BASE}/titles/?genre=${encodeURIComponent(genre)}&sort_by=-imdb_score&page=${page}`);
}

/**
 * Récupère les détails complets d'un film (toutes les informations)
 * 
 * Endpoint: GET /api/v1/titles/{id}
 * 
 * @param {number|string} id - ID du film
 * @returns {Promise<Object>} - Objet film complet avec tous les champs
 *                               (genres, date, acteurs, réalisateurs, résumé, etc.)
 * 
 * @example
 * const film = await fetchDetails(1);
 * console.log(film.long_description); // Description complète du film
 */
export async function fetchDetails(id) {
  return getJSON(`${API_BASE}/titles/${id}`);
}

/**
 * Récupère une page de genres (pagination)
 * 
 * Endpoint: GET /api/v1/genres/?page={page}
 * 
 * @param {number} page - Numéro de page (défaut: 1)
 * @returns {Promise<Object>} - Objet {count, next, previous, results: [genres]}
 * 
 * @example
 * const data = await fetchGenres(1);
 * console.log(data.results); // Genres de la première page
 */
export async function fetchGenres(page = 1) {
  return getJSON(`${API_BASE}/genres/?page=${page}`);
}

/**
 * Récupère TOUS les genres (avec pagination automatique)
 * 
 * L'API paginne les genres, cette fonction boucle sur toutes les pages
 * et retourne une liste unique de tous les genres triés alphabétiquement
 * 
 * Stratégie:
 * 1. Boucler sur toutes les pages de genres
 * 2. Éviter les doublons avec un Set (case-insensitive)
 * 3. Retourner une liste triée alphabétiquement
 * 4. Safety limit: max 100 pages pour éviter les boucles infinies
 * 
 * @returns {Promise<string[]>} - Tableau des noms de genres uniques, triés A-Z
 * 
 * @example
 * const genres = await fetchAllGenres();
 * console.log(genres); // ["Action", "Adventure", "Animation", ...]
 */
export async function fetchAllGenres() {
  const seen = new Set();  // Stocke les genres déjà vus (évite les doublons)
  const out = [];          // Liste finale des genres
  let page = 1;            // Numéro de page courant
  let safety = 0;          // Compteur de sécurité (évite les boucles infinies)
  
  // Boucler sur toutes les pages de genres
  while (safety < 100) {
    const data = await fetchGenres(page);
    const results = Array.isArray(data.results) ? data.results : [];
    
    // Parcourir tous les genres de cette page
    for (const g of results) {
      const name = (g && g.name ? String(g.name).trim() : "");
      // Ajouter seulement si pas déjà vu (case-insensitive)
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        out.push(name);
      }
    }
    
    // S'il n'y a pas de prochaine page, on a fini
    if (!data.next) break;
    
    // Extraire le numéro de page suivant depuis le lien "next"
    try {
      const url = new URL(data.next, API_BASE);
      const nextPage = url.searchParams.get("page");
      page = nextPage ? parseInt(nextPage, 10) : page + 1;
    } catch (_) {
      page += 1;  // Fallback: incrémenter simplement
    }
    safety++;
  }
  
  // Retourner la liste triée alphabétiquement
  return out.sort((a, b) => a.localeCompare(b));
}

/**
 * Recherche des films par titre dans TOUTE la base de données
 * Charge toutes les pages de résultats jusqu'à trouver tous les films correspondants
 * Cherche uniquement dans les titres (insensible à la casse)
 * 
 * Endpoint: GET /api/v1/titles/?title_contains={query}&page={page}
 * 
 * @param {string} query - Terme de recherche (recherche dans les titres)
 * @returns {Promise<Object>} - Objet {count, results: [tous les films trouvés]}
 * 
 * @example
 * const results = await fetchSearch("Matrix");
 * console.log(results.results); // TOUS les films dont le titre contient "Matrix"
 */
export async function fetchSearch(query) {
  const allResults = [];
  let page = 1;
  let hasMore = true;

  // Boucle pour charger toutes les pages de résultats
  while (hasMore) {
    try {
      const data = await getJSON(`${API_BASE}/titles/?title_contains=${encodeURIComponent(query)}&page=${page}`);
      
      // Ajouter les résultats de cette page
      if (data.results && data.results.length > 0) {
        allResults.push(...data.results);
      }
      
      // Vérifier s'il y a une page suivante
      hasMore = !!data.next;
      page++;
    } catch (error) {
      console.error(`Erreur lors du chargement page ${page}:`, error);
      hasMore = false;
    }
  }

  // Retourner tous les résultats accumulés
  return {
    count: allResults.length,
    results: allResults
  };
}

/**
 * Liste locale des genres (fallback)
 * Utilisée comme fallback si fetchAllGenres() échoue
 * Permet au site de fonctionner même si l'API est down
 */
export const GENRES = [
  "Action","Adventure","Animation","Biography","Comedy","Crime","Drama","Family",
  "Fantasy","History","Horror","Mystery","Romance","Sci-Fi","Sport","Thriller","War","Western"
];
