// URL de base de l'API OCMovies locale
export const API_BASE = "http://127.0.0.1:8000/api/v1";

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

export async function fetchTop(page = 1) {
  return getJSON(`${API_BASE}/titles/?sort_by=-imdb_score&page=${page}`);
}

export async function fetchByGenre(genre, page = 1) {
  return getJSON(`${API_BASE}/titles/?genre=${encodeURIComponent(genre)}&sort_by=-imdb_score&page=${page}`);
}

export async function fetchDetails(id) {
  return getJSON(`${API_BASE}/titles/${id}`);
}

export async function fetchGenres(page = 1) {
  return getJSON(`${API_BASE}/genres/?page=${page}`);
}

export async function fetchAllGenres() {
  const seen = new Set();
  const out = [];
  let page = 1;
  let safety = 0;
  
  while (safety < 100) {
    const data = await fetchGenres(page);
    const results = Array.isArray(data.results) ? data.results : [];
    
    for (const g of results) {
      const name = (g && g.name ? String(g.name).trim() : "");
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        out.push(name);
      }
    }
    
    if (!data.next) break;
    
    try {
      const url = new URL(data.next, API_BASE);
      const nextPage = url.searchParams.get("page");
      page = nextPage ? parseInt(nextPage, 10) : page + 1;
    } catch (_) {
      page += 1;
    }
    safety++;
  }
  
  return out.sort((a, b) => a.localeCompare(b));
}

export const GENRES = [
  "Action","Adventure","Animation","Biography","Comedy","Crime","Drama","Family",
  "Fantasy","History","Horror","Mystery","Romance","Sci-Fi","Sport","Thriller","War","Western"
];
