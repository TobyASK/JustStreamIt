// Point d'entrée de l'application JustStreamIt
// Gère le chargement initial, les événements et la coordination des sections

import { renderBest, renderTop, renderCategory, initOthers } from "./sections.js";
import { fetchDetails, fetchSearch, getPageSize } from "./api.js";
import { movieCard, clear, applyVisibility } from "./ui.js";

/**
 * Handlers globaux pour les boutons "Voir plus/moins"
 * Chaque section a son propre handler retourné par applyVisibility()
 * Ces variables stockent les references pour pouvoir les utiliser au click
 */
let showMoreTop, showMoreCat1, showMoreCat2, showMoreOthers;

/**
 * Stocke le page_size précédent pour détecter les changements de breakpoint
 */
let previousPageSize = getPageSize();

/**
 * Ouvre la modale avec les détails complets d'un film
 * Récupère les données depuis l'API et affiche toutes les infos
 * 
 * @param {number|string} id - ID du film
 */
async function openDetails(id) {
  try {
    const data = await fetchDetails(id);
    
    // Remplir le titre de la modale avec le titre du film
    document.getElementById("detailsModalLabel").textContent = data.title || "Détails du film";
    
    // Construire le contenu complet de la modale avec tous les champs disponibles
    const modalContent = document.getElementById("modal-content");
    modalContent.innerHTML = `
      <div class="row g-3">
        <div class="col-md-4">
          <img src="${data.image_url || ""}" alt="${data.title || ""}" class="img-fluid rounded" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'" />
        </div>
        <div class="col-md-8">
          <div class="mb-2">
            <span class="info-label">Genres :</span>
            <span class="info-value">${Array.isArray(data.genres) ? data.genres.join(", ") : (data.genres || "N/A")}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Date de sortie :</span>
            <span class="info-value">${data.date_published || "N/A"}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Classification :</span>
            <span class="info-value">${data.rated || "N/A"}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Score IMDB :</span>
            <span class="info-value">${data.imdb_score !== null && data.imdb_score !== undefined ? data.imdb_score + "/10" : "N/A"}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Réalisateur(s) :</span>
            <span class="info-value">${Array.isArray(data.directors) ? data.directors.join(", ") : (data.directors || "N/A")}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Acteurs :</span>
            <span class="info-value">${Array.isArray(data.actors) ? data.actors.join(", ") : (data.actors || "N/A")}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Durée :</span>
            <span class="info-value">${data.duration ? data.duration + " min" : "N/A"}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Pays :</span>
            <span class="info-value">${Array.isArray(data.countries) ? data.countries.join(", ") : (data.countries || "N/A")}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Box-office :</span>
            <span class="info-value">${data.worldwide_gross_income || data.usa_gross_income || "N/A"}</span>
          </div>
        </div>
        <div class="col-12">
          <div class="mb-2">
            <span class="info-label">Résumé :</span>
          </div>
          <p class="info-value">${data.long_description || data.description || "Aucun résumé disponible."}</p>
        </div>
      </div>
    `;
    
    // Ouvrir la modale avec Bootstrap 5
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
  } catch (error) {
    console.error("Erreur lors du chargement des détails:", error);
    alert("Erreur lors du chargement des détails du film");
  }
}

/**
 * Gère la recherche de films
 * 
 * Affiche les résultats dans une section dédiée
 * Cache les autres sections (Meilleur, Top, Catégories, Autres)
 * 
 * @param {string} query - Terme de recherche
 */
async function handleSearch(query) {
  if (!query.trim()) {
    // Si recherche vide, revenir à l'affichage normal
    showAllSections();
    return;
  }

  try {
    // Récupérer les résultats
    const results = await fetchSearch(query, 1);
    const searchGrid = document.getElementById("search-results-grid");
    const searchSection = document.getElementById("search-results");

    // Vider la grille et afficher les résultats
    clear(searchGrid);
    
    if (!results.results || results.results.length === 0) {
      searchGrid.innerHTML = '<div class="col-12"><p class="text-muted">Aucun film trouvé pour "<strong>' + query + '</strong>"</p></div>';
    } else {
      // Ajouter les cartes films
      results.results.forEach(movie => {
        searchGrid.appendChild(movieCard(movie));
      });
    }

    // Afficher la section résultats, cacher les autres
    hideAllSections();
    searchSection.style.display = '';
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    document.getElementById("search-results-grid").innerHTML = '<div class="col-12"><p class="text-danger">Erreur lors de la recherche</p></div>';
  }
}

