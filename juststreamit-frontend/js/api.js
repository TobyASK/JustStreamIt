// ============================================================
// api.js - FICHIER QUI COMMUNIQUE AVEC LE SERVEUR (API)
// ============================================================
// Ce fichier contient toutes les fonctions qui vont chercher
// les données des films sur le serveur local (localhost:8000)
// ============================================================

// L'adresse du serveur API (ton serveur Django local)
// "export" permet d'utiliser cette variable dans d'autres fichiers
export const API_BASE = "http://127.0.0.1:8000/api/v1";

// ------------------------------------------------------------
// FONCTION UTILITAIRE : getJSON
// ------------------------------------------------------------
// Rôle : Faire une requête HTTP et récupérer les données JSON
// C'est une fonction "privée" (pas de export) utilisée en interne
//
// "async" = cette fonction est asynchrone (elle attend une réponse du serveur)
// "await" = on attend que fetch() ait fini avant de continuer
async function getJSON(url) {
  // fetch() envoie une requête HTTP à l'URL donnée
  // "await" attend la réponse du serveur
  const r = await fetch(url);
  
  // Si la réponse n'est pas OK (erreur 404, 500, etc.), on lance une erreur
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  
  // .json() transforme la réponse texte en objet JavaScript
  // On retourne cet objet pour l'utiliser ensuite
  return r.json();
}

// ------------------------------------------------------------
// FONCTION : fetchTop - Récupérer les meilleurs films
// ------------------------------------------------------------
// Rôle : Récupère les films triés par note IMDb (du meilleur au moins bon)
// Paramètre : page = numéro de page (par défaut 1)
// Le "-" devant imdb_score signifie "ordre décroissant" (9.5, 9.4, 9.3...)
//
// `${variable}` = syntaxe pour insérer une variable dans une chaîne
export async function fetchTop(page = 1) {
  return getJSON(`${API_BASE}/titles/?sort_by=-imdb_score&page=${page}`);
}

// ------------------------------------------------------------
// FONCTION : fetchByGenre - Récupérer les films d'un genre
// ------------------------------------------------------------
// Rôle : Récupère les films d'un genre spécifique (Action, Drama, etc.)
// Paramètres : 
//   - genre = le nom du genre ("Action", "Drama", etc.)
//   - page = numéro de page (par défaut 1)
//
// encodeURIComponent() = transforme les caractères spéciaux pour l'URL
// (ex: "Sci-Fi" devient "Sci-Fi" encodé pour être valide dans une URL)
export async function fetchByGenre(genre, page = 1) {
  return getJSON(`${API_BASE}/titles/?genre=${encodeURIComponent(genre)}&sort_by=-imdb_score&page=${page}`);
}

// ------------------------------------------------------------
// FONCTION : fetchDetails - Récupérer les détails d'un film
// ------------------------------------------------------------
// Rôle : Récupère TOUTES les informations d'un film (résumé, acteurs, etc.)
// Paramètre : id = l'identifiant unique du film (ex: 123)
//
// Cette fonction est appelée quand on clique sur "Détails"
export async function fetchDetails(id) {
  return getJSON(`${API_BASE}/titles/${id}`);
}

// ------------------------------------------------------------
// FONCTION : fetchGenres - Récupérer une page de genres
// ------------------------------------------------------------
// Rôle : Récupère la liste des genres disponibles (une page)
// Utilisée par fetchAllGenres() ci-dessous
export async function fetchGenres(page = 1) {
  return getJSON(`${API_BASE}/genres/?page=${page}`);
}

// ------------------------------------------------------------
// FONCTION : fetchAllGenres - Récupérer TOUS les genres
// ------------------------------------------------------------
// Rôle : Récupère tous les genres en parcourant toutes les pages
// Retourne : un tableau trié alphabétiquement ["Action", "Comedy", "Drama", ...]
//
// Cette fonction est plus complexe car l'API renvoie les genres
// par pages (pagination), donc on doit faire plusieurs requêtes
export async function fetchAllGenres() {
  // Set = collection qui n'accepte pas les doublons
  // On l'utilise pour éviter d'avoir 2 fois le même genre
  const seen = new Set();
  
  // Tableau qui contiendra tous les genres trouvés
  const out = [];
  
  // Numéro de la page actuelle
  let page = 1;
  
  // Compteur de sécurité pour éviter une boucle infinie
  let safety = 0;
  
  // Boucle : tant qu'on n'a pas parcouru toutes les pages
  // (et maximum 100 itérations par sécurité)
  while (safety < 100) {
    // Récupère une page de genres
    const data = await fetchGenres(page);
    
    // Si data.results est un tableau, on l'utilise, sinon tableau vide
    const results = Array.isArray(data.results) ? data.results : [];
    
    // Pour chaque genre dans les résultats...
    for (const g of results) {
      // Récupère le nom du genre (ou chaîne vide si pas de nom)
      const name = (g && g.name ? String(g.name).trim() : "");
      
      // Si le nom existe ET qu'on ne l'a pas déjà vu...
      // .toLowerCase() pour ignorer la casse (Action = action)
      if (name && !seen.has(name.toLowerCase())) {
        // On l'ajoute aux genres vus
        seen.add(name.toLowerCase());
        // On l'ajoute au tableau de sortie
        out.push(name);
      }
    }
    
    // Si pas de page suivante (data.next est null), on arrête
    if (!data.next) break;
    
    // Sinon, on passe à la page suivante
    try {
      // Extraire le numéro de page depuis l'URL "next"
      const url = new URL(data.next, API_BASE);
      const nextPage = url.searchParams.get("page");
      page = nextPage ? parseInt(nextPage, 10) : page + 1;
    } catch (_) {
      // En cas d'erreur, on incrémente simplement
      page += 1;
    }
    
    // Incrémente le compteur de sécurité
    safety++;
  }
  
  // Trie les genres par ordre alphabétique et retourne le tableau
  // localeCompare() permet un tri correct avec les accents
  return out.sort((a, b) => a.localeCompare(b));
}

// ------------------------------------------------------------
// CONSTANTE : GENRES - Liste de secours (fallback)
// ------------------------------------------------------------
// Si l'API ne répond pas, on utilise cette liste par défaut
// C'est un "fallback" (plan B)
export const GENRES = [
  "Action","Adventure","Animation","Biography","Comedy","Crime","Drama","Family",
  "Fantasy","History","Horror","Mystery","Romance","Sci-Fi","Sport","Thriller","War","Western"
];