/**
 * Affiche toutes les sections (Meilleur, Top, Catégories, Autres)
 */
function showAllSections() {
  document.getElementById("best-movie").style.display = '';
  document.getElementById("top-rated").style.display = '';
  document.getElementById("category-1").style.display = '';
  document.getElementById("category-2").style.display = '';
  document.getElementById("others").style.display = '';
  document.getElementById("search-results").style.display = 'none';
}

/**
 * Cache toutes les sections (sauf recherche)
 */
function hideAllSections() {
  document.getElementById("best-movie").style.display = 'none';
  document.getElementById("top-rated").style.display = 'none';
  document.getElementById("category-1").style.display = 'none';
  document.getElementById("category-2").style.display = 'none';
  document.getElementById("others").style.display = 'none';
}

/**
 * Connecte les événements de la barre de recherche
 */
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const clearBtn = document.getElementById("clear-search-btn");

  // Clic sur le bouton Rechercher
  searchBtn.onclick = () => {
    const query = searchInput.value.trim();
    if (query) {
      handleSearch(query);
      clearBtn.style.display = '';  // Afficher le bouton Revenir
    }
  };

  // Appuyer sur Entrée dans l'input
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        handleSearch(query);
        clearBtn.style.display = '';  // Afficher le bouton Revenir
      }
    }
  });

  // Clic sur le bouton Revenir à l'accueil
  clearBtn.onclick = () => {
    searchInput.value = '';
    showAllSections();
    clearBtn.style.display = 'none';  // Cacher le bouton Revenir
  };
}

/**
 * Écoute au niveau du document pour ouvrir la modale au clic sur une carte ou un bouton détails
 * Utilise l'attribut data-open-details et data-movie-id pour identifier les films
 */
function delegateDetailsClicks(root = document) {
  root.addEventListener("click", (e) => {
    // Chercher l'élément le plus proche portant data-open-details
    const btn = e.target.closest("[data-open-details]");
    if (btn) {
      const id = btn.getAttribute("data-movie-id");
      if (id) {
        openDetails(id);
      }
    }
  });
}

/**
 * Connecte les boutons "Voir plus" et "Voir moins" à leurs handlers
 * Gère la visibilité des boutons en fonction de l'état (visible, total, defaultVisible)
 * 
 * Logique:
 * - "Voir plus" visible si: total > defaultVisible ET (films cachés OU pages à charger)
 * - "Voir moins" visible si: visible > defaultVisible
 */
function wireMoreButtons() {
  // Fonction helper pour connecter une paire de boutons à une grille
  const bindPair = (moreId, lessId, gridId, handlerGetter) => {
    const btnMore = document.getElementById(moreId);
    const btnLess = document.getElementById(lessId);
    const grid = document.getElementById(gridId);
    
    if (!btnMore || !btnLess || !grid) return;
    
    /**
     * Met à jour l'affichage des boutons en fonction de l'état
     * Appelée après chaque action (more, less) ou changement
     */
    const updateButtons = () => {
      const handler = handlerGetter();
      if (!handler) return;
      
      const state = handler.getState();
      // Afficher/cacher les boutons selon les conditions
      btnMore.style.display = state.canShowMore ? "inline-block" : "none";
      btnLess.style.display = state.canShowLess ? "inline-block" : "none";
    };
    
    // Event listener pour "Voir plus"
    btnMore.onclick = async () => {
      const handler = handlerGetter();
      if (handler) {
        await handler.more();  // Attend le chargement potentiel depuis l'API
        updateButtons();
      }
    };
    
    // Event listener pour "Voir moins"
    btnLess.onclick = () => {
      const handler = handlerGetter();
      if (handler) {
        handler.less();
        updateButtons();
      }
    };
    
    // Initialiser l'état des boutons au démarrage
    updateButtons();
  };

  // Connecter les 4 paires de boutons aux 4 grilles
  bindPair("btn-show-more-top", "btn-show-less-top", "top-rated-grid", () => showMoreTop);
  bindPair("btn-show-more-cat1", "btn-show-less-cat1", "category-1-grid", () => showMoreCat1);
  bindPair("btn-show-more-cat2", "btn-show-less-cat2", "category-2-grid", () => showMoreCat2);
  bindPair("btn-show-more-others", "btn-show-less-others", "others-grid", () => showMoreOthers);
}

/**
 * Gère le redimensionnement de la fenêtre (responsive)
 * Quand la taille change, les breakpoints (2/4/6) peuvent changer
 * Recalcule le nombre par défaut visible et met à jour l'affichage
 * Si le page_size change, recharge les données depuis l'API avec le nouveau page_size
 */
function handleResize() {
  window.addEventListener("resize", () => {
    const currentPageSize = getPageSize();
    
    // Si le breakpoint a changé (mobile <-> tablette <-> desktop)
    // on recharge les données avec le nouveau page_size
    if (currentPageSize !== previousPageSize) {
      console.log(`Breakpoint changé: ${previousPageSize} → ${currentPageSize}`);
      previousPageSize = currentPageSize;
      
      // Recharger les 4 sections si les handlers existent
      if (showMoreTop) showMoreTop.resetAndReload();
      if (showMoreCat1) showMoreCat1.resetAndReload();
      if (showMoreCat2) showMoreCat2.resetAndReload();
      if (showMoreOthers) showMoreOthers.resetAndReload();
    } else {
      // Juste recalculer les breakpoints sans recharger (redimensionnement mineur)
      const grids = [
        { id: "top-rated-grid", handler: () => showMoreTop },
        { id: "category-1-grid", handler: () => showMoreCat1 },
        { id: "category-2-grid", handler: () => showMoreCat2 },
        { id: "others-grid", handler: () => showMoreOthers }
      ];
      
      grids.forEach(({ id, handler }) => {
        const grid = document.getElementById(id);
        const h = handler();
        if (!grid || !h) return;
        h.updateForResize();
      });
    }
  });
}

/**
 * Fonction d'initialisation principale de l'application
 * Exécutée au chargement du module (ES6)
 * 
 * Orchestration complète:
 * 1. Délégation des clics pour ouvrir les modales
 * 2. Chargement de la liste des genres
 * 3. Remplissage parallèle de toutes les sections
 * 4. Connexion des boutons "Voir plus/moins"
 * 5. Gestion du changement de genre dans "Autres"
 * 6. Activation de la gestion du resize (responsive)
 */
async function main() {
  try {
    // 1. Mettre en place la délégation d'événements pour les clics "Détails"
    // Écoute au niveau du document et ouvre la modale correspondante
    delegateDetailsClicks();
    
    // 2. Mettre en place la barre de recherche
    setupSearch();
    
    // 3. Charger la liste complète des genres depuis l'API (ou fallback local)
    // Remplit le select#genre-select
    await initOthers();
    
    // Genres fixes pour les catégories 1 et 2
    const genre1 = "Mystery";
    const genre2 = "Drama";
    
    // Récupérer le genre initial pour "Autres" (le premier de la liste)
    const select = document.getElementById("genre-select");
    const initialOthers = select.options[0]?.value || "Action";
    
    // 4. Charger le contenu de toutes les sections
    // renderBest() : meilleur film (solo)
    // renderTop() : films 2-13 des mieux notés
    // renderCategory() : films par genre (Mystery, Drama, etc.)
    // Chaque render retourne un handler pour gérer voir plus/moins
    await renderBest();
    showMoreTop = await renderTop();
    showMoreCat1 = await renderCategory("category-1", genre1);
    showMoreCat2 = await renderCategory("category-2", genre2);
    showMoreOthers = await renderCategory("others", initialOthers);
    
    // 5. Connecter les boutons "Voir plus" et "Voir moins" aux handlers
    // Gère la logique d'affichage/masquage des boutons et des films
    wireMoreButtons();
    
    // 6. Gérer le changement de genre dans la section "Autres"
    // Quand l'utilisateur sélectionne un nouveau genre, recharger les films
    select.addEventListener("change", async () => {
      const selectedGenre = select.value;
      if (selectedGenre) {
        // Afficher un spinner pendant le chargement
        const othersGrid = document.getElementById("others-grid");
        othersGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Chargement...</span></div></div>';
        
        // Recharger la grille avec le nouveau genre et récupérer le nouveau handler
        showMoreOthers = await renderCategory("others", selectedGenre);
        
        // Réinitialiser les boutons avec le nouvel état
        const btnMore = document.getElementById("btn-show-more-others");
        const btnLess = document.getElementById("btn-show-less-others");
        if (btnMore && btnLess && showMoreOthers && showMoreOthers.getState) {
          const state = showMoreOthers.getState();
          btnMore.style.display = state.canShowMore ? "inline-block" : "none";
          btnLess.style.display = state.canShowLess ? "inline-block" : "none";
        }
      }
    });
    
    // 6. Gérer les changements de taille de fenêtre (responsive)
    // Recalcule les breakpoints 2/4/6 et met à jour l'affichage
    handleResize();
    
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
}

// Lancer l'application au chargement du module
main();

